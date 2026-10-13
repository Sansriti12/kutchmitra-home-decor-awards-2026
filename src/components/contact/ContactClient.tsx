"use client";

import React, { useState } from "react";
import { Mail, MapPin, Phone, Send, AlertCircle, CheckCircle2 } from "lucide-react";
import { SectionMarker } from "@/components/ui/SectionMarker";
import { Button } from "@/components/ui/Button";
import type { CmsSiteSettings } from "@/lib/cms/types";

interface ContactClientProps {
  siteSettings: CmsSiteSettings;
}

export default function ContactClient({ siteSettings }: ContactClientProps) {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <main className="flex-1 bg-ivory text-navy-900">
      {/* Banner */}
      <section className="py-10 sm:py-14 lg:py-16 border-b border-navy-900/10 bg-[#FBFAF7]">
        <div className="container-editorial space-y-6">
          <SectionMarker number="01" label="Awards Helpdesk" theme="light" />
          <div className="space-y-2">
            <h1 className="heading-display text-navy-900 max-w-3xl">
              Contact Awards Desk
            </h1>
          </div>
          <p className="body-editorial text-[#4A4F5C] max-w-2xl text-lg">
            Have an inquiry regarding categories, nomination requirements, or technical support? Connect with the awards team.
          </p>
        </div>
      </section>

      {/* Main Form & Information Section */}
      <section className="py-10 sm:py-14 lg:py-16 border-b border-navy-900/10">
        <div className="container-editorial">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            {/* Left: Communication Channels (5 cols) */}
            <div className="lg:col-span-5 space-y-8">
              <div className="space-y-4">
                <span className="font-mono text-xs uppercase tracking-widest text-gold-600 font-semibold block">
                  Support &amp; Inquiries
                </span>
                <h2 className="heading-editorial text-navy-900 leading-tight">
                  Awards Helpdesk Communication
                </h2>
                <p className="body-editorial text-[#4A4F5C]">
                  Official Kutchmitra contact channels for applicant inquiries, category questions, and technical support.
                </p>
              </div>

              {/* Official Contact Cards */}
              <div className="space-y-4">
                <div className="p-5 bg-[#FBFAF7] border border-navy-900/10 space-y-2">
                  <div className="flex items-center gap-2.5 text-xs font-mono text-slate-400">
                    <MapPin size={14} className="text-gold-600" />
                    <span className="uppercase tracking-wider">Office Address</span>
                  </div>
                  <p className="text-sm font-sans font-medium text-navy-900 leading-snug whitespace-pre-line">
                    {siteSettings.officeAddress}
                  </p>
                  <p className="text-xs text-[#4A4F5C] leading-relaxed">
                    Official regional office of Kutchmitra.
                  </p>
                </div>

                <div className="p-5 bg-[#FBFAF7] border border-navy-900/10 space-y-2">
                  <div className="flex items-center gap-2.5 text-xs font-mono text-slate-400">
                    <Mail size={14} className="text-gold-600" />
                    <span className="uppercase tracking-wider">Official Email</span>
                  </div>
                  <a
                    href={`mailto:${siteSettings.officialEmail}`}
                    className="text-sm font-sans font-medium text-navy-900 hover:text-gold-600 transition-colors block"
                  >
                    {siteSettings.officialEmail}
                  </a>
                  <p className="text-xs text-[#4A4F5C] leading-relaxed">
                    Direct inquiries regarding awards participation and guidelines.
                  </p>
                </div>

                <div className="p-5 bg-[#FBFAF7] border border-navy-900/10 space-y-2">
                  <div className="flex items-center gap-2.5 text-xs font-mono text-slate-400">
                    <Phone size={14} className="text-gold-600" />
                    <span className="uppercase tracking-wider">Helpline &amp; Support</span>
                  </div>
                  <a
                    href={`tel:${siteSettings.helplinePhone.replace(/\s+/g, "")}`}
                    className="text-sm font-sans font-medium text-navy-900 hover:text-gold-600 transition-colors font-mono block"
                  >
                    {siteSettings.helplinePhone}
                  </a>
                  <p className="text-xs text-[#4A4F5C] leading-relaxed">
                    Dedicated support desk ({siteSettings.supportHours}).
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Interactive Inquiry Form UI (7 cols) */}
            <div className="lg:col-span-7 bg-[#FBFAF7] border border-navy-900/10 p-8 sm:p-10 space-y-6">
              <div className="space-y-2">
                <span className="font-mono text-xs uppercase tracking-widest text-gold-600 font-semibold">
                  Send an Inquiry
                </span>
                <h3 className="font-display text-2xl text-navy-900 font-medium">
                  General &amp; Technical Support
                </h3>
                <p className="text-sm text-[#4A4F5C]">
                  Please allow up to 24–48 business hours for a detailed response from our secretariat.
                </p>
              </div>

              {submitted ? (
                <div className="p-6 bg-sand-100 border border-gold-500/40 text-navy-900 space-y-3">
                  <div className="flex items-center gap-2 text-gold-700 font-medium">
                    <CheckCircle2 size={18} />
                    <span>Inquiry Transmitted Successfully</span>
                  </div>
                  <p className="text-xs text-[#4A4F5C] leading-relaxed">
                    Thank you for reaching out. Your message has been logged with our secretariat. A member of the awards administrative team will follow up via email shortly.
                  </p>
                  <Button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({ name: "", email: "", subject: "", message: "" });
                    }}
                    variant="outline-dark"
                    size="sm"
                  >
                    Submit Another Inquiry
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5 font-sans">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono uppercase tracking-wider text-navy-900 font-medium">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Ar. Rajesh Patel"
                        className="w-full bg-white border border-navy-900/15 p-2.5 text-xs text-navy-900 focus:outline-none focus:border-gold-500 transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-mono uppercase tracking-wider text-navy-900 font-medium">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="rajesh@studio.com"
                        className="w-full bg-white border border-navy-900/15 p-2.5 text-xs text-navy-900 focus:outline-none focus:border-gold-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase tracking-wider text-navy-900 font-medium">
                      Subject Matter <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="Category clarification, upload assistance, eligibility query..."
                      className="w-full bg-white border border-navy-900/15 p-2.5 text-xs text-navy-900 focus:outline-none focus:border-gold-500 transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase tracking-wider text-navy-900 font-medium">
                      Message / Question <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Provide detailed project background or technical question..."
                      className="w-full bg-white border border-navy-900/15 p-2.5 text-xs text-navy-900 focus:outline-none focus:border-gold-500 transition-colors leading-relaxed"
                    />
                  </div>

                  <div className="pt-2">
                    <Button type="submit" variant="primary" size="md" icon={<Send size={13} />}>
                      Submit Inquiry
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
