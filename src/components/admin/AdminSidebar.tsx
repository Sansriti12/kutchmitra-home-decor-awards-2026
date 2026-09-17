"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  CheckSquare,
  Layers,
  Users,
  Scale,
  Award,
  Trophy,
  Globe,
  BarChart3,
  ShieldAlert,
  History,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
  userEmail: string;
  userRole: string;
  isSuperAdmin: boolean;
  onCloseMobile?: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  isImplemented: boolean;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    isImplemented: true,
  },
  {
    label: "Applications",
    href: "/admin/applications",
    icon: FileText,
    isImplemented: false,
    badge: "Phase 2B",
  },
  {
    label: "Verification",
    href: "/admin/verification",
    icon: CheckSquare,
    isImplemented: false,
    badge: "Phase 2C",
  },
  {
    label: "Categories",
    href: "/admin/categories",
    icon: Layers,
    isImplemented: false,
    badge: "Phase 2D",
  },
  {
    label: "Jury Management",
    href: "/admin/jury",
    icon: Users,
    isImplemented: false,
    badge: "Phase 2E",
  },
  {
    label: "Scoring & Rubrics",
    href: "/admin/scoring",
    icon: Scale,
    isImplemented: false,
    badge: "Phase 2E",
  },
  {
    label: "Shortlisting",
    href: "/admin/shortlisting",
    icon: Award,
    isImplemented: false,
    badge: "Phase 2F",
  },
  {
    label: "Winners Showcase",
    href: "/admin/winners",
    icon: Trophy,
    isImplemented: false,
    badge: "Phase 2F",
  },
  {
    label: "Content / CMS",
    href: "/admin/cms",
    icon: Globe,
    isImplemented: false,
    badge: "Phase 2F",
  },
  {
    label: "Reports & Exports",
    href: "/admin/reports",
    icon: BarChart3,
    isImplemented: false,
    badge: "Phase 2F",
  },
  {
    label: "Users & Roles",
    href: "/admin/users",
    icon: ShieldAlert,
    isImplemented: false,
    badge: "Phase 2F",
  },
  {
    label: "Audit Logs",
    href: "/admin/audit-logs",
    icon: History,
    isImplemented: false,
    badge: "Phase 2F",
  },
];

export function AdminSidebar({
  userEmail,
  userRole,
  isSuperAdmin,
  onCloseMobile,
}: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-navy-950 text-slate-300 flex flex-col flex-shrink-0 min-h-screen border-r border-white/10 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-white/10">
        <Link
          href="/admin"
          className="group block space-y-1 focus-visible:outline-none"
          onClick={onCloseMobile}
        >
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-gold-400 font-bold">
              Kutchmitra
            </span>
            <span className="text-[9px] font-mono px-1.5 py-0.2 bg-gold-500/20 text-gold-300 border border-gold-500/30 uppercase">
              Admin
            </span>
          </div>
          <h1 className="font-display text-lg text-white font-medium tracking-tight group-hover:text-gold-200 transition-colors">
            Home &amp; Decor Awards <span className="text-gold-500 font-sans text-xs">2026</span>
          </h1>
          <p className="text-[10px] text-slate-400 font-mono">Award Governance Portal</p>
        </Link>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-2 pb-2 text-[10px] font-mono uppercase tracking-widest text-slate-500 font-semibold">
          Modules &amp; Operations
        </div>

        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          if (item.isImplemented) {
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={cn(
                  "flex items-center justify-between px-3 py-2 text-xs font-medium rounded transition-all duration-150 group",
                  isActive
                    ? "bg-gold-500 text-navy-950 font-semibold shadow-sm"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    size={16}
                    className={cn(
                      "flex-shrink-0 transition-colors",
                      isActive ? "text-navy-950" : "text-gold-400 group-hover:text-gold-300"
                    )}
                  />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight size={14} className="text-navy-950" />}
              </Link>
            );
          }

          // Unimplemented placeholder: visually distinct, clearly indicates upcoming phase without dead ends
          return (
            <div
              key={item.href}
              className="flex items-center justify-between px-3 py-2 text-xs text-slate-500 cursor-not-allowed select-none rounded hover:bg-white/[0.02]"
              title={`${item.label} will be enabled in ${item.badge}`}
            >
              <div className="flex items-center gap-2.5 opacity-60">
                <Icon size={16} className="flex-shrink-0 text-slate-500" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[9px] font-mono px-1.5 py-0.5 bg-white/5 text-slate-400 border border-white/10 rounded-none">
                  {item.badge}
                </span>
              )}
            </div>
          );
        })}
      </nav>

      {/* User Info & Portal Quick Switch */}
      <div className="p-4 border-t border-white/10 bg-navy-900/60 space-y-3">
        <div className="space-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              Active Admin
            </span>
            <span
              className={cn(
                "text-[9px] font-mono uppercase px-1.5 py-0.2 border",
                isSuperAdmin
                  ? "bg-purple-950/60 text-purple-300 border-purple-500/40"
                  : "bg-gold-950/60 text-gold-300 border-gold-500/40"
              )}
            >
              {userRole}
            </span>
          </div>
          <p className="text-xs font-mono text-white truncate" title={userEmail}>
            {userEmail}
          </p>
        </div>

        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1 text-slate-300 hover:text-gold-400 transition-colors"
          >
            <span>Public Site</span>
            <ExternalLink size={10} />
          </Link>
          <Link
            href="/dashboard"
            target="_blank"
            className="inline-flex items-center gap-1 text-slate-300 hover:text-gold-400 transition-colors"
          >
            <span>Applicant UI</span>
            <ExternalLink size={10} />
          </Link>
        </div>
      </div>
    </aside>
  );
}
