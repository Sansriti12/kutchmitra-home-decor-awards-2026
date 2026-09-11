"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Copy,
  Printer,
  ArrowRight,
  ShieldCheck,
  Clock,
  Award,
  Layers,
  FileCheck,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface NominationConfirmationClientProps {
  applicationId: string;
  nominationId: string;
  projectName: string;
  categoryName: string;
  categoryCode: string;
  submittedAt: string;
  projectLocation: string;
}

export default function NominationConfirmationClient({
  applicationId,
  nominationId,
  projectName,
  categoryName,
  categoryCode,
  submittedAt,
  projectLocation,
}: NominationConfirmationClientProps) {
  const [copied, setCopied] = useState(false);

  const copyNominationId = () => {
    navigator.clipboard.writeText(nominationId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedDate = new Date(submittedAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const formattedTime = new Date(submittedAt).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="min-h-screen bg-[#F4F1EA] py-12 px-4 sm:px-6 lg:px-8 print:bg-white print:p-0">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Printable Official Receipt Header */}
        <div className="hidden print:block text-center border-b-2 border-navy-900 pb-4 mb-6">
          <p className="font-mono text-xs uppercase tracking-widest text-slate-500">Official Submission Receipt & Verification Acknowledgement</p>
          <h1 className="font-display text-2xl font-bold text-navy-900 mt-1">Kutchmitra Home & Decor Awards 2026</h1>
          <p className="font-mono text-[11px] text-slate-600 mt-0.5">Applicant Submission Governance Record</p>
        </div>

        {/* SUBMISSION RECEIPT HERO */}
        <div className="bg-[#FBFAF7] border-2 border-gold-500/40 p-8 sm:p-10 shadow-card text-center space-y-6 print:border print:shadow-none">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-sm print:hidden">
            <CheckCircle2 size={36} />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-gold-700 bg-gold-500/10 px-3 py-1 border border-gold-500/20 font-bold inline-block">
              Submission Acknowledgement
            </span>
            <h1 className="font-display text-3xl sm:text-4xl text-navy-900 font-bold">
              Nomination Received & Locked
            </h1>
            <p className="text-sm text-[#4A4F5C] max-w-lg mx-auto leading-relaxed">
              Your official nomination dossier for the Kutchmitra Home & Decor Awards 2026 has been successfully received, registered, and locked for initial verification review.
            </p>
          </div>

          {/* NOMINATION ID BADGE */}
          <div className="inline-flex flex-col sm:flex-row items-center gap-3 p-4 bg-white border border-navy-900/15 max-w-md mx-auto shadow-sm">
            <div className="text-left">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                Official Nomination Identifier
              </span>
              <span className="font-mono text-xl sm:text-2xl font-bold text-navy-900 tracking-wider">
                {nominationId}
              </span>
            </div>

            <button
              type="button"
              onClick={copyNominationId}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-navy-900/15 hover:bg-slate-50 text-xs font-mono uppercase tracking-wider text-navy-900 transition-colors"
            >
              {copied ? (
                <>
                  <CheckCircle2 size={13} className="text-emerald-600" />
                  <span className="text-emerald-700">Copied</span>
                </>
              ) : (
                <>
                  <Copy size={13} />
                  <span>Copy ID</span>
                </>
              )}
            </button>
          </div>

          {/* SUMMARY META STRIP */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-navy-900/10 text-xs text-left">
            <div className="p-3 bg-white border border-navy-900/10">
              <span className="font-mono text-[10px] text-slate-400 uppercase block">Project</span>
              <span className="font-semibold text-navy-900 font-display text-sm truncate block">
                {projectName}
              </span>
              <span className="text-[11px] text-slate-500">{projectLocation}</span>
            </div>

            <div className="p-3 bg-white border border-navy-900/10">
              <span className="font-mono text-[10px] text-slate-400 uppercase block">Award Category</span>
              <span className="font-semibold text-navy-900 truncate block">
                #{categoryCode} — {categoryName}
              </span>
              <span className="text-[11px] text-slate-500">2026 Edition</span>
            </div>

            <div className="p-3 bg-white border border-navy-900/10">
              <span className="font-mono text-[10px] text-slate-400 uppercase block">Timestamp (IST)</span>
              <span className="font-semibold text-navy-900 truncate block">
                {formattedDate}
              </span>
              <span className="text-[11px] text-slate-500">{formattedTime} IST</span>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4 print:hidden">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-gold-500/40 bg-gold-500/10 hover:bg-gold-500/20 text-xs font-mono uppercase tracking-wider text-gold-900 font-semibold transition-colors"
            >
              <Printer size={14} />
              <span>Print Submission Receipt</span>
            </button>

            <Button
              href={`/dashboard/nominations/${applicationId}`}
              variant="outline-dark"
              size="sm"
            >
              View Nomination Dossier
            </Button>

            <Button
              href="/dashboard"
              variant="primary"
              size="sm"
              icon={<ArrowRight size={13} />}
            >
              Return to Dashboard
            </Button>
          </div>
        </div>

        {/* ROADMAP TIMELINE */}
        <div className="bg-[#FBFAF7] border border-navy-900/10 p-6 sm:p-8 shadow-card space-y-6">
          <div className="border-b border-navy-900/10 pb-3 flex items-center gap-2">
            <Clock size={16} className="text-gold-600" />
            <h3 className="font-display text-base text-navy-900 font-semibold">
              Evaluation Roadmap & Next Steps
            </h3>
          </div>

          <div className="space-y-6 text-xs text-[#4A4F5C]">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-900 font-bold flex items-center justify-center text-[11px] flex-shrink-0">
                1
              </div>
              <div className="space-y-0.5">
                <strong className="text-navy-900 font-medium block">Verification Audit</strong>
                <p>The verification desk reviews drawing completeness and eligibility requirements. If clarifications are needed, you will receive an alert on your dashboard.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-navy-900 text-gold-400 font-bold flex items-center justify-center text-[11px] flex-shrink-0">
                2
              </div>
              <div className="space-y-0.5">
                <strong className="text-navy-900 font-medium block">Eligibility Determination</strong>
                <p>Entries passing technical compliance are approved for jury assignment and tagged as "Eligible".</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-navy-900 text-gold-400 font-bold flex items-center justify-center text-[11px] flex-shrink-0">
                3
              </div>
              <div className="space-y-0.5">
                <strong className="text-navy-900 font-medium block">Independent Jury Evaluation</strong>
                <p>Assigned jury members confidentially examine drawings, spatial concepts, and photographs against the official scoring framework.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-gold-500 text-navy-900 font-bold flex items-center justify-center text-[11px] flex-shrink-0">
                4
              </div>
              <div className="space-y-0.5">
                <strong className="text-navy-900 font-medium block">Shortlist & Awards Ceremony</strong>
                <p>Official finalists and honorees will be announced across Kutchmitra publications and invited to the gala awards celebration.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
