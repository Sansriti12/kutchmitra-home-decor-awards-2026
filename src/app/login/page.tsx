"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, User, Lock, Mail, AlertCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showForgot, setShowForgot] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage("Applicant portal authentication backend will be active in the next phase.");
  };

  return (
    <main className="flex-1 bg-ivory text-navy-900 py-16 sm:py-24">
      <div className="container-editorial max-w-md mx-auto">
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

          {/* Prototype Notice */}
          <div className="p-3 bg-white border border-navy-900/10 flex items-start gap-2 text-xs font-mono text-[#4A4F5C]">
            <Info size={14} className="text-gold-600 flex-shrink-0 mt-0.5" />
            <span>Prototype UI &bull; Backend authentication will be connected in future phase.</span>
          </div>

          {statusMessage && (
            <div className="p-3 bg-gold-500/10 border border-gold-500/30 text-xs font-mono text-gold-700 animate-fade-up">
              {statusMessage}
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
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border border-navy-900/15 focus:border-gold-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-xs font-mono uppercase text-navy-900 font-medium">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgot(!showForgot)}
                  className="text-xs font-mono text-gold-600 hover:text-gold-700"
                >
                  Forgot Password?
                </button>
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
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border border-navy-900/15 focus:border-gold-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {showForgot && (
              <div className="p-3 bg-white border border-gold-500/30 text-xs text-[#4A4F5C] animate-fade-up">
                Password recovery via email / OTP will be supported upon authentication backend launch.
              </div>
            )}

            <Button type="submit" variant="primary" size="md" className="w-full" icon={<ArrowRight size={14} />}>
              Sign In to Portal
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
      </div>
    </main>
  );
}
