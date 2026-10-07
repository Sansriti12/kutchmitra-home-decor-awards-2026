"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Scale,
  Shield,
  FileText,
  Image as ImageIcon,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Save,
  Send,
  Eye,
  Download,
  Calendar,
  MapPin,
  Maximize2,
  Clock,
  Sparkles,
  Info,
  Check,
} from "lucide-react";
import {
  cn,
  formatDeterministicDate,
  formatDeterministicDateTime,
  formatDeterministicNumber,
} from "@/lib/utils";
import {
  saveJuryEvaluationDraft,
  submitJuryEvaluation,
  declareJuryConflict,
} from "@/lib/jury/actions";
import type {
  JuryApplicationDossier,
  QualitativeRating,
  JuryRecommendation,
  CriterionScorePayload,
} from "@/types/jury.types";

interface JuryDossierClientProps {
  dossier: JuryApplicationDossier;
}

export default function JuryDossierClient({ dossier }: JuryDossierClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const { assignment, application, questions, answers, files, criteria, evaluation } = dossier;

  const [activeTab, setActiveTab] = useState<"dossier" | "evaluation">("dossier");

  // Evaluation Form State
  const initialScores: Record<string, { rating: QualitativeRating; comment: string }> = {};
  criteria.forEach((c) => {
    const existingScore = evaluation?.scores.find((s) => s.criterionId === c.id);
    initialScores[c.id] = {
      rating: existingScore?.qualitativeRating || "",
      comment: existingScore?.confidentialComment || "",
    };
  });

  const [scores, setScores] = useState(initialScores);
  const [generalComment, setGeneralComment] = useState(evaluation?.generalComment || "");
  const [strengths, setStrengths] = useState(evaluation?.strengths || "");
  const [areasOfConcern, setAreasOfConcern] = useState(evaluation?.areasOfConcern || "");
  const [recommendation, setRecommendation] = useState<JuryRecommendation>(
    evaluation?.recommendation || ""
  );

  // Lock status
  const isLocked = evaluation?.isLocked || false;
  const isConflict = assignment.conflictDeclared;

  // Modals & previews
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [conflictReasonInput, setConflictReasonInput] = useState(assignment.conflictReason || "");
  const [conflictDeclaringMode, setConflictDeclaringMode] = useState(true);

  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Save Draft Handler
  const handleSaveDraft = () => {
    setFeedback(null);

    const criterionScores: CriterionScorePayload[] = criteria.map((c) => ({
      criterionId: c.id,
      qualitativeRating: scores[c.id]?.rating || "",
      score: 0,
      confidentialComment: scores[c.id]?.comment || "",
    }));

    startTransition(async () => {
      const res = await saveJuryEvaluationDraft(assignment.id, {
        generalComment,
        strengths,
        areasOfConcern,
        recommendation,
        criterionScores,
      });

      if (res.success) {
        setFeedback({ type: "success", text: "Evaluation draft saved successfully. You may return anytime." });
        router.refresh();
      } else {
        setFeedback({ type: "error", text: res.error || "Failed to save draft." });
      }
    });
  };

  // Submit Final Evaluation Handler
  const handleSubmitEvaluation = () => {
    setFeedback(null);

    const criterionScores: CriterionScorePayload[] = criteria.map((c) => ({
      criterionId: c.id,
      qualitativeRating: scores[c.id]?.rating || "",
      score: 0,
      confidentialComment: scores[c.id]?.comment || "",
    }));

    // Client-side validation
    const missingRating = criterionScores.some((cs) => !cs.qualitativeRating);
    if (missingRating) {
      setFeedback({
        type: "error",
        text: "Please select a qualitative assessment rating for each of the 5 criteria before final submission.",
      });
      setShowSubmitModal(false);
      return;
    }

    if (!recommendation) {
      setFeedback({
        type: "error",
        text: "Please select an overall Jury recommendation before submitting.",
      });
      setShowSubmitModal(false);
      return;
    }

    startTransition(async () => {
      const res = await submitJuryEvaluation(assignment.id, {
        generalComment,
        strengths,
        areasOfConcern,
        recommendation,
        criterionScores,
      });

      if (res.success) {
        setShowSubmitModal(false);
        setFeedback({
          type: "success",
          text: "Evaluation submitted and permanently locked. Thank you for your confidential assessment.",
        });
        router.refresh();
      } else {
        setFeedback({ type: "error", text: res.error || "Failed to submit evaluation." });
        setShowSubmitModal(false);
      }
    });
  };

  // Conflict Handler
  const handleConflictToggle = (e: React.FormEvent) => {
    e.preventDefault();
    if (conflictDeclaringMode && !conflictReasonInput.trim()) {
      alert("Please provide an explanatory reason for the conflict of interest.");
      return;
    }

    startTransition(async () => {
      const res = await declareJuryConflict(
        assignment.id,
        conflictDeclaringMode,
        conflictDeclaringMode ? conflictReasonInput : undefined
      );

      if (res.success) {
        setShowConflictModal(false);
        setFeedback({
          type: "success",
          text: conflictDeclaringMode
            ? "Conflict of interest declared. Evaluation controls have been disabled."
            : "No conflict confirmed. You may now evaluate this entry.",
        });
        router.refresh();
      } else {
        setFeedback({ type: "error", text: res.error || "Failed to update conflict status." });
      }
    });
  };

  return (
    <div className="min-h-screen bg-navy-950 text-slate-200">
      {/* Top Breadcrumb & Status Bar */}
      <header className="sticky top-0 z-30 bg-navy-950/95 backdrop-blur-md border-b border-white/10 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/jury/portal"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-gold-400 transition-colors"
          >
            <ArrowLeft size={13} />
            <span>Jury Portal</span>
          </Link>
          <span className="text-slate-600">/</span>
          <span className="text-xs font-mono text-gold-400 font-bold tracking-wider">
            {application.nominationId}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {isConflict ? (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono uppercase bg-red-950 border border-red-500/50 text-red-300 font-bold">
              <AlertTriangle size={12} />
              <span>Conflict Declared</span>
            </div>
          ) : isLocked ? (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono uppercase bg-emerald-950 border border-emerald-500/50 text-emerald-300 font-bold">
              <Lock size={12} />
              <span>Evaluation Locked &amp; Submitted</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono uppercase bg-amber-950/80 border border-amber-500/40 text-amber-300">
              <Clock size={12} />
              <span>Draft Assessment</span>
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              setConflictDeclaringMode(!isConflict);
              setShowConflictModal(true);
            }}
            className="text-[11px] font-mono text-slate-400 hover:text-white px-2.5 py-1 bg-navy-900 border border-white/10 rounded transition-colors"
          >
            {isConflict ? "Review Conflict" : "Declare Conflict"}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-6 space-y-6">
        {/* Project Header Banner */}
        <div className="bg-navy-900/90 border border-white/10 p-6 space-y-4 relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[11px] font-mono text-gold-400 uppercase tracking-wider">
                <span>Category {application.category?.code}</span>
                <span>//</span>
                <span>{application.category?.name}</span>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl text-white font-medium">
                {application.projectName}
              </h1>
              <div className="flex items-center gap-4 text-xs font-mono text-slate-400 pt-1">
                <span className="flex items-center gap-1">
                  <MapPin size={12} className="text-slate-500" />
                  {application.projectCity}, {application.projectState}
                </span>
                {application.builtUpAreaSqft && (
                  <span>Area: {formatDeterministicNumber(application.builtUpAreaSqft)} sq.ft.</span>
                )}
                {application.projectCompletionDate && (
                  <span className="flex items-center gap-1">
                    <Calendar size={12} className="text-slate-500" />
                    Completed: {formatDeterministicDate(application.projectCompletionDate)}
                  </span>
                )}
              </div>
            </div>

            {/* Quick action buttons on header */}
            {!isConflict && !isLocked && (
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={isPending}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-navy-800 hover:bg-navy-700 text-slate-200 border border-white/15 text-xs font-mono uppercase tracking-wider font-semibold transition-colors disabled:opacity-50"
                >
                  <Save size={13} />
                  <span>{isPending ? "Saving..." : "Save Draft"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(true)}
                  disabled={isPending}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-gold-500 hover:bg-gold-400 text-navy-950 text-xs font-mono font-bold uppercase tracking-wider transition-colors shadow-sm disabled:opacity-50"
                >
                  <Send size={13} />
                  <span>Submit Evaluation</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={cn(
              "p-3 rounded text-xs font-mono flex items-center justify-between",
              feedback.type === "success"
                ? "bg-emerald-950/80 border border-emerald-500/40 text-emerald-300"
                : "bg-red-950/80 border border-red-500/40 text-red-300"
            )}
          >
            <span>{feedback.text}</span>
            <button
              type="button"
              onClick={() => setFeedback(null)}
              className="text-slate-400 hover:text-white ml-2"
            >
              ✕
            </button>
          </div>
        )}

        {/* Conflict Alert Banner */}
        {isConflict && (
          <div className="p-4 bg-red-950/70 border border-red-500/50 space-y-2 text-xs font-sans text-red-200">
            <div className="flex items-center gap-2 font-mono font-bold text-red-300 uppercase">
              <AlertTriangle size={15} />
              <span>Recusal Notice: Declared Conflict of Interest</span>
            </div>
            <p className="leading-relaxed">
              You have formally declared a conflict of interest for this entry ({assignment.conflictReason || "Unspecified"}). As per award governance regulations, evaluation controls for this dossier are permanently disabled.
            </p>
          </div>
        )}

        {/* Locked Evaluation Banner */}
        {isLocked && (
          <div className="p-4 bg-emerald-950/70 border border-emerald-500/50 space-y-2 text-xs font-sans text-emerald-200">
            <div className="flex items-center gap-2 font-mono font-bold text-emerald-300 uppercase">
              <CheckCircle2 size={15} />
              <span>Official Evaluation Submitted &amp; Locked</span>
            </div>
            <p className="leading-relaxed">
              Your evaluation was formally transmitted on {evaluation?.submittedAt ? formatDeterministicDateTime(evaluation.submittedAt) : "record"}. The assessment below is displayed in read-only mode for your reference.
            </p>
          </div>
        )}

        {/* View Switch Tabs */}
        <div className="flex border-b border-white/10 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("dossier")}
            className={cn(
              "px-5 py-3 text-xs font-mono uppercase tracking-wider transition-colors border-b-2 -mb-px flex items-center gap-2",
              activeTab === "dossier"
                ? "border-gold-500 text-gold-400 font-bold bg-white/5"
                : "border-transparent text-slate-400 hover:text-white"
            )}
          >
            <FileText size={14} />
            <span>1. Project Dossier &amp; Evidence ({files.length} uploads)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("evaluation")}
            className={cn(
              "px-5 py-3 text-xs font-mono uppercase tracking-wider transition-colors border-b-2 -mb-px flex items-center gap-2",
              activeTab === "evaluation"
                ? "border-gold-500 text-gold-400 font-bold bg-white/5"
                : "border-transparent text-slate-400 hover:text-white"
            )}
          >
            <Scale size={14} />
            <span>2. Confidential Evaluation ({criteria.length} Criteria)</span>
          </button>
        </div>

        {/* TAB 1: PROJECT DOSSIER & EVIDENCE */}
        {activeTab === "dossier" && (
          <div className="space-y-8">
            {/* Dynamic Questionnaire Responses */}
            <div className="bg-navy-900/60 border border-white/10 p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h2 className="font-display text-lg text-white font-medium flex items-center gap-2">
                  <FileCheck size={16} className="text-gold-400" />
                  <span>Category-Specific Architectural Questionnaire</span>
                </h2>
                <span className="text-[11px] font-mono text-slate-400">
                  {questions.length} Questions Answered
                </span>
              </div>

              {questions.length === 0 ? (
                <div className="text-xs font-mono text-slate-400 py-4 text-center">
                  No additional questionnaire configured for this category.
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {questions.map((q, idx) => {
                    const ans = answers[q.questionKey];
                    return (
                      <div key={q.id} className="py-4 space-y-1.5">
                        <div className="text-[11px] font-mono text-gold-400/90 font-semibold">
                          QUESTION {idx + 1}
                        </div>
                        <div className="text-sm font-medium text-white font-sans">{q.questionText}</div>
                        {q.helpText && (
                          <div className="text-[11px] text-slate-400 font-sans italic">{q.helpText}</div>
                        )}
                        <div className="mt-2 p-3 bg-navy-950 border border-white/10 text-xs sm:text-sm text-slate-200 font-sans whitespace-pre-wrap leading-relaxed">
                          {ans ? String(ans) : <span className="text-slate-500 italic">Not specified</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Uploaded Drawings & Photography */}
            <div className="bg-navy-900/60 border border-white/10 p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h2 className="font-display text-lg text-white font-medium flex items-center gap-2">
                  <ImageIcon size={16} className="text-gold-400" />
                  <span>Submitted Drawings, Floor Plans &amp; Photography</span>
                </h2>
                <span className="text-[11px] font-mono text-slate-400">
                  {files.length} Files Attached
                </span>
              </div>

              {files.length === 0 ? (
                <div className="text-xs font-mono text-slate-400 py-4 text-center">
                  No files submitted for this nomination.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {files.map((file) => {
                    const isImg = file.mimeType?.startsWith("image/") || file.filePath?.match(/\.(jpg|jpeg|png|webp)$/i);

                    return (
                      <div
                        key={file.id}
                        className="bg-navy-950 border border-white/10 p-3 space-y-2 flex flex-col justify-between hover:border-gold-500/40 transition-colors"
                      >
                        <div className="space-y-2">
                          {/* Image preview thumbnail */}
                          {isImg && file.signedUrl ? (
                            <div
                              onClick={() => setPreviewImage(file.signedUrl)}
                              className="relative h-44 bg-navy-900 border border-white/5 overflow-hidden group cursor-pointer"
                            >
                              <img
                                src={file.signedUrl}
                                alt={file.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                <Maximize2 size={20} />
                              </div>
                            </div>
                          ) : (
                            <div className="h-44 bg-navy-900 border border-white/5 flex flex-col items-center justify-center p-4 text-center space-y-2">
                              <FileText size={32} className="text-gold-400/70" />
                              <span className="text-[11px] font-mono text-slate-400 uppercase">
                                Architectural Drawing / PDF
                              </span>
                            </div>
                          )}

                          <div>
                            <div className="text-[10px] font-mono text-gold-400 uppercase tracking-wider">
                              {file.uploadType.replace(/_/g, " ")}
                            </div>
                            <h4 className="font-sans text-xs font-semibold text-white line-clamp-1">
                              {file.title}
                            </h4>
                            {file.description && (
                              <p className="text-[11px] text-slate-400 font-sans line-clamp-2 mt-0.5">
                                {file.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-mono">
                          <span className="text-slate-500">
                            {file.fileSizeBytes ? `${Math.round(file.fileSizeBytes / 1024)} KB` : "Document"}
                          </span>
                          {file.signedUrl && (
                            <a
                              href={file.signedUrl}
                              target="_blank"
                              rel="noreferrer"
                              download
                              className="inline-flex items-center gap-1 text-gold-400 hover:text-gold-300 transition-colors font-semibold"
                            >
                              <Download size={11} />
                              <span>View / Download</span>
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: CONFIDENTIAL EVALUATION */}
        {activeTab === "evaluation" && (
          <div className="space-y-8">
            {/* Guidelines banner */}
            <div className="p-4 bg-navy-900/60 border border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono text-gold-400 uppercase font-bold">
                <Info size={14} />
                <span>Qualitative Assessment Guidelines</span>
              </div>
              <p className="text-xs text-slate-300 font-sans leading-relaxed">
                Assess this entry across each of the five official Kutchmitra criteria. Select a qualitative rating level reflecting architectural merit, and provide confidential observations to support your assessment.
              </p>
            </div>

            {/* Criteria Cards */}
            <div className="space-y-6">
              {criteria.map((crit, idx) => {
                const current = scores[crit.id] || { rating: "", comment: "" };

                return (
                  <div
                    key={crit.id}
                    className="p-6 bg-navy-900/80 border border-white/10 space-y-4 relative"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
                      <div>
                        <span className="text-[10px] font-mono text-gold-400 uppercase tracking-widest font-bold block">
                          CRITERION 0{idx + 1}
                        </span>
                        <h3 className="font-display text-lg sm:text-xl text-white font-medium">
                          {crit.title}
                        </h3>
                      </div>
                      <span className="text-xs font-mono text-slate-400 bg-navy-950 px-2.5 py-1 border border-white/5">
                        Dimension {idx + 1} of 5
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 font-sans leading-relaxed">
                      {crit.description}
                    </p>

                    {/* Qualitative Rating Selector */}
                    <div className="space-y-2 pt-2">
                      <label className="block text-[11px] font-mono text-gold-400 uppercase tracking-wider">
                        Qualitative Rating Level *
                      </label>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {(
                          [
                            {
                              rating: "Exceptional",
                              desc: "Exemplary distinction; sets regional benchmark",
                            },
                            {
                              rating: "Commendable",
                              desc: "High design excellence & thoughtful resolution",
                            },
                            {
                              rating: "Competent",
                              desc: "Satisfactorily fulfills architectural criteria",
                            },
                            {
                              rating: "Developing",
                              desc: "Basic fulfillment; notable areas for refinement",
                            },
                          ] as const
                        ).map((opt) => (
                          <button
                            key={opt.rating}
                            type="button"
                            disabled={isLocked || isConflict}
                            onClick={() =>
                              setScores({
                                ...scores,
                                [crit.id]: { ...current, rating: opt.rating },
                              })
                            }
                            className={cn(
                              "p-3 border text-left space-y-1 transition-all",
                              current.rating === opt.rating
                                ? "bg-gold-500/20 border-gold-500 text-white"
                                : "bg-navy-950 border-white/10 text-slate-400 hover:text-white hover:border-white/20",
                              (isLocked || isConflict) && "cursor-not-allowed opacity-80"
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-xs font-bold">{opt.rating}</span>
                              {current.rating === opt.rating && (
                                <Check size={13} className="text-gold-400" />
                              )}
                            </div>
                            <div className="text-[10px] font-sans text-slate-400 leading-tight">
                              {opt.desc}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Confidential Criterion Observation */}
                    <div className="space-y-1.5 pt-2">
                      <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                        Criterion Commentary &amp; Specific Observations
                      </label>
                      <textarea
                        rows={3}
                        disabled={isLocked || isConflict}
                        value={current.comment}
                        onChange={(e) =>
                          setScores({
                            ...scores,
                            [crit.id]: { ...current, comment: e.target.value },
                          })
                        }
                        placeholder={`Provide confidential architectural feedback for ${crit.title}...`}
                        className="w-full bg-navy-950 border border-white/10 text-white p-3 text-xs font-sans placeholder-slate-600 focus:outline-none focus:border-gold-500 disabled:opacity-75 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Overall Assessment & Recommendation */}
            <div className="p-6 bg-navy-900/80 border border-white/10 space-y-6">
              <h3 className="font-display text-xl text-white font-medium pb-3 border-b border-white/10">
                Holistic Review &amp; Recommendation
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                    Key Strengths of this Nomination
                  </label>
                  <textarea
                    rows={4}
                    disabled={isLocked || isConflict}
                    value={strengths}
                    onChange={(e) => setStrengths(e.target.value)}
                    placeholder="Identify outstanding design qualities, materials, innovation, or execution highlights..."
                    className="w-full bg-navy-950 border border-white/10 text-white p-3 text-xs font-sans placeholder-slate-600 focus:outline-none focus:border-gold-500 disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                    Areas of Concern / Refinement Observations
                  </label>
                  <textarea
                    rows={4}
                    disabled={isLocked || isConflict}
                    value={areasOfConcern}
                    onChange={(e) => setAreasOfConcern(e.target.value)}
                    placeholder="Note limitations, functional constraints, contextual mismatches, or missing detailing..."
                    className="w-full bg-navy-950 border border-white/10 text-white p-3 text-xs font-sans placeholder-slate-600 focus:outline-none focus:border-gold-500 disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Overall Recommendation */}
              <div className="space-y-2">
                <label className="block text-[11px] font-mono text-gold-400 uppercase tracking-wider">
                  Overall Jury Recommendation *
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                  {(
                    [
                      {
                        value: "strongly_recommend",
                        label: "Strongly Recommend",
                        desc: "Exceptional merit; top candidate for category shortlist",
                      },
                      {
                        value: "recommend",
                        label: "Recommend",
                        desc: "High quality entry worthy of jury consideration",
                      },
                      {
                        value: "consider_reservations",
                        label: "Consider with Reservations",
                        desc: "Qualifying elements present, but concerns noted",
                      },
                      {
                        value: "do_not_recommend",
                        label: "Do Not Recommend",
                        desc: "Does not meet standard of category benchmark",
                      },
                    ] as const
                  ).map((rec) => (
                    <button
                      key={rec.value}
                      type="button"
                      disabled={isLocked || isConflict}
                      onClick={() => setRecommendation(rec.value)}
                      className={cn(
                        "p-3 border text-left space-y-1 transition-all",
                        recommendation === rec.value
                          ? "bg-gold-500/20 border-gold-500 text-white"
                          : "bg-navy-950 border-white/10 text-slate-400 hover:text-white hover:border-white/20",
                        (isLocked || isConflict) && "cursor-not-allowed opacity-80"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold">{rec.label}</span>
                        {recommendation === rec.value && (
                          <Check size={13} className="text-gold-400" />
                        )}
                      </div>
                      <div className="text-[10px] font-sans text-slate-400 leading-tight">
                        {rec.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* General Confidential Summary */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  Confidential General Summary / Jury Notes
                </label>
                <textarea
                  rows={3}
                  disabled={isLocked || isConflict}
                  value={generalComment}
                  onChange={(e) => setGeneralComment(e.target.value)}
                  placeholder="Summary remarks for organizing committee deliberations..."
                  className="w-full bg-navy-950 border border-white/10 text-white p-3 text-xs font-sans placeholder-slate-600 focus:outline-none focus:border-gold-500 disabled:opacity-75 disabled:cursor-not-allowed"
                />
              </div>

              {/* Submit Buttons */}
              {!isConflict && !isLocked && (
                <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    disabled={isPending}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-navy-800 hover:bg-navy-700 text-slate-200 border border-white/15 text-xs font-mono uppercase tracking-wider font-semibold transition-colors disabled:opacity-50"
                  >
                    <Save size={13} />
                    <span>{isPending ? "Saving..." : "Save Draft"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSubmitModal(true)}
                    disabled={isPending}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-gold-500 hover:bg-gold-400 text-navy-950 text-xs font-mono font-bold uppercase tracking-wider transition-colors shadow-sm disabled:opacity-50"
                  >
                    <Send size={13} />
                    <span>Submit &amp; Lock Evaluation</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* MODAL 1: SUBMIT EVALUATION CONFIRMATION */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-navy-950 border border-gold-500/40 p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-display text-lg text-white font-medium flex items-center gap-2">
                <Lock size={16} className="text-gold-400" />
                <span>Submit &amp; Lock Evaluation</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              Are you sure you want to submit your final evaluation for{" "}
              <strong className="text-gold-400 font-mono">{application.nominationId}</strong>?
            </p>

            <div className="p-3 bg-amber-950/60 border border-amber-500/30 text-amber-300 text-xs font-mono space-y-1">
              <div className="font-bold flex items-center gap-1">
                <AlertTriangle size={12} />
                <span>Permanent Locking Notice</span>
              </div>
              <p className="text-[11px] text-amber-200/90 font-sans">
                Once submitted, this evaluation will be permanently locked and cannot be edited without authorization from the Award Organizing Committee.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="px-4 py-2 bg-navy-900 text-slate-300 border border-white/10 text-xs font-mono uppercase"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitEvaluation}
                disabled={isPending}
                className="px-5 py-2 bg-gold-500 hover:bg-gold-400 text-navy-950 text-xs font-mono font-bold uppercase disabled:opacity-50"
              >
                {isPending ? "Submitting..." : "Confirm Final Submission"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: CONFLICT OF INTEREST */}
      {showConflictModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-navy-950 border border-white/20 p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-display text-lg text-white font-medium flex items-center gap-2">
                <AlertTriangle size={16} className="text-amber-400" />
                <span>Conflict of Interest Protocol</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowConflictModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConflictToggle} className="space-y-4 text-xs font-sans">
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                  <button
                    type="button"
                    onClick={() => setConflictDeclaringMode(true)}
                    className={cn(
                      "p-3 border text-left space-y-1 transition-colors",
                      conflictDeclaringMode
                        ? "bg-red-950/80 border-red-500 text-red-200"
                        : "bg-navy-900 border-white/10 text-slate-400 hover:text-white"
                    )}
                  >
                    <div className="font-bold flex items-center gap-1.5">
                      <AlertTriangle size={13} />
                      <span>Declare Conflict</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-sans">
                      I have an association with this project and recuse myself.
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setConflictDeclaringMode(false)}
                    className={cn(
                      "p-3 border text-left space-y-1 transition-colors",
                      !conflictDeclaringMode
                        ? "bg-emerald-950/80 border-emerald-500 text-emerald-200"
                        : "bg-navy-900 border-white/10 text-slate-400 hover:text-white"
                    )}
                  >
                    <div className="font-bold flex items-center gap-1.5">
                      <CheckCircle2 size={13} />
                      <span>No Conflict</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-sans">
                      I can evaluate this project with complete impartiality.
                    </div>
                  </button>
                </div>
              </div>

              {conflictDeclaringMode && (
                <div>
                  <label className="block text-[11px] font-mono text-red-300 mb-1">
                    Explanatory Reason for Conflict *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={conflictReasonInput}
                    onChange={(e) => setConflictReasonInput(e.target.value)}
                    placeholder="Describe nature of professional, personal, or commercial relationship..."
                    className="w-full bg-navy-900 border border-white/10 text-white p-2.5 text-xs focus:border-red-500"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowConflictModal(false)}
                  className="px-4 py-2 bg-navy-900 text-slate-300 border border-white/10 text-xs font-mono uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className={cn(
                    "px-4 py-2 text-xs font-mono font-bold uppercase transition-colors disabled:opacity-50",
                    conflictDeclaringMode
                      ? "bg-red-600 hover:bg-red-500 text-white"
                      : "bg-emerald-600 hover:bg-emerald-500 text-white"
                  )}
                >
                  {isPending ? "Recording..." : conflictDeclaringMode ? "Record Recusal" : "Confirm Independence"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: HIGH-RES IMAGE VIEWER */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
        >
          <div className="max-w-5xl max-h-[90vh] overflow-hidden relative">
            <img
              src={previewImage}
              alt="High-resolution evidence"
              className="max-w-full max-h-[85vh] object-contain mx-auto"
            />
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute top-2 right-2 px-3 py-1 bg-black/80 text-white text-xs font-mono border border-white/20"
            >
              Close [ESC]
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
