"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Globe,
  Calendar,
  HelpCircle,
  Users,
  Megaphone,
  Mail,
  Layers,
  Trophy,
  Plus,
  Edit2,
  Trash2,
  Save,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Eye,
  EyeOff,
  ExternalLink,
  Upload,
  RefreshCw,
  Search,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  CmsImportantDate,
  CmsFaq,
  CmsAnnouncement,
  CmsSiteSettings,
  CmsJuryProfileItem,
  CmsCategoryItem,
} from "@/lib/cms/types";
import {
  saveCmsImportantDate,
  deleteCmsImportantDate,
  saveCmsFaq,
  deleteCmsFaq,
  saveCmsAnnouncement,
  deleteCmsAnnouncement,
  saveCmsSiteSettings,
  updateCmsJuryProfile,
  updateCmsCategoryContent,
  uploadCmsAsset,
} from "@/lib/cms/actions";

interface AdminCmsClientProps {
  initialData: {
    dates: CmsImportantDate[];
    faqs: CmsFaq[];
    announcements: CmsAnnouncement[];
    siteSettings: CmsSiteSettings;
    juryProfiles: CmsJuryProfileItem[];
    categories: CmsCategoryItem[];
    winnerStats: {
      totalWinners: number;
      publishedWinners: number;
    };
  };
  isSuperAdmin: boolean;
}

type CmsTab =
  | "overview"
  | "dates"
  | "faqs"
  | "jury"
  | "announcements"
  | "contact"
  | "categories"
  | "winners";

