export interface ParticipantCertificateItem {
  id?: string;
  applicationId?: string;
  nominationId?: string;
  certificateNumber: string;
  participantName: string;
  participantType?: "individual_architect" | "architectural_firm";
  projectName: string;
  categoryName: string;
  categoryCode?: string;
  awardEdition?: string;
  editionYear?: string;
  status?: "pending" | "issued" | "revoked";
  issuedAt: string | null;
  issuedByName?: string | null;
  createdAt?: string;
}
