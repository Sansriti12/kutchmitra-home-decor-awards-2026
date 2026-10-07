import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Deterministically formats an ISO date string (e.g. "2025-12-02") or Date object to "DD/MM/YYYY".
 * Bypasses system/browser locale and timezone divergence so server-rendered HTML matches client hydration identically.
 */
export function formatDeterministicDate(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return "";

  if (typeof dateInput === "string") {
    const trimmed = dateInput.trim();
    // Fast path: "YYYY-MM-DD" or starts with "YYYY-MM-DD"
    const match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const [, year, month, day] = match;
      return `${day}/${month}/${year}`;
    }
  }

  const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return String(dateInput);

  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const year = d.getUTCFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Deterministically formats an ISO timestamp to "DD/MM/YYYY at HH:MM UTC"
 * ensuring identical output between server SSR and browser client hydration.
 */
export function formatDeterministicDateTime(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return "";
  const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return String(dateInput);

  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const year = d.getUTCFullYear();
  const hours = String(d.getUTCHours()).padStart(2, "0");
  const mins = String(d.getUTCMinutes()).padStart(2, "0");
  return `${day}/${month}/${year} at ${hours}:${mins} UTC`;
}

/**
 * Deterministically formats numbers with standard comma thousand separators (e.g. "1,500"),
 * avoiding locale-dependent formatting differences.
 */
export function formatDeterministicNumber(val: number | string | null | undefined): string {
  if (val === null || val === undefined || val === "") return "";
  const num = typeof val === "number" ? val : Number(val);
  if (isNaN(num)) return String(val);
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

