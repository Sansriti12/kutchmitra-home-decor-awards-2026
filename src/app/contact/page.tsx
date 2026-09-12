"use client";

import React, { useState } from "react";
import { Mail, MapPin, Phone, Send, AlertCircle, CheckCircle2 } from "lucide-react";
import { SectionMarker } from "@/components/ui/SectionMarker";
import { Button } from "@/components/ui/Button";

export default function ContactPage() {
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
          <SectionMarker number="01" label="Secretariat Helpdesk" theme="light" />
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-sand-100 border border-gold-500/30 text-xs font-mono text-gold-600 font-semibold">
              Frontend Prototype Only — Official Channels TBA
            </div>
            <h1 className="heading-display text-navy-900 max-w-3xl">
              Contact Secretariat
            </h1>
          </div>
          <p className="body-editorial text-[#4A4F5C] max-w-2xl text-lg">
            Have an inquiry regarding categories, nomination requirements, or technical support? Connect with the awards desk.
          </p>
        </div>
      </section>

      {/* Main Form & Information Section */}
      <section className="py-10 sm:py-14 lg:py-16 border-b border-navy-900/10">
        <div className="container-editorial">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            {/* Left: Official Notice & CMS Ready Contact Placeholders (5 cols) */}
            <div className="lg:col-span-5 space-y-8">
              <div className="space-y-4">
                <span className="font-mono text-xs uppercase tracking-widest text-gold-600 font-semibold block">
                  Secretariat Notice
                </span>
                <h2 className="heading-editorial text-navy-900 leading-tight">
                  Official Secretariat Communication
                </h2>
                <p className="body-editorial text-[#4A4F5C]">
                  Official contact details, phone helplines, email addresses, and secretariat office details will be published by the organizing committee prior to registration opening.
                </p>
              </div>

              {/* Prepared for CMS-Managed Details */}
              <div className="space-y-4">
                <div className="p-5 bg-[#FBFAF7] border border-navy-900/10 space-y-2">
                  <div className="flex items-center gap-2.5 text-xs font-mono text-slate-400">
                    <Mail size={14} className="text-gold-600" />
                    <span className="uppercase tracking-wider">Official Email Helpline</span>
                  </div>
                  <p className="text-sm font-sans font-medium text-navy-900">
                    To be announced by Secretariat
                  </p>
                  <p className="text-xs text-[#4A4F5C] leading-relaxed">
                    Official email address for applicant inquiries will be published here.
                  </p>
                </div>

                <div className="p-5 bg-[#FBFAF7] border border-navy-900/10 space-y-2">
                  <div className="flex items-center gap-2.5 text-xs font-mono text-slate-400">
                    <Phone size={14} className="text-gold-600" />
                    <span className="uppercase tracking-wider">Helpline &amp; Support</span>
                  </div>
                  <p className="text-sm font-sans font-medium text-navy-900">
                    To be announced by Secretariat
                  </p>
                  <p className="text-xs text-[#4A4F5C] leading-relaxed">
                    Dedicated support phone numbers will be listed before nomination launch.
                  </p>
                </div>

                <div className="p-5 bg-[#FBFAF7] border border-navy-900/10 space-y-2">
                  <div className="flex items-center gap-2.5 text-xs font-mono text-slate-400">
                    <MapPin size={14} className="text-gold-600" />
                    <span className="uppercase tracking-wider">Secretariat Office</span>
                  </div>
                  <p className="text-sm font-sans font-medium text-navy-900">
                    To be announced by Secretariat
                  </p>
                  <p className="text-xs text-[#4A4F5C] leading-relaxed">
                    Official office communication details will be formally published.
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
                <p className="text-xs sm:text-sm text-[#4A4F5C] font-sans">
                  Submit an advance query to the awards committee.
                </p>
              </div>

              {submitted ? (
                <div className="p-6 bg-white border border-gold-500/40 space-y-3 animate-fade-up">
                  <div className="flex items-center gap-2 text-gold-600 font-medium text-sm">
                    <CheckCircle2 size={18} />
                    <span>Inquiry Transmitted Successfully</span>
                  </div>
                  <p className="text-xs text-[#4A4F5C] leading-relaxed font-sans">
                    Thank you for contacting the Kutchmitra Home &amp; Decor Awards 2026 Secretariat. Your message has been recorded.
                  </p>
                  <Button
                    variant="outline-dark"
                    size="sm"
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({ name: "", email: "", subject: "", message: "" });
                    }}
                  >
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 font-sans">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label htmlFor="name" className="text-xs font-mono uppercase text-navy-900 font-medium">
                        Full Name *
                      </label>
                      <input
                        id="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Architect / Designer Name"
                        className="w-full px-3.5 py-2.5 text-sm bg-white border border-navy-900/15 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 focus:outline-none transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="email" className="text-xs font-mono uppercase text-navy-900 font-medium">
                        Email Address *
                      </label>
                      <input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="name@firm.com"
                        className="w-full px-3.5 py-2.5 text-sm bg-white border border-navy-900/15 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="subject" className="text-xs font-mono uppercase text-navy-900 font-medium">
                      Inquiry Subject *
                    </label>
                    <input
                      id="subject"
                      type="text"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="Category guidance, eligibility, or technical query"
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-navy-900/15 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="message" className="text-xs font-mono uppercase text-navy-900 font-medium">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      rows={5}
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Please write your inquiry in detail..."
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-navy-900/15 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 focus:outline-none transition-colors resize-none"
                    />
                  </div>

                  <Button type="submit" variant="primary" size="md" icon={<Send size={13} />}>
                    Submit Inquiry
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
