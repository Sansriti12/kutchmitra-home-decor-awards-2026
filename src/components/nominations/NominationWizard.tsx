"use client";

import React, { useState, useEffect } from "react";
import WizardHeader from "./WizardHeader";
import Step1EntrantDetails, { EntrantDetailsData } from "./Step1EntrantDetails";
import Step2Category, { CategoryOption } from "./Step2Category";
import Step3ProjectDetails, { ProjectDetailsData } from "./Step3ProjectDetails";
import Step4DynamicQuestions, { DynamicQuestionItem, AnswerPayload } from "./Step4DynamicQuestions";
import Step5MediaDocuments, { FileItem, UploadRequirementItem } from "./Step5MediaDocuments";
import Step6Preview from "./Step6Preview";
import Step7Declaration from "./Step7Declaration";
import { saveWizardProgress } from "@/lib/nominations/actions";

const WIZARD_STEP_LABELS: Record<number, string> = {
  1: "Entrant Profile",
  2: "Category Selection",
  3: "Project Details",
  4: "Category Questionnaire",
  5: "Media & Documents",
  6: "Complete Preview",
  7: "Declaration & Submit",
};

export interface NominationWizardProps {
  application: {
    id: string;
    nomination_id: string;
    category_id: string;
    project_name: string;
    project_city: string;
    project_state: string;
    project_completion_date: string | null;
    built_up_area_sqft: number | null;
    current_wizard_step: number;
    status: string;
    is_locked: boolean;
  };
  entrant: EntrantDetailsData;
  category: CategoryOption;
  allCategories: CategoryOption[];
  questions: DynamicQuestionItem[];
  answers: Array<{
    question_id: string;
    answer_text: string | null;
    answer_number: number | null;
    answer_json: any | null;
  }>;
  files: FileItem[];
  requirements: UploadRequirementItem[];
}

