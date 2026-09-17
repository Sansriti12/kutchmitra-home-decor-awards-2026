"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Layers,
  Search,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createDraftApplication } from "@/lib/nominations/actions";
import type { CategoryOption } from "./Step2Category";

interface CategorySelectorClientProps {
  categories: CategoryOption[];
}

export default function CategorySelectorClient({
  categories,
}: CategorySelectorClientProps) {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [loadingCategoryId, setLoadingCategoryId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const filteredCategories = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.includes(searchQuery) ||
      c.short_description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStartNomination = async (categoryId: string) => {
    setLoadingCategoryId(categoryId);
    setErrorMsg(null);

    try {
      const res = await createDraftApplication(categoryId);

      if (res.success && res.applicationId) {
        router.push(`/dashboard/nominations/${res.applicationId}`);
      } else {
        setErrorMsg(res.error || "Failed to initialize nomination draft.");
        setLoadingCategoryId(null);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
      setLoadingCategoryId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F1EA] pb-24">
      {/* Top Navigation */}
      <div className="bg-[#FBFAF7] border-b border-navy-900/10 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-500 hover:text-navy-900 transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Back to Dashboard</span>
          </Link>
          <span className="font-mono text-xs text-gold-700 bg-gold-500/10 px-2.5 py-1 border border-gold-500/20 font-semibold">
            2026 Awards Cycle
          </span>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-8">
        {/* Title Header */}
        <div className="max-w-3xl space-y-3">
          <span className="text-[10px] font-mono uppercase tracking-widest text-gold-700 bg-gold-500/10 px-2.5 py-1 border border-gold-500/20 font-semibold inline-block">
            Step 1: Category Selection
          </span>
          <h1 className="font-display text-3xl sm:text-4xl text-navy-900 font-bold">
            Select an Award Category
          </h1>
          <p className="text-sm text-[#4A4F5C] leading-relaxed">
            Select the category that best represents your architectural intervention, interior craftsmanship,
            or spatial design achievement. A new resumable draft entry will be initialized immediately.
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-mono flex items-center gap-2">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Search Bar */}
        <div className="max-w-md relative">
          <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search categories by title, keyword, or #number..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-navy-900/15 text-navy-900 text-xs focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20 shadow-2xs transition-colors"
          />
        </div>

        {/* Categories Grid (13 Approved Categories) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((cat) => {
            const isLoading = loadingCategoryId === cat.id;

            return (
              <div
                key={cat.id}
                className="bg-[#FBFAF7] border border-navy-900/10 p-6 shadow-card hover:border-gold-500/40 hover:shadow-card-hover transition-all flex flex-col justify-between gap-6"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-gold-800 bg-gold-500/15 border border-gold-500/30 px-2.5 py-0.5 uppercase tracking-widest">
                      #{cat.code}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-emerald-200">
                      Open for Nominations
                    </span>
                  </div>

                  <h3 className="font-display text-xl text-navy-900 font-bold leading-snug">
                    {cat.name}
                  </h3>

                  <p className="text-xs text-[#4A4F5C] leading-relaxed line-clamp-3">
                    {cat.short_description}
                  </p>

                  {cat.eligibility_criteria && (
                    <div className="pt-2 text-[11px] text-slate-500 border-t border-navy-900/5">
                      <span className="font-mono font-semibold text-navy-900 text-[10px] uppercase block">
                        Eligibility:
                      </span>
                      <p className="line-clamp-2">{cat.eligibility_criteria}</p>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-navy-900/10">
                  <Button
                    onClick={() => handleStartNomination(cat.id)}
                    variant="primary"
                    size="sm"
                    disabled={isLoading || loadingCategoryId !== null}
                    icon={
                      isLoading ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <ArrowRight size={13} />
                      )
                    }
                    className="w-full justify-center"
                  >
                    {isLoading ? "Initializing Draft..." : "Start Nomination"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredCategories.length === 0 && (
          <div className="p-12 text-center bg-[#FBFAF7] border border-navy-900/10 space-y-2">
            <p className="text-sm font-display text-navy-900">
              No categories match "{searchQuery}"
            </p>
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="text-xs font-mono text-gold-700 underline"
            >
              Clear search query
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
