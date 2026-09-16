export interface AwardCategory {
  id: number;
  slug: string;
  number: string;
  title: string;
  shortDescription: string;
  recognizes: string;
  image: string;
}

export const AWARD_CATEGORIES: AwardCategory[] = [
  {
    id: 1,
    slug: "architect-of-the-year",
    number: "01",
    title: "Architect of the Year",
    shortDescription: "Recognising licensed architects or architectural firms with a strong portfolio of impactful residential or commercial projects.",
    recognizes: "Licensed architects or architectural firms with a strong portfolio of impactful residential or commercial projects.",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 2,
    slug: "best-luxury-residence",
    number: "02",
    title: "Best Luxury Residence",
    shortDescription: "Celebrating high-end residential projects distinguished by premium materials, bespoke design elements and exceptional craftsmanship.",
    recognizes: "High-end residential projects distinguished by premium materials, bespoke design elements and exceptional craftsmanship.",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 3,
    slug: "best-apartment-design",
    number: "03",
    title: "Best Apartment Design",
    shortDescription: "For individual apartment units or multi-unit residential projects that demonstrate innovative approaches to contemporary urban living.",
    recognizes: "Individual apartment units or multi-unit residential projects that demonstrate innovative approaches to contemporary urban living.",
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 4,
    slug: "best-renovation-project",
    number: "04",
    title: "Best Renovation Project",
    shortDescription: "Recognising projects that showcase a substantial and creative transformation of an existing space.",
    recognizes: "Projects that showcase a substantial and creative transformation of an existing space.",
    image: "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 5,
    slug: "best-sustainable-home",
    number: "05",
    title: "Best Sustainable Home",
    shortDescription: "For residential projects that incorporate environmentally responsible materials, energy-efficient systems and climate-responsive design principles.",
    recognizes: "Residential projects that incorporate environmentally responsible materials, energy-efficient systems and climate-responsive design principles.",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 6,
    slug: "ultra-luxury-residential-project-of-the-year",
    number: "06",
    title: "Ultra-Luxury Residential Project of the Year",
    shortDescription: "Recognising exceptional residential projects distinguished by extraordinary scale, refined design, premium materials, bespoke features and outstanding craftsmanship.",
    recognizes: "Exceptional residential projects distinguished by extraordinary scale, refined design, premium materials, bespoke features and outstanding craftsmanship.",
    image: "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 7,
    slug: "interior-designer-of-the-year",
    number: "07",
    title: "Interior Designer of the Year",
    shortDescription: "Recognising interior design professionals or studios that demonstrate excellence in spatial planning, design aesthetics and overall execution.",
    recognizes: "Interior design professionals or studios that demonstrate excellence in spatial planning, design aesthetics and overall execution.",
    image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 8,
    slug: "emerging-designer",
    number: "08",
    title: "Emerging Designer",
    shortDescription: "For young design professionals or newly established firms, typically with less than 5–7 years of practice, demonstrating exceptional potential and promise.",
    recognizes: "Young design professionals or newly established firms, typically with less than 5–7 years of practice, demonstrating exceptional potential and promise.",
    image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 9,
    slug: "best-compact-home",
    number: "09",
    title: "Best Compact Home",
    shortDescription: "Recognising residential projects that creatively maximise functionality, comfort and design appeal within a limited floor area.",
    recognizes: "Residential projects that creatively maximise functionality, comfort and design appeal within a limited floor area.",
    image: "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 10,
    slug: "best-smart-home",
    number: "10",
    title: "Best Smart Home",
    shortDescription: "For residences that seamlessly integrate automated technologies for lighting, climate control, security, entertainment and other aspects of home living.",
    recognizes: "Residences that seamlessly integrate automated technologies for lighting, climate control, security, entertainment and other aspects of home living.",
    image: "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 11,
    slug: "best-themed-project-of-the-year",
    number: "11",
    title: "Best Themed Project of the Year",
    shortDescription: "Recognising projects that create a cohesive and immersive design experience by effectively translating a distinctive creative concept or cultural theme into a physical living space.",
    recognizes: "Projects that create a cohesive and immersive design experience by effectively translating a distinctive creative concept or cultural theme into a physical living space.",
    image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 12,
    slug: "luxury-villa-project-of-the-year",
    number: "12",
    title: "Luxury Villa Project of the Year",
    shortDescription: "For standalone villa projects that combine sophisticated architecture, elegant interiors, premium materials and thoughtfully designed indoor and outdoor living spaces.",
    recognizes: "Standalone villa projects that combine sophisticated architecture, elegant interiors, premium materials and thoughtfully designed indoor and outdoor living spaces.",
    image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80",
  },
];

// The 6 featured categories for homepage preview
export const FEATURED_CATEGORIES: AwardCategory[] = AWARD_CATEGORIES.filter((c) =>
  [1, 2, 3, 4, 5, 7].includes(c.id)
);

export function getCategoryBySlug(slug: string): AwardCategory | undefined {
  return AWARD_CATEGORIES.find((cat) => cat.slug === slug);
}
