"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import type { Database, UploadType } from "@/types/database.types";
import { sendNotification, notifyAdmins } from "@/lib/notifications/notification-service";
import { isRetiredCategory } from "@/lib/utils";
import { ACTIVE_CATEGORIES } from "@/lib/categories/display-number";
import { validateImageBuffer } from "./image-validator";

type ApplicationUpdate = Database["public"]["Tables"]["applications"]["Update"];

/**
 * Validates remaining award category quota for the current applicant.
 * Client requirement: Maximum of 3 award categories per applicant.
 */
export async function getApplicantCategoryQuota(): Promise<{
  enteredCategoryIds: string[];
  distinctCount: number;
  maxAllowed: number;
  remainingSlots: number;
}> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { enteredCategoryIds: [], distinctCount: 0, maxAllowed: 3, remainingSlots: 3 };
  }

  const adminClient = createAdminClient();
  const { data: userApps } = await adminClient
    .from("applications")
    .select("category_id")
    .eq("applicant_id", user.id)
    .not("status", "in", '("disqualified","rejected")');

  // Strictly filter out retired categories (03, 06, 13) so historical entries do not consume active 2026 quota
  const enteredCategoryIds = Array.from(
    new Set(
      (userApps || [])
        .map((a: any) => a.category_id)
        .filter((id: string) => Boolean(id) && !isRetiredCategory(id))
    )
  ) as string[];

  const distinctCount = enteredCategoryIds.length;
  const remainingSlots = Math.max(0, 3 - distinctCount);

  return {
    enteredCategoryIds,
    distinctCount,
    maxAllowed: 3,
    remainingSlots,
  };
}

/**
 * Creates a real draft application record in the Supabase `applications` table.
 * Adheres strictly to the multi-edition architecture and RLS policies.
 */
export async function createDraftApplication(categoryId: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Authentication required to create a nomination." };
  }

  // 1. Verify category is not retired
  if (isRetiredCategory(categoryId)) {
    return {
      success: false,
      error: "Action Blocked: This category has been retired and is not open for nominations in the 2026 cycle.",
    };
  }

  const adminClient = createAdminClient();

  // 1b. Maximum 3 Categories Check (Client Requirement)
  // An applicant may submit nominations across a maximum of 3 active award categories.
  const { data: userApps } = await adminClient
    .from("applications")
    .select("id, category_id, nomination_id, status, current_wizard_step, project_name")
    .eq("applicant_id", user.id)
    .not("status", "in", '("disqualified","rejected")');

  const existingCategoryIds = new Set(
    (userApps || [])
      .map((a: any) => a.category_id)
      .filter((id: string) => Boolean(id) && !isRetiredCategory(id))
  );

  if (!existingCategoryIds.has(categoryId) && existingCategoryIds.size >= 3) {
    return {
      success: false,
      error:
        "Category Limit Reached: An applicant may submit nominations in a maximum of 3 award categories. You have already initiated nominations across 3 categories.",
    };
  }

  // 1c. Resolve canonical category definition from active catalog
  const canonicalCat = ACTIVE_CATEGORIES.find(
    (c) => c.id === categoryId || c.code === categoryId || c.slug === categoryId
  );

  // 1d. Verify category exists and is active in the Supabase database
  const { data: category, error: catErr } = await supabase
    .from("categories")
    .select("id, edition_id, code, name, is_active")
    .eq("id", categoryId)
    .maybeSingle();

  if (catErr || !category || !category.is_active || isRetiredCategory(category.code)) {
    if (canonicalCat) {
      return {
        success: false,
        error: `Database synchronization required: Category "${canonicalCat.name}" (#${canonicalCat.displayNumber}) is not yet active in the database. Please apply Migration 11 in Supabase.`,
      };
    }
    return { success: false, error: "The selected category is inactive or invalid." };
  }

  // 1e. Re-use existing unsubmitted stub draft in the same category (prevents duplicate stubs)
  const existingStub = (userApps || []).find(
    (a: any) =>
      a.category_id === category.id &&
      a.status === "draft" &&
      a.current_wizard_step === 1 &&
      typeof a.project_name === "string" &&
      a.project_name.startsWith("Draft Entry (")
  );

  if (existingStub) {
    return {
      success: true,
      applicationId: existingStub.id,
      nominationId: existingStub.nomination_id,
    };
  }

  // 2. Fetch applicant profile for default city/state
  const { data: profile } = await supabase
    .from("applicant_profiles")
    .select("city, state")
    .eq("user_id", user.id)
    .maybeSingle();

  // 3. Compute unique human-readable nomination_id: KHA26-{category_code}-{sequence}
  // Use admin client (service role) to read across all applications globally, bypassing RLS
  const prefix = `KHA26-${category.code}-`;

  const { data: existingApps } = await adminClient
    .from("applications")
    .select("nomination_id")
    .eq("edition_id", category.edition_id)
    .eq("category_id", category.id);

  let maxSequence = 0;
  if (existingApps && existingApps.length > 0) {
    for (const app of existingApps) {
      if (app.nomination_id && app.nomination_id.startsWith(prefix)) {
        const numPart = app.nomination_id.substring(prefix.length);
        const parsed = parseInt(numPart, 10);
        if (!isNaN(parsed) && parsed > maxSequence) {
          maxSequence = parsed;
        }
      }
    }
  }

  let sequence = maxSequence + 1;
  const defaultCity = profile?.city || "Bhuj";
  const defaultState = profile?.state || "Gujarat";

  // 4. Attempt insertion with candidate sequence (retry loop for concurrent races)
  const MAX_RETRIES = 5;
  let newApp = null;
  let insertErr = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const candidateId = `${prefix}${String(sequence).padStart(4, "0")}`;

    // Verify candidate is not occupied globally
    const { data: existing } = await adminClient
      .from("applications")
      .select("id")
      .eq("nomination_id", candidateId)
      .maybeSingle();

    if (existing) {
      sequence++;
      continue;
    }

    const defaultProjectName = `Draft Entry (${candidateId})`;

    // 5. Insert draft application record using applicant's authenticated client (enforces RLS)
    const { data: appData, error: appErr } = await supabase
      .from("applications")
      .insert({
        nomination_id: candidateId,
        edition_id: category.edition_id,
        category_id: category.id,
        applicant_id: user.id,
        project_name: defaultProjectName,
        project_city: defaultCity,
        project_state: defaultState,
        status: "draft",
        current_wizard_step: 1,
        is_locked: false,
        declaration_accepted: false,
      })
      .select("id, nomination_id")
      .single();

    if (!appErr && appData) {
      newApp = appData;
      insertErr = null;
      break;
    }

    // If duplicate nomination_id conflict occurs due to a concurrent race, increment and retry
    if (
      appErr &&
      (appErr.code === "23505" || appErr.message?.includes("applications_nomination_id_key"))
    ) {
      sequence++;
      continue;
    }

    insertErr = appErr;
    break;
  }

  if (insertErr || !newApp) {
    console.error("Draft application insertion error:", insertErr);
    return {
      success: false,
      error: insertErr?.message || "Failed to create draft nomination.",
    };
  }

  revalidatePath("/dashboard");
  return {
    success: true,
    applicationId: newApp.id,
    nominationId: newApp.nomination_id,
  };
}

