"use client";

import React, { useState } from "react";
import { ArrowLeft, ArrowRight, Building, MapPin, Calendar, Maximize2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface ProjectDetailsData {
  projectName: string;
  projectCity: string;
  projectDistrict?: string;
  projectAddress?: string;
  projectState: string;
  projectCompletionDate: string | null;
  builtUpAreaSqft: number | null;
  projectBrief?: string;
}

interface Step3ProjectDetailsProps {
  initialData: ProjectDetailsData;
  onSaveStep: (data: ProjectDetailsData) => Promise<boolean>;
  onNext: () => void;
  onPrev: () => void;
  isSaving: boolean;
}

export default function Step3ProjectDetails({
  initialData,
  onSaveStep,
  onNext,
  onPrev,
  isSaving,
}: Step3ProjectDetailsProps) {
  // Normalize initial project name to blank if it was a draft placeholder
  const isPlaceholder = initialData.projectName.startsWith("Draft Entry (");
  const defaultName = isPlaceholder ? "" : initialData.projectName;

  const [formData, setFormData] = useState<ProjectDetailsData>({
    projectName: defaultName,
    projectCity: initialData.projectCity || "Bhuj",
    projectDistrict: initialData.projectDistrict || "Kutch",
    projectAddress: initialData.projectAddress || "",
    projectState: initialData.projectState || "Gujarat",
    projectCompletionDate: initialData.projectCompletionDate || "",
    builtUpAreaSqft: initialData.builtUpAreaSqft || null,
    projectBrief: initialData.projectBrief || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!formData.projectName || formData.projectName.trim() === "") {
      errs.projectName = "Official project name is required.";
    } else if (formData.projectName.length < 3) {
      errs.projectName = "Project name must be at least 3 characters long.";
    }

    if (!formData.projectCity || formData.projectCity.trim() === "") {
      errs.projectCity = "Project site city / town is required.";
    }

    if (!formData.projectState || formData.projectState.trim() === "") {
      errs.projectState = "State is required.";
    }

    if (formData.builtUpAreaSqft !== null && formData.builtUpAreaSqft < 0) {
      errs.builtUpAreaSqft = "Built-up area cannot be negative.";
    }

    if (!formData.projectCompletionDate || formData.projectCompletionDate.trim() === "") {
      errs.projectCompletionDate = "Project completion date is required.";
    } else {
      const compDate = formData.projectCompletionDate.trim();
      if (compDate < "2024-01-01" || compDate > "2026-12-31") {
        errs.projectCompletionDate =
          "Projects must have been completed between January 1, 2024 and December 31, 2026.";
      }
    }

    if (formData.projectBrief && formData.projectBrief.length > 500) {
      errs.projectBrief = `Project brief cannot exceed 500 characters. (Current length: ${formData.projectBrief.length})`;
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const ok = await onSaveStep(formData);
      if (ok) {
        onNext();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
      {/* Title & Guidance Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-gold-800 bg-gold-500/15 px-2.5 py-0.5 border border-gold-500/30 font-semibold inline-block">
            Step 03 of 07
          </span>
          <span className="text-slate-400 font-mono text-xs">/</span>
          <span className="text-xs font-mono uppercase tracking-wider text-slate-500 font-medium">
            Project Metadata
          </span>
        </div>
        <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl text-navy-900 font-medium tracking-tight">
          Project Details & Spatial Metadata
        </h2>
        <p className="text-sm text-[#4A4F5C] leading-relaxed max-w-2xl">
          Specify the architectural project identity, physical site location, and key structural parameters of the submitted work.
        </p>
      </div>

      <div className="bg-[#FBFAF7] border border-navy-900/10 p-6 sm:p-8 shadow-card space-y-6">
        <div className="flex items-center justify-between border-b border-navy-900/10 pb-3">
          <h3 className="font-display text-base text-navy-900 font-semibold">
            Architectural Project Parameters
          </h3>
          <span className="text-[11px] font-mono text-slate-500">
            Fields marked with <span className="text-gold-700 font-bold">*</span> are required
          </span>
        </div>

        {/* Project Name */}
        <div className="space-y-1.5">
          <label className="block font-mono text-xs uppercase tracking-wider text-navy-900 font-semibold">
            Official Project / Site Name <span className="text-gold-700 font-bold">*</span>
          </label>
          <div className="relative">
            <Building size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              required
              value={formData.projectName}
              onChange={(e) => {
                setFormData({ ...formData, projectName: e.target.value });
                if (errors.projectName) setErrors({ ...errors, projectName: "" });
              }}
              className={`w-full pl-10 pr-4 py-2.5 border bg-white text-navy-900 focus:outline-none transition-colors text-sm shadow-2xs ${
                errors.projectName
                  ? "border-rose-500 focus:border-rose-600 focus:ring-1 focus:ring-rose-500/20"
                  : "border-navy-900/15 focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20"
              }`}
              placeholder="e.g. The Courtyard Residence, Bhuj"
            />
          </div>
          {errors.projectName ? (
            <p className="text-xs text-rose-600 font-mono mt-1 flex items-center gap-1">
              <AlertCircle size={12} /> {errors.projectName}
            </p>
          ) : (
            <p className="text-[11px] text-slate-500 font-sans">
              Enter the official title of the built structure or interior project as it will be published in awards documentation.
            </p>
          )}
        </div>

        {/* Location: District, City and Address */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
          <div className="space-y-1.5">
            <label className="block font-mono text-xs uppercase tracking-wider text-navy-900 font-semibold">
              Project District <span className="text-gold-700 font-bold">*</span>
            </label>
            <div className="p-2.5 bg-emerald-50/70 border border-emerald-200 text-xs font-mono text-emerald-900 flex items-center justify-between">
              <span className="font-semibold">Kutch District (Mandatory)</span>
              <span className="text-[10px] uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 border border-emerald-300">
                Eligible Zone
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Only projects located physically within Kutch district are eligible for the 2026 Awards.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="block font-mono text-xs uppercase tracking-wider text-navy-900 font-semibold">
              Project City / Town / Taluka <span className="text-gold-700 font-bold">*</span>
            </label>
            <div className="relative">
              <MapPin size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                required
                list="kutch-towns"
                value={formData.projectCity}
                onChange={(e) => {
                  setFormData({ ...formData, projectCity: e.target.value });
                  if (errors.projectCity) setErrors({ ...errors, projectCity: "" });
                }}
                className={`w-full pl-10 pr-4 py-2.5 border bg-white text-navy-900 focus:outline-none transition-colors text-sm shadow-2xs ${
                  errors.projectCity
                    ? "border-rose-500 focus:border-rose-600 focus:ring-1 focus:ring-rose-500/20"
                    : "border-navy-900/15 focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20"
                }`}
                placeholder="Select or enter Kutch town / taluka (e.g. Bhuj, Gandhidham, Anjar)"
              />
              <datalist id="kutch-towns">
                <option value="Bhuj" />
                <option value="Gandhidham" />
                <option value="Anjar" />
                <option value="Mandvi" />
                <option value="Mundra" />
                <option value="Nakhatrana" />
                <option value="Rapar" />
                <option value="Bhachau" />
                <option value="Abdasa" />
                <option value="Lakhpat" />
                <option value="Madhapar" />
                <option value="Mirzapar" />
                <option value="Sukhpar" />
                <option value="Kera" />
              </datalist>
            </div>
            {errors.projectCity ? (
              <p className="text-xs text-rose-600 font-mono mt-1">{errors.projectCity}</p>
            ) : (
              <p className="text-[11px] text-slate-500">
                Specify the specific town, village, or taluka in Kutch where the site is situated.
              </p>
            )}
          </div>
        </div>

        {/* Site Address / Landmark */}
        <div className="space-y-1.5 pt-2">
          <label className="block font-mono text-xs uppercase tracking-wider text-navy-900 font-semibold">
            Project Site Address / Landmark <span className="text-slate-400 text-[10px] font-normal tracking-normal">(Optional)</span>
          </label>
          <input
            type="text"
            value={formData.projectAddress || ""}
            onChange={(e) => setFormData({ ...formData, projectAddress: e.target.value })}
            className="w-full px-4 py-2.5 border border-navy-900/15 bg-white text-navy-900 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20 transition-colors text-sm shadow-2xs"
            placeholder="e.g. Near Jubilee Ground, Opp. Town Hall, Bhuj"
          />
        </div>

        {/* Project Brief with Live Character Counter */}
        <div className="space-y-1.5 pt-2">
          <div className="flex items-center justify-between">
            <label className="block font-mono text-xs uppercase tracking-wider text-navy-900 font-semibold">
              Project Brief (Maximum 500 characters) <span className="text-gold-700 font-bold">*</span>
            </label>
            <span className={`font-mono text-xs font-semibold ${
              (formData.projectBrief?.length || 0) > 500
                ? "text-rose-600"
                : (formData.projectBrief?.length || 0) >= 450
                ? "text-amber-600"
                : "text-slate-500"
            }`}>
              {formData.projectBrief?.length || 0} / 500 characters
            </span>
          </div>
          <textarea
            rows={4}
            maxLength={500}
            value={formData.projectBrief || ""}
            onChange={(e) => {
              setFormData({ ...formData, projectBrief: e.target.value });
              if (errors.projectBrief) setErrors({ ...errors, projectBrief: "" });
            }}
            placeholder="Provide a concise architectural summary of the project: concept, client brief, structural approach, and key spatial or material highlights (strictly max 500 characters)."
            className={`w-full p-3.5 border bg-white text-navy-900 focus:outline-none transition-colors text-xs leading-relaxed shadow-2xs ${
              errors.projectBrief
                ? "border-rose-500 focus:border-rose-600 focus:ring-1 focus:ring-rose-500/20"
                : "border-navy-900/15 focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20"
            }`}
          />
          {errors.projectBrief ? (
            <p className="text-xs text-rose-600 font-mono mt-1">{errors.projectBrief}</p>
          ) : (
            <p className="text-[11px] text-slate-500">
              This summary introduces your project to the jury. Focus on intent, regional context, and execution.
            </p>
          )}
        </div>

        {/* Completion Date & Built-up Area */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-5 border-t border-navy-900/10">
          <div className="space-y-1.5">
            <label className="block font-mono text-xs uppercase tracking-wider text-navy-900 font-semibold">
              Project Completion Date <span className="text-gold-700 font-bold">*</span>
            </label>
            <div className="relative">
              <Calendar size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="date"
                required
                min="2024-01-01"
                max="2026-12-31"
                value={formData.projectCompletionDate || ""}
                onChange={(e) => {
                  setFormData({ ...formData, projectCompletionDate: e.target.value || null });
                  if (errors.projectCompletionDate) setErrors({ ...errors, projectCompletionDate: "" });
                }}
                className={`w-full pl-10 pr-4 py-2.5 border bg-white text-navy-900 focus:outline-none transition-colors text-sm shadow-2xs ${
                  errors.projectCompletionDate
                    ? "border-rose-500 focus:border-rose-600 focus:ring-1 focus:ring-rose-500/20"
                    : "border-navy-900/15 focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20"
                }`}
              />
            </div>
            {errors.projectCompletionDate ? (
              <p className="text-xs text-rose-600 font-mono mt-1">{errors.projectCompletionDate}</p>
            ) : (
              <p className="text-[11px] text-slate-500">
                Eligible projects must have been completed in calendar years 2024, 2025, or 2026 (January 1, 2024 through December 31, 2026).
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block font-mono text-xs uppercase tracking-wider text-navy-900 font-semibold">
              Built-up Area (Sq. Ft.) <span className="text-slate-400 text-[10px] font-normal tracking-normal">(Optional)</span>
            </label>
            <div className="relative">
              <Maximize2 size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.builtUpAreaSqft ?? ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData({
                    ...formData,
                    builtUpAreaSqft: val === "" ? null : parseFloat(val),
                  });
                }}
                className="w-full pl-10 pr-4 py-2.5 border border-navy-900/15 bg-white text-navy-900 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20 transition-colors text-sm shadow-2xs"
                placeholder="e.g. 4500"
              />
            </div>
            {errors.builtUpAreaSqft ? (
              <p className="text-xs text-rose-600 font-mono mt-1">{errors.builtUpAreaSqft}</p>
            ) : (
              <p className="text-[11px] text-slate-500">
                Approximate carpet or built-up area in square feet.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-navy-900/10">
        <Button
          type="button"
          onClick={onPrev}
          variant="outline-dark"
          size="md"
          icon={<ArrowLeft size={14} />}
        >
          Previous: Category
        </Button>
        <Button
          type="submit"
          variant="primary"
          size="md"
          icon={<ArrowRight size={14} />}
          disabled={isSaving || submitting}
        >
          {submitting ? "Saving..." : "Save & Continue to Questionnaire"}
        </Button>
      </div>
    </form>
  );
}
