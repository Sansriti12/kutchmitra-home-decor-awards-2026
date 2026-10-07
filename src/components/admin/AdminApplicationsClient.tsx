"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  Filter,
  RotateCcw,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  Building2,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Eye,
  Copy,
  Check,
  Layers,
  Sparkles,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  AdminApplicationSummaryItem,
  StatusCounts,
} from "@/lib/admin/actions";

interface CategoryOption {
  id: string;
  code: string;
  name: string;
  slug: string;
}

interface AdminApplicationsClientProps {
  initialApplications: AdminApplicationSummaryItem[];
  categories: CategoryOption[];
  statusCounts: StatusCounts;
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  currentSearch?: string;
  currentCategory?: string;
  currentStatus?: string;
  currentSortBy?: string;
  currentSortOrder?: "asc" | "desc";
}

const STATUS_CONFIG: Record<
  string,
  { label: string; text: string; bg: string; border: string; dot: string }
> = {
  draft: {
    label: "Draft",
    text: "text-slate-300",
    bg: "bg-slate-800/60",
    border: "border-slate-700",
    dot: "bg-slate-400",
  },
  submitted: {
    label: "Submitted",
    text: "text-blue-300",
    bg: "bg-blue-950/60",
    border: "border-blue-500/30",
    dot: "bg-blue-400",
  },
  under_verification: {
    label: "Under Verification",
    text: "text-amber-300",
    bg: "bg-amber-950/60",
    border: "border-amber-500/30",
    dot: "bg-amber-400",
  },
  clarification_required: {
    label: "Clarification Required",
    text: "text-orange-300",
    bg: "bg-orange-950/60",
    border: "border-orange-500/40",
    dot: "bg-orange-400",
  },
  eligible: {
    label: "Eligible",
    text: "text-emerald-300",
    bg: "bg-emerald-950/60",
    border: "border-emerald-500/30",
    dot: "bg-emerald-400",
  },
  jury_review: {
    label: "Jury Review",
    text: "text-gold-300",
    bg: "bg-gold-950/60",
    border: "border-gold-500/30",
    dot: "bg-gold-400",
  },
  shortlisted: {
    label: "Shortlisted",
    text: "text-purple-300",
    bg: "bg-purple-950/60",
    border: "border-purple-500/30",
    dot: "bg-purple-400",
  },
  winner: {
    label: "Winner / Laureate",
    text: "text-gold-200",
    bg: "bg-gold-900/60",
    border: "border-gold-400/50",
    dot: "bg-gold-300",
  },
  rejected: {
    label: "Not Selected",
    text: "text-rose-300",
    bg: "bg-rose-950/60",
    border: "border-rose-500/30",
    dot: "bg-rose-400",
  },
  disqualified: {
    label: "Disqualified",
    text: "text-red-400",
    bg: "bg-red-950/80",
    border: "border-red-600/40",
    dot: "bg-red-500",
  },
};

const KUTCH_CITIES = [
  "bhuj",
  "gandhidham",
  "anjar",
  "mandvi",
  "mundra",
  "nakhatrana",
  "abdasa",
  "lakhpat",
  "rapar",
  "bhachau",
  "kandla",
  "madhapar",
  "kothara",
  "naliya",
  "dayapar",
];

function isKutchLocation(city?: string | null): boolean {
  if (!city) return false;
  const lower = city.toLowerCase();
  return KUTCH_CITIES.some((k) => lower.includes(k)) || lower.includes("kutch") || lower.includes("kachchh");
}

