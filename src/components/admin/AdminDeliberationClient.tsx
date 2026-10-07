"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Award,
  Lock,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Scale,
  FileText,
  Image as ImageIcon,
  FileCheck,
  Download,
  Maximize2,
  User,
  Building,
  MapPin,
  Calendar,
  Sparkles,
  Info,
  Check,
  Send,
  Save,
  Trophy,
} from "lucide-react";
import { cn, formatDeterministicDate, formatDeterministicNumber } from "@/lib/utils";
import { updateDeliberationNotes, addToShortlist, removeFromShortlist } from "@/lib/admin/shortlist-actions";
import { selectWinner, removeWinner } from "@/lib/admin/winner-actions";
import type {
  FinalDeliberationDossier,
  WinnerType,
} from "@/types/shortlist-winner.types";

interface AdminDeliberationClientProps {
  dossier: FinalDeliberationDossier;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

export default function AdminDeliberationClient({
  dossier,
  isAdmin,
  isSuperAdmin,
}: AdminDeliberationClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const { application, shortlistInfo, dynamicQuestions, files, evaluations, synthesis, winnerRecord } = dossier;

  const [activeTab, setActiveTab] = useState<"deliberation" | "dossier" | "winner">("deliberation");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Deliberation Notes State
  const [deliberationNotes, setDeliberationNotes] = useState(
    shortlistInfo?.deliberationNotes || ""
  );

  // Winner Designation Form State
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [awardTitle, setAwardTitle] = useState("Winner");
  const [winnerType, setWinnerType] = useState<WinnerType>("winner");
  const [citationInput, setCitationInput] = useState(winnerRecord?.citation || "");
  const [storyInput, setStoryInput] = useState(winnerRecord?.projectStory || "");
  const [heroImageInput, setHeroImageInput] = useState(winnerRecord?.heroImageUrl || files[0]?.signedUrl || "");

  // High-res preview modal
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Save Deliberation Notes Handler
  const handleSaveNotes = () => {
    startTransition(async () => {
      const res = await updateDeliberationNotes(application.id, deliberationNotes);
      if (res.success) {
        setFeedback({ type: "success", text: "Committee deliberation notes saved successfully." });
      } else {
        setFeedback({ type: "error", text: res.error || "Failed to save deliberation notes." });
      }
    });
  };

  // Winner Designation Handler
  const handleDesignateWinner = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await selectWinner(application.id, {
        awardTitle,
        winnerType,
        citation: citationInput,
        projectStory: storyInput,
        heroImageUrl: heroImageInput,
      });

      if (res.success) {
        setShowWinnerModal(false);
        setFeedback({
          type: "success",
          text: `Entry successfully designated as ${awardTitle}! Profile initialized in Winner Management.`,
        });
        router.refresh();
      } else {
        setFeedback({ type: "error", text: res.error || "Failed to designate winner." });
      }
    });
  };

  // Remove Winner Designation Handler
  const handleRemoveWinner = () => {
    if (!winnerRecord) return;
    if (!confirm(`Are you sure you want to remove the ${winnerRecord.awardTitle} designation for ${application.nominationId}?`)) {
      return;
    }

    startTransition(async () => {
      const res = await removeWinner(winnerRecord.id, "Reverted winner designation during deliberation.");
      if (res.success) {
        setFeedback({ type: "success", text: "Winner designation removed; reverted to shortlisted." });
        router.refresh();
      } else {
        setFeedback({ type: "error", text: res.error || "Failed to remove winner designation." });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <Link
              href="/admin/shortlisting"
              className="hover:text-gold-400 transition-colors inline-flex items-center gap-1"
            >
              <ArrowLeft size={12} />
              <span>Shortlisting Workspace</span>
            </Link>
            <span>/</span>
            <span className="text-gold-400 font-bold">{application.nominationId}</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl text-white font-medium">
            Final Deliberation Dossier
          </h1>
          <div className="flex items-center gap-3 text-xs font-mono text-slate-400 pt-0.5">
            <span className="text-gold-400 font-semibold">
              Category {application.category.code} // {application.category.name}
            </span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {winnerRecord ? (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-950 border border-amber-500/50 text-amber-300 font-mono text-xs font-bold uppercase">
              <Trophy size={13} />
              <span>Designated: {winnerRecord.awardTitle}</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowWinnerModal(true)}
              disabled={isPending}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-gold-500 hover:bg-gold-400 text-navy-950 font-mono text-xs font-bold uppercase tracking-wider transition-colors shadow-sm disabled:opacity-50"
            >
              <Trophy size={13} />
              <span>Designate Winner / Runner-Up</span>
            </button>
          )}

          <Link
            href={`/admin/applications/${application.id}`}
            className="px-3 py-2 bg-navy-800 hover:bg-navy-700 text-slate-200 border border-white/15 text-xs font-mono uppercase tracking-wider transition-colors"
          >
            <span>Audit Trail &amp; Verification</span>
          </Link>
        </div>
      </div>

      {/* Project Meta Banner */}
      <div className="bg-navy-900/90 border border-white/10 p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-[11px] font-mono text-gold-400 uppercase tracking-wider">
              {application.nominationId} // {application.category.name}
            </div>
            <h2 className="font-display text-2xl text-white font-medium">
              {application.projectName}
            </h2>
            <div className="flex items-center gap-4 text-xs font-mono text-slate-400 pt-1 flex-wrap">
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

          <div className="p-3 bg-navy-950 border border-white/10 space-y-1 text-xs font-mono text-slate-300 min-w-[240px]">
            <div className="text-[10px] text-slate-500 uppercase">Entrant Information</div>
            <div className="font-bold text-white">{application.applicant.name}</div>
            <div className="text-slate-400">{application.applicant.organization || "Independent Practice"}</div>
            <div className="text-[11px] text-slate-500">{application.applicant.email}</div>
          </div>
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
          <button type="button" onClick={() => setFeedback(null)} className="text-slate-400 hover:text-white ml-2">
            ✕
          </button>
        </div>
      )}

      {/* View Switch Tabs */}
      <div className="flex border-b border-white/10 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("deliberation")}
          className={cn(
            "px-5 py-3 text-xs font-mono uppercase tracking-wider transition-colors border-b-2 -mb-px flex items-center gap-2",
            activeTab === "deliberation"
              ? "border-gold-500 text-gold-400 font-bold bg-white/5"
              : "border-transparent text-slate-400 hover:text-white"
          )}
        >
          <Scale size={14} />
          <span>1. Jury Evaluation &amp; Synthesis ({evaluations.length} Jurors)</span>
        </button>

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
          <span>2. Project Dossier &amp; Evidence ({files.length} Files)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("winner")}
          className={cn(
            "px-5 py-3 text-xs font-mono uppercase tracking-wider transition-colors border-b-2 -mb-px flex items-center gap-2",
            activeTab === "winner"
              ? "border-gold-500 text-gold-400 font-bold bg-white/5"
              : "border-transparent text-slate-400 hover:text-white"
          )}
        >
          <Trophy size={14} />
          <span>3. Deliberation Notes &amp; Winner Designation</span>
        </button>
      </div>

      {/* TAB 1: JURY EVALUATION & QUALITATIVE SYNTHESIS */}
      {activeTab === "deliberation" && (
        <div className="space-y-6">
          {/* Qualitative Synthesis Card */}
          <div className="bg-navy-900/90 border border-white/10 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-display text-lg text-white font-medium flex items-center gap-2">
                <Sparkles size={16} className="text-gold-400" />
                <span>Qualitative Recommendation Synthesis</span>
              </h3>
              <span className="text-xs font-mono text-slate-400">
                {synthesis.totalEvaluations} Submitted Evaluations
              </span>
            </div>

            {/* Recommendation Levels Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { key: "strongly_recommend", label: "Strongly Recommend", color: "text-emerald-300 border-emerald-500/40 bg-emerald-950/40" },
                { key: "recommend", label: "Recommend", color: "text-blue-300 border-blue-500/40 bg-blue-950/40" },
                { key: "consider_reservations", label: "Consider Reservations", color: "text-amber-300 border-amber-500/40 bg-amber-950/40" },
                { key: "do_not_recommend", label: "Do Not Recommend", color: "text-red-300 border-red-500/40 bg-red-950/40" },
              ].map((rec) => (
                <div key={rec.key} className={cn("p-3 border space-y-1 font-mono", rec.color)}>
                  <span className="text-[10px] uppercase block tracking-wider">{rec.label}</span>
                  <div className="text-2xl font-bold">
                    {synthesis.recommendationCounts[rec.key] || 0}
                  </div>
                </div>
              ))}
            </div>

            {/* Criteria Consensus Matrix */}
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400">
                Consensus by 5 Kutchmitra Criteria
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                {Object.entries(synthesis.criteriaRatings).map(([critTitle, ratings]) => (
                  <div key={critTitle} className="p-3 bg-navy-950 border border-white/5 space-y-2">
                    <span className="text-[11px] font-sans font-semibold text-white block line-clamp-2 h-8">
                      {critTitle}
                    </span>
                    <div className="space-y-1 text-[10px] font-mono">
                      {["Exceptional", "Commendable", "Competent", "Developing"].map((lvl) => {
                        const count = ratings[lvl] || 0;
                        return (
                          <div key={lvl} className="flex justify-between text-slate-400">
                            <span>{lvl}:</span>
                            <span className={cn(count > 0 && "text-gold-400 font-bold")}>{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Strengths & Concerns Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-navy-950/80 border border-emerald-500/20 space-y-2">
                <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider font-bold block">
                  Consolidated Juror Strengths
                </span>
                {synthesis.consolidatedStrengths.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No strengths noted.</p>
                ) : (
                  <ul className="text-xs text-slate-300 font-sans space-y-1.5 list-disc list-inside leading-relaxed">
                    {synthesis.consolidatedStrengths.map((str, idx) => (
                      <li key={idx}>{str}</li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="p-4 bg-navy-950/80 border border-amber-500/20 space-y-2">
                <span className="text-[11px] font-mono text-amber-400 uppercase tracking-wider font-bold block">
                  Consolidated Juror Concerns
                </span>
                {synthesis.consolidatedConcerns.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No concerns noted.</p>
                ) : (
                  <ul className="text-xs text-slate-300 font-sans space-y-1.5 list-disc list-inside leading-relaxed">
                    {synthesis.consolidatedConcerns.map((con, idx) => (
                      <li key={idx}>{con}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* Individual Juror Submissions Cards */}
          <div className="space-y-4">
            <h3 className="font-display text-lg text-white font-medium">
              Individual Confidential Juror Assessments ({evaluations.length})
            </h3>

            {evaluations.map((j) => (
              <div key={j.assignmentId} className="bg-navy-900/80 border border-white/10 p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
                  <div>
                    <div className="font-mono text-sm font-bold text-white flex items-center gap-2">
                      <User size={14} className="text-gold-400" />
                      <span>{j.jurorName}</span>
                    </div>
                    <div className="text-xs text-slate-400 font-sans">
                      {j.jurorDesignation && `${j.jurorDesignation} // `}
                      {j.jurorOrganization || "Grand Jury Panel"}
                    </div>
                  </div>

                  {j.conflictDeclared ? (
                    <span className="px-2.5 py-1 bg-red-950 border border-red-500 text-red-300 text-xs font-mono font-bold uppercase">
                      Conflict Declared: {j.conflictReason || "Recused"}
                    </span>
                  ) : j.submittedAt ? (
                    <div className="text-right space-y-0.5">
                      <span className="inline-block px-2.5 py-1 bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-mono font-bold uppercase">
                        Recommendation: {j.recommendation?.replace(/_/g, " ")}
                      </span>
                      <div className="text-[10px] font-mono text-slate-500">
                        Submitted: {formatDeterministicDate(j.submittedAt)}
                      </div>
                    </div>
                  ) : (
                    <span className="px-2.5 py-1 bg-amber-950 text-amber-300 text-xs font-mono uppercase">
                      Evaluation In Progress
                    </span>
                  )}
                </div>

                {/* Criteria Ratings */}
                {j.scores && j.scores.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    {j.scores.map((sc) => (
                      <div key={sc.criterionId} className="p-3 bg-navy-950 border border-white/5 space-y-1">
                        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                          {sc.criterionTitle}
                        </span>
                        <div className="font-mono text-xs font-bold text-gold-400">
                          {sc.qualitativeRating}
                        </div>
                        {sc.confidentialComment && (
                          <p className="text-[11px] text-slate-300 font-sans italic pt-1 border-t border-white/5 leading-snug">
                            "{sc.confidentialComment}"
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Observations */}
                {(j.strengths || j.areasOfConcern || j.generalComment) && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-white/5 text-xs font-sans">
                    {j.strengths && (
                      <div className="space-y-1">
                        <span className="font-mono text-[11px] text-emerald-400 uppercase font-bold block">
                          Strengths
                        </span>
                        <p className="text-slate-300 leading-relaxed">{j.strengths}</p>
                      </div>
                    )}
                    {j.areasOfConcern && (
                      <div className="space-y-1">
                        <span className="font-mono text-[11px] text-amber-400 uppercase font-bold block">
                          Areas of Concern
                        </span>
                        <p className="text-slate-300 leading-relaxed">{j.areasOfConcern}</p>
                      </div>
                    )}
                    {j.generalComment && (
                      <div className="space-y-1">
                        <span className="font-mono text-[11px] text-slate-400 uppercase font-bold block">
                          Confidential Remarks
                        </span>
                        <p className="text-slate-300 leading-relaxed">{j.generalComment}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: PROJECT DOSSIER & MEDIA */}
      {activeTab === "dossier" && (
        <div className="space-y-6">
          {/* Dynamic Questionnaire */}
          <div className="bg-navy-900/90 border border-white/10 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-display text-lg text-white font-medium flex items-center gap-2">
                <FileCheck size={16} className="text-gold-400" />
                <span>Category Architectural Questionnaire</span>
              </h3>
              <span className="text-xs font-mono text-slate-400">
                {dynamicQuestions.length} Questions Answered
              </span>
            </div>

            <div className="divide-y divide-white/5">
              {dynamicQuestions.map((q, idx) => (
                <div key={q.id} className="py-4 space-y-1.5">
                  <span className="text-[10px] font-mono text-gold-400 font-bold uppercase">
                    QUESTION {idx + 1}
                  </span>
                  <div className="text-sm font-medium text-white">{q.questionText}</div>
                  {q.helpText && <div className="text-xs text-slate-400 italic">{q.helpText}</div>}
                  <div className="mt-2 p-3 bg-navy-950 border border-white/10 text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
                    {q.answer}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Uploaded Files & Drawings */}
          <div className="bg-navy-900/90 border border-white/10 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-display text-lg text-white font-medium flex items-center gap-2">
                <ImageIcon size={16} className="text-gold-400" />
                <span>Submitted Drawings &amp; Project Photography</span>
              </h3>
              <span className="text-xs font-mono text-slate-400">{files.length} Files</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {files.map((file) => {
                const isImg = file.mimeType?.startsWith("image/") || file.title?.match(/\.(jpg|jpeg|png|webp)$/i);

                return (
                  <div
                    key={file.id}
                    className="bg-navy-950 border border-white/10 p-3 space-y-2 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      {isImg && file.signedUrl ? (
                        <div
                          onClick={() => setPreviewImage(file.signedUrl || null)}
                          className="relative h-44 bg-navy-900 border border-white/5 overflow-hidden group cursor-pointer"
                        >
                          <img
                            src={file.signedUrl}
                            alt={file.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                            <Maximize2 size={20} />
                          </div>
                        </div>
                      ) : (
                        <div className="h-44 bg-navy-900 border border-white/5 flex flex-col items-center justify-center p-4 text-center space-y-2">
                          <FileText size={32} className="text-gold-400/70" />
                          <span className="text-[11px] font-mono text-slate-400 uppercase">
                            Drawing / Document
                          </span>
                        </div>
                      )}

                      <div>
                        <span className="text-[10px] font-mono text-gold-400 uppercase">
                          {file.uploadType.replace(/_/g, " ")}
                        </span>
                        <h4 className="text-xs font-semibold text-white line-clamp-1">{file.title}</h4>
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
                          className="text-gold-400 hover:text-gold-300 font-semibold inline-flex items-center gap-1"
                        >
                          <Download size={11} />
                          <span>Download</span>
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DELIBERATION NOTES & WINNER DESIGNATION */}
      {activeTab === "winner" && (
        <div className="space-y-6">
          {/* Winner Status Banner if already designated */}
          {winnerRecord && (
            <div className="p-6 bg-amber-950/70 border border-amber-500/50 space-y-4 text-amber-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy size={20} className="text-gold-400" />
                  <h3 className="font-display text-xl text-white font-medium">
                    Official Award Recipient: {winnerRecord.awardTitle}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "px-2.5 py-0.5 text-xs font-mono uppercase font-bold border",
                    winnerRecord.isPublished
                      ? "bg-emerald-950 text-emerald-300 border-emerald-500"
                      : "bg-blue-950 text-blue-300 border-blue-500"
                  )}>
                    {winnerRecord.isPublished ? "Published to /winners" : `Status: ${winnerRecord.publicationStatus}`}
                  </span>
                  <Link
                    href="/admin/winners"
                    className="px-3 py-1 bg-navy-900 border border-white/20 text-xs font-mono text-white hover:border-gold-500 transition-colors"
                  >
                    Edit Profile in Winners Workspace →
                  </Link>
                  <button
                    type="button"
                    onClick={handleRemoveWinner}
                    disabled={isPending}
                    className="px-2.5 py-1 bg-red-950 border border-red-500 text-red-300 text-xs font-mono hover:bg-red-900"
                  >
                    Revoke
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono pt-2 border-t border-amber-500/20">
                <div>Citation: <span className="text-white font-sans">{winnerRecord.citation || "None"}</span></div>
                <div>Project Story: <span className="text-white font-sans">{winnerRecord.projectStory || "None"}</span></div>
              </div>
            </div>
          )}

          {/* Deliberation Notes Box */}
          <div className="bg-navy-900/90 border border-white/10 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-display text-lg text-white font-medium flex items-center gap-2">
                <FileText size={16} className="text-gold-400" />
                <span>Committee Deliberation Record &amp; Final Assessment</span>
              </h3>
              <button
                type="button"
                onClick={handleSaveNotes}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-gold-500 hover:bg-gold-400 text-navy-950 text-xs font-mono font-bold uppercase disabled:opacity-50"
              >
                <Save size={13} />
                <span>Save Notes</span>
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider">
                Confidential Deliberation Notes
              </label>
              <textarea
                rows={6}
                value={deliberationNotes}
                onChange={(e) => setDeliberationNotes(e.target.value)}
                placeholder="Record final committee debate, consensus points, justification for award honor, or specific citations..."
                className="w-full bg-navy-950 border border-white/10 text-white p-3 text-xs font-sans placeholder-slate-600 focus:outline-none focus:border-gold-500 leading-relaxed"
              />
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DESIGNATE WINNER / RUNNER-UP */}
      {showWinnerModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-navy-950 border border-gold-500/50 p-6 max-w-xl w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-display text-lg text-white font-medium flex items-center gap-2">
                <Trophy size={18} className="text-gold-400" />
                <span>Designate Category Award Winner</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowWinnerModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1 text-xs font-mono text-slate-300 bg-navy-900/80 p-3 border border-white/5">
              <div>Nomination ID: <strong className="text-gold-400">{application.nominationId}</strong></div>
              <div>Project: <strong className="text-white">{application.projectName}</strong></div>
              <div>Category: <span className="text-slate-300">Cat {application.category.code} // {application.category.name}</span></div>
            </div>

            <form onSubmit={handleDesignateWinner} className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-mono text-[11px] text-slate-300 uppercase">Award Title *</label>
                  <select
                    value={awardTitle}
                    onChange={(e) => {
                      setAwardTitle(e.target.value);
                      if (e.target.value === "Winner") setWinnerType("winner");
                      else if (e.target.value === "Runner-Up") setWinnerType("runner_up");
                      else setWinnerType("special_commendation");
                    }}
                    className="w-full p-2.5 bg-navy-900 border border-white/10 text-white font-mono focus:border-gold-500"
                  >
                    <option value="Winner">Winner (Primary Honor)</option>
                    <option value="Runner-Up">Runner-Up</option>
                    <option value="Special Commendation">Special Commendation</option>
                    <option value="Finalist Honoree">Finalist Honoree</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block font-mono text-[11px] text-slate-300 uppercase">Honor Type</label>
                  <select
                    value={winnerType}
                    onChange={(e) => setWinnerType(e.target.value as WinnerType)}
                    className="w-full p-2.5 bg-navy-900 border border-white/10 text-white font-mono focus:border-gold-500"
                  >
                    <option value="winner">Winner</option>
                    <option value="runner_up">Runner-Up</option>
                    <option value="special_commendation">Special Commendation</option>
                    <option value="finalist">Finalist</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-mono text-[11px] text-slate-300 uppercase">
                  Official Award Citation / Commendation Summary
                </label>
                <textarea
                  rows={2}
                  value={citationInput}
                  onChange={(e) => setCitationInput(e.target.value)}
                  placeholder="Official jury citation honoring this project's distinction..."
                  className="w-full p-2.5 bg-navy-900 border border-white/10 text-white focus:border-gold-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-mono text-[11px] text-slate-300 uppercase">
                  Project Narrative / Winner Story (for Public Showcase)
                </label>
                <textarea
                  rows={3}
                  value={storyInput}
                  onChange={(e) => setStoryInput(e.target.value)}
                  placeholder="Architectural background, craftsmanship narrative, and design excellence highlights..."
                  className="w-full p-2.5 bg-navy-900 border border-white/10 text-white focus:border-gold-500"
                />
              </div>

              <div className="p-3 bg-navy-900/60 border border-white/10 text-[11px] font-mono text-slate-400">
                Notice: Selection initializes the winner record in <strong>'draft'</strong> status. The entry will NOT be visible on the public /winners page until officially approved and published in the Winners Workspace.
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowWinnerModal(false)}
                  className="px-4 py-2 bg-navy-900 text-slate-300 border border-white/10 text-xs font-mono uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 bg-gold-500 hover:bg-gold-400 text-navy-950 text-xs font-mono font-bold uppercase disabled:opacity-50"
                >
                  {isPending ? "Designating..." : "Confirm Designation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* High-res image modal */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
        >
          <div className="max-w-5xl max-h-[90vh] overflow-hidden relative">
            <img src={previewImage} alt="Project evidence" className="max-w-full max-h-[85vh] object-contain mx-auto" />
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
