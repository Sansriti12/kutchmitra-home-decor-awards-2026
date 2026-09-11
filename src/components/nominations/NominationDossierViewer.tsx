"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Printer,
  Copy,
  CheckCircle2,
  Lock,
  User,
  Building2,
  MapPin,
  Calendar,
  Maximize2,
  FileText,
  Image as ImageIcon,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getSignedFileUrl } from "@/lib/nominations/actions";
import type { EntrantDetailsData } from "./Step1EntrantDetails";
import type { CategoryOption } from "./Step2Category";
import type { ProjectDetailsData } from "./Step3ProjectDetails";
import type { DynamicQuestionItem } from "./Step4DynamicQuestions";
import type { FileItem } from "./Step5MediaDocuments";

const STATUS_CONFIG: Record<
  string,
  { label: string; text: string; bg: string; border: string; desc: string }
> = {
  submitted: {
    label: "Submitted",
    text: "text-blue-800",
    bg: "bg-blue-50",
    border: "border-blue-200",
    desc: "Nomination officially received and locked. Awaiting verification review.",
  },
  under_verification: {
    label: "Under Verification",
    text: "text-indigo-800",
    bg: "bg-indigo-50",
    border: "border-indigo-200",
    desc: "Verification team is reviewing document completeness and technical compliance.",
  },
  clarification_required: {
    label: "Clarification Required",
    text: "text-orange-800",
    bg: "bg-orange-50",
    border: "border-orange-200",
    desc: "Action requested: Additional documentation or details required by verifiers.",
  },
  eligible: {
    label: "Eligible",
    text: "text-emerald-800",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    desc: "Technical compliance verified. Entry approved for jury evaluation.",
  },
  jury_review: {
    label: "Jury Review",
    text: "text-purple-800",
    bg: "bg-purple-50",
    border: "border-purple-200",
    desc: "Under confidential evaluation and criteria scoring by the jury panel.",
  },
  shortlisted: {
    label: "Shortlisted",
    text: "text-gold-700",
    bg: "bg-gold-50",
    border: "border-gold-300",
    desc: "Advanced to official award finalist stage by organizing committee.",
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
    desc: "Entry did not advance to the next round.",
  },
  disqualified: {
    label: "Disqualified",
    text: "text-rose-800",
    bg: "bg-rose-50",
    border: "border-rose-200",
    desc: "Disqualified due to guideline breach or false declaration.",
  },
};

export interface NominationDossierViewerProps {
  application: {
    id: string;
    nomination_id: string;
    project_name: string;
    project_city: string;
    project_state: string;
    project_completion_date: string | null;
    built_up_area_sqft: number | null;
    status: string;
    submitted_at: string | null;
    declaration_accepted_at: string | null;
  };
  entrant: EntrantDetailsData;
  category: CategoryOption;
  questions: DynamicQuestionItem[];
  answers: Array<{
    question_id: string;
    answer_text: string | null;
    answer_number: number | null;
    answer_json: any | null;
  }>;
  files: FileItem[];
}

