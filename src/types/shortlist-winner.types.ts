/**
 * Phase E: Shortlisting, Final Deliberation & Winner Management Types
 * Kutchmitra Home & Decor Awards 2026
 */

export type WinnerType = "winner" | "runner_up" | "special_commendation" | "finalist";
export type PublicationStatus = "draft" | "approved" | "published";

export interface JurorEvaluationSummary {
  assignmentId: string;
  jurorId: string;
  jurorName: string;
  jurorDesignation?: string;
  jurorOrganization?: string;
  status: "assigned" | "in_progress" | "completed" | "declined_conflict";
  conflictDeclared: boolean;
  conflictReason?: string;
  recommendation?: string; // "strongly_recommend" | "recommend" | "consider_reservations" | "do_not_recommend"
  submittedAt?: string;
  strengths?: string;
  areasOfConcern?: string;
  generalComment?: string;
  scores: Array<{
    criterionId: string;
    criterionTitle: string;
    qualitativeRating: string; // "Exceptional" | "Commendable" | "Competent" | "Developing"
    confidentialComment?: string;
  }>;
}

export interface JuryCompletenessSummary {
  totalAssigned: number;
  completedCount: number;
  pendingCount: number;
  conflictCount: number;
  isFullyEvaluated: boolean;
  recommendations: Record<string, number>;
  jurors: JurorEvaluationSummary[];
}

export interface ShortlistWorkspaceItem {
  id: string; // application id
  nominationId: string;
  projectName: string;
  categoryId: string;
  categoryName: string;
  categoryCode: string;
  applicantName: string;
  applicantOrganization: string;
  projectCity: string;
  projectState: string;
  completionDate?: string | null;
  status: string; // 'jury_review' | 'shortlisted' | 'winner'
  isShortlisted: boolean;
  shortlistId?: string;
  shortlistedAt?: string;
  shortlistedByName?: string;
  deliberationNotes?: string;
  isLocked: boolean;
  lockedAt?: string;
  juryCompleteness: JuryCompletenessSummary;
}

export interface ShortlistStats {
  totalJuryReview: number;
  totalFullyEvaluated: number;
  totalShortlisted: number;
  isShortlistLocked: boolean;
  lockedAt?: string;
  lockedByName?: string;
  totalCategories: number;
}

export interface WinnerWorkspaceStats {
  totalWinners: number;
  totalApproved: number;
  totalPublished: number;
  categoriesWithWinnersCount: number;
  totalCategories: number;
  totalShortlisted: number;
  availableFinalists: number;
}

export interface WinnerCandidateItem {
  id: string;
  nominationId: string;
  projectName: string;
  categoryId: string;
  categoryName: string;
  categoryCode: string;
  applicantName: string;
  organization: string;
  projectCity: string;
  projectState: string;
  coverImageUrl?: string;
}

export interface FinalDeliberationDossier {
  application: {
    id: string;
    nominationId: string;
    projectName: string;
    category: {
      id: string;
      name: string;
      code: string;
      slug: string;
    };
    applicant: {
      name: string;
      organization: string;
      email: string;
      phone: string;
    };
    projectCity: string;
    projectState: string;
    builtUpAreaSqft?: number | null;
    projectCompletionDate?: string | null;
    status: string;
  };
  shortlistInfo?: {
    id: string;
    isLocked: boolean;
    lockedAt?: string;
    shortlistedBy?: string;
    deliberationNotes?: string;
  };
  dynamicQuestions: Array<{
    id: string;
    questionKey: string;
    questionText: string;
    helpText?: string;
    answer: string;
  }>;
  files: Array<{
    id: string;
    uploadType: string;
    title: string;
    description?: string;
    signedUrl?: string;
    mimeType: string;
    fileSizeBytes?: number;
  }>;
  evaluations: JurorEvaluationSummary[];
  synthesis: {
    totalEvaluations: number;
    recommendationCounts: Record<string, number>;
    criteriaRatings: Record<string, Record<string, number>>; // criterionTitle -> { [rating]: count }
    consolidatedStrengths: string[];
    consolidatedConcerns: string[];
  };
  winnerRecord?: WinnerRecord | null;
}

export interface WinnerRecord {
  id: string;
  applicationId: string;
  editionId: string;
  categoryId: string;
  categoryCode: string;
  categoryName: string;
  awardTitle: string; // "Winner" | "Runner-Up" | "Special Commendation"
  winnerType: WinnerType;
  winnerTitle: string;
  projectName: string;
  entrantName: string;
  organizationName: string;
  projectLocation: string;
  summaryDescription: string;
  citation: string;
  projectStory: string;
  heroImageUrl: string;
  galleryUrls: string[];
  publicationStatus: PublicationStatus;
  isPublished: boolean;
  publishedAt?: string | null;
  publishedBy?: string | null;
  isFeatured: boolean;
  displayOrder: number;
  nominationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface WinnerProfilePayload {
  awardTitle: string;
  winnerType: WinnerType;
  winnerTitle: string;
  projectName: string;
  entrantName: string;
  organizationName: string;
  projectLocation: string;
  summaryDescription: string;
  citation: string;
  projectStory: string;
  heroImageUrl: string;
  galleryUrls: string[];
  isFeatured: boolean;
  displayOrder: number;
}

export interface PublicWinnerCard {
  id: string;
  awardTitle: string;
  winnerType: WinnerType;
  winnerTitle: string;
  projectName: string;
  entrantName: string;
  organizationName: string;
  projectLocation: string;
  summaryDescription: string;
  citation: string;
  heroImageUrl: string;
  categoryCode: string;
  categoryName: string;
  categorySlug: string;
  isFeatured: boolean;
  displayOrder: number;
}

export interface PublicWinnerDetail extends PublicWinnerCard {
  projectStory: string;
  galleryUrls: string[];
  publishedAt: string;
}
