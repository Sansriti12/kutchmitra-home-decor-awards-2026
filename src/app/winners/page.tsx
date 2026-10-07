import React from "react";
import type { Metadata } from "next";
import { getPublicWinners } from "@/lib/winners/public-actions";
import WinnersShowcaseClient from "@/components/winners/WinnersShowcaseClient";

export const metadata: Metadata = {
  title: "Winners Showcase | Kutchmitra Home & Decor Awards 2026",
  description: "Official published winners and project showcase for the Kutchmitra Home & Decor Awards 2026.",
};

export const dynamic = "force-dynamic";

export default async function WinnersPage() {
  const { winners, categories } = await getPublicWinners();

  return (
    <WinnersShowcaseClient
      initialWinners={winners}
      categories={categories}
    />
  );
}