/**
 * Dynamically fetches category questions, options, and upload requirements.
 * Used by NominationWizard to load or switch category configuration in real-time.
 */
export async function getCategoryConfiguration(categoryId: string) {
  const supabase = createClient();

  const [questionsRes, optionsRes, reqsRes] = await Promise.all([
    supabase
      .from("category_questions")
      .select("id, category_id, question_key, question_text, help_text, placeholder, field_type, is_required, validation_rules, display_order")
      .eq("category_id", categoryId)
      .eq("is_active", true)
      .order("display_order"),
    supabase
      .from("question_options")
      .select("id, question_id, label, value, display_order")
      .eq("is_active", true)
      .order("display_order"),
    supabase
      .from("category_upload_requirements")
      .select("id, upload_type, title, description, is_required, min_count, max_count, max_file_size_mb, display_order")
      .eq("category_id", categoryId)
      .eq("is_active", true)
      .order("display_order"),
  ]);

  if (questionsRes.error) {
    console.error("Failed to load category questions:", questionsRes.error);
    return { success: false, error: questionsRes.error.message, questions: [], requirements: [] };
  }

  const rawQuestions = questionsRes.data || [];
  const rawOptions = optionsRes.data || [];
  const rawReqs = reqsRes.data || [];

  const optionsMap = new Map<string, any[]>();
  rawOptions.forEach((opt) => {
    const list = optionsMap.get(opt.question_id) || [];
    list.push(opt);
    optionsMap.set(opt.question_id, list);
  });

  const questions = rawQuestions.map((q) => ({
    id: q.id,
    category_id: q.category_id,
    question_key: q.question_key,
    question_text: q.question_text,
    help_text: q.help_text,
    placeholder: q.placeholder,
    field_type: q.field_type as any,
    is_required: q.is_required,
    validation_rules: q.validation_rules,
    display_order: q.display_order,
    options: optionsMap.get(q.id) || [],
  }));

  const requirements = rawReqs.map((r) => ({
    id: r.id,
    upload_type: r.upload_type as any,
    title: r.title,
    description: r.description,
    is_required: r.is_required,
    min_count: r.min_count,
    max_count: r.max_count,
    max_file_size_mb: r.max_file_size_mb,
  }));

  return { success: true, questions, requirements };
}

