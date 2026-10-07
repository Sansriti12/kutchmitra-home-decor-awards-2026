"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Mail,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Search,
  Filter,
  Eye,
  X,
  ExternalLink,
  ShieldAlert,
  Send,
  Clock,
  Sparkles,
  Inbox,
  AlertCircle,
  Check,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getAdminNotificationLogs, retryFailedNotification } from "@/lib/notifications/actions";
import type {
  AdminNotificationLogItem,
  NotificationChannel,
  NotificationStatus,
} from "@/types/notification.types";

interface AdminNotificationsClientProps {
  initialLogs: AdminNotificationLogItem[];
  initialStats: {
    total: number;
    sent: number;
    delivered: number;
    failed: number;
    unread: number;
  };
  initialPagination: {
    totalCount: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
  isSuperAdmin: boolean;
}

const EVENT_TYPE_LABELS: Record<string, { label: string; badgeClass: string }> = {
  applicant_registered: {
    label: "Registration Welcome",
    badgeClass: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },
  nomination_submitted: {
    label: "Nomination Submitted",
    badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  clarification_requested: {
    label: "Clarification Needed",
    badgeClass: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  },
  clarification_responded: {
    label: "Clarification Responded",
    badgeClass: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  },
  nomination_eligible: {
    label: "Nomination Eligible",
    badgeClass: "bg-teal-500/10 text-teal-400 border-teal-500/20",
  },
  nomination_shortlisted: {
    label: "Shortlisted Finalist",
    badgeClass: "bg-gold-500/15 text-gold-300 border-gold-500/30",
  },
  winner_published: {
    label: "Winner Published",
    badgeClass: "bg-gold-500/20 text-gold-200 border-gold-400/40 font-semibold",
  },
  nomination_status_changed: {
    label: "Status Changed",
    badgeClass: "bg-slate-500/10 text-slate-300 border-slate-500/20",
  },
  jury_assigned: {
    label: "Jury Dossier Assigned",
    badgeClass: "bg-purple-500/10 text-purple-300 border-purple-500/20",
  },
  jury_evaluation_reopened: {
    label: "Evaluation Reopened",
    badgeClass: "bg-orange-500/10 text-orange-300 border-orange-500/20",
  },
  admin_new_submission: {
    label: "Admin: New Submission",
    badgeClass: "bg-indigo-500/10 text-indigo-300 border-indigo-500/20",
  },
  admin_clarification_responded: {
    label: "Admin: Clarification Responded",
    badgeClass: "bg-cyan-500/10 text-cyan-300 border-cyan-500/20",
  },
  admin_jury_conflict: {
    label: "Admin: Jury Conflict Alert",
    badgeClass: "bg-rose-500/15 text-rose-300 border-rose-500/30",
  },
};

export default function AdminNotificationsClient({
  initialLogs,
  initialStats,
  initialPagination,
  isSuperAdmin,
}: AdminNotificationsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // State
  const [logs, setLogs] = useState<AdminNotificationLogItem[]>(initialLogs);
  const [stats, setStats] = useState(initialStats);
  const [pagination, setPagination] = useState(initialPagination);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [channelFilter, setChannelFilter] = useState("all");
  const [eventTypeFilter, setEventTypeFilter] = useState("all");

  // Interaction State
  const [selectedLog, setSelectedLog] = useState<AdminNotificationLogItem | null>(null);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Fetch / Refresh Data with Current Filters
  const loadData = (newPage: number = pagination.currentPage) => {
    startTransition(async () => {
      const res = await getAdminNotificationLogs({
        page: newPage,
        pageSize: pagination.pageSize,
        status: statusFilter,
        channel: channelFilter,
        eventType: eventTypeFilter,
        search: search.trim() || undefined,
      });

      if (res.success) {
        setLogs(res.logs);
        setStats(res.stats);
        setPagination(res.pagination);
      } else {
        setFeedback({ type: "error", text: res.error || "Failed to load notification logs." });
      }
    });
  };

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData(1);
  };

  const handleResetFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setChannelFilter("all");
    setEventTypeFilter("all");
    startTransition(async () => {
      const res = await getAdminNotificationLogs({ page: 1, pageSize: pagination.pageSize });
      if (res.success) {
        setLogs(res.logs);
        setStats(res.stats);
        setPagination(res.pagination);
      }
    });
  };

