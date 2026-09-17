"use client";

import React, { useState, useEffect } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";
import { X } from "lucide-react";

interface AdminShellProps {
  userEmail: string;
  userName?: string;
  userRole: string;
  isSuperAdmin: boolean;
  children: React.ReactNode;
}

export function AdminShell({
  userEmail,
  userName,
  userRole,
  isSuperAdmin,
  children,
}: AdminShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  return (
    <div className="min-h-screen bg-[#060B18] text-slate-100 flex flex-row antialiased font-sans selection:bg-gold-500 selection:text-navy-950">
      {/* Desktop Persistent Sidebar */}
      <div className="hidden lg:block sticky top-0 h-screen z-40">
        <AdminSidebar
          userEmail={userEmail}
          userRole={userRole}
          isSuperAdmin={isSuperAdmin}
        />
      </div>

      {/* Mobile Drawer Backdrop & Overlay */}
      {mobileMenuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Admin Navigation Menu"
          className="lg:hidden fixed inset-0 z-50 flex"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Sidebar */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-navy-950 shadow-2xl z-10 animate-fade-up">
            <div className="absolute top-4 right-4 z-20">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded"
                aria-label="Close admin menu"
              >
                <X size={16} />
              </button>
            </div>
            <div className="h-full overflow-y-auto">
              <AdminSidebar
                userEmail={userEmail}
                userRole={userRole}
                isSuperAdmin={isSuperAdmin}
                onCloseMobile={() => setMobileMenuOpen(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#070D1F]">
        <AdminHeader
          userEmail={userEmail}
          userName={userName}
          userRole={userRole}
          isSuperAdmin={isSuperAdmin}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
