import React from "react";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ensureApplicantProfile } from "@/lib/auth/profile";
import NominationWizard from "@/components/nominations/NominationWizard";
import NominationDossierViewer from "@/components/nominations/NominationDossierViewer";
import type { CategoryOption } from "@/components/nominations/Step2Category";
import type { EntrantDetailsData } from "@/components/nominations/Step1EntrantDetails";
import type { DynamicQuestionItem } from "@/components/nominations/Step4DynamicQuestions";
import type { FileItem, UploadRequirementItem } from "@/components/nominations/Step5MediaDocuments";

export const dynamic = "force-dynamic";

interface NominationPageProps {
  params: {
    id: string;
  };
}

export default async function NominationPage({ params }: NominationPageProps) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirect=/dashboard/nominations/${params.id}`);
  }

  // Idempotently ensure applicant profile exists
  await ensureApplicantProfile(supabase, user);

  // 1. Fetch the application
  const { data: application, error: appErr } = await supabase
    .from("applications")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (appErr || !application) {
    notFound();
  }

  // 2. Strict applicant isolation check: must belong to authenticated user
  if (application.applicant_id !== user.id) {
    notFound();
  }

  // 3. Parallel fetch: User identity, applicant profile, categories, questions, options, answers, files, requirements
  const [
    dbUserRes,
    profileRes,
    catsRes,
    questionsRes,
    optionsRes,
    answersRes,
    filesRes,
    reqsRes,
  ] = await Promise.all([
    supabase
      .from("users")
      .select("full_name, email, phone")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("applicant_profiles")
      .select("organization_name, designation, city, state, postal_code, address_line, website_url, portfolio_url")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("categories")
      .select("id, code, name, slug, short_description, eligibility_criteria")
      .eq("is_active", true)
      .order("display_order"),
    supabase
      .from("category_questions")
      .select("id, category_id, question_key, question_text, help_text, placeholder, field_type, is_required, validation_rules, display_order")
      .eq("category_id", application.category_id)
      .eq("is_active", true)
      .order("display_order"),
    supabase
      .from("question_options")
      .select("id, question_id, label, value, display_order")
      .eq("is_active", true)
      .order("display_order"),
    supabase
      .from("application_answers")
      .select("question_id, answer_text, answer_number, answer_json")
      .eq("application_id", application.id),
    supabase
      .from("application_files")
      .select("id, application_id, upload_type, original_filename, storage_path, mime_type, file_size_bytes, caption, is_cover, created_at")
      .eq("application_id", application.id)
      .order("display_order")
      .order("created_at", { ascending: false }),
    supabase
      .from("category_upload_requirements")
      .select("id, upload_type, title, description, is_required, min_count, max_count, max_file_size_mb")
      .eq("category_id", application.category_id)
      .eq("is_active", true)
      .order("display_order"),
  ]);

  const dbUser = dbUserRes.data;
  const profile = profileRes.data;
  const allCategoriesData = catsRes.data || [];
  const rawQuestions = questionsRes.data || [];
  const rawOptions = optionsRes.data || [];
  const rawAnswers = answersRes.data || [];
  const rawFiles = filesRes.data || [];
  const rawReqs = reqsRes.data || [];

  // Group question options by question_id
  const optionsMap = new Map<string, any[]>();
  rawOptions.forEach((opt) => {
    const list = optionsMap.get(opt.question_id) || [];
    list.push(opt);
    optionsMap.set(opt.question_id, list);
  });

  const questions: DynamicQuestionItem[] = rawQuestions.map((q) => ({
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

  const allCategories: CategoryOption[] = allCategoriesData.map((c) => ({
    id: c.id,
    code: c.code,
    name: c.name,
    slug: c.slug,
    short_description: c.short_description,
    eligibility_criteria: c.eligibility_criteria,
  }));

  const activeCategory =
    allCategories.find((c) => c.id === application.category_id) || allCategories[0];

  const entrant: EntrantDetailsData = {
    fullName: dbUser?.full_name || user.email?.split("@")[0] || "Entrant",
    email: dbUser?.email || user.email || "",
    phone: dbUser?.phone || null,
    organizationName: profile?.organization_name || null,
    designation: profile?.designation || null,
    city: profile?.city || application.project_city || "Bhuj",
    state: profile?.state || application.project_state || "Gujarat",
    postalCode: profile?.postal_code || null,
    addressLine: profile?.address_line || null,
    websiteUrl: profile?.website_url || null,
    portfolioUrl: profile?.portfolio_url || null,
  };

  const files: FileItem[] = rawFiles.map((f) => ({
    id: f.id,
    application_id: f.application_id,
    upload_type: f.upload_type as any,
    original_filename: f.original_filename,
    storage_path: f.storage_path,
    mime_type: f.mime_type,
    file_size_bytes: Number(f.file_size_bytes),
    caption: f.caption,
    is_cover: f.is_cover,
    created_at: f.created_at,
  }));

  const requirements: UploadRequirementItem[] = rawReqs.map((r) => ({
    id: r.id,
    upload_type: r.upload_type as any,
    title: r.title,
    description: r.description,
    is_required: r.is_required,
    min_count: r.min_count,
    max_count: r.max_count,
    max_file_size_mb: r.max_file_size_mb,
  }));

  // If locked or submitted, render read-only Dossier Viewer
  if (application.is_locked || application.status !== "draft") {
    return (
      <NominationDossierViewer
        application={{
          id: application.id,
          nomination_id: application.nomination_id,
          project_name: application.project_name,
          project_city: application.project_city,
          project_state: application.project_state,
          project_completion_date: application.project_completion_date,
          built_up_area_sqft: application.built_up_area_sqft ? Number(application.built_up_area_sqft) : null,
          status: application.status,
          submitted_at: application.submitted_at,
          declaration_accepted_at: application.declaration_accepted_at,
        }}
        entrant={entrant}
        category={activeCategory}
        questions={questions}
        answers={rawAnswers}
        files={files}
      />
    );
  }

  // Otherwise, render editable 7-step Nomination Wizard
  return (
    <NominationWizard
      application={{
        id: application.id,
        nomination_id: application.nomination_id,
        category_id: application.category_id,
        project_name: application.project_name,
        project_city: application.project_city,
        project_state: application.project_state,
        project_completion_date: application.project_completion_date,
        built_up_area_sqft: application.built_up_area_sqft ? Number(application.built_up_area_sqft) : null,
        current_wizard_step: application.current_wizard_step || 1,
        status: application.status,
        is_locked: application.is_locked,
      }}
      entrant={entrant}
      category={activeCategory}
      allCategories={allCategories}
      questions={questions}
      answers={rawAnswers}
      files={files}
      requirements={requirements}
    />
  );
}
