"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Building2,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  FileCheck,
  User,
  Mail,
  Phone,
  Globe,
  ExternalLink,
  ShieldCheck,
  Copy,
  Check,
  AlertCircle,
  Eye,
  Download,
  MessageSquare,
  Lock,
  Unlock,
  History,
  Layers,
  Sparkles,
  ArrowRight,
  Info,
  HelpCircle,
  Tag,
  Share2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  updateApplicationStatus,
  requestApplicationClarification,
  createAdminNote,
  type AdminApplicationDossierResult,
  type AdminDossierQuestionAnswer,
  type AdminDossierFileItem,
  type AdminClarificationItem,
  type AdminNoteItem,
  type StatusHistoryItem,
} from "@/lib/admin/actions";

interface AdminDossierClientProps {
  dossier: AdminApplicationDossierResult;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; text: string; bg: string; border: string; dot: string; desc: string }
> = {
  draft: {
    label: "Draft",
    text: "text-slate-300",
    bg: "bg-slate-800/80",
    border: "border-slate-700",
    dot: "bg-slate-400",
    desc: "Unsubmitted draft by applicant.",
  },
  submitted: {
    label: "Submitted",
    text: "text-blue-300",
    bg: "bg-blue-950/80",
    border: "border-blue-500/40",
    dot: "bg-blue-400",
    desc: "Application locked and received. Pending verification desk audit.",
  },
  under_verification: {
    label: "Under Verification",
    text: "text-amber-300",
    bg: "bg-amber-950/80",
    border: "border-amber-500/40",
    dot: "bg-amber-400",
    desc: "Verification desk is reviewing document compliance and eligibility.",
  },
  clarification_required: {
    label: "Clarification Required",
    text: "text-orange-300",
    bg: "bg-orange-950/80",
    border: "border-orange-500/50",
    dot: "bg-orange-400",
    desc: "Action required: Verifiers requested additional details or document updates.",
  },
  eligible: {
    label: "Eligible",
    text: "text-emerald-300",
    bg: "bg-emerald-950/80",
    border: "border-emerald-500/40",
    dot: "bg-emerald-400",
    desc: "Eligibility verified. Approved for jury assignment and scoring.",
  },
  jury_review: {
    label: "Jury Review",
    text: "text-gold-300",
    bg: "bg-gold-950/80",
    border: "border-gold-500/40",
    dot: "bg-gold-400",
    desc: "Assigned to independent jury panel for criteria evaluation.",
  },
  shortlisted: {
    label: "Shortlisted",
    text: "text-purple-300",
    bg: "bg-purple-950/80",
    border: "border-purple-500/40",
    dot: "bg-purple-400",
    desc: "Advanced to final shortlist of candidates.",
  },
  winner: {
    label: "Winner / Laureate",
    text: "text-gold-200",
    bg: "bg-gold-900/80",
    border: "border-gold-400/60",
    dot: "bg-gold-300",
    desc: "Honored with official award title.",
  },
  rejected: {
    label: "Not Selected",
    text: "text-rose-300",
    bg: "bg-rose-950/80",
    border: "border-rose-500/40",
    dot: "bg-rose-400",
    desc: "Application did not meet eligibility or was not selected.",
  },
  disqualified: {
    label: "Disqualified",
    text: "text-red-400",
    bg: "bg-red-950/90",
    border: "border-red-600/50",
    dot: "bg-red-500",
    desc: "Entry disqualified due to breach of guidelines or false declaration.",
  },
};

const KUTCH_CITIES = [
  "bhuj",
  "gandhidham",
  "anjar",
  "mandvi",
  "mundra",
  "nakhatrana",
  "abdasa",
  "lakhpat",
  "rapar",
  "bhachau",
  "kandla",
  "madhapar",
  "kothara",
  "naliya",
  "dayapar",
];

function isKutchLocation(city?: string | null): boolean {
  if (!city) return false;
  const lower = city.toLowerCase();
  return KUTCH_CITIES.some((k) => lower.includes(k)) || lower.includes("kutch") || lower.includes("kachchh");
}

type DossierTab = "project" | "entrant" | "questionnaire" | "media" | "notes" | "history";

