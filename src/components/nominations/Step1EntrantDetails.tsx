"use client";

import React, { useState } from "react";
import { User, Building2, MapPin, Mail, Phone, Globe, Edit3, Check, Loader2, Info, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { updateApplicantProfile } from "@/lib/auth/profile-actions";

export interface EntrantDetailsData {
  fullName: string;
  email: string;
  phone: string | null;
  organizationName: string | null;
  designation: string | null;
  city: string;
  state: string;
  postalCode: string | null;
  addressLine: string | null;
  websiteUrl: string | null;
  portfolioUrl: string | null;
}

interface Step1EntrantDetailsProps {
  entrant: EntrantDetailsData;
  onNext: () => void;
  onProfileUpdated?: (updated: Partial<EntrantDetailsData>) => void;
}

export default function Step1EntrantDetails({
  entrant,
  onNext,
  onProfileUpdated,
}: Step1EntrantDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Edit form state initialized from entrant prop
  const [formState, setFormState] = useState({
    fullName: entrant.fullName,
    phone: entrant.phone || "",
    organizationName: entrant.organizationName || "",
    designation: entrant.designation || "",
    city: entrant.city,
    state: entrant.state,
    postalCode: entrant.postalCode || "",
    addressLine: entrant.addressLine || "",
    websiteUrl: entrant.websiteUrl || "",
    portfolioUrl: entrant.portfolioUrl || "",
  });

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await updateApplicantProfile({
        fullName: formState.fullName,
        phone: formState.phone,
        organizationName: formState.organizationName,
        designation: formState.designation,
        city: formState.city,
        state: formState.state,
        postalCode: formState.postalCode,
        addressLine: formState.addressLine,
        websiteUrl: formState.websiteUrl,
        portfolioUrl: formState.portfolioUrl,
      });

      if (res.success) {
        setSuccessMsg("Entrant profile successfully updated.");
        setIsEditing(false);
        if (onProfileUpdated) {
          onProfileUpdated({
            fullName: formState.fullName,
            phone: formState.phone,
            organizationName: formState.organizationName,
            designation: formState.designation,
            city: formState.city,
            state: formState.state,
            postalCode: formState.postalCode,
            addressLine: formState.addressLine,
            websiteUrl: formState.websiteUrl,
            portfolioUrl: formState.portfolioUrl,
          });
        }
      } else {
        setErrorMsg(res.error || "Failed to update profile.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title & Guidance Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-gold-800 bg-gold-500/15 px-2.5 py-0.5 border border-gold-500/30 font-semibold inline-block">
            Step 01 of 07
          </span>
          <span className="text-slate-400 font-mono text-xs">/</span>
          <span className="text-xs font-mono uppercase tracking-wider text-slate-500 font-medium">
            Entrant Verification
          </span>
        </div>
        <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl text-navy-900 font-medium tracking-tight">
          Applicant & Entrant Verification
        </h2>
        <p className="text-sm text-[#4A4F5C] leading-relaxed max-w-2xl">
          Review the professional credentials and architectural practice details that will be officially attached to this nomination dossier.
        </p>
      </div>

      {/* Advisory Callout: Account vs Entrant Information */}
      <div className="p-4 bg-white border border-navy-900/10 shadow-2xs flex items-start gap-3.5">
        <div className="p-1.5 bg-gold-500/10 border border-gold-500/20 text-gold-700 flex-shrink-0 mt-0.5">
          <Info size={16} />
        </div>
        <div className="text-xs text-[#4A4F5C] space-y-1 leading-relaxed">
          <p className="font-medium text-navy-900">
            Official Entrant Attribution Framework
          </p>
          <p>
            Your account email (<code className="font-mono text-navy-900 font-semibold bg-slate-100 px-1.5 py-0.5 border border-slate-200">{entrant.email}</code>)
            maintains authenticated ownership of this nomination. The professional profile below defines the architect, interior designer, or studio credited in the official awards catalogue and jury dossiers.
          </p>
        </div>
      </div>

      {/* Profile Feedback Messages */}
      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono flex items-center gap-2 shadow-2xs">
          <Check size={14} className="text-emerald-700 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-mono shadow-2xs">
          {errorMsg}
        </div>
      )}

      {/* Profile Card View / Edit Mode */}
      {!isEditing ? (
        <div className="bg-[#FBFAF7] border border-navy-900/10 p-6 sm:p-8 shadow-card space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-navy-900/10 pb-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-navy-900 text-gold-400 font-display text-2xl font-bold flex items-center justify-center border-2 border-gold-500/30 shadow-xs flex-shrink-0">
                {entrant.fullName ? entrant.fullName.charAt(0).toUpperCase() : "A"}
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono uppercase tracking-widest text-gold-700 bg-gold-500/10 px-2 py-0.5 border border-gold-500/20 font-semibold inline-block">
                  Verified Entrant Profile
                </span>
                <h3 className="font-display text-xl sm:text-2xl text-navy-900 font-semibold">
                  {entrant.fullName}
                </h3>
                <p className="text-xs text-[#4A4F5C]">
                  {entrant.designation || "Architect / Designer"}
                  {entrant.organizationName ? ` · ${entrant.organizationName}` : ""}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-2 px-4 py-2 border border-navy-900/15 bg-white hover:bg-slate-50 text-xs font-mono uppercase tracking-wider text-navy-900 transition-colors shadow-2xs cursor-pointer self-start sm:self-center"
            >
              <Edit3 size={13} className="text-gold-600" />
              <span>Edit Details</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
            <div className="flex items-start gap-3 p-3 bg-white border border-navy-900/5 shadow-2xs">
              <Building2 size={16} className="text-slate-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-slate-400 font-mono block text-[10px] uppercase tracking-wider">Firm / Studio</span>
                <span className="text-navy-900 font-medium text-sm">{entrant.organizationName || "Independent Practice"}</span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-white border border-navy-900/5 shadow-2xs">
              <Mail size={16} className="text-slate-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-slate-400 font-mono block text-[10px] uppercase tracking-wider">Email Address</span>
                <span className="text-navy-900 font-medium text-sm">{entrant.email}</span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-white border border-navy-900/5 shadow-2xs">
              <Phone size={16} className="text-slate-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-slate-400 font-mono block text-[10px] uppercase tracking-wider">Phone / Mobile</span>
                <span className="text-navy-900 font-medium text-sm">{entrant.phone || "Not specified"}</span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-white border border-navy-900/5 shadow-2xs">
              <MapPin size={16} className="text-slate-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-slate-400 font-mono block text-[10px] uppercase tracking-wider">Base City & State</span>
                <span className="text-navy-900 font-medium text-sm">{entrant.city}, {entrant.state}</span>
              </div>
            </div>

            {entrant.portfolioUrl && (
              <div className="flex items-start gap-3 p-3 bg-white border border-navy-900/5 shadow-2xs sm:col-span-2">
                <Globe size={16} className="text-slate-400 mt-0.5 flex-shrink-0" />
                <div className="overflow-hidden">
                  <span className="text-slate-400 font-mono block text-[10px] uppercase tracking-wider">Portfolio / Website</span>
                  <a
                    href={entrant.portfolioUrl.startsWith("http") ? entrant.portfolioUrl : `https://${entrant.portfolioUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gold-700 hover:underline font-mono text-xs truncate block max-w-xl font-medium"
                  >
                    {entrant.portfolioUrl}
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Inline Profile Edit Form */
        <form onSubmit={handleSaveProfile} className="bg-[#FBFAF7] border-2 border-gold-500/40 p-6 sm:p-8 shadow-card space-y-5">
          <div className="border-b border-navy-900/10 pb-4">
            <h3 className="font-display text-lg text-navy-900 font-semibold">
              Edit Entrant Profile Details
            </h3>
            <p className="text-xs text-[#4A4F5C] mt-0.5">
              Updates saved here will automatically sync across your account and saved nominations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-mono text-[11px] uppercase tracking-wider text-slate-700 font-semibold mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formState.fullName}
                onChange={(e) => setFormState({ ...formState, fullName: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-navy-900/15 bg-white text-navy-900 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20 text-xs transition-colors"
              />
            </div>

            <div>
              <label className="block font-mono text-[11px] uppercase tracking-wider text-slate-700 font-semibold mb-1">
                Contact Phone / Mobile
              </label>
              <input
                type="tel"
                value={formState.phone}
                onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-navy-900/15 bg-white text-navy-900 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20 text-xs transition-colors"
                placeholder="+91 98765 43210"
              />
            </div>

            <div>
              <label className="block font-mono text-[11px] uppercase tracking-wider text-slate-700 font-semibold mb-1">
                Firm / Organization Name
              </label>
              <input
                type="text"
                value={formState.organizationName}
                onChange={(e) => setFormState({ ...formState, organizationName: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-navy-900/15 bg-white text-navy-900 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20 text-xs transition-colors"
                placeholder="Studio / Architectural Practice"
              />
            </div>

            <div>
              <label className="block font-mono text-[11px] uppercase tracking-wider text-slate-700 font-semibold mb-1">
                Designation / Role
              </label>
              <input
                type="text"
                value={formState.designation}
                onChange={(e) => setFormState({ ...formState, designation: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-navy-900/15 bg-white text-navy-900 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20 text-xs transition-colors"
                placeholder="Principal Architect / Lead Designer"
              />
            </div>

            <div>
              <label className="block font-mono text-[11px] uppercase tracking-wider text-slate-700 font-semibold mb-1">
                City *
              </label>
              <input
                type="text"
                required
                value={formState.city}
                onChange={(e) => setFormState({ ...formState, city: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-navy-900/15 bg-white text-navy-900 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20 text-xs transition-colors"
              />
            </div>

            <div>
              <label className="block font-mono text-[11px] uppercase tracking-wider text-slate-700 font-semibold mb-1">
                State *
              </label>
              <input
                type="text"
                required
                value={formState.state}
                onChange={(e) => setFormState({ ...formState, state: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-navy-900/15 bg-white text-navy-900 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20 text-xs transition-colors"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-mono text-[11px] uppercase tracking-wider text-slate-700 font-semibold mb-1">
                Portfolio / Website URL
              </label>
              <input
                type="url"
                value={formState.portfolioUrl}
                onChange={(e) => setFormState({ ...formState, portfolioUrl: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-navy-900/15 bg-white text-navy-900 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20 text-xs transition-colors"
                placeholder="https://yourstudio.com"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-navy-900/10">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              disabled={isSubmitting}
              className="px-4 py-2 border border-navy-900/15 bg-white text-xs font-mono uppercase tracking-wider text-slate-600 hover:text-navy-900 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-navy-900 hover:bg-navy-800 text-gold-400 font-mono text-xs uppercase tracking-wider font-semibold inline-flex items-center gap-2 transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
            >
              {isSubmitting && <Loader2 size={13} className="animate-spin" />}
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      )}

      {/* Next Step Action Bar */}
      <div className="flex items-center justify-between pt-6 border-t border-navy-900/10">
        <span className="text-xs font-mono text-slate-500 flex items-center gap-1.5">
          <Check size={14} className="text-emerald-600" />
          <span>Step 01: Entrant Verified</span>
        </span>
        <Button
          onClick={onNext}
          variant="primary"
          size="md"
          icon={<ArrowRight size={14} />}
        >
          Confirm & Proceed to Category
        </Button>
      </div>
    </div>
  );
}