export default function AdminApplicationsClient({
  initialApplications,
  categories,
  statusCounts,
  totalCount,
  totalPages,
  currentPage,
  pageSize,
  currentSearch = "",
  currentCategory = "all",
  currentStatus = "all",
  currentSortBy = "created_at",
  currentSortOrder = "desc",
}: AdminApplicationsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [searchTerm, setSearchTerm] = useState(currentSearch);
  const [selectedCategory, setSelectedCategory] = useState(currentCategory);
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const updateFilters = (newParams: Record<string, string | number>) => {
    const params = new URLSearchParams();
    if (searchTerm.trim()) params.set("search", searchTerm.trim());
    if (selectedCategory && selectedCategory !== "all") params.set("category", selectedCategory);
    if (selectedStatus && selectedStatus !== "all") params.set("status", selectedStatus);
    if (currentSortBy) params.set("sortBy", currentSortBy);
    if (currentSortOrder) params.set("sortOrder", currentSortOrder);
    params.set("page", "1"); // reset to page 1 on filter change

    Object.entries(newParams).forEach(([k, v]) => {
      if (v === "" || v === "all") {
        params.delete(k);
      } else {
        params.set(k, String(v));
      }
    });

    startTransition(() => {
      router.push(`/admin/applications?${params.toString()}`);
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: searchTerm, page: 1 });
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedStatus("all");
    startTransition(() => {
      router.push("/admin/applications");
    });
  };

  const handleSort = (column: string) => {
    const isCurrent = currentSortBy === column;
    const newOrder = isCurrent && currentSortOrder === "asc" ? "desc" : "asc";
    updateFilters({ sortBy: column, sortOrder: newOrder, page: currentPage });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    updateFilters({ page: newPage });
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Breadcrumbs */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-gold-400 font-semibold">
              Nomination Governance
            </span>
            <span className="text-[9px] font-mono px-1.5 py-0.2 bg-gold-500/20 text-gold-300 border border-gold-500/30 uppercase">
              Phase C Live
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl text-white font-medium tracking-tight">
            Applications &amp; Desk Audit
          </h1>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Comprehensive registry of all submitted and drafted entries across all 13 official categories.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetFilters}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
          >
            <RotateCcw size={13} />
            <span>Reset Filters</span>
          </button>
        </div>
      </div>

      {/* KPI Counters Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
        {/* Total */}
        <button
          onClick={() => {
            setSelectedStatus("all");
            updateFilters({ status: "all", page: 1 });
          }}
          className={cn(
            "p-3 text-left transition-all border",
            selectedStatus === "all"
              ? "bg-gold-500/20 border-gold-500 text-white"
              : "bg-navy-900/80 border-white/10 hover:border-white/20 text-slate-300"
          )}
        >
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Total</div>
          <div className="text-2xl font-mono font-bold text-white mt-1">{statusCounts.total}</div>
          <div className="text-[9px] text-slate-500 mt-0.5">All entries</div>
        </button>

        {/* Submitted */}
        <button
          onClick={() => {
            setSelectedStatus("submitted");
            updateFilters({ status: "submitted", page: 1 });
          }}
          className={cn(
            "p-3 text-left transition-all border",
            selectedStatus === "submitted"
              ? "bg-blue-500/20 border-blue-500 text-white"
              : "bg-navy-900/80 border-white/10 hover:border-white/20 text-slate-300"
          )}
        >
          <div className="text-[10px] font-mono uppercase tracking-wider text-blue-400">Submitted</div>
          <div className="text-2xl font-mono font-bold text-blue-300 mt-1">{statusCounts.submitted}</div>
          <div className="text-[9px] text-slate-500 mt-0.5">Awaiting audit</div>
        </button>

        {/* Under Verification */}
        <button
          onClick={() => {
            setSelectedStatus("under_verification");
            updateFilters({ status: "under_verification", page: 1 });
          }}
          className={cn(
            "p-3 text-left transition-all border",
            selectedStatus === "under_verification"
              ? "bg-amber-500/20 border-amber-500 text-white"
              : "bg-navy-900/80 border-white/10 hover:border-white/20 text-slate-300"
          )}
        >
          <div className="text-[10px] font-mono uppercase tracking-wider text-amber-400">Verifying</div>
          <div className="text-2xl font-mono font-bold text-amber-300 mt-1">{statusCounts.under_verification}</div>
          <div className="text-[9px] text-slate-500 mt-0.5">In desk review</div>
        </button>

        {/* Clarification Required */}
        <button
          onClick={() => {
            setSelectedStatus("clarification_required");
            updateFilters({ status: "clarification_required", page: 1 });
          }}
          className={cn(
            "p-3 text-left transition-all border",
            selectedStatus === "clarification_required"
              ? "bg-orange-500/20 border-orange-500 text-white"
              : "bg-navy-900/80 border-white/10 hover:border-white/20 text-slate-300"
          )}
        >
          <div className="text-[10px] font-mono uppercase tracking-wider text-orange-400">Clarify</div>
          <div className="text-2xl font-mono font-bold text-orange-300 mt-1">{statusCounts.clarification_required}</div>
          <div className="text-[9px] text-slate-500 mt-0.5">Applicant action</div>
        </button>

        {/* Eligible */}
        <button
          onClick={() => {
            setSelectedStatus("eligible");
            updateFilters({ status: "eligible", page: 1 });
          }}
          className={cn(
            "p-3 text-left transition-all border",
            selectedStatus === "eligible"
              ? "bg-emerald-500/20 border-emerald-500 text-white"
              : "bg-navy-900/80 border-white/10 hover:border-white/20 text-slate-300"
          )}
        >
          <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-400">Eligible</div>
          <div className="text-2xl font-mono font-bold text-emerald-300 mt-1">{statusCounts.eligible}</div>
          <div className="text-[9px] text-slate-500 mt-0.5">Jury-ready</div>
        </button>

        {/* Jury Review */}
        <button
          onClick={() => {
            setSelectedStatus("jury_review");
            updateFilters({ status: "jury_review", page: 1 });
          }}
          className={cn(
            "p-3 text-left transition-all border",
            selectedStatus === "jury_review"
              ? "bg-gold-500/20 border-gold-500 text-white"
              : "bg-navy-900/80 border-white/10 hover:border-white/20 text-slate-300"
          )}
        >
          <div className="text-[10px] font-mono uppercase tracking-wider text-gold-400">Jury</div>
          <div className="text-2xl font-mono font-bold text-gold-300 mt-1">{statusCounts.jury_review}</div>
          <div className="text-[9px] text-slate-500 mt-0.5">Scoring active</div>
        </button>

        {/* Shortlisted */}
        <button
          onClick={() => {
            setSelectedStatus("shortlisted");
            updateFilters({ status: "shortlisted", page: 1 });
          }}
          className={cn(
            "p-3 text-left transition-all border",
            selectedStatus === "shortlisted"
              ? "bg-purple-500/20 border-purple-500 text-white"
              : "bg-navy-900/80 border-white/10 hover:border-white/20 text-slate-300"
          )}
        >
          <div className="text-[10px] font-mono uppercase tracking-wider text-purple-400">Shortlisted</div>
          <div className="text-2xl font-mono font-bold text-purple-300 mt-1">{statusCounts.shortlisted}</div>
          <div className="text-[9px] text-slate-500 mt-0.5">Finalists</div>
        </button>

        {/* Drafts */}
        <button
          onClick={() => {
            setSelectedStatus("draft");
            updateFilters({ status: "draft", page: 1 });
          }}
          className={cn(
            "p-3 text-left transition-all border",
            selectedStatus === "draft"
              ? "bg-slate-500/20 border-slate-500 text-white"
              : "bg-navy-900/80 border-white/10 hover:border-white/20 text-slate-300"
          )}
        >
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Drafts</div>
          <div className="text-2xl font-mono font-bold text-slate-300 mt-1">{statusCounts.draft}</div>
          <div className="text-[9px] text-slate-500 mt-0.5">Unsubmitted</div>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-navy-900/80 border border-white/10 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search nomination ID, project name, or city..."
              className="w-full bg-navy-950/80 border border-white/10 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-gold-500 transition-colors"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-gold-500 hover:bg-gold-400 text-navy-950 text-xs font-semibold uppercase tracking-wider transition-colors"
          >
            Search
          </button>
        </form>

        {/* Category & Status Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Dropdown */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                updateFilters({ category: e.target.value, page: 1 });
              }}
              aria-label="Filter by category"
              className="bg-navy-950/80 border border-white/10 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-gold-500 transition-colors appearance-none pr-8 cursor-pointer"
            >
              <option value="all">All 13 Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code}. {c.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 text-[10px]">
              ▼
            </div>
          </div>

          {/* Status Dropdown */}
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                updateFilters({ status: e.target.value, page: 1 });
              }}
              aria-label="Filter by workflow status"
              className="bg-navy-950/80 border border-white/10 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-gold-500 transition-colors appearance-none pr-8 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="submitted">Submitted</option>
              <option value="under_verification">Under Verification</option>
              <option value="clarification_required">Clarification Required</option>
              <option value="eligible">Eligible</option>
              <option value="jury_review">Jury Review</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="winner">Winner / Laureate</option>
              <option value="draft">Draft</option>
              <option value="rejected">Rejected</option>
              <option value="disqualified">Disqualified</option>
            </select>
            <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 text-[10px]">
              ▼
            </div>
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-navy-900/80 border border-white/10 overflow-hidden relative">
        {isPending && (
          <div className="absolute inset-0 bg-navy-950/60 backdrop-blur-[1px] z-10 flex items-center justify-center">
            <div className="text-xs font-mono text-gold-400 flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-gold-400 border-t-transparent animate-spin rounded-full" />
              <span>Updating registry...</span>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-navy-950/90 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                <th
                  onClick={() => handleSort("nomination_id")}
                  className="p-3.5 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Nomination ID</span>
                    {currentSortBy === "nomination_id" && (
                      <span>{currentSortOrder === "asc" ? "↑" : "↓"}</span>
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("project_name")}
                  className="p-3.5 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Project &amp; Location</span>
                    {currentSortBy === "project_name" && (
                      <span>{currentSortOrder === "asc" ? "↑" : "↓"}</span>
                    )}
                  </div>
                </th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Entrant / Studio</th>
                <th
                  onClick={() => handleSort("created_at")}
                  className="p-3.5 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Date</span>
                    {currentSortBy === "created_at" && (
                      <span>{currentSortOrder === "asc" ? "↑" : "↓"}</span>
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("status")}
                  className="p-3.5 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Status</span>
                    {currentSortBy === "status" && (
                      <span>{currentSortOrder === "asc" ? "↑" : "↓"}</span>
                    )}
                  </div>
                </th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {initialApplications.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400 space-y-2">
                    <FileText className="mx-auto text-slate-600 mb-2" size={32} />
                    <p className="font-mono text-sm text-slate-300">No applications match your filter criteria.</p>
                    <p className="text-xs text-slate-500">
                      Try clearing filters or search query to view all applications.
                    </p>
                    <button
                      onClick={handleResetFilters}
                      className="mt-3 px-3 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-mono text-slate-300"
                    >
                      Clear All Filters
                    </button>
                  </td>
                </tr>
              ) : (
                initialApplications.map((app) => {
                  const statusInfo = STATUS_CONFIG[app.status] || {
                    label: app.status,
                    text: "text-slate-300",
                    bg: "bg-slate-800",
                    border: "border-slate-700",
                    dot: "bg-slate-400",
                  };
                  const isKutch = isKutchLocation(app.project_city);

                  return (
                    <tr
                      key={app.id}
                      className="hover:bg-white/[0.02] transition-colors group"
                    >
                      {/* Nomination ID */}
                      <td className="p-3.5 align-middle">
                        <div className="flex items-center gap-1.5">
                          <Link
                            href={`/admin/applications/${app.id}`}
                            className="font-mono text-xs font-semibold text-gold-400 hover:text-gold-200 transition-colors"
                          >
                            {app.nomination_id}
                          </Link>
                          <button
                            onClick={(e) => handleCopy(app.nomination_id, e)}
                            title="Copy Nomination ID"
                            className="text-slate-500 hover:text-slate-300 p-0.5 rounded transition-colors"
                          >
                            {copiedId === app.nomination_id ? (
                              <Check size={12} className="text-emerald-400" />
                            ) : (
                              <Copy size={12} />
                            )}
                          </button>
                        </div>
                        {app.is_locked && (
                          <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                            Locked against edit
                          </div>
                        )}
                      </td>

                      {/* Project Name & City */}
                      <td className="p-3.5 align-middle">
                        <div className="space-y-0.5">
                          <Link
                            href={`/admin/applications/${app.id}`}
                            className="font-medium text-white group-hover:text-gold-300 transition-colors line-clamp-1"
                          >
                            {app.project_name || "Untitled Draft"}
                          </Link>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                            <MapPin size={11} className="text-slate-500 flex-shrink-0" />
                            <span>
                              {app.project_city || "Gujarat"}
                              {app.project_state ? `, ${app.project_state}` : ""}
                            </span>
                            {isKutch && (
                              <span className="text-[9px] font-mono px-1 py-0.2 bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 uppercase">
                                Kutch Sited
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="p-3.5 align-middle">
                        {app.category ? (
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-[10px] px-1 py-0.2 bg-gold-500/10 text-gold-400 border border-gold-500/30 font-semibold">
                                #{app.category.code}
                              </span>
                              <span className="text-slate-200 line-clamp-1 font-medium">
                                {app.category.name}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">Unassigned</span>
                        )}
                      </td>

                      {/* Entrant */}
                      <td className="p-3.5 align-middle">
                        {app.applicant ? (
                          <div className="space-y-0.5">
                            <div className="text-slate-200 font-medium line-clamp-1">
                              {app.applicant.full_name}
                            </div>
                            <div className="text-[11px] font-mono text-slate-400 line-clamp-1" title={app.applicant.email}>
                              {app.applicant.organization_name || app.applicant.email}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">Unknown</span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="p-3.5 align-middle whitespace-nowrap">
                        <div className="space-y-0.5 font-mono text-[11px] text-slate-300">
                          <div>
                            {new Date(app.submitted_at || app.created_at).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {app.submitted_at ? "Submitted" : "Created"}
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-3.5 align-middle whitespace-nowrap">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono uppercase font-semibold border",
                            statusInfo.bg,
                            statusInfo.text,
                            statusInfo.border
                          )}
                        >
                          <span className={cn("w-1.5 h-1.5 rounded-full", statusInfo.dot)} />
                          <span>{statusInfo.label}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 align-middle text-right whitespace-nowrap">
                        <Link
                          href={`/admin/applications/${app.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-mono font-medium text-gold-400 hover:text-navy-950 bg-gold-500/10 hover:bg-gold-500 border border-gold-500/30 transition-all duration-150"
                        >
                          <Eye size={12} />
                          <span>Review Dossier</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer / Pagination */}
        <div className="p-4 border-t border-white/10 bg-navy-950/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-slate-400">
          <div>
            Showing{" "}
            <span className="text-white font-semibold">
              {totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1}
            </span>{" "}
            to{" "}
            <span className="text-white font-semibold">
              {Math.min(currentPage * pageSize, totalCount)}
            </span>{" "}
            of <span className="text-white font-semibold">{totalCount}</span> nominations
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1 || isPending}
              className={cn(
                "p-1.5 border border-white/10 flex items-center justify-center transition-colors",
                currentPage <= 1
                  ? "opacity-40 cursor-not-allowed text-slate-600"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              )}
              title="Previous Page"
            >
              <ChevronLeft size={16} />
            </button>

            <span className="px-3 py-1 bg-white/5 border border-white/10 text-white font-semibold">
              Page {currentPage} of {Math.max(1, totalPages)}
            </span>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages || isPending}
              className={cn(
                "p-1.5 border border-white/10 flex items-center justify-center transition-colors",
                currentPage >= totalPages
                  ? "opacity-40 cursor-not-allowed text-slate-600"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              )}
              title="Next Page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