  const handleRetry = (logId: string) => {
    setRetryingId(logId);
    startTransition(async () => {
      const res = await retryFailedNotification(logId);
      setRetryingId(null);
      if (res.success) {
        setFeedback({
          type: "success",
          text: "Notification re-dispatched successfully. Refreshing log audit trail.",
        });
        loadData(pagination.currentPage);
        if (selectedLog && selectedLog.id === logId) {
          setSelectedLog((prev) => (prev ? { ...prev, status: "sent" } : null));
        }
      } else {
        setFeedback({ type: "error", text: res.error || "Failed to retry notification." });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-gold-400 uppercase tracking-wider mb-1">
            <Bell size={14} />
            <span>Phase F // Communications &amp; Delivery Diagnostics</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl text-white font-medium">
            Notifications &amp; Email Communications
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Monitor multi-channel transactional dispatches, inspect idempotency deduplication keys, and retry failed transmissions.
          </p>
        </div>

        {/* Global Action / Refresh */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => loadData(pagination.currentPage)}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-navy-800 hover:bg-navy-700 text-slate-200 border border-white/15 text-xs font-mono font-semibold uppercase tracking-wider transition-colors disabled:opacity-50"
          >
            <RefreshCw size={12} className={cn(isPending && "animate-spin text-gold-400")} />
            <span>Refresh Audit Logs</span>
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={cn(
            "p-3 text-xs font-mono flex items-center justify-between border transition-all",
            feedback.type === "success"
              ? "bg-emerald-950/70 border-emerald-500/40 text-emerald-200"
              : "bg-red-950/70 border-red-500/40 text-red-200"
          )}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? <Check size={14} /> : <AlertTriangle size={14} />}
            <span>{feedback.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-white"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* KPI Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="p-3.5 bg-navy-900/60 border border-white/10 rounded-none">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
            Total Dispatched
          </div>
          <div className="mt-1 font-display text-2xl font-bold text-white">{stats.total}</div>
          <div className="mt-0.5 text-[10px] font-mono text-slate-400">All channels combined</div>
        </div>

        <div className="p-3.5 bg-navy-900/60 border border-blue-500/20 rounded-none">
          <div className="text-[10px] font-mono text-blue-400 uppercase tracking-wider flex items-center gap-1">
            <Send size={11} />
            <span>Sent</span>
          </div>
          <div className="mt-1 font-display text-2xl font-bold text-blue-300">{stats.sent}</div>
          <div className="mt-0.5 text-[10px] font-mono text-slate-400">Dispatched to gateway</div>
        </div>

        <div className="p-3.5 bg-navy-900/60 border border-emerald-500/20 rounded-none">
          <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 size={11} />
            <span>Delivered</span>
          </div>
          <div className="mt-1 font-display text-2xl font-bold text-emerald-300">
            {stats.delivered}
          </div>
          <div className="mt-0.5 text-[10px] font-mono text-slate-400">Confirmed delivery</div>
        </div>

        <div className="p-3.5 bg-navy-900/60 border border-rose-500/30 rounded-none">
          <div className="text-[10px] font-mono text-rose-400 uppercase tracking-wider flex items-center gap-1">
            <AlertTriangle size={11} />
            <span>Failed</span>
          </div>
          <div className="mt-1 font-display text-2xl font-bold text-rose-300">{stats.failed}</div>
          <div className="mt-0.5 text-[10px] font-mono text-slate-400">Eligible for retry</div>
        </div>

        <div className="p-3.5 bg-navy-900/60 border border-amber-500/20 rounded-none col-span-2 sm:col-span-1">
          <div className="text-[10px] font-mono text-amber-400 uppercase tracking-wider flex items-center gap-1">
            <Inbox size={11} />
            <span>Unread Alerts</span>
          </div>
          <div className="mt-1 font-display text-2xl font-bold text-amber-300">{stats.unread}</div>
          <div className="mt-0.5 text-[10px] font-mono text-slate-400">In-app notifications</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <form
        onSubmit={handleFilterSubmit}
        className="p-4 bg-navy-900/50 border border-white/10 flex flex-wrap items-center gap-3"
      >
        <div className="flex-1 min-w-[200px] relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search email, recipient, subject, or nomination ID..."
            className="w-full pl-9 pr-3 py-1.5 bg-navy-950 border border-white/10 text-white text-xs font-mono placeholder:text-slate-400 focus:outline-none focus:border-gold-400"
          />
        </div>

        {/* Channel Filter */}
        <select
          value={channelFilter}
          onChange={(e) => setChannelFilter(e.target.value)}
          className="px-3 py-1.5 bg-navy-950 border border-white/10 text-slate-200 text-xs font-mono focus:outline-none focus:border-gold-400"
        >
          <option value="all">All Channels</option>
          <option value="email">Email</option>
          <option value="in_app">In-App Alert</option>
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 bg-navy-950 border border-white/10 text-slate-200 text-xs font-mono focus:outline-none focus:border-gold-400"
        >
          <option value="all">All Statuses</option>
          <option value="sent">Sent</option>
          <option value="delivered">Delivered</option>
          <option value="failed">Failed</option>
          <option value="queued">Queued</option>
          <option value="pending">Pending</option>
        </select>

        {/* Event Type Filter */}
        <select
          value={eventTypeFilter}
          onChange={(e) => setEventTypeFilter(e.target.value)}
          className="px-3 py-1.5 bg-navy-950 border border-white/10 text-slate-200 text-xs font-mono focus:outline-none focus:border-gold-400"
        >
          <option value="all">All Event Types</option>
          <option value="applicant_registered">Registration Welcome</option>
          <option value="nomination_submitted">Nomination Submitted</option>
          <option value="clarification_requested">Clarification Requested</option>
          <option value="clarification_responded">Clarification Responded</option>
          <option value="nomination_eligible">Nomination Eligible</option>
          <option value="nomination_shortlisted">Shortlisted Finalist</option>
          <option value="winner_published">Winner Published</option>
          <option value="nomination_status_changed">Status Changed</option>
          <option value="jury_assigned">Jury Assigned</option>
          <option value="jury_evaluation_reopened">Evaluation Reopened</option>
          <option value="admin_jury_conflict">Admin: Jury Conflict</option>
        </select>

        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-1.5 bg-gold-500 hover:bg-gold-400 text-navy-950 text-xs font-mono font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
        >
          Filter
        </button>

        <button
          type="button"
          onClick={handleResetFilters}
          className="px-3 py-1.5 bg-navy-800 hover:bg-navy-700 text-slate-300 border border-white/10 text-xs font-mono transition-colors"
        >
          Reset
        </button>
      </form>

      {/* Notifications Data Table */}
      <div className="bg-navy-900/60 border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-navy-950/80 text-slate-400 text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Created</th>
                <th className="py-3 px-4">Recipient</th>
                <th className="py-3 px-4">Event / Trigger</th>
                <th className="py-3 px-4">Nomination</th>
                <th className="py-3 px-4">Channel</th>
                <th className="py-3 px-4">Subject &amp; Body</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Inbox size={32} className="mx-auto mb-2 text-slate-400" />
                    <div>No notification records found matching criteria.</div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Try resetting filters or initiating a test nomination workflow.
                    </div>
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const eventInfo =
                    EVENT_TYPE_LABELS[log.eventType] || {
                      label: log.eventType,
                      badgeClass: "bg-slate-500/10 text-slate-300 border-slate-500/20",
                    };

                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-white/[0.02] transition-colors group"
                    >
                      {/* Created At */}
                      <td className="py-3 px-4 text-slate-400 whitespace-nowrap text-[11px]">
                        <div>{new Date(log.createdAt).toLocaleDateString("en-GB")}</div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(log.createdAt).toLocaleTimeString("en-GB", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </td>

                      {/* Recipient */}
                      <td className="py-3 px-4">
                        <div className="text-white font-medium truncate max-w-[180px]">
                          {log.recipientName || log.recipientEmail}
                        </div>
                        {log.recipientName && (
                          <div className="text-[10px] text-slate-400 truncate max-w-[180px]">
                            {log.recipientEmail}
                          </div>
                        )}
                      </td>

                      {/* Event / Trigger */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={cn(
                            "inline-flex items-center px-2 py-0.5 text-[10px] font-mono border rounded-none",
                            eventInfo.badgeClass
                          )}
                        >
                          {eventInfo.label}
                        </span>
                      </td>

                      {/* Nomination ID */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {log.nominationId ? (
                          <span className="font-mono text-[11px] text-gold-400 font-medium">
                            {log.nominationId}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[10px]">—</span>
                        )}
                      </td>

                      {/* Channel */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {log.channel === "email" ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-blue-300">
                            <Mail size={12} />
                            <span>Email</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-amber-300">
                            <Bell size={12} />
                            <span>In-App</span>
                          </span>
                        )}
                      </td>

                      {/* Subject & Preview */}
                      <td className="py-3 px-4 max-w-[280px]">
                        <div className="text-slate-200 truncate font-sans text-xs">
                          {log.subject || "Notification"}
                        </div>
                        <div className="text-slate-400 text-[11px] truncate font-sans">
                          {log.body}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {log.status === "delivered" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 size={10} />
                            <span>Delivered</span>
                          </span>
                        )}
                        {log.status === "sent" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            <Send size={10} />
                            <span>Sent</span>
                          </span>
                        )}
                        {log.status === "failed" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] bg-rose-500/15 text-rose-300 border border-rose-500/30">
                            <AlertTriangle size={10} />
                            <span>Failed</span>
                          </span>
                        )}
                        {log.status === "queued" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                            <Clock size={10} />
                            <span>Queued</span>
                          </span>
                        )}
                        {log.status === "pending" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/20">
                            <Clock size={10} />
                            <span>Pending</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedLog(log)}
                            className="p-1.5 text-slate-400 hover:text-gold-400 hover:bg-white/5 transition-colors"
                            title="Inspect Details"
                          >
                            <Eye size={13} />
                          </button>

                          {log.status === "failed" && (
                            <button
                              type="button"
                              onClick={() => handleRetry(log.id)}
                              disabled={retryingId === log.id || isPending}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-[10px] font-mono transition-colors disabled:opacity-50"
                              title="Retry Dispatch"
                            >
                              <RotateCw
                                size={10}
                                className={cn(retryingId === log.id && "animate-spin")}
                              />
                              <span>Retry</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-3 bg-navy-950/80 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-slate-400">
          <div>
            Showing{" "}
            <span className="text-white">
              {logs.length > 0 ? (pagination.currentPage - 1) * pagination.pageSize + 1 : 0}
            </span>{" "}
            to{" "}
            <span className="text-white">
              {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalCount)}
            </span>{" "}
            of <span className="text-white">{pagination.totalCount}</span> dispatches
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => loadData(pagination.currentPage - 1)}
              disabled={pagination.currentPage <= 1 || isPending}
              className="p-1.5 bg-navy-900 border border-white/10 text-slate-300 hover:text-white disabled:opacity-30 transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="px-2.5 py-1 text-[11px] text-gold-400">
              Page {pagination.currentPage} of {Math.max(1, pagination.totalPages)}
            </span>
            <button
              type="button"
              onClick={() => loadData(pagination.currentPage + 1)}
              disabled={pagination.currentPage >= pagination.totalPages || isPending}
              className="p-1.5 bg-navy-900 border border-white/10 text-slate-300 hover:text-white disabled:opacity-30 transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Inspect Diagnostic Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm">
          <div className="bg-navy-900 border border-white/15 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Bell size={16} className="text-gold-400" />
                <h3 className="font-display text-lg text-white font-medium">
                  Dispatch Diagnostic Audit
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs font-mono">
              {/* Status Header */}
              <div className="flex items-center justify-between p-3 bg-navy-950 border border-white/10">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Status</div>
                  <div className="font-bold text-white uppercase mt-0.5">
                    {selectedLog.status}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Channel</div>
                  <div className="text-white mt-0.5 uppercase">{selectedLog.channel}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Provider</div>
                  <div className="text-white mt-0.5">{selectedLog.provider || "resend"}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">In-App Read</div>
                  <div className="text-white mt-0.5">
                    {selectedLog.isRead ? "Read" : "Unread"}
                  </div>
                </div>
              </div>

              {/* Error Message Alert */}
              {selectedLog.errorMessage && (
                <div className="p-3 bg-rose-950/70 border border-rose-500/40 text-rose-200">
                  <div className="flex items-center gap-1.5 font-bold text-rose-300 mb-1">
                    <AlertCircle size={14} />
                    <span>Dispatch Error Message:</span>
                  </div>
                  <div className="break-all font-mono text-[11px]">
                    {selectedLog.errorMessage}
                  </div>
                </div>
              )}

              {/* Technical Audit Properties */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-navy-950/60 border border-white/10">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Dispatch ID</div>
                  <div className="text-slate-300 break-all select-all">{selectedLog.id}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Idempotency Key</div>
                  <div className="text-gold-400 break-all select-all">
                    {selectedLog.idempotencyKey || "N/A"}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Recipient Address</div>
                  <div className="text-slate-300 break-all select-all">
                    {selectedLog.recipientEmail}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Nomination Reference</div>
                  <div className="text-slate-300 font-bold">
                    {selectedLog.nominationId || "None"}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Provider Message ID</div>
                  <div className="text-slate-300 break-all select-all">
                    {selectedLog.providerMessageId || "N/A"}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Created Timestamp</div>
                  <div className="text-slate-300">
                    {new Date(selectedLog.createdAt).toLocaleString("en-GB")}
                  </div>
                </div>
              </div>

              {/* Subject */}
              <div>
                <div className="text-[10px] text-slate-400 uppercase mb-1">Subject</div>
                <div className="p-2.5 bg-navy-950 border border-white/10 text-white font-sans text-sm">
                  {selectedLog.subject || "No Subject"}
                </div>
              </div>

              {/* Body Content */}
              <div>
                <div className="text-[10px] text-slate-400 uppercase mb-1">Message Body</div>
                <div className="p-3 bg-navy-950 border border-white/10 text-slate-200 font-sans text-xs whitespace-pre-line leading-relaxed max-h-60 overflow-y-auto">
                  {selectedLog.body}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
              <div>
                {selectedLog.status === "failed" && (
                  <button
                    type="button"
                    onClick={() => handleRetry(selectedLog.id)}
                    disabled={retryingId === selectedLog.id || isPending}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-500 hover:bg-rose-400 text-white text-xs font-mono font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
                  >
                    <RotateCw
                      size={12}
                      className={cn(retryingId === selectedLog.id && "animate-spin")}
                    />
                    <span>Retry Dispatch Now</span>
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-navy-800 hover:bg-navy-700 text-slate-300 border border-white/10 text-xs font-mono transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
