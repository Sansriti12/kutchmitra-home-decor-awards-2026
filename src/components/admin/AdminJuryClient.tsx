"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  UserCheck,
  UserPlus,
  FileCheck,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Edit2,
  Trash2,
  Search,
  Filter,
  Plus,
  RotateCcw,
  Eye,
  Shield,
  Briefcase,
  Building,
  Mail,
  Lock,
  ChevronRight,
  Info,
  Award,
} from "lucide-react";
import { cn, formatDeterministicDate } from "@/lib/utils";
import {
  createJuryMember,
  updateJuryMember,
  toggleJuryMemberStatus,
  assignApplicationToJury,
  removeJuryAssignment,
  reopenJuryEvaluation,
} from "@/lib/jury/actions";
import type {
  JuryMemberItem,
  JuryAssignmentItem,
} from "@/types/jury.types";

interface AdminJuryClientProps {
  initialData: {
    stats: {
      totalJuryMembers: number;
      activeJuryMembers: number;
      totalAssignments: number;
      completedEvaluations: number;
      pendingEvaluations: number;
      conflictsDeclared: number;
    };
    juryMembers: JuryMemberItem[];
    assignments: JuryAssignmentItem[];
    eligibleApplications: Array<{
      id: string;
      nominationId: string;
      projectName: string;
      projectCity: string;
      status: string;
      category: {
        id: string;
        code: string;
        name: string;
        slug: string;
      } | null;
    }>;
  };
  currentUserEmail: string;
  isSuperAdmin: boolean;
}

