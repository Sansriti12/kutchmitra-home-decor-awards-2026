"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Lock, Mail, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { ensureApplicantProfile } from "@/lib/auth/profile";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get("redirect") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setErrorMessage("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        if (error.message.toLowerCase().includes("invalid login credentials")) {
          setErrorMessage("Invalid email or password. Please check your credentials and try again.");
        } else if (error.message.toLowerCase().includes("email not confirmed")) {
          setErrorMessage(
            "Your email address has not been confirmed yet. Please check your inbox for the verification link."
          );
        } else {
          setErrorMessage(error.message);
        }
        setLoading(false);
        return;
      }

      if (data.user) {
        // Idempotently ensure applicant profile exists on first successful login
        await ensureApplicantProfile(supabase, data.user);

        setSuccessMessage("Sign in successful! Entering applicant portal...");
        setTimeout(() => {
          router.push(redirectTo);
          router.refresh();
        }, 800);
      }
    } catch (err: unknown) {
      console.error("Sign in error:", err);
      setErrorMessage("An unexpected error occurred during sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#FBFAF7] border border-navy-900/10 p-8 sm:p-10 space-y-6 shadow-card">
      {/* Header */}
      <div className="space-y-2 text-center">
        <span className="font-mono text-[10px] uppercase tracking-widest text-gold-600 font-semibold block">
          Applicant Portal
        </span>
        <h1 className="font-display text-3xl text-navy-900 font-medium">
          Applicant Login
        </h1>
        <p className="text-xs text-[#4A4F5C] font-sans">
          Sign in to manage drafts and view submitted nominations.
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
        <div className="p-3 bg-green-50 border border-green-200 text-xs font-sans text-green-700 flex items-start gap-2 animate-fade-up">
          <CheckCircle2 size={15} className="flex-shrink-0 mt-0.5 text-green-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4 font-sans">
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-xs font-mono uppercase text-navy-900 font-medium">
            Email Address
          </label>
          <div className="relative">
            <Mail size={15} className="absolute left-3.5 top-3 text-slate-400" />
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="applicant@firm.com"
              disabled={loading}
              className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border border-navy-900/15 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 focus:outline-none transition-colors disabled:bg-slate-50"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-xs font-mono uppercase text-navy-900 font-medium">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-mono text-gold-600 hover:text-gold-700 transition-colors"
            >
              Forgot Password?
            </Link>
          </div>
          <div className="relative">
            <Lock size={15} className="absolute left-3.5 top-3 text-slate-400" />
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
              className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border border-navy-900/15 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 focus:outline-none transition-colors disabled:bg-slate-50"
            />
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="md"
          className="w-full"
          disabled={loading}
          icon={loading ? <Loader2 size={14} className="animate-spin" /> : <ArrowRight size={14} />}
        >
          {loading ? "Signing In..." : "Sign In to Portal"}
        </Button>
      </form>

      {/* Registration Link */}
      <div className="pt-4 border-t border-navy-900/10 text-center text-xs font-sans text-[#4A4F5C]">
        <span>Don&apos;t have an account? </span>
        <Link href="/register" className="text-gold-600 hover:text-gold-700 font-semibold">
          Create an account →
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="flex-1 bg-ivory text-navy-900 py-16 sm:py-24">
      <div className="container-editorial max-w-md mx-auto">
        <Suspense fallback={<div className="p-8 text-center text-xs font-mono text-slate-400">Loading portal...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
