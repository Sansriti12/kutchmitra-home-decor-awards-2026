"use client";

import React, { useState } from "react";
import { ArrowLeft, ArrowRight, Sparkles, AlertCircle, Info, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { QuestionFieldType } from "@/types/database.types";

export interface DynamicQuestionOption {
  id: string;
  label: string;
  value: string;
  display_order: number;
}

export interface DynamicQuestionItem {
  id: string;
  category_id: string;
  question_key: string;
  question_text: string;
  help_text: string | null;
  placeholder: string | null;
  field_type: QuestionFieldType;
  is_required: boolean;
  validation_rules: any | null;
  display_order: number;
  options?: DynamicQuestionOption[];
}

export interface AnswerPayload {
  questionId: string;
  answerText?: string | null;
  answerNumber?: number | null;
  answerJson?: any | null;
}

interface Step4DynamicQuestionsProps {
  categoryName: string;
  categoryCode: string;
  questions: DynamicQuestionItem[];
  initialAnswers: Array<{
    question_id: string;
    answer_text: string | null;
    answer_number: number | null;
    answer_json: any | null;
  }>;
  onSaveAnswers: (answers: AnswerPayload[]) => Promise<boolean>;
  onNext: () => void;
  onPrev: () => void;
  isSaving: boolean;
}

export default function Step4DynamicQuestions({
  categoryName,
  categoryCode,
  questions,
  initialAnswers,
  onSaveAnswers,
  onNext,
  onPrev,
  isSaving,
}: Step4DynamicQuestionsProps) {
  // Map initial answers into local state keyed by questionId
  const initialMap: Record<string, { text?: string; number?: number; json?: any }> = {};
  initialAnswers.forEach((ans) => {
    initialMap[ans.question_id] = {
      text: ans.answer_text ?? undefined,
      number: ans.answer_number ?? undefined,
      json: ans.answer_json ?? undefined,
    };
  });

  const [answersState, setAnswersState] = useState(initialMap);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleTextChange = (qId: string, val: string) => {
    setAnswersState((prev) => ({
      ...prev,
      [qId]: { ...prev[qId], text: val },
    }));
    if (errors[qId]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[qId];
        return copy;
      });
    }
  };

  const handleNumberChange = (qId: string, val: string) => {
    const num = val === "" ? undefined : parseFloat(val);
    setAnswersState((prev) => ({
      ...prev,
      [qId]: { ...prev[qId], number: num },
    }));
    if (errors[qId]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[qId];
        return copy;
      });
    }
  };

  const handleCheckboxToggle = (qId: string, optionValue: string) => {
    const currentList: string[] = Array.isArray(answersState[qId]?.json)
      ? answersState[qId]?.json
      : [];

    let updated: string[];
    if (currentList.includes(optionValue)) {
      updated = currentList.filter((v) => v !== optionValue);
    } else {
      updated = [...currentList, optionValue];
    }

    setAnswersState((prev) => ({
      ...prev,
      [qId]: { ...prev[qId], json: updated },
    }));
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    for (const q of questions) {
      if (q.is_required) {
        const ans = answersState[q.id];
        if (q.field_type === "number") {
          if (ans?.number === undefined || ans?.number === null || isNaN(ans.number)) {
            errs[q.id] = "This numerical answer is required.";
          }
        } else if (q.field_type === "checkbox") {
          if (!ans?.json || !Array.isArray(ans.json) || ans.json.length === 0) {
            errs[q.id] = "Please select at least one option.";
          }
        } else {
          if (!ans?.text || ans.text.trim() === "") {
            errs[q.id] = "This question requires an answer.";
          }
        }
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      // Build payload
      const payload: AnswerPayload[] = questions.map((q) => {
        const ans = answersState[q.id];
        return {
          questionId: q.id,
          answerText: ans?.text ?? null,
          answerNumber: ans?.number ?? null,
          answerJson: ans?.json ?? null,
        };
      });

      const ok = await onSaveAnswers(payload);
      if (ok) {
        onNext();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
      {/* Title & Guidance Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-gold-800 bg-gold-500/15 px-2.5 py-0.5 border border-gold-500/30 font-semibold inline-block">
            Step 04 of 07
          </span>
          <span className="text-slate-400 font-mono text-xs">/</span>
          <span className="text-xs font-mono uppercase tracking-wider text-slate-500 font-medium">
            Category Questionnaire
          </span>
        </div>
        <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl text-navy-900 font-medium tracking-tight">
          Category-Specific Questionnaire
        </h2>
        <p className="text-sm text-[#4A4F5C] leading-relaxed max-w-2xl">
          Dynamic evaluation criteria questions configured for{" "}
          <strong className="text-navy-900 font-semibold">#{categoryCode} — {categoryName}</strong>.
        </p>
      </div>

      {/* When 0 questions are configured: Graceful advisory notice */}
      {questions.length === 0 ? (
        <div className="bg-[#FBFAF7] border-2 border-amber-300/70 p-8 sm:p-10 text-center space-y-5 shadow-card">
          <div className="inline-flex p-3 rounded-full bg-amber-50 border border-amber-200 text-amber-700 shadow-2xs">
            <Sparkles size={28} />
          </div>
          <div className="max-w-lg mx-auto space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-amber-800 bg-amber-100 px-3 py-0.5 border border-amber-300/80 font-bold inline-block">
              Category Questionnaire
            </span>
            <h3 className="font-display text-2xl sm:text-3xl text-navy-900 font-bold">
              Official questions are being finalized.
            </h3>
            <p className="text-xs text-[#4A4F5C] leading-relaxed">
              The Awards Committee has not yet published the official evaluation questionnaire for this category. Your draft can still be completed and saved.
            </p>
          </div>
          <div className="p-4 bg-amber-50/80 border border-amber-200/90 max-w-xl mx-auto text-left text-xs text-amber-950 font-mono flex items-start gap-3 shadow-2xs">
            <Info size={16} className="text-amber-700 flex-shrink-0 mt-0.5" />
            <span className="leading-relaxed">
              Final submission will become available once the official category configuration is published.
            </span>
          </div>
        </div>
      ) : (
        /* When dynamic questions exist: Render according to field_type */
        <div className="bg-[#FBFAF7] border border-navy-900/10 p-6 sm:p-8 shadow-card space-y-6">
          {questions.map((q, idx) => {
            const currentVal = answersState[q.id];
            const hasError = !!errors[q.id];

            return (
              <div
                key={q.id}
                className={`space-y-2 pb-6 ${idx < questions.length - 1 ? "border-b border-navy-900/10" : ""}`}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <label className="block text-sm font-display text-navy-900 font-semibold">
                    {q.question_text}
                    {q.is_required && <span className="text-rose-600 font-bold ml-1">*</span>}
                  </label>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                    {q.is_required ? "Required" : "Optional"}
                  </span>
                </div>

                {q.help_text && (
                  <p className="text-xs text-[#4A4F5C]">{q.help_text}</p>
                )}

                {/* TEXT / URL INPUT */}
                {(q.field_type === "text" || q.field_type === "url") && (
                  <input
                    type={q.field_type === "url" ? "url" : "text"}
                    value={currentVal?.text || ""}
                    onChange={(e) => handleTextChange(q.id, e.target.value)}
                    placeholder={q.placeholder || ""}
                    className={`w-full px-4 py-2.5 border bg-white text-navy-900 focus:outline-none transition-colors text-sm ${
                      hasError ? "border-rose-500" : "border-navy-900/20 focus:border-gold-500"
                    }`}
                  />
                )}

                {/* TEXTAREA INPUT */}
                {q.field_type === "textarea" && (
                  <textarea
                    rows={4}
                    value={currentVal?.text || ""}
                    onChange={(e) => handleTextChange(q.id, e.target.value)}
                    placeholder={q.placeholder || ""}
                    className={`w-full px-4 py-2.5 border bg-white text-navy-900 focus:outline-none transition-colors text-sm ${
                      hasError ? "border-rose-500" : "border-navy-900/20 focus:border-gold-500"
                    }`}
                  />
                )}

                {/* NUMBER INPUT */}
                {q.field_type === "number" && (
                  <input
                    type="number"
                    value={currentVal?.number ?? ""}
                    onChange={(e) => handleNumberChange(q.id, e.target.value)}
                    placeholder={q.placeholder || ""}
                    className={`w-full px-4 py-2.5 border bg-white text-navy-900 focus:outline-none transition-colors text-sm ${
                      hasError ? "border-rose-500" : "border-navy-900/20 focus:border-gold-500"
                    }`}
                  />
                )}

                {/* DATE INPUT */}
                {q.field_type === "date" && (
                  <input
                    type="date"
                    value={currentVal?.text || ""}
                    onChange={(e) => handleTextChange(q.id, e.target.value)}
                    className={`w-full px-4 py-2.5 border bg-white text-navy-900 focus:outline-none transition-colors text-sm ${
                      hasError ? "border-rose-500" : "border-navy-900/20 focus:border-gold-500"
                    }`}
                  />
                )}

                {/* SELECT DROPDOWN */}
                {q.field_type === "select" && (
                  <select
                    value={currentVal?.text || ""}
                    onChange={(e) => handleTextChange(q.id, e.target.value)}
                    className={`w-full px-4 py-2.5 border bg-white text-navy-900 focus:outline-none transition-colors text-sm ${
                      hasError ? "border-rose-500" : "border-navy-900/20 focus:border-gold-500"
                    }`}
                  >
                    <option value="">-- Select an option --</option>
                    {q.options?.map((opt) => (
                      <option key={opt.id} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                )}

                {/* RADIO BUTTONS */}
                {q.field_type === "radio" && (
                  <div className="space-y-2 pt-1">
                    {q.options?.map((opt) => (
                      <label
                        key={opt.id}
                        className="flex items-center gap-2.5 cursor-pointer text-xs text-navy-900 font-medium"
                      >
                        <input
                          type="radio"
                          name={`radio_${q.id}`}
                          value={opt.value}
                          checked={currentVal?.text === opt.value}
                          onChange={(e) => handleTextChange(q.id, e.target.value)}
                          className="accent-navy-900"
                        />
                        <span>{opt.label}</span>
                      </label>
                    ))}
                  </div>
                )}

                {/* CHECKBOXES (MULTI-SELECT) */}
                {q.field_type === "checkbox" && (
                  <div className="space-y-2 pt-1">
                    {q.options?.map((opt) => {
                      const selectedList = Array.isArray(currentVal?.json) ? currentVal.json : [];
                      const isChecked = selectedList.includes(opt.value);

                      return (
                        <label
                          key={opt.id}
                          className="flex items-center gap-2.5 cursor-pointer text-xs text-navy-900 font-medium"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleCheckboxToggle(q.id, opt.value)}
                            className="accent-navy-900 rounded"
                          />
                          <span>{opt.label}</span>
                        </label>
                      );
                    })}
                  </div>
                )}

                {hasError && (
                  <p className="text-xs text-rose-600 font-mono flex items-center gap-1 mt-1">
                    <AlertCircle size={12} /> {errors[q.id]}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-navy-900/10">
        <Button
          type="button"
          onClick={onPrev}
          variant="outline-dark"
          size="md"
          icon={<ArrowLeft size={14} />}
        >
          Previous: Project Details
        </Button>
        <Button
          type="submit"
          variant="primary"
          size="md"
          icon={<ArrowRight size={14} />}
          disabled={isSaving || submitting}
        >
          {submitting
            ? "Saving..."
            : questions.length === 0
            ? "Continue to Media & Documents"
            : "Save & Continue to Media"}
        </Button>
      </div>
    </form>
  );
}
