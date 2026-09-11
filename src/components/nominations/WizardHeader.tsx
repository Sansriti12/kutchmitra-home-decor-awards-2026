"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Save, Check, Loader2 } from "lucide-react";

export interface WizardHeaderProps {
  currentStep: number;
  totalSteps?: number;
  stepLabels?: Record<number, string>;
  nominationId: string;
  categoryName?: string;
  isSaving: boolean;
  lastSavedAt: Date | null;
  onSaveDraft: () => void;
  onStepClick: (step: number) => void;
  canNavigateToStep?: (step: number) => boolean;
}

const COMPACT_STEP_NAMES: Record<number, string> = {
  1: "Entrant",
  2: "Category",
  3: "Project",
  4: "Questions",
  5: "Media",
  6: "Review",
  7: "Submit",
};

export default function WizardHeader({
  currentStep,
  totalSteps = 7,
  nominationId,
  categoryName,
  isSaving,
  lastSavedAt,
  onSaveDraft,
  onStepClick,
  canNavigateToStep = () => true,
}: WizardHeaderProps) {
  const progressPercent = Math.round(((currentStep - 1) / (totalSteps - 1)) * 100);

  return (
    <header className="bg-[#FBFAF7] border-b border-navy-900/10 sticky top-0 z-30 shadow-xs backdrop-blur-md bg-opacity-95">
      {/* TOP STRIP: Navigation, Nomination Metadata & Save Action */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Exit Link & Identifiers */}
        <div className="flex items-center gap-3 flex-wrap">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-500 hover:text-navy-900 transition-colors"
            title="Return to Applicant Dashboard"
          >
            <ArrowLeft size={13} />
            <span className="font-medium">Dashboard</span>
          </Link>
          <span className="text-slate-300 font-mono">/</span>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs font-bold text-navy-900 bg-white border border-navy-900/15 px-2.5 py-0.5 tracking-wider shadow-2xs">
              {nominationId}
            </span>
            {categoryName && (
              <span className="text-[11px] font-mono text-gold-800 bg-gold-500/10 px-2.5 py-0.5 border border-gold-500/25 font-semibold truncate max-w-[240px]">
                {categoryName}
              </span>
            )}
            <span className="text-[10px] font-mono uppercase tracking-widest text-amber-800 bg-amber-50 px-2 py-0.5 border border-amber-200/80 font-medium">
              Draft
            </span>
          </div>
        </div>

        {/* Right: Step Counter & Save Draft Action */}
        <div className="flex items-center gap-3 ml-auto">
          {lastSavedAt && !isSaving && (
            <span className="hidden sm:inline text-[11px] font-mono text-slate-400">
              Saved {lastSavedAt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}

          <button
            type="button"
            onClick={onSaveDraft}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase tracking-wider bg-white hover:bg-slate-50 border border-navy-900/15 text-navy-900 transition-colors disabled:opacity-50 shadow-2xs cursor-pointer"
            title="Save your nomination progress anytime"
          >
            {isSaving ? (
              <>
                <Loader2 size={12} className="animate-spin text-gold-600" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save size={12} className="text-gold-600" />
                <span>Save Draft</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* COMPACT PROGRESS STEPPER */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-3 pt-1">
        {/* Progress Meta: Step X of 7, Current Title, and Percentage */}
        <div className="flex items-center justify-between text-xs font-mono mb-2">
          <span className="text-slate-600 flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-navy-900">Step {currentStep} of {totalSteps}:</span>
            <span className="text-gold-700 font-medium">
              {COMPACT_STEP_NAMES[currentStep] || `Step ${currentStep}`}
            </span>
          </span>
          <span className="text-[11px] font-semibold text-navy-900 bg-white border border-navy-900/10 px-2 py-0.5 shadow-2xs">
            {progressPercent}% Completed
          </span>
        </div>

        {/* 7-Segment Progress Track */}
        <div className="grid grid-cols-7 gap-1.5 mb-2.5" aria-hidden="true">
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((stepNum) => {
            const isSegActive = stepNum === currentStep;
            const isSegCompleted = stepNum < currentStep;

            return (
              <div
                key={`seg-${stepNum}`}
                className={`h-1 rounded-full transition-all duration-300 ${
                  isSegActive
                    ? "bg-gold-500 shadow-2xs"
                    : isSegCompleted
                    ? "bg-emerald-600"
                    : "bg-navy-900/10"
                }`}
              />
            );
          })}
        </div>

        {/* Stepper Buttons (Horizontal scroll on mobile with touch snapping) */}
        <nav
          aria-label="Nomination Progress"
          className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none snap-x"
        >
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((stepNum) => {
            const isActive = stepNum === currentStep;
            const isCompleted = stepNum < currentStep;
            const isClickable = canNavigateToStep(stepNum);
            const stepLabel = COMPACT_STEP_NAMES[stepNum] || `Step ${stepNum}`;

            return (
              <button
                key={stepNum}
                type="button"
                onClick={() => isClickable && onStepClick(stepNum)}
                disabled={!isClickable}
                aria-current={isActive ? "step" : undefined}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono whitespace-nowrap transition-all border rounded-xs snap-start ${
                  isActive
                    ? "bg-navy-900 text-gold-400 border-navy-900 ring-1 ring-gold-500/50 shadow-sm font-semibold"
                    : isCompleted
                    ? "bg-emerald-50 text-emerald-900 border-emerald-300/80 hover:border-emerald-500 font-medium"
                    : isClickable
                    ? "bg-white text-slate-700 border-navy-900/15 hover:border-gold-500/50 hover:bg-slate-50"
                    : "bg-slate-50 text-slate-400 border-slate-200 opacity-60 cursor-not-allowed"
                } ${isClickable ? "cursor-pointer" : "cursor-not-allowed"}`}
              >
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isActive
                      ? "bg-gold-500 text-navy-950"
                      : isCompleted
                      ? "bg-emerald-600 text-white"
                      : isClickable
                      ? "bg-slate-100 text-slate-600 border border-slate-300"
                      : "bg-slate-200 text-slate-400"
                  }`}
                >
                  {isCompleted ? <Check size={10} strokeWidth={3} /> : stepNum}
                </span>
                <span className="tracking-wide">{stepLabel}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
