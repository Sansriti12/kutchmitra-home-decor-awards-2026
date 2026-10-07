"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Trophy,
  Award,
  Globe,
  Eye,
  Edit3,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  Send,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  Check,
  Layers,
  MapPin,
  Building,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  selectWinner,
  removeWinner,
  updateWinnerProfile,
  approveWinner,
  publishWinner,
  unpublishWinner,
  publishAllApprovedWinners,
} from "@/lib/admin/winner-actions";
import type {
  WinnerRecord,
  WinnerProfilePayload,
  WinnerType,
  WinnerWorkspaceStats,
  WinnerCandidateItem,
} from "@/types/shortlist-winner.types";

interface AdminWinnersClientProps {
  categories: Array<{ id: string; name: string; code: string }>;
  winners: WinnerRecord[];
  shortlistedCandidates: WinnerCandidateItem[];
  stats: WinnerWorkspaceStats;
  isSuperAdmin: boolean;
}

export default function AdminWinnersClient({
  categories,
  winners: initialWinners,
  shortlistedCandidates,
  stats,
  isSuperAdmin,
}: AdminWinnersClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Profile Editor Modal State
  const [editingWinner, setEditingWinner] = useState<WinnerRecord | null>(null);
  const [editAwardTitle, setEditAwardTitle] = useState("");
  const [editWinnerType, setEditWinnerType] = useState<WinnerType>("winner");
  const [editWinnerTitle, setEditWinnerTitle] = useState("");
  const [editProjectName, setEditProjectName] = useState("");
  const [editEntrantName, setEditEntrantName] = useState("");
  const [editOrganization, setEditOrganization] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editSummary, setEditSummary] = useState("");
  const [editCitation, setEditCitation] = useState("");
  const [editStory, setEditStory] = useState("");
  const [editHeroImage, setEditHeroImage] = useState("");
  const [editIsFeatured, setEditIsFeatured] = useState(false);
  const [editDisplayOrder, setEditDisplayOrder] = useState(1);

  // Quick Designation State
  const [designatingCandidate, setDesignatingCandidate] = useState<any | null>(null);
  const [designateAwardTitle, setDesignateAwardTitle] = useState("Winner");
  const [designateWinnerType, setDesignateWinnerType] = useState<WinnerType>("winner");
  const [designateCitation, setDesignateCitation] = useState("");

  // Bulk Publish Modal
  const [showBulkPublishModal, setShowBulkPublishModal] = useState(false);

  // Filter winners
  const displayWinners = initialWinners.filter((w) =>
    selectedCategory === "all" ? true : w.categoryId === selectedCategory
  );

  // Filter available candidates
  const displayCandidates = shortlistedCandidates.filter((c) => {
    const matchesCat = selectedCategory === "all" ? true : c.categoryId === selectedCategory;
    const isAlreadyWinner = initialWinners.some((w) => w.applicationId === c.id);
    return matchesCat && !isAlreadyWinner;
  });

  // Open Editor
  const openEditor = (w: WinnerRecord) => {
    setEditingWinner(w);
    setEditAwardTitle(w.awardTitle);
    setEditWinnerType(w.winnerType);
    setEditWinnerTitle(w.winnerTitle);
    setEditProjectName(w.projectName);
    setEditEntrantName(w.entrantName);
    setEditOrganization(w.organizationName);
    setEditLocation(w.projectLocation);
    setEditSummary(w.summaryDescription);
    setEditCitation(w.citation);
    setEditStory(w.projectStory);
    setEditHeroImage(w.heroImageUrl);
    setEditIsFeatured(w.isFeatured);
    setEditDisplayOrder(w.displayOrder);
  };

  // Save Profile Handler
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWinner) return;

    startTransition(async () => {
      const payload: WinnerProfilePayload = {
        awardTitle: editAwardTitle,
        winnerType: editWinnerType,
        winnerTitle: editWinnerTitle,
        projectName: editProjectName,
        entrantName: editEntrantName,
        organizationName: editOrganization,
        projectLocation: editLocation,
        summaryDescription: editSummary,
        citation: editCitation,
        projectStory: editStory,
        heroImageUrl: editHeroImage,
        galleryUrls: editingWinner.galleryUrls || [],
        isFeatured: editIsFeatured,
        displayOrder: editDisplayOrder,
      };

      const res = await updateWinnerProfile(editingWinner.id, payload);
      if (res.success) {
        setFeedback({ type: "success", text: "Winner profile updated successfully." });
        setEditingWinner(null);
        router.refresh();
      } else {
        setFeedback({ type: "error", text: res.error || "Failed to update profile." });
      }
    });
  };

  // Quick Designation Handler
  const handleDesignate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!designatingCandidate) return;

    startTransition(async () => {
      const res = await selectWinner(designatingCandidate.id, {
        awardTitle: designateAwardTitle,
        winnerType: designateWinnerType,
        citation: designateCitation,
        heroImageUrl: designatingCandidate.coverImageUrl,
      });

      if (res.success) {
        setFeedback({
          type: "success",
          text: `Designated ${designatingCandidate.nominationId} as ${designateAwardTitle}!`,
        });
        setDesignatingCandidate(null);
        setDesignateCitation("");
        router.refresh();
      } else {
        setFeedback({ type: "error", text: res.error || "Failed to designate winner." });
      }
    });
  };

  // Approve Handler
  const handleApprove = (winnerId: string) => {
    startTransition(async () => {
      const res = await approveWinner(winnerId);
      if (res.success) {
        setFeedback({ type: "success", text: "Winner profile approved for official release." });
        router.refresh();
      } else {
        setFeedback({ type: "error", text: res.error || "Failed to approve winner." });
      }
    });
  };

  // Publish Handler
  const handlePublish = (winnerId: string) => {
    startTransition(async () => {
      const res = await publishWinner(winnerId);
      if (res.success) {
        setFeedback({
          type: "success",
          text: "Winner officially published! Entry is now visible on the public /winners page.",
        });
        router.refresh();
      } else {
        setFeedback({ type: "error", text: res.error || "Failed to publish winner." });
      }
    });
  };

  // Unpublish Handler
  const handleUnpublish = (winnerId: string) => {
    startTransition(async () => {
      const res = await unpublishWinner(winnerId, "Unpublished by committee.");
      if (res.success) {
        setFeedback({
          type: "success",
          text: "Winner unpublished. Entry is no longer visible on public /winners page.",
        });
        router.refresh();
      } else {
        setFeedback({ type: "error", text: res.error || "Failed to unpublish." });
      }
    });
  };

  // Revoke Winner Handler
  const handleRevoke = (winnerId: string, awardTitle: string) => {
    if (!confirm(`Are you sure you want to revoke this ${awardTitle} designation? This will return the entry to Shortlisted status.`)) {
      return;
    }

    startTransition(async () => {
      const res = await removeWinner(winnerId, "Revoked designation during winner management.");
      if (res.success) {
        setFeedback({ type: "success", text: "Winner designation revoked; reverted to shortlisted." });
        router.refresh();
      } else {
        setFeedback({ type: "error", text: res.error || "Failed to revoke winner." });
      }
    });
  };

  // Bulk Publish Handler
  const handleBulkPublish = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await publishAllApprovedWinners();
      if (res.success) {
        setFeedback({
          type: "success",
          text: `Grand Finale Release Complete: ${res.count} approved winners have been published to /winners!`,
        });
        setShowBulkPublishModal(false);
        router.refresh();
      } else {
        setFeedback({ type: "error", text: res.error || "Failed to bulk publish winners." });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-gold-400 uppercase tracking-wider mb-1">
            <Trophy size={14} />
            <span>Phase E // Grand Finale Governance</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl text-white font-medium">
            Winner Management &amp; Public Showcase
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Designate category winners, curate public editorial profiles, and publish official results to the live website.
          </p>
        </div>

        {/* Global Grand Finale Actions */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowBulkPublishModal(true)}
            disabled={isPending || stats.totalApproved === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-gold-500 hover:bg-gold-400 text-navy-950 text-xs font-mono font-bold uppercase tracking-wider transition-colors shadow-sm disabled:opacity-50"
          >
            <Globe size={13} />
            <span>Publish All Approved ({stats.totalApproved})</span>
          </button>

          <Link
            href="/winners"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-navy-800 hover:bg-navy-700 text-slate-200 border border-white/15 text-xs font-mono font-semibold uppercase tracking-wider transition-colors"
          >
            <span>Live /winners</span>
            <ExternalLink size={12} className="text-gold-400" />
          </Link>
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

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-navy-900/80 border border-white/10 p-4 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
            Designated Honorees
          </span>
          <div className="text-2xl font-mono font-bold text-white">{stats.totalWinners}</div>
          <span className="text-[10px] font-mono text-slate-500">Winners &amp; Commendations</span>
        </div>

        <div className="bg-navy-900/80 border border-white/10 p-4 space-y-1">
          <span className="text-[10px] font-mono text-blue-400 uppercase tracking-wider block">
            Approved Profiles
          </span>
          <div className="text-2xl font-mono font-bold text-blue-300">{stats.totalApproved}</div>
          <span className="text-[10px] font-mono text-slate-500">Ready for Grand Release</span>
        </div>

        <div className="bg-navy-900/80 border border-white/10 p-4 space-y-1">
          <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block">
            Published Live
          </span>
          <div className="text-2xl font-mono font-bold text-emerald-300">{stats.totalPublished}</div>
          <span className="text-[10px] font-mono text-slate-500">Visible on Public /winners</span>
        </div>

        <div className="bg-navy-900/80 border border-white/10 p-4 space-y-1">
          <span className="text-[10px] font-mono text-gold-400 uppercase tracking-wider block">
            Categories Honored
          </span>
          <div className="text-2xl font-mono font-bold text-gold-300">
            {stats.categoriesWithWinnersCount}/{stats.totalCategories}
          </div>
          <span className="text-[10px] font-mono text-slate-500">Official Award Categories</span>
        </div>

        <div className="bg-navy-900/80 border border-white/10 p-4 space-y-1 col-span-2 sm:col-span-1">
          <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider block">
            Shortlisted Finalists
          </span>
          <div className="text-2xl font-mono font-bold text-amber-300">{stats.totalShortlisted}</div>
          <span className="text-[10px] font-mono text-slate-500">
            {stats.availableFinalists} Available for Designation
          </span>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-white/10">
        <button
          type="button"
          onClick={() => setSelectedCategory("all")}
          className={cn(
            "px-3 py-1.5 text-xs font-mono whitespace-nowrap uppercase transition-colors border",
            selectedCategory === "all"
              ? "bg-gold-500 text-navy-950 font-bold border-gold-500"
              : "bg-navy-900 text-slate-400 border-white/10 hover:text-white"
          )}
        >
          All 13 Categories ({stats.totalWinners})
        </button>

        {categories.map((c) => {
          const catWinners = initialWinners.filter((w) => w.categoryId === c.id);
          const hasPublished = catWinners.some((w) => w.isPublished);

          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelectedCategory(c.id)}
              className={cn(
                "px-3 py-1.5 text-xs font-mono whitespace-nowrap uppercase transition-colors border flex items-center gap-1.5",
                selectedCategory === c.id
                  ? "bg-gold-500 text-navy-950 font-bold border-gold-500"
                  : "bg-navy-900 text-slate-400 border-white/10 hover:text-white"
              )}
            >
              <span>Cat {c.code}: {c.name}</span>
              {catWinners.length > 0 && (
                <span className={cn(
                  "px-1 py-0.2 rounded text-[10px] font-bold",
                  hasPublished ? "bg-emerald-500/20 text-emerald-300" : "bg-white/10 text-white"
                )}>
                  {catWinners.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* SECTION 1: DESIGNATED WINNERS GRID */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl text-white font-medium flex items-center gap-2">
            <Trophy size={18} className="text-gold-400" />
            <span>Designated Honorees ({displayWinners.length})</span>
          </h2>
          <span className="text-xs font-mono text-slate-400">
            Gated publication: Entry only visible publicly when published
          </span>
        </div>

        {displayWinners.length === 0 ? (
          <div className="p-8 bg-navy-900/60 border border-white/10 text-center space-y-2">
            <Award size={32} className="mx-auto text-slate-600" />
            <div className="text-sm font-display text-slate-300">No winners designated in this selection</div>
            <p className="text-xs font-mono text-slate-500 max-w-sm mx-auto">
              Select a shortlisted finalist below or complete committee deliberation to designate winners.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayWinners.map((w) => {
              const isPub = w.isPublished;
              const isApp = w.publicationStatus === "approved";

              return (
                <div
                  key={w.id}
                  className="bg-navy-900/90 border border-white/10 p-5 space-y-4 flex flex-col justify-between hover:border-gold-500/40 transition-colors"
                >
                  <div className="space-y-3">
                    {/* Header: Category & Publication Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono text-gold-400 uppercase tracking-wider font-bold">
                        Cat {w.categoryCode} // {w.categoryName}
                      </span>

                      <span
                        className={cn(
                          "px-2 py-0.5 text-[10px] font-mono uppercase font-bold border",
                          isPub
                            ? "bg-emerald-950/90 text-emerald-300 border-emerald-500/50"
                            : isApp
                            ? "bg-blue-950/90 text-blue-300 border-blue-500/50"
                            : "bg-amber-950/90 text-amber-300 border-amber-500/50"
                        )}
                      >
                        {isPub ? "● Live / Published" : isApp ? "Approved" : "Draft Profile"}
                      </span>
                    </div>

                    {/* Honor Badge & Project Name */}
                    <div className="space-y-1">
                      <span className="inline-block px-2 py-0.5 bg-gold-500/20 text-gold-300 border border-gold-500/40 text-xs font-mono font-bold uppercase">
                        {w.awardTitle}
                      </span>
                      <h3 className="font-display text-lg text-white font-medium line-clamp-1">
                        {w.projectName}
                      </h3>
                      <div className="text-xs text-slate-300 font-sans">
                        <span>{w.entrantName}</span>
                        {w.organizationName && <span className="text-slate-500"> // {w.organizationName}</span>}
                      </div>
                      <div className="text-[11px] font-mono text-slate-500">{w.projectLocation}</div>
                    </div>

                    {/* Citation / Story Excerpt */}
                    {w.citation && (
                      <p className="text-xs text-slate-300 font-sans italic bg-navy-950 p-2.5 border border-white/5 line-clamp-2 leading-relaxed">
                        "{w.citation}"
                      </p>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2 flex-wrap text-xs font-mono">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEditor(w)}
                        className="px-2.5 py-1 bg-navy-950 hover:bg-navy-800 text-slate-200 border border-white/10 uppercase"
                      >
                        <Edit3 size={11} className="inline mr-1 text-gold-400" />
                        <span>Edit Profile</span>
                      </button>

                      <Link
                        href={`/admin/shortlisting/${w.applicationId}`}
                        className="px-2.5 py-1 bg-navy-950 hover:bg-navy-800 text-slate-400 hover:text-white border border-white/5 uppercase"
                      >
                        <span>Dossier</span>
                      </Link>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Publication Transitions */}
                      {!isPub && w.publicationStatus === "draft" && (
                        <button
                          type="button"
                          onClick={() => handleApprove(w.id)}
                          disabled={isPending}
                          className="px-2.5 py-1 bg-blue-950 hover:bg-blue-900 text-blue-200 border border-blue-500/40 uppercase font-semibold disabled:opacity-50"
                        >
                          Approve
                        </button>
                      )}

                      {!isPub && (
                        <button
                          type="button"
                          onClick={() => handlePublish(w.id)}
                          disabled={isPending}
                          className="px-3 py-1 bg-gold-500 hover:bg-gold-400 text-navy-950 uppercase font-bold disabled:opacity-50"
                        >
                          Publish Live
                        </button>
                      )}

                      {isPub && (
                        <>
                          <Link
                            href={`/winners/${w.id}`}
                            target="_blank"
                            className="px-2 py-1 bg-navy-950 text-emerald-400 border border-emerald-500/30 uppercase inline-flex items-center gap-1"
                          >
                            <Eye size={11} />
                            <span>Preview</span>
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleUnpublish(w.id)}
                            disabled={isPending}
                            className="px-2.5 py-1 bg-amber-950 hover:bg-amber-900 text-amber-200 border border-amber-500/40 uppercase disabled:opacity-50"
                          >
                            Unpublish
                          </button>
                        </>
                      )}

                      {!isPub && (
                        <button
                          type="button"
                          onClick={() => handleRevoke(w.id, w.awardTitle)}
                          disabled={isPending}
                          className="px-2 py-1 bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-500/40 uppercase disabled:opacity-50"
                          title="Revoke Winner Designation"
                        >
                          <Trash2 size={11} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 2: SHORTLISTED CANDIDATES AVAILABLE FOR DESIGNATION */}
      <div className="space-y-4 pt-6 border-t border-white/10">
        <div>
          <h2 className="font-display text-xl text-white font-medium flex items-center gap-2">
            <Award size={18} className="text-gold-400" />
            <span>
              Shortlisted Finalists Available for Designation ({displayCandidates.length}
              {selectedCategory !== "all" ? " in Selected Category" : ""})
            </span>
          </h2>
          <p className="text-xs font-mono text-slate-400">
            Select an officially shortlisted finalist below to designate as Winner, Runner-Up, or Special Commendation for its category.
          </p>
        </div>

        {displayCandidates.length === 0 ? (
          <div className="p-6 bg-navy-900/40 border border-white/5 text-xs font-mono text-slate-500 text-center">
            No unassigned finalists in this category selection.
          </div>
        ) : (
          <div className="overflow-x-auto bg-navy-900/60 border border-white/10">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-navy-950 text-[11px] font-mono text-slate-400 uppercase">
                  <th className="py-3 px-4">Nomination / Category</th>
                  <th className="py-3 px-4">Project</th>
                  <th className="py-3 px-4">Applicant / Studio</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {displayCandidates.map((c) => (
                  <tr key={c.id} className="hover:bg-white/[0.02]">
                    <td className="py-3 px-4 space-y-0.5">
                      <span className="font-mono text-gold-400 font-bold block">{c.nominationId}</span>
                      <span className="text-[10px] font-mono text-slate-400">Cat {c.categoryCode} // {c.categoryName}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-white">{c.projectName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{c.projectCity}, {c.projectState}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-300">{c.applicantName}</div>
                      {c.organization && <div className="text-[11px] text-slate-500 font-mono">{c.organization}</div>}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <Link
                        href={`/admin/shortlisting/${c.id}`}
                        className="px-2.5 py-1 bg-navy-950 text-slate-300 border border-white/10 font-mono uppercase inline-block"
                      >
                        Deliberation
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setDesignatingCandidate(c);
                          setDesignateAwardTitle("Winner");
                          setDesignateWinnerType("winner");
                          setDesignateCitation("");
                        }}
                        className="px-3 py-1 bg-gold-500 hover:bg-gold-400 text-navy-950 font-mono font-bold uppercase transition-colors"
                      >
                        + Designate Winner
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: WINNER PROFILE EDITOR */}
      {editingWinner && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-navy-950 border border-gold-500/40 p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 sticky top-0 bg-navy-950">
              <h3 className="font-display text-lg text-white font-medium flex items-center gap-2">
                <Edit3 size={16} className="text-gold-400" />
                <span>Edit Winner Editorial Profile: {editingWinner.projectName}</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingWinner(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-mono text-[11px] text-slate-300 uppercase">Award Title *</label>
                  <input
                    type="text"
                    required
                    value={editAwardTitle}
                    onChange={(e) => setEditAwardTitle(e.target.value)}
                    placeholder="e.g. Winner, Runner-Up, Special Commendation"
                    className="w-full p-2.5 bg-navy-900 border border-white/10 text-white font-mono focus:border-gold-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-mono text-[11px] text-slate-300 uppercase">Honor Type</label>
                  <select
                    value={editWinnerType}
                    onChange={(e) => setEditWinnerType(e.target.value as WinnerType)}
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
                  Showcase Display Title *
                </label>
                <input
                  type="text"
                  required
                  value={editWinnerTitle}
                  onChange={(e) => setEditWinnerTitle(e.target.value)}
                  placeholder="e.g. Winner — The Kutch Courtyard Residence"
                  className="w-full p-2.5 bg-navy-900 border border-white/10 text-white focus:border-gold-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="block font-mono text-[11px] text-slate-300 uppercase">Entrant Name</label>
                  <input
                    type="text"
                    value={editEntrantName}
                    onChange={(e) => setEditEntrantName(e.target.value)}
                    className="w-full p-2.5 bg-navy-900 border border-white/10 text-white focus:border-gold-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-mono text-[11px] text-slate-300 uppercase">Organization / Firm</label>
                  <input
                    type="text"
                    value={editOrganization}
                    onChange={(e) => setEditOrganization(e.target.value)}
                    className="w-full p-2.5 bg-navy-900 border border-white/10 text-white focus:border-gold-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-mono text-[11px] text-slate-300 uppercase">Project Location</label>
                  <input
                    type="text"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    placeholder="e.g. Bhuj, Kutch"
                    className="w-full p-2.5 bg-navy-900 border border-white/10 text-white focus:border-gold-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-mono text-[11px] text-slate-300 uppercase">
                  Hero Cover Image URL (Public Showcase)
                </label>
                <input
                  type="text"
                  value={editHeroImage}
                  onChange={(e) => setEditHeroImage(e.target.value)}
                  placeholder="https://... or signed/public URL"
                  className="w-full p-2.5 bg-navy-900 border border-white/10 text-white font-mono text-xs focus:border-gold-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-mono text-[11px] text-slate-300 uppercase">
                  Official Commendation Citation
                </label>
                <textarea
                  rows={2}
                  value={editCitation}
                  onChange={(e) => setEditCitation(e.target.value)}
                  placeholder="Official jury citation text..."
                  className="w-full p-2.5 bg-navy-900 border border-white/10 text-white focus:border-gold-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-mono text-[11px] text-slate-300 uppercase">
                  Project Narrative &amp; Winner Story
                </label>
                <textarea
                  rows={4}
                  value={editStory}
                  onChange={(e) => setEditStory(e.target.value)}
                  placeholder="Long-form architectural story for public detail page..."
                  className="w-full p-2.5 bg-navy-900 border border-white/10 text-white focus:border-gold-500 leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="editFeatured"
                    checked={editIsFeatured}
                    onChange={(e) => setEditIsFeatured(e.target.checked)}
                    className="accent-gold-500 w-4 h-4"
                  />
                  <label htmlFor="editFeatured" className="font-mono text-xs text-slate-300 cursor-pointer">
                    Feature on Homepage Hero
                  </label>
                </div>

                <div className="flex items-center justify-end gap-2">
                  <label className="font-mono text-[11px] text-slate-400 uppercase">Display Order:</label>
                  <input
                    type="number"
                    min={1}
                    value={editDisplayOrder}
                    onChange={(e) => setEditDisplayOrder(Number(e.target.value))}
                    className="w-20 p-1.5 bg-navy-900 border border-white/10 text-white font-mono text-center"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingWinner(null)}
                  className="px-4 py-2 bg-navy-900 text-slate-300 border border-white/10 text-xs font-mono uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 bg-gold-500 hover:bg-gold-400 text-navy-950 text-xs font-mono font-bold uppercase disabled:opacity-50"
                >
                  {isPending ? "Saving..." : "Save Winner Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: QUICK DESIGNATE MODAL */}
      {designatingCandidate && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-navy-950 border border-gold-500/50 p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-display text-lg text-white font-medium flex items-center gap-2">
                <Trophy size={18} className="text-gold-400" />
                <span>Designate Winner</span>
              </h3>
              <button
                type="button"
                onClick={() => setDesignatingCandidate(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1 text-xs font-mono text-slate-300 bg-navy-900 p-3 border border-white/5">
              <div>Nomination ID: <strong className="text-gold-400">{designatingCandidate.nominationId}</strong></div>
              <div>Project: <strong className="text-white">{designatingCandidate.projectName}</strong></div>
              <div>Category: <span className="text-slate-400">Cat {designatingCandidate.categoryCode}: {designatingCandidate.categoryName}</span></div>
            </div>

            <form onSubmit={handleDesignate} className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-2 gap-2 font-mono">
                <button
                  type="button"
                  onClick={() => {
                    setDesignateAwardTitle("Winner");
                    setDesignateWinnerType("winner");
                  }}
                  className={cn(
                    "p-2.5 border text-center transition-colors",
                    designateAwardTitle === "Winner"
                      ? "bg-gold-500 text-navy-950 font-bold border-gold-500"
                      : "bg-navy-900 border-white/10 text-slate-400 hover:text-white"
                  )}
                >
                  Winner
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setDesignateAwardTitle("Runner-Up");
                    setDesignateWinnerType("runner_up");
                  }}
                  className={cn(
                    "p-2.5 border text-center transition-colors",
                    designateAwardTitle === "Runner-Up"
                      ? "bg-gold-500 text-navy-950 font-bold border-gold-500"
                      : "bg-navy-900 border-white/10 text-slate-400 hover:text-white"
                  )}
                >
                  Runner-Up
                </button>
              </div>

              <div className="space-y-1">
                <label className="block font-mono text-[11px] text-slate-300 uppercase">
                  Commendation Citation (Optional)
                </label>
                <textarea
                  rows={2}
                  value={designateCitation}
                  onChange={(e) => setDesignateCitation(e.target.value)}
                  placeholder="Official commendation summary..."
                  className="w-full p-2.5 bg-navy-900 border border-white/10 text-white focus:border-gold-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setDesignatingCandidate(null)}
                  className="px-4 py-2 bg-navy-900 text-slate-300 border border-white/10 text-xs font-mono uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 bg-gold-500 hover:bg-gold-400 text-navy-950 text-xs font-mono font-bold uppercase disabled:opacity-50"
                >
                  {isPending ? "Confirming..." : "Confirm Designation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: BULK PUBLISH CONFIRMATION */}
      {showBulkPublishModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-navy-950 border border-gold-500/50 p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-display text-lg text-white font-medium flex items-center gap-2">
                <Globe size={18} className="text-gold-400" />
                <span>Publish Grand Finale Results</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowBulkPublishModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              Are you sure you want to bulk publish all{" "}
              <strong className="text-gold-400 font-mono">{stats.totalApproved} approved winners</strong> across all 13 categories to the public website?
            </p>

            <div className="p-3 bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs font-mono">
              All approved winner profiles will become instantly live on <strong>/winners</strong> for the public and entrants.
            </div>

            <form onSubmit={handleBulkPublish} className="flex justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowBulkPublishModal(false)}
                className="px-4 py-2 bg-navy-900 text-slate-300 border border-white/10 text-xs font-mono uppercase"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="px-5 py-2 bg-gold-500 hover:bg-gold-400 text-navy-950 text-xs font-mono font-bold uppercase disabled:opacity-50"
              >
                {isPending ? "Publishing..." : "Confirm & Publish Live"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
