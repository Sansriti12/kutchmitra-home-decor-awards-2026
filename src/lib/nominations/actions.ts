"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import type { Database, UploadType } from "@/types/database.types";

type ApplicationUpdate = Database["public"]["Tables"]["applications"]["Update"];

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

  // 1. Verify category exists and is active
  const { data: category, error: catErr } = await supabase
    .from("categories")
    .select("id, edition_id, code, name")
    .eq("id", categoryId)
    .eq("is_active", true)
    .single();

  if (catErr || !category) {
    return { success: false, error: "The selected category is inactive or invalid." };
  }

  // 2. Fetch applicant profile for default city/state
  const { data: profile } = await supabase
    .from("applicant_profiles")
    .select("city, state")
    .eq("user_id", user.id)
    .maybeSingle();

  // 3. Compute unique human-readable nomination_id: KHA26-{category_code}-{sequence}
  // Use admin client (service role) to read across all applications globally, bypassing RLS
  const adminClient = createAdminClient();
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
 * Saves wizard progress, updates application details, and upserts category questionnaire answers.
 */
export async function saveWizardProgress(params: {
  applicationId: string;
  step: number;
  patch?: {
    projectName?: string;
    projectCity?: string;
    projectState?: string;
    projectCompletionDate?: string | null;
    builtUpAreaSqft?: number | null;
    categoryId?: string;
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
    .select("id, applicant_id, is_locked, status, edition_id")
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
      updatePayload.project_completion_date = params.patch.projectCompletionDate || null;
    }
    if (params.patch.builtUpAreaSqft !== undefined) {
      updatePayload.built_up_area_sqft =
        params.patch.builtUpAreaSqft === null || isNaN(Number(params.patch.builtUpAreaSqft))
          ? null
          : Number(params.patch.builtUpAreaSqft);
    }
    if (params.patch.categoryId) {
      // Validate category belongs to same edition
      const { data: newCat } = await supabase
        .from("categories")
        .select("id, edition_id")
        .eq("id", params.patch.categoryId)
        .eq("edition_id", app.edition_id)
        .eq("is_active", true)
        .maybeSingle();

      if (newCat) {
        updatePayload.category_id = newCat.id;
      }
    }
  }

  const { error: updateErr } = await supabase
    .from("applications")
    .update(updatePayload)
    .eq("id", params.applicationId);

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

  // File size validation (15MB limit)
  const MAX_BYTES = 15 * 1024 * 1024;
  if (file.size > MAX_BYTES) {
    return { success: false, error: "File exceeds the 15MB size limit." };
  }

  // Sanitize filename & create storage path
  // Storage RLS requires: (storage.foldername(name))[1] = auth.uid()::text
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storagePath = `${user.id}/${applicationId}/${Date.now()}_${sanitizedName}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

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
    .select("id, storage_path, original_filename, upload_type, is_cover")
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
    authorship: boolean;
    accuracy: boolean;
    license: boolean;
    terms: boolean;
  }
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Authentication required." };
  }

  // 1. Validate all 4 declaration consents
  if (
    !declarations.authorship ||
    !declarations.accuracy ||
    !declarations.license ||
    !declarations.terms
  ) {
    return {
      success: false,
      error: "All 4 declaration checkpoints must be reviewed and accepted before submission.",
    };
  }

  // 2. Fetch application and category
  const { data: app, error: appErr } = await supabase
    .from("applications")
    .select("*, categories(id, code, name)")
    .eq("id", applicationId)
    .single();

  if (appErr || !app) {
    return { success: false, error: "Nomination not found." };
  }

  if (app.applicant_id !== user.id) {
    return { success: false, error: "You are not authorized to submit this nomination." };
  }

  if (app.is_locked || app.status !== "draft") {
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

  // 5. Update applications row: lock and transition status using trusted server-side operation
  const adminClient = createAdminClient();
  const { error: updateErr } = await adminClient
    .from("applications")
    .update({
      status: "submitted",
      is_locked: true,
      declaration_accepted: true,
      declaration_accepted_at: now,
      submitted_at: now,
      current_wizard_step: 7,
      updated_at: now,
    })
    .eq("id", applicationId)
    .eq("applicant_id", user.id)
    .eq("is_locked", false);

  if (updateErr) {
    console.error("Submission update error:", updateErr);
    return { success: false, error: updateErr.message || "Failed to submit nomination." };
  }

  // 6. Record audit log in application_status_history
  const { error: histErr } = await adminClient.from("application_status_history").insert({
    application_id: applicationId,
    from_status: "draft",
    to_status: "submitted",
    changed_by: user.id,
    comments: "Nomination officially submitted by applicant with all declarations accepted.",
  });

  if (histErr) {
    console.warn("Status history logging notice:", histErr.message);
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
