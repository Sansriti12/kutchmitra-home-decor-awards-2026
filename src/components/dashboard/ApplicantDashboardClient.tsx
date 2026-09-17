"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Building2,
  MapPin,
  Mail,
  Phone,
  ShieldCheck,
  LogOut,
  Sparkles,
  Clock,
  FileText,
  AlertCircle,
  PlusCircle,
  ArrowRight,
  Edit3,
  CheckCircle2,
  Copy,
  Printer,
  X,
  ExternalLink,
  HelpCircle,
  Bell,
  Layers,
  ChevronRight,
  Info,
  Loader2,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { updateApplicantProfile } from "@/lib/auth/profile-actions";

export interface ApplicationItem {
  id: string;
  nomination_id: string;
  edition_id: string;
  category_id: string;
  project_name: string;
  project_city: string;
  project_state: string;
  project_completion_date: string | null;
  built_up_area_sqft: number | null;
  status: string;
  current_wizard_step: number;
  declaration_accepted: boolean;
  declaration_accepted_at: string | null;
  submitted_at: string | null;
  is_locked: boolean;
  created_at: string;
  updated_at: string;
  category?: {
    code: string;
    name: string;
    slug: string;
  } | null;
}

export interface NotificationItem {
  id: string;
  subject: string | null;
  body: string;
  channel: string;
  notification_type: string;
  status: string;
  created_at: string;
}

export interface CategoryItem {
  id: string;
  code: string;
  name: string;
  slug: string;
  short_description: string;
}

interface ApplicantDashboardClientProps {
  user: {
    id: string;
    email?: string;
  };
  dbUser: {
    full_name: string;
    email: string;
    phone: string | null;
    is_active: boolean;
    created_at: string;
  } | null;
  profile: {
    organization_name: string | null;
    designation: string | null;
    city: string;
    state: string;
    postal_code: string | null;
    address_line: string | null;
    website_url: string | null;
    portfolio_url: string | null;
  } | null;
  roles: string[];
  applications: ApplicationItem[];
  notifications: NotificationItem[];
  categories: CategoryItem[];
}

const WIZARD_STEP_LABELS: Record<number, string> = {
  1: "Complete Entrant & Practice Profile",
  2: "Confirm Award Discipline",
  3: "Enter Project Details & Spatial Data",
  4: "Review Category Questionnaire (Official config pending)",
  5: "Upload Architectural Drawings & Media",
  6: "Inspect Full Dossier Preview",
  7: "Review Declaration & Submit when officially unlocked",
};

const WIZARD_NEXT_ACTIONS: Record<number, { title: string; desc: string }> = {
  1: {
    title: "Complete Entrant & Practice Profile",
    desc: "Verify your architectural studio, designation, contact numbers, and official practice details.",
  },
  2: {
    title: "Confirm Award Category",
    desc: "Review your selected discipline or switch to another of the 13 official award categories.",
  },
  3: {
    title: "Enter Project Details & Spatial Data",
    desc: "Specify project location, completion year, built-up area in sq. ft., and design narrative.",
  },
  4: {
    title: "Review Category Questionnaire",
    desc: "Category questions are currently pending organizing committee ratification. You may proceed directly to uploads.",
  },
  5: {
    title: "Upload Architectural Drawings & Media",
    desc: "Attach project photography, floor plans, 3D renderings, and studio portfolio files.",
  },
  6: {
    title: "Inspect Complete Dossier Preview",
    desc: "Inspect a comprehensive, formatted preview of your application before proceeding to declaration.",
  },
  7: {
    title: "Review Declaration & Official Submission Status",
    desc: "Review the declaration checkpoints. Final submission opens upon official criteria ratification.",
  },
};

const STATUS_CONFIG: Record<
  string,
  { label: string; text: string; bg: string; border: string; desc: string }
