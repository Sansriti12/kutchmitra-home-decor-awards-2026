"use client";

import React from "react";
import Image from "next/image";
import { Download, Printer, ShieldCheck, X } from "lucide-react";
import type { ParticipantCertificateItem } from "@/lib/certificates/types";

interface CertificateViewProps {
  certificate: ParticipantCertificateItem;
  onClose?: () => void;
}

export default function CertificateView({ certificate, onClose }: CertificateViewProps) {
  const handlePrint = () => {
    window.print();
  };

  const formattedDate = certificate.issuedAt
    ? new Date(certificate.issuedAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-navy-950/80 backdrop-blur-md flex items-center justify-center p-4 print:p-0 print:bg-white print:static">
      <div className="relative w-full max-w-4xl bg-white border border-gold-500/40 shadow-2xl overflow-hidden print:border-none print:shadow-none print:max-w-none">
        {/* Screen Controls Header (Hidden in Print) */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-navy-950 text-white border-b border-white/10 print:hidden">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-gold-400" />
            <span className="font-mono text-xs uppercase tracking-wider text-gold-300 font-semibold">
              Official Certificate of Appreciation · {certificate.certificateNumber}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gold-500 hover:bg-gold-400 text-navy-950 font-mono text-xs font-bold uppercase transition-colors cursor-pointer"
            >
              <Printer size={13} />
              <span>Print / Download PDF</span>
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white font-mono text-sm px-2 cursor-pointer"
                title="Close"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* CERTIFICATE CANVAS (Printable Section) */}
        <div className="p-8 sm:p-12 md:p-16 bg-[#FAF8F5] text-navy-950 relative overflow-hidden select-none print:p-8">
          {/* Outer Ornamental Frame */}
          <div className="border-4 border-double border-gold-600/70 p-6 sm:p-10 relative bg-white shadow-inner">
            {/* Corner Decorative Elements */}
            <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-gold-600" />
            <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-gold-600" />
            <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-gold-600" />
            <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-gold-600" />

            <div className="text-center space-y-6">
              {/* Institution & Awards Header */}
              <div className="space-y-2">
                <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-gold-700 font-bold block">
                  Janmabhoomi Group · Saurashtra Trust (Est. 1931)
                </span>
                <h3 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-navy-900">
                  KUTCHMITRA HOME &amp; DECOR AWARDS 2026
                </h3>
                <p className="font-display italic text-xs sm:text-sm text-gold-800">
                  &ldquo;Celebrating the Spirit of Kutch Through Architecture, Craft and Sustainability&rdquo;
                </p>
                <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-gold-500 to-transparent mx-auto pt-1" />
              </div>

              {/* Title */}
              <div className="pt-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-slate-500 block">
                  Official Recognition of Participation
                </span>
                <h1 className="font-display text-2xl sm:text-4xl lg:text-5xl font-bold tracking-wider text-navy-900 mt-1 uppercase">
                  Certificate of Appreciation
                </h1>
              </div>

              {/* Recipient Attribution */}
              <div className="space-y-2 max-w-2xl mx-auto pt-2">
                <p className="font-sans text-xs sm:text-sm text-slate-600">
                  This certificate is proudly presented to
                </p>
                <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-navy-900 border-b border-navy-900/15 pb-2 inline-block px-8">
                  {certificate.participantName}
                </h2>
                <p className="text-[11px] font-mono uppercase tracking-widest text-gold-800 font-semibold">
                  {certificate.participantType === "architectural_firm" ? "Architectural Firm" : "Individual Architect"} · Kutch District
                </p>
              </div>

              {/* Citation */}
              <div className="max-w-2xl mx-auto space-y-2 text-xs sm:text-sm text-[#4A4F5C] leading-relaxed font-sans pt-2">
                <p>
                  In sincere appreciation of valuable participation and submission of the project
                </p>
                <p className="font-display text-lg sm:text-xl font-semibold text-navy-900">
                  &ldquo;{certificate.projectName}&rdquo;
                </p>
                <p>
                  in the competition category{" "}
                  <strong className="text-navy-900 font-semibold">{certificate.categoryName}</strong> for the 2026 edition of the awards, demonstrating dedication to design excellence and the built environment of Kutch.
                </p>
              </div>

              {/* Signatures & Seal Bar */}
              <div className="pt-8 sm:pt-12 grid grid-cols-3 items-end max-w-xl mx-auto text-xs font-mono">
                <div className="text-center space-y-1">
                  <div className="w-28 border-b border-navy-900/30 mx-auto" />
                  <span className="font-bold text-navy-900 block text-[11px]">Editor / Trustee</span>
                  <span className="text-[10px] text-slate-500">Janmabhoomi Group</span>
                </div>

                <div className="flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-full border-2 border-gold-600/80 bg-gold-500/10 flex flex-col items-center justify-center text-[9px] font-mono text-gold-900 font-bold uppercase text-center p-1 leading-tight shadow-xs">
                    <span>Official</span>
                    <span>Seal</span>
                    <span>2026</span>
                  </div>
                </div>

                <div className="text-center space-y-1">
                  <div className="w-28 border-b border-navy-900/30 mx-auto" />
                  <span className="font-bold text-navy-900 block text-[11px]">Awards Committee</span>
                  <span className="text-[10px] text-slate-500">Kutchmitra Awards</span>
                </div>
              </div>

              {/* Metadata Footer */}
              <div className="pt-6 border-t border-navy-900/10 flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span>Certificate ID: {certificate.certificateNumber}</span>
                <span>Issue Date: {formattedDate}</span>
                <span>Nomination: {certificate.nominationId}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
