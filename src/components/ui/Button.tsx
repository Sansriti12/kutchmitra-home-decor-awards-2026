import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline-dark" | "ghost";
  size?: "sm" | "md" | "lg";
  href?: string;
  icon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", href, icon, children, ...props }, ref) => {
    const baseStyles =
      "relative inline-flex items-center justify-center font-sans font-medium tracking-wide transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none whitespace-nowrap";

    const variantStyles = {
      primary:
        "bg-gold-500 text-navy-950 hover:bg-gold-600 active:bg-gold-700 shadow-sm hover:shadow-gold",
      secondary:
        "bg-transparent text-gold-400 border border-gold-500/40 hover:border-gold-500 hover:bg-gold-500/10 active:bg-gold-500/20",
      "outline-dark":
        "bg-transparent text-navy-950 border border-navy-950/30 hover:border-navy-950 hover:bg-navy-950 hover:text-white active:bg-navy-900",
      ghost:
        "bg-transparent text-slate-700 hover:text-navy-950 hover:bg-slate-100/60 active:bg-slate-100",
    };

    const sizeStyles = {
      sm: "text-xs tracking-wider uppercase px-3.5 py-1.5 gap-1.5 min-h-[36px]",
      md: "text-sm tracking-wide px-5 py-2 gap-2 min-h-[42px]",
      lg: "text-base tracking-wide px-6 py-2.5 gap-2.5 min-h-[46px]",
    };

    const classes = cn(baseStyles, variantStyles[variant], sizeStyles[size], className);

    if (href) {
      return (
        <Link href={href} className={classes}>
          <span>{children}</span>
          {icon && <span className="transition-transform duration-300 group-hover:translate-x-0.5">{icon}</span>}
        </Link>
      );
    }

    return (
      <button ref={ref} className={classes} {...props}>
        <span>{children}</span>
        {icon && <span>{icon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";