/**
 * Saves wizard progress, updates application details, and upserts category questionnaire answers.
 */
export async function saveWizardProgress(params: {
  applicationId: string;
  step: number;
  patch?: {
    projectName?: string;
    projectCity?: string;
    projectState?: string;
    projectDistrict?: string | null;
    projectAddress?: string | null;
    projectBrief?: string | null;
    projectCompletionDate?: string | null;
    builtUpAreaSqft?: number | null;
    categoryId?: string;
    applicantType?: "individual_architect" | "architectural_firm";
    applicantDistrict?: string | null;
    coaRegistrationNumber?: string | null;
  };
  answers?: Array<{
    questionId: string;
    answerText?: string | null;
    answerNumber?: number | null;
    answerJson?: any | null;
  }>;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  // Verify ownership & unlocked status
  const { data: app, error: appErr } = await supabase
    .from("applications")
    .select("id, applicant_id, is_locked, status, edition_id, category_id")
    .eq("id", params.applicationId)
    .single();

  if (appErr || !app) {
    return { success: false, error: "Application not found." };
  }

  if (app.applicant_id !== user.id) {
    return { success: false, error: "Access denied. You do not own this nomination." };
  }

  if (app.is_locked || app.status !== "draft") {
    return { success: false, error: "This nomination has been submitted and is locked." };
  }

  // Update application fields if provided
  const updatePayload: ApplicationUpdate = {
    current_wizard_step: Math.min(Math.max(params.step, 1), 7),
    updated_at: new Date().toISOString(),
  };

  const adminClient = createAdminClient();

  if (params.patch) {
    if (params.patch.projectName !== undefined && params.patch.projectName.trim() !== "") {
      updatePayload.project_name = params.patch.projectName.trim();
    }
    if (params.patch.projectCity !== undefined && params.patch.projectCity.trim() !== "") {
      updatePayload.project_city = params.patch.projectCity.trim();
    }
    if (params.patch.projectState !== undefined && params.patch.projectState.trim() !== "") {
      updatePayload.project_state = params.patch.projectState.trim();
    }
    if (params.patch.projectCompletionDate !== undefined) {
      const compDate = params.patch.projectCompletionDate ? params.patch.projectCompletionDate.trim() : null;
      if (compDate && (compDate < "2024-01-01" || compDate > "2026-12-31")) {
        return {
          success: false,
          error: "Eligible projects must have been completed during calendar years 2024, 2025, or 2026.",
        };
      }
      updatePayload.project_completion_date = compDate;
    }
    if (params.patch.builtUpAreaSqft !== undefined) {
      updatePayload.built_up_area_sqft =
        params.patch.builtUpAreaSqft === null || isNaN(Number(params.patch.builtUpAreaSqft))
          ? null
          : Number(params.patch.builtUpAreaSqft);
    }
    if (params.patch.projectBrief !== undefined) {
      const brief = (params.patch.projectBrief || "").trim();
      if (brief.length > 500) {
        return {
          success: false,
          error: `Project brief exceeds the maximum limit of 500 characters (currently ${brief.length} characters).`,
        };
      }
      (updatePayload as any).project_brief = brief;
    }
    if (params.patch.projectDistrict !== undefined) {
      (updatePayload as any).project_district = params.patch.projectDistrict?.trim() || "Kutch";
    }
    if (params.patch.projectAddress !== undefined) {
      (updatePayload as any).project_address = params.patch.projectAddress?.trim() || null;
    }
    if (params.patch.applicantType !== undefined) {
      (updatePayload as any).applicant_type = params.patch.applicantType;
    }
    if (params.patch.applicantDistrict !== undefined) {
      (updatePayload as any).applicant_district = params.patch.applicantDistrict?.trim() || "Kutch";
    }
    if (params.patch.coaRegistrationNumber !== undefined) {
      (updatePayload as any).coa_registration_number = params.patch.coaRegistrationNumber?.trim() || null;
    }

    if (params.patch.categoryId && params.patch.categoryId !== app.category_id) {
      if (isRetiredCategory(params.patch.categoryId)) {
        return {
          success: false,
          error: "Action Blocked: The selected category is retired and not open for nominations.",
        };
      }

      // Validate applicant 3-category limit when switching categories
      const { data: userApps } = await adminClient
        .from("applications")
        .select("category_id")
        .eq("applicant_id", user.id)
        .neq("id", params.applicationId)
        .not("status", "in", '("disqualified","rejected")');

      const existingCategoryIds = new Set(
        (userApps || [])
          .map((a: any) => a.category_id)
          .filter((id: string) => Boolean(id) && !isRetiredCategory(id))
      );

      if (!existingCategoryIds.has(params.patch.categoryId) && existingCategoryIds.size >= 3) {
        return {
          success: false,
          error:
            "Category Limit Reached: An applicant may submit nominations in a maximum of 3 award categories. You have already selected 3 categories.",
        };
      }

      // Validate category belongs to same edition and is active
      const { data: newCat } = await supabase
        .from("categories")
        .select("id, edition_id")
        .eq("id", params.patch.categoryId)
        .eq("edition_id", app.edition_id)
        .eq("is_active", true)
        .maybeSingle();

      if (newCat) {
        updatePayload.category_id = newCat.id;
      } else {
        return {
          success: false,
          error: "Selected category is not active in the database.",
        };
      }
    }
  }

  let { error: updateErr } = await supabase
    .from("applications")
    .update(updatePayload)
    .eq("id", params.applicationId);

  // Fallback: If new columns fail because Migration 12 is pending in Supabase,
  // update core columns safely and persist extended data
  if (updateErr && (updateErr.message?.includes("column") || (updateErr as any).code === "PGRST204")) {
    const corePayload: any = {
      current_wizard_step: updatePayload.current_wizard_step,
      updated_at: updatePayload.updated_at,
      project_name: updatePayload.project_name,
      project_city: updatePayload.project_city,
      project_state: updatePayload.project_state,
      project_completion_date: updatePayload.project_completion_date,
      built_up_area_sqft: updatePayload.built_up_area_sqft,
    };
    if (updatePayload.category_id) corePayload.category_id = updatePayload.category_id;
    const { error: retryErr } = await supabase.from("applications").update(corePayload).eq("id", params.applicationId);
    if (!retryErr) updateErr = null;
  }

  if (updateErr) {
    console.error("Failed to update application progress:", updateErr);
    return { success: false, error: updateErr.message };
  }

  // Upsert dynamic answers if provided
  if (params.answers && params.answers.length > 0) {
    for (const ans of params.answers) {
      const { error: ansErr } = await supabase.from("application_answers").upsert(
        {
          application_id: params.applicationId,
          question_id: ans.questionId,
          answer_text: ans.answerText ?? null,
          answer_number: ans.answerNumber ?? null,
          answer_json: ans.answerJson ?? null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "application_id, question_id" }
      );

      if (ansErr) {
        console.error("Failed to upsert application answer:", ansErr);
      }
    }
  }

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/nominations/${params.applicationId}`);

  return { success: true };
}

/**
 * Uploads a document or image to private storage bucket 'application-files'
 * and records metadata in 'application_files'.
 */
export async function uploadNominationFile(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const applicationId = formData.get("applicationId") as string;
  const file = formData.get("file") as File;
  const uploadType = (formData.get("uploadType") as UploadType) || "project_photo";
  const caption = (formData.get("caption") as string) || null;
  const isCover = formData.get("isCover") === "true";
  const requirementId = (formData.get("requirementId") as string) || null;

  if (!applicationId || !file) {
    return { success: false, error: "Missing required file upload parameters." };
  }

  // Verify ownership & unlocked status
  const { data: app, error: appErr } = await supabase
    .from("applications")
    .select("id, applicant_id, is_locked, status")
    .eq("id", applicationId)
    .single();

  if (appErr || !app || app.applicant_id !== user.id) {
    return { success: false, error: "Application not found or unauthorized." };
  }

  if (app.is_locked || app.status !== "draft") {
    return { success: false, error: "Cannot upload files to a locked/submitted nomination." };
  }

  // 1. Explicit Client Restriction: Before Photo removal
  if (
    (uploadType as string) === "before_photo" ||
    file.name.toLowerCase().includes("before_photo")
  ) {
    return {
      success: false,
      error:
        "The Before Photo upload option has been removed per official awards guidelines. Please upload completed project photography.",
    };
  }

  // 2. Prepare buffer for validation and storage
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // 3. Project Photograph Quality Validation (Client Specification)
  // - Minimum width: 500 px, Minimum height: 500 px
  // - JPG and PNG formats only
  // - Max 10 MB per image
  const isPhotograph = ["cover_image", "project_photo", "interior_photo", "exterior_photo"].includes(
    uploadType
  );

  if (isPhotograph) {
    const imgValidation = validateImageBuffer(buffer, file.name);
    if (!imgValidation.valid) {
      return {
        success: false,
        error:
          imgValidation.error ||
          "Image does not meet quality requirements (must be JPG or PNG, at least 500 × 500 pixels, up to 10 MB).",
      };
    }
  }

  // 4. Project Plan (A3 Size) format validation
  if (uploadType === "floor_plan") {
    const ext = file.name.split(".").pop()?.toLowerCase();
    const validPlanExts = ["pdf", "jpg", "jpeg", "png"];
    if (!ext || !validPlanExts.includes(ext)) {
      return {
        success: false,
        error: "Project plan must be submitted in PDF, PNG, or JPG format.",
      };
    }
    const MAX_PLAN_BYTES = 15 * 1024 * 1024;
    if (file.size > MAX_PLAN_BYTES) {
      return {
        success: false,
        error: "Project plan exceeds maximum permitted size of 15 MB.",
      };
    }
  } else {
    // General max size validation (15MB limit)
    const MAX_BYTES = 15 * 1024 * 1024;
    if (file.size > MAX_BYTES) {
      return { success: false, error: "File exceeds the 15MB size limit." };
    }
  }

  // Sanitize filename & create storage path
  // Storage RLS requires: (storage.foldername(name))[1] = auth.uid()::text
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storagePath = `${user.id}/${applicationId}/${Date.now()}_${sanitizedName}`;

  // Upload to Supabase Storage
  const { error: storageErr } = await supabase.storage
    .from("application-files")
    .upload(storagePath, buffer, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

  if (storageErr) {
    console.error("Storage upload error:", storageErr);
    return { success: false, error: storageErr.message || "Failed to upload file to storage." };
  }

  // If this file is marked as cover, unmark existing covers for this application
  if (isCover) {
    await supabase
      .from("application_files")
      .update({ is_cover: false })
      .eq("application_id", applicationId);
  }

  // Insert metadata record into application_files
  const { data: fileRecord, error: fileErr } = await supabase
    .from("application_files")
    .insert({
      application_id: applicationId,
      upload_requirement_id: requirementId,
      upload_type: uploadType,
      original_filename: file.name,
      storage_path: storagePath,
      storage_provider: "supabase",
      mime_type: file.type || "application/octet-stream",
      file_size_bytes: file.size,
      caption: caption,
      is_cover: isCover,
    })
    .select("id, storage_path, original_filename, upload_type, is_cover, upload_requirement_id")
    .single();

  if (fileErr || !fileRecord) {
    console.error("Failed to record application_files entry:", fileErr);
    return { success: false, error: fileErr?.message || "Failed to save file metadata." };
  }

  revalidatePath(`/dashboard/nominations/${applicationId}`);
  return { success: true, file: fileRecord };
}

/**
 * Deletes a nomination file metadata row and removes the file from private storage.
 */
export async function deleteNominationFile(applicationId: string, fileId: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  // Verify ownership & unlocked status
  const { data: app, error: appErr } = await supabase
    .from("applications")
    .select("id, applicant_id, is_locked, status")
    .eq("id", applicationId)
    .single();

  if (appErr || !app || app.applicant_id !== user.id) {
    return { success: false, error: "Unauthorized access to application." };
  }

  if (app.is_locked || app.status !== "draft") {
    return { success: false, error: "Cannot delete files from a submitted application." };
  }

  // Retrieve file record
  const { data: fileRecord } = await supabase
    .from("application_files")
    .select("id, storage_path")
    .eq("id", fileId)
    .eq("application_id", applicationId)
    .single();

  if (!fileRecord) {
    return { success: false, error: "File record not found." };
  }

  // Delete from database
  const { error: dbDeleteErr } = await supabase
    .from("application_files")
    .delete()
    .eq("id", fileId);

  if (dbDeleteErr) {
    return { success: false, error: dbDeleteErr.message };
  }

  // Clean up physical object from private storage via admin client
  try {
    const admin = createAdminClient();
    await admin.storage.from("application-files").remove([fileRecord.storage_path]);
  } catch (storageCleanErr) {
    console.warn("Storage cleanup notice:", storageCleanErr);
  }

  revalidatePath(`/dashboard/nominations/${applicationId}`);
  return { success: true };
}

/**
 * Generates a signed URL for a file in private storage.
 */
export async function getSignedFileUrl(storagePath: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  // Ensure user owns folder in storagePath
  const pathPrefix = storagePath.split("/")[0];
  if (pathPrefix !== user.id) {
    return { success: false, error: "Access denied to requested file." };
  }

  const { data, error } = await supabase.storage
    .from("application-files")
    .createSignedUrl(storagePath, 3600); // 1 hour validity

  if (error || !data) {
    return { success: false, error: error?.message || "Failed to generate signed URL." };
  }

  return { success: true, signedUrl: data.signedUrl };
}

/**
 * Submits the nomination entry permanently:
 * - Validates required project fields & declarations
 * - Validates dynamic questionnaire requirements if configured
 * - Transitions status from 'draft' to 'submitted'
 * - Sets is_locked = true
 * - Records submitted_at & declaration_accepted
 * - Inserts audit entry into application_status_history
 */
export async function submitFinalNomination(
  applicationId: string,
  declarations: {
    authorship?: boolean;
    accuracy?: boolean;
    license?: boolean;
    terms?: boolean;
    selfDeclaration: boolean;
  }
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Authentication required." };
  }

  // 1. Validate mandatory self-declaration (Exact client-supplied requirement)
  if (!declarations.selfDeclaration) {
    return {
      success: false,
      error:
        'You must accept the mandatory declaration before submitting: "I hereby declare that, to the best of my knowledge, all information provided about myself, my firm and the project in this nomination form is true and accurate."',
    };
  }

  // 2. Fetch application and category
  const { data: app, error: appErr } = await supabase
    .from("applications")
    .select("*, categories(id, code, name, is_active)")
    .eq("id", applicationId)
    .single();

  if (appErr || !app) {
    return { success: false, error: "Nomination not found." };
  }

  if (app.applicant_id !== user.id) {
    return { success: false, error: "You are not authorized to submit this nomination." };
  }

  const catObj = Array.isArray(app.categories) ? app.categories[0] : app.categories;
  if (catObj && catObj.is_active === false) {
    return {
      success: false,
      error: "This award category is not active for the 2026 edition. Please switch your nomination to an active category before submitting.",
    };
  }

  const isClarificationResubmit = app.status === "clarification_required";
  if (!isClarificationResubmit && (app.is_locked || app.status !== "draft")) {
    return { success: false, error: "This nomination has already been submitted and locked." };
  }

  // 3. Validate required project fields
  if (!app.project_name || app.project_name.startsWith("Draft Entry (")) {
    return {
      success: false,
      error: "Please enter a valid Project Name before final submission.",
    };
  }

  if (!app.project_city || app.project_city.trim() === "") {
    return {
      success: false,
      error: "Project City is required for nomination submission.",
    };
  }

  if (!app.project_state || app.project_state.trim() === "") {
    return {
      success: false,
      error: "Project State is required for nomination submission.",
    };
  }

  // 3b. Project Location Eligibility: Must be within Kutch District
  const kutchTowns = [
    "bhuj", "gandhidham", "anjar", "mandvi", "mundra", "nakhatrana",
    "rapar", "bhachau", "abdasa", "lakhpat", "kutch", "kachchh",
    "madhapar", "mirzapar", "sukhpar", "kera"
  ];
  const projectCityNorm = (app.project_city || "").toLowerCase().trim();
  const projectDistNorm = ((app as any).project_district || "").toLowerCase().trim();
  const isProjectInKutch =
    projectDistNorm.includes("kutch") ||
    projectDistNorm.includes("kachchh") ||
    kutchTowns.some((t) => projectCityNorm.includes(t));

  if (!isProjectInKutch) {
    return {
      success: false,
      error: "Project Location Ineligible: The submitted project must be located within Kutch district.",
    };
  }

  // 3c. Project Completion Date Validation: Calendar years 2024, 2025, or 2026
  if (!app.project_completion_date) {
    return {
      success: false,
      error: "Project completion date is required for nomination submission.",
    };
  }

  const compDate = app.project_completion_date;
  if (compDate < "2024-01-01" || compDate > "2026-12-31") {
    return {
      success: false,
      error: "Eligible projects must have been completed during calendar years 2024, 2025, or 2026.",
    };
  }

  // 3d. Project Brief Validation: Required, max 500 characters
  const brief = ((app as any).project_brief || "").trim();
  if (!brief) {
    return {
      success: false,
      error: "Project brief is required for nomination submission (maximum 500 characters).",
    };
  }
  if (brief.length > 500) {
    return {
      success: false,
      error: `Project brief exceeds the maximum limit of 500 characters (currently ${brief.length} characters).`,
    };
  }

  // 3e. Applicant Eligibility Check: Must be architect or firm based in Kutch
  const adminClient = createAdminClient();
  const { data: profile } = await adminClient
    .from("applicant_profiles")
    .select("city, state, organization_name, designation, address_line")
    .eq("user_id", user.id)
    .maybeSingle();

  const applicantCityNorm = (profile?.city || "").toLowerCase().trim();
  const applicantDistNorm = ((app as any).applicant_district || "").toLowerCase().trim();
  const isApplicantInKutch =
    applicantDistNorm.includes("kutch") ||
    applicantDistNorm.includes("kachchh") ||
    kutchTowns.some((t) => applicantCityNorm.includes(t));

  if (!isApplicantInKutch) {
    return {
      success: false,
      error:
        "Applicant Ineligible: The nominating applicant must be an architect based in Kutch or an architectural firm based in Kutch.",
    };
  }

  // 3f. Maximum 3 Categories Check: Applicant cannot enter more than 3 distinct active categories
  const { data: allUserApps } = await adminClient
    .from("applications")
    .select("category_id")
    .eq("applicant_id", user.id)
    .not("status", "in", '("disqualified","rejected")');

  const distinctUserCategories = new Set(
    (allUserApps || [])
      .map((a: any) => a.category_id)
      .filter((id: string) => Boolean(id) && !isRetiredCategory(id))
  );
  if (distinctUserCategories.size > 3) {
    return {
      success: false,
      error: "Category Limit Reached: An applicant may submit nominations in a maximum of 3 award categories.",
    };
  }

  // 4. Production Submission Boundary: Check whether official category configuration exists
  const [questionsCountRes, uploadReqsCountRes] = await Promise.all([
    supabase
      .from("category_questions")
      .select("id", { count: "exact", head: true })
      .eq("category_id", app.category_id)
      .eq("is_active", true),
    supabase
      .from("category_upload_requirements")
      .select("id", { count: "exact", head: true })
      .eq("category_id", app.category_id)
      .eq("is_active", true),
  ]);

  const totalQuestions = questionsCountRes.count ?? 0;
  const totalUploadReqs = uploadReqsCountRes.count ?? 0;

  // Final submission is strictly blocked if official category configuration has not been published
  if (totalQuestions === 0 || totalUploadReqs === 0) {
    return {
      success: false,
      error:
        "Submission On Hold: Official category questions and upload requirements for this category have not yet been published by the organizing committee. Your draft is securely saved and will become eligible for final submission once the official configuration is ratified.",
      code: "CONFIGURATION_PENDING",
    };
  }

  // 4b. Validate that all required category questions are answered
  const { data: requiredQuestions } = await supabase
    .from("category_questions")
    .select("id, question_text")
    .eq("category_id", app.category_id)
    .eq("is_required", true)
    .eq("is_active", true);

  if (requiredQuestions && requiredQuestions.length > 0) {
    const { data: answers } = await supabase
      .from("application_answers")
      .select("question_id, answer_text, answer_number, answer_json")
      .eq("application_id", applicationId);

    const answeredIds = new Set(
      (answers || [])
        .filter(
          (a) =>
            (a.answer_text && a.answer_text.trim() !== "") ||
            a.answer_number !== null ||
            (a.answer_json && Object.keys(a.answer_json).length > 0)
        )
        .map((a) => a.question_id)
    );

    for (const reqQ of requiredQuestions) {
      if (!answeredIds.has(reqQ.id)) {
        return {
          success: false,
          error: `Required questionnaire field missing: "${reqQ.question_text}".`,
        };
      }
    }
  }

  // 4c. Validate that all mandatory upload requirements are met
  const { data: requiredUploads } = await supabase
    .from("category_upload_requirements")
    .select("id, upload_type, title, min_count")
    .eq("category_id", app.category_id)
    .eq("is_required", true)
    .eq("is_active", true);

  if (requiredUploads && requiredUploads.length > 0) {
    const { data: uploadedFiles } = await supabase
      .from("application_files")
      .select("upload_type, upload_requirement_id")
      .eq("application_id", applicationId);

    for (const reqUp of requiredUploads) {
      const matchCount = (uploadedFiles || []).filter(
        (f) =>
          f.upload_requirement_id === reqUp.id ||
          f.upload_type === reqUp.upload_type
      ).length;

      const minExpected = reqUp.min_count > 0 ? reqUp.min_count : 1;
      if (matchCount < minExpected) {
        return {
          success: false,
          error: `Required upload missing: "${reqUp.title}" (Minimum ${minExpected} required, found ${matchCount}).`,
        };
      }
    }
  }

  const now = new Date().toISOString();
  const nextStatus = isClarificationResubmit ? "under_verification" : "submitted";
  const exactDeclarationText =
    "I hereby declare that, to the best of my knowledge, all information provided about myself, my firm and the project in this nomination form is true and accurate.";

  // 5. Update applications row: lock and transition status using trusted server-side operation
  const updateFields: any = {
    status: nextStatus,
    is_locked: true,
    declaration_accepted: true,
    declaration_accepted_at: now,
    declaration_text: exactDeclarationText,
    submitted_at: app.submitted_at || now,
    current_wizard_step: 7,
    updated_at: now,
  };

  let { error: updateErr } = await adminClient
    .from("applications")
    .update(updateFields)
    .eq("id", applicationId)
    .eq("applicant_id", user.id);

  // Graceful fallback if declaration_text column pending Migration 12
  if (updateErr && (updateErr.message?.includes("declaration_text") || (updateErr as any).code === "PGRST204")) {
    delete updateFields.declaration_text;
    const retryRes = await adminClient
      .from("applications")
      .update(updateFields)
      .eq("id", applicationId)
      .eq("applicant_id", user.id);
    updateErr = retryRes.error;
  }

  if (updateErr) {
    console.error("Submission update error:", updateErr);
    return { success: false, error: updateErr.message || "Failed to submit nomination." };
  }

  // 5b. Auto-register pending participant certificate entry
  try {
    const defaultCertNumber = `KHA26-CERT-${catObj?.code || "GEN"}-${Math.floor(1000 + Math.random() * 9000)}`;
    const participantName =
      profile?.organization_name?.trim() ||
      user.user_metadata?.full_name?.trim() ||
      "Participating Entrant";

    await (adminClient as any).from("participant_certificates").upsert(
      {
        application_id: applicationId,
        certificate_number: defaultCertNumber,
        participant_name: participantName,
        participant_type: profile?.organization_name ? "architectural_firm" : "individual_architect",
        project_name: app.project_name,
        category_name: catObj?.name || "Official Category",
        award_edition: "2026",
        status: "pending",
        updated_at: now,
      },
      { onConflict: "application_id" }
    );
  } catch (certInitErr) {
    console.warn("Participant certificate auto-init notice:", certInitErr);
  }

  // If resubmitting following a clarification request, resolve pending records
  if (isClarificationResubmit) {
    await adminClient
      .from("clarification_requests")
      .update({
        status: "resolved",
        responded_at: now,
        response_text: "Applicant reviewed and resubmitted nomination.",
        updated_at: now,
      })
      .eq("application_id", applicationId)
      .eq("status", "pending");
  }

  // 6. Record audit log in application_status_history
  const { error: histErr } = await adminClient.from("application_status_history").insert({
    application_id: applicationId,
    from_status: app.status,
    to_status: nextStatus,
    changed_by: user.id,
    comments: isClarificationResubmit
      ? "Nomination revised and resubmitted by applicant following clarification request."
      : "Nomination officially submitted by applicant with all declarations accepted.",
  });

  if (histErr) {
    console.warn("Status history logging notice:", histErr.message);
  }

  // 7. Record immutable entry in audit_logs
  await adminClient.from("audit_logs").insert({
    actor_id: user.id,
    action: isClarificationResubmit
      ? "nomination_clarification_resubmitted"
      : "nomination_submitted",
    entity_type: "application",
    entity_id: applicationId,
    old_values: { status: app.status },
    new_values: { status: nextStatus },
    created_at: now,
  });

  // 8. Phase F: Event-Driven Transactional Notifications (Idempotent, non-blocking)
  if (!isClarificationResubmit) {
    sendNotification({
      eventType: "nomination_submitted",
      recipientUserId: user.id,
      recipientEmail: user.email,
      recipientName: (user.user_metadata?.full_name as string) || undefined,
      applicationId,
      nominationId: app.nomination_id,
      data: {
        projectName: app.project_name,
        categoryName: (app.categories as any)?.name,
        categoryCode: (app.categories as any)?.code,
      },
      idempotencyKey: `nomination_submitted:${applicationId}`,
      channels: ["email", "in_app"],
    }).catch((err) => console.error("Applicant nomination_submitted notice:", err));

    notifyAdmins("admin_new_submission", {
      nominationId: app.nomination_id,
      applicationId,
      data: {
        projectName: app.project_name,
        applicantName: (user.user_metadata?.full_name as string) || user.email,
        categoryName: (app.categories as any)?.name,
      },
    }).catch((err) => console.error("Admin new submission alert notice:", err));
  } else {
    notifyAdmins("admin_clarification_responded", {
      nominationId: app.nomination_id,
      applicationId,
      data: {
        projectName: app.project_name,
        actorName: (user.user_metadata?.full_name as string) || user.email,
      },
    }).catch((err) => console.error("Admin clarification alert notice:", err));

    sendNotification({
      eventType: "clarification_responded",
      recipientUserId: user.id,
      applicationId,
      nominationId: app.nomination_id,
      data: {
        projectName: app.project_name,
      },
      idempotencyKey: `clarification_responded:${applicationId}:${now}`,
      channels: ["in_app"],
    }).catch((err) => console.error("Applicant clarification in-app notice:", err));
  }

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/nominations/${applicationId}`);
  revalidatePath(`/dashboard/nominations/${applicationId}/confirmation`);

  return {
    success: true,
    nominationId: app.nomination_id,
    projectName: app.project_name,
    categoryName: (app.categories as any)?.name || "Award Category",
    submittedAt: now,
  };
}
