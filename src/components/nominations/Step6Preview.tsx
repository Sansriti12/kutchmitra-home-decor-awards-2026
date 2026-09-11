"use client";

import React from "react";
import {
  ArrowLeft,
  ArrowRight,
  Edit3,
  User,
  Building2,
  MapPin,
  Calendar,
  Maximize2,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { EntrantDetailsData } from "./Step1EntrantDetails";
import type { CategoryOption } from "./Step2Category";
import type { ProjectDetailsData } from "./Step3ProjectDetails";
import type { DynamicQuestionItem } from "./Step4DynamicQuestions";
import type { FileItem } from "./Step5MediaDocuments";

interface Step6PreviewProps {
  nominationId: string;
  entrant: EntrantDetailsData;
  category: CategoryOption;
  project: ProjectDetailsData;
  questions: DynamicQuestionItem[];
  answers: Array<{
    question_id: string;
    answer_text: string | null;
    answer_number: number | null;
    answer_json: any | null;
  }>;
  files: FileItem[];
  isConfigurationPending?: boolean;
  onJumpToStep: (stepNumber: number) => void;
  onNext: () => void;
  onPrev: () => void;
  isSaving: boolean;
}

export default function Step6Preview({
  nominationId,
  entrant,
  category,
  project,
  questions,
  answers,
  files,
  isConfigurationPending = false,
  onJumpToStep,
  onNext,
  onPrev,
  isSaving,
}: Step6PreviewProps) {
  // Answers map
  const answersMap = new Map<string, { text?: string | null; number?: number | null; json?: any }>();
  answers.forEach((a) => answersMap.set(a.question_id, { text: a.answer_text, number: a.answer_number, json: a.answer_json }));

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Title & Guidance Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-gold-800 bg-gold-500/15 px-2.5 py-0.5 border border-gold-500/30 font-semibold inline-block">
            Step 06 of 07
          </span>
          <span className="text-slate-400 font-mono text-xs">/</span>
          <span className="text-xs font-mono uppercase tracking-wider text-slate-500 font-medium">
            Dossier Review
          </span>
        </div>
        <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl text-navy-900 font-medium tracking-tight">
          Complete Nomination Dossier Preview
        </h2>
        <p className="text-sm text-[#4A4F5C] leading-relaxed max-w-2xl">
          Carefully review all entrant credentials, category rules, project data, and attached documentation.
          Click any <strong className="text-navy-900 font-mono font-semibold">"Edit Step"</strong> button to adjust specific details before the final declaration.
        </p>
      </div>

      {/* Configuration Pending Notice if questions/uploads are 0 */}
      {isConfigurationPending && (
        <div className="p-4 bg-amber-50 border-2 border-amber-300/80 text-xs text-amber-950 font-mono flex items-start gap-3 shadow-2xs">
          <Sparkles size={18} className="text-amber-700 flex-shrink-0 mt-0.5" />
          <div className="space-y-1 leading-relaxed">
            <strong className="block text-amber-900 font-bold uppercase tracking-wider text-xs">
              Submission Readiness: Pending Official Category Ratification
            </strong>
            <p className="text-xs text-[#4A4F5C] font-sans">
              Official category questionnaire and upload requirements for this category have not yet been published by the organizing committee. Your draft details are securely preserved, and final submission will unlock once official configuration is released.
            </p>
          </div>
        </div>
      )}

      {/* HEADER BANNER: Nomination ID & Status */}
      <div className="bg-[#FBFAF7] border-2 border-navy-900/15 p-6 sm:p-8 shadow-card flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="font-mono text-xs font-bold text-navy-900 bg-white border border-navy-900/15 px-3 py-1 tracking-wider shadow-2xs">
              {nominationId}
            </span>
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-800 bg-amber-50 px-2.5 py-1 border border-amber-200/80 font-semibold shadow-2xs">
              Draft Dossier Review
            </span>
          </div>
          <h3 className="font-display text-2xl sm:text-3xl text-navy-900 font-bold tracking-tight pt-1">
            {project.projectName || "Untitled Project Entry"}
          </h3>
          <p className="text-xs text-[#4A4F5C] font-mono">
            #{category.code} — {category.name}
          </p>
        </div>

        <div className="sm:border-l sm:border-navy-900/10 sm:pl-8 text-xs text-[#4A4F5C] space-y-1.5 flex-shrink-0">
          <span className="font-mono text-[10px] text-slate-400 uppercase tracking-widest block">Awards Cycle</span>
          <span className="font-display font-semibold text-navy-900 text-sm block">2026 Inaugural Edition</span>
          {isConfigurationPending ? (
            <span className="inline-block text-[11px] font-mono text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 font-semibold">
              Config Pending
            </span>
          ) : (
            <span className="inline-block text-[11px] font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 font-semibold">
              Ready for Declaration
            </span>
          )}
        </div>
      </div>

      {/* SECTION 1: ENTRANT / APPLICANT PROFILE */}
      <div className="bg-[#FBFAF7] border border-navy-900/10 p-6 sm:p-8 shadow-card space-y-5">
        <div className="flex items-center justify-between border-b border-navy-900/10 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-xs font-bold text-gold-700 bg-gold-500/10 px-2 py-0.5 border border-gold-500/20">
              01
            </span>
            <h4 className="font-display text-lg text-navy-900 font-semibold flex items-center gap-2">
              <User size={16} className="text-gold-600" />
              <span>Entrant & Practice Profile</span>
            </h4>
          </div>
          <button
            type="button"
            onClick={() => onJumpToStep(1)}
            className="inline-flex items-center gap-1.5 text-xs font-mono text-navy-900 hover:text-gold-700 uppercase tracking-wider font-semibold transition-colors px-2.5 py-1 border border-navy-900/10 bg-white hover:bg-slate-50"
          >
            <Edit3 size={12} />
            <span>Edit Step 1</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-white border border-navy-900/5 shadow-2xs">
            <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider block">Entrant Name</span>
            <span className="font-medium text-navy-900 text-sm">{entrant.fullName}</span>
          </div>
          <div className="p-3 bg-white border border-navy-900/5 shadow-2xs">
            <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider block">Designation / Role</span>
            <span className="font-medium text-navy-900 text-sm">{entrant.designation || "Architect / Designer"}</span>
          </div>
          <div className="p-3 bg-white border border-navy-900/5 shadow-2xs">
            <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider block">Practice / Studio</span>
            <span className="font-medium text-navy-900 text-sm">{entrant.organizationName || "Independent Practice"}</span>
          </div>
          <div className="p-3 bg-white border border-navy-900/5 shadow-2xs">
            <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider block">Contact Email</span>
            <span className="font-medium text-navy-900 text-sm">{entrant.email}</span>
          </div>
          <div className="p-3 bg-white border border-navy-900/5 shadow-2xs">
            <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider block">Phone / Mobile</span>
            <span className="font-medium text-navy-900 text-sm">{entrant.phone || "Not specified"}</span>
          </div>
          <div className="p-3 bg-white border border-navy-900/5 shadow-2xs">
            <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider block">Studio Location</span>
            <span className="font-medium text-navy-900 text-sm">{entrant.city}, {entrant.state}</span>
          </div>
        </div>
      </div>

      {/* SECTION 2: AWARD CATEGORY */}
      <div className="bg-[#FBFAF7] border border-navy-900/10 p-6 sm:p-8 shadow-card space-y-5">
        <div className="flex items-center justify-between border-b border-navy-900/10 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-xs font-bold text-gold-700 bg-gold-500/10 px-2 py-0.5 border border-gold-500/20">
              02
            </span>
            <h4 className="font-display text-lg text-navy-900 font-semibold flex items-center gap-2">
              <Sparkles size={16} className="text-gold-600" />
              <span>Award Category</span>
            </h4>
          </div>
          <button
            type="button"
            onClick={() => onJumpToStep(2)}
            className="inline-flex items-center gap-1.5 text-xs font-mono text-navy-900 hover:text-gold-700 uppercase tracking-wider font-semibold transition-colors px-2.5 py-1 border border-navy-900/10 bg-white hover:bg-slate-50"
          >
            <Edit3 size={12} />
            <span>Edit Step 2</span>
          </button>
        </div>

        <div className="space-y-2 text-xs bg-white p-4 border border-navy-900/5 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-navy-900 bg-navy-900/5 px-2.5 py-0.5 border border-navy-900/10">
              Category #{category.code}
            </span>
            <span className="font-display text-lg text-navy-900 font-bold">
              {category.name}
            </span>
          </div>
          <p className="text-[#4A4F5C] leading-relaxed pt-1">
            {category.short_description}
          </p>
        </div>
      </div>

      {/* SECTION 3: PROJECT METADATA */}
      <div className="bg-[#FBFAF7] border border-navy-900/10 p-6 sm:p-8 shadow-card space-y-5">
        <div className="flex items-center justify-between border-b border-navy-900/10 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-xs font-bold text-gold-700 bg-gold-500/10 px-2 py-0.5 border border-gold-500/20">
              03
            </span>
            <h4 className="font-display text-lg text-navy-900 font-semibold flex items-center gap-2">
              <Building2 size={16} className="text-gold-600" />
              <span>Project Details</span>
            </h4>
          </div>
          <button
            type="button"
            onClick={() => onJumpToStep(3)}
            className="inline-flex items-center gap-1.5 text-xs font-mono text-navy-900 hover:text-gold-700 uppercase tracking-wider font-semibold transition-colors px-2.5 py-1 border border-navy-900/10 bg-white hover:bg-slate-50"
          >
            <Edit3 size={12} />
            <span>Edit Step 3</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-white border border-navy-900/5 shadow-2xs">
            <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider block">Official Project Name</span>
            <span className="font-medium text-navy-900 text-sm">{project.projectName || "Pending"}</span>
          </div>
          <div className="p-3 bg-white border border-navy-900/5 shadow-2xs">
            <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider block">Project Site Location</span>
            <span className="font-medium text-navy-900 text-sm">{project.projectCity}, {project.projectState}</span>
          </div>
          <div className="p-3 bg-white border border-navy-900/5 shadow-2xs">
            <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider block">Completion Date</span>
            <span className="font-medium text-navy-900 text-sm">
              {project.projectCompletionDate
                ? new Date(project.projectCompletionDate).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "Not specified"}
            </span>
          </div>
          <div className="p-3 bg-white border border-navy-900/5 shadow-2xs">
            <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider block">Built-up Area</span>
            <span className="font-medium text-navy-900 text-sm">
              {project.builtUpAreaSqft ? `${project.builtUpAreaSqft} Sq. Ft.` : "Not specified"}
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 4: QUESTIONNAIRE RESPONSES */}
      <div className="bg-[#FBFAF7] border border-navy-900/10 p-6 sm:p-8 shadow-card space-y-5">
        <div className="flex items-center justify-between border-b border-navy-900/10 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-xs font-bold text-gold-700 bg-gold-500/10 px-2 py-0.5 border border-gold-500/20">
              04
            </span>
            <h4 className="font-display text-lg text-navy-900 font-semibold flex items-center gap-2">
              <FileText size={16} className="text-gold-600" />
              <span>Category Questionnaire</span>
            </h4>
          </div>
          <button
            type="button"
            onClick={() => onJumpToStep(4)}
            className="inline-flex items-center gap-1.5 text-xs font-mono text-navy-900 hover:text-gold-700 uppercase tracking-wider font-semibold transition-colors px-2.5 py-1 border border-navy-900/10 bg-white hover:bg-slate-50"
          >
            <Edit3 size={12} />
            <span>Edit Step 4</span>
          </button>
        </div>

        {questions.length === 0 ? (
          <div className="p-4 bg-white border border-dashed border-navy-900/15 text-xs text-slate-500 italic">
            No dynamic category criteria questions were configured for #{category.code} — {category.name}. (Official questionnaire configuration pending committee release).
          </div>
        ) : (
          <div className="space-y-3.5 text-xs">
            {questions.map((q) => {
              const ans = answersMap.get(q.id);
              const displayVal =
                ans?.text ||
                (ans?.number !== undefined && ans.number !== null ? String(ans.number) : null) ||
                (Array.isArray(ans?.json) ? ans.json.join(", ") : null);

              return (
                <div key={q.id} className="space-y-1 p-3 bg-white border border-navy-900/5 shadow-2xs">
                  <span className="font-medium text-navy-900 block text-xs">{q.question_text}</span>
                  <div className="text-slate-700 font-mono text-xs pt-0.5">
                    {displayVal || <span className="text-slate-400 italic font-sans">No answer provided</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 5: ATTACHED MEDIA & DRAWINGS */}
      <div className="bg-[#FBFAF7] border border-navy-900/10 p-6 sm:p-8 shadow-card space-y-5">
        <div className="flex items-center justify-between border-b border-navy-900/10 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-xs font-bold text-gold-700 bg-gold-500/10 px-2 py-0.5 border border-gold-500/20">
              05
            </span>
            <h4 className="font-display text-lg text-navy-900 font-semibold flex items-center gap-2">
              <ImageIcon size={16} className="text-gold-600" />
              <span>Attached Media & Drawings ({files.length} Files)</span>
            </h4>
          </div>
          <button
            type="button"
            onClick={() => onJumpToStep(5)}
            className="inline-flex items-center gap-1.5 text-xs font-mono text-navy-900 hover:text-gold-700 uppercase tracking-wider font-semibold transition-colors px-2.5 py-1 border border-navy-900/10 bg-white hover:bg-slate-50"
          >
            <Edit3 size={12} />
            <span>Edit Step 5</span>
          </button>
        </div>

        {files.length === 0 ? (
          <div className="p-4 bg-white border border-dashed border-navy-900/15 text-xs text-slate-500 italic">
            No files attached yet. You may upload architectural drawings, floor plans, or photography by returning to Step 5.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
            {files.map((file) => (
              <div key={file.id} className="p-3.5 bg-white border border-navy-900/10 flex items-start gap-3 shadow-2xs">
                <FileText size={18} className="text-gold-600 flex-shrink-0 mt-0.5" />
                <div className="overflow-hidden">
                  <p className="font-medium text-navy-900 truncate text-xs">{file.original_filename}</p>
                  <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">{file.upload_type}</p>
                  {file.caption && (
                    <p className="text-[11px] text-[#4A4F5C] italic mt-1 leading-snug">"{file.caption}"</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-navy-900/10">
        <Button
          type="button"
          onClick={onPrev}
          variant="outline-dark"
          size="md"
          icon={<ArrowLeft size={14} />}
        >
          Previous: Media & Documents
        </Button>
        <Button
          type="button"
          onClick={onNext}
          variant="primary"
          size="md"
          icon={<ArrowRight size={14} />}
          disabled={isSaving}
        >
          Proceed to Declaration & Submit
        </Button>
      </div>
    </div>
  );
}
