"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Menu,
  LogOut,
  Shield,
  Award,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface AdminHeaderProps {
  userEmail: string;
  userName?: string;
  userRole: string;
  isSuperAdmin: boolean;
  onOpenMobileMenu?: () => void;
}

export function AdminHeader({
  userEmail,
  userName,
  userRole,
  isSuperAdmin,
  onOpenMobileMenu,
}: AdminHeaderProps) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      const supabase = createClient();
      await supabase.auth.signOut();
      window.location.href = "/admin/login";
    } catch (err) {
      console.error("Admin logout error:", err);
      window.location.href = "/admin/login";
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-navy-950/95 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 flex items-center justify-between gap-4 select-none">
      {/* Left: Mobile hamburger & breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 text-slate-300 hover:text-white hover:bg-white/5 border border-white/10 rounded transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold-500"
          aria-label="Open navigation sidebar"
        >
          <Menu size={18} />
        </button>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-slate-400 hidden sm:inline">Governance</span>
          <span className="text-slate-600 hidden sm:inline">/</span>
          <span className="text-gold-400 font-semibold uppercase tracking-wider">
            Admin Portal
          </span>
          <span className="hidden md:inline-flex items-center gap-1 ml-2 px-2 py-0.5 rounded-none bg-gold-500/10 border border-gold-500/30 text-gold-300 text-[10px] tracking-wider uppercase">
            <Award size={10} className="text-gold-400" />
            2026 Edition
          </span>
        </div>
      </div>

      {/* Right: Active user & Logout */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* User identification */}
        <div className="flex items-center gap-2.5 text-right">
          <div className="hidden sm:block">
            <div className="text-xs font-medium text-white leading-tight">
              {userName || userEmail}
            </div>
            <div className="text-[10px] font-mono text-slate-400 truncate max-w-[200px]">
              {userEmail}
            </div>
          </div>
          <span
            className={cn(
              "inline-flex items-center gap-1 text-[10px] font-mono uppercase px-2 py-0.5 border font-semibold",
              isSuperAdmin
                ? "bg-purple-950/70 text-purple-300 border-purple-500/40"
                : "bg-gold-950/70 text-gold-300 border-gold-500/40"
            )}
          >
            <Shield size={10} />
            <span>{userRole}</span>
          </span>
        </div>

        {/* Separator */}
        <div className="h-6 w-px bg-white/10 hidden sm:block" />

        {/* Logout action */}
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase tracking-wider text-slate-300 hover:text-red-400 hover:bg-red-950/30 border border-white/10 hover:border-red-500/40 rounded transition-all duration-150 disabled:opacity-50"
          title="Sign out of Admin Portal"
        >
          {loggingOut ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <LogOut size={13} />
          )}
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
