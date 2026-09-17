"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Shield,
  Lock,
  Mail,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Award,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get("redirect") || "/admin";
  const urlError = searchParams?.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialChecking, setInitialChecking] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(() => {
    if (urlError === "unauthorized") {
      return "Access Denied: Administrator permissions are required to access this portal.";
    }
    return null;
  });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Check if an existing session is already an admin
  useEffect(() => {
    async function checkExistingSession() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data: rolesData } = await supabase
            .from("user_roles")
            .select("role_id")
            .eq("user_id", user.id);

          const roles = (rolesData || []).map((r) => r.role_id);
          const hasAdminAccess =
            roles.includes("admin") || roles.includes("super_admin");

          if (hasAdminAccess) {
            router.replace(redirectTo);
            return;
          }
        }
      } catch (err) {
        console.error("Session check error:", err);
      } finally {
        setInitialChecking(false);
      }
    }

    checkExistingSession();
  }, [router, redirectTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage("Please enter your administrator email address.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setErrorMessage("Please enter your administrator password.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail.toLowerCase(),
        password,
      });

      if (error) {
        // Safe error handling: never leak whether an email exists
        if (
          error.message.toLowerCase().includes("invalid login credentials") ||
          error.message.toLowerCase().includes("user not found") ||
          error.message.toLowerCase().includes("invalid grant")
        ) {
          setErrorMessage("Invalid credentials. Please verify your email and password.");
        } else if (error.message.toLowerCase().includes("fetch") || error.message.toLowerCase().includes("network")) {
          setErrorMessage("Unable to connect to the authentication service. Please check your network connection and try again.");
        } else {
          setErrorMessage("Invalid credentials. Please verify your email and password.");
        }
        setLoading(false);
        return;
      }

      if (data.user) {
        // Query user_roles to verify administrator or super_admin role
        const { data: rolesData, error: rolesError } = await supabase
          .from("user_roles")
          .select("role_id")
          .eq("user_id", data.user.id);

        if (rolesError) {
          console.error("Role lookup error:", rolesError);
        }

        const roles = (rolesData || []).map((r) => r.role_id);
        const hasAdminAccess =
          roles.includes("admin") || roles.includes("super_admin");

        if (!hasAdminAccess) {
          // Immediately sign out unauthorized user to prevent session contamination
          await supabase.auth.signOut();
          setErrorMessage(
            "Access Denied: This account does not possess administrator permissions. Please use the Applicant Portal."
          );
          setLoading(false);
          return;
        }

        setSuccessMessage("Administrator credentials verified. Accessing portal...");
        setTimeout(() => {
          router.push(redirectTo);
          router.refresh();
        }, 600);
      }
    } catch (err: unknown) {
      console.error("Admin sign in exception:", err);
      setErrorMessage(
        "An unexpected error occurred during administrative authentication."
      );
    } finally {
      setLoading(false);
    }
  };

  if (initialChecking) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center space-y-3">
        <Loader2 size={24} className="animate-spin text-gold-400" />
        <span className="font-mono text-xs text-slate-400">
          Verifying security environment...
        </span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto bg-navy-900/90 border border-white/10 p-8 sm:p-10 shadow-2xl backdrop-blur-sm space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gold-500/10 border border-gold-500/30 text-gold-400 font-mono text-[10px] uppercase tracking-widest">
          <Shield size={11} />
          <span>Restricted Access</span>
        </div>
        <h1 className="font-display text-2xl sm:text-3xl text-white font-medium tracking-tight">
          Admin Portal Login
        </h1>
        <p className="text-xs text-slate-400 font-sans">
          Authorized jury administrators, verifiers &amp; super-admins only.
        </p>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-3 bg-red-950/60 border border-red-500/40 text-xs font-sans text-red-200 flex items-start gap-2.5 animate-fade-up">
          <AlertCircle size={15} className="flex-shrink-0 mt-0.5 text-red-400" />
          <span className="leading-relaxed">{errorMessage}</span>
        </div>
      )}

      {/* Success Alert */}
      {successMessage && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 text-xs font-sans text-emerald-200 flex items-start gap-2.5 animate-fade-up">
          <CheckCircle2 size={15} className="flex-shrink-0 mt-0.5 text-emerald-400" />
          <span className="leading-relaxed">{successMessage}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label
            htmlFor="admin-email"
            className="text-[11px] font-mono uppercase tracking-wider text-slate-300 block"
          >
            Admin Email Address
          </label>
          <div className="relative">
            <Mail
              size={15}
              className="absolute left-3.5 top-3 text-slate-500 pointer-events-none"
            />
            <input
              id="admin-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@kutchmitra.com"
              disabled={loading}
              autoComplete="username"
              className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-navy-950 border border-white/15 text-white placeholder:text-slate-600 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 focus:outline-none transition-colors disabled:opacity-50"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="admin-password"
            className="text-[11px] font-mono uppercase tracking-wider text-slate-300 block"
          >
            Password
          </label>
          <div className="relative">
            <Lock
              size={15}
              className="absolute left-3.5 top-3 text-slate-500 pointer-events-none"
            />
            <input
              id="admin-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              disabled={loading}
              autoComplete="current-password"
              className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-navy-950 border border-white/15 text-white placeholder:text-slate-600 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 focus:outline-none transition-colors disabled:opacity-50"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gold-500 hover:bg-gold-400 text-navy-950 text-xs font-mono uppercase tracking-wider font-semibold shadow-sm transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              <span>Authenticating...</span>
            </>
          ) : (
            <>
              <span>Sign In to Admin Portal</span>
              <ArrowRight size={14} />
            </>
          )}
        </button>
      </form>

      {/* Auxiliary links */}
      <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-mono text-slate-400">
        <Link
          href="/"
          className="inline-flex items-center gap-1 hover:text-gold-400 transition-colors"
        >
          <ArrowLeft size={12} />
          <span>Public Website</span>
        </Link>
        <Link
          href="/login"
          className="hover:text-gold-400 transition-colors underline underline-offset-4"
        >
          Applicant Login &rarr;
        </Link>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex flex-col justify-between py-8 px-4 bg-[#060B18]">
      {/* Top Branding bar */}
      <div className="w-full max-w-5xl mx-auto flex items-center justify-between pb-6 border-b border-white/10">
        <Link href="/" className="group flex flex-col focus-visible:outline-none">
          <span className="font-mono text-[10px] tracking-[0.22em] text-gold-400 uppercase font-bold">
            Kutchmitra
          </span>
          <span className="font-display text-lg font-medium text-white group-hover:text-gold-300 transition-colors">
            Home &amp; Decor Awards <span className="text-gold-500 font-sans text-xs">2026</span>
          </span>
        </Link>
        <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
          <Award size={13} className="text-gold-400" />
          <span>Award Operations</span>
        </div>
      </div>

      {/* Main Login Form Box */}
      <div className="my-auto py-8">
        <Suspense
          fallback={
            <div className="text-center p-8 text-xs font-mono text-slate-400">
              Loading administration portal...
            </div>
          }
        >
          <AdminLoginForm />
        </Suspense>
      </div>

      {/* Bottom Footer */}
      <div className="w-full max-w-5xl mx-auto pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] font-mono text-slate-500">
        <p>&copy; 2026 Kutchmitra Home &amp; Decor Awards. Confidential Administration Portal.</p>
        <p>Unauthenticated attempts are monitored and recorded.</p>
      </div>
    </div>
  );
}
