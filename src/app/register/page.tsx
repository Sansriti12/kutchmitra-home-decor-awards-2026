"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, User, Mail, Phone, Building2, MapPin, Lock, Info, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    mobile: "",
    email: "",
    firm: "",
    city: "",
    password: "",
    termsConsent: false,
  });
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage("Registration received. Account creation backend will be active in the next phase.");
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

          {/* Prototype Notice */}
          <div className="p-3 bg-white border border-navy-900/10 flex items-start gap-2 text-xs font-mono text-[#4A4F5C]">
            <Info size={14} className="text-gold-600 flex-shrink-0 mt-0.5" />
            <span>Prototype UI &bull; Registration backend will be connected in future phase.</span>
          </div>

          {statusMessage && (
            <div className="p-3 bg-gold-500/10 border border-gold-500/30 text-xs font-mono text-gold-700 animate-fade-up">
              {statusMessage}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 font-sans text-sm">
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
                  placeholder="Architect / Designer Name"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border border-navy-900/15 focus:border-gold-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

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
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border border-navy-900/15 focus:border-gold-500 focus:outline-none transition-colors"
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
                    placeholder="+91 98765 43210"
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border border-navy-900/15 focus:border-gold-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="firm" className="text-xs font-mono uppercase text-navy-900 font-medium">
                  Organization / Firm *
                </label>
                <div className="relative">
                  <Building2 size={15} className="absolute left-3.5 top-3 text-slate-400" />
                  <input
                    id="firm"
                    type="text"
                    required
                    value={formData.firm}
                    onChange={(e) => setFormData({ ...formData, firm: e.target.value })}
                    placeholder="Studio / Firm Name"
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border border-navy-900/15 focus:border-gold-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="city" className="text-xs font-mono uppercase text-navy-900 font-medium">
                  City / State *
                </label>
                <div className="relative">
                  <MapPin size={15} className="absolute left-3.5 top-3 text-slate-400" />
                  <input
                    id="city"
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="City, State"
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border border-navy-900/15 focus:border-gold-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-xs font-mono uppercase text-navy-900 font-medium">
                Account Password *
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  id="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Create a secure password"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border border-navy-900/15 focus:border-gold-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Terms consent */}
            <div className="pt-2 flex items-start gap-2.5">
              <input
                id="terms"
                type="checkbox"
                required
                checked={formData.termsConsent}
                onChange={(e) => setFormData({ ...formData, termsConsent: e.target.checked })}
                className="mt-1 h-4 w-4 accent-gold-500 border-navy-900/20"
              />
              <label htmlFor="terms" className="text-xs text-[#4A4F5C] font-sans leading-relaxed">
                I agree to the nomination terms, submission guidelines, and privacy policy of the 2026 awards.
              </label>
            </div>

            <Button type="submit" variant="primary" size="md" className="w-full" icon={<ArrowRight size={14} />}>
              Create Account
            </Button>
          </form>

          {/* Login Link */}
          <div className="pt-4 border-t border-navy-900/10 text-center text-xs font-sans text-[#4A4F5C]">
            <span>Already have an account? </span>
            <Link href="/login" className="text-gold-600 hover:text-gold-700 font-semibold">
              Sign In →
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
