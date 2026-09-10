export interface TimelineMilestone {
  number: string;
  title: string;
  date: string;
  description: string;
  status: "TBD";
}

export const TIMELINE_MILESTONES: TimelineMilestone[] = [
  {
    number: "01",
    title: "Nomination Opens",
    date: "TBD",
    description: "Official opening of the digital nomination portal for all 12 award categories.",
    status: "TBD",
  },
  {
    number: "02",
    title: "Nomination Closes",
    date: "TBD",
    description: "Final deadline for applicants to submit complete dossiers and supporting uploads.",
    status: "TBD",
  },
  {
    number: "03",
    title: "Verification",
    date: "TBD",
    description: "Technical review period to verify completeness and adherence to submission guidelines.",
    status: "TBD",
  },
  {
    number: "04",
    title: "Jury Evaluation",
    date: "TBD",
    description: "Confidential scoring by the independent expert jury across defined evaluation criteria.",
    status: "TBD",
  },
  {
    number: "05",
    title: "Shortlisting",
    date: "TBD",
    description: "Announcement of shortlisted projects advancing to the final awards stage.",
    status: "TBD",
  },
  {
    number: "06",
    title: "Awards Ceremony",
    date: "TBD",
    description: "Grand gala ceremony honoring winners and celebrating architectural excellence.",
    status: "TBD",
  },
];
