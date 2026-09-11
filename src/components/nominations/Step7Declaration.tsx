"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Loader2,
  FileCheck,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { submitFinalNomination } from "@/lib/nominations/actions";

interface Step7DeclarationProps {
  applicationId: string;
  nominationId: string;
  projectName: string;
  categoryName: string;
  isConfigurationPending?: boolean;
  onPrev: () => void;
}

export default function Step7Declaration({
  applicationId,
  nominationId,
  projectName,
  categoryName,
  isConfigurationPending = false,
  onPrev,
}: Step7DeclarationProps) {
  const router = useRouter();

  const [declarations, setDeclarations] = useState({
    authorship: false,
    accuracy: false,
    license: false,
    terms: false,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const allAccepted =
    declarations.authorship &&
    declarations.accuracy &&
    declarations.license &&
    declarations.terms;

  const handleCheckbox = (key: keyof typeof declarations) => {
    setDeclarations((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    setErrorMsg(null);
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await submitFinalNomination(applicationId, declarations);

      if (res.success) {
        setIsModalOpen(false);
        router.push(`/dashboard/nominations/${applicationId}/confirmation`);
      } else {
        setErrorMsg(res.error || "Submission failed. Please check required fields.");
        setIsModalOpen(false);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred during submission.");
      setIsModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Title & Guidance Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-gold-800 bg-gold-500/15 px-2.5 py-0.5 border border-gold-500/30 font-semibold inline-block">
            Step 07 of 07
          </span>
          <span className="text-slate-400 font-mono text-xs">/</span>
          <span className="text-xs font-mono uppercase tracking-wider text-slate-500 font-medium">
            Final Declaration
          </span>
        </div>
        <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl text-navy-900 font-medium tracking-tight">
          Official Declaration & Final Submission
        </h2>
        <p className="text-sm text-[#4A4F5C] leading-relaxed max-w-2xl">
          Review the mandatory governance declarations before officially transmitting this nomination dossier to the independent jury panel.
        </p>
      </div>

      {/* Production Submission Boundary Alert / Lock Warning */}
      {isConfigurationPending ? (
        <div className="p-6 bg-amber-50 border-2 border-amber-300/90 shadow-card space-y-3">
          <div className="flex items-center gap-2.5 font-mono text-xs font-bold text-amber-900 uppercase tracking-wider">
            <Lock size={16} className="text-amber-700" />
            <span>Production Submission Boundary: Configuration Pending</span>
          </div>
          <p className="text-xs text-amber-950 leading-relaxed font-sans">
            Official criteria questions and upload requirements for <strong className="font-semibold text-navy-900">{categoryName}</strong> have not yet been ratified by the organizing committee. In strict accordance with awards governance rules, final submission cannot be executed without ratified criteria.
          </p>
          <div className="p-3.5 bg-white/90 border border-amber-200 text-[11px] font-mono text-amber-900 shadow-2xs leading-relaxed">
            ✓ Your draft nomination, project details, and uploaded materials are 100% saved and securely preserved. Final submission will unlock automatically once the official configuration is published in the database.
          </div>
        </div>
      ) : (
        <div className="p-4 bg-amber-50 border border-amber-200/90 flex items-start gap-3.5 text-xs text-amber-950 shadow-2xs">
          <div className="p-1.5 bg-amber-100/80 border border-amber-200 text-amber-800 flex-shrink-0 mt-0.5">
            <Lock size={16} />
          </div>
          <div className="space-y-1 leading-relaxed">
            <p className="font-medium text-amber-950 font-mono uppercase tracking-wider text-[11px]">
              Immutable Submission Governance
            </p>
            <p className="text-[#4A4F5C] font-sans">
              Once submitted, your nomination will be assigned to the verification audit and permanently locked.
              You will no longer be able to modify project information or swap drawings unless a formal clarification is requested by the verifiers.
            </p>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-mono flex items-center gap-2.5 shadow-2xs">
          <AlertTriangle size={16} className="text-rose-600 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* DECLARATIONS FORM */}
      <div className="bg-[#FBFAF7] border border-navy-900/15 p-6 sm:p-8 shadow-card space-y-6">
        <div className="border-b border-navy-900/10 pb-4 flex items-center justify-between">
          <h3 className="font-display text-lg text-navy-900 font-semibold flex items-center gap-2">
            <ShieldCheck size={18} className="text-gold-600" />
            <span>Official Entrant Declarations</span>
          </h3>
          <span className="text-xs font-mono text-slate-500">
            4 Checkpoints Required
          </span>
        </div>

        <div className="space-y-4">
          {/* Checkpoint 1: Authorship */}
          <label className={`flex items-start gap-3.5 cursor-pointer p-5 transition-all border shadow-2xs ${
            declarations.authorship
              ? "bg-gold-500/5 border-gold-500/60 ring-1 ring-gold-500/20"
              : "bg-white border-navy-900/10 hover:border-gold-500/40"
          }`}>
            <input
              type="checkbox"
              checked={declarations.authorship}
              onChange={() => handleCheckbox("authorship")}
              className="mt-1 accent-navy-900 rounded cursor-pointer w-4 h-4"
            />
            <div className="text-xs space-y-1.5 leading-relaxed flex-1">
              <span className="font-semibold text-navy-900 block text-xs flex items-center justify-between">
                <span>1. Authorship & Proprietary Rights</span>
                {declarations.authorship && (
                  <span className="text-[10px] font-mono uppercase text-emerald-800 bg-emerald-50 px-2 py-0.5 border border-emerald-200 font-bold">
                    Acknowledged
                  </span>
                )}
              </span>
              <p className="text-[#4A4F5C]">
                I hereby declare that I, or the organization I represent, am the bona fide architect, interior designer, or authorized builder/creator of the project submitted under this nomination. All collaborators and team members credited have provided their consent.
              </p>
            </div>
          </label>

          {/* Checkpoint 2: Truth and Accuracy */}
          <label className={`flex items-start gap-3.5 cursor-pointer p-5 transition-all border shadow-2xs ${
            declarations.accuracy
              ? "bg-gold-500/5 border-gold-500/60 ring-1 ring-gold-500/20"
              : "bg-white border-navy-900/10 hover:border-gold-500/40"
          }`}>
            <input
              type="checkbox"
              checked={declarations.accuracy}
              onChange={() => handleCheckbox("accuracy")}
              className="mt-1 accent-navy-900 rounded cursor-pointer w-4 h-4"
            />
            <div className="text-xs space-y-1.5 leading-relaxed flex-1">
              <span className="font-semibold text-navy-900 block text-xs flex items-center justify-between">
                <span>2. Authenticity & Veracity of Submission</span>
                {declarations.accuracy && (
                  <span className="text-[10px] font-mono uppercase text-emerald-800 bg-emerald-50 px-2 py-0.5 border border-emerald-200 font-bold">
                    Acknowledged
                  </span>
                )}
              </span>
              <p className="text-[#4A4F5C]">
                I certify that all drawings, photographs, completion dates, built-up dimensions, and statements provided in this dossier are authentic, un-manipulated representations of the actual built environment, and free of material misrepresentation.
              </p>
            </div>
          </label>

          {/* Checkpoint 3: License and Showcase Rights */}
          <label className={`flex items-start gap-3.5 cursor-pointer p-5 transition-all border shadow-2xs ${
            declarations.license
              ? "bg-gold-500/5 border-gold-500/60 ring-1 ring-gold-500/20"
              : "bg-white border-navy-900/10 hover:border-gold-500/40"
          }`}>
            <input
              type="checkbox"
              checked={declarations.license}
              onChange={() => handleCheckbox("license")}
              className="mt-1 accent-navy-900 rounded cursor-pointer w-4 h-4"
            />
            <div className="text-xs space-y-1.5 leading-relaxed flex-1">
              <span className="font-semibold text-navy-900 block text-xs flex items-center justify-between">
                <span>3. Showcase & Publication License</span>
                {declarations.license && (
                  <span className="text-[10px] font-mono uppercase text-emerald-800 bg-emerald-50 px-2 py-0.5 border border-emerald-200 font-bold">
                    Acknowledged
                  </span>
                )}
              </span>
              <p className="text-[#4A4F5C]">
                I grant Kutchmitra and the Home & Decor Awards 2026 organizing committee a non-exclusive, royalty-free license to reproduce, exhibit, broadcast, and publish the submitted photographs, drawings, and project descriptions across print publications, event screens, websites, and digital press coverage.
              </p>
            </div>
          </label>

          {/* Checkpoint 4: Regulations and Jury Verdict */}
          <label className={`flex items-start gap-3.5 cursor-pointer p-5 transition-all border shadow-2xs ${
            declarations.terms
              ? "bg-gold-500/5 border-gold-500/60 ring-1 ring-gold-500/20"
              : "bg-white border-navy-900/10 hover:border-gold-500/40"
          }`}>
            <input
              type="checkbox"
              checked={declarations.terms}
              onChange={() => handleCheckbox("terms")}
              className="mt-1 accent-navy-900 rounded cursor-pointer w-4 h-4"
            />
            <div className="text-xs space-y-1.5 leading-relaxed flex-1">
              <span className="font-semibold text-navy-900 block text-xs flex items-center justify-between">
                <span>4. Award Regulations & Jury Finality</span>
                {declarations.terms && (
                  <span className="text-[10px] font-mono uppercase text-emerald-800 bg-emerald-50 px-2 py-0.5 border border-emerald-200 font-bold">
                    Acknowledged
                  </span>
                )}
              </span>
              <p className="text-[#4A4F5C]">
                I agree to abide unconditionally by the rules, eligibility frameworks, code of conduct, and evaluation criteria of the Kutchmitra Home & Decor Awards 2026. I acknowledge that all evaluation results and decisions of the independent Jury Panel and Organizing Committee are final and binding.
              </p>
            </div>
          </label>
        </div>

        {/* Clear Guidance Note */}
        <div className="p-3.5 bg-navy-900/5 border border-navy-900/10 text-xs text-[#4A4F5C] flex items-start gap-2.5">
          <Info size={16} className="text-navy-900 flex-shrink-0 mt-0.5" />
          <span>
            Checking the 4 declarations above acknowledges the governance conditions but does not execute submission. Final submission requires clicking the action below and confirming the locking prompt.
          </span>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-navy-900/10">
        <Button
          type="button"
          onClick={onPrev}
          variant="outline-dark"
          size="md"
          icon={<ArrowLeft size={14} />}
        >
          Previous: Review Dossier
        </Button>

        {isConfigurationPending ? (
          <div className="flex flex-wrap items-center gap-3">
            <Button
              href="/dashboard"
              variant="primary"
              size="md"
            >
              Save Draft & Exit to Dashboard
            </Button>
            <span className="text-xs font-mono text-amber-800 bg-amber-100 border border-amber-300 px-3 py-2 font-semibold">
              Final Submission On Hold (Awaiting Committee Configuration)
            </span>
          </div>
        ) : (
          <Button
            type="button"
            onClick={() => setIsModalOpen(true)}
            variant="primary"
            size="md"
            icon={<FileCheck size={15} />}
            disabled={!allAccepted}
            className="bg-navy-900 hover:bg-navy-800 text-gold-400 font-semibold shadow-xs"
          >
            Submit Official Nomination
          </Button>
        )}
      </div>

      {/* CONFIRMATION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#FBFAF7] border border-navy-900/20 max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gold-500/10 text-gold-700 flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={22} />
              </div>
              <div>
                <h3 className="font-display text-xl text-navy-900 font-bold">
                  Confirm Nomination Submission
                </h3>
                <p className="text-xs font-mono text-slate-500">
                  Nomination ID: {nominationId}
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-[#4A4F5C] border-y border-navy-900/10 py-4 leading-relaxed">
              <p>
                You are about to submit <strong className="text-navy-900">"{projectName}"</strong> in the{" "}
                <strong className="text-navy-900">{categoryName}</strong> category.
              </p>
              <p>
                Once submitted:
              </p>
              <ul className="list-disc pl-5 space-y-1 font-mono text-[11px] text-navy-900">
                <li>Your entry will be permanently locked against changes.</li>
                <li>The verification team will begin auditing eligibility.</li>
                <li>You will receive an official submission confirmation receipt.</li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                disabled={isSubmitting}
                className="px-4 py-2 border border-navy-900/15 bg-white text-xs font-mono uppercase tracking-wider text-slate-600 hover:text-navy-900"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="px-5 py-2 bg-navy-900 hover:bg-navy-800 text-gold-400 font-mono text-xs uppercase tracking-wider font-semibold inline-flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Submitting Entry...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={14} />
                    <span>Confirm & Submit</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