> = {
  draft: {
    label: "Draft",
    text: "text-amber-800",
    bg: "bg-amber-50",
    border: "border-amber-200",
    desc: "Incomplete draft. Continue editing to submit.",
  },
  submitted: {
    label: "Submitted",
    text: "text-blue-800",
    bg: "bg-blue-50",
    border: "border-blue-200",
    desc: "Application locked and received. Pending verification audit.",
  },
  under_verification: {
    label: "Under Verification",
    text: "text-indigo-800",
    bg: "bg-indigo-50",
    border: "border-indigo-200",
    desc: "Verification team is reviewing document completeness and eligibility.",
  },
  clarification_required: {
    label: "Clarification Required",
    text: "text-orange-800",
    bg: "bg-orange-50",
    border: "border-orange-200",
    desc: "Action required: Verifiers requested additional details or document updates.",
  },
  eligible: {
    label: "Eligible",
    text: "text-emerald-800",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    desc: "Eligibility verified. Approved for jury assignment.",
  },
  jury_review: {
    label: "Jury Review",
    text: "text-purple-800",
    bg: "bg-purple-50",
    border: "border-purple-200",
    desc: "Under confidential jury review and criteria scoring.",
  },
  shortlisted: {
    label: "Shortlisted",
    text: "text-gold-700",
    bg: "bg-gold-50",
    border: "border-gold-300",
    desc: "Selected as an official award finalist by the organizing committee.",
  },
  winner: {
    label: "Winner / Honoree",
    text: "text-amber-900",
    bg: "bg-amber-100",
    border: "border-amber-400",
    desc: "Officially recognized award winner.",
  },
  rejected: {
    label: "Not Selected",
    text: "text-slate-700",
    bg: "bg-slate-100",
    border: "border-slate-200",
    desc: "Application did not qualify or was not selected.",
  },
  disqualified: {
    label: "Disqualified",
    text: "text-rose-800",
    bg: "bg-rose-50",
    border: "border-rose-200",
    desc: "Disqualified due to guideline breach or false declaration.",
  },
};