export default function NominationDossierViewer({
  application,
  entrant,
  category,
  questions,
  answers,
  files,
}: NominationDossierViewerProps) {
  const [copied, setCopied] = useState(false);

  const statusCfg = STATUS_CONFIG[application.status] || STATUS_CONFIG.submitted;

  const copyNominationId = () => {
    navigator.clipboard.writeText(application.nomination_id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePreviewFile = async (storagePath: string) => {
    try {
      const res = await getSignedFileUrl(storagePath);
      if (res.success && res.signedUrl) {
        window.open(res.signedUrl, "_blank", "noopener,noreferrer");
      }
    } catch {
      alert("Unable to open file preview.");
    }
  };

  const answersMap = new Map<string, { text?: string | null; number?: number | null; json?: any }>();
  answers.forEach((a) => answersMap.set(a.question_id, { text: a.answer_text, number: a.answer_number, json: a.answer_json }));

  return (
    <div className="min-h-screen bg-[#F4F1EA] pb-20 print:bg-white print:p-0">
      {/* Top Header Bar */}
      <div className="bg-[#FBFAF7] border-b border-navy-900/10 sticky top-0 z-30 shadow-sm print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-500 hover:text-navy-900 transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Back to Dashboard</span>
            </Link>
            <span className="text-slate-300">|</span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-navy-900 bg-white border border-navy-900/15 px-2.5 py-0.5 tracking-wider">
                {application.nomination_id}
              </span>
              <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 border font-semibold ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}>
                {statusCfg.label}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gold-500/30 bg-gold-500/10 hover:bg-gold-500/20 text-xs font-mono uppercase tracking-wider text-gold-800 transition-colors"
            >
              <Printer size={13} />
              <span>Print Dossier</span>
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* Printable Official Dossier Header */}
        <div className="hidden print:block text-center border-b-2 border-navy-900 pb-4 mb-6">
          <p className="font-mono text-xs uppercase tracking-widest text-slate-500">Official Nomination Dossier</p>
          <h1 className="font-display text-2xl font-bold text-navy-900 mt-1">Kutchmitra Home & Decor Awards 2026</h1>
          <p className="font-mono text-[11px] text-slate-600 mt-0.5">Nomination ID: {application.nomination_id} • Status: {statusCfg.label}</p>
        </div>

        {/* SUBMISSION STATUS CALLOUT BANNER */}
        <div className="p-5 bg-white border border-navy-900/10 shadow-card flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:border-none print:shadow-none">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-200 text-blue-800 flex items-center justify-center flex-shrink-0">
              <Lock size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-lg text-navy-900 font-bold">
                  Official Locked Entry
                </h2>
                <span className={`px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider font-semibold border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}>
                  {statusCfg.label}
                </span>
              </div>
              <p className="text-xs text-[#4A4F5C] mt-0.5">
                {statusCfg.desc}
              </p>
              {application.submitted_at && (
                <p className="text-[11px] font-mono text-slate-400 mt-1">
                  Submitted:{" "}
                  {new Date(application.submitted_at).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}{" "}
                  at{" "}
                  {new Date(application.submitted_at).toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  IST
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <button
              type="button"
              onClick={copyNominationId}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono border border-navy-900/15 bg-[#FBFAF7] hover:bg-slate-100 text-navy-900 transition-colors"
            >
              {copied ? (
                <>
                  <CheckCircle2 size={13} className="text-emerald-600" />
                  <span className="text-emerald-700">Copied</span>
                </>
              ) : (
                <>
                  <Copy size={13} className="text-slate-400" />
                  <span>Copy ID</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* DOSSIER CARD: Project Overview */}
        <div className="bg-[#FBFAF7] border border-navy-900/10 p-6 sm:p-8 shadow-card space-y-6">
          <div className="border-b border-navy-900/10 pb-4">
            <span className="text-[10px] font-mono uppercase tracking-widest text-gold-700 bg-gold-500/10 px-2.5 py-0.5 border border-gold-500/20 font-semibold inline-block mb-2">
              #{category.code} — {category.name}
            </span>
            <h1 className="font-display text-2xl sm:text-3xl text-navy-900 font-bold">
              {application.project_name}
            </h1>
            <p className="text-xs text-[#4A4F5C] mt-1">
              Site Location: {application.project_city}, {application.project_state}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="font-mono text-[10px] text-slate-400 uppercase block">Awards Edition</span>
              <span className="font-semibold text-navy-900">2026 Inaugural Cycle</span>
            </div>
            <div>
              <span className="font-mono text-[10px] text-slate-400 uppercase block">Completion Date</span>
              <span className="font-semibold text-navy-900">
                {application.project_completion_date
                  ? new Date(application.project_completion_date).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "Not specified"}
              </span>
            </div>
            <div>
              <span className="font-mono text-[10px] text-slate-400 uppercase block">Built-up Area</span>
              <span className="font-semibold text-navy-900">
                {application.built_up_area_sqft ? `${application.built_up_area_sqft} Sq. Ft.` : "Not specified"}
              </span>
            </div>
          </div>
        </div>

        {/* ENTRANT PROFILE */}
        <div className="bg-[#FBFAF7] border border-navy-900/10 p-6 shadow-card space-y-4">
          <h3 className="font-display text-base text-navy-900 font-semibold border-b border-navy-900/10 pb-2">
            Entrant & Practice Identity
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="font-mono text-[10px] text-slate-400 uppercase block">Entrant Name</span>
              <span className="font-medium text-navy-900">{entrant.fullName}</span>
            </div>
            <div>
              <span className="font-mono text-[10px] text-slate-400 uppercase block">Practice / Studio</span>
              <span className="font-medium text-navy-900">{entrant.organizationName || "Independent"}</span>
            </div>
            <div>
              <span className="font-mono text-[10px] text-slate-400 uppercase block">Designation</span>
              <span className="font-medium text-navy-900">{entrant.designation || "Architect"}</span>
            </div>
            <div>
              <span className="font-mono text-[10px] text-slate-400 uppercase block">Official Email</span>
              <span className="font-medium text-navy-900">{entrant.email}</span>
            </div>
            <div>
              <span className="font-mono text-[10px] text-slate-400 uppercase block">Studio City & State</span>
              <span className="font-medium text-navy-900">{entrant.city}, {entrant.state}</span>
            </div>
            {entrant.portfolioUrl && (
              <div>
                <span className="font-mono text-[10px] text-slate-400 uppercase block">Portfolio / Website</span>
                <span className="font-medium text-gold-700 truncate block">{entrant.portfolioUrl}</span>
              </div>
            )}
          </div>
        </div>

        {/* QUESTIONNAIRE RESPONSES (IF CONFIGURED) */}
        {questions.length > 0 && (
          <div className="bg-[#FBFAF7] border border-navy-900/10 p-6 shadow-card space-y-4">
            <h3 className="font-display text-base text-navy-900 font-semibold border-b border-navy-900/10 pb-2">
              Category Questionnaire Responses
            </h3>
            <div className="space-y-4 text-xs">
              {questions.map((q) => {
                const ans = answersMap.get(q.id);
                const val =
                  ans?.text ||
                  (ans?.number !== undefined && ans.number !== null ? String(ans.number) : null) ||
                  (Array.isArray(ans?.json) ? ans.json.join(", ") : null);

                return (
                  <div key={q.id} className="space-y-1">
                    <span className="font-medium text-navy-900 block">{q.question_text}</span>
                    <div className="p-3 bg-white border border-navy-900/10 text-navy-900">
                      {val || <span className="text-slate-400 italic">No answer provided</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ATTACHED MEDIA & DOCUMENTS */}
        <div className="bg-[#FBFAF7] border border-navy-900/10 p-6 shadow-card space-y-4">
          <h3 className="font-display text-base text-navy-900 font-semibold border-b border-navy-900/10 pb-2">
            Uploaded Architectural Documentation ({files.length} Assets)
          </h3>

          {files.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No files were attached to this nomination.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="p-3 bg-white border border-navy-900/10 flex items-start justify-between gap-2"
                >
                  <div className="flex items-start gap-2.5 overflow-hidden">
                    <FileText size={16} className="text-gold-600 flex-shrink-0 mt-0.5" />
                    <div className="overflow-hidden">
                      <p className="font-medium text-navy-900 truncate">{file.original_filename}</p>
                      <p className="text-[10px] font-mono text-slate-400 uppercase">{file.upload_type}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handlePreviewFile(file.storage_path)}
                    className="inline-flex items-center gap-1 text-[11px] font-mono text-navy-900 hover:text-gold-700 flex-shrink-0"
                  >
                    <ExternalLink size={12} />
                    <span>View</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* DECLARATIONS ACCEPTANCE FOOTER */}
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
          <ShieldCheck size={16} className="text-emerald-700 flex-shrink-0" />
          <span>
            All 4 official governance declarations were accepted and certified by the applicant prior to submission.
          </span>
        </div>
      </main>
    </div>
  );
}
