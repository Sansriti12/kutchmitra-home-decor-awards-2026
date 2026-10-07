"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Scale,
  Award,
  LogOut,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  ArrowRight,
  ExternalLink,
  Shield,
  Building,
  Briefcase,
  Lock,
  Eye,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { declareJuryConflict } from "@/lib/jury/actions";
import type { JuryAssignmentItem } from "@/types/jury.types";

interface JuryDashboardClientProps {
  juror: {
    id: string;
    fullName: string;
    email: string;
    organization: string | null;
    designation: string | null;
    honorific: string | null;
  };
  stats: {
    totalAssigned: number;
    pendingCount: number;
    completedCount: number;
    conflictCount: number;
  };
  assignments: JuryAssignmentItem[];
}

export default function JuryDashboardClient({
  juror,
  stats,
  assignments,
}: JuryDashboardClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "completed" | "conflict">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Conflict modal state
  const [conflictTarget, setConflictTarget] = useState<JuryAssignmentItem | null>(null);
  const [conflictReason, setConflictReason] = useState("");
  const [isDeclaringConflict, setIsDeclaringConflict] = useState(true);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSignOut = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      window.location.href = "/jury/login";
    } catch (err) {
      window.location.href = "/jury/login";
    }
  };

  const handleConflictSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!conflictTarget) return;

    if (isDeclaringConflict && !conflictReason.trim()) {
      alert("Please provide an explanatory reason for the conflict of interest.");
      return;
    }

    startTransition(async () => {
      const res = await declareJuryConflict(
        conflictTarget.id,
        isDeclaringConflict,
        isDeclaringConflict ? conflictReason : undefined
      );

      if (res.success) {
        setFeedback({
          type: "success",
          text: isDeclaringConflict
            ? `Conflict of interest recorded for ${conflictTarget.nominationId}. Evaluation blocked.`
            : `Confirmed no conflict for ${conflictTarget.nominationId}. You may proceed with evaluation.`,
        });
        setConflictTarget(null);
        setConflictReason("");
        router.refresh();
      } else {
        setFeedback({ type: "error", text: res.error || "Failed to update conflict status." });
      }
    });
  };

  // Distinct categories in assignments
  const categoriesInAssignments = Array.from(
    new Map(
      assignments
        .filter((a) => a.category)
        .map((a) => [a.category!.id, a.category!])
    ).values()
  );

  // Filtered assignments
  const filteredAssignments = assignments.filter((a) => {
    const matchesSearch =
      a.nominationId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.category?.name || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" ? true : a.category?.id === categoryFilter;

    let matchesStatus = true;
    if (statusFilter === "pending") {
      matchesStatus = !a.conflictDeclared && a.status !== "completed";
    } else if (statusFilter === "completed") {
      matchesStatus = a.status === "completed";
    } else if (statusFilter === "conflict") {
      matchesStatus = a.conflictDeclared;
    }

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-navy-950 text-slate-200">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-navy-950/95 backdrop-blur-md border-b border-white/10 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/jury/portal" className="flex items-center gap-2 group">
            <span className="font-mono text-xs uppercase tracking-[0.22em] text-gold-400 font-bold">
              Kutchmitra
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 bg-gold-500/20 text-gold-300 border border-gold-500/30 uppercase">
              Grand Jury
            </span>
          </Link>
          <span className="text-slate-600 hidden sm:inline">/</span>
          <span className="text-xs font-mono text-slate-400 hidden sm:inline">
            Evaluation Portal
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-medium text-white">
              {juror.honorific ? `${juror.honorific} ` : ""}
              {juror.fullName}
            </div>
            <div className="text-[10px] font-mono text-slate-400 truncate max-w-[220px]">
              {juror.designation ? `${juror.designation}, ` : ""}
              {juror.organization || juror.email}
            </div>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-navy-900 hover:bg-navy-800 text-slate-300 hover:text-white border border-white/10 text-xs font-mono uppercase tracking-wider rounded transition-colors"
            title="Sign out of Jury Portal"
          >
            <LogOut size={12} />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* Juror Welcome & Overview Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono text-gold-400 uppercase tracking-wider">
              <Scale size={14} />
              <span>Independent Assessment Workspace // 2026 Edition</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl text-white font-medium">
              Welcome, {juror.honorific ? `${juror.honorific} ` : ""}
              {juror.fullName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl font-sans">
              Review and evaluate qualifying design nominations assigned to your portfolio against the five official Kutchmitra criteria.
            </p>
          </div>

          <div className="p-3 bg-navy-900/90 border border-white/10 flex items-center gap-3">
            <div className="w-10 h-10 bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400 flex-shrink-0">
              <Award size={20} />
            </div>
            <div className="text-xs font-mono">
              <div className="text-slate-400 uppercase text-[10px]">Appointed Role</div>
              <div className="text-white font-semibold">Grand Jury Panelist</div>
              <div className="text-gold-400/90 text-[10px]">Kutchmitra Awards 2026</div>
            </div>
          </div>
        </div>

        {/* Feedback Banner */}
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

        {/* Five Evaluation Pillars Summary Card */}
        <div className="bg-navy-900/70 border border-white/10 p-5 space-y-3 relative overflow-hidden">
          <div className="flex items-center gap-2 text-xs font-mono text-gold-400 uppercase tracking-wider font-semibold">
            <Shield size={14} />
            <span>The Five Official Kutchmitra Evaluation Criteria</span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed font-sans max-w-4xl">
            All nominations must be evaluated with strict confidentiality, impartiality, and architectural rigor. Scoring is qualitative across five approved dimensions:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
            {[
              { num: "01", name: "Design Excellence & Innovation", focus: "Originality & Spatial Clarity" },
              { num: "02", name: "Functionality & Usability", focus: "Space Planning & Liveability" },
              { num: "03", name: "Quality of Craftsmanship", focus: "Detaching & Execution Quality" },
              { num: "04", name: "Sustainability & Material", focus: "Climate & Resource Efficiency" },
              { num: "05", name: "Contextual Relevance", focus: "Kutch Identity & Heritage" },
            ].map((crit) => (
              <div
                key={crit.num}
                className="p-3 bg-navy-950 border border-white/10 space-y-1 hover:border-gold-500/30 transition-colors"
              >
                <div className="text-[10px] font-mono text-gold-400 font-bold">CRITERION // {crit.num}</div>
                <div className="text-xs font-display font-medium text-white leading-tight">{crit.name}</div>
                <div className="text-[10px] font-sans text-slate-400">{crit.focus}</div>
              </div>
            ))}
          </div>

          <div className="pt-2 text-[11px] font-mono text-slate-400 flex items-center gap-2">
            <span className="text-amber-400">● Conflict Policy:</span>
            <span>If you hold a commercial, personal, or collaborative connection with any entry, declare a conflict before evaluating.</span>
          </div>
        </div>

        {/* Summary Metric Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-navy-900/80 border border-white/10 space-y-1">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Assigned Entries</span>
              <FileText size={14} className="text-blue-400" />
            </div>
            <div className="text-3xl font-mono font-bold text-white">{stats.totalAssigned}</div>
            <div className="text-[10px] font-mono text-slate-400">Total in Portfolio</div>
          </div>

          <div className="p-4 bg-navy-900/80 border border-white/10 space-y-1">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Pending Review</span>
              <Clock size={14} className="text-amber-400" />
            </div>
            <div className="text-3xl font-mono font-bold text-amber-300">{stats.pendingCount}</div>
            <div className="text-[10px] font-mono text-slate-400">Awaiting Final Submission</div>
          </div>

          <div className="p-4 bg-navy-900/80 border border-white/10 space-y-1">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Completed &amp; Locked</span>
              <CheckCircle2 size={14} className="text-emerald-400" />
            </div>
            <div className="text-3xl font-mono font-bold text-emerald-300">{stats.completedCount}</div>
            <div className="text-[10px] font-mono text-emerald-400/80">Evaluation Submitted</div>
          </div>

          <div className="p-4 bg-navy-900/80 border border-white/10 space-y-1">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Recused / Conflicts</span>
              <AlertTriangle size={14} className="text-red-400" />
            </div>
            <div className="text-3xl font-mono font-bold text-red-300">{stats.conflictCount}</div>
            <div className="text-[10px] font-mono text-red-400/80">Conflict Declared</div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-navy-900/60 p-4 border border-white/10">
          <div className="relative w-full md:w-80">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search nomination ID or project..."
              className="w-full pl-9 pr-3 py-2 bg-navy-950 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-gold-500 font-sans"
            />
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-navy-950 border border-white/10 text-xs text-white py-2 px-3 focus:outline-none focus:border-gold-500 font-mono"
            >
              <option value="all">All Categories ({categoriesInAssignments.length})</option>
              {categoriesInAssignments.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  Cat {cat.code}: {cat.name}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e: any) => setStatusFilter(e.target.value)}
              className="bg-navy-950 border border-white/10 text-xs text-white py-2 px-3 focus:outline-none focus:border-gold-500 font-mono"
            >
              <option value="all">All Statuses ({assignments.length})</option>
              <option value="pending">Pending Evaluation ({stats.pendingCount})</option>
              <option value="completed">Completed &amp; Locked ({stats.completedCount})</option>
              <option value="conflict">Declared Conflict ({stats.conflictCount})</option>
            </select>
          </div>
        </div>

        {/* Assigned Nominations Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl text-white font-medium">
              Assigned Nominations ({filteredAssignments.length})
            </h2>
            <span className="text-xs font-mono text-slate-400">
              Showing {filteredAssignments.length} of {assignments.length} entries
            </span>
          </div>

          {filteredAssignments.length === 0 ? (
            <div className="p-12 text-center bg-navy-900/40 border border-white/10 space-y-3">
              <Scale size={32} className="mx-auto text-slate-600" />
              <div className="text-sm font-display text-slate-300">No matching nominations found</div>
              <p className="text-xs font-mono text-slate-500 max-w-sm mx-auto">
                No entries match your search or filter criteria. Contact the organizing committee if you expect assignments.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAssignments.map((a) => {
                const isConflict = a.conflictDeclared;
                const isLocked = a.evaluation?.isLocked;
                const isDraft = !isLocked && a.evaluation?.status === "draft";

                return (
                  <div
                    key={a.id}
                    className={cn(
                      "bg-navy-900/90 border p-5 flex flex-col justify-between space-y-4 transition-all duration-150 relative",
                      isConflict
                        ? "border-red-500/30 opacity-75"
                        : isLocked
                        ? "border-emerald-500/30 hover:border-emerald-500/60"
                        : "border-white/10 hover:border-gold-500/50"
                    )}
                  >
                    {/* Top Tag & Status */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-gold-400 font-bold tracking-wider">
                          {a.nominationId}
                        </span>
                        {isConflict ? (
                          <span className="inline-flex items-center gap-1 text-[10px] uppercase px-2 py-0.5 bg-red-950 text-red-300 border border-red-500/40 font-semibold">
                            <AlertTriangle size={10} /> Recused
                          </span>
                        ) : isLocked ? (
                          <span className="inline-flex items-center gap-1 text-[10px] uppercase px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-semibold">
                            <CheckCircle2 size={10} /> Evaluated
                          </span>
                        ) : isDraft ? (
                          <span className="inline-flex items-center gap-1 text-[10px] uppercase px-2 py-0.5 bg-amber-950 text-amber-300 border border-amber-500/40 font-semibold">
                            <Clock size={10} /> Draft Saved
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] uppercase px-2 py-0.5 bg-blue-950 text-blue-300 border border-blue-500/40 font-semibold">
                            <span>Pending</span>
                          </span>
                        )}
                      </div>

                      <div>
                        <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                          Cat {a.category?.code} // {a.category?.name}
                        </div>
                        <h3 className="font-display text-lg text-white font-medium line-clamp-1 mt-0.5">
                          {a.projectName}
                        </h3>
                        <div className="text-xs text-slate-400 font-sans">
                          {a.projectCity}, {a.projectState}
                        </div>
                      </div>

                      {/* Conflict note */}
                      {isConflict && a.conflictReason && (
                        <div className="p-2 bg-red-950/50 border border-red-500/20 text-[11px] text-red-300 italic font-mono">
                          Conflict: {a.conflictReason}
                        </div>
                      )}

                      {/* Submitted recommendation badge */}
                      {isLocked && a.evaluation?.recommendation && (
                        <div className="p-2 bg-navy-950 border border-emerald-500/20 text-[11px] font-mono space-y-0.5">
                          <span className="text-[10px] text-slate-400 uppercase">Recommendation:</span>
                          <div className="text-emerald-300 font-semibold capitalize">
                            {a.evaluation.recommendation.replace(/_/g, " ")}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bottom Actions */}
                    <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono">
                      {isConflict ? (
                        <button
                          type="button"
                          onClick={() => {
                            setConflictTarget(a);
                            setIsDeclaringConflict(false);
                          }}
                          className="text-[11px] text-slate-400 hover:text-white underline"
                        >
                          Revoke Conflict
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setConflictTarget(a);
                            setIsDeclaringConflict(true);
                            setConflictReason("");
                          }}
                          className="text-[11px] text-slate-400 hover:text-amber-400 transition-colors"
                        >
                          Declare Conflict
                        </button>
                      )}

                      {!isConflict && (
                        <Link
                          href={`/jury/applications/${a.applicationId}`}
                          className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase font-bold tracking-wider transition-colors",
                            isLocked
                              ? "bg-navy-800 hover:bg-navy-700 text-slate-200 border border-white/15"
                              : isDraft
                              ? "bg-amber-500 hover:bg-amber-400 text-navy-950"
                              : "bg-gold-500 hover:bg-gold-400 text-navy-950"
                          )}
                        >
                          {isLocked ? (
                            <>
                              <Eye size={12} />
                              <span>View Dossier</span>
                            </>
                          ) : isDraft ? (
                            <>
                              <span>Resume Draft</span>
                              <ArrowRight size={12} />
                            </>
                          ) : (
                            <>
                              <span>Evaluate</span>
                              <ArrowRight size={12} />
                            </>
                          )}
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* CONFLICT OF INTEREST MODAL */}
      {conflictTarget && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-navy-950 border border-white/20 p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-display text-lg text-white font-medium flex items-center gap-2">
                <AlertTriangle size={16} className="text-amber-400" />
                <span>Conflict of Interest Protocol</span>
              </h3>
              <button
                type="button"
                onClick={() => setConflictTarget(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1 text-xs font-mono text-slate-300">
              <div>Nomination ID: <strong className="text-gold-400">{conflictTarget.nominationId}</strong></div>
              <div>Project: <strong className="text-white">{conflictTarget.projectName}</strong></div>
            </div>

            <form onSubmit={handleConflictSubmit} className="space-y-4 text-xs font-sans">
              <div className="space-y-2">
                <label className="block text-[11px] font-mono text-slate-400 uppercase">
                  Declaration Status
                </label>
                <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                  <button
                    type="button"
                    onClick={() => setIsDeclaringConflict(true)}
                    className={cn(
                      "p-3 border text-left space-y-1 transition-colors",
                      isDeclaringConflict
                        ? "bg-red-950/80 border-red-500 text-red-200"
                        : "bg-navy-900 border-white/10 text-slate-400 hover:text-white"
                    )}
                  >
                    <div className="font-bold flex items-center gap-1.5">
                      <AlertTriangle size={13} />
                      <span>Declare Conflict</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-sans">
                      I have a professional, personal, or financial association with this project.
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsDeclaringConflict(false)}
                    className={cn(
                      "p-3 border text-left space-y-1 transition-colors",
                      !isDeclaringConflict
                        ? "bg-emerald-950/80 border-emerald-500 text-emerald-200"
                        : "bg-navy-900 border-white/10 text-slate-400 hover:text-white"
                    )}
                  >
                    <div className="font-bold flex items-center gap-1.5">
                      <CheckCircle2 size={13} />
                      <span>Confirm No Conflict</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-sans">
                      I am completely independent and able to assess this entry impartially.
                    </div>
                  </button>
                </div>
              </div>

              {isDeclaringConflict && (
                <div>
                  <label className="block text-[11px] font-mono text-red-300 mb-1">
                    Explanatory Reason for Conflict *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={conflictReason}
                    onChange={(e) => setConflictReason(e.target.value)}
                    placeholder="e.g. My studio collaborated as a consultant on this project, or I have a personal acquaintance with the lead architect."
                    className="w-full bg-navy-900 border border-white/10 text-white p-2.5 text-xs focus:border-red-500"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setConflictTarget(null)}
                  className="px-4 py-2 bg-navy-900 text-slate-300 border border-white/10 text-xs font-mono uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className={cn(
                    "px-4 py-2 text-xs font-mono font-bold uppercase transition-colors disabled:opacity-50",
                    isDeclaringConflict
                      ? "bg-red-600 hover:bg-red-500 text-white"
                      : "bg-emerald-600 hover:bg-emerald-500 text-white"
                  )}
                >
                  {isPending ? "Recording..." : isDeclaringConflict ? "Record Recusal" : "Confirm Independence"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 text-center text-xs font-mono text-slate-500 mt-12">
        Kutchmitra Home &amp; Decor Awards 2026 // Grand Jury Evaluation Workspace
      </footer>
    </div>
  );
}