export default function AdminJuryClient({
  initialData,
  currentUserEmail,
  isSuperAdmin,
}: AdminJuryClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [activeTab, setActiveTab] = useState<"members" | "assignments" | "monitoring">("members");

  // State
  const [juryMembers, setJuryMembers] = useState(initialData.juryMembers);
  const [assignments, setAssignments] = useState(initialData.assignments);
  const [eligibleApps, setEligibleApps] = useState(initialData.eligibleApplications);
  const [stats, setStats] = useState(initialData.stats);

  // Filters
  const [memberSearch, setMemberSearch] = useState("");
  const [memberStatusFilter, setMemberStatusFilter] = useState<"all" | "active" | "inactive">("all");

  const [assignmentSearch, setAssignmentSearch] = useState("");
  const [assignmentJurorFilter, setAssignmentJurorFilter] = useState("all");
  const [assignmentStatusFilter, setAssignmentStatusFilter] = useState("all");

  // Modals
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [editingMember, setEditingMember] = useState<JuryMemberItem | null>(null);
  const [viewingAssignment, setViewingAssignment] = useState<JuryAssignmentItem | null>(null);
  const [reopeningEvalId, setReopeningEvalId] = useState<string | null>(null);
  const [reopenReason, setReopenReason] = useState("");

  // Form states
  const [newMemberForm, setNewMemberForm] = useState({
    fullName: "",
    email: "",
    password: "",
    honorific: "Ar.",
    organization: "",
    designation: "",
    bio: "",
    isPublic: false,
  });

  const [assignForm, setAssignForm] = useState({
    applicationId: "",
    juryProfileId: "",
  });

  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Handlers
  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackMsg(null);

    startTransition(async () => {
      const res = await createJuryMember(newMemberForm);
      if (res.success) {
        setFeedbackMsg({ type: "success", text: `Jury member ${newMemberForm.fullName} appointed successfully.` });
        setShowAddMemberModal(false);
        setNewMemberForm({
          fullName: "",
          email: "",
          password: "",
          honorific: "Ar.",
          organization: "",
          designation: "",
          bio: "",
          isPublic: false,
        });
        router.refresh();
      } else {
        setFeedbackMsg({ type: "error", text: res.error || "Failed to create jury member." });
      }
    });
  };

  const handleUpdateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    setFeedbackMsg(null);

    startTransition(async () => {
      const res = await updateJuryMember(editingMember.id, {
        fullName: editingMember.fullName,
        honorific: editingMember.honorific || undefined,
        organization: editingMember.organization || undefined,
        designation: editingMember.designation || undefined,
        bio: editingMember.bio || undefined,
        isPublic: editingMember.isPublic,
      });

      if (res.success) {
        setFeedbackMsg({ type: "success", text: `Updated ${editingMember.fullName} successfully.` });
        setEditingMember(null);
        router.refresh();
      } else {
        setFeedbackMsg({ type: "error", text: res.error || "Failed to update member." });
      }
    });
  };

  const handleToggleMember = async (userId: string, currentActive: boolean) => {
    startTransition(async () => {
      const res = await toggleJuryMemberStatus(userId, !currentActive);
      if (res.success) {
        router.refresh();
      } else {
        setFeedbackMsg({ type: "error", text: res.error || "Failed to toggle status." });
      }
    });
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignForm.applicationId || !assignForm.juryProfileId) {
      setFeedbackMsg({ type: "error", text: "Please select both a nomination and a jury member." });
      return;
    }

    startTransition(async () => {
      const res = await assignApplicationToJury(assignForm.applicationId, assignForm.juryProfileId);
      if (res.success) {
        setFeedbackMsg({ type: "success", text: "Nomination successfully assigned to juror." });
        setShowAssignModal(false);
        setAssignForm({ applicationId: "", juryProfileId: "" });
        router.refresh();
      } else {
        setFeedbackMsg({ type: "error", text: res.error || "Failed to assign nomination." });
      }
    });
  };

  const handleRemoveAssignment = async (assignmentId: string, nomId: string) => {
    if (!confirm(`Are you sure you want to remove the assignment for ${nomId}?`)) return;

    startTransition(async () => {
      const res = await removeJuryAssignment(assignmentId);
      if (res.success) {
        setFeedbackMsg({ type: "success", text: `Assignment for ${nomId} removed successfully.` });
        router.refresh();
      } else {
        setFeedbackMsg({ type: "error", text: res.error || "Failed to remove assignment." });
      }
    });
  };

  const handleReopenEval = async () => {
    if (!reopeningEvalId || !reopenReason.trim()) {
      alert("A reason is mandatory for reopening a locked evaluation.");
      return;
    }

    startTransition(async () => {
      const res = await reopenJuryEvaluation(reopeningEvalId, reopenReason);
      if (res.success) {
        setFeedbackMsg({ type: "success", text: "Evaluation reopened successfully. Juror may now edit." });
        setReopeningEvalId(null);
        setReopenReason("");
        router.refresh();
      } else {
        setFeedbackMsg({ type: "error", text: res.error || "Failed to reopen evaluation." });
      }
    });
  };

  // Filtered members
  const filteredMembers = juryMembers.filter((m) => {
    const matchesSearch =
      m.fullName.toLowerCase().includes(memberSearch.toLowerCase()) ||
      m.email.toLowerCase().includes(memberSearch.toLowerCase()) ||
      (m.organization || "").toLowerCase().includes(memberSearch.toLowerCase());

    const matchesStatus =
      memberStatusFilter === "all"
        ? true
        : memberStatusFilter === "active"
        ? m.isActive
        : !m.isActive;

    return matchesSearch && matchesStatus;
  });

  // Filtered assignments
  const filteredAssignments = assignments.filter((a) => {
    const matchesSearch =
      a.nominationId.toLowerCase().includes(assignmentSearch.toLowerCase()) ||
      a.projectName.toLowerCase().includes(assignmentSearch.toLowerCase()) ||
      (a.juror?.fullName || "").toLowerCase().includes(assignmentSearch.toLowerCase());

    const matchesJuror =
      assignmentJurorFilter === "all" ? true : a.juryProfileId === assignmentJurorFilter;

    const matchesStatus =
      assignmentStatusFilter === "all"
        ? true
        : assignmentStatusFilter === "conflict"
        ? a.conflictDeclared
        : a.status === assignmentStatusFilter;

    return matchesSearch && matchesJuror && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner / Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-gold-400 uppercase tracking-wider mb-1">
            <Shield size={14} />
            <span>Award Governance // Phase D</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl text-white font-medium">
            Grand Jury Management &amp; Assignments
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-sans mt-1">
            Appoint independent design authorities, allocate eligible nominations, enforce conflict of interest protocols, and monitor confidential criteria assessments.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => setShowAddMemberModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gold-500 hover:bg-gold-400 text-navy-950 text-xs font-mono font-bold uppercase tracking-wider transition-colors shadow-sm"
          >
            <UserPlus size={14} />
            <span>Appoint Juror</span>
          </button>
          <button
            type="button"
            onClick={() => setShowAssignModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-navy-900 hover:bg-navy-800 text-white border border-gold-500/40 text-xs font-mono font-medium uppercase tracking-wider transition-colors"
          >
            <Plus size={14} className="text-gold-400" />
            <span>Assign Nomination</span>
          </button>
        </div>
      </div>

      {/* Feedback banner */}
      {feedbackMsg && (
        <div
          className={cn(
            "p-3 rounded text-xs font-mono flex items-center justify-between",
            feedbackMsg.type === "success"
              ? "bg-emerald-950/80 border border-emerald-500/40 text-emerald-300"
              : "bg-red-950/80 border border-red-500/40 text-red-300"
          )}
        >
          <span>{feedbackMsg.text}</span>
          <button
            type="button"
            onClick={() => setFeedbackMsg(null)}
            className="text-slate-400 hover:text-white ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* KPI Metric Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 bg-navy-900/80 border border-white/10 space-y-1">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Jury Panel</span>
            <Users size={12} className="text-gold-400" />
          </div>
          <div className="text-2xl font-mono font-bold text-white">{stats.totalJuryMembers}</div>
          <div className="text-[10px] font-mono text-slate-400">{stats.activeJuryMembers} Active</div>
        </div>

        <div className="p-4 bg-navy-900/80 border border-white/10 space-y-1">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Assignments</span>
            <FileCheck size={12} className="text-blue-400" />
          </div>
          <div className="text-2xl font-mono font-bold text-white">{stats.totalAssignments}</div>
          <div className="text-[10px] font-mono text-slate-400">Total Allocated</div>
        </div>

        <div className="p-4 bg-navy-900/80 border border-white/10 space-y-1">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Completed</span>
            <CheckCircle2 size={12} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-mono font-bold text-emerald-300">{stats.completedEvaluations}</div>
          <div className="text-[10px] font-mono text-emerald-400/70">Locked &amp; Scored</div>
        </div>

        <div className="p-4 bg-navy-900/80 border border-white/10 space-y-1">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Pending</span>
            <Clock size={12} className="text-amber-400" />
          </div>
          <div className="text-2xl font-mono font-bold text-amber-300">{stats.pendingEvaluations}</div>
          <div className="text-[10px] font-mono text-slate-400">Awaiting Submission</div>
        </div>

        <div className="p-4 bg-navy-900/80 border border-white/10 space-y-1">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Conflicts</span>
            <AlertTriangle size={12} className="text-red-400" />
          </div>
          <div className="text-2xl font-mono font-bold text-red-300">{stats.conflictsDeclared}</div>
          <div className="text-[10px] font-mono text-red-400/70">Recusals Logged</div>
        </div>

        <div className="p-4 bg-navy-900/80 border border-white/10 space-y-1">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Jury-Ready</span>
            <Award size={12} className="text-gold-400" />
          </div>
          <div className="text-2xl font-mono font-bold text-gold-300">{eligibleApps.length}</div>
          <div className="text-[10px] font-mono text-slate-400">Eligible Nominations</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("members")}
          className={cn(
            "px-4 py-2.5 text-xs font-mono uppercase tracking-wider transition-colors border-b-2 -mb-px flex items-center gap-2",
            activeTab === "members"
              ? "border-gold-500 text-gold-400 font-bold bg-white/5"
              : "border-transparent text-slate-400 hover:text-white"
          )}
        >
          <Users size={14} />
          <span>Appointed Jurors ({juryMembers.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("assignments")}
          className={cn(
            "px-4 py-2.5 text-xs font-mono uppercase tracking-wider transition-colors border-b-2 -mb-px flex items-center gap-2",
            activeTab === "assignments"
              ? "border-gold-500 text-gold-400 font-bold bg-white/5"
              : "border-transparent text-slate-400 hover:text-white"
          )}
        >
          <FileCheck size={14} />
          <span>Nomination Assignments ({assignments.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("monitoring")}
          className={cn(
            "px-4 py-2.5 text-xs font-mono uppercase tracking-wider transition-colors border-b-2 -mb-px flex items-center gap-2",
            activeTab === "monitoring"
              ? "border-gold-500 text-gold-400 font-bold bg-white/5"
              : "border-transparent text-slate-400 hover:text-white"
          )}
        >
          <CheckCircle2 size={14} />
          <span>Evaluation Monitoring ({stats.completedEvaluations})</span>
        </button>
      </div>

      {/* TAB 1: JURY MEMBERS */}
      {activeTab === "members" && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-navy-900/60 p-3 border border-white/10">
            <div className="relative w-full sm:w-80">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                placeholder="Search juror by name, organization, email..."
                className="w-full pl-9 pr-3 py-1.5 bg-navy-950 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-gold-500 font-sans"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-[11px] font-mono text-slate-400">Status:</span>
              <select
                value={memberStatusFilter}
                onChange={(e: any) => setMemberStatusFilter(e.target.value)}
                className="bg-navy-950 border border-white/10 text-xs text-white py-1.5 px-3 focus:outline-none focus:border-gold-500 font-mono"
              >
                <option value="all">All Members</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
          </div>

          {/* Members Table */}
          <div className="overflow-x-auto border border-white/10 bg-navy-950">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-navy-900/80 text-[10px] font-mono uppercase tracking-wider text-slate-400 border-b border-white/10">
                <tr>
                  <th className="py-3 px-4">Juror Identity</th>
                  <th className="py-3 px-4">Designation &amp; Firm</th>
                  <th className="py-3 px-4">Workload / Portfolio</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 font-mono text-xs">
                      No jury members found. Click &quot;Appoint Juror&quot; to add a new panelist.
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((m) => (
                    <tr key={m.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-4 space-y-0.5">
                        <div className="font-semibold text-white flex items-center gap-1.5">
                          <span>
                            {m.honorific ? `${m.honorific} ` : ""}
                            {m.fullName}
                          </span>
                          {m.isPublic && (
                            <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 bg-blue-950/80 text-blue-300 border border-blue-500/30">
                              Public
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                          <Mail size={11} className="text-slate-500" />
                          <span>{m.email}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 space-y-0.5">
                        <div className="text-slate-200">{m.designation || "Jury Panel Member"}</div>
                        <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                          <Building size={11} className="text-slate-500" />
                          <span>{m.organization || "Independent Practitioner"}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 space-y-1">
                        <div className="flex items-center gap-2 font-mono text-[11px]">
                          <span className="text-slate-300 font-bold">{m.assignedCount}</span>
                          <span className="text-slate-500">assigned</span>
                          <span className="text-slate-600">/</span>
                          <span className="text-emerald-400 font-bold">{m.completedCount}</span>
                          <span className="text-slate-500">done</span>
                          {m.conflictCount > 0 && (
                            <span className="text-red-400 ml-1">({m.conflictCount} conflict)</span>
                          )}
                        </div>
                        {/* Mini progress bar */}
                        <div className="w-28 h-1.5 bg-navy-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 transition-all duration-300"
                            style={{
                              width: `${
                                m.assignedCount > 0 ? (m.completedCount / m.assignedCount) * 100 : 0
                              }%`,
                            }}
                          />
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono uppercase border font-semibold",
                            m.isActive
                              ? "bg-emerald-950/60 text-emerald-300 border-emerald-500/40"
                              : "bg-red-950/60 text-red-300 border-red-500/40"
                          )}
                        >
                          {m.isActive ? (
                            <>
                              <CheckCircle2 size={10} /> Active
                            </>
                          ) : (
                            <>
                              <XCircle size={10} /> Inactive
                            </>
                          )}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingMember(m)}
                            className="p-1.5 text-slate-400 hover:text-gold-400 hover:bg-white/5 rounded transition-colors"
                            title="Edit Juror Profile"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleMember(m.userId, m.isActive)}
                            className="text-[11px] font-mono text-slate-400 hover:text-white px-2 py-1 bg-navy-900 border border-white/10 rounded transition-colors"
                          >
                            {m.isActive ? "Deactivate" : "Activate"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: NOMINATION ASSIGNMENTS */}
      {activeTab === "assignments" && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-navy-900/60 p-3 border border-white/10">
            <div className="relative w-full md:w-80">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={assignmentSearch}
                onChange={(e) => setAssignmentSearch(e.target.value)}
                placeholder="Search nomination ID, project or juror..."
                className="w-full pl-9 pr-3 py-1.5 bg-navy-950 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-gold-500 font-sans"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
              <select
                value={assignmentJurorFilter}
                onChange={(e) => setAssignmentJurorFilter(e.target.value)}
                className="bg-navy-950 border border-white/10 text-xs text-white py-1.5 px-3 focus:outline-none focus:border-gold-500 font-mono"
              >
                <option value="all">All Jurors</option>
                {juryMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.fullName}
                  </option>
                ))}
              </select>

              <select
                value={assignmentStatusFilter}
                onChange={(e) => setAssignmentStatusFilter(e.target.value)}
                className="bg-navy-950 border border-white/10 text-xs text-white py-1.5 px-3 focus:outline-none focus:border-gold-500 font-mono"
              >
                <option value="all">All Statuses</option>
                <option value="assigned">Assigned (Not Started)</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed &amp; Locked</option>
                <option value="conflict">Declared Conflict</option>
              </select>
            </div>
          </div>

          {/* Assignments Table */}
          <div className="overflow-x-auto border border-white/10 bg-navy-950">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-navy-900/80 text-[10px] font-mono uppercase tracking-wider text-slate-400 border-b border-white/10">
                <tr>
                  <th className="py-3 px-4">Nomination &amp; Project</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Assigned Juror</th>
                  <th className="py-3 px-4">Evaluation State</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredAssignments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 font-mono text-xs">
                      No assignments found. Use &quot;Assign Nomination&quot; to assign eligible entries.
                    </td>
                  </tr>
                ) : (
                  filteredAssignments.map((a) => (
                    <tr key={a.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-4 space-y-0.5">
                        <div className="font-mono text-gold-400 font-bold text-[11px]">
                          {a.nominationId}
                        </div>
                        <div className="text-white font-medium">{a.projectName}</div>
                        <div className="text-[10px] font-mono text-slate-400">
                          {a.projectCity}, {a.projectState}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-block text-[11px] text-slate-300">
                          {a.category?.name || "Category"}
                        </span>
                        <div className="text-[10px] font-mono text-slate-500">
                          Code: {a.category?.code}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 space-y-0.5">
                        <div className="text-white font-medium">
                          {a.juror?.fullName || "Unassigned"}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">
                          {a.juror?.organization || a.juror?.email}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 space-y-1">
                        {a.conflictDeclared ? (
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono bg-red-950/80 text-red-300 border border-red-500/40">
                            <AlertTriangle size={10} />
                            <span>Conflict Declared</span>
                          </div>
                        ) : a.status === "completed" ? (
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                            <CheckCircle2 size={10} />
                            <span>Completed &amp; Locked</span>
                          </div>
                        ) : a.status === "in_progress" ? (
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono bg-amber-950/80 text-amber-300 border border-amber-500/40">
                            <Clock size={10} />
                            <span>In Progress (Draft)</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono bg-blue-950/80 text-blue-300 border border-blue-500/40">
                            <Briefcase size={10} />
                            <span>Assigned</span>
                          </div>
                        )}

                        {a.conflictReason && (
                          <div className="text-[10px] text-red-400/90 italic truncate max-w-xs" title={a.conflictReason}>
                            Reason: {a.conflictReason}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setViewingAssignment(a)}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded transition-colors"
                            title="View Details"
                          >
                            <Eye size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveAssignment(a.id, a.nominationId)}
                            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-950/30 rounded transition-colors"
                            title="Remove Assignment"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: EVALUATION MONITORING */}
      {activeTab === "monitoring" && (
        <div className="space-y-4">
          <div className="p-4 bg-navy-900/60 border border-white/10 space-y-2">
            <h3 className="text-xs font-mono uppercase tracking-wider text-gold-400 font-bold">
              Confidential Evaluation Monitoring
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
              Inspect submitted evaluations, qualitative recommendations, and strengths/observations. If administrative corrections are justified, evaluations can be unlocked via the Reopen action.
            </p>
          </div>

          <div className="overflow-x-auto border border-white/10 bg-navy-950">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-navy-900/80 text-[10px] font-mono uppercase tracking-wider text-slate-400 border-b border-white/10">
                <tr>
                  <th className="py-3 px-4">Nomination</th>
                  <th className="py-3 px-4">Juror</th>
                  <th className="py-3 px-4">Evaluation Status</th>
                  <th className="py-3 px-4">Qualitative Recommendation</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {assignments.filter((a) => a.evaluation).length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 font-mono text-xs">
                      No evaluations recorded yet. Evaluations will appear here once saved as draft or submitted by jurors.
                    </td>
                  </tr>
                ) : (
                  assignments
                    .filter((a) => a.evaluation)
                    .map((a) => (
                      <tr key={a.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3.5 px-4 space-y-0.5">
                          <div className="font-mono text-gold-400 font-bold">{a.nominationId}</div>
                          <div className="text-white">{a.projectName}</div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="text-white">{a.juror?.fullName}</div>
                          <div className="text-[10px] font-mono text-slate-400">{a.juror?.organization}</div>
                        </td>

                        <td className="py-3.5 px-4 space-y-1">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 text-[10px] font-mono uppercase px-2 py-0.5 border font-semibold",
                              a.evaluation?.isLocked
                                ? "bg-emerald-950/80 text-emerald-300 border-emerald-500/40"
                                : "bg-amber-950/80 text-amber-300 border-amber-500/40"
                            )}
                          >
                            {a.evaluation?.isLocked ? <Lock size={10} /> : <Clock size={10} />}
                            <span>{a.evaluation?.isLocked ? "Locked / Submitted" : "Draft (Editable)"}</span>
                          </span>
                          {a.evaluation?.submittedAt && (
                            <div className="text-[10px] font-mono text-slate-500">
                              {formatDeterministicDate(a.evaluation.submittedAt)}
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          {a.evaluation?.recommendation ? (
                            <span
                              className={cn(
                                "inline-block text-[11px] font-mono px-2 py-0.5 border",
                                a.evaluation.recommendation === "strongly_recommend"
                                  ? "bg-emerald-950/60 text-emerald-300 border-emerald-500/40 font-bold"
                                  : a.evaluation.recommendation === "recommend"
                                  ? "bg-blue-950/60 text-blue-300 border-blue-500/40"
                                  : a.evaluation.recommendation === "consider_reservations"
                                  ? "bg-amber-950/60 text-amber-300 border-amber-500/40"
                                  : "bg-slate-900 text-slate-400 border-white/10"
                              )}
                            >
                              {a.evaluation.recommendation.replace(/_/g, " ").toUpperCase()}
                            </span>
                          ) : (
                            <span className="text-slate-500 text-xs italic">Pending recommendation</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setViewingAssignment(a)}
                              className="text-xs font-mono text-gold-400 hover:text-gold-300 px-2 py-1 bg-navy-900 border border-gold-500/30 rounded"
                            >
                              View Summary
                            </button>
                            {a.evaluation?.isLocked && (
                              <button
                                type="button"
                                onClick={() => setReopeningEvalId(a.evaluation?.id || null)}
                                className="text-xs font-mono text-amber-400 hover:text-amber-300 px-2 py-1 bg-navy-900 border border-amber-500/30 rounded flex items-center gap-1"
                                title="Reopen locked evaluation"
                              >
                                <RotateCcw size={11} /> Reopen
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: APPOINT JURY MEMBER */}
      {showAddMemberModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-navy-950 border border-white/20 p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-display text-lg text-white font-medium flex items-center gap-2">
                <UserPlus size={16} className="text-gold-400" />
                <span>Appoint Grand Jury Member</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddMemberModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateMember} className="space-y-3 text-xs font-sans">
              <div className="grid grid-cols-4 gap-2">
                <div className="col-span-1">
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">Prefix</label>
                  <select
                    value={newMemberForm.honorific}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, honorific: e.target.value })}
                    className="w-full bg-navy-900 border border-white/10 text-white p-2 focus:border-gold-500"
                  >
                    <option value="Ar.">Ar.</option>
                    <option value="ID.">ID.</option>
                    <option value="Prof.">Prof.</option>
                    <option value="Dr.">Dr.</option>
                    <option value="Mr.">Mr.</option>
                    <option value="Ms.">Ms.</option>
                  </select>
                </div>
                <div className="col-span-3">
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newMemberForm.fullName}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, fullName: e.target.value })}
                    placeholder="e.g. Ramesh V. Patel"
                    className="w-full bg-navy-900 border border-white/10 text-white p-2 focus:border-gold-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={newMemberForm.email}
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, email: e.target.value })}
                  placeholder="juror@designstudio.com"
                  className="w-full bg-navy-900 border border-white/10 text-white p-2 focus:border-gold-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">Designation</label>
                  <input
                    type="text"
                    value={newMemberForm.designation}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, designation: e.target.value })}
                    placeholder="Principal Architect"
                    className="w-full bg-navy-900 border border-white/10 text-white p-2 focus:border-gold-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">Organization / Studio</label>
                  <input
                    type="text"
                    value={newMemberForm.organization}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, organization: e.target.value })}
                    placeholder="Studio Vistara"
                    className="w-full bg-navy-900 border border-white/10 text-white p-2 focus:border-gold-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  Initial Password (Optional — defaults to KutchAwards2026#Jury)
                </label>
                <input
                  type="password"
                  value={newMemberForm.password}
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, password: e.target.value })}
                  placeholder="Leave empty for default"
                  className="w-full bg-navy-900 border border-white/10 text-white p-2 focus:border-gold-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Professional Bio</label>
                <textarea
                  rows={2}
                  value={newMemberForm.bio}
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, bio: e.target.value })}
                  placeholder="Over 20 years of practice in regional vernacular architecture..."
                  className="w-full bg-navy-900 border border-white/10 text-white p-2 focus:border-gold-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={newMemberForm.isPublic}
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, isPublic: e.target.checked })}
                  className="rounded bg-navy-900 border-white/20 text-gold-500 focus:ring-0"
                />
                <label htmlFor="isPublic" className="text-slate-300 text-xs">
                  Publish profile in public Grand Jury showcase
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddMemberModal(false)}
                  className="px-4 py-2 bg-navy-900 text-slate-300 border border-white/10 text-xs font-mono uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 bg-gold-500 hover:bg-gold-400 text-navy-950 text-xs font-mono font-bold uppercase disabled:opacity-50"
                >
                  {isPending ? "Creating..." : "Confirm Appointment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ASSIGN NOMINATION */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-navy-950 border border-white/20 p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-display text-lg text-white font-medium flex items-center gap-2">
                <FileCheck size={16} className="text-gold-400" />
                <span>Assign Eligible Nomination to Juror</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAssignModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAssign} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  1. Select Eligible Nomination ({eligibleApps.length} Available) *
                </label>
                <select
                  required
                  value={assignForm.applicationId}
                  onChange={(e) => setAssignForm({ ...assignForm, applicationId: e.target.value })}
                  className="w-full bg-navy-900 border border-white/10 text-white p-2.5 focus:border-gold-500 font-mono text-xs"
                >
                  <option value="">-- Choose Nomination --</option>
                  {eligibleApps.map((app) => (
                    <option key={app.id} value={app.id}>
                      [{app.nominationId}] {app.projectName} ({app.category?.name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  2. Select Jury Member *
                </label>
                <select
                  required
                  value={assignForm.juryProfileId}
                  onChange={(e) => setAssignForm({ ...assignForm, juryProfileId: e.target.value })}
                  className="w-full bg-navy-900 border border-white/10 text-white p-2.5 focus:border-gold-500 text-xs"
                >
                  <option value="">-- Choose Juror --</option>
                  {juryMembers
                    .filter((m) => m.isActive)
                    .map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.honorific ? `${m.honorific} ` : ""}
                        {m.fullName} — {m.organization || m.email} ({m.assignedCount} current assignments)
                      </option>
                    ))}
                </select>
              </div>

              <div className="p-3 bg-navy-900/80 border border-white/10 space-y-1 text-[11px] font-mono text-slate-400">
                <div className="flex items-center gap-1.5 text-gold-400">
                  <Info size={12} />
                  <span>Workflow Notice</span>
                </div>
                <p>
                  Assigning an eligible nomination automatically advances its status to <strong>jury_review</strong> and renders it confidential in the juror&apos;s evaluation portal.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 bg-navy-900 text-slate-300 border border-white/10 text-xs font-mono uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 bg-gold-500 hover:bg-gold-400 text-navy-950 text-xs font-mono font-bold uppercase disabled:opacity-50"
                >
                  {isPending ? "Assigning..." : "Confirm Assignment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: EDIT JURY MEMBER */}
      {editingMember && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-navy-950 border border-white/20 p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-display text-lg text-white font-medium flex items-center gap-2">
                <Edit2 size={16} className="text-gold-400" />
                <span>Edit Jury Member Profile</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingMember(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateMember} className="space-y-3 text-xs font-sans">
              <div className="grid grid-cols-4 gap-2">
                <div className="col-span-1">
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">Prefix</label>
                  <input
                    type="text"
                    value={editingMember.honorific || ""}
                    onChange={(e) => setEditingMember({ ...editingMember, honorific: e.target.value })}
                    className="w-full bg-navy-900 border border-white/10 text-white p-2 focus:border-gold-500"
                  />
                </div>
                <div className="col-span-3">
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editingMember.fullName}
                    onChange={(e) => setEditingMember({ ...editingMember, fullName: e.target.value })}
                    className="w-full bg-navy-900 border border-white/10 text-white p-2 focus:border-gold-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">Designation</label>
                  <input
                    type="text"
                    value={editingMember.designation || ""}
                    onChange={(e) => setEditingMember({ ...editingMember, designation: e.target.value })}
                    className="w-full bg-navy-900 border border-white/10 text-white p-2 focus:border-gold-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">Organization</label>
                  <input
                    type="text"
                    value={editingMember.organization || ""}
                    onChange={(e) => setEditingMember({ ...editingMember, organization: e.target.value })}
                    className="w-full bg-navy-900 border border-white/10 text-white p-2 focus:border-gold-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Bio</label>
                <textarea
                  rows={3}
                  value={editingMember.bio || ""}
                  onChange={(e) => setEditingMember({ ...editingMember, bio: e.target.value })}
                  className="w-full bg-navy-900 border border-white/10 text-white p-2 focus:border-gold-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="editIsPublic"
                  checked={editingMember.isPublic}
                  onChange={(e) => setEditingMember({ ...editingMember, isPublic: e.target.checked })}
                  className="rounded bg-navy-900 border-white/20 text-gold-500 focus:ring-0"
                />
                <label htmlFor="editIsPublic" className="text-slate-300 text-xs">
                  Public profile enabled
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="px-4 py-2 bg-navy-900 text-slate-300 border border-white/10 text-xs font-mono uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 bg-gold-500 hover:bg-gold-400 text-navy-950 text-xs font-mono font-bold uppercase disabled:opacity-50"
                >
                  {isPending ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: VIEW ASSIGNMENT DETAIL / EVALUATION SUMMARY */}
      {viewingAssignment && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-navy-950 border border-white/20 p-6 max-w-xl w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-display text-lg text-white font-medium flex items-center gap-2">
                <Eye size={16} className="text-gold-400" />
                <span>Assignment &amp; Evaluation Record</span>
              </h3>
              <button
                type="button"
                onClick={() => setViewingAssignment(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs font-sans">
              <div className="grid grid-cols-2 gap-3 p-3 bg-navy-900/60 border border-white/10">
                <div>
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Nomination ID</div>
                  <div className="font-mono text-gold-400 font-bold text-sm">
                    {viewingAssignment.nominationId}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Project Name</div>
                  <div className="font-medium text-white">{viewingAssignment.projectName}</div>
                </div>
                <div>
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Category</div>
                  <div className="text-slate-300">{viewingAssignment.category?.name}</div>
                </div>
                <div>
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Juror</div>
                  <div className="text-slate-300 font-medium">{viewingAssignment.juror?.fullName}</div>
                </div>
              </div>

              {viewingAssignment.conflictDeclared ? (
                <div className="p-3 bg-red-950/70 border border-red-500/40 text-red-300 space-y-1 font-mono text-xs">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertTriangle size={13} />
                    <span>Conflict of Interest Declared</span>
                  </div>
                  <p className="font-sans text-xs text-red-200">
                    Reason: {viewingAssignment.conflictReason || "Unspecified"}
                  </p>
                </div>
              ) : viewingAssignment.evaluation ? (
                <div className="p-3 bg-navy-900 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-gold-400 uppercase">
                      Evaluation Status
                    </span>
                    <span
                      className={cn(
                        "text-[10px] font-mono uppercase px-2 py-0.5 border font-semibold",
                        viewingAssignment.evaluation.isLocked
                          ? "bg-emerald-950 text-emerald-300 border-emerald-500/40"
                          : "bg-amber-950 text-amber-300 border-amber-500/40"
                      )}
                    >
                      {viewingAssignment.evaluation.isLocked ? "Locked" : "Draft"}
                    </span>
                  </div>

                  {viewingAssignment.evaluation.recommendation && (
                    <div>
                      <div className="text-[10px] font-mono text-slate-400 uppercase">Recommendation</div>
                      <div className="text-sm font-display font-medium text-white capitalize">
                        {viewingAssignment.evaluation.recommendation.replace(/_/g, " ")}
                      </div>
                    </div>
                  )}

                  {viewingAssignment.evaluation.generalComment && (
                    <div>
                      <div className="text-[10px] font-mono text-slate-400 uppercase">General Observation</div>
                      <p className="text-slate-300 italic text-xs leading-relaxed bg-navy-950 p-2 border border-white/5 mt-1">
                        &quot;{viewingAssignment.evaluation.generalComment}&quot;
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3 bg-navy-900 border border-white/10 text-slate-400 font-mono text-xs text-center">
                  Evaluation has not been started yet.
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-white/10">
              <a
                href={`/admin/applications/${viewingAssignment.applicationId}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-mono text-gold-400 hover:text-gold-300 inline-flex items-center gap-1"
              >
                <span>Open Admin Dossier</span>
                <ExternalLink size={11} />
              </a>

              <button
                type="button"
                onClick={() => setViewingAssignment(null)}
                className="px-4 py-1.5 bg-navy-900 text-slate-300 border border-white/10 text-xs font-mono uppercase"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: REOPEN EVALUATION */}
      {reopeningEvalId && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-navy-950 border border-amber-500/40 p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-display text-lg text-white font-medium flex items-center gap-2">
                <RotateCcw size={16} className="text-amber-400" />
                <span>Reopen Locked Evaluation</span>
              </h3>
              <button
                type="button"
                onClick={() => setReopeningEvalId(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              Reopening this evaluation unlocks it and resets its status to draft, allowing the assigned juror to update criteria assessments and commentary. This action is permanently audited.
            </p>

            <div>
              <label className="block text-[11px] font-mono text-amber-300 mb-1">
                Reason for Reopening (Mandatory) *
              </label>
              <textarea
                rows={3}
                required
                value={reopenReason}
                onChange={(e) => setReopenReason(e.target.value)}
                placeholder="e.g. Juror requested review adjustment following committee discussion on drawing clarity."
                className="w-full bg-navy-900 border border-white/10 text-white p-2 text-xs focus:border-amber-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setReopeningEvalId(null)}
                className="px-4 py-2 bg-navy-900 text-slate-300 border border-white/10 text-xs font-mono uppercase"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReopenEval}
                disabled={isPending || !reopenReason.trim()}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-navy-950 text-xs font-mono font-bold uppercase disabled:opacity-50"
              >
                {isPending ? "Reopening..." : "Confirm Reopen"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
