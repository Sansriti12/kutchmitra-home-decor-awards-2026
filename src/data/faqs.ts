export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export const HOMEPAGE_FAQS: FaqItem[] = [
  {
    id: "faq-1",
    question: "Who can submit nominations for the awards?",
    answer:
      "The awards celebrate excellence across architecture, interior design, and residential development. Detailed applicant eligibility guidelines for each of the 12 categories will be officially confirmed by Kutchmitra prior to portal opening.",
  },
  {
    id: "faq-2",
    question: "How does the nomination process work?",
    answer:
      "The nomination process is conducted entirely online through a multi-step digital portal: create an applicant account, select your category, provide project narratives, upload high-resolution media dossiers, review your submission, and submit.",
  },
  {
    id: "faq-3",
    question: "Can I save my nomination as a draft and continue later?",
    answer:
      "Yes. The digital nomination portal allows applicants to save their progress as a draft at any stage and return to complete their dossier before the final nomination closing deadline.",
  },
  {
    id: "faq-4",
    question: "What types of media and documents can be uploaded?",
    answer:
      "Supported upload types include cover image, project photos, interior/exterior photos, floor plans/drawings, 3D views/renderings, portfolio/brochure, and supporting documents. Detailed submission and file specifications will be confirmed by Kutchmitra.",
  },
  {
    id: "faq-5",
    question: "Can an applicant submit nominations in more than one category?",
    answer:
      "Yes, applicants with qualifying works may submit distinct nominations across different categories, provided each entry meets the specific criteria of the selected category.",
  },
  {
    id: "faq-6",
    question: "How will the submissions be evaluated?",
    answer:
      "Submissions will undergo initial verification before advancing to the independent jury panel for confidential, criterion-based scoring. Final evaluation criteria and weightages will be announced by the organizers.",
  },
];
