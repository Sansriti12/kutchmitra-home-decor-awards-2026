import React from "react";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAdminApplications } from "@/lib/admin/actions";
import AdminApplicationsClient from "@/components/admin/AdminApplicationsClient";

export const dynamic = "force-dynamic";

interface ApplicationsPageProps {
  searchParams: {
    page?: string;
    pageSize?: string;
    search?: string;
    category?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: string;
  };
}

export default async function AdminApplicationsPage({ searchParams }: ApplicationsPageProps) {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login?redirect=/admin/applications");
  }

  const page = parseInt(searchParams.page || "1", 10) || 1;
  const pageSize = parseInt(searchParams.pageSize || "10", 10) || 10;
  const search = searchParams.search || "";
  const category = searchParams.category || "all";
  const status = searchParams.status || "all";
  const sortBy = (searchParams.sortBy as any) || "created_at";
  const sortOrder = (searchParams.sortOrder as any) || "desc";

  const adminClient = createAdminClient();

  // Parallel fetch: applications data and all 13 active categories
  const [appsResult, categoriesRes] = await Promise.all([
    getAdminApplications({
      page,
      pageSize,
      search,
      category,
      status,
      sortBy,
      sortOrder,
    }),
    adminClient
      .from("categories")
      .select("id, code, name, slug")
      .eq("is_active", true)
      .order("display_order"),
  ]);

  const categories = categoriesRes.data || [];

  return (
    <div className="space-y-6 animate-fade-up">
      <AdminApplicationsClient
        initialApplications={appsResult.applications}
        categories={categories}
        statusCounts={appsResult.statusCounts}
        totalCount={appsResult.pagination.totalCount}
        totalPages={appsResult.pagination.totalPages}
        currentPage={appsResult.pagination.currentPage}
        pageSize={appsResult.pagination.pageSize}
        currentSearch={search}
        currentCategory={category}
        currentStatus={status}
        currentSortBy={sortBy}
        currentSortOrder={sortOrder}
      />
    </div>
  );
}
