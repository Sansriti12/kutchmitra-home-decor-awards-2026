"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Shield,
  Award,
  Lock,
  Mail,
  ArrowRight,
  AlertTriangle,
  Loader2,
  ExternalLink,
  Scale,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

function JuryLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/jury/portal";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const supabase = createClient();

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (authError || !authData.user) {
        setErrorMsg("Invalid email or password. Please verify your Grand Jury credentials.");
        setLoading(false);
        return;
      }

      // Verify user has 'jury_member', 'admin', or 'super_admin' role
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("role_id")
        .eq("user_id", authData.user.id);

      if (rolesError || !roles || roles.length === 0) {
        await supabase.auth.signOut();
        setErrorMsg("Access Denied: This account has not been assigned Grand Jury permissions.");
        setLoading(false);
        return;
      }

      const roleIds = roles.map((r) => r.role_id);
      const isAuthorized =
        roleIds.includes("jury_member") ||
        roleIds.includes("admin") ||
        roleIds.includes("super_admin");

      if (!isAuthorized) {
        await supabase.auth.signOut();
        setErrorMsg(
          "Access Denied: This portal is reserved exclusively for appointed Grand Jury panelists. If you are an award entrant, please sign in via the Applicant Portal."
        );
        setLoading(false);
        return;
      }

      router.push(redirectTo);
      router.refresh();
    } catch (err: any) {
      console.error("Jury login error:", err);
      setErrorMsg("An unexpected authentication error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col justify-between text-slate-200">
      {/* Top Header */}
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="font-mono text-xs uppercase tracking-[0.25em] text-gold-400 font-bold">
            Kutchmitra
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 bg-gold-500/20 text-gold-300 border border-gold-500/30 uppercase">
            Jury Portal
          </span>
        </Link>

        <div className="flex items-center gap-4 text-xs font-mono">
          <Link
            href="/login"
            className="text-slate-400 hover:text-white transition-colors"
          >
            Applicant Portal
          </Link>
          <span className="text-slate-600">|</span>
          <Link
            href="/admin/login"
            className="text-slate-400 hover:text-white transition-colors"
          >
            Admin Sign In
          </Link>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-navy-900/90 border border-white/10 p-8 space-y-6 shadow-2xl relative overflow-hidden">
          {/* Subtle gold glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/5 rounded-full blur-2xl pointer-events-none" />

          {/* Heading */}
          <div className="space-y-2 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-navy-950 border border-gold-500/30 text-gold-400 rounded-none mx-auto mb-2">
              <Scale size={24} />
            </div>
            <h1 className="font-display text-2xl sm:text-3xl text-white font-medium tracking-tight">
              Grand Jury Evaluation Portal
            </h1>
            <p className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              Edition 2026 // Confidential Assessment Workspace
            </p>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3 bg-red-950/80 border border-red-500/40 text-red-300 text-xs font-mono flex items-start gap-2">
              <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400">
                Juror Email Address
              </label>
              <div className="relative">
                <Mail
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="juror@designpanel.org"
                  className="w-full pl-9 pr-3 py-2.5 bg-navy-950 border border-white/15 text-white placeholder-slate-600 focus:outline-none focus:border-gold-500 font-mono text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2.5 bg-navy-950 border border-white/15 text-white placeholder-slate-600 focus:outline-none focus:border-gold-500 font-mono text-xs"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gold-500 hover:bg-gold-400 text-navy-950 text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-sm"
              >
                {loading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Enter Jury Workspace</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Confidentiality & Integrity Notice */}
          <div className="pt-4 border-t border-white/10 space-y-2 text-[11px] font-mono text-slate-400">
            <div className="flex items-center gap-1.5 text-gold-400 font-semibold">
              <Shield size={12} />
              <span>Confidentiality Protocol</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
              Access to this portal is restricted to appointed jurors. All nominations, drawings, and criteria scores are strictly confidential and governed by non-disclosure protocols.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-4 text-center text-xs font-mono text-slate-500">
        Kutchmitra Home &amp; Decor Awards 2026 // Independent Grand Jury Panel
      </footer>
    </div>
  );
}

export default function JuryLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-gold-400 gap-3">
          <Loader2 className="animate-spin text-gold-400" size={32} />
          <span className="text-xs font-mono tracking-widest text-slate-400 uppercase">
            Loading Jury Authentication...
          </span>
        </div>
      }
    >
      <JuryLoginForm />
    </Suspense>
  );
}

