import React from "react";
import Link from "next/link";
import {
  FileText,
  Users,
  Layers,
  Award,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Trophy,
  ArrowUpRight,
  ShieldCheck,
  Calendar,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAdminSession } from "@/lib/admin/auth";
import { redirect } from "next/navigation";
import { TOTAL_ACTIVE_CATEGORIES } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  const adminClient = createAdminClient();

  // Fetch current edition, users count, and application status breakdown in parallel
  const [editionRes, usersCountRes, appsRes, recentAppsRes] =
    await Promise.all([
      adminClient
        .from("award_editions")
        .select("id, year, name, status, is_current")
        .eq("is_current", true)
        .maybeSingle(),
      adminClient
        .from("users")
        .select("*", { count: "exact", head: true }),
      adminClient
        .from("applications")
        .select("status"),
      adminClient
        .from("applications")
        .select("id, nomination_id, project_name, project_city, status, created_at, submitted_at")
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

  const currentEdition = editionRes.data;
  const totalUsers = usersCountRes.count ?? 0;
  const totalCategories = TOTAL_ACTIVE_CATEGORIES;

  const appRows = appsRes.data || [];
  const totalApplications = appRows.length;

  const statusCounts = {
    draft: 0,
    submitted: 0,
    under_verification: 0,
    clarification_required: 0,
    eligible: 0,
    jury_review: 0,
    shortlisted: 0,
    winner: 0,
    other: 0,
  };

  appRows.forEach((app) => {
    const s = app.status;
    if (s in statusCounts) {
      statusCounts[s as keyof typeof statusCounts]++;
    } else {
      statusCounts.other++;
    }
  });

  const recentApps = recentAppsRes.data || [];

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-gold-400 font-semibold">
              Kutchmitra Awards Administration
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 uppercase">
              {currentEdition?.name || "2026 Edition"}
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl text-white font-medium tracking-tight">
            Executive Operations Dashboard
          </h1>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Welcome, <span className="text-slate-200 font-medium">{session.user.fullName}</span> ({session.user.email}). High-level telemetry for the active award cycle.
          </p>
        </div>

        {/* Edition Status Tag */}
        <div className="flex items-center gap-3">
          <div className="p-3 bg-navy-900 border border-white/10 rounded-none flex items-center gap-3 text-right">
            <Calendar size={18} className="text-gold-400 flex-shrink-0" />
            <div>
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                Active Cycle
              </div>
              <div className="text-xs font-semibold text-white">
                {currentEdition?.name || "2026 Edition"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <section aria-label="Core Metrics">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Applications */}
          <div className="bg-navy-900/90 border border-white/10 p-5 space-y-2 relative overflow-hidden group hover:border-gold-500/40 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                Total Nominations
              </span>
              <FileText size={18} className="text-gold-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-3xl font-display font-semibold text-white tracking-tight">
              {totalApplications}
            </div>
            <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between pt-2 border-t border-white/5">
              <span>Submitted: {statusCounts.submitted}</span>
              <span className="text-gold-400">Drafts: {statusCounts.draft}</span>
            </div>
          </div>

          {/* Card 2: Registered Users */}
          <div className="bg-navy-900/90 border border-white/10 p-5 space-y-2 relative overflow-hidden group hover:border-gold-500/40 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                Registered Users
              </span>
              <Users size={18} className="text-blue-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-3xl font-display font-semibold text-white tracking-tight">
              {totalUsers}
            </div>
            <div className="text-[11px] font-mono text-slate-400 pt-2 border-t border-white/5 flex items-center justify-between">
              <span>Applicants &amp; Admins</span>
              <span className="text-emerald-400">Live Accounts</span>
            </div>
          </div>

          {/* Card 3: Active Award Categories */}
          <div className="bg-navy-900/90 border border-white/10 p-5 space-y-2 relative overflow-hidden group hover:border-gold-500/40 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                Award Categories
              </span>
              <Layers size={18} className="text-amber-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-3xl font-display font-semibold text-white tracking-tight">
              {totalCategories}
            </div>
            <div className="text-[11px] font-mono text-slate-400 pt-2 border-t border-white/5 flex items-center justify-between">
              <span>Active Disciplines</span>
              <span className="text-gold-400">2026 Cycle</span>
            </div>
          </div>

          {/* Card 4: Shortlisted / Winners */}
          <div className="bg-navy-900/90 border border-white/10 p-5 space-y-2 relative overflow-hidden group hover:border-gold-500/40 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                Finalists / Winners
              </span>
              <Trophy size={18} className="text-purple-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-3xl font-display font-semibold text-white tracking-tight">
              {statusCounts.winner}
            </div>
            <div className="text-[11px] font-mono text-slate-400 pt-2 border-t border-white/5 flex items-center justify-between">
              <span>Shortlisted: {statusCounts.shortlisted}</span>
              <span className="text-purple-300">Winners: {statusCounts.winner}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Lifecycle Workflow Pipeline Status */}
      <section aria-label="Workflow Funnel" className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-sm font-mono uppercase tracking-wider text-white font-semibold">
              Nomination Pipeline Telemetry
            </h2>
            <p className="text-xs text-slate-400 font-sans">
              Real-time distribution of all nominations across the 7-stage evaluation lifecycle.
            </p>
          </div>
          <span className="text-[10px] font-mono uppercase px-2 py-0.5 bg-white/5 border border-white/10 text-slate-400">
            Auto-calculated
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {/* Draft */}
          <div className="bg-navy-900/60 border border-white/10 p-3.5 space-y-1">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              1. Draft
            </div>
            <div className="text-xl font-mono font-semibold text-slate-300">
              {statusCounts.draft}
            </div>
            <div className="text-[10px] text-slate-500 font-sans">In Progress</div>
          </div>

          {/* Submitted */}
          <div className="bg-navy-900/60 border border-white/10 p-3.5 space-y-1">
            <div className="text-[10px] font-mono uppercase tracking-wider text-blue-400">
              2. Submitted
            </div>
            <div className="text-xl font-mono font-semibold text-blue-300">
              {statusCounts.submitted}
            </div>
            <div className="text-[10px] text-slate-500 font-sans">Awaiting Desk Check</div>
          </div>

          {/* Under Verification */}
          <div className="bg-navy-900/60 border border-white/10 p-3.5 space-y-1">
            <div className="text-[10px] font-mono uppercase tracking-wider text-amber-400">
              3. Verifying
            </div>
            <div className="text-xl font-mono font-semibold text-amber-300">
              {statusCounts.under_verification}
            </div>
            <div className="text-[10px] text-slate-500 font-sans">Eligibility Audit</div>
          </div>

          {/* Clarification Required */}
          <div className="bg-navy-900/60 border border-white/10 p-3.5 space-y-1">
            <div className="text-[10px] font-mono uppercase tracking-wider text-orange-400">
              4. Clarify
            </div>
            <div className="text-xl font-mono font-semibold text-orange-300">
              {statusCounts.clarification_required}
            </div>
            <div className="text-[10px] text-slate-500 font-sans">Applicant Flagged</div>
          </div>

          {/* Eligible */}
          <div className="bg-navy-900/60 border border-white/10 p-3.5 space-y-1">
            <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-400">
              5. Eligible
            </div>
            <div className="text-xl font-mono font-semibold text-emerald-300">
              {statusCounts.eligible}
            </div>
            <div className="text-[10px] text-slate-500 font-sans">Verified Valid</div>
          </div>

          {/* Jury Review */}
          <div className="bg-navy-900/60 border border-white/10 p-3.5 space-y-1">
            <div className="text-[10px] font-mono uppercase tracking-wider text-gold-400">
              6. Jury Review
            </div>
            <div className="text-xl font-mono font-semibold text-gold-300">
              {statusCounts.jury_review}
            </div>
            <div className="text-[10px] text-slate-500 font-sans">Scoring Active</div>
          </div>

          {/* Shortlisted */}
          <div className="bg-navy-900/60 border border-white/10 p-3.5 space-y-1">
            <div className="text-[10px] font-mono uppercase tracking-wider text-purple-400">
              7. Shortlisted
            </div>
            <div className="text-xl font-mono font-semibold text-purple-300">
              {statusCounts.shortlisted}
            </div>
            <div className="text-[10px] text-slate-500 font-sans">Top Contenders</div>
          </div>

          {/* Winner */}
          <div className="bg-navy-900/60 border border-white/10 p-3.5 space-y-1">
            <div className="text-[10px] font-mono uppercase tracking-wider text-gold-400">
              8. Winner
            </div>
            <div className="text-xl font-mono font-semibold text-gold-300">
              {statusCounts.winner}
            </div>
            <div className="text-[10px] text-slate-500 font-sans">Selected Winners</div>
          </div>
        </div>
      </section>

      {/* Two Column Layout: Recent Nominations & Quick Access */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Recent Nominations (7 cols) */}
        <section
          aria-label="Recent Applications"
          className="lg:col-span-7 bg-navy-900/80 border border-white/10 p-6 space-y-4"
        >
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h2 className="font-mono text-xs uppercase tracking-wider text-white font-semibold">
                Recent Nominations
              </h2>
              <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                Latest live entries submitted to the platform.
              </p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 bg-gold-500/10 text-gold-400 border border-gold-500/30 uppercase">
              Live Feed
            </span>
          </div>

          {recentApps.length === 0 ? (
            <div className="py-12 text-center space-y-2 border border-dashed border-white/10 bg-navy-950/40">
              <FileText size={24} className="mx-auto text-slate-500" />
              <p className="text-xs font-mono text-slate-400">
                No nominations recorded in this edition yet.
              </p>
              <p className="text-[11px] text-slate-500">
                Applications created via the Applicant Portal will appear here in real time.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/5 overflow-x-auto">
              {recentApps.map((app) => (
                <div
                  key={app.id}
                  className="py-3 flex items-center justify-between gap-4 text-xs font-sans hover:bg-white/[0.02] px-2 -mx-2 transition-colors"
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-semibold text-gold-400">
                        {app.nomination_id}
                      </span>
                      <span className="text-white truncate font-medium">
                        {app.project_name || "Untitled Project"}
                      </span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 flex items-center gap-2">
                      <span>{app.project_city || "Gujarat"}</span>
                      <span>&bull;</span>
                      <span>
                        {new Date(app.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 bg-white/5 border border-white/10 text-slate-300">
                      {app.status.replace("_", " ")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="pt-2 flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Showing up to 5 most recent records</span>
            <Link
              href="/admin/applications"
              className="inline-flex items-center gap-1 text-gold-400 hover:text-gold-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-400"
            >
              View all applications <ArrowUpRight size={12} />
            </Link>
          </div>
        </section>

        {/* Right: Quick Access (role-aware, implemented modules only) */}
        <section
          aria-label="Quick Access"
          className="lg:col-span-5 bg-navy-900/80 border border-white/10 p-6 space-y-4"
        >
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h2 className="font-mono text-xs uppercase tracking-wider text-white font-semibold">
                Quick Access
              </h2>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                Jump to the modules available to your role.
              </p>
            </div>
            <ShieldCheck size={16} className="text-emerald-400" />
          </div>

          <div className="space-y-2.5 text-xs font-sans">
            {[
              {
                href: "/admin/applications",
                title: "Applications",
                desc: "Search, verify, request clarifications and review nominations.",
                managementOnly: false,
              },
              {
                href: "/admin/jury",
                title: "Jury Management",
                desc: "Appoint jurors, assign nominations and monitor evaluations.",
                managementOnly: true,
              },
              {
                href: "/admin/shortlisting",
                title: "Shortlisting",
                desc: "Review jury recommendations and curate the official shortlist.",
                managementOnly: true,
              },
              {
                href: "/admin/winners",
                title: "Winners Showcase",
                desc: "Select, approve and publish category winners.",
                managementOnly: true,
              },
              {
                href: "/admin/reports",
                title: "Reports & Exports",
                desc: "Executive metrics and data exports.",
                managementOnly: true,
              },
              {
                href: "/admin/cms",
                title: "Content / CMS",
                desc: "Manage public dates, FAQs, announcements and contact details.",
                managementOnly: true,
              },
            ]
              .filter((m) => !m.managementOnly || session.isAdmin)
              .map((m) => (
                <Link
                  key={m.href}
                  href={m.href}
                  className="p-3 bg-white/[0.02] border border-white/10 hover:border-gold-500/40 flex items-start justify-between gap-3 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-400"
                >
                  <div className="space-y-0.5">
                    <div className="text-slate-100 font-medium">{m.title}</div>
                    <p className="text-xs text-slate-400">{m.desc}</p>
                  </div>
                  <ArrowUpRight size={14} className="text-gold-400 flex-shrink-0 mt-0.5" />
                </Link>
              ))}
          </div>
        </section>
      </div>
    </div>
  );
}
