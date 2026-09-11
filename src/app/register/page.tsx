"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  User,
  Mail,
  Phone,
  Building2,
  MapPin,
  Lock,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { ensureApplicantProfile } from "@/lib/auth/profile";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    mobile: "",
    email: "",
    firm: "",
    city: "",
    state: "Gujarat",
    password: "",
    confirmPassword: "",
    termsConsent: false,
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [emailConfirmationRequired, setEmailConfirmationRequired] = useState(false);

  // Validate Indian mobile number (10 digits starting with 6, 7, 8, or 9, optional +91 or 0 prefix)
  const validateMobile = (mobile: string): boolean => {
    const cleaned = mobile.replace(/[\s\-\(\)]/g, "");
    const regex = /^(?:\+?91|0)?[6-9]\d{9}$/;
    return regex.test(cleaned);
  };

  const cleanMobileNumber = (mobile: string): string => {
    const cleaned = mobile.replace(/[\s\-\(\)]/g, "");
    if (cleaned.startsWith("+91")) return cleaned;
    if (cleaned.startsWith("0")) return `+91${cleaned.slice(1)}`;
    if (cleaned.length === 10) return `+91${cleaned}`;
    return cleaned;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Client-side validations
    if (!formData.fullName.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }

    if (!formData.email.trim() || !formData.email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (!validateMobile(formData.mobile)) {
      setErrorMessage("Please enter a valid 10-digit Indian mobile number (e.g., 9876543210).");
      return;
    }

    if (!formData.firm.trim()) {
      setErrorMessage("Please enter your organization or studio firm name.");
      return;
    }

    if (!formData.city.trim()) {
      setErrorMessage("Please enter your city.");
      return;
    }

    if (!formData.state.trim()) {
      setErrorMessage("Please enter your state.");
      return;
    }

    if (formData.password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match. Please re-enter.");
      return;
    }

    if (!formData.termsConsent) {
      setErrorMessage("You must agree to the nomination terms and privacy policy to register.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const cleanedPhone = cleanMobileNumber(formData.mobile);
      const now = new Date().toISOString();

      const { data, error } = await supabase.auth.signUp({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName.trim(),
            phone: cleanedPhone,
            organization_name: formData.firm.trim(),
            city: formData.city.trim(),
            state: formData.state.trim(),
            terms_accepted_at: now,
            privacy_accepted_at: now,
          },
        },
      });

      if (error) {
        if (
          error.message.toLowerCase().includes("already registered") ||
          error.message.toLowerCase().includes("user already exists")
        ) {
          setErrorMessage("An account with this email address already exists. Please sign in instead.");
        } else {
          setErrorMessage(error.message);
        }
        setLoading(false);
        return;
      }

      // Check if session was created immediately (email confirmation disabled)
      if (data.session && data.user) {
        await ensureApplicantProfile(supabase, data.user, {
          organization_name: formData.firm.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          terms_accepted_at: now,
          privacy_accepted_at: now,
        });

        setSuccessMessage("Account created successfully! Redirecting to your applicant portal...");
        setTimeout(() => {
          router.push("/dashboard");
          router.refresh();
        }, 1200);
      } else {
        // Email confirmation is enabled in Supabase
        setEmailConfirmationRequired(true);
        setSuccessMessage(
          `Account registered successfully! A verification link has been sent to ${formData.email}. Please verify your email before signing in.`
        );
      }
    } catch (err: unknown) {
      console.error("Registration error:", err);
      setErrorMessage("An unexpected error occurred during registration. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 bg-ivory text-navy-900 py-16 sm:py-24">
      <div className="container-editorial max-w-lg mx-auto">
        <div className="bg-[#FBFAF7] border border-navy-900/10 p-8 sm:p-10 space-y-6 shadow-card">
          {/* Header */}
          <div className="space-y-2 text-center">
            <span className="font-mono text-[10px] uppercase tracking-widest text-gold-600 font-semibold block">
              Applicant Registration
            </span>
            <h1 className="font-display text-3xl text-navy-900 font-medium">
              Create Applicant Account
            </h1>
            <p className="text-xs text-[#4A4F5C] font-sans">
              Register your studio or professional profile to initiate 2026 award entries.
            </p>
          </div>

          {/* Email Confirmation Notice Screen */}
          {emailConfirmationRequired ? (
            <div className="p-6 bg-white border border-gold-500/40 text-center space-y-4">
              <div className="inline-flex p-3 rounded-full bg-gold-500/10 text-gold-600">
                <CheckCircle2 size={32} />
              </div>
              <h2 className="font-display text-xl text-navy-900 font-medium">
                Check Your Email
              </h2>
              <p className="text-xs text-[#4A4F5C] leading-relaxed">
                We have sent an account verification email to{" "}
                <strong className="text-navy-900">{formData.email}</strong>. Please click the link
                in that email to activate your account and proceed to the applicant portal.
              </p>
              <div className="pt-4 border-t border-navy-900/10">
                <Button
                  href="/login"
                  variant="primary"
                  size="md"
                  className="w-full"
                  icon={<ArrowRight size={14} />}
                >
                  Go to Sign In
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Error Banner */}
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 text-xs font-sans text-red-700 flex items-start gap-2 animate-fade-up">
                  <AlertCircle size={15} className="flex-shrink-0 mt-0.5 text-red-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Success Banner */}
              {successMessage && (
                <div className="p-3 bg-green-50 border border-green-200 text-xs font-sans text-green-700 flex items-start gap-2 animate-fade-up">
                  <CheckCircle2 size={15} className="flex-shrink-0 mt-0.5 text-green-600" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4 font-sans text-sm">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label htmlFor="fullName" className="text-xs font-mono uppercase text-navy-900 font-medium">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User size={15} className="absolute left-3.5 top-3 text-slate-400" />
                    <input
                      id="fullName"
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="Architect / Designer Full Name"
                      disabled={loading}
                      className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border border-navy-900/15 focus:border-gold-500 focus:outline-none transition-colors disabled:bg-slate-50"
                    />
                  </div>
                </div>

                {/* Email & Mobile */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="email" className="text-xs font-mono uppercase text-navy-900 font-medium">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail size={15} className="absolute left-3.5 top-3 text-slate-400" />
                      <input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="name@firm.com"
                        disabled={loading}
                        className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border border-navy-900/15 focus:border-gold-500 focus:outline-none transition-colors disabled:bg-slate-50"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="mobile" className="text-xs font-mono uppercase text-navy-900 font-medium">
                      Mobile Number *
                    </label>
                    <div className="relative">
                      <Phone size={15} className="absolute left-3.5 top-3 text-slate-400" />
                      <input
                        id="mobile"
                        type="tel"
                        required
                        value={formData.mobile}
                        onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                        placeholder="9876543210"
                        disabled={loading}
                        className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border border-navy-900/15 focus:border-gold-500 focus:outline-none transition-colors disabled:bg-slate-50"
                      />
                    </div>
                  </div>
                </div>

                {/* Organization */}
                <div className="space-y-1.5">
                  <label htmlFor="firm" className="text-xs font-mono uppercase text-navy-900 font-medium">
                    Organization / Studio Firm *
                  </label>
                  <div className="relative">
                    <Building2 size={15} className="absolute left-3.5 top-3 text-slate-400" />
                    <input
                      id="firm"
                      type="text"
                      required
                      value={formData.firm}
                      onChange={(e) => setFormData({ ...formData, firm: e.target.value })}
                      placeholder="Studio / Architectural Firm Name"
                      disabled={loading}
                      className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border border-navy-900/15 focus:border-gold-500 focus:outline-none transition-colors disabled:bg-slate-50"
                    />
                  </div>
                </div>

                {/* City & State */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="city" className="text-xs font-mono uppercase text-navy-900 font-medium">
                      City *
                    </label>
                    <div className="relative">
                      <MapPin size={15} className="absolute left-3.5 top-3 text-slate-400" />
                      <input
                        id="city"
                        type="text"
                        required
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder="e.g. Bhuj, Gandhidham"
                        disabled={loading}
                        className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border border-navy-900/15 focus:border-gold-500 focus:outline-none transition-colors disabled:bg-slate-50"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="state" className="text-xs font-mono uppercase text-navy-900 font-medium">
                      State *
                    </label>
                    <div className="relative">
                      <MapPin size={15} className="absolute left-3.5 top-3 text-slate-400" />
                      <input
                        id="state"
                        type="text"
                        required
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        placeholder="Gujarat"
                        disabled={loading}
                        className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border border-navy-900/15 focus:border-gold-500 focus:outline-none transition-colors disabled:bg-slate-50"
                      />
                    </div>
                  </div>
                </div>

                {/* Password & Confirm Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="password" className="text-xs font-mono uppercase text-navy-900 font-medium">
                      Password (min 8 chars) *
                    </label>
                    <div className="relative">
                      <Lock size={15} className="absolute left-3.5 top-3 text-slate-400" />
                      <input
                        id="password"
                        type="password"
                        required
                        minLength={8}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="••••••••"
                        disabled={loading}
                        className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border border-navy-900/15 focus:border-gold-500 focus:outline-none transition-colors disabled:bg-slate-50"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="confirmPassword" className="text-xs font-mono uppercase text-navy-900 font-medium">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <Lock size={15} className="absolute left-3.5 top-3 text-slate-400" />
                      <input
                        id="confirmPassword"
                        type="password"
                        required
                        minLength={8}
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        placeholder="••••••••"
                        disabled={loading}
                        className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border border-navy-900/15 focus:border-gold-500 focus:outline-none transition-colors disabled:bg-slate-50"
                      />
                    </div>
                  </div>
                </div>

                {/* Terms Consent */}
                <div className="pt-2 flex items-start gap-2.5">
                  <input
                    id="terms"
                    type="checkbox"
                    required
                    checked={formData.termsConsent}
                    onChange={(e) => setFormData({ ...formData, termsConsent: e.target.checked })}
                    disabled={loading}
                    className="mt-1 h-4 w-4 accent-gold-500 border-navy-900/20 cursor-pointer"
                  />
                  <label htmlFor="terms" className="text-xs text-[#4A4F5C] font-sans leading-relaxed cursor-pointer">
                    I agree to the{" "}
                    <Link href="/terms" target="_blank" className="text-gold-600 underline hover:text-gold-700">
                      nomination terms
                    </Link>
                    , submission guidelines, and{" "}
                    <Link href="/privacy" target="_blank" className="text-gold-600 underline hover:text-gold-700">
                      privacy policy
                    </Link>{" "}
                    of the Kutchmitra Home &amp; Decor Awards 2026.
                  </label>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="w-full"
                  disabled={loading}
                  icon={loading ? <Loader2 size={14} className="animate-spin" /> : <ArrowRight size={14} />}
                >
                  {loading ? "Creating Account..." : "Create Account"}
                </Button>
              </form>

              {/* Login Link */}
              <div className="pt-4 border-t border-navy-900/10 text-center text-xs font-sans text-[#4A4F5C]">
                <span>Already have an account? </span>
                <Link href="/login" className="text-gold-600 hover:text-gold-700 font-semibold">
                  Sign In →
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