export default function AdminDossierClient({ dossier }: AdminDossierClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const app = dossier.application;
  const applicant = dossier.applicant;
  const category = dossier.category;
  const questionsAndAnswers = dossier.questionsAndAnswers || [];
  const files = dossier.files || [];
  const clarifications = dossier.clarifications || [];
  const adminNotes = dossier.adminNotes || [];
  const statusHistory = dossier.statusHistory || [];
  const allowedTransitions = dossier.allowedTransitions || [];

  const [activeTab, setActiveTab] = useState<DossierTab>("project");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Status transition action state
  const [statusActionOpen, setStatusActionOpen] = useState(false);
  const [selectedNextStatus, setSelectedNextStatus] = useState<string | null>(null);
  const [statusComment, setStatusComment] = useState("");
  const [statusActionError, setStatusActionError] = useState<string | null>(null);

  // Clarification modal state
  const [clarificationModalOpen, setClarificationModalOpen] = useState(false);
  const [clarificationMessage, setClarificationMessage] = useState("");
  const [internalNote, setInternalNote] = useState("");
  const [clarificationError, setClarificationError] = useState<string | null>(null);

  // New admin note state
  const [newNoteText, setNewNoteText] = useState("");
  const [noteSubmitting, setNoteSubmitting] = useState(false);
  const [noteError, setNoteError] = useState<string | null>(null);
  const [noteSuccess, setNoteSuccess] = useState(false);

  const statusInfo = STATUS_CONFIG[app?.status] || {
    label: app?.status || "Unknown",
    text: "text-slate-300",
    bg: "bg-slate-800",
    border: "border-slate-700",
    dot: "bg-slate-400",
    desc: "",
  };

  const isKutch = isKutchLocation(app?.project_city);

  // Check completion date validity (2023-01-01 to 2025-12-31)
  const compDate = app?.project_completion_date;
  const isDateValid = compDate && compDate >= "2023-01-01" && compDate <= "2025-12-31";

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenStatusConfirm = (targetStatus: string) => {
    setSelectedNextStatus(targetStatus);
    setStatusComment("");
    setStatusActionError(null);
    setStatusActionOpen(true);
  };

  const handleConfirmStatusChange = () => {
    if (!selectedNextStatus || !app?.id) return;
    setStatusActionError(null);

    startTransition(async () => {
      const res = await updateApplicationStatus(app.id, selectedNextStatus, statusComment);
      if (!res.success) {
        setStatusActionError(res.error || "Failed to update status.");
      } else {
        setStatusActionOpen(false);
        router.refresh();
      }
    });
  };

  const handleSendClarification = () => {
    if (!clarificationMessage.trim()) {
      setClarificationError("Clarification message is required.");
      return;
    }
    setClarificationError(null);

    startTransition(async () => {
      const res = await requestApplicationClarification(
        app.id,
        clarificationMessage,
        internalNote
      );
      if (!res.success) {
        setClarificationError(res.error || "Failed to request clarification.");
      } else {
        setClarificationModalOpen(false);
        setClarificationMessage("");
        setInternalNote("");
        router.refresh();
      }
    });
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim() || !app?.id) return;

    setNoteSubmitting(true);
    setNoteError(null);
    setNoteSuccess(false);

    try {
      const res = await createAdminNote(app.id, newNoteText);
      if (!res.success) {
        setNoteError(res.error || "Failed to save note.");
      } else {
        setNewNoteText("");
        setNoteSuccess(true);
        setTimeout(() => setNoteSuccess(false), 3000);
        router.refresh();
      }
    } catch (err: any) {
      setNoteError(err?.message || "An error occurred.");
    } finally {
      setNoteSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Return Link */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <Link
          href="/admin/applications"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-gold-400 transition-colors"
        >
          <ChevronLeft size={14} />
          <span>Back to Applications Registry</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase px-2 py-0.5 bg-white/5 border border-white/10 text-slate-400">
            Dossier View
          </span>
        </div>
      </div>

      {/* Application Hero Header */}
      <div className="bg-navy-900/90 border border-white/10 p-6 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-sm font-bold text-gold-400 px-2 py-0.5 bg-gold-500/10 border border-gold-500/30">
                {app.nomination_id}
              </span>
              <button
                onClick={() => handleCopy(app.nomination_id)}
                title="Copy Nomination ID"
                className="text-slate-500 hover:text-slate-300 p-1 rounded transition-colors"
              >
                {copiedId === app.nomination_id ? (
                  <Check size={14} className="text-emerald-400" />
                ) : (
                  <Copy size={14} />
                )}
              </button>

              {category && (
                <span className="text-xs font-mono px-2 py-0.5 bg-white/5 border border-white/10 text-slate-300">
                  Category #{category.code}: {category.name}
                </span>
              )}
            </div>

            <h1 className="font-display text-2xl sm:text-3xl text-white font-medium tracking-tight">
              {app.project_name || "Untitled Nomination"}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs font-sans text-slate-400">
              <div className="flex items-center gap-1">
                <MapPin size={13} className="text-slate-500" />
                <span>
                  {app.project_city || "Gujarat"}
                  {app.project_state ? `, ${app.project_state}` : ""}
                </span>
              </div>
              <span>&bull;</span>
              <div className="flex items-center gap-1">
                <Building2 size={13} className="text-slate-500" />
                <span>{applicant?.organizationName || applicant?.fullName || "Studio"}</span>
              </div>
              <span>&bull;</span>
              <div className="flex items-center gap-1 font-mono text-[11px]">
                <Calendar size={13} className="text-slate-500" />
                <span>
                  Submitted:{" "}
                  {app.submitted_at
                    ? new Date(app.submitted_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "Not yet submitted (Draft)"}
                </span>
              </div>
            </div>
          </div>

          {/* Current Status Badge */}
          <div className="flex flex-col items-start lg:items-end gap-1.5">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              Application Status
            </div>
            <span
              className={cn(
                "inline-flex items-center gap-2 px-3 py-1 text-xs font-mono uppercase font-bold border",
                statusInfo.bg,
                statusInfo.text,
                statusInfo.border
              )}
            >
              <span className={cn("w-2 h-2 rounded-full", statusInfo.dot)} />
              <span>{statusInfo.label}</span>
            </span>
            <span className="text-[10px] text-slate-400 font-sans max-w-xs text-left lg:text-right">
              {statusInfo.desc}
            </span>
          </div>
        </div>

        {/* Verification Quick Action Toolbar */}
        <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mr-1">
              Workflow Actions:
            </span>

            {/* If application is submitted, show 'Start Verification' */}
            {app.status === "submitted" && (
              <button
                onClick={() => handleOpenStatusConfirm("under_verification")}
                disabled={isPending}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-navy-950 text-xs font-semibold uppercase tracking-wider transition-colors inline-flex items-center gap-1.5"
              >
                <FileCheck size={14} />
                <span>Start Verification Desk</span>
              </button>
            )}

            {/* If under_verification, show 'Mark Eligible', 'Request Clarification', 'Reject', 'Disqualify' */}
            {app.status === "under_verification" && (
              <>
                <button
                  onClick={() => handleOpenStatusConfirm("eligible")}
                  disabled={isPending}
                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-navy-950 text-xs font-semibold uppercase tracking-wider transition-colors inline-flex items-center gap-1.5"
                >
                  <CheckCircle2 size={14} />
                  <span>Mark Eligible</span>
                </button>

                <button
                  onClick={() => {
                    setClarificationError(null);
                    setClarificationModalOpen(true);
                  }}
                  disabled={isPending}
                  className="px-3 py-1.5 bg-orange-500/20 hover:bg-orange-500 text-orange-300 hover:text-navy-950 border border-orange-500/40 text-xs font-semibold uppercase tracking-wider transition-colors inline-flex items-center gap-1.5"
                >
                  <MessageSquare size={14} />
                  <span>Request Clarification</span>
                </button>

                <button
                  onClick={() => handleOpenStatusConfirm("rejected")}
                  disabled={isPending}
                  className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/40 text-xs font-semibold uppercase tracking-wider transition-colors inline-flex items-center gap-1.5"
                >
                  <AlertCircle size={14} />
                  <span>Reject</span>
                </button>

                <button
                  onClick={() => handleOpenStatusConfirm("disqualified")}
                  disabled={isPending}
                  className="px-3 py-1.5 bg-red-950/80 hover:bg-red-700 text-red-300 hover:text-white border border-red-700/50 text-xs font-semibold uppercase tracking-wider transition-colors inline-flex items-center gap-1.5"
                >
                  <AlertTriangle size={14} />
                  <span>Disqualify</span>
                </button>
              </>
            )}

            {/* If clarification_required, allow verification team to return to under_verification */}
            {app.status === "clarification_required" && (
              <button
                onClick={() => handleOpenStatusConfirm("under_verification")}
                disabled={isPending}
                className="px-3 py-1.5 bg-blue-500 hover:bg-blue-400 text-navy-950 text-xs font-semibold uppercase tracking-wider transition-colors inline-flex items-center gap-1.5"
              >
                <ArrowRight size={14} />
                <span>Move to Under Verification</span>
              </button>
            )}

            {/* If eligible, allow admin to advance to jury_review */}
            {app.status === "eligible" && (
              <button
                onClick={() => handleOpenStatusConfirm("jury_review")}
                disabled={isPending}
                className="px-3 py-1.5 bg-gold-500 hover:bg-gold-400 text-navy-950 text-xs font-semibold uppercase tracking-wider transition-colors inline-flex items-center gap-1.5"
              >
                <Sparkles size={14} />
                <span>Advance to Jury Review</span>
              </button>
            )}

            {/* If jury_review, allow shortlisted */}
            {app.status === "jury_review" && (
              <button
                onClick={() => handleOpenStatusConfirm("shortlisted")}
                disabled={isPending}
                className="px-3 py-1.5 bg-purple-500 hover:bg-purple-400 text-white text-xs font-semibold uppercase tracking-wider transition-colors inline-flex items-center gap-1.5"
              >
                <Sparkles size={14} />
                <span>Advance to Shortlist</span>
              </button>
            )}

            {/* If shortlisted, allow winner */}
            {app.status === "shortlisted" && (
              <button
                onClick={() => handleOpenStatusConfirm("winner")}
                disabled={isPending}
                className="px-3 py-1.5 bg-gold-400 hover:bg-gold-300 text-navy-950 text-xs font-semibold uppercase tracking-wider transition-colors inline-flex items-center gap-1.5"
              >
                <Sparkles size={14} />
                <span>Confirm as Winner / Laureate</span>
              </button>
            )}

            {/* If draft, inform admin that applicant has not submitted */}
            {app.status === "draft" && (
              <span className="text-xs font-mono text-slate-500 italic">
                Draft application in progress by applicant. Waiting for applicant submission.
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("notes")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
            >
              <MessageSquare size={13} className="text-gold-400" />
              <span>Internal Notes ({adminNotes.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dossier Section Tabs */}
      <div className="border-b border-white/10 flex flex-wrap gap-1">
        <button
          onClick={() => setActiveTab("project")}
          className={cn(
            "px-4 py-2.5 text-xs font-mono uppercase tracking-wider transition-all border-b-2",
            activeTab === "project"
              ? "text-gold-400 border-gold-400 font-bold bg-white/5"
              : "text-slate-400 border-transparent hover:text-slate-200 hover:bg-white/[0.02]"
          )}
        >
          1. Project &amp; Kutch Eligibility
        </button>

        <button
          onClick={() => setActiveTab("entrant")}
          className={cn(
            "px-4 py-2.5 text-xs font-mono uppercase tracking-wider transition-all border-b-2",
            activeTab === "entrant"
              ? "text-gold-400 border-gold-400 font-bold bg-white/5"
              : "text-slate-400 border-transparent hover:text-slate-200 hover:bg-white/[0.02]"
          )}
        >
          2. Entrant Profile
        </button>

        <button
          onClick={() => setActiveTab("questionnaire")}
          className={cn(
            "px-4 py-2.5 text-xs font-mono uppercase tracking-wider transition-all border-b-2",
            activeTab === "questionnaire"
              ? "text-gold-400 border-gold-400 font-bold bg-white/5"
              : "text-slate-400 border-transparent hover:text-slate-200 hover:bg-white/[0.02]"
          )}
        >
          3. Dynamic Questionnaire ({questionsAndAnswers.length})
        </button>

        <button
          onClick={() => setActiveTab("media")}
          className={cn(
            "px-4 py-2.5 text-xs font-mono uppercase tracking-wider transition-all border-b-2",
            activeTab === "media"
              ? "text-gold-400 border-gold-400 font-bold bg-white/5"
              : "text-slate-400 border-transparent hover:text-slate-200 hover:bg-white/[0.02]"
          )}
        >
          4. Media &amp; Documents ({files.length})
        </button>

        <button
          onClick={() => setActiveTab("notes")}
          className={cn(
            "px-4 py-2.5 text-xs font-mono uppercase tracking-wider transition-all border-b-2",
            activeTab === "notes"
              ? "text-gold-400 border-gold-400 font-bold bg-white/5"
              : "text-slate-400 border-transparent hover:text-slate-200 hover:bg-white/[0.02]"
          )}
        >
          5. Admin Notes ({adminNotes.length})
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={cn(
            "px-4 py-2.5 text-xs font-mono uppercase tracking-wider transition-all border-b-2",
            activeTab === "history"
              ? "text-gold-400 border-gold-400 font-bold bg-white/5"
              : "text-slate-400 border-transparent hover:text-slate-200 hover:bg-white/[0.02]"
          )}
        >
          6. Clarifications &amp; Audit Trail
        </button>
      </div>

      {/* Tab 1: Project Details & Kutch Eligibility */}
      {activeTab === "project" && (
        <div className="space-y-6">
          {/* Eligibility Audit Verification Card */}
          <div className="bg-navy-900/80 border border-white/10 p-5 space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="space-y-0.5">
                <h3 className="text-xs font-mono uppercase tracking-wider text-white font-semibold">
                  Desk Verification Checkpoints
                </h3>
                <p className="text-[11px] text-slate-400">
                  Critical compliance checks against Kutch regional boundaries and completion timeframe.
                </p>
              </div>
              <ShieldCheck size={18} className="text-gold-400" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Checkpoint 1: Kutch Geographic Eligibility */}
              <div
                className={cn(
                  "p-4 border flex items-start gap-3",
                  isKutch
                    ? "bg-emerald-950/40 border-emerald-500/40"
                    : "bg-amber-950/40 border-amber-500/40"
                )}
              >
                {isKutch ? (
                  <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
                )}
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-white flex items-center gap-2">
                    <span>Geographic Boundary Check:</span>
                    <span
                      className={cn(
                        "text-[10px] font-mono uppercase px-1.5 py-0.2 border",
                        isKutch
                          ? "bg-emerald-900/60 text-emerald-300 border-emerald-500/40"
                          : "bg-amber-900/60 text-amber-300 border-amber-500/40"
                      )}
                    >
                      {isKutch ? "Kutch Region Sited" : "Manual Review Required"}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Project City: <span className="font-semibold text-white">{app.project_city || "Not provided"}</span>, State: <span className="font-semibold text-white">{app.project_state || "Gujarat"}</span>.
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {isKutch
                      ? "The specified city matches recognized Kutch district regional settlements (Bhuj, Gandhidham, Anjar, Mandvi, Mundra, etc.)."
                      : "The city does not directly match standard Kutch district settlement names. Verification team must manually verify whether the project site is within Kutch district boundaries."}
                  </p>
                </div>
              </div>

              {/* Checkpoint 2: Completion Window Check */}
              <div
                className={cn(
                  "p-4 border flex items-start gap-3",
                  isDateValid
                    ? "bg-emerald-950/40 border-emerald-500/40"
                    : "bg-amber-950/40 border-amber-500/40"
                )}
              >
                {isDateValid ? (
                  <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
                )}
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-white flex items-center gap-2">
                    <span>Completion Window (2023–2025):</span>
                    <span
                      className={cn(
                        "text-[10px] font-mono uppercase px-1.5 py-0.2 border",
                        isDateValid
                          ? "bg-emerald-900/60 text-emerald-300 border-emerald-500/40"
                          : "bg-amber-900/60 text-amber-300 border-amber-500/40"
                      )}
                    >
                      {isDateValid ? "Eligible Date Window" : "Date Review Required"}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Project Completion Date:{" "}
                    <span className="font-semibold text-white font-mono">
                      {compDate ? compDate : "Not specified"}
                    </span>
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Official guidelines require completion between January 1, 2023 and December 31, 2025.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Project Details Grid */}
          <div className="bg-navy-900/80 border border-white/10 p-6 space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-wider text-white font-semibold pb-3 border-b border-white/10">
              Project Specification
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-xs font-sans">
              <div className="space-y-1">
                <span className="text-[11px] font-mono uppercase text-slate-400">Project Title</span>
                <p className="text-sm font-semibold text-white">{app.project_name || "Untitled"}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-mono uppercase text-slate-400">Award Category</span>
                <p className="text-sm font-semibold text-gold-400">
                  {category ? `${category.code}. ${category.name}` : "Unassigned"}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-mono uppercase text-slate-400">Built-Up Area</span>
                <p className="text-sm font-semibold text-white font-mono">
                  {app.built_up_area_sqft ? `${Number(app.built_up_area_sqft).toLocaleString()} sq. ft.` : "Not specified"}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-mono uppercase text-slate-400">Project City</span>
                <p className="text-sm font-semibold text-white">{app.project_city || "Bhuj"}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-mono uppercase text-slate-400">Project State</span>
                <p className="text-sm font-semibold text-white">{app.project_state || "Gujarat"}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-mono uppercase text-slate-400">Completion Date</span>
                <p className="text-sm font-semibold text-white font-mono">
                  {app.project_completion_date || "Not specified"}
                </p>
              </div>
            </div>

            {/* Declaration Details */}
            <div className="pt-4 border-t border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase text-slate-400">
                  Applicant Declarations &amp; Authorship
                </span>
                <span
                  className={cn(
                    "text-[10px] font-mono uppercase px-2 py-0.5 border",
                    app.declaration_accepted
                      ? "bg-emerald-950 text-emerald-400 border-emerald-500/30"
                      : "bg-slate-800 text-slate-400 border-slate-700"
                  )}
                >
                  {app.declaration_accepted ? "Declaration Accepted" : "Pending Declaration"}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                {app.declaration_accepted
                  ? `Applicant accepted all legal declarations (authorship, accuracy of information, copyright license, and terms) on ${new Date(
                      app.declaration_accepted_at || app.submitted_at || app.created_at
                    ).toLocaleString("en-IN")}.`
                  : "Declarations have not yet been accepted by the applicant."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Entrant Profile */}
      {activeTab === "entrant" && (
        <div className="bg-navy-900/80 border border-white/10 p-6 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h3 className="text-xs font-mono uppercase tracking-wider text-white font-semibold">
                Entrant &amp; Architectural Practice Profile
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Contact details, professional registration, and studio metadata.
              </p>
            </div>
            <User size={18} className="text-gold-400" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-xs font-sans">
            <div className="space-y-1">
              <span className="text-[11px] font-mono uppercase text-slate-400">Full Name</span>
              <p className="text-sm font-semibold text-white">{applicant?.fullName || "Not provided"}</p>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-mono uppercase text-slate-400">Email Address</span>
              <p className="text-sm font-mono text-gold-300">
                <a href={`mailto:${applicant?.email}`} className="hover:underline">
                  {applicant?.email || "Not provided"}
                </a>
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-mono uppercase text-slate-400">Phone / Mobile</span>
              <p className="text-sm font-mono text-white">
                {applicant?.phone ? (
                  <a href={`tel:${applicant.phone}`} className="hover:underline text-gold-300">
                    {applicant.phone}
                  </a>
                ) : (
                  <span className="text-slate-500 italic">Not specified</span>
                )}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-mono uppercase text-slate-400">Organization / Studio</span>
              <p className="text-sm font-semibold text-white">
                {applicant?.organizationName || "Independent Practitioner"}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-mono uppercase text-slate-400">Designation</span>
              <p className="text-sm font-semibold text-white">
                {applicant?.designation || "Principal Architect / Designer"}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-mono uppercase text-slate-400">Studio Location</span>
              <p className="text-sm font-semibold text-white">
                {applicant?.city || "Bhuj"}, {applicant?.state || "Gujarat"}
                {applicant?.postalCode ? ` - ${applicant.postalCode}` : ""}
              </p>
            </div>

            {applicant?.addressLine && (
              <div className="space-y-1 sm:col-span-2">
                <span className="text-[11px] font-mono uppercase text-slate-400">Office Address</span>
                <p className="text-xs text-slate-200">{applicant.addressLine}</p>
              </div>
            )}

            {applicant?.websiteUrl && (
              <div className="space-y-1">
                <span className="text-[11px] font-mono uppercase text-slate-400">Website</span>
                <p className="text-xs font-mono text-gold-300">
                  <a
                    href={applicant.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 hover:underline"
                  >
                    <span>{applicant.websiteUrl}</span>
                    <ExternalLink size={11} />
                  </a>
                </p>
              </div>
            )}

            {applicant?.portfolioUrl && (
              <div className="space-y-1">
                <span className="text-[11px] font-mono uppercase text-slate-400">Portfolio</span>
                <p className="text-xs font-mono text-gold-300">
                  <a
                    href={applicant.portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 hover:underline"
                  >
                    <span>{applicant.portfolioUrl}</span>
                    <ExternalLink size={11} />
                  </a>
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Dynamic Category Questionnaire */}
      {activeTab === "questionnaire" && (
        <div className="bg-navy-900/80 border border-white/10 p-6 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h3 className="text-xs font-mono uppercase tracking-wider text-white font-semibold">
                Category Questionnaire Responses
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Dynamic Step 4 submission responses configured for Category #{category?.code}: {category?.name}.
              </p>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 bg-gold-500/10 text-gold-400 border border-gold-500/30">
              {questionsAndAnswers.length} Questions Configured
            </span>
          </div>

          {questionsAndAnswers.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-white/10 bg-navy-950/40 text-slate-400">
              <HelpCircle size={24} className="mx-auto text-slate-600 mb-2" />
              <p className="text-xs font-mono">No dynamic questions configured for this category.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {questionsAndAnswers.map((qa, index) => {
                let formattedAnswer: React.ReactNode = null;

                if (qa.fieldType === "select" || qa.fieldType === "radio") {
                  const matchedOption = qa.options.find((o) => o.value === qa.answerText);
                  formattedAnswer = (
                    <span className="font-semibold text-gold-300">
                      {matchedOption ? matchedOption.label : qa.answerText || "Not answered"}
                    </span>
                  );
                } else if (qa.fieldType === "number") {
                  formattedAnswer = (
                    <span className="font-mono text-white font-semibold">
                      {qa.answerNumber !== null && qa.answerNumber !== undefined
                        ? qa.answerNumber
                        : qa.answerText || "Not answered"}
                    </span>
                  );
                } else if (qa.fieldType === "checkbox" && qa.answerJson) {
                  const selectedValues = Array.isArray(qa.answerJson)
                    ? qa.answerJson
                    : Object.keys(qa.answerJson);
                  formattedAnswer = (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {selectedValues.map((v: string) => (
                        <span
                          key={v}
                          className="px-2 py-0.5 bg-gold-500/10 border border-gold-500/30 text-gold-300 font-mono text-[11px]"
                        >
                          {v}
                        </span>
                      ))}
                    </div>
                  );
                } else {
                  formattedAnswer = (
                    <p className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
                      {qa.answerText || <span className="text-slate-500 italic">No answer submitted</span>}
                    </p>
                  );
                }

                return (
                  <div
                    key={qa.questionId}
                    className="p-4 bg-navy-950/60 border border-white/5 space-y-2 hover:border-white/15 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono px-1.5 py-0.2 bg-white/5 text-slate-400 border border-white/10">
                            Q{index + 1}
                          </span>
                          <span className="text-xs font-semibold text-white">
                            {qa.questionText}
                          </span>
                          {qa.isRequired && (
                            <span className="text-[10px] font-mono text-rose-400">*Required</span>
                          )}
                        </div>
                        {qa.helpText && (
                          <p className="text-[11px] text-slate-400 pl-7">{qa.helpText}</p>
                        )}
                      </div>
                      <span className="text-[10px] font-mono uppercase text-slate-500 flex-shrink-0">
                        {qa.fieldType}
                      </span>
                    </div>

                    <div className="pl-7 pt-2 border-t border-white/5">
                      <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                        Candidate Answer:
                      </div>
                      {formattedAnswer}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Media & Documents */}
      {activeTab === "media" && (
        <div className="bg-navy-900/80 border border-white/10 p-6 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h3 className="text-xs font-mono uppercase tracking-wider text-white font-semibold">
                Uploaded Architectural Drawings &amp; Photography
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Assets stored in private object storage; accessed via authenticated 1-hour signed URLs.
              </p>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 bg-gold-500/10 text-gold-400 border border-gold-500/30">
              {files.length} Assets Attached
            </span>
          </div>

          {files.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-white/10 bg-navy-950/40 text-slate-400">
              <FileText size={24} className="mx-auto text-slate-600 mb-2" />
              <p className="text-xs font-mono">No files have been uploaded for this nomination yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {files.map((file) => {
                const isPdf = file.mime_type === "application/pdf";
                const isImage = file.mime_type.startsWith("image/");
                const sizeMb = (file.file_size_bytes / (1024 * 1024)).toFixed(2);

                return (
                  <div
                    key={file.id}
                    className="p-4 bg-navy-950/70 border border-white/10 space-y-3 flex flex-col justify-between hover:border-gold-500/40 transition-colors"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 bg-white/5 text-slate-300 border border-white/10">
                          {file.requirementTitle || file.upload_type}
                        </span>
                        {file.is_cover && (
                          <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 bg-gold-500/20 text-gold-300 border border-gold-500/30">
                            Cover Image
                          </span>
                        )}
                      </div>

                      <div className="space-y-0.5">
                        <p className="text-xs font-medium text-white truncate" title={file.original_filename}>
                          {file.original_filename}
                        </p>
                        <p className="text-[10px] font-mono text-slate-400">
                          {file.mime_type} &bull; {sizeMb} MB
                        </p>
                      </div>

                      {file.caption && (
                        <p className="text-[11px] text-slate-300 italic bg-white/[0.02] p-2 border border-white/5">
                          &ldquo;{file.caption}&rdquo;
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                      {file.signedUrl ? (
                        <a
                          href={file.signedUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gold-500/10 hover:bg-gold-500 text-gold-400 hover:text-navy-950 border border-gold-500/30 text-xs font-mono font-medium transition-all w-full justify-center"
                        >
                          <Eye size={12} />
                          <span>View Secure Asset</span>
                          <ExternalLink size={10} />
                        </a>
                      ) : (
                        <span className="text-[10px] font-mono text-slate-500">
                          Signed link unavailable
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Admin Notes */}
      {activeTab === "notes" && (
        <div className="space-y-6">
          {/* Note Composer */}
          <div className="bg-navy-900/80 border border-white/10 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="text-xs font-mono uppercase tracking-wider text-white font-semibold">
                  Add Internal Review Note
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Confidential administrative observations, verification notes, and desk comments.
                </p>
              </div>
              <Lock size={16} className="text-gold-400" />
            </div>

            <form onSubmit={handleAddNote} className="space-y-3">
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-200">
                <span className="font-semibold uppercase font-mono mr-1">Confidential:</span>
                Internal notes are strictly restricted to administrators and verifiers. Applicants have zero visibility into these comments.
              </div>

              <textarea
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder="Enter verification observation, missing drawing remarks, or committee notes..."
                rows={4}
                className="w-full bg-navy-950/80 border border-white/10 p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-gold-500 transition-colors"
              />

              {noteError && (
                <div className="p-2.5 bg-rose-950/80 border border-rose-500/40 text-xs text-rose-300">
                  {noteError}
                </div>
              )}

              {noteSuccess && (
                <div className="p-2.5 bg-emerald-950/80 border border-emerald-500/40 text-xs text-emerald-300">
                  Internal note recorded successfully.
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={noteSubmitting || !newNoteText.trim()}
                  className={cn(
                    "px-4 py-2 bg-gold-500 text-navy-950 text-xs font-semibold uppercase tracking-wider transition-colors",
                    noteSubmitting || !newNoteText.trim()
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-gold-400"
                  )}
                >
                  {noteSubmitting ? "Saving Note..." : "Save Confidential Note"}
                </button>
              </div>
            </form>
          </div>

          {/* Existing Notes List */}
          <div className="bg-navy-900/80 border border-white/10 p-6 space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-wider text-white font-semibold pb-3 border-b border-white/10">
              Note Audit Log ({adminNotes.length})
            </h3>

            {adminNotes.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-white/10 bg-navy-950/40 text-slate-400">
                <MessageSquare size={24} className="mx-auto text-slate-600 mb-2" />
                <p className="text-xs font-mono">No internal notes recorded for this nomination yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {adminNotes.map((note) => (
                  <div
                    key={note.id}
                    className="p-4 bg-navy-950/60 border border-white/5 space-y-2"
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-gold-400 font-semibold">{note.authorName}</span>
                      <span className="text-slate-500">
                        {new Date(note.createdAt).toLocaleString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
                      {note.noteText}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 6: Clarifications & Audit Trail */}
      {activeTab === "history" && (
        <div className="space-y-6">
          {/* Clarifications Section */}
          <div className="bg-navy-900/80 border border-white/10 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="text-xs font-mono uppercase tracking-wider text-white font-semibold">
                  Clarification Requests History ({clarifications.length})
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Formal requests sent to applicant for missing data or document amendments.
                </p>
              </div>
              <MessageSquare size={16} className="text-gold-400" />
            </div>

            {clarifications.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-white/10 bg-navy-950/40 text-slate-400">
                <p className="text-xs font-mono">No clarification requests have been issued for this nomination.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {clarifications.map((c) => (
                  <div
                    key={c.id}
                    className="p-4 bg-navy-950/60 border border-white/10 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "text-[10px] font-mono uppercase px-2 py-0.5 border",
                            c.status === "pending"
                              ? "bg-orange-950/80 text-orange-400 border-orange-500/40"
                              : "bg-emerald-950/80 text-emerald-400 border-emerald-500/40"
                          )}
                        >
                          {c.status}
                        </span>
                        <span className="text-xs font-mono text-slate-400">
                          Issued by {c.requesterName}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-500">
                        {new Date(c.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                        Applicant Message (Visible in Dashboard):
                      </div>
                      <p className="text-xs text-white bg-navy-900/60 p-2.5 border border-white/5">
                        {c.applicantMessage}
                      </p>
                    </div>

                    {c.internalNote && (
                      <div className="space-y-1">
                        <div className="text-[10px] font-mono uppercase tracking-wider text-amber-400">
                          Internal Verifier Context (Confidential):
                        </div>
                        <p className="text-xs text-amber-200/90 bg-amber-950/30 p-2.5 border border-amber-500/20 italic">
                          {c.internalNote}
                        </p>
                      </div>
                    )}

                    {c.responseText && (
                      <div className="space-y-1 pt-2 border-t border-white/5">
                        <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-400">
                          Applicant Response ({c.respondedAt ? new Date(c.respondedAt).toLocaleDateString("en-IN") : ""}):
                        </div>
                        <p className="text-xs text-slate-200 bg-emerald-950/20 p-2.5 border border-emerald-500/20">
                          {c.responseText}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Status Transitions Audit Trail */}
          <div className="bg-navy-900/80 border border-white/10 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="text-xs font-mono uppercase tracking-wider text-white font-semibold">
                  Status Transition Audit History ({statusHistory.length})
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Chronological lifecycle progression enforced by the state machine.
                </p>
              </div>
              <History size={16} className="text-gold-400" />
            </div>

            {statusHistory.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-white/10 bg-navy-950/40 text-slate-400">
                <p className="text-xs font-mono">No status transitions recorded yet.</p>
              </div>
            ) : (
              <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/10">
                {statusHistory.map((item, idx) => (
                  <div key={item.id} className="relative space-y-1 text-xs">
                    <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-gold-400 border-2 border-navy-950" />
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-slate-400">
                        {item.fromStatus ? item.fromStatus.replace("_", " ") : "Initial"}
                      </span>
                      <ArrowRight size={12} className="text-gold-400" />
                      <span className="font-mono font-semibold text-white uppercase px-1.5 py-0.2 bg-white/5 border border-white/10">
                        {item.toStatus.replace("_", " ")}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        by {item.changerName} on{" "}
                        {new Date(item.createdAt).toLocaleString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    {item.comments && (
                      <p className="text-[11px] text-slate-400 bg-white/[0.02] p-2 border border-white/5">
                        {item.comments}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Status Transitions */}
      {statusActionOpen && (
        <div className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-navy-900 border border-white/10 max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-display text-white font-medium">
              Confirm Status Transition
            </h3>
            <p className="text-xs text-slate-300">
              Are you sure you want to transition this application from{" "}
              <span className="font-mono font-semibold text-gold-400">
                {app.status.replace("_", " ")}
              </span>{" "}
              to{" "}
              <span className="font-mono font-semibold text-white uppercase">
                {selectedNextStatus?.replace("_", " ")}
              </span>
              ?
            </p>

            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase text-slate-400">
                Audit Commentary / Reason (Optional)
              </label>
              <textarea
                value={statusComment}
                onChange={(e) => setStatusComment(e.target.value)}
                placeholder="e.g. Eligibility verified against Kutch location criteria; approved for jury."
                rows={3}
                className="w-full bg-navy-950/80 border border-white/10 p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-gold-500"
              />
            </div>

            {statusActionError && (
              <div className="p-2.5 bg-rose-950/80 border border-rose-500/40 text-xs text-rose-300">
                {statusActionError}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setStatusActionOpen(false)}
                disabled={isPending}
                className="px-3 py-1.5 text-xs font-mono text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmStatusChange}
                disabled={isPending}
                className="px-4 py-1.5 bg-gold-500 hover:bg-gold-400 text-navy-950 text-xs font-semibold uppercase tracking-wider transition-colors"
              >
                {isPending ? "Updating..." : "Confirm Transition"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clarification Request Modal */}
      {clarificationModalOpen && (
        <div className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-navy-900 border border-white/10 max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="space-y-0.5">
                <h3 className="text-base font-display text-white font-medium">
                  Request Clarification from Applicant
                </h3>
                <p className="text-[11px] text-slate-400">
                  This will transition the entry to &ldquo;Clarification Required&rdquo; and unlock it for applicant revisions.
                </p>
              </div>
              <MessageSquare size={18} className="text-orange-400" />
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase text-slate-300 flex items-center justify-between">
                  <span>Applicant Message (Mandatory)</span>
                  <span className="text-[10px] text-orange-400">Displayed in Applicant Dashboard</span>
                </label>
                <textarea
                  value={clarificationMessage}
                  onChange={(e) => setClarificationMessage(e.target.value)}
                  placeholder="e.g. Please upload high-resolution floor plans as the current PDF is unreadable, or clarify the built-up area..."
                  rows={4}
                  className="w-full bg-navy-950/80 border border-white/10 p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-gold-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase text-slate-400 flex items-center justify-between">
                  <span>Internal Note (Optional)</span>
                  <span className="text-[10px] text-slate-500">Confidential to Verifiers</span>
                </label>
                <textarea
                  value={internalNote}
                  onChange={(e) => setInternalNote(e.target.value)}
                  placeholder="Internal audit note for verification team records..."
                  rows={2}
                  className="w-full bg-navy-950/80 border border-white/10 p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-gold-500"
                />
              </div>

              {clarificationError && (
                <div className="p-2.5 bg-rose-950/80 border border-rose-500/40 text-xs text-rose-300">
                  {clarificationError}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setClarificationModalOpen(false)}
                disabled={isPending}
                className="px-3 py-1.5 text-xs font-mono text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendClarification}
                disabled={isPending || !clarificationMessage.trim()}
                className="px-4 py-1.5 bg-orange-500 hover:bg-orange-400 text-navy-950 text-xs font-semibold uppercase tracking-wider transition-colors"
              >
                {isPending ? "Sending Request..." : "Send Clarification Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
