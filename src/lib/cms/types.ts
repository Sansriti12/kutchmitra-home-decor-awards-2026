export type CmsContentStatus = "draft" | "published" | "archived";

export interface CmsImportantDate {
  id: string;
  milestoneNumber: string;
  title: string;
  description: string;
  dateText: string;
  startDate: string | null;
  endDate: string | null;
  status: CmsContentStatus;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CmsFaq {
  id: string;
  question: string;
  answer: string;
  category: string;
  status: CmsContentStatus;
  isActive: boolean;
  isFeaturedHomepage: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CmsAnnouncement {
  id: string;
  title: string;
  shortDescription: string | null;
  content: string | null;
  announcementType: "general" | "deadline" | "event" | "alert";
  badgeText: string | null;
  actionUrl: string | null;
  actionLabel: string | null;
  imageUrl: string | null;
  publishDate: string | null;
  expiryDate: string | null;
  status: CmsContentStatus;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CmsSiteSettings {
  id: string;
  officeAddress: string;
  officialEmail: string;
  helplinePhone: string;
  supportHours: string;
  privacyContactEmail: string;
  homepageBannerActive: boolean;
  homepageBannerBadge: string;
  homepageBannerText: string;
  homepageBannerLink: string;
  homepageBannerLinkText: string;
  createdAt: string;
  updatedAt: string;
}

export interface CmsJuryProfileItem {
  id: string;
  userId: string;
  jurorName: string;
  email: string;
  honorific: string | null;
  organization: string | null;
  designation: string | null;
  bio: string | null;
  photoUrl: string | null;
  displayOrder: number;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CmsCategoryItem {
  id: string;
  code: string;
  displayNumber: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  fullDescription: string | null;
  eligibilityCriteria: string | null;
  coverImageUrl: string | null;
  isActive: boolean;
  displayOrder: number;
  isDbSynced?: boolean;
}

export interface CmsWorkspaceData {
  success: boolean;
  error?: string;
  dates: CmsImportantDate[];
  faqs: CmsFaq[];
  announcements: CmsAnnouncement[];
  siteSettings: CmsSiteSettings;
  juryProfiles: CmsJuryProfileItem[];
  categories: CmsCategoryItem[];
  winnerStats: {
    totalWinners: number;
    publishedWinners: number;
  };
}
