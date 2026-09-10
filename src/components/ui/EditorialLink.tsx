import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface EditorialLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  showArrow?: boolean;
  external?: boolean;
  theme?: "light" | "dark";
}

export function EditorialLink({
  href,
  children,
  className,
  showArrow = false,
  external = false,
  theme = "light",
}: EditorialLinkProps) {
  const isDark = theme === "dark";

  const linkProps = external
    ? { target: "_blank", rel: "noopener noreferrer" }
    : {};

  return (
    <Link
      href={href}
      {...linkProps}
      className={cn(
        "group relative inline-flex items-center gap-1.5 text-sm font-medium tracking-wide transition-colors duration-200",
        isDark ? "text-slate-300 hover:text-gold-400" : "text-navy-950 hover:text-gold-600",
        className
      )}
    >
      <span className="relative">
        {children}
        <span
          className={cn(
            "absolute -bottom-0.5 left-0 w-0 h-px transition-all duration-300 ease-out group-hover:w-full",
            isDark ? "bg-gold-400" : "bg-gold-500"
          )}
          aria-hidden="true"
        />
      </span>
      {showArrow && (
        <ArrowUpRight
          size={14}
          className={cn(
            "transition-transform duration-300 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5",
            isDark ? "text-gold-400" : "text-gold-500"
          )}
        />
      )}
    </Link>
  );
}
