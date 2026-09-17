"use client";

import React, { useState, useEffect } from "react";
import {
  Layers,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  AlertTriangle,
  ShieldCheck,
  X,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface CategoryOption {
  id: string;
  code: string;
  name: string;
  slug: string;
  short_description: string;
  eligibility_criteria?: string | null;
}

interface Step2CategoryProps {
  selectedCategoryId: string;
  categories: CategoryOption[];
  onCategoryChange: (newCategoryId: string) => Promise<void>;
  onNext: () => void;
  onPrev: () => void;
  isSaving: boolean;
}

export default function Step2Category({
  selectedCategoryId,
  categories,
  onCategoryChange,
  onNext,
  onPrev,
  isSaving,
}: Step2CategoryProps) {
  const [isChanging, setIsChanging] = useState(false);
  const [pendingCategoryId, setPendingCategoryId] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [switching, setSwitching] = useState(false);

  const currentCategory = categories.find((c) => c.id === selectedCategoryId) || categories[0];
  const targetCategory = categories.find((c) => c.id === pendingCategoryId);

  // Close modal on Escape key press if not actively switching
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showConfirmModal && !switching) {
        setShowConfirmModal(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showConfirmModal, switching]);

  const handleConfirmSwitch = async () => {
    if (!pendingCategoryId || pendingCategoryId === selectedCategoryId) {
      setShowConfirmModal(false);
      setIsChanging(false);
      return;
    }

    setSwitching(true);
    try {
      await onCategoryChange(pendingCategoryId);
      setShowConfirmModal(false);
      setIsChanging(false);
      setPendingCategoryId(null);
    } finally {
      setSwitching(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title & Guidance Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-gold-800 bg-gold-500/15 px-2.5 py-0.5 border border-gold-500/30 font-semibold inline-block">
            Step 02 of 07
          </span>
          <span className="text-slate-400 font-mono text-xs">/</span>
          <span className="text-xs font-mono uppercase tracking-wider text-slate-500 font-medium">
            Category Allocation
          </span>
        </div>
        <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl text-navy-900 font-medium tracking-tight">
          Award Category Selection
        </h2>
        <p className="text-sm text-[#4A4F5C] leading-relaxed max-w-2xl">
          Verify the official award category your project is competing in. Each entry is evaluated by the specialized jury panel assigned to this category.
        </p>
      </div>

      {/* Selected Category Feature Card */}
      {!isChanging ? (
        <div className="bg-[#FBFAF7] border-2 border-gold-500/40 p-6 sm:p-8 shadow-card space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="font-mono text-xs font-bold text-gold-800 bg-gold-500/15 border border-gold-500/30 px-3 py-1 uppercase tracking-widest shadow-2xs">
                  Category #{currentCategory?.code}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-800 bg-emerald-50 px-2.5 py-0.5 border border-emerald-200/80 shadow-2xs">
                  <CheckCircle2 size={13} className="text-emerald-700" /> Active 2026 Category
                </span>
              </div>
              <h3 className="font-display text-2xl sm:text-3xl lg:text-4xl text-navy-900 font-semibold tracking-tight">
                {currentCategory?.name}
              </h3>
              <p className="text-sm text-[#4A4F5C] max-w-2xl leading-relaxed">
                {currentCategory?.short_description}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setPendingCategoryId(selectedCategoryId);
                setIsChanging(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 border border-navy-900/15 bg-white hover:bg-slate-50 text-xs font-mono uppercase tracking-wider text-navy-900 transition-colors whitespace-nowrap self-start shadow-2xs cursor-pointer"
            >
              <RefreshCw size={13} className="text-gold-600" />
              <span>Change Category</span>
            </button>
          </div>

          {/* Eligibility Criteria Box */}
          <div className="pt-5 border-t border-navy-900/10 space-y-2 bg-white/60 p-4 border border-navy-900/5">
            <div className="flex items-center gap-2 text-xs font-mono text-navy-900 font-semibold uppercase tracking-wider">
              <ShieldCheck size={15} className="text-gold-600" />
              <span>Category Eligibility Framework</span>
            </div>
            <p className="text-xs text-[#4A4F5C] leading-relaxed">
              {currentCategory?.eligibility_criteria ||
                "Open to projects completed within the stipulated cycle in the region. Works must be designed or executed by the nominating practice."}
            </p>
          </div>
        </div>
      ) : (
        /* Change Category Selector Grid */
        <div className="bg-[#FBFAF7] border-2 border-gold-500/40 p-6 sm:p-8 shadow-card space-y-6">
          <div className="flex items-start justify-between border-b border-navy-900/10 pb-4">
            <div>
              <h3 className="font-display text-xl text-navy-900 font-semibold">
                Select an Award Category
              </h3>
              <p className="text-xs text-[#4A4F5C] mt-0.5">
                Choose from the 13 approved categories for the 2026 inaugural edition.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsChanging(false)}
              className="text-xs font-mono uppercase tracking-wider text-slate-500 hover:text-navy-900 px-3 py-1 border border-slate-200 bg-white"
            >
              Cancel
            </button>
          </div>

          <div className="p-3.5 bg-amber-50 border border-amber-200/80 text-amber-950 text-xs flex items-start gap-2.5">
            <AlertTriangle size={16} className="text-amber-700 flex-shrink-0 mt-0.5" />
            <span className="leading-relaxed">
              Changing your category will update the dossier classification and reflect in category-specific evaluation requirements.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 max-h-[440px] overflow-y-auto pr-1">
            {categories.map((cat) => {
              const isSelected = (pendingCategoryId || selectedCategoryId) === cat.id;

              return (
                <div
                  key={cat.id}
                  onClick={() => setPendingCategoryId(cat.id)}
                  className={`p-4 border text-left cursor-pointer transition-all shadow-2xs ${
                    isSelected
                      ? "border-gold-500 bg-gold-500/10 ring-1 ring-gold-500/30"
                      : "border-navy-900/10 bg-white hover:border-gold-500/40 hover:bg-slate-50/50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-navy-900 bg-navy-900/5 px-2 py-0.5 border border-navy-900/10">
                      #{cat.code}
                    </span>
                    {isSelected && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono text-gold-800 font-bold uppercase tracking-wider bg-gold-500/20 px-2 py-0.5 border border-gold-500/30">
                        <CheckCircle2 size={11} className="text-gold-700" /> Selected
                      </span>
                    )}
                  </div>
                  <h4 className="font-display text-base font-semibold text-navy-900">
                    {cat.name}
                  </h4>
                  <p className="text-xs text-[#4A4F5C] mt-1 line-clamp-2 leading-relaxed">
                    {cat.short_description}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-navy-900/10">
            <button
              type="button"
              onClick={() => {
                setIsChanging(false);
                setPendingCategoryId(null);
              }}
              disabled={switching}
              className="px-4 py-2 border border-navy-900/15 bg-white text-xs font-mono uppercase tracking-wider text-slate-600 hover:text-navy-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                if (pendingCategoryId && pendingCategoryId !== selectedCategoryId) {
                  setShowConfirmModal(true);
                }
              }}
              disabled={switching || !pendingCategoryId || pendingCategoryId === selectedCategoryId}
              className="px-5 py-2 bg-navy-900 hover:bg-navy-800 text-gold-400 font-mono text-xs uppercase tracking-wider font-semibold transition-colors disabled:opacity-50 shadow-xs cursor-pointer"
            >
              Change Category
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && targetCategory && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-xs animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
          aria-labelledby="category-modal-title"
        >
          <div
            className="bg-[#FBFAF7] border-2 border-gold-500/50 max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 relative animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => !switching && setShowConfirmModal(false)}
              disabled={switching}
              aria-label="Close dialog"
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-navy-900 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <X size={18} />
            </button>

            {/* Header */}
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-700 flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-800 font-semibold block">
                  Confirmation Required
                </span>
                <h3 id="category-modal-title" className="font-display text-xl sm:text-2xl text-navy-900 font-bold">
                  Change Award Category?
                </h3>
              </div>
            </div>

            {/* Body Explanation */}
            <p className="text-sm text-[#4A4F5C] leading-relaxed">
              You are changing the award category for this nomination. Category-specific information may need to be completed again for the new category.
            </p>

            {/* Category Comparison Box */}
            <div className="p-4 bg-white border border-navy-900/10 space-y-3 text-xs">
              <div className="flex items-center justify-between gap-2 pb-2 border-b border-navy-900/5">
                <span className="font-mono text-[10px] uppercase text-slate-400">Current Category</span>
                <span className="font-mono font-bold text-navy-900 text-right truncate">
                  #{currentCategory?.code} · {currentCategory?.name}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[10px] uppercase text-gold-700 font-semibold">New Category</span>
                <span className="font-mono font-bold text-gold-800 text-right truncate">
                  #{targetCategory?.code} · {targetCategory?.name}
                </span>
              </div>
            </div>

            {/* Modal Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                disabled={switching}
                className="px-4 py-2.5 border border-navy-900/15 bg-white text-xs font-mono uppercase tracking-wider text-slate-700 hover:text-navy-900 hover:bg-slate-50 transition-colors disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSwitch}
                disabled={switching}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-navy-900 hover:bg-navy-800 text-gold-400 font-mono text-xs uppercase tracking-wider font-semibold transition-colors disabled:opacity-50 shadow-sm cursor-pointer"
              >
                {switching ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Updating...</span>
                  </>
                ) : (
                  <span>Change Category</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-navy-900/10">
        <Button
          onClick={onPrev}
          variant="outline-dark"
          size="md"
          icon={<ArrowLeft size={14} />}
        >
          Previous: Entrant Profile
        </Button>
        <Button
          onClick={onNext}
          variant="primary"
          size="md"
          icon={<ArrowRight size={14} />}
          disabled={isSaving}
        >
          Proceed to Project Details
        </Button>
      </div>
    </div>
  );
}
