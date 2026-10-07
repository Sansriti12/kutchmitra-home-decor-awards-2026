/**
 * Kutchmitra Home & Decor Awards 2026
 * Phase D: Jury Management & Evaluation TypeScript Definitions
 */

export type JuryAssignmentStatus =
  | "assigned"
  | "in_progress"
  | "completed"
  | "declined_conflict";

export type JuryEvaluationStatus = "draft" | "submitted";

export type QualitativeRating =
  | "Exceptional"
  | "Commendable"
  | "Competent"
  | "Developing"
  | "";

export type JuryRecommendation =
  | "strongly_recommend"
  | "recommend"
  | "consider_reservations"
  | "do_not_recommend"
  | "";

export interface ScoringCriterionItem {
  id: string;
  code: string;
  title: string;
  description: string | null;
  weightPercentage: number;
  maxScore: number;
  displayOrder: number;
  isActive: boolean;
}

export interface JuryMemberItem {
  id: string; // jury_profiles.id
  userId: string; // users.id
  email: string;
  fullName: string;
  honorific: string | null;
  organization: string | null;
  designation: string | null;
  bio: string | null;
  photoUrl: string | null;
  displayOrder: number;
  isPublic: boolean;
  isActive: boolean;
  assignedCount: number;
  completedCount: number;
  pendingCount: number;
  conflictCount: number;
  createdAt: string;
}

export interface JuryAssignmentItem {
  id: string; // jury_assignments.id
  editionId: string;
  juryProfileId: string;
  applicationId: string;
  nominationId: string;
  projectName: string;
  projectCity: string;
  projectState: string;
  category: {
    id: string;
    code: string;
    name: string;
    slug: string;
  } | null;
  assignedBy: string;
  assignedAt: string;
  status: JuryAssignmentStatus;
  conflictDeclared: boolean;
  conflictReason: string | null;
  completedAt: string | null;
  juror: {
    id: string; // jury_profiles.id
    userId: string;
    fullName: string;
    email: string;
    organization: string | null;
    designation: string | null;
  } | null;
  evaluation?: {
    id: string;
    status: JuryEvaluationStatus;
    isLocked: boolean;
    submittedAt: string | null;
    recommendation: JuryRecommendation | null;
    generalComment: string | null;
  } | null;
}

export interface CriterionScorePayload {
  criterionId: string;
  qualitativeRating: QualitativeRating;
  score: number;
  confidentialComment: string;
}

export interface JuryEvaluationPayload {
  generalComment: string;
  strengths: string;
  areasOfConcern: string;
  recommendation: JuryRecommendation;
  criterionScores: CriterionScorePayload[];
}

export interface JuryEvaluationDetail {
  id: string;
  juryAssignmentId: string;
  status: JuryEvaluationStatus;
  isLocked: boolean;
  submittedAt: string | null;
  generalComment: string | null;
  strengths: string | null;
  areasOfConcern: string | null;
  recommendation: JuryRecommendation | null;
  qualitativeAssessment: string | null;
  scores: Array<{
    id: string;
    criterionId: string;
    criterionCode: string;
    criterionTitle: string;
    qualitativeRating: QualitativeRating;
    score: number;
    confidentialComment: string | null;
  }>;
}

export interface JuryApplicationDossier {
  assignment: JuryAssignmentItem;
  application: {
    id: string;
    nominationId: string;
    projectName: string;
    projectCity: string;
    projectState: string;
    projectCompletionDate: string | null;
    builtUpAreaSqft: number | null;
    status: string;
    category: {
      id: string;
      code: string;
      name: string;
      slug: string;
      shortDescription?: string;
    } | null;
  };
  questions: Array<{
    id: string;
    questionKey: string;
    questionText: string;
    helpText: string | null;
    fieldType: string;
    displayOrder: number;
  }>;
  answers: Record<string, any>;
  files: Array<{
    id: string;
    uploadType: string;
    title: string;
    description: string | null;
    filePath: string;
    fileName: string;
    signedUrl: string | null;
    fileSizeBytes: number | null;
    mimeType: string | null;
  }>;
  criteria: ScoringCriterionItem[];
  evaluation: JuryEvaluationDetail | null;
}