export default function ApplicantDashboardClient({
  user,
  dbUser,
  profile,
  roles,
  applications,
  notifications,
  categories,
}: ApplicantDashboardClientProps) {
  const router = useRouter();

  // Profile Edit Modal State
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    fullName: dbUser?.full_name || "",
    phone: dbUser?.phone || "",
    organizationName: profile?.organization_name || "",
    designation: profile?.designation || "",
    city: profile?.city || "",
    state: profile?.state || "Gujarat",
    postalCode: profile?.postal_code || "",
    addressLine: profile?.address_line || "",
    websiteUrl: profile?.website_url || "",
    portfolioUrl: profile?.portfolio_url || "",
  });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileUpdateMsg, setProfileUpdateMsg] = useState<{ text: string; isError: boolean } | null>(null);

  // Synchronize profile form when props change
  useEffect(() => {
    setProfileForm({
      fullName: dbUser?.full_name || "",
      phone: dbUser?.phone || "",
      organizationName: profile?.organization_name || "",
      designation: profile?.designation || "",
      city: profile?.city || "",
      state: profile?.state || "Gujarat",
      postalCode: profile?.postal_code || "",
      addressLine: profile?.address_line || "",
      websiteUrl: profile?.website_url || "",
      portfolioUrl: profile?.portfolio_url || "",
    });
  }, [dbUser, profile]);

  // Handle Escape key to close modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsEditProfileOpen(false);
        setIsSubmissionViewOpen(false);
        setIsAckOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Modals for Submitted Application Details and Acknowledgement
  const [selectedSubmission, setSelectedSubmission] = useState<ApplicationItem | null>(null);
  const [isSubmissionViewOpen, setIsSubmissionViewOpen] = useState(false);
  const [isAckOpen, setIsAckOpen] = useState(false);

  // Copy feedback
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Group applications into Drafts and Submitted
  const drafts = applications.filter((app) => app.status === "draft" && !app.is_locked);
  const submitted = applications.filter((app) => app.status !== "draft" || app.is_locked);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setProfileUpdateMsg(null);

    const res = await updateApplicantProfile(profileForm);
    setIsUpdatingProfile(false);

    if (res.success) {
      setProfileUpdateMsg({ text: "Profile details updated successfully!", isError: false });
      setTimeout(() => {
        setIsEditProfileOpen(false);
        setProfileUpdateMsg(null);
        router.refresh();
      }, 1000);
    } else {
      setProfileUpdateMsg({ text: res.error || "Failed to update profile", isError: true });
    }
  };

  return (
    <main className="flex-1 bg-ivory text-navy-900 py-10 sm:py-16 font-sans">
      <div className="container-editorial max-w-6xl mx-auto space-y-8">
        {/* ========================================================================= */}
        {/* TOP HEADER: Greeting, Actions & Sign Out */}
        {/* ========================================================================= */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-navy-900/10 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-gold-600 font-semibold">
                Applicant Portal
              </span>
              <span className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider bg-gold-500/10 text-gold-700 border border-gold-500/20">
                2026 Edition
              </span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl text-navy-900 font-medium">
              {dbUser?.full_name || "Applicant Dashboard"}
            </h1>
            <p className="text-xs text-[#4A4F5C]">
              {profile?.organization_name
                ? `${profile.organization_name} • ${profile.city}, ${profile.state}`
                : `${profile?.city || "Kutch"}, ${profile?.state || "Gujarat"}`}
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2.5">
            <Button
              href="/dashboard/nominations/new"
              variant="primary"
              size="md"
              icon={<PlusCircle size={15} />}
              className="whitespace-nowrap"
            >
              Start New Nomination
            </Button>

            <button
              type="button"
              onClick={() => setIsEditProfileOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-navy-900/15 bg-white hover:bg-slate-50 text-xs font-mono uppercase tracking-wider text-navy-900 transition-colors"
            >
              <Edit3 size={13} className="text-gold-600" />
              <span>Edit Profile</span>
            </button>

            <form action="/auth/logout" method="POST">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-navy-900/15 bg-white hover:bg-red-50 text-xs font-mono uppercase tracking-wider text-navy-900 hover:text-red-700 transition-colors"
              >
                <LogOut size={13} className="text-slate-400 hover:text-red-600" />
                <span>Sign Out</span>
              </button>
            </form>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* DASHBOARD SUMMARY / KPI STRIP */}
        {/* ========================================================================= */}
        {/* ========================================================================= */}
        {/* DASHBOARD SUMMARY / KPI STRIP */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#FBFAF7] border border-navy-900/10 p-5 shadow-card space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block font-medium">
              Active Drafts
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-3xl text-navy-900 font-semibold">{drafts.length}</span>
              <span className="text-xs font-mono text-amber-700">
                {drafts.length === 1 ? "1 in progress" : `${drafts.length} in progress`}
              </span>
            </div>
          </div>

          <div className="bg-[#FBFAF7] border border-navy-900/10 p-5 shadow-card space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block font-medium">
              Submitted Entries
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-3xl text-navy-900 font-semibold">{submitted.length}</span>
              <span className="text-xs font-mono text-blue-700">
                {submitted.length === 1 ? "1 submitted" : `${submitted.length} submitted`}
              </span>
            </div>
          </div>

          <div className="bg-[#FBFAF7] border border-navy-900/10 p-5 shadow-card space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block font-medium">
              Total Nominations
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-3xl text-navy-900 font-semibold">{applications.length}</span>
              <span className="text-xs font-mono text-slate-500">
                {applications.length === 1 ? "1 total entry" : `${applications.length} total entries`}
              </span>
            </div>
          </div>

          <div className="bg-[#FBFAF7] border border-navy-900/10 p-5 shadow-card space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block font-medium">
              Portal Submission State
            </span>
            <div className="pt-1">
              <span className="inline-block px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider font-semibold border bg-amber-50 text-amber-900 border-amber-300">
                Drafts Open • Official Submission Pending Committee Ratification
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* GLOBAL EMPTY STATE: When applicant has zero drafts and zero submissions */}
        {/* ========================================================================= */}
        {applications.length === 0 && (
          <div className="bg-[#FBFAF7] border-2 border-dashed border-gold-500/30 p-8 sm:p-12 text-center space-y-4 shadow-sm">
            <div className="w-14 h-14 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-700 flex items-center justify-center mx-auto">
              <Sparkles size={26} />
            </div>
            <div className="space-y-2 max-w-md mx-auto">
              <h3 className="font-display text-2xl text-navy-900 font-medium">
                Begin Your First Nomination
              </h3>
              <p className="text-xs sm:text-sm text-[#4A4F5C] leading-relaxed font-sans">
                Welcome to the Kutchmitra Home &amp; Decor Awards 2026. You can begin a nomination in any of our 13 award disciplines, save your draft at any step, and return to complete it whenever you wish.
              </p>
            </div>
            <div className="pt-2">
              <Button
                href="/dashboard/nominations/new"
                variant="primary"
                size="lg"
                icon={<ArrowRight size={15} />}
                className="px-8 font-semibold tracking-wider text-xs uppercase"
              >
                Start Your First Nomination
              </Button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MAIN BODY: Two Columns (Nominations Left, Profile & Notifications Right) */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT 2 COLUMNS: MY NOMINATIONS */}
          <div className="lg:col-span-2 space-y-8">
            {/* 1. DRAFT NOMINATIONS */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-navy-900/10 pb-3">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-gold-600" />
                  <h2 className="font-display text-xl text-navy-900 font-medium">
                    Draft Nominations ({drafts.length})
                  </h2>
                </div>
                {drafts.length > 0 && (
                  <span className="text-xs font-mono text-slate-500">Unsubmitted entries</span>
                )}
              </div>

              {drafts.length === 0 ? (
                applications.length > 0 && (
                  <div className="bg-[#FBFAF7] border border-dashed border-navy-900/15 p-6 text-center space-y-2">
                    <p className="text-xs text-[#4A4F5C]">
                      You currently have no unsubmitted drafts. All your entries are submitted and locked.
                    </p>
                    <div className="pt-1">
                      <Button
                        href="/dashboard/nominations/new"
                        variant="primary"
                        size="sm"
                        icon={<PlusCircle size={13} />}
                      >
                        Start Another Nomination
                      </Button>
                    </div>
                  </div>
                )
              ) : (
                <div className="space-y-4">
                  {drafts.map((draft) => {
                    const stepNum = draft.current_wizard_step || 1;
                    const stepLabel = WIZARD_STEP_LABELS[stepNum] || `Step ${stepNum}`;
                    const progressPercent = Math.round(((stepNum - 1) / 7) * 100);
                    const nextAction = WIZARD_NEXT_ACTIONS[stepNum] || WIZARD_NEXT_ACTIONS[1];
                    const isAutoName = !draft.project_name || draft.project_name.startsWith("Draft Entry (");
                    const displayTitle = isAutoName ? "Untitled Nomination" : draft.project_name;

                    return (
                      <div
                        key={draft.id}
                        className="bg-[#FBFAF7] border border-navy-900/10 p-5 sm:p-6 shadow-card hover:border-gold-500/40 transition-colors space-y-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] font-mono uppercase tracking-wider text-gold-700 bg-gold-500/10 px-2 py-0.5 border border-gold-500/20 font-semibold">
                                #{draft.category?.code || "CAT"} • {draft.category?.name || "Category Pending"}
                              </span>
                              <span className="text-[11px] font-mono text-slate-400">
                                Draft ID: {draft.nomination_id || "Unassigned"}
                              </span>
                            </div>
                            <h3 className="font-display text-lg sm:text-xl text-navy-900 font-medium pt-1">
                              {displayTitle}
                            </h3>
                            <p className="text-xs text-[#4A4F5C] font-sans">
                              Location: {draft.project_city || profile?.city || "Kutch"},{" "}
                              {draft.project_state || profile?.state || "Gujarat"}
                            </p>
                          </div>

                          <Button
                            href={`/dashboard/nominations/${draft.id}`}
                            variant="primary"
                            size="md"
                            icon={<ArrowRight size={13} />}
                            className="whitespace-nowrap flex-shrink-0 !px-4 !py-2 text-xs font-semibold tracking-wider uppercase"
                          >
                            Continue Nomination →
                          </Button>
                        </div>

                        {/* What Do I Do Next Guidance */}
                        {nextAction && (
                          <div className="p-3 bg-white border border-gold-500/30 space-y-1">
                            <div className="flex items-center gap-1.5 text-gold-700 font-mono text-[11px] uppercase tracking-wider font-semibold">
                              <Sparkles size={13} className="text-gold-600" />
                              <span>Next Action Required: {nextAction.title}</span>
                            </div>
                            <p className="text-xs text-[#4A4F5C] font-sans leading-relaxed">
                              {nextAction.desc}
                            </p>
                          </div>
                        )}

                        {/* Step Progress Bar */}
                        <div className="space-y-1.5 pt-2 border-t border-navy-900/10">
                          <div className="flex items-center justify-between text-xs font-mono">
                            <span className="text-slate-600">
                              Current Progress:{" "}
                              <strong className="text-navy-900">
                                Step {stepNum} of 7 — {stepLabel}
                              </strong>
                            </span>
                            <span className="text-gold-700 font-semibold">{progressPercent}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-navy-900/10 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gold-500 transition-all duration-300"
                              style={{ width: `${Math.max(progressPercent, 10)}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-mono text-slate-500 block">
                            Last updated: {new Date(draft.updated_at).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })} at{" "}
                            {new Date(draft.updated_at).toLocaleTimeString("en-IN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 2. SUBMITTED NOMINATIONS */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-navy-900/10 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-gold-600" />
                  <h2 className="font-display text-xl text-navy-900 font-medium">
                    Submitted Nominations ({submitted.length})
                  </h2>
                </div>
                {submitted.length > 0 && (
                  <span className="text-xs font-mono text-slate-500">Official Award Entries</span>
                )}
              </div>

              {submitted.length === 0 ? (
                <div className="bg-[#FBFAF7] border border-navy-900/10 p-6 text-center text-xs text-[#4A4F5C] space-y-2">
                  <p>No submitted nominations yet.</p>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Once you complete all 7 steps of a draft and submit the declaration, your locked entry
                    and official Nomination ID will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {submitted.map((sub) => {
                    const statusCfg = STATUS_CONFIG[sub.status] || STATUS_CONFIG.submitted;

                    return (
                      <div
                        key={sub.id}
                        className="bg-[#FBFAF7] border border-navy-900/10 p-5 shadow-card space-y-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                          <div className="space-y-1">
                            {/* Nomination ID Header with Copy Button */}
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-xs font-bold text-navy-900 bg-white border border-navy-900/15 px-2.5 py-1 tracking-wider">
                                {sub.nomination_id}
                              </span>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(sub.nomination_id)}
                                className="text-slate-400 hover:text-gold-600 transition-colors p-1"
                                title="Copy Nomination ID"
                                aria-label={`Copy Nomination ID ${sub.nomination_id}`}
                              >
                                {copiedId === sub.nomination_id ? (
                                  <span className="text-[10px] font-mono text-green-600 font-semibold">
                                    Copied!
                                  </span>
                                ) : (
                                  <Copy size={13} />
                                )}
                              </button>

                              {/* Status Badge */}
                              <span
                                className={`px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-wider font-semibold border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}
                              >
                                {statusCfg.label}
                              </span>
                            </div>

                            <h3 className="font-display text-lg text-navy-900 font-medium pt-1">
                              {sub.project_name}
                            </h3>

                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#4A4F5C] font-sans">
                              <span>
                                Category:{" "}
                                <strong className="text-navy-900">
                                  {sub.category?.name || "Architectural Entry"}
                                </strong>
                              </span>
                              <span>•</span>
                              <span>
                                Location: {sub.project_city}, {sub.project_state}
                              </span>
                              {sub.submitted_at && (
                                <>
                                  <span>•</span>
                                  <span>
                                    Submitted:{" "}
                                    {new Date(sub.submitted_at).toLocaleDateString("en-IN", {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                    })}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedSubmission(sub);
                                setIsSubmissionViewOpen(true);
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-navy-900/15 bg-white hover:bg-slate-50 text-xs font-mono uppercase tracking-wider text-navy-900 transition-colors"
                            >
                              <FileText size={12} className="text-gold-600" />
                              <span>View Dossier</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setSelectedSubmission(sub);
                                setIsAckOpen(true);
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gold-500/30 bg-gold-500/10 hover:bg-gold-500/20 text-xs font-mono uppercase tracking-wider text-gold-800 transition-colors"
                            >
                              <Printer size={12} className="text-gold-700" />
                              <span>Acknowledgement</span>
                            </button>
                          </div>
                        </div>

                        {/* Status Description Box */}
                        <div className="p-3 bg-white border border-navy-900/10 text-xs text-[#4A4F5C] flex items-start gap-2">
                          <Info size={14} className="text-gold-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-navy-900 font-medium">Status Note: </strong>
                            <span>{statusCfg.desc}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT 1 COLUMN: PROFILE SUMMARY, NOTIFICATIONS & SUPPORT */}
          <div className="space-y-6">
            {/* 1. APPLICANT PROFILE SUMMARY CARD */}
            <div className="bg-[#FBFAF7] border border-navy-900/10 p-6 shadow-card space-y-4">
              <div className="flex items-center justify-between border-b border-navy-900/10 pb-3">
                <div className="flex items-center gap-2">
                  <User size={15} className="text-gold-600" />
                  <h3 className="font-display text-base text-navy-900 font-medium">
                    Profile Summary
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(true)}
                  className="text-xs font-mono text-gold-600 hover:text-gold-700 underline flex items-center gap-1"
                >
                  <Edit3 size={11} />
                  <span>Edit</span>
                </button>
              </div>

              <div className="space-y-3 text-xs font-sans">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                    Full Name
                  </span>
                  <p className="font-medium text-navy-900">{dbUser?.full_name || "Applicant"}</p>
                </div>

                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                    Studio / Firm
                  </span>
                  <p className="font-medium text-navy-900">
                    {profile?.organization_name || "Independent Architectural Practice"}
                  </p>
                </div>

                {profile?.designation && (
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                      Designation
                    </span>
                    <p className="font-medium text-navy-900">{profile.designation}</p>
                  </div>
                )}

                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                    Email Address
                  </span>
                  <p className="font-medium text-navy-900 break-all">{dbUser?.email || user.email}</p>
                </div>

                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                    Mobile Number
                  </span>
                  <p className="font-medium text-navy-900">{dbUser?.phone || "Not provided"}</p>
                </div>

                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                    Location &amp; Address
                  </span>
                  <p className="font-medium text-navy-900">
                    {profile?.address_line ? `${profile.address_line}, ` : ""}
                    {profile?.city || "Kutch"}, {profile?.state || "Gujarat"}
                    {profile?.postal_code ? ` - ${profile.postal_code}` : ""}
                  </p>
                </div>

                {profile?.website_url && (
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                      Website
                    </span>
                    <a
                      href={profile.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gold-600 hover:underline flex items-center gap-1"
                    >
                      <span>{profile.website_url.replace(/^https?:\/\//, "")}</span>
                      <ExternalLink size={10} />
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* 2. NOTIFICATIONS & ALERTS COMPONENT */}
            <div className="bg-[#FBFAF7] border border-navy-900/10 p-6 shadow-card space-y-4">
              <div className="flex items-center justify-between border-b border-navy-900/10 pb-3">
                <div className="flex items-center gap-2">
                  <Bell size={15} className="text-gold-600" />
                  <h3 className="font-display text-base text-navy-900 font-medium">
                    Notifications &amp; Alerts
                  </h3>
                </div>
                {notifications.length > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] font-mono bg-gold-500/20 text-gold-800 rounded">
                    {notifications.length}
                  </span>
                )}
              </div>

              {notifications.length === 0 ? (
                <div className="text-xs text-[#4A4F5C] space-y-1">
                  <p className="font-medium text-navy-900">No active alerts</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Official announcements, submission confirmations, and verification clarification
                    requests will be delivered to this inbox.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className="p-3 bg-white border border-navy-900/10 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-navy-900">{notif.subject || "System Notice"}</span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {new Date(notif.created_at).toLocaleDateString("en-IN")}
                        </span>
                      </div>
                      <p className="text-slate-600 leading-relaxed">{notif.body}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 3. AWARDS HELP & SUPPORT CARD */}
            <div className="bg-[#FBFAF7] border border-navy-900/10 p-6 shadow-card space-y-3">
              <div className="flex items-center gap-2 text-gold-600">
                <HelpCircle size={16} />
                <h3 className="font-display text-base text-navy-900 font-medium">
                  Support &amp; Guidelines
                </h3>
              </div>
              <p className="text-xs text-[#4A4F5C] leading-relaxed">
                Need clarification regarding category eligibility, drawing upload specifications, or entry
                guidelines?
              </p>
              <div className="pt-2 flex flex-col gap-2">
                <Link
                  href="/how-to-nominate"
                  className="inline-flex items-center justify-between text-xs font-mono uppercase tracking-wider text-navy-900 hover:text-gold-600 p-2 bg-white border border-navy-900/10 transition-colors"
                >
                  <span>How to Nominate Guide</span>
                  <ChevronRight size={13} />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-between text-xs font-mono uppercase tracking-wider text-navy-900 hover:text-gold-600 p-2 bg-white border border-navy-900/10 transition-colors"
                >
                  <span>Contact Helpdesk</span>
                  <ChevronRight size={13} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: EDIT PROFILE MODAL */}
      {/* ========================================================================= */}
      {isEditProfileOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-profile-modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsEditProfileOpen(false);
          }}
          className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-up"
        >
          <div className="bg-[#FBFAF7] border border-navy-900/20 max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-navy-900/10 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 size={16} className="text-gold-600" />
                <h2 id="edit-profile-modal-title" className="font-display text-xl text-navy-900 font-medium">
                  Edit Applicant Profile
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsEditProfileOpen(false)}
                aria-label="Close edit profile dialog"
                className="p-1 text-slate-400 hover:text-navy-900 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {profileUpdateMsg && (
              <div
                className={`p-3 text-xs font-sans border ${
                  profileUpdateMsg.isError
                    ? "bg-red-50 border-red-200 text-red-700"
                    : "bg-green-50 border-green-200 text-green-700"
                }`}
              >
                {profileUpdateMsg.text}
              </div>
            )}

            <form onSubmit={handleProfileSave} className="space-y-4 text-xs font-sans">
              <div className="space-y-1.5">
                <label className="font-mono text-[11px] uppercase text-navy-900 font-semibold block">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={profileForm.fullName}
                  onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border border-navy-900/15 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-mono text-[11px] uppercase text-navy-900 font-semibold block">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-white border border-navy-900/15 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-mono text-[11px] uppercase text-navy-900 font-semibold block">
                    Designation
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Principal Architect"
                    value={profileForm.designation}
                    onChange={(e) => setProfileForm({ ...profileForm, designation: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-white border border-navy-900/15 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-[11px] uppercase text-navy-900 font-semibold block">
                  Studio / Architectural Firm Name *
                </label>
                <input
                  type="text"
                  required
                  value={profileForm.organizationName}
                  onChange={(e) => setProfileForm({ ...profileForm, organizationName: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border border-navy-900/15 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-[11px] uppercase text-navy-900 font-semibold block">
                  Studio Address
                </label>
                <input
                  type="text"
                  placeholder="Street, Suite or Building"
                  value={profileForm.addressLine}
                  onChange={(e) => setProfileForm({ ...profileForm, addressLine: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border border-navy-900/15 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="font-mono text-[11px] uppercase text-navy-900 font-semibold block">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={profileForm.city}
                    onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-white border border-navy-900/15 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-mono text-[11px] uppercase text-navy-900 font-semibold block">
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    value={profileForm.state}
                    onChange={(e) => setProfileForm({ ...profileForm, state: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-white border border-navy-900/15 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-mono text-[11px] uppercase text-navy-900 font-semibold block">
                    PIN Code
                  </label>
                  <input
                    type="text"
                    placeholder="370001"
                    value={profileForm.postalCode}
                    onChange={(e) => setProfileForm({ ...profileForm, postalCode: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-white border border-navy-900/15 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-mono text-[11px] uppercase text-navy-900 font-semibold block">
                    Website URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://firm.com"
                    value={profileForm.websiteUrl}
                    onChange={(e) => setProfileForm({ ...profileForm, websiteUrl: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-white border border-navy-900/15 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-mono text-[11px] uppercase text-navy-900 font-semibold block">
                    Portfolio / Social URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://instagram.com/firm"
                    value={profileForm.portfolioUrl}
                    onChange={(e) => setProfileForm({ ...profileForm, portfolioUrl: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-white border border-navy-900/15 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-navy-900/10">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  disabled={isUpdatingProfile}
                  className="px-4 py-2 border border-navy-900/15 bg-white text-xs font-mono uppercase tracking-wider text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isUpdatingProfile}
                  icon={isUpdatingProfile ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                >
                  {isUpdatingProfile ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: SUBMISSION READ-ONLY VIEW (View Dossier) */}
      {/* ========================================================================= */}
      {isSubmissionViewOpen && selectedSubmission && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="dossier-modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsSubmissionViewOpen(false);
          }}
          className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-up"
        >
          <div className="bg-[#FBFAF7] border border-navy-900/20 max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8">
            <div className="flex items-start justify-between border-b border-navy-900/10 pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-gold-700 font-semibold block">
                  Official Award Dossier • Read-Only
                </span>
                <h2 id="dossier-modal-title" className="font-display text-2xl text-navy-900 font-medium pt-1">
                  {selectedSubmission.project_name}
                </h2>
                <span className="font-mono text-xs font-bold text-navy-900">
                  Nomination ID: {selectedSubmission.nomination_id}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsSubmissionViewOpen(false)}
                aria-label="Close dossier dialog"
                className="p-1 text-slate-400 hover:text-navy-900 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Application Details Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans p-4 bg-white border border-navy-900/10">
              <div>
                <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider block">
                  Award Category
                </span>
                <p className="font-semibold text-navy-900">
                  {selectedSubmission.category?.name || "Architectural Category"}
                </p>
              </div>

              <div>
                <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider block">
                  Project Location
                </span>
                <p className="font-semibold text-navy-900">
                  {selectedSubmission.project_city}, {selectedSubmission.project_state}
                </p>
              </div>

              {selectedSubmission.built_up_area_sqft && (
                <div>
                  <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider block">
                    Built-Up Area
                  </span>
                  <p className="font-semibold text-navy-900">
                    {selectedSubmission.built_up_area_sqft} sq. ft.
                  </p>
                </div>
              )}

              {selectedSubmission.project_completion_date && (
                <div>
                  <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider block">
                    Completion Date
                  </span>
                  <p className="font-semibold text-navy-900">
                    {new Date(selectedSubmission.project_completion_date).toLocaleDateString("en-IN")}
                  </p>
                </div>
              )}

              <div>
                <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider block">
                  Submission Status
                </span>
                <p className="font-semibold text-blue-800 uppercase font-mono">
                  {selectedSubmission.status} (Locked)
                </p>
              </div>

              <div>
                <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider block">
                  Declaration Timestamp
                </span>
                <p className="font-semibold text-navy-900">
                  {selectedSubmission.submitted_at
                    ? new Date(selectedSubmission.submitted_at).toLocaleString("en-IN")
                    : "Completed"}
                </p>
              </div>
            </div>

            <div className="p-3 bg-navy-900/5 border border-navy-900/10 text-xs font-mono text-[#4A4F5C] flex items-center gap-2">
              <ShieldCheck size={14} className="text-emerald-700 flex-shrink-0" />
              <span>
                This nomination is officially locked in compliance with competition governance rules.
              </span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsSubmissionViewOpen(false);
                  setIsAckOpen(true);
                }}
                className="px-4 py-2 border border-gold-500/30 bg-gold-500/10 text-gold-800 text-xs font-mono uppercase tracking-wider hover:bg-gold-500/20 transition-colors flex items-center gap-1.5"
              >
                <Printer size={13} />
                <span>Print Official Acknowledgement</span>
              </button>
              <button
                type="button"
                onClick={() => setIsSubmissionViewOpen(false)}
                className="px-4 py-2 border border-navy-900/15 bg-white text-xs font-mono uppercase tracking-wider text-navy-900 hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: OFFICIAL SUBMISSION ACKNOWLEDGEMENT RECEIPT (PRINTABLE) */}
      {/* ========================================================================= */}
      {isAckOpen && selectedSubmission && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="ack-modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsAckOpen(false);
          }}
          className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-up"
        >
          <div className="bg-white border border-navy-900/20 max-w-xl w-full p-8 space-y-6 shadow-2xl my-8 print:m-0 print:p-0 print:border-none relative">
            <button
              type="button"
              onClick={() => setIsAckOpen(false)}
              aria-label="Close acknowledgement dialog"
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-navy-900 transition-colors print:hidden"
            >
              <X size={18} />
            </button>

            {/* Header with Awards Crest */}
            <div className="text-center space-y-1 border-b-2 border-gold-500 pb-5">
              <span className="font-mono text-[10px] uppercase tracking-widest text-gold-700 font-bold block">
                Kutchmitra &bull; Janmabhoomi Group of Newspapers
              </span>
              <h2 id="ack-modal-title" className="font-display text-2xl text-navy-900 font-bold">
                HOME &amp; DECOR AWARDS 2026
              </h2>
              <span className="font-mono text-xs uppercase tracking-widest text-navy-900 font-semibold block pt-1">
                Official Nomination Acknowledgement
              </span>
            </div>

            {/* Official Confirmation Box */}
            <div className="border border-navy-900/15 p-5 space-y-3 bg-[#FAF8F5]">
              <div className="flex items-center justify-between border-b border-navy-900/10 pb-2">
                <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">
                  Nomination Tracking ID
                </span>
                <span className="font-mono text-base font-bold text-navy-900">
                  {selectedSubmission.nomination_id}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs font-sans pt-1">
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">
                    Award Category
                  </span>
                  <p className="font-semibold text-navy-900">
                    {selectedSubmission.category?.name || "Architectural Discipline"}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">
                    Project Title
                  </span>
                  <p className="font-semibold text-navy-900">{selectedSubmission.project_name}</p>
                </div>

                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">
                    Applicant / Entrant
                  </span>
                  <p className="font-semibold text-navy-900">{dbUser?.full_name}</p>
                </div>

                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">
                    Studio / Organization
                  </span>
                  <p className="font-semibold text-navy-900">
                    {profile?.organization_name || "Independent Architectural Practice"}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">
                    Location of Project
                  </span>
                  <p className="font-semibold text-navy-900">
                    {selectedSubmission.project_city}, {selectedSubmission.project_state}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">
                    Submission Timestamp
                  </span>
                  <p className="font-semibold text-navy-900">
                    {selectedSubmission.submitted_at
                      ? new Date(selectedSubmission.submitted_at).toLocaleString("en-IN")
                      : "Verified"}
                  </p>
                </div>
              </div>
            </div>

            {/* Official Terms Verification Note */}
            <div className="text-[11px] text-slate-500 leading-relaxed space-y-1">
              <p>
                This electronic acknowledgement confirms that the project dossier for{" "}
                <strong className="text-navy-900">{selectedSubmission.project_name}</strong> has been
                registered under the 2026 competition cycle with all required applicant declarations.
              </p>
              <p>
                The entry has been locked and forwarded to the Technical Verification Team for document
                audit and subsequent jury evaluation.
              </p>
            </div>

            {/* Print & Close Actions */}
            <div className="pt-4 border-t border-navy-900/10 flex items-center justify-between print:hidden">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 bg-navy-900 text-white hover:bg-gold-600 text-xs font-mono uppercase tracking-wider transition-colors flex items-center gap-1.5"
              >
                <Printer size={13} />
                <span>Print Acknowledgement Receipt</span>
              </button>

              <button
                type="button"
                onClick={() => setIsAckOpen(false)}
                className="px-4 py-2 border border-navy-900/15 bg-white text-xs font-mono uppercase tracking-wider text-navy-900 hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
