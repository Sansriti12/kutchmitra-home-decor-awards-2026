import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Portal | Kutchmitra Home & Decor Awards 2026",
  description:
    "Official award governance, nomination evaluation, and administration portal for Kutchmitra Home & Decor Awards 2026.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#060B18] text-slate-100 antialiased font-sans flex flex-col">
      {children}
    </div>
  );
}