export default function NominationWizard({
  application,
  entrant: initialEntrant,
  category: initialCategory,
  allCategories,
  questions: initialQuestions,
  answers: initialAnswers,
  files: initialFiles,
  requirements: initialRequirements,
}: NominationWizardProps) {
  // Current Step initialized from application draft
  const [currentStep, setCurrentStep] = useState<number>(
    Math.min(Math.max(application.current_wizard_step || 1, 1), 7)
  );

  // Entrant profile state
  const [entrant, setEntrant] = useState<EntrantDetailsData>(initialEntrant);

  // Category state
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    application.category_id || initialCategory.id
  );
  const activeCategory =
    allCategories.find((c) => c.id === selectedCategoryId) || initialCategory;

  // Project details state
  const [projectData, setProjectData] = useState<ProjectDetailsData>({
    projectName: application.project_name,
    projectCity: application.project_city,
    projectState: application.project_state,
    projectCompletionDate: application.project_completion_date,
    builtUpAreaSqft: application.built_up_area_sqft,
  });

  // Questions and Answers state
  const [questions, setQuestions] = useState<DynamicQuestionItem[]>(initialQuestions);
  const [answers, setAnswers] = useState(initialAnswers);

  // Files state
  const [files, setFiles] = useState<FileItem[]>(initialFiles);

  // Save feedback state
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(new Date());
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Flash toast helper
  const showToast = (msg: string) => {
    setSaveToast(msg);
    setTimeout(() => setSaveToast(null), 3000);
  };

  // Scroll to top on step transition
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep]);

  // Explicit Save Draft handler
  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      const res = await saveWizardProgress({
        applicationId: application.id,
        step: currentStep,
        patch: {
          projectName: projectData.projectName,
          projectCity: projectData.projectCity,
          projectState: projectData.projectState,
          projectCompletionDate: projectData.projectCompletionDate,
          builtUpAreaSqft: projectData.builtUpAreaSqft,
          categoryId: selectedCategoryId,
        },
      });

      if (res.success) {
        setLastSavedAt(new Date());
        showToast("Draft saved successfully.");
      } else {
        showToast("Failed to save draft.");
      }
    } catch {
      showToast("Error saving draft.");
    } finally {
      setIsSaving(false);
    }
  };

  // Step 1: Entrant details confirmed
  const handleStep1Next = async () => {
    setCurrentStep(2);
    await saveWizardProgress({
      applicationId: application.id,
      step: 2,
    });
  };

  // Step 2: Category switch
  const handleCategoryChange = async (newCatId: string) => {
    setIsSaving(true);
    try {
      const res = await saveWizardProgress({
        applicationId: application.id,
        step: 2,
        patch: { categoryId: newCatId },
      });

      if (res.success) {
        setSelectedCategoryId(newCatId);
        setLastSavedAt(new Date());
        showToast("Category updated.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleStep2Next = async () => {
    setCurrentStep(3);
    await saveWizardProgress({
      applicationId: application.id,
      step: 3,
      patch: { categoryId: selectedCategoryId },
    });
  };

  // Step 3: Project details saved
  const handleStep3Save = async (data: ProjectDetailsData): Promise<boolean> => {
    setIsSaving(true);
    try {
      const res = await saveWizardProgress({
        applicationId: application.id,
        step: 3,
        patch: {
          projectName: data.projectName,
          projectCity: data.projectCity,
          projectState: data.projectState,
          projectCompletionDate: data.projectCompletionDate,
          builtUpAreaSqft: data.builtUpAreaSqft,
        },
      });

      if (res.success) {
        setProjectData(data);
        setLastSavedAt(new Date());
        return true;
      }
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleStep3Next = () => {
    setCurrentStep(4);
    saveWizardProgress({
      applicationId: application.id,
      step: 4,
    });
  };

  // Step 4: Questionnaire answers saved
  const handleStep4SaveAnswers = async (answerPayload: AnswerPayload[]): Promise<boolean> => {
    setIsSaving(true);
    try {
      const res = await saveWizardProgress({
        applicationId: application.id,
        step: 4,
        answers: answerPayload,
      });

      if (res.success) {
        setAnswers((prev) => {
          const map = new Map(prev.map((a) => [a.question_id, a]));
          answerPayload.forEach((p) => {
            map.set(p.questionId, {
              question_id: p.questionId,
              answer_text: p.answerText ?? null,
              answer_number: p.answerNumber ?? null,
              answer_json: p.answerJson ?? null,
            });
          });
          return Array.from(map.values());
        });
        setLastSavedAt(new Date());
        return true;
      }
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleStep4Next = () => {
    setCurrentStep(5);
    saveWizardProgress({
      applicationId: application.id,
      step: 5,
    });
  };

  // Step 5: Media next
  const handleStep5Next = () => {
    setCurrentStep(6);
    saveWizardProgress({
      applicationId: application.id,
      step: 6,
    });
  };

  // Step 6: Preview next
  const handleStep6Next = () => {
    setCurrentStep(7);
    saveWizardProgress({
      applicationId: application.id,
      step: 7,
    });
  };

  // Jump to step from preview
  const handleJumpToStep = (stepNumber: number) => {
    setCurrentStep(stepNumber);
  };

  return (
    <div className="min-h-screen bg-[#F4F1EA] pb-16">
      {/* Sticky Wizard Header & Progress Bar */}
      <WizardHeader
        currentStep={currentStep}
        totalSteps={7}
        stepLabels={WIZARD_STEP_LABELS}
        nominationId={application.nomination_id}
        categoryName={activeCategory.name}
        isSaving={isSaving}
        lastSavedAt={lastSavedAt}
        onSaveDraft={handleSaveDraft}
        onStepClick={(step) => setCurrentStep(step)}
      />

      {/* Floating Save Toast */}
      {saveToast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 bg-navy-900 text-gold-400 text-xs font-mono border border-gold-500/40 shadow-xl animate-in slide-in-from-bottom duration-200">
          {saveToast}
        </div>
      )}

      {/* MAIN STEP CONTENT CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 animate-in fade-in duration-200">
        {currentStep === 1 && (
          <Step1EntrantDetails
            entrant={entrant}
            onNext={handleStep1Next}
            onProfileUpdated={(updated) => setEntrant((prev) => ({ ...prev, ...updated }))}
          />
        )}

        {currentStep === 2 && (
          <Step2Category
            selectedCategoryId={selectedCategoryId}
            categories={allCategories}
            onCategoryChange={handleCategoryChange}
            onNext={handleStep2Next}
            onPrev={() => setCurrentStep(1)}
            isSaving={isSaving}
          />
        )}

        {currentStep === 3 && (
          <Step3ProjectDetails
            initialData={projectData}
            onSaveStep={handleStep3Save}
            onNext={handleStep3Next}
            onPrev={() => setCurrentStep(2)}
            isSaving={isSaving}
          />
        )}

        {currentStep === 4 && (
          <Step4DynamicQuestions
            categoryName={activeCategory.name}
            categoryCode={activeCategory.code}
            questions={questions}
            initialAnswers={answers}
            onSaveAnswers={handleStep4SaveAnswers}
            onNext={handleStep4Next}
            onPrev={() => setCurrentStep(3)}
            isSaving={isSaving}
          />
        )}

        {currentStep === 5 && (
          <Step5MediaDocuments
            applicationId={application.id}
            requirements={initialRequirements}
            initialFiles={files}
            onNext={handleStep5Next}
            onPrev={() => setCurrentStep(4)}
            isSaving={isSaving}
          />
        )}

        {currentStep === 6 && (
          <Step6Preview
            nominationId={application.nomination_id}
            entrant={entrant}
            category={activeCategory}
            project={projectData}
            questions={questions}
            answers={answers}
            files={files}
            isConfigurationPending={questions.length === 0 || initialRequirements.length === 0}
            onJumpToStep={handleJumpToStep}
            onNext={handleStep6Next}
            onPrev={() => setCurrentStep(5)}
            isSaving={isSaving}
          />
        )}

        {currentStep === 7 && (
          <Step7Declaration
            applicationId={application.id}
            nominationId={application.nomination_id}
            projectName={projectData.projectName}
            categoryName={activeCategory.name}
            isConfigurationPending={questions.length === 0 || initialRequirements.length === 0}
            onPrev={() => setCurrentStep(6)}
          />
        )}
      </main>

      {/* FOOTER STRIP */}
      <footer className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-6 border-t border-navy-900/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-slate-400">
        <div>
          <span>Kutchmitra Home & Decor Awards 2026 · Confidential Nomination Portal</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Official Evaluation Cycle</span>
          <span>·</span>
          <span>Draft autosaved to secure cloud</span>
        </div>
      </footer>
    </div>
  );
}
