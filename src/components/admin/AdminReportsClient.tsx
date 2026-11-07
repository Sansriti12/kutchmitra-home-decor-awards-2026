"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  BarChart3,
  Download,
  FileSpreadsheet,
  Filter,
  Search,
  RotateCcw,
  Layers,
  Award,
  Trophy,
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  MapPin,
  Calendar,
  Building,
  User,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  FileText,
  Sparkles,
} from "lucide-react";
import { cn, formatDeterministicDate, getCategoryDisplayNumber } from "@/lib/utils";
import type {
  ReportApplicationItem,
  ReportCategoryMetric,
  ReportExecutiveStats,
  ReportFilterOptions,
  ReportJuryMetric,
} from "@/lib/admin/report-actions";
import {
  generateApplicationsCsv,
  generateApplicationsExcelXml,
  generateJuryReportCsv,
  downloadFile,
} from "@/lib/admin/report-export";

interface AdminReportsClientProps {
  initialData: {
    applications: ReportApplicationItem[];
    executiveStats: ReportExecutiveStats;
    categoryMetrics: ReportCategoryMetric[];
    juryMetric: ReportJuryMetric;
    filterOptions: ReportFilterOptions;
  };
  isSuperAdmin: boolean;
}

type TabType = "applications" | "categories" | "statuses" | "jury";

const STATUS_COLOR_MAP: Record<string, { bg: string; text: string; border: string; label: string }> = {
  draft: { bg: "bg-slate-800/80", text: "text-slate-300", border: "border-slate-700", label: "Draft" },
  submitted: { bg: "bg-blue-950/80", text: "text-blue-300", border: "border-blue-500/40", label: "Submitted" },
  under_verification: { bg: "bg-cyan-950/80", text: "text-cyan-300", border: "border-cyan-500/40", label: "Under Verification" },
  clarification_required: { bg: "bg-amber-950/80", text: "text-amber-300", border: "border-amber-500/40", label: "Clarification Req." },
  eligible: { bg: "bg-emerald-950/80", text: "text-emerald-300", border: "border-emerald-500/40", label: "Eligible" },
  jury_review: { bg: "bg-indigo-950/80", text: "text-indigo-300", border: "border-indigo-500/40", label: "Jury Review" },
  shortlisted: { bg: "bg-gold-500/15", text: "text-gold-400", border: "border-gold-500/40", label: "Shortlisted" },
  winner: { bg: "bg-amber-500/20", text: "text-amber-300", border: "border-amber-500/50", label: "Winner" },
  rejected: { bg: "bg-red-950/80", text: "text-red-400", border: "border-red-500/40", label: "Rejected" },
  disqualified: { bg: "bg-red-950/90", text: "text-red-500", border: "border-red-600/50", label: "Disqualified" },
};

