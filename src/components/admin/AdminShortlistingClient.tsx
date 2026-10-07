"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Award,
  Lock,
  Unlock,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  Eye,
  FileText,
  UserCheck,
  Shield,
  ChevronRight,
  Sparkles,
  Info,
  Layers,
  ArrowRight,
  ExternalLink,
  MessageSquare,
  ThumbsUp,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  addToShortlist,
  removeFromShortlist,
  lockShortlist,
  unlockShortlist,
} from "@/lib/admin/shortlist-actions";
import type {
  ShortlistWorkspaceItem,
  ShortlistStats,
} from "@/types/shortlist-winner.types";

interface AdminShortlistingClientProps {
  initialItems: ShortlistWorkspaceItem[];
  stats: ShortlistStats;
  categories: Array<{ id: string; name: string; code: string }>;
  isSuperAdmin: boolean;
}

export default function AdminShortlistingClient({
  initialItems,
  stats,
  categories,
  isSuperAdmin,
}: AdminShortlistingClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Filters
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [evalFilter, setEvalFilter] = useState("all");

  // Modals & Feedback
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [selectedEvaluation, setSelectedEvaluation] = useState<ShortlistWorkspaceItem | null>(null);
  const [shortlistTarget, setShortlistTarget] = useState<ShortlistWorkspaceItem | null>(null);
  const [deliberationNoteInput, setDeliberationNoteInput] = useState("");
  const [showLockModal, setShowLockModal] = useState(false);
  const [lockNotesInput, setLockNotesInput] = useState("");
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [unlockReasonInput, setUnlockReasonInput] = useState("");

  // Filter application
  const filteredItems = initialItems.filter((item) => {
    if (categoryFilter !== "all" && item.categoryId !== categoryFilter) return false;
    if (statusFilter !== "all" && item.status !== statusFilter) return false;
    if (evalFilter === "completed" && !item.juryCompleteness.isFullyEvaluated) return false;
    if (evalFilter === "pending" && item.juryCompleteness.isFullyEvaluated) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchNom = item.nominationId.toLowerCase().includes(q);
      const matchProj = item.projectName.toLowerCase().includes(q);
      const matchApp = item.applicantName.toLowerCase().includes(q);
      const matchOrg = item.applicantOrganization.toLowerCase().includes(q);
      if (!matchNom && !matchProj && !matchApp && !matchOrg) return false;
    }
    return true;
  });

  // Shortlist Handlers
  const handleAddToShortlist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shortlistTarget) return;

    startTransition(async () => {
      const res = await addToShortlist(shortlistTarget.id, deliberationNoteInput);
      if (res.success) {
        setFeedback({
          type: "success",
          text: `Nomination ${shortlistTarget.nominationId} added to official Shortlist.`,
        });
        setShortlistTarget(null);
        setDeliberationNoteInput("");
        router.refresh();
      } else {
        setFeedback({ type: "error", text: res.error || "Failed to add to shortlist." });
      }
    });
  };

  const handleRemoveFromShortlist = (item: ShortlistWorkspaceItem) => {
    if (!confirm(`Are you sure you want to remove ${item.nominationId} (${item.projectName}) from the shortlist?`)) {
      return;
    }

    startTransition(async () => {
      const res = await removeFromShortlist(item.id, "Removed from shortlist by committee.");
      if (res.success) {
        setFeedback({
          type: "success",
          text: `Nomination ${item.nominationId} removed from shortlist and returned to jury review.`,
        });
        router.refresh();
      } else {
        setFeedback({ type: "error", text: res.error || "Failed to remove from shortlist." });
      }
    });
  };

  const handleLockShortlist = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await lockShortlist(undefined, lockNotesInput);
      if (res.success) {
        setFeedback({
          type: "success",
          text: "2026 Shortlist has been officially LOCKED. Final deliberation is now authorized.",
        });
        setShowLockModal(false);
        setLockNotesInput("");
        router.refresh();
      } else {
        setFeedback({ type: "error", text: res.error || "Failed to lock shortlist." });
      }
    });
  };

  const handleUnlockShortlist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!unlockReasonInput.trim()) {
      alert("Please provide an explanatory reason for reopening the shortlist.");
      return;
    }

    startTransition(async () => {
      const res = await unlockShortlist(undefined, unlockReasonInput);
      if (res.success) {
        setFeedback({
          type: "success",
          text: "Shortlist has been reopened for authorized committee modifications.",
        });
        setShowUnlockModal(false);
        setUnlockReasonInput("");
        router.refresh();
      } else {
        setFeedback({ type: "error", text: res.error || "Failed to reopen shortlist." });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-gold-400 uppercase tracking-wider mb-1">
            <Award size={14} />
            <span>Phase E // Committee Governance</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl text-white font-medium">
            Shortlisting &amp; Deliberation Workspace
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Synthesize qualitative jury assessments, curate the official 2026 shortlist, and freeze finalist selections.
          </p>
        </div>

        {/* Global Shortlist Lock Status / Action */}
        <div className="flex items-center gap-3">
          {stats.isShortlistLocked ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 text-xs font-mono font-bold uppercase tracking-wider">
                <Lock size={13} />
                <span>Shortlist Locked</span>
              </div>
              {isSuperAdmin && (
                <button
                  type="button"
                  onClick={() => setShowUnlockModal(true)}
                  disabled={isPending}
                  className="px-3 py-1.5 bg-navy-800 hover:bg-navy-700 text-slate-300 border border-white/15 text-xs font-mono uppercase tracking-wider transition-colors"
                >
                  <Unlock size={12} className="inline mr-1" />
                  <span>Reopen</span>
                </button>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowLockModal(true)}
              disabled={isPending || stats.totalShortlisted === 0}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gold-500 hover:bg-gold-400 text-navy-950 text-xs font-mono font-bold uppercase tracking-wider transition-colors shadow-sm disabled:opacity-50"
            >
              <Lock size={14} />
              <span>Lock Official Shortlist ({stats.totalShortlisted})</span>
            </button>
          )}

          <Link
            href="/admin/winners"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-navy-800 hover:bg-navy-700 text-white text-xs font-mono font-semibold uppercase tracking-wider border border-white/15 transition-colors"
          >
            <span>Winners Workspace</span>
            <ArrowRight size={13} className="text-gold-400" />
          </Link>
        </div>
      </div>

      {/* Lock Notice Banner if locked */}
      {stats.isShortlistLocked && (
        <div className="p-4 bg-emerald-950/70 border border-emerald-500/40 text-xs font-mono text-emerald-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            <div>
              <strong className="text-white">SHORTLIST OFFICIALLY LOCKED: </strong>
              <span>
                Finalist entries are frozen. Final deliberation and Winner / Runner-Up designation are authorized.
                {stats.lockedByName ? ` Locked by ${stats.lockedByName}.` : ""}
              </span>
            </div>
          </div>
          <span className="text-[11px] text-emerald-400/80 shrink-0">
            {stats.lockedAt ? new Date(stats.lockedAt).toUTCString() : ""}
          </span>
        </div>
      )}

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

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-navy-900/80 border border-white/10 p-4 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
            In Jury Review
          </span>
          <div className="text-2xl font-mono font-bold text-white">{stats.totalJuryReview}</div>
          <span className="text-[10px] font-mono text-slate-500">Qualifying Nominations</span>
        </div>

        <div className="bg-navy-900/80 border border-white/10 p-4 space-y-1">
          <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block">
            Fully Evaluated
          </span>
          <div className="text-2xl font-mono font-bold text-emerald-300">{stats.totalFullyEvaluated}</div>
          <span className="text-[10px] font-mono text-slate-500">All Jurors Submitted</span>
        </div>

        <div className="bg-navy-900/80 border border-white/10 p-4 space-y-1">
          <span className="text-[10px] font-mono text-gold-400 uppercase tracking-wider block">
            Shortlisted Finalists
          </span>
          <div className="text-2xl font-mono font-bold text-gold-300">{stats.totalShortlisted}</div>
          <span className="text-[10px] font-mono text-slate-500">Across 13 Categories</span>
        </div>

        <div className="bg-navy-900/80 border border-white/10 p-4 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
            Shortlist Lock Status
          </span>
          <div className="text-2xl font-mono font-bold text-white">
            {stats.isShortlistLocked ? (
              <span className="text-emerald-400 flex items-center gap-1.5">
                <Lock size={20} /> Locked
              </span>
            ) : (
              <span className="text-amber-400 flex items-center gap-1.5">
                <Clock size={20} /> Draft Active
              </span>
            )}
          </div>
          <span className="text-[10px] font-mono text-slate-500">Committee Status</span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-navy-900/60 border border-white/10 p-4 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search nomination ID, project, applicant, or studio..."
              className="w-full pl-9 pr-3 py-2 bg-navy-950 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-gold-500 font-sans"
            />
          </div>

          {/* Category Filter */}
          <div className="w-full md:w-64">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 bg-navy-950 border border-white/10 text-xs text-white focus:outline-none focus:border-gold-500 font-sans"
            >
              <option value="all">All 13 Categories ({categories.length})</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  Cat {c.code}: {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="w-full md:w-44">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-navy-950 border border-white/10 text-xs text-white focus:outline-none focus:border-gold-500 font-sans"
            >
              <option value="all">All Workflow Statuses</option>
              <option value="jury_review">In Jury Review</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="winner">Winner / Honoree</option>
            </select>
          </div>

          {/* Evaluation Completeness Filter */}
          <div className="w-full md:w-44">
            <select
              value={evalFilter}
              onChange={(e) => setEvalFilter(e.target.value)}
              className="w-full px-3 py-2 bg-navy-950 border border-white/10 text-xs text-white focus:outline-none focus:border-gold-500 font-sans"
            >
              <option value="all">All Evaluations</option>
              <option value="completed">Fully Evaluated</option>
              <option value="pending">Pending Juror Input</option>
            </select>
          </div>
        </div>
      </div>

      {/* Nominations Table */}
      <div className="bg-navy-900/90 border border-white/10 overflow-hidden">
        <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between text-xs font-mono">
          <span className="text-white font-bold">
            Nominations ({filteredItems.length})
          </span>
          <span className="text-slate-400">
            Showing qualitative recommendations &amp; jury completion status
          </span>
        </div>

        {filteredItems.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <Award size={32} className="mx-auto text-slate-600" />
            <div className="text-sm font-display text-slate-300">No matching nominations found</div>
            <p className="text-xs font-mono text-slate-500 max-w-sm mx-auto">
              No entries match the current filters. Ensure applications have passed technical verification and advanced to jury review.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/10 bg-navy-950/70 font-mono text-[11px] text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Nomination / Category</th>
                  <th className="py-3 px-4">Project &amp; Location</th>
                  <th className="py-3 px-4">Applicant / Studio</th>
                  <th className="py-3 px-4">Jury Assessment</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Committee Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-sans">
                {filteredItems.map((item) => {
                  const { juryCompleteness } = item;
                  const isShortlisted = item.isShortlisted;

                  return (
                    <tr
                      key={item.id}
                      className={cn(
                        "hover:bg-white/[0.02] transition-colors",
                        isShortlisted && "bg-gold-500/[0.03]"
                      )}
                    >
                      {/* Nomination ID & Category */}
                      <td className="py-3.5 px-4 space-y-1">
                        <span className="font-mono text-xs font-bold text-gold-400 block">
                          {item.nominationId}
                        </span>
                        <span className="inline-block px-1.5 py-0.5 bg-navy-950 border border-white/10 text-[10px] font-mono text-slate-300">
                          Cat {item.categoryCode} // {item.categoryName}
                        </span>
                      </td>

                      {/* Project Name & Location */}
                      <td className="py-3.5 px-4 space-y-0.5">
                        <div className="font-medium text-white line-clamp-1">{item.projectName}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {item.projectCity}, {item.projectState}
                        </div>
                      </td>

                      {/* Applicant & Organization */}
                      <td className="py-3.5 px-4 space-y-0.5">
                        <div className="text-slate-200">{item.applicantName}</div>
                        {item.applicantOrganization && (
                          <div className="text-[11px] text-slate-400 font-mono line-clamp-1">
                            {item.applicantOrganization}
                          </div>
                        )}
                      </td>

                      {/* Jury Assessment Summary */}
                      <td className="py-3.5 px-4 space-y-1.5">
                        {/* Completion pill */}
                        <div className="flex items-center gap-1.5">
                          {juryCompleteness.isFullyEvaluated ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono uppercase font-semibold">
                              <CheckCircle2 size={10} />
                              <span>Evaluated ({juryCompleteness.completedCount}/{juryCompleteness.totalAssigned})</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-950/80 text-amber-300 border border-amber-500/40 text-[10px] font-mono uppercase">
                              <Clock size={10} />
                              <span>Pending ({juryCompleteness.completedCount}/{juryCompleteness.totalAssigned})</span>
                            </span>
                          )}

                          {juryCompleteness.conflictCount > 0 && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-red-950 text-red-300 border border-red-500/40 text-[10px] font-mono">
                              <AlertTriangle size={10} />
                              <span>{juryCompleteness.conflictCount} Conflict</span>
                            </span>
                          )}
                        </div>

                        {/* Qualitative Recommendation Badges */}
                        <div className="flex items-center gap-1 flex-wrap">
                          {Object.entries(juryCompleteness.recommendations).map(([rec, count]) => {
                            const isStrong = rec === "strongly_recommend";
                            const isRec = rec === "recommend";
                            const isNot = rec === "do_not_recommend";

                            return (
                              <span
                                key={rec}
                                className={cn(
                                  "text-[10px] font-mono px-1.5 py-0.5 border",
                                  isStrong
                                    ? "bg-emerald-950/60 text-emerald-300 border-emerald-500/40 font-bold"
                                    : isRec
                                    ? "bg-blue-950/60 text-blue-300 border-blue-500/40"
                                    : isNot
                                    ? "bg-red-950/60 text-red-300 border-red-500/40"
                                    : "bg-amber-950/60 text-amber-300 border-amber-500/40"
                                )}
                              >
                                {rec.replace(/_/g, " ")} ({count})
                              </span>
                            );
                          })}

                          {Object.keys(juryCompleteness.recommendations).length === 0 && (
                            <span className="text-[10px] font-mono text-slate-500 italic">
                              No recommendations submitted yet
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4">
                        {item.status === "winner" ? (
                          <span className="inline-block px-2 py-0.5 bg-amber-950 border border-amber-500/50 text-amber-300 font-mono text-[10px] uppercase font-bold">
                            ★ Winner
                          </span>
                        ) : isShortlisted ? (
                          <span className="inline-block px-2 py-0.5 bg-gold-500/20 border border-gold-500/50 text-gold-300 font-mono text-[10px] uppercase font-bold">
                            Shortlisted
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 bg-purple-950/80 border border-purple-500/40 text-purple-300 font-mono text-[10px] uppercase">
                            Jury Review
                          </span>
                        )}
                      </td>

                      {/* Committee Actions */}
                      <td className="py-3.5 px-4 text-right space-x-2">
                        {/* Quick View Synthesis Modal */}
                        <button
                          type="button"
                          onClick={() => setSelectedEvaluation(item)}
                          className="px-2.5 py-1 bg-navy-950 hover:bg-navy-800 text-slate-300 border border-white/10 text-[11px] font-mono uppercase transition-colors"
                        >
                          <Eye size={11} className="inline mr-1 text-gold-400" />
                          <span>Ratings</span>
                        </button>

                        {/* Direct Link to Deliberation Dossier */}
                        <Link
                          href={`/admin/shortlisting/${item.id}`}
                          className="px-2.5 py-1 bg-navy-800 hover:bg-navy-700 text-white border border-white/15 text-[11px] font-mono uppercase font-semibold transition-colors inline-block"
                        >
                          <span>Deliberate</span>
                        </Link>

                        {/* Shortlist Toggle */}
                        {!stats.isShortlistLocked && item.status !== "winner" && (
                          <>
                            {isShortlisted ? (
                              <button
                                type="button"
                                onClick={() => handleRemoveFromShortlist(item)}
                                disabled={isPending}
                                className="px-2.5 py-1 bg-red-950/80 hover:bg-red-900 text-red-200 border border-red-500/40 text-[11px] font-mono uppercase transition-colors disabled:opacity-50"
                              >
                                Remove
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setShortlistTarget(item);
                                  setDeliberationNoteInput("");
                                }}
                                disabled={isPending}
                                className="px-2.5 py-1 bg-gold-500 hover:bg-gold-400 text-navy-950 text-[11px] font-mono font-bold uppercase transition-colors disabled:opacity-50"
                              >
                                + Shortlist
                              </button>
                            )}
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: ADD TO SHORTLIST WITH DELIBERATION NOTE */}
      {shortlistTarget && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-navy-950 border border-gold-500/40 p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-display text-lg text-white font-medium flex items-center gap-2">
                <Award size={18} className="text-gold-400" />
                <span>Select for Official Shortlist</span>
              </h3>
              <button
                type="button"
                onClick={() => setShortlistTarget(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1 text-xs font-mono text-slate-300">
              <div>Nomination ID: <strong className="text-gold-400">{shortlistTarget.nominationId}</strong></div>
              <div>Project: <strong className="text-white">{shortlistTarget.projectName}</strong></div>
              <div>Category: <span className="text-slate-400">{shortlistTarget.categoryName}</span></div>
            </div>

            <form onSubmit={handleAddToShortlist} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-mono text-slate-300 uppercase tracking-wider">
                  Committee Deliberation Note / Shortlist Justification
                </label>
                <textarea
                  rows={3}
                  value={deliberationNoteInput}
                  onChange={(e) => setDeliberationNoteInput(e.target.value)}
                  placeholder="Note jury strengths, innovative spatial detailing, regional resonance, or specific jury consensus..."
                  className="w-full bg-navy-900 border border-white/10 text-white p-2.5 text-xs font-sans placeholder-slate-600 focus:outline-none focus:border-gold-500"
                />
              </div>

              <div className="p-3 bg-navy-900/80 border border-white/10 text-[11px] font-mono text-slate-400">
                <span>Note: </span>
                <span className="font-sans">
                  Shortlisting is a conscious committee decision informed by qualitative jury feedback. This will advance the application status to <strong>'shortlisted'</strong>.
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShortlistTarget(null)}
                  className="px-4 py-2 bg-navy-900 text-slate-300 border border-white/10 text-xs font-mono uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 bg-gold-500 hover:bg-gold-400 text-navy-950 text-xs font-mono font-bold uppercase disabled:opacity-50"
                >
                  {isPending ? "Confirming..." : "Confirm Shortlist Selection"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: LOCK SHORTLIST CONFIRMATION */}
      {showLockModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-navy-950 border border-gold-500/50 p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-display text-lg text-white font-medium flex items-center gap-2">
                <Lock size={18} className="text-gold-400" />
                <span>Lock Official 2026 Shortlist</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowLockModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              You are about to lock the official shortlist containing{" "}
              <strong className="text-gold-400 font-mono">{stats.totalShortlisted} finalist entries</strong>.
            </p>

            <div className="p-3 bg-amber-950/70 border border-amber-500/40 text-amber-300 text-xs font-mono space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <AlertTriangle size={13} />
                <span>Governance Lock Policy</span>
              </div>
              <p className="text-[11px] text-amber-200/90 font-sans">
                Once locked, shortlist selections cannot be casually modified. All finalist positions are frozen for final committee deliberation and Winner / Runner-Up designation. This action is permanently audited.
              </p>
            </div>

            <form onSubmit={handleLockShortlist} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-mono text-slate-300 uppercase tracking-wider">
                  Committee Lock Remarks (Optional)
                </label>
                <textarea
                  rows={2}
                  value={lockNotesInput}
                  onChange={(e) => setLockNotesInput(e.target.value)}
                  placeholder="e.g. Official shortlist confirmed following Round 1 Grand Jury scoring review..."
                  className="w-full bg-navy-900 border border-white/10 text-white p-2.5 text-xs font-sans placeholder-slate-600 focus:outline-none focus:border-gold-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowLockModal(false)}
                  className="px-4 py-2 bg-navy-900 text-slate-300 border border-white/10 text-xs font-mono uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 bg-gold-500 hover:bg-gold-400 text-navy-950 text-xs font-mono font-bold uppercase disabled:opacity-50"
                >
                  {isPending ? "Locking..." : "Confirm & Lock Shortlist"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: SUPER ADMIN REOPEN SHORTLIST */}
      {showUnlockModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-navy-950 border border-red-500/50 p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-display text-lg text-white font-medium flex items-center gap-2">
                <Unlock size={18} className="text-red-400" />
                <span>Super Admin: Reopen Locked Shortlist</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowUnlockModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              Reopening the shortlist temporarily unfreezes finalist selections to permit authorized adjustments.
            </p>

            <form onSubmit={handleUnlockShortlist} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-mono text-red-300 uppercase tracking-wider">
                  Mandatory Reopening Justification *
                </label>
                <textarea
                  rows={3}
                  required
                  value={unlockReasonInput}
                  onChange={(e) => setUnlockReasonInput(e.target.value)}
                  placeholder="State the formal governance reason for reopening the locked shortlist..."
                  className="w-full bg-navy-900 border border-white/10 text-white p-2.5 text-xs font-sans placeholder-slate-600 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowUnlockModal(false)}
                  className="px-4 py-2 bg-navy-900 text-slate-300 border border-white/10 text-xs font-mono uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-mono font-bold uppercase disabled:opacity-50"
                >
                  {isPending ? "Reopening..." : "Reopen Shortlist"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: JURY QUALITATIVE RATINGS & OBSERVATIONS MODAL */}
      {selectedEvaluation && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-navy-950 border border-white/20 p-6 max-w-3xl w-full max-h-[85vh] overflow-y-auto space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 sticky top-0 bg-navy-950">
              <div>
                <span className="text-[10px] font-mono text-gold-400 uppercase tracking-wider">
                  {selectedEvaluation.nominationId} // {selectedEvaluation.categoryName}
                </span>
                <h3 className="font-display text-lg text-white font-medium">
                  {selectedEvaluation.projectName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEvaluation(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Individual Juror Submissions */}
            <div className="space-y-4">
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400">
                Assigned Juror Assessments ({selectedEvaluation.juryCompleteness.jurors.length})
              </h4>

              {selectedEvaluation.juryCompleteness.jurors.length === 0 ? (
                <div className="p-4 bg-navy-900 border border-white/5 text-xs font-mono text-slate-500 text-center">
                  No jurors assigned to this nomination.
                </div>
              ) : (
                selectedEvaluation.juryCompleteness.jurors.map((j) => (
                  <div key={j.assignmentId} className="p-4 bg-navy-900 border border-white/10 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-white/5">
                      <div>
                        <div className="font-mono text-xs font-bold text-white">{j.jurorName}</div>
                        {j.jurorOrganization && (
                          <div className="text-[10px] font-mono text-slate-400">{j.jurorOrganization}</div>
                        )}
                      </div>

                      {j.conflictDeclared ? (
                        <span className="px-2 py-0.5 bg-red-950 border border-red-500 text-red-300 text-[10px] font-mono font-bold">
                          Conflict Declared: {j.conflictReason || "Recused"}
                        </span>
                      ) : j.submittedAt ? (
                        <div className="text-right">
                          <span className="inline-block px-2 py-0.5 bg-emerald-950/80 border border-emerald-500 text-emerald-300 text-[10px] font-mono font-bold uppercase">
                            Recommendation: {j.recommendation?.replace(/_/g, " ") || "Submitted"}
                          </span>
                        </div>
                      ) : (
                        <span className="px-2 py-0.5 bg-amber-950 text-amber-300 text-[10px] font-mono">
                          Evaluation Pending
                        </span>
                      )}
                    </div>

                    {/* Criteria Ratings Breakdown */}
                    {j.scores && j.scores.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                        {j.scores.map((sc) => (
                          <div key={sc.criterionId} className="p-2 bg-navy-950 border border-white/5 space-y-0.5">
                            <span className="text-[10px] font-mono text-slate-400 block line-clamp-1">
                              {sc.criterionTitle}
                            </span>
                            <span className="font-mono text-xs font-bold text-gold-400">
                              {sc.qualitativeRating}
                            </span>
                            {sc.confidentialComment && (
                              <p className="text-[11px] text-slate-400 italic font-sans pt-1">
                                "{sc.confidentialComment}"
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Strengths / Concerns */}
                    {(j.strengths || j.areasOfConcern) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-2 border-t border-white/5">
                        {j.strengths && (
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-mono text-emerald-400 uppercase">Key Strengths</span>
                            <p className="text-slate-300 text-[11px] font-sans leading-relaxed">{j.strengths}</p>
                          </div>
                        )}
                        {j.areasOfConcern && (
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-mono text-amber-400 uppercase">Areas of Concern</span>
                            <p className="text-slate-300 text-[11px] font-sans leading-relaxed">{j.areasOfConcern}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-white/10">
              <Link
                href={`/admin/shortlisting/${selectedEvaluation.id}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-gold-500 hover:bg-gold-400 text-navy-950 text-xs font-mono font-bold uppercase tracking-wider"
              >
                <span>Full Deliberation Dossier</span>
                <ChevronRight size={13} />
              </Link>
              <button
                type="button"
                onClick={() => setSelectedEvaluation(null)}
                className="px-4 py-2 bg-navy-900 text-slate-300 border border-white/10 text-xs font-mono uppercase"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