export default function AdminCmsClient({ initialData, isSuperAdmin }: AdminCmsClientProps) {
  // Navigation
  const [activeTab, setActiveTab] = useState<CmsTab>("overview");

  // State
  const [dates, setDates] = useState<CmsImportantDate[]>(initialData.dates);
  const [faqs, setFaqs] = useState<CmsFaq[]>(initialData.faqs);
  const [announcements, setAnnouncements] = useState<CmsAnnouncement[]>(initialData.announcements);
  const [siteSettings, setSiteSettings] = useState<CmsSiteSettings>(initialData.siteSettings);
  const [juryProfiles, setJuryProfiles] = useState<CmsJuryProfileItem[]>(initialData.juryProfiles);
  const [categories, setCategories] = useState<CmsCategoryItem[]>(initialData.categories);

  // Status message
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search filters
  const [faqSearch, setFaqSearch] = useState("");
  const [faqCategoryFilter, setFaqCategoryFilter] = useState("all");

  // Modal states
  const [editingDate, setEditingDate] = useState<Partial<CmsImportantDate> | null>(null);
  const [editingFaq, setEditingFaq] = useState<Partial<CmsFaq> | null>(null);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Partial<CmsAnnouncement> | null>(null);
  const [editingJury, setEditingJury] = useState<CmsJuryProfileItem | null>(null);
  const [editingCategory, setEditingCategory] = useState<CmsCategoryItem | null>(null);

  const showNotification = (type: "success" | "error", text: string) => {
    setActionMessage({ type, text });
    setTimeout(() => setActionMessage(null), 5000);
  };

  // --------------------------------------------------------------------------
  // HANDLERS: IMPORTANT DATES
  // --------------------------------------------------------------------------
  const handleSaveDate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDate) return;
    setIsSubmitting(true);
    try {
      const res = await saveCmsImportantDate({
        id: editingDate.id,
        milestoneNumber: editingDate.milestoneNumber || "01",
        title: editingDate.title || "",
        description: editingDate.description || "",
        dateText: editingDate.dateText || "TBD",
        startDate: editingDate.startDate || null,
        endDate: editingDate.endDate || null,
        status: editingDate.status || "published",
        isActive: editingDate.isActive ?? true,
        displayOrder: editingDate.displayOrder || 1,
      });

      if (res.success) {
        showNotification("success", "Important Date saved successfully.");
        // Update local state
        setDates((prev) => {
          if (editingDate.id) {
            return prev.map((d) => (d.id === editingDate.id ? ({ ...d, ...editingDate } as CmsImportantDate) : d));
          } else {
            return [...prev, { ...editingDate, id: res.id || `temp-${Date.now()}` } as CmsImportantDate];
          }
        });
        setEditingDate(null);
      } else {
        showNotification("error", res.error || "Failed to save date.");
      }
    } catch (err: any) {
      showNotification("error", err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDate = async (id: string) => {
    if (!confirm("Are you sure you want to delete this milestone?")) return;
    setIsSubmitting(true);
    try {
      const res = await deleteCmsImportantDate(id);
      if (res.success) {
        setDates((prev) => prev.filter((d) => d.id !== id));
        showNotification("success", "Important Date removed.");
      } else {
        showNotification("error", res.error || "Failed to delete milestone.");
      }
    } catch (err: any) {
      showNotification("error", err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --------------------------------------------------------------------------
  // HANDLERS: FAQS
  // --------------------------------------------------------------------------
  const handleSaveFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFaq) return;
    setIsSubmitting(true);
    try {
      const res = await saveCmsFaq({
        id: editingFaq.id,
        question: editingFaq.question || "",
        answer: editingFaq.answer || "",
        category: editingFaq.category || "General",
        status: editingFaq.status || "published",
        isActive: editingFaq.isActive ?? true,
        isFeaturedHomepage: editingFaq.isFeaturedHomepage ?? false,
        displayOrder: editingFaq.displayOrder || 1,
      });

      if (res.success) {
        showNotification("success", "FAQ entry saved successfully.");
        setFaqs((prev) => {
          if (editingFaq.id) {
            return prev.map((f) => (f.id === editingFaq.id ? ({ ...f, ...editingFaq } as CmsFaq) : f));
          } else {
            return [...prev, { ...editingFaq, id: res.id || `temp-${Date.now()}` } as CmsFaq];
          }
        });
        setEditingFaq(null);
      } else {
        showNotification("error", res.error || "Failed to save FAQ.");
      }
    } catch (err: any) {
      showNotification("error", err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteFaq = async (id: string) => {
    if (!confirm("Are you sure you want to delete this FAQ entry?")) return;
    setIsSubmitting(true);
    try {
      const res = await deleteCmsFaq(id);
      if (res.success) {
        setFaqs((prev) => prev.filter((f) => f.id !== id));
        showNotification("success", "FAQ entry removed.");
      } else {
        showNotification("error", res.error || "Failed to delete FAQ.");
      }
    } catch (err: any) {
      showNotification("error", err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --------------------------------------------------------------------------
  // HANDLERS: ANNOUNCEMENTS
  // --------------------------------------------------------------------------
  const handleSaveAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAnnouncement) return;
    setIsSubmitting(true);
    try {
      const res = await saveCmsAnnouncement({
        id: editingAnnouncement.id,
        title: editingAnnouncement.title || "",
        shortDescription: editingAnnouncement.shortDescription || null,
        content: editingAnnouncement.content || null,
        announcementType: editingAnnouncement.announcementType || "general",
        badgeText: editingAnnouncement.badgeText || null,
        actionUrl: editingAnnouncement.actionUrl || null,
        actionLabel: editingAnnouncement.actionLabel || null,
        imageUrl: editingAnnouncement.imageUrl || null,
        status: editingAnnouncement.status || "published",
        isActive: editingAnnouncement.isActive ?? true,
        displayOrder: editingAnnouncement.displayOrder || 1,
      });

      if (res.success) {
        showNotification("success", "Announcement saved successfully.");
        setAnnouncements((prev) => {
          if (editingAnnouncement.id) {
            return prev.map((a) =>
              a.id === editingAnnouncement.id ? ({ ...a, ...editingAnnouncement } as CmsAnnouncement) : a
            );
          } else {
            return [...prev, { ...editingAnnouncement, id: res.id || `temp-${Date.now()}` } as CmsAnnouncement];
          }
        });
        setEditingAnnouncement(null);
      } else {
        showNotification("error", res.error || "Failed to save announcement.");
      }
    } catch (err: any) {
      showNotification("error", err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;
    setIsSubmitting(true);
    try {
      const res = await deleteCmsAnnouncement(id);
      if (res.success) {
        setAnnouncements((prev) => prev.filter((a) => a.id !== id));
        showNotification("success", "Announcement removed.");
      } else {
        showNotification("error", res.error || "Failed to delete announcement.");
      }
    } catch (err: any) {
      showNotification("error", err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --------------------------------------------------------------------------
  // HANDLERS: SITE SETTINGS & HOMEPAGE NOTICE
  // --------------------------------------------------------------------------
  const handleSaveSiteSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await saveCmsSiteSettings(siteSettings);
      if (res.success) {
        showNotification("success", "Site Settings & Contact Info updated successfully.");
      } else {
        showNotification("error", res.error || "Failed to update settings.");
      }
    } catch (err: any) {
      showNotification("error", err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --------------------------------------------------------------------------
  // HANDLERS: JURY PROFILES
  // --------------------------------------------------------------------------
  const handleSaveJuryProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJury) return;
    setIsSubmitting(true);
    try {
      const res = await updateCmsJuryProfile(editingJury.id, {
        honorific: editingJury.honorific,
        organization: editingJury.organization,
        designation: editingJury.designation,
        bio: editingJury.bio,
        photoUrl: editingJury.photoUrl,
        displayOrder: editingJury.displayOrder,
        isPublic: editingJury.isPublic,
      });

      if (res.success) {
        showNotification("success", "Public Jury Profile updated.");
        setJuryProfiles((prev) => prev.map((j) => (j.id === editingJury.id ? editingJury : j)));
        setEditingJury(null);
      } else {
        showNotification("error", res.error || "Failed to update jury profile.");
      }
    } catch (err: any) {
      showNotification("error", err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleJuryPublic = async (profile: CmsJuryProfileItem) => {
    const updatedStatus = !profile.isPublic;
    try {
      const res = await updateCmsJuryProfile(profile.id, {
        displayOrder: profile.displayOrder,
        isPublic: updatedStatus,
      });
      if (res.success) {
        setJuryProfiles((prev) =>
          prev.map((j) => (j.id === profile.id ? { ...j, isPublic: updatedStatus } : j))
        );
        showNotification(
          "success",
          `Juror ${profile.jurorName} ${updatedStatus ? "published to public jury roster" : "hidden from public view"}.`
        );
      } else {
        showNotification("error", res.error || "Failed to toggle visibility.");
      }
    } catch (err: any) {
      showNotification("error", err.message);
    }
  };

  // --------------------------------------------------------------------------
  // HANDLERS: CATEGORY CONTENT
  // --------------------------------------------------------------------------
  const handleSaveCategoryContent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    setIsSubmitting(true);
    try {
      const res = await updateCmsCategoryContent(editingCategory.id, {
        shortDescription: editingCategory.shortDescription,
        fullDescription: editingCategory.fullDescription,
        eligibilityCriteria: editingCategory.eligibilityCriteria,
        coverImageUrl: editingCategory.coverImageUrl,
      });

      if (res.success) {
        showNotification("success", `Category #${editingCategory.displayNumber} content updated.`);
        setCategories((prev) =>
          prev.map((c) => (c.id === editingCategory.id ? editingCategory : c))
        );
        setEditingCategory(null);
      } else {
        showNotification("error", res.error || "Failed to update category.");
      }
    } catch (err: any) {
      showNotification("error", err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered FAQs
  const filteredFaqs = faqs.filter((faq) => {
    if (faqCategoryFilter !== "all" && faq.category !== faqCategoryFilter) return false;
    if (faqSearch.trim()) {
      const q = faqSearch.toLowerCase();
      return faq.question.toLowerCase().includes(q) || faq.answer.toLowerCase().includes(q);
    }
    return true;
  });

  const faqCategories = Array.from(new Set(faqs.map((f) => f.category)));

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-navy-950/80 border border-gold-500/30 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-card">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-gold-400 font-mono text-xs uppercase tracking-widest font-semibold">
            <Globe size={14} />
            <span>Kutchmitra Content Management</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-white tracking-tight">
            Content / CMS Governance
          </h1>
          <p className="text-xs text-slate-300 font-sans max-w-2xl">
            Controlled editorial management of public website timelines, FAQs, jury profiles, announcements,
            and regional office contact information.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/15 text-slate-200 text-xs font-mono uppercase tracking-wider transition-colors"
          >
            <Eye size={13} className="text-gold-400" />
            <span>Preview Public Site</span>
            <ExternalLink size={11} className="text-slate-400" />
          </Link>
        </div>
      </div>

      {/* 2. Notification Alert */}
      {actionMessage && (
        <div
          className={cn(
            "p-4 border font-mono text-xs flex items-center gap-3 transition-all",
            actionMessage.type === "success"
              ? "bg-emerald-950/80 border-emerald-500/50 text-emerald-300"
              : "bg-red-950/80 border-red-500/50 text-red-300"
          )}
        >
          {actionMessage.type === "success" ? (
            <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
          ) : (
            <AlertTriangle size={16} className="text-red-400 flex-shrink-0" />
          )}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* 3. Tab Navigation */}
      <div className="border-b border-white/10 flex flex-wrap gap-1">
        {[
          { id: "overview", label: "Overview & Notice Bar", icon: Sparkles, count: undefined },
          { id: "dates", label: "Important Dates", icon: Calendar, count: dates.length },
          { id: "faqs", label: "FAQs", icon: HelpCircle, count: faqs.length },
          { id: "jury", label: "Jury Profiles", icon: Users, count: juryProfiles.filter((j) => j.isPublic).length },
          { id: "announcements", label: "Announcements", icon: Megaphone, count: announcements.length },
          { id: "contact", label: "Contact Info", icon: Mail, count: undefined },
          { id: "categories", label: `Categories (${categories.length})`, icon: Layers, count: categories.length },
          { id: "winners", label: "Winners Showcase", icon: Trophy, count: initialData.winnerStats.publishedWinners },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as CmsTab)}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2.5 font-mono text-xs uppercase tracking-wider transition-all border-b-2",
                isActive
                  ? "border-gold-500 text-gold-400 bg-white/5 font-bold"
                  : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]"
              )}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={cn(
                    "px-1.5 py-0.2 text-[10px] rounded-full",
                    isActive ? "bg-gold-500/20 text-gold-300" : "bg-white/10 text-slate-400"
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: OVERVIEW & HOMEPAGE NOTICE STRIP */}
      {/* ========================================================================= */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Executive Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-navy-900/60 border border-white/10 space-y-1">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Milestone Dates</span>
              <p className="text-2xl font-display font-bold text-white">{dates.length}</p>
              <span className="text-[10px] font-mono text-emerald-400">
                {dates.filter((d) => d.status === "published").length} Published
              </span>
            </div>

            <div className="p-4 bg-navy-900/60 border border-white/10 space-y-1">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Active FAQs</span>
              <p className="text-2xl font-display font-bold text-white">{faqs.length}</p>
              <span className="text-[10px] font-mono text-emerald-400">
                {faqs.filter((f) => f.isFeaturedHomepage).length} Featured on Homepage
              </span>
            </div>

            <div className="p-4 bg-navy-900/60 border border-white/10 space-y-1">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Public Jurors</span>
              <p className="text-2xl font-display font-bold text-white">
                {juryProfiles.filter((j) => j.isPublic).length} / {juryProfiles.length}
              </p>
              <span className="text-[10px] font-mono text-gold-400">Profiles Visible Publicly</span>
            </div>

            <div className="p-4 bg-navy-900/60 border border-white/10 space-y-1">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Award Categories</span>
              <p className="text-2xl font-display font-bold text-white">{categories.length}</p>
              <span className="text-[10px] font-mono text-slate-400">Sequential 01–16 Display</span>
            </div>
          </div>

          {/* Homepage Banner / Announcement Strip Manager */}
          <div className="bg-navy-900/60 border border-gold-500/30 p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-gold-400 font-mono text-xs uppercase tracking-wider font-semibold">
                  <Megaphone size={14} />
                  <span>Homepage Announcement Notice Strip</span>
                </div>
                <p className="text-xs text-slate-300 font-sans">
                  Controls the prominent announcement strip shown above the homepage content for urgent deadline
                  reminders or portal launch notices.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "text-xs font-mono px-2.5 py-1 border uppercase tracking-wider font-semibold",
                    siteSettings.homepageBannerActive
                      ? "bg-emerald-950/80 border-emerald-500 text-emerald-300"
                      : "bg-slate-800 border-slate-700 text-slate-400"
                  )}
                >
                  {siteSettings.homepageBannerActive ? "Active & Live" : "Inactive / Hidden"}
                </span>
              </div>
            </div>

            <form onSubmit={handleSaveSiteSettings} className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="bannerActive"
                  checked={siteSettings.homepageBannerActive}
                  onChange={(e) =>
                    setSiteSettings((prev) => ({ ...prev, homepageBannerActive: e.target.checked }))
                  }
                  className="w-4 h-4 accent-gold-500 rounded cursor-pointer"
                />
                <label htmlFor="bannerActive" className="text-xs font-mono text-white cursor-pointer select-none">
                  Enable Homepage Announcement Strip Live
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                    Badge Text
                  </label>
                  <input
                    type="text"
                    value={siteSettings.homepageBannerBadge}
                    onChange={(e) =>
                      setSiteSettings((prev) => ({ ...prev, homepageBannerBadge: e.target.value }))
                    }
                    placeholder="e.g. ANNOUNCEMENT"
                    className="w-full bg-navy-950 border border-white/20 px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                    Announcement Message
                  </label>
                  <input
                    type="text"
                    value={siteSettings.homepageBannerText}
                    onChange={(e) =>
                      setSiteSettings((prev) => ({ ...prev, homepageBannerText: e.target.value }))
                    }
                    placeholder="Notice text displayed across homepage..."
                    className="w-full bg-navy-950 border border-white/20 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                    Button Label
                  </label>
                  <input
                    type="text"
                    value={siteSettings.homepageBannerLinkText}
                    onChange={(e) =>
                      setSiteSettings((prev) => ({ ...prev, homepageBannerLinkText: e.target.value }))
                    }
                    placeholder="e.g. View Categories"
                    className="w-full bg-navy-950 border border-white/20 px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                    Destination URL
                  </label>
                  <input
                    type="text"
                    value={siteSettings.homepageBannerLink}
                    onChange={(e) =>
                      setSiteSettings((prev) => ({ ...prev, homepageBannerLink: e.target.value }))
                    }
                    placeholder="/categories or /how-to-nominate"
                    className="w-full bg-navy-950 border border-white/20 px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              {/* Live Preview Box */}
              <div className="p-4 bg-navy-950 border border-white/10 space-y-2">
                <span className="text-[10px] font-mono text-gold-400 uppercase tracking-widest block">
                  Public Appearance Preview:
                </span>
                <div className="p-3 bg-gold-500/10 border-l-4 border-gold-500 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-gold-500 text-navy-950 font-mono text-[10px] font-bold uppercase">
                      {siteSettings.homepageBannerBadge || "ANNOUNCEMENT"}
                    </span>
                    <span className="text-white font-sans">
                      {siteSettings.homepageBannerText || "Preview announcement message..."}
                    </span>
                  </div>
                  {siteSettings.homepageBannerLinkText && (
                    <span className="inline-flex items-center gap-1 text-gold-400 font-mono text-[11px] underline">
                      {siteSettings.homepageBannerLinkText}
                      <ArrowRight size={11} />
                    </span>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gold-500 hover:bg-gold-400 text-navy-950 font-mono text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
                >
                  <Save size={13} />
                  <span>{isSubmitting ? "Saving..." : "Save Notice Strip Settings"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: IMPORTANT DATES */}
      {/* ========================================================================= */}
      {activeTab === "dates" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="font-display text-lg font-bold text-white">Award Timeline Milestones</h2>
              <p className="text-xs text-slate-400 font-sans">
                Controls the 6 milestone stages displayed on the public Important Dates page (`/important-dates`).
              </p>
            </div>

            <button
              onClick={() =>
                setEditingDate({
                  milestoneNumber: String(dates.length + 1).padStart(2, "0"),
                  title: "",
                  description: "",
                  dateText: "TBD",
                  status: "published",
                  isActive: true,
                  displayOrder: dates.length + 1,
                })
              }
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gold-500 hover:bg-gold-400 text-navy-950 font-mono text-xs font-bold uppercase tracking-wider transition-colors"
            >
              <Plus size={13} />
              <span>Add Milestone</span>
            </button>
          </div>

          <div className="border border-white/10 bg-navy-900/40 overflow-x-auto shadow-card">
            <table className="w-full text-left font-sans text-xs">
              <thead className="bg-navy-950 border-b border-white/10 font-mono text-[11px] text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Stage #</th>
                  <th className="py-3 px-4">Milestone Title</th>
                  <th className="py-3 px-4">Date Text</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {dates.map((d) => (
                  <tr key={d.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-gold-400">STAGE {d.milestoneNumber}</td>
                    <td className="py-3 px-4 font-medium text-white">{d.title}</td>
                    <td className="py-3 px-4 font-mono text-slate-300">
                      <span className="px-2 py-0.5 bg-white/5 border border-white/10">{d.dateText}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 max-w-xs truncate">{d.description}</td>
                    <td className="py-3 px-4 font-mono">
                      <span
                        className={cn(
                          "px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold border",
                          d.status === "published"
                            ? "bg-emerald-950/80 border-emerald-500/40 text-emerald-300"
                            : d.status === "draft"
                            ? "bg-slate-800 border-slate-700 text-slate-400"
                            : "bg-red-950/80 border-red-500/40 text-red-400"
                        )}
                      >
                        {d.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => setEditingDate(d)}
                          className="p-1 hover:text-gold-400 text-slate-400 transition-colors"
                          title="Edit Milestone"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteDate(d.id)}
                          className="p-1 hover:text-red-400 text-slate-400 transition-colors"
                          title="Delete Milestone"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: FAQS */}
      {/* ========================================================================= */}
      {activeTab === "faqs" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <h2 className="font-display text-lg font-bold text-white">Frequently Asked Questions</h2>
              <p className="text-xs text-slate-400 font-sans">
                Manage questions and answers displayed on `/faqs` and featured on the homepage.
              </p>
            </div>

            <button
              onClick={() =>
                setEditingFaq({
                  question: "",
                  answer: "",
                  category: "General",
                  status: "published",
                  isActive: true,
                  isFeaturedHomepage: false,
                  displayOrder: faqs.length + 1,
                })
              }
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gold-500 hover:bg-gold-400 text-navy-950 font-mono text-xs font-bold uppercase tracking-wider transition-colors self-start sm:self-auto"
            >
              <Plus size={13} />
              <span>Add FAQ</span>
            </button>
          </div>

          {/* Filter Bar */}
          <div className="p-3 bg-navy-900/60 border border-white/10 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={13} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={faqSearch}
                onChange={(e) => setFaqSearch(e.target.value)}
                placeholder="Search FAQs..."
                className="w-full bg-navy-950 border border-white/10 pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-gold-500"
              />
            </div>

            <select
              value={faqCategoryFilter}
              onChange={(e) => setFaqCategoryFilter(e.target.value)}
              className="bg-navy-950 border border-white/10 px-3 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-gold-500"
            >
              <option value="all">All Categories ({faqs.length})</option>
              {faqCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            {filteredFaqs.map((f) => (
              <div
                key={f.id}
                className="p-4 bg-navy-900/40 border border-white/10 hover:border-gold-500/40 transition-colors space-y-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-white/5 border border-white/10 text-slate-400 font-mono text-[10px] uppercase">
                        {f.category}
                      </span>
                      {f.isFeaturedHomepage && (
                        <span className="px-2 py-0.5 bg-gold-500/15 border border-gold-500/30 text-gold-400 font-mono text-[10px] uppercase">
                          Homepage Featured
                        </span>
                      )}
                      <span
                        className={cn(
                          "px-2 py-0.5 text-[10px] font-mono uppercase font-semibold border",
                          f.status === "published"
                            ? "bg-emerald-950/80 border-emerald-500/40 text-emerald-300"
                            : "bg-slate-800 border-slate-700 text-slate-400"
                        )}
                      >
                        {f.status}
                      </span>
                    </div>
                    <h3 className="font-sans font-semibold text-sm text-white">{f.question}</h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingFaq(f)}
                      className="p-1.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-gold-400 border border-white/10 transition-colors"
                      title="Edit FAQ"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => handleDeleteFaq(f.id)}
                      className="p-1.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-red-400 border border-white/10 transition-colors"
                      title="Delete FAQ"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-300 font-sans leading-relaxed">{f.answer}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: JURY PROFILES (PUBLIC ROSTER) */}
      {/* ========================================================================= */}
      {activeTab === "jury" && (
        <div className="space-y-4">
          <div className="p-4 bg-gold-500/10 border-l-4 border-gold-500 space-y-1">
            <div className="flex items-center gap-2 text-gold-400 font-mono text-xs uppercase tracking-wider font-semibold">
              <ShieldCheck size={14} />
              <span>Public Juror Showcase Governance Notice</span>
            </div>
            <p className="text-xs text-slate-300 font-sans">
              This module manages ONLY the public profile representations shown on `/jury`. It does NOT expose
              private jury passwords, evaluation rubrics, confidential candidate scores, or conflict declarations.
              Juror assignments and scoring are strictly quarantined in Jury Management.
            </p>
          </div>

          <div className="border border-white/10 bg-navy-900/40 overflow-x-auto shadow-card">
            <table className="w-full text-left font-sans text-xs">
              <thead className="bg-navy-950 border-b border-white/10 font-mono text-[11px] text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Public Status</th>
                  <th className="py-3 px-4">Juror Name</th>
                  <th className="py-3 px-4">Designation &amp; Organization</th>
                  <th className="py-3 px-4">Short Bio</th>
                  <th className="py-3 px-4">Order</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {juryProfiles.map((j) => (
                  <tr key={j.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleJuryPublic(j)}
                        className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 font-mono text-[10px] uppercase font-bold border transition-colors",
                          j.isPublic
                            ? "bg-emerald-950/80 border-emerald-500 text-emerald-300 hover:bg-emerald-900"
                            : "bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700"
                        )}
                      >
                        {j.isPublic ? <Eye size={12} /> : <EyeOff size={12} />}
                        <span>{j.isPublic ? "Live Public" : "Private"}</span>
                      </button>
                    </td>
                    <td className="py-3 px-4 font-medium text-white">
                      {j.honorific ? `${j.honorific} ` : ""}
                      {j.jurorName}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      <div>{j.designation || "Jury Member"}</div>
                      <div className="text-[11px] text-slate-400">{j.organization || "-"}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-400 max-w-xs truncate">{j.bio || "No public bio entered."}</td>
                    <td className="py-3 px-4 font-mono text-slate-300">{j.displayOrder}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setEditingJury(j)}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-xs font-mono"
                      >
                        <Edit2 size={12} />
                        <span>Edit Profile</span>
                      </button>
                    </td>
                  </tr>
                ))}
                {juryProfiles.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400 font-mono text-xs">
                      No jury profiles registered yet. When jurors are created in Jury Management, their profiles
                      will appear here for public showcase configuration.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: ANNOUNCEMENTS */}
      {/* ========================================================================= */}
      {activeTab === "announcements" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="font-display text-lg font-bold text-white">Public Announcements &amp; Notices</h2>
              <p className="text-xs text-slate-400 font-sans">
                Official notices, deadline extensions, and ceremony updates.
              </p>
            </div>

            <button
              onClick={() =>
                setEditingAnnouncement({
                  title: "",
                  shortDescription: "",
                  content: "",
                  announcementType: "general",
                  badgeText: "EDITION 2026",
                  actionUrl: "/how-to-nominate",
                  actionLabel: "Read Guidelines",
                  status: "published",
                  isActive: true,
                  displayOrder: announcements.length + 1,
                })
              }
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gold-500 hover:bg-gold-400 text-navy-950 font-mono text-xs font-bold uppercase tracking-wider transition-colors"
            >
              <Plus size={13} />
              <span>Create Announcement</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {announcements.map((a) => (
              <div
                key={a.id}
                className="p-5 bg-navy-900/40 border border-white/10 space-y-3 hover:border-gold-500/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-gold-500/15 border border-gold-500/30 text-gold-400 font-mono text-[10px] uppercase font-bold">
                      {a.badgeText || a.announcementType.toUpperCase()}
                    </span>
                    <span
                      className={cn(
                        "px-2 py-0.5 text-[10px] font-mono uppercase font-semibold border",
                        a.status === "published"
                          ? "bg-emerald-950/80 border-emerald-500/40 text-emerald-300"
                          : "bg-slate-800 border-slate-700 text-slate-400"
                      )}
                    >
                      {a.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingAnnouncement(a)}
                      className="p-1 hover:text-gold-400 text-slate-400 transition-colors"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => handleDeleteAnnouncement(a.id)}
                      className="p-1 hover:text-red-400 text-slate-400 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <h3 className="font-display text-base font-semibold text-white">{a.title}</h3>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">{a.shortDescription}</p>

                {a.actionUrl && (
                  <div className="pt-2 border-t border-white/10">
                    <span className="text-[11px] font-mono text-gold-400 inline-flex items-center gap-1">
                      Link: {a.actionLabel || a.actionUrl}
                      <ArrowRight size={11} />
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: CONTACT INFORMATION */}
      {/* ========================================================================= */}
      {activeTab === "contact" && (
        <div className="max-w-3xl space-y-6">
          <div className="space-y-1">
            <h2 className="font-display text-lg font-bold text-white">Official Contact Channels</h2>
            <p className="text-xs text-slate-400 font-sans">
              Update the official address, email, and helpline displayed across `/contact` and in the footer.
            </p>
          </div>

          <form onSubmit={handleSaveSiteSettings} className="bg-navy-900/60 border border-white/10 p-6 space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1">
                Regional Office Address
              </label>
              <textarea
                rows={3}
                value={siteSettings.officeAddress}
                onChange={(e) => setSiteSettings((prev) => ({ ...prev, officeAddress: e.target.value }))}
                className="w-full bg-navy-950 border border-white/20 p-3 text-xs text-white focus:outline-none focus:border-gold-500 font-sans"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1">
                  Official Email
                </label>
                <input
                  type="email"
                  value={siteSettings.officialEmail}
                  onChange={(e) => setSiteSettings((prev) => ({ ...prev, officialEmail: e.target.value }))}
                  className="w-full bg-navy-950 border border-white/20 px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1">
                  Helpline Phone
                </label>
                <input
                  type="text"
                  value={siteSettings.helplinePhone}
                  onChange={(e) => setSiteSettings((prev) => ({ ...prev, helplinePhone: e.target.value }))}
                  className="w-full bg-navy-950 border border-white/20 px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1">
                  Support Operating Hours
                </label>
                <input
                  type="text"
                  value={siteSettings.supportHours}
                  onChange={(e) => setSiteSettings((prev) => ({ ...prev, supportHours: e.target.value }))}
                  className="w-full bg-navy-950 border border-white/20 px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1">
                  Privacy Contact Email
                </label>
                <input
                  type="email"
                  value={siteSettings.privacyContactEmail}
                  onChange={(e) => setSiteSettings((prev) => ({ ...prev, privacyContactEmail: e.target.value }))}
                  className="w-full bg-navy-950 border border-white/20 px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-gold-500"
                />
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-5 py-2 bg-gold-500 hover:bg-gold-400 text-navy-950 font-mono text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
              >
                <Save size={13} />
                <span>{isSubmitting ? "Saving..." : "Save Contact Information"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: CATEGORIES (16 AWARD CATEGORIES) */}
      {/* ========================================================================= */}
      {activeTab === "categories" && (
        <div className="space-y-4">
          <div className="p-4 bg-navy-900/80 border-l-4 border-gold-500 space-y-1">
            <div className="flex items-center gap-2 text-gold-400 font-mono text-xs uppercase tracking-wider font-semibold">
              <ShieldCheck size={14} />
              <span>Category Schema Invariant Guarantee</span>
            </div>
            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              Award categories are strictly tied to the database schema. Retired categories
              remain preserved for historical integrity. Visible numbering is strictly <strong>01–16</strong> across the 16
              categories. Editing is restricted to public descriptions and criteria text.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map((c) => (
              <div
                key={c.id}
                className="p-5 bg-navy-900/40 border border-white/10 space-y-3 hover:border-gold-500/30 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 bg-gold-500/15 border border-gold-500/40 text-gold-400 font-mono text-xs font-bold">
                      CATEGORY {c.displayNumber}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">DB Code: {c.code}</span>
                    {c.isDbSynced ? (
                      <span className="px-1.5 py-0.5 text-[10px] font-mono bg-emerald-950/80 border border-emerald-500/30 text-emerald-400">
                        Database Synced
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 text-[10px] font-mono bg-amber-950/80 border border-amber-500/40 text-amber-400">
                        Proposed (Pending Migration)
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => setEditingCategory(c)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-xs font-mono"
                  >
                    <Edit2 size={12} />
                    <span>Edit Description</span>
                  </button>
                </div>

                <h3 className="font-display text-base font-semibold text-white">{c.name}</h3>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  {c.shortDescription || "No short description provided."}
                </p>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>Slug: /{c.slug}</span>
                  <Link
                    href={`/categories/${c.slug}`}
                    target="_blank"
                    className="text-gold-400 hover:underline inline-flex items-center gap-1"
                  >
                    <span>View Public Page</span>
                    <ExternalLink size={10} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 8: WINNERS SHOWCASE LINK */}
      {/* ========================================================================= */}
      {activeTab === "winners" && (
        <div className="max-w-2xl bg-navy-900/60 border border-gold-500/30 p-8 space-y-5">
          <div className="flex items-center gap-3 text-gold-400">
            <Trophy size={28} />
            <h2 className="font-display text-xl font-bold text-white">Winner Management Showcase</h2>
          </div>

          <p className="text-xs text-slate-300 font-sans leading-relaxed">
            Public Winner Profiles and Grand Finale honorees are governed strictly by the authoritative Winner
            Management module to prevent bypassing approval workflows or publishing unapproved winners.
          </p>

          <div className="grid grid-cols-2 gap-4 p-4 bg-navy-950 border border-white/10 text-xs font-mono">
            <div>
              <span className="text-slate-400 block">Total Winners Selected:</span>
              <span className="text-xl font-bold text-white">{initialData.winnerStats.totalWinners}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Published Winners on /winners:</span>
              <span className="text-xl font-bold text-gold-400">{initialData.winnerStats.publishedWinners}</span>
            </div>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <Link
              href="/admin/winners"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gold-500 hover:bg-gold-400 text-navy-950 font-mono text-xs font-bold uppercase tracking-wider transition-colors"
            >
              <span>Open Winner Management Workspace</span>
              <ArrowRight size={13} />
            </Link>

            <Link
              href="/winners"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/15 text-slate-200 text-xs font-mono uppercase tracking-wider transition-colors"
            >
              <span>View Public Showcase</span>
              <ExternalLink size={12} />
            </Link>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT IMPORTANT DATE */}
      {/* ========================================================================= */}
      {editingDate && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-navy-950 border border-gold-500/50 max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-display text-base font-bold text-white">
                {editingDate.id ? "Edit Milestone Date" : "Add Milestone Date"}
              </h3>
              <button onClick={() => setEditingDate(null)} className="text-slate-400 hover:text-white text-sm font-mono">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveDate} className="space-y-3 font-sans text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">Stage Number</label>
                  <input
                    type="text"
                    value={editingDate.milestoneNumber || ""}
                    onChange={(e) => setEditingDate({ ...editingDate, milestoneNumber: e.target.value })}
                    className="w-full bg-navy-900 border border-white/20 px-3 py-1.5 text-white font-mono"
                    placeholder="01"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">Milestone Title</label>
                  <input
                    type="text"
                    value={editingDate.title || ""}
                    onChange={(e) => setEditingDate({ ...editingDate, title: e.target.value })}
                    className="w-full bg-navy-900 border border-white/20 px-3 py-1.5 text-white"
                    placeholder="e.g. Nomination Opens"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">Date Text (Public Display)</label>
                <input
                  type="text"
                  value={editingDate.dateText || ""}
                  onChange={(e) => setEditingDate({ ...editingDate, dateText: e.target.value })}
                  className="w-full bg-navy-900 border border-white/20 px-3 py-1.5 text-white font-mono"
                  placeholder="e.g. TBD or 15 Nov 2026"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editingDate.description || ""}
                  onChange={(e) => setEditingDate({ ...editingDate, description: e.target.value })}
                  className="w-full bg-navy-900 border border-white/20 p-2.5 text-white"
                  placeholder="Brief narrative of what happens in this stage..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">Status</label>
                  <select
                    value={editingDate.status || "published"}
                    onChange={(e) => setEditingDate({ ...editingDate, status: e.target.value as any })}
                    className="w-full bg-navy-900 border border-white/20 px-3 py-1.5 text-white font-mono"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">Display Order</label>
                  <input
                    type="number"
                    value={editingDate.displayOrder || 1}
                    onChange={(e) => setEditingDate({ ...editingDate, displayOrder: parseInt(e.target.value) || 1 })}
                    className="w-full bg-navy-900 border border-white/20 px-3 py-1.5 text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingDate(null)}
                  className="px-3 py-1.5 border border-white/20 text-slate-300 font-mono text-xs uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 bg-gold-500 hover:bg-gold-400 text-navy-950 font-mono text-xs font-bold uppercase"
                >
                  {isSubmitting ? "Saving..." : "Save Milestone"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT FAQ */}
      {/* ========================================================================= */}
      {editingFaq && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-navy-950 border border-gold-500/50 max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-display text-base font-bold text-white">
                {editingFaq.id ? "Edit FAQ Entry" : "Create New FAQ"}
              </h3>
              <button onClick={() => setEditingFaq(null)} className="text-slate-400 hover:text-white text-sm font-mono">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveFaq} className="space-y-3 font-sans text-xs">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">Question</label>
                <input
                  type="text"
                  value={editingFaq.question || ""}
                  onChange={(e) => setEditingFaq({ ...editingFaq, question: e.target.value })}
                  className="w-full bg-navy-900 border border-white/20 px-3 py-1.5 text-white font-medium"
                  placeholder="e.g. How do I submit a nomination?"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">Answer</label>
                <textarea
                  rows={4}
                  value={editingFaq.answer || ""}
                  onChange={(e) => setEditingFaq({ ...editingFaq, answer: e.target.value })}
                  className="w-full bg-navy-900 border border-white/20 p-2.5 text-white leading-relaxed"
                  placeholder="Clear, authoritative answer..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">Category Group</label>
                  <input
                    type="text"
                    value={editingFaq.category || "General"}
                    onChange={(e) => setEditingFaq({ ...editingFaq, category: e.target.value })}
                    className="w-full bg-navy-900 border border-white/20 px-3 py-1.5 text-white"
                    placeholder="e.g. Eligibility & Submission"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">Publication Status</label>
                  <select
                    value={editingFaq.status || "published"}
                    onChange={(e) => setEditingFaq({ ...editingFaq, status: e.target.value as any })}
                    className="w-full bg-navy-900 border border-white/20 px-3 py-1.5 text-white font-mono"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <input
                  type="checkbox"
                  id="faqFeatured"
                  checked={editingFaq.isFeaturedHomepage || false}
                  onChange={(e) => setEditingFaq({ ...editingFaq, isFeaturedHomepage: e.target.checked })}
                  className="w-4 h-4 accent-gold-500 rounded cursor-pointer"
                />
                <label htmlFor="faqFeatured" className="text-xs font-mono text-slate-200 cursor-pointer select-none">
                  Feature this question on the Homepage FAQ section
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingFaq(null)}
                  className="px-3 py-1.5 border border-white/20 text-slate-300 font-mono text-xs uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 bg-gold-500 hover:bg-gold-400 text-navy-950 font-mono text-xs font-bold uppercase"
                >
                  {isSubmitting ? "Saving..." : "Save FAQ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT JURY PROFILE */}
      {/* ========================================================================= */}
      {editingJury && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-navy-950 border border-gold-500/50 max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-display text-base font-bold text-white">
                Edit Public Jury Profile — {editingJury.jurorName}
              </h3>
              <button onClick={() => setEditingJury(null)} className="text-slate-400 hover:text-white text-sm font-mono">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveJuryProfile} className="space-y-3 font-sans text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">Honorific</label>
                  <input
                    type="text"
                    value={editingJury.honorific || ""}
                    onChange={(e) => setEditingJury({ ...editingJury, honorific: e.target.value })}
                    className="w-full bg-navy-900 border border-white/20 px-3 py-1.5 text-white font-mono"
                    placeholder="Ar. / Er."
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">Designation</label>
                  <input
                    type="text"
                    value={editingJury.designation || ""}
                    onChange={(e) => setEditingJury({ ...editingJury, designation: e.target.value })}
                    className="w-full bg-navy-900 border border-white/20 px-3 py-1.5 text-white"
                    placeholder="e.g. Principal Architect"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">Organization / Studio</label>
                <input
                  type="text"
                  value={editingJury.organization || ""}
                  onChange={(e) => setEditingJury({ ...editingJury, organization: e.target.value })}
                  className="w-full bg-navy-900 border border-white/20 px-3 py-1.5 text-white"
                  placeholder="e.g. Studio Design Kutch"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">Biography</label>
                <textarea
                  rows={4}
                  value={editingJury.bio || ""}
                  onChange={(e) => setEditingJury({ ...editingJury, bio: e.target.value })}
                  className="w-full bg-navy-900 border border-white/20 p-2.5 text-white leading-relaxed"
                  placeholder="Distinguished background, career accomplishments, architectural philosophy..."
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">Photo URL</label>
                <input
                  type="text"
                  value={editingJury.photoUrl || ""}
                  onChange={(e) => setEditingJury({ ...editingJury, photoUrl: e.target.value })}
                  className="w-full bg-navy-900 border border-white/20 px-3 py-1.5 text-white font-mono"
                  placeholder="https://... or /assets/jury/..."
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="juryIsPublic"
                  checked={editingJury.isPublic}
                  onChange={(e) => setEditingJury({ ...editingJury, isPublic: e.target.checked })}
                  className="w-4 h-4 accent-gold-500 rounded cursor-pointer"
                />
                <label htmlFor="juryIsPublic" className="text-xs font-mono text-slate-200 cursor-pointer select-none">
                  Make profile publicly visible on `/jury` page
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingJury(null)}
                  className="px-3 py-1.5 border border-white/20 text-slate-300 font-mono text-xs uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 bg-gold-500 hover:bg-gold-400 text-navy-950 font-mono text-xs font-bold uppercase"
                >
                  {isSubmitting ? "Saving..." : "Save Juror Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT CATEGORY CONTENT */}
      {/* ========================================================================= */}
      {editingCategory && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-navy-950 border border-gold-500/50 max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-display text-base font-bold text-white">
                Category {editingCategory.displayNumber} — {editingCategory.name}
              </h3>
              <button
                onClick={() => setEditingCategory(null)}
                className="text-slate-400 hover:text-white text-sm font-mono"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCategoryContent} className="space-y-3 font-sans text-xs">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">
                  Short Description (Catalog &amp; Overview Cards)
                </label>
                <textarea
                  rows={3}
                  value={editingCategory.shortDescription || ""}
                  onChange={(e) => setEditingCategory({ ...editingCategory, shortDescription: e.target.value })}
                  className="w-full bg-navy-900 border border-white/20 p-2.5 text-white leading-relaxed"
                  placeholder="Concise overview sentence..."
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">
                  Full Description (Detail Page Brief)
                </label>
                <textarea
                  rows={4}
                  value={editingCategory.fullDescription || ""}
                  onChange={(e) => setEditingCategory({ ...editingCategory, fullDescription: e.target.value })}
                  className="w-full bg-navy-900 border border-white/20 p-2.5 text-white leading-relaxed"
                  placeholder="In-depth background, scope of work, project typology details..."
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">
                  Eligibility Criteria Note
                </label>
                <textarea
                  rows={3}
                  value={editingCategory.eligibilityCriteria || ""}
                  onChange={(e) => setEditingCategory({ ...editingCategory, eligibilityCriteria: e.target.value })}
                  className="w-full bg-navy-900 border border-white/20 p-2.5 text-white leading-relaxed"
                  placeholder="Who can submit, required documentation, completion date guidelines..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="px-3 py-1.5 border border-white/20 text-slate-300 font-mono text-xs uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 bg-gold-500 hover:bg-gold-400 text-navy-950 font-mono text-xs font-bold uppercase"
                >
                  {isSubmitting ? "Saving..." : "Save Category Brief"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT ANNOUNCEMENT */}
      {/* ========================================================================= */}
      {editingAnnouncement && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-navy-950 border border-gold-500/50 max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-display text-base font-bold text-white">
                {editingAnnouncement.id ? "Edit Announcement" : "Create Announcement"}
              </h3>
              <button
                onClick={() => setEditingAnnouncement(null)}
                className="text-slate-400 hover:text-white text-sm font-mono"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAnnouncement} className="space-y-3 font-sans text-xs">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">Announcement Title</label>
                <input
                  type="text"
                  value={editingAnnouncement.title || ""}
                  onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, title: e.target.value })}
                  className="w-full bg-navy-900 border border-white/20 px-3 py-1.5 text-white font-medium"
                  placeholder="e.g. Nomination Deadline Extended"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">Announcement Type</label>
                  <select
                    value={editingAnnouncement.announcementType || "general"}
                    onChange={(e) =>
                      setEditingAnnouncement({ ...editingAnnouncement, announcementType: e.target.value as any })
                    }
                    className="w-full bg-navy-900 border border-white/20 px-3 py-1.5 text-white font-mono"
                  >
                    <option value="general">General</option>
                    <option value="deadline">Deadline Notice</option>
                    <option value="event">Event / Ceremony</option>
                    <option value="alert">Urgent Alert</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">Badge Text</label>
                  <input
                    type="text"
                    value={editingAnnouncement.badgeText || ""}
                    onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, badgeText: e.target.value })}
                    className="w-full bg-navy-900 border border-white/20 px-3 py-1.5 text-white font-mono"
                    placeholder="e.g. EDITION 2026"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">Short Description</label>
                <textarea
                  rows={3}
                  value={editingAnnouncement.shortDescription || ""}
                  onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, shortDescription: e.target.value })}
                  className="w-full bg-navy-900 border border-white/20 p-2.5 text-white leading-relaxed"
                  placeholder="Brief synopsis..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">Action Button URL</label>
                  <input
                    type="text"
                    value={editingAnnouncement.actionUrl || ""}
                    onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, actionUrl: e.target.value })}
                    className="w-full bg-navy-900 border border-white/20 px-3 py-1.5 text-white font-mono"
                    placeholder="/how-to-nominate"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">Action Button Label</label>
                  <input
                    type="text"
                    value={editingAnnouncement.actionLabel || ""}
                    onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, actionLabel: e.target.value })}
                    className="w-full bg-navy-900 border border-white/20 px-3 py-1.5 text-white"
                    placeholder="e.g. Read Guidelines"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">Publication Status</label>
                  <select
                    value={editingAnnouncement.status || "published"}
                    onChange={(e) =>
                      setEditingAnnouncement({ ...editingAnnouncement, status: e.target.value as any })
                    }
                    className="w-full bg-navy-900 border border-white/20 px-3 py-1.5 text-white font-mono"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">Display Order</label>
                  <input
                    type="number"
                    value={editingAnnouncement.displayOrder || 1}
                    onChange={(e) =>
                      setEditingAnnouncement({ ...editingAnnouncement, displayOrder: parseInt(e.target.value) || 1 })
                    }
                    className="w-full bg-navy-900 border border-white/20 px-3 py-1.5 text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingAnnouncement(null)}
                  className="px-3 py-1.5 border border-white/20 text-slate-300 font-mono text-xs uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 bg-gold-500 hover:bg-gold-400 text-navy-950 font-mono text-xs font-bold uppercase"
                >
                  {isSubmitting ? "Saving..." : "Save Announcement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