export default function AdminReportsClient({ initialData, isSuperAdmin }: AdminReportsClientProps) {
  const { applications, executiveStats, categoryMetrics, juryMetric, filterOptions } = initialData;

  // Active Tab
  const [activeTab, setActiveTab] = useState<TabType>("applications");

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");
  const [juryFilter, setJuryFilter] = useState("all");
  const [shortlistFilter, setShortlistFilter] = useState("all");
  const [winnerFilter, setWinnerFilter] = useState("all");
  const [kutchFilter, setKutchFilter] = useState("all");
  const [dateRangeFilter, setDateRangeFilter] = useState<"all" | "today" | "7days" | "30days" | "custom">("all");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  // Filtered Applications Calculation
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesNominationId = app.nominationId.toLowerCase().includes(q);
        const matchesProject = app.projectName.toLowerCase().includes(q);
        const matchesApplicant = app.applicantName.toLowerCase().includes(q);
        const matchesOrg = (app.organization || "").toLowerCase().includes(q);
        const matchesCity = app.projectCity.toLowerCase().includes(q);
        const matchesCatName = app.categoryName.toLowerCase().includes(q);
        const matchesCatDisplay = app.categoryDisplayNumber.includes(q);

        if (
          !matchesNominationId &&
          !matchesProject &&
          !matchesApplicant &&
          !matchesOrg &&
          !matchesCity &&
          !matchesCatName &&
          !matchesCatDisplay
        ) {
          return false;
        }
      }

      // 2. Category
      if (categoryFilter !== "all" && app.categoryId !== categoryFilter) {
        return false;
      }

      // 3. Status
      if (statusFilter !== "all" && app.status !== statusFilter) {
        return false;
      }

      // 4. City
      if (cityFilter !== "all" && app.projectCity !== cityFilter) {
        return false;
      }

      // 5. Jury Status
      if (juryFilter !== "all") {
        if (juryFilter === "assigned" && app.juryStatus === "unassigned") return false;
        if (juryFilter === "unassigned" && app.juryStatus !== "unassigned") return false;
        if (juryFilter === "completed" && app.juryStatus !== "completed") return false;
        if (juryFilter === "conflict" && app.juryStatus !== "conflict") return false;
        if (juryFilter === "pending" && !["assigned", "in_progress"].includes(app.juryStatus)) return false;
      }

      // 6. Shortlist
      if (shortlistFilter === "shortlisted" && !app.isShortlisted) return false;
      if (shortlistFilter === "not_shortlisted" && app.isShortlisted) return false;

      // 7. Winner
      if (winnerFilter === "winner" && !app.isWinner) return false;
      if (winnerFilter === "not_winner" && app.isWinner) return false;

      // 8. Kutch Focus
      if (kutchFilter === "kutch" && !app.isKutch) return false;
      if (kutchFilter === "other" && app.isKutch) return false;

      // 9. Date Range
      if (dateRangeFilter !== "all") {
        const appDate = new Date(app.submittedAt || app.createdAt).getTime();
        const now = Date.now();

        if (dateRangeFilter === "today") {
          const startOfToday = new Date();
          startOfToday.setHours(0, 0, 0, 0);
          if (appDate < startOfToday.getTime()) return false;
        } else if (dateRangeFilter === "7days") {
          const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
          if (appDate < sevenDaysAgo) return false;
        } else if (dateRangeFilter === "30days") {
          const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
          if (appDate < thirtyDaysAgo) return false;
        } else if (dateRangeFilter === "custom") {
          if (customStartDate) {
            const start = new Date(customStartDate).getTime();
            if (appDate < start) return false;
          }
          if (customEndDate) {
            const end = new Date(customEndDate);
            end.setHours(23, 59, 59, 999);
            if (appDate > end.getTime()) return false;
          }
        }
      }

      return true;
    });
  }, [
    applications,
    searchQuery,
    categoryFilter,
    statusFilter,
    cityFilter,
    juryFilter,
    shortlistFilter,
    winnerFilter,
    kutchFilter,
    dateRangeFilter,
    customStartDate,
    customEndDate,
  ]);

  const hasActiveFilters =
    Boolean(searchQuery) ||
    categoryFilter !== "all" ||
    statusFilter !== "all" ||
    cityFilter !== "all" ||
    juryFilter !== "all" ||
    shortlistFilter !== "all" ||
    winnerFilter !== "all" ||
    kutchFilter !== "all" ||
    dateRangeFilter !== "all";

  const handleResetFilters = () => {
    setSearchQuery("");
    setCategoryFilter("all");
    setStatusFilter("all");
    setCityFilter("all");
    setJuryFilter("all");
    setShortlistFilter("all");
    setWinnerFilter("all");
    setKutchFilter("all");
    setDateRangeFilter("all");
    setCustomStartDate("");
    setCustomEndDate("");
  };

  // Export handlers
  const handleExportCsv = () => {
    const csvData = generateApplicationsCsv(filteredApplications);
    const dateStr = new Date().toISOString().slice(0, 10);
    downloadFile(csvData, `Kutchmitra_Awards_Applications_Report_${dateStr}.csv`, "text/csv;charset=utf-8;");
  };

  const handleExportExcel = () => {
    const excelData = generateApplicationsExcelXml(filteredApplications, "Applications Report");
    const dateStr = new Date().toISOString().slice(0, 10);
    downloadFile(excelData, `Kutchmitra_Awards_Applications_Report_${dateStr}.xls`, "application/vnd.ms-excel");
  };

  const handleExportJuryCsv = () => {
    const csvData = generateJuryReportCsv(juryMetric.jurorSummaries);
    const dateStr = new Date().toISOString().slice(0, 10);
    downloadFile(csvData, `Kutchmitra_Awards_Jury_Governance_Report_${dateStr}.csv`, "text/csv;charset=utf-8;");
  };

  return (
    <div className="space-y-6">
      {/* HEADER & EXECUTIVE ACTIONS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-gold-400 uppercase tracking-wider">
            <BarChart3 size={14} />
            <span>Executive Governance &amp; Data Auditing</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl text-white font-medium mt-1">
            Reports &amp; Data Exports
          </h1>
          <p className="text-xs text-slate-400 font-sans mt-0.5 max-w-2xl">
            Real-time analytics, category distribution metrics, jury evaluation progress, and filtered exports for the 2026 Awards Cycle.
          </p>
        </div>

        {/* Global Export Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={filteredApplications.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-navy-900 border border-gold-500/40 text-gold-400 hover:text-gold-300 hover:bg-gold-500/10 text-xs font-mono uppercase tracking-wider font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            title="Download current filtered table as CSV"
          >
            <Download size={14} />
            <span>CSV Export ({filteredApplications.length})</span>
          </button>

          <button
            type="button"
            onClick={handleExportExcel}
            disabled={filteredApplications.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gold-500 hover:bg-gold-400 text-navy-950 text-xs font-mono uppercase tracking-wider font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            title="Download current filtered table as Excel (.xls)"
          >
            <FileSpreadsheet size={14} />
            <span>Excel (.xls)</span>
          </button>
        </div>
      </div>

      {/* EXECUTIVE KPI STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-navy-950/80 border border-white/10 p-3.5 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono uppercase tracking-wider">Total Entries</span>
            <FileText size={14} className="text-slate-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {executiveStats.totalApplications}
          </div>
          <p className="text-[10px] text-slate-400">
            {executiveStats.statusCounts["submitted"] || 0} Submitted · {executiveStats.statusCounts["draft"] || 0} Draft
          </p>
        </div>

        <div className="bg-navy-950/80 border border-white/10 p-3.5 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono uppercase tracking-wider">In Evaluation</span>
            <Clock size={14} className="text-indigo-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-indigo-300">
            {(executiveStats.statusCounts["eligible"] || 0) +
              (executiveStats.statusCounts["jury_review"] || 0) +
              (executiveStats.statusCounts["under_verification"] || 0)}
          </div>
          <p className="text-[10px] text-slate-400">Verification &amp; Jury</p>
        </div>

        <div className="bg-navy-950/80 border border-white/10 p-3.5 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono uppercase tracking-wider">Shortlisted</span>
            <Award size={14} className="text-gold-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-gold-400">
            {executiveStats.totalShortlistedCount}
          </div>
          <p className="text-[10px] text-slate-400">Grand Finale Finalists</p>
        </div>

        <div className="bg-navy-950/80 border border-white/10 p-3.5 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono uppercase tracking-wider">Honorees</span>
            <Trophy size={14} className="text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-300">
            {executiveStats.totalWinnersCount}
          </div>
          <p className="text-[10px] text-slate-400">
            {executiveStats.totalPublishedWinnersCount} Published Winners
          </p>
        </div>

        <div className="bg-navy-950/80 border border-white/10 p-3.5 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono uppercase tracking-wider">Kutch Focus</span>
            <MapPin size={14} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            {executiveStats.kutchCount}
          </div>
          <p className="text-[10px] text-slate-400">
            {executiveStats.totalApplications > 0
              ? `${Math.round((executiveStats.kutchCount / executiveStats.totalApplications) * 100)}% of total`
              : "0%"}
          </p>
        </div>

        <div className="bg-navy-950/80 border border-white/10 p-3.5 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono uppercase tracking-wider">Grand Jury</span>
            <Users size={14} className="text-blue-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-blue-300">
            {juryMetric.totalJurors}
          </div>
          <p className="text-[10px] text-slate-400">
            {juryMetric.totalAssignments} Jury Assignments
          </p>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="border-b border-white/10">
        <div className="flex items-center gap-1 overflow-x-auto pb-px">
          <button
            type="button"
            onClick={() => setActiveTab("applications")}
            className={cn(
              "px-4 py-2.5 text-xs font-mono uppercase tracking-wider font-semibold transition-colors border-b-2 whitespace-nowrap flex items-center gap-2",
              activeTab === "applications"
                ? "border-gold-500 text-gold-400 bg-white/[0.02]"
                : "border-transparent text-slate-400 hover:text-white"
            )}
          >
            <FileText size={13} />
            <span>Applications Master ({applications.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("categories")}
            className={cn(
              "px-4 py-2.5 text-xs font-mono uppercase tracking-wider font-semibold transition-colors border-b-2 whitespace-nowrap flex items-center gap-2",
              activeTab === "categories"
                ? "border-gold-500 text-gold-400 bg-white/[0.02]"
                : "border-transparent text-slate-400 hover:text-white"
            )}
          >
            <Layers size={13} />
            <span>Category Breakdown ({categoryMetrics.length} Categories)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("statuses")}
            className={cn(
              "px-4 py-2.5 text-xs font-mono uppercase tracking-wider font-semibold transition-colors border-b-2 whitespace-nowrap flex items-center gap-2",
              activeTab === "statuses"
                ? "border-gold-500 text-gold-400 bg-white/[0.02]"
                : "border-transparent text-slate-400 hover:text-white"
            )}
          >
            <BarChart3 size={13} />
            <span>Status Distribution</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("jury")}
            className={cn(
              "px-4 py-2.5 text-xs font-mono uppercase tracking-wider font-semibold transition-colors border-b-2 whitespace-nowrap flex items-center gap-2",
              activeTab === "jury"
                ? "border-gold-500 text-gold-400 bg-white/[0.02]"
                : "border-transparent text-slate-400 hover:text-white"
            )}
          >
            <Users size={13} />
            <span>Jury Governance ({juryMetric.totalAssignments} Assignments)</span>
          </button>
        </div>
      </div>

      {/* TAB 1: APPLICATIONS MASTER REPORT */}
      {activeTab === "applications" && (
        <div className="space-y-4">
          {/* FILTER CONTROLS BAR */}
          <div className="bg-navy-900/90 border border-white/10 p-4 space-y-3">
            {/* Top Filter Row: Search & Reset */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by Nomination ID, project, entrant, studio, city, or category..."
                  className="w-full pl-9 pr-3 py-2 bg-navy-950 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-gold-500 font-sans"
                />
              </div>

              {/* Reset Button */}
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-mono uppercase tracking-wider transition-colors"
                >
                  <RotateCcw size={12} />
                  <span>Reset All Filters</span>
                </button>
              )}
            </div>

            {/* Bottom Multi-Filter Dropdown Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
              {/* Category Filter */}
              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Category</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-navy-950 border border-white/10 text-slate-200 text-xs focus:outline-none focus:border-gold-500 font-sans"
                >
                  <option value="all">All Categories ({filterOptions.categories.length})</option>
                  {filterOptions.categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.displayNumber}. {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-navy-950 border border-white/10 text-slate-200 text-xs focus:outline-none focus:border-gold-500 font-sans"
                >
                  <option value="all">All Workflow Statuses</option>
                  {filterOptions.statuses.map((s) => (
                    <option key={s.code} value={s.code}>
                      {s.label} ({executiveStats.statusCounts[s.code] || 0})
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Range Filter */}
              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Date Range</label>
                <select
                  value={dateRangeFilter}
                  onChange={(e: any) => setDateRangeFilter(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-navy-950 border border-white/10 text-slate-200 text-xs focus:outline-none focus:border-gold-500 font-sans"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="7days">Last 7 Days</option>
                  <option value="30days">Last 30 Days</option>
                  <option value="custom">Custom Range...</option>
                </select>
              </div>

              {/* City / Location Filter */}
              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">City / Region</label>
                <select
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-navy-950 border border-white/10 text-slate-200 text-xs focus:outline-none focus:border-gold-500 font-sans"
                >
                  <option value="all">All Cities ({filterOptions.cities.length})</option>
                  {filterOptions.cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              {/* Jury Evaluation Filter */}
              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Jury Review</label>
                <select
                  value={juryFilter}
                  onChange={(e) => setJuryFilter(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-navy-950 border border-white/10 text-slate-200 text-xs focus:outline-none focus:border-gold-500 font-sans"
                >
                  <option value="all">All Jury Statuses</option>
                  <option value="assigned">Assigned to Juror</option>
                  <option value="completed">Completed Review</option>
                  <option value="pending">Pending Evaluation</option>
                  <option value="conflict">Declared Conflict</option>
                  <option value="unassigned">Unassigned</option>
                </select>
              </div>

              {/* Shortlist & Finale Filter */}
              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Shortlist / Honoree</label>
                <select
                  value={shortlistFilter}
                  onChange={(e) => setShortlistFilter(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-navy-950 border border-white/10 text-slate-200 text-xs focus:outline-none focus:border-gold-500 font-sans"
                >
                  <option value="all">All Candidates</option>
                  <option value="shortlisted">Shortlisted Finalists</option>
                  <option value="not_shortlisted">Not Shortlisted</option>
                </select>
              </div>
            </div>

            {/* Custom Date Range Sub-Row */}
            {dateRangeFilter === "custom" && (
              <div className="flex items-center gap-3 pt-2 border-t border-white/5 text-xs font-mono">
                <span className="text-slate-400 text-[11px]">From Date:</span>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="bg-navy-950 border border-white/10 text-white px-2 py-1 text-xs"
                />
                <span className="text-slate-400 text-[11px]">To Date:</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="bg-navy-950 border border-white/10 text-white px-2 py-1 text-xs"
                />
              </div>
            )}
          </div>

          {/* ACTIVE FILTER SUMMARY & EXPORT STRIP */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
            <div className="text-slate-400 flex items-center gap-2">
              <span>Showing</span>
              <strong className="text-gold-400">{filteredApplications.length}</strong>
              <span>of {applications.length} total entries</span>
              {hasActiveFilters && (
                <span className="px-1.5 py-0.2 bg-gold-500/15 border border-gold-500/30 text-gold-300 text-[10px]">
                  Filtered
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportCsv}
                disabled={filteredApplications.length === 0}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 transition-colors disabled:opacity-50"
              >
                <Download size={12} />
                <span>Download CSV</span>
              </button>
              <button
                type="button"
                onClick={handleExportExcel}
                disabled={filteredApplications.length === 0}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] bg-gold-500/10 hover:bg-gold-500/20 border border-gold-500/30 text-gold-400 transition-colors disabled:opacity-50"
              >
                <FileSpreadsheet size={12} />
                <span>Download Excel</span>
              </button>
            </div>
          </div>

          {/* DATA TABLE */}
          <div className="border border-white/10 bg-navy-900/60 overflow-hidden shadow-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-navy-950/90 text-slate-400 font-mono text-[10px] uppercase tracking-wider border-b border-white/10">
                  <tr>
                    <th className="py-3 px-3.5 whitespace-nowrap">Nomination ID</th>
                    <th className="py-3 px-3.5 whitespace-nowrap">Category</th>
                    <th className="py-3 px-3.5">Project Title</th>
                    <th className="py-3 px-3.5">Applicant / Practice</th>
                    <th className="py-3 px-3.5 whitespace-nowrap">Location</th>
                    <th className="py-3 px-3.5 whitespace-nowrap">Status</th>
                    <th className="py-3 px-3.5 whitespace-nowrap">Jury Evaluation</th>
                    <th className="py-3 px-3.5 whitespace-nowrap">Shortlist / Winner</th>
                    <th className="py-3 px-3.5 whitespace-nowrap text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredApplications.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-500 space-y-2">
                        <Filter size={24} className="mx-auto text-slate-600" />
                        <p className="font-mono text-xs">No nomination entries match the selected filter criteria.</p>
                        {hasActiveFilters && (
                          <button
                            type="button"
                            onClick={handleResetFilters}
                            className="mt-2 text-xs font-mono text-gold-400 underline hover:text-gold-300"
                          >
                            Reset filters
                          </button>
                        )}
                      </td>
                    </tr>
                  ) : (
                    filteredApplications.map((app) => {
                      const st = STATUS_COLOR_MAP[app.status] || {
                        bg: "bg-slate-800",
                        text: "text-slate-300",
                        border: "border-slate-700",
                        label: app.status,
                      };

                      return (
                        <tr key={app.id} className="hover:bg-white/[0.02] transition-colors">
                          {/* Nomination ID */}
                          <td className="py-3 px-3.5 font-mono whitespace-nowrap">
                            <span className="font-bold text-gold-400">{app.nominationId}</span>
                            <div className="text-[10px] text-slate-500">
                              {app.submittedAt ? formatDeterministicDate(app.submittedAt) : "Draft"}
                            </div>
                          </td>

                          {/* Category with Sequential 01-16 Display */}
                          <td className="py-3 px-3.5 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 bg-gold-500/10 text-gold-400 border border-gold-500/30">
                                #{app.categoryDisplayNumber}
                              </span>
                              <span className="text-white line-clamp-1 max-w-[140px] truncate" title={app.categoryName}>
                                {app.categoryName}
                              </span>
                            </div>
                          </td>

                          {/* Project Name & Area */}
                          <td className="py-3 px-3.5">
                            <div className="font-medium text-white line-clamp-1">{app.projectName}</div>
                            {app.builtUpAreaSqft ? (
                              <div className="text-[10px] font-mono text-slate-400">
                                {app.builtUpAreaSqft.toLocaleString()} sq. ft.
                              </div>
                            ) : null}
                          </td>

                          {/* Applicant & Studio */}
                          <td className="py-3 px-3.5">
                            <div className="text-slate-200 line-clamp-1">{app.applicantName}</div>
                            <div className="text-[10px] text-slate-400 font-mono line-clamp-1 truncate">
                              {app.organization || app.applicantEmail}
                            </div>
                          </td>

                          {/* Location & Kutch Indicator */}
                          <td className="py-3 px-3.5 whitespace-nowrap">
                            <div className="text-slate-300">{app.projectCity}</div>
                            {app.isKutch ? (
                              <span className="inline-block text-[11px] font-mono px-1 py-0.2 bg-emerald-950 text-emerald-300 border border-emerald-500/30 uppercase mt-0.5">
                                Kutch Region
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-500">{app.projectState}</span>
                            )}
                          </td>

                          {/* Workflow Status */}
                          <td className="py-3 px-3.5 whitespace-nowrap">
                            <span
                              className={cn(
                                "inline-block px-2 py-0.5 text-[10px] font-mono uppercase font-semibold border",
                                st.bg,
                                st.text,
                                st.border
                              )}
                            >
                              {st.label}
                            </span>
                          </td>

                          {/* Jury Status */}
                          <td className="py-3 px-3.5 whitespace-nowrap">
                            {app.juryStatus === "completed" ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-300 bg-emerald-950/60 px-1.5 py-0.5 border border-emerald-500/30">
                                <CheckCircle2 size={10} /> Completed
                              </span>
                            ) : app.juryStatus === "conflict" ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-mono text-red-300 bg-red-950/60 px-1.5 py-0.5 border border-red-500/30">
                                <AlertTriangle size={10} /> Conflict
                              </span>
                            ) : app.juryStatus === "in_progress" || app.juryStatus === "assigned" ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-mono text-blue-300 bg-blue-950/60 px-1.5 py-0.5 border border-blue-500/30">
                                <Clock size={10} /> In Review
                              </span>
                            ) : (
                              <span className="text-[10px] font-mono text-slate-500">Unassigned</span>
                            )}
                            {app.jurorNames.length > 0 && (
                              <div className="text-[11px] text-slate-400 font-mono line-clamp-1 truncate max-w-[120px]">
                                {app.jurorNames.join(", ")}
                              </div>
                            )}
                          </td>

                          {/* Shortlist / Winner Honor */}
                          <td className="py-3 px-3.5 whitespace-nowrap space-y-0.5">
                            {app.isWinner ? (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono uppercase bg-amber-950 border border-amber-500/40 text-amber-300 font-bold">
                                <Trophy size={10} /> {app.awardTitle || "Winner"}
                              </span>
                            ) : app.isShortlisted ? (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono uppercase bg-gold-500/10 border border-gold-500/30 text-gold-400 font-semibold">
                                <Award size={10} /> Finalist
                              </span>
                            ) : (
                              <span className="text-[10px] font-mono text-slate-500">-</span>
                            )}
                          </td>

                          {/* Action */}
                          <td className="py-3 px-3.5 text-right whitespace-nowrap">
                            <Link
                              href={`/admin/applications/${app.id}`}
                              className="inline-flex items-center gap-1 text-[11px] font-mono text-gold-400 hover:text-gold-300 uppercase px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                            >
                              <span>View</span>
                              <ChevronRight size={12} />
                            </Link>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CATEGORY BREAKDOWN REPORT */}
      {activeTab === "categories" && (
        <div className="space-y-4">
          <div className="border border-white/10 bg-navy-900/60 overflow-hidden shadow-card">
            <div className="p-4 border-b border-white/10 bg-navy-950/80 flex items-center justify-between">
              <div>
                <h3 className="font-mono text-xs uppercase tracking-wider text-white font-semibold">
                  16 Award Categories
                </h3>
                <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                  Sequential UI display numbering 01 through 16. Retired categories remain preserved in the database.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-navy-950 text-slate-400 font-mono text-[10px] uppercase tracking-wider border-b border-white/10">
                  <tr>
                    <th className="py-3 px-4">#</th>
                    <th className="py-3 px-4">Category Name</th>
                    <th className="py-3 px-4 text-center">Total Entries</th>
                    <th className="py-3 px-4 text-center">Draft</th>
                    <th className="py-3 px-4 text-center">Submitted</th>
                    <th className="py-3 px-4 text-center">In Evaluation</th>
                    <th className="py-3 px-4 text-center">Shortlisted</th>
                    <th className="py-3 px-4 text-center">Winners</th>
                    <th className="py-3 px-4 text-right">Share of Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {categoryMetrics.map((cat) => {
                    const share =
                      executiveStats.totalApplications > 0
                        ? Math.round((cat.totalApplications / executiveStats.totalApplications) * 100)
                        : 0;

                    return (
                      <tr key={cat.id} className="hover:bg-white/[0.02]">
                        <td className="py-3 px-4 font-mono font-bold text-gold-400">
                          {cat.displayNumber}
                        </td>
                        <td className="py-3 px-4 font-medium text-white">
                          {cat.name}
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-bold text-white">
                          {cat.totalApplications}
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-slate-400">
                          {cat.draftCount}
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-blue-300">
                          {cat.submittedCount}
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-indigo-300">
                          {cat.underReviewCount}
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-gold-400 font-semibold">
                          {cat.shortlistedCount}
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-amber-300 font-bold">
                          {cat.winnerCount}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-slate-400">
                          {share}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: STATUS DISTRIBUTION */}
      {activeTab === "statuses" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filterOptions.statuses.map((s) => {
              const count = executiveStats.statusCounts[s.code] || 0;
              const pct =
                executiveStats.totalApplications > 0
                  ? Math.round((count / executiveStats.totalApplications) * 100)
                  : 0;
              const st = STATUS_COLOR_MAP[s.code] || {
                bg: "bg-slate-800",
                text: "text-slate-300",
                border: "border-slate-700",
                label: s.label,
              };

              return (
                <div key={s.code} className="bg-navy-950/80 border border-white/10 p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        "px-2 py-0.5 text-[10px] font-mono uppercase font-bold border",
                        st.bg,
                        st.text,
                        st.border
                      )}
                    >
                      {st.label}
                    </span>
                    <span className="font-mono text-xs text-slate-400">{pct}%</span>
                  </div>

                  <div className="flex items-baseline justify-between">
                    <div className="text-2xl font-bold font-mono text-white">{count}</div>
                    <span className="text-[11px] text-slate-500">entries</span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-white/5 h-1.5 overflow-hidden">
                    <div
                      className="bg-gold-500 h-full transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: JURY GOVERNANCE REPORT */}
      {activeTab === "jury" && (
        <div className="space-y-4">
          {/* Top Jury Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-navy-950/80 border border-white/10 p-4 space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-400">Total Jurors</span>
              <div className="text-2xl font-bold font-mono text-white">{juryMetric.totalJurors}</div>
              <p className="text-[10px] text-slate-500">{juryMetric.activeJurors} active in 2026 cycle</p>
            </div>

            <div className="bg-navy-950/80 border border-white/10 p-4 space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-400">Total Assignments</span>
              <div className="text-2xl font-bold font-mono text-blue-300">{juryMetric.totalAssignments}</div>
              <p className="text-[10px] text-slate-500">Across 16 categories</p>
            </div>

            <div className="bg-navy-950/80 border border-white/10 p-4 space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-400">Evaluations Completed</span>
              <div className="text-2xl font-bold font-mono text-emerald-400">{juryMetric.completedAssignments}</div>
              <p className="text-[10px] text-slate-500">{juryMetric.completionPercentage}% completion rate</p>
            </div>

            <div className="bg-navy-950/80 border border-white/10 p-4 space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-400">Conflicts Declared</span>
              <div className="text-2xl font-bold font-mono text-red-300">{juryMetric.conflictAssignments}</div>
              <p className="text-[10px] text-slate-500">Governance recused</p>
            </div>
          </div>

          {/* Qualitative Evaluation Framework Reminder */}
          <div className="bg-navy-900/60 border border-gold-500/30 p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono text-gold-400 font-semibold uppercase">
              <ShieldCheck size={14} />
              <span>Official Qualitative Governance Protocol</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Jury evaluations are strictly qualitative across five approved architectural criteria (Design Excellence, Functionality, Quality of Craftsmanship, Sustainability, and Contextual Relevance). No numeric scores or competitive point tallies are utilized.
            </p>
          </div>

          {/* Juror Activity Table */}
          <div className="border border-white/10 bg-navy-900/60 overflow-hidden shadow-card">
            <div className="p-4 border-b border-white/10 bg-navy-950/80 flex items-center justify-between">
              <div>
                <h3 className="font-mono text-xs uppercase tracking-wider text-white font-semibold">
                  Jury Member Evaluation Activity
                </h3>
                <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                  Juror assignment completion and conflict governance roster.
                </p>
              </div>

              <button
                type="button"
                onClick={handleExportJuryCsv}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase tracking-wider bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 transition-colors"
              >
                <Download size={13} />
                <span>Export Jury CSV</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-navy-950 text-slate-400 font-mono text-[10px] uppercase tracking-wider border-b border-white/10">
                  <tr>
                    <th className="py-3 px-4">Juror Name</th>
                    <th className="py-3 px-4">Organization / Studio</th>
                    <th className="py-3 px-4 text-center">Total Assigned</th>
                    <th className="py-3 px-4 text-center">Completed</th>
                    <th className="py-3 px-4 text-center">Pending</th>
                    <th className="py-3 px-4 text-center">Conflicts</th>
                    <th className="py-3 px-4 text-right">Progress</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {juryMetric.jurorSummaries.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-500 font-mono">
                        No jury member assignments recorded.
                      </td>
                    </tr>
                  ) : (
                    juryMetric.jurorSummaries.map((j) => {
                      const rate = j.totalAssigned > 0 ? Math.round((j.completed / j.totalAssigned) * 100) : 0;

                      return (
                        <tr key={j.id} className="hover:bg-white/[0.02]">
                          <td className="py-3 px-4 font-medium text-white">
                            <div>{j.fullName}</div>
                            <div className="text-[10px] font-mono text-slate-400">{j.email}</div>
                          </td>
                          <td className="py-3 px-4 text-slate-300">
                            {j.organization || j.designation || "-"}
                          </td>
                          <td className="py-3 px-4 text-center font-mono font-bold text-white">
                            {j.totalAssigned}
                          </td>
                          <td className="py-3 px-4 text-center font-mono text-emerald-400 font-semibold">
                            {j.completed}
                          </td>
                          <td className="py-3 px-4 text-center font-mono text-blue-300">
                            {j.pending}
                          </td>
                          <td className="py-3 px-4 text-center font-mono text-red-300">
                            {j.conflicts}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-slate-400">
                            <span className={rate === 100 ? "text-emerald-400 font-bold" : ""}>
                              {rate}%
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
