import React from "react";
import { cn } from "@/lib/utils";

interface DividerProps {
  className?: string;
  variant?: "subtle" | "gold" | "dark" | "architectural";
  accent?: boolean;
}

export function Divider({
  className,
  variant = "subtle",
  accent = false,
}: DividerProps) {
  const variantStyles = {
    subtle: "bg-slate-200/80",
    gold: "bg-gradient-to-r from-transparent via-gold-500/40 to-transparent",
    dark: "bg-white/10",
    architectural: "bg-navy-950/10",
  };

  if (accent) {
    return (
      <div className={cn("relative flex items-center justify-center w-full py-4", className)}>
        <div className={cn("h-px w-full", variantStyles[variant])} />
        <div className="absolute px-3 bg-inherit">
          <div className="w-1.5 h-1.5 rotate-45 border border-gold-500/60 bg-gold-500/20" />
        </div>
      </div>
    );
  }

  return <div className={cn("h-px w-full", variantStyles[variant], className)} role="separator" />;
}
