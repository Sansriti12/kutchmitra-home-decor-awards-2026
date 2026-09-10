import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ImageWrapperProps {
  src?: string;
  alt: string;
  aspectRatio?: "16/9" | "16/10" | "4/3" | "1/1" | "3/4";
  className?: string;
  caption?: string;
  priority?: boolean;
}

export function ImageWrapper({
  src,
  alt,
  aspectRatio = "16/10",
  className,
  caption,
  priority = false,
}: ImageWrapperProps) {
  const aspectClasses = {
    "16/9": "aspect-[16/9]",
    "16/10": "aspect-[16/10]",
    "4/3": "aspect-[4/3]",
    "1/1": "aspect-[1/1]",
    "3/4": "aspect-[3/4]",
  };

  return (
    <figure className={cn("group relative block w-full overflow-hidden", className)}>
      <div
        className={cn(
          "relative w-full overflow-hidden bg-navy-900/10 border border-navy-950/10 transition-all duration-500",
          aspectClasses[aspectRatio]
        )}
      >
        {src ? (
          <Image
            src={src}
            alt={alt}
            fill
            priority={priority}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-navy-950 via-navy-900 to-navy-850 text-slate-400">
            {/* Subtle architectural framing grid lines */}
            <div className="absolute inset-3 border border-white/5 pointer-events-none" />
            <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-gold-500/30 to-transparent" />
            <div className="space-y-2">
              <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-gold-400/70">
                Architectural Imagery
              </span>
              <p className="text-xs text-slate-400 font-sans max-w-[200px] leading-relaxed">
                {alt || "Curated project photograph"}
              </p>
            </div>
          </div>
        )}

        {/* Architectural hairline inner border */}
        <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-black/5" />
      </div>

      {caption && (
        <figcaption className="mt-2.5 flex items-center justify-between text-xs text-slate-500 font-sans tracking-wide">
          <span>{caption}</span>
          <span className="w-4 h-px bg-gold-500/40 ml-2" />
        </figcaption>
      )}
    </figure>
  );
}
