import React from "react";
import { cn } from "@/lib/utils";

interface SectionMarkerProps {
  number?: string;
  label: string;
  className?: string;
  theme?: "dark" | "light";
}

export function SectionMarker({
  number,
  label,
  className,
  theme = "light",
}: SectionMarkerProps) {
  const isDark = theme === "dark";

  return (
    <div className={cn("inline-flex items-center gap-3 select-none", className)}>
      {number && (
        <span
          className={cn(
            "font-mono text-xs font-semibold px-2 py-0.5 tracking-wider border",
            isDark
              ? "text-gold-400 bg-navy-900 border-gold-500/30"
              : "text-gold-600 bg-sand-100 border-gold-500/30"
          )}
        >
          {number}
        </span>
      )}
      <span
        className={cn(
          "text-xs font-semibold tracking-[0.2em] uppercase font-mono",
          isDark ? "text-gold-400" : "text-gold-600"
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          "w-8 h-px",
          isDark ? "bg-gold-500/30" : "bg-gold-500/40"
        )}
        aria-hidden="true"
      />
    </div>
  );
}
