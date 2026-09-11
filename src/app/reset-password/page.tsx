"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (password.length < 8) {
      setErrorMessage("New password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please re-enter.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        setErrorMessage(error.message);
      } else {
        setSuccessMessage("Your password has been updated successfully! Redirecting to applicant login...");
        setTimeout(() => {
          router.push("/login");
        }, 1500);
      }
    } catch (err: unknown) {
      console.error("Password update error:", err);
      setErrorMessage("An unexpected error occurred while updating your password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 bg-ivory text-navy-900 py-16 sm:py-24">
      <div className="container-editorial max-w-md mx-auto">
        <div className="bg-[#FBFAF7] border border-navy-900/10 p-8 sm:p-10 space-y-6 shadow-card">
          {/* Header */}
          <div className="space-y-2 text-center">
            <span className="font-mono text-[10px] uppercase tracking-widest text-gold-600 font-semibold block">
              Security Update
            </span>
            <h1 className="font-display text-3xl text-navy-900 font-medium">
              Set New Password
            </h1>
            <p className="text-xs text-[#4A4F5C] font-sans">
              Enter your new account password below to secure your applicant account.
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-xs font-sans text-red-700 flex items-start gap-2 animate-fade-up">
              <AlertCircle size={15} className="flex-shrink-0 mt-0.5 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Banner */}
          {successMessage && (
            <div className="p-4 bg-green-50 border border-green-200 text-xs font-sans text-green-700 flex items-start gap-2.5 animate-fade-up">
              <CheckCircle2 size={16} className="flex-shrink-0 mt-0.5 text-green-600" />
              <span className="leading-relaxed">{successMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 font-sans">
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-xs font-mono uppercase text-navy-900 font-medium">
                New Password (min 8 chars)
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  id="password"
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={loading || Boolean(successMessage)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border border-navy-900/15 focus:border-gold-500 focus:outline-none transition-colors disabled:bg-slate-50"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="confirmPassword" className="text-xs font-mono uppercase text-navy-900 font-medium">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={loading || Boolean(successMessage)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border border-navy-900/15 focus:border-gold-500 focus:outline-none transition-colors disabled:bg-slate-50"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full"
              disabled={loading || Boolean(successMessage)}
              icon={loading ? <Loader2 size={14} className="animate-spin" /> : <ArrowRight size={14} />}
            >
              {loading ? "Updating Password..." : "Update Password"}
            </Button>
          </form>

          {/* Return to Login */}
          <div className="pt-4 border-t border-navy-900/10 text-center text-xs font-sans text-[#4A4F5C]">
            <Link href="/login" className="text-gold-600 hover:text-gold-700 font-semibold">
              Return to Sign In →
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
