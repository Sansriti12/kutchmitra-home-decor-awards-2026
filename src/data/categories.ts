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
    id: 4,
    slug: "best-renovation-project",
    number: "03",
    title: "Best Renovation Project",
    shortDescription: "Recognising projects that showcase a substantial and creative transformation of an existing space.",
    recognizes: "Projects that showcase a substantial and creative transformation of an existing space.",
    image: "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 5,
    slug: "best-sustainable-home",
    number: "04",
    title: "Best Sustainable Home",
    shortDescription: "Recognising residential projects that incorporate environmentally responsible materials, energy-efficient systems and climate-responsive design principles.",
    recognizes: "Residential projects that incorporate environmentally responsible materials, energy-efficient systems and climate-responsive design principles.",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 7,
    slug: "interior-designer-of-the-year",
    number: "05",
    title: "Interior Designer of the Year",
    shortDescription: "Recognising interior design professionals or studios that demonstrate excellence in spatial planning, design aesthetics and overall execution.",
    recognizes: "Interior design professionals or studios that demonstrate excellence in spatial planning, design aesthetics and overall execution.",
    image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 8,
    slug: "emerging-designer",
    number: "06",
    title: "Emerging Designer",
    shortDescription: "Recognising young design professionals or newly established firms, typically with less than 5–7 years of practice, demonstrating exceptional potential and promise.",
    recognizes: "Young design professionals or newly established firms, typically with less than 5–7 years of practice, demonstrating exceptional potential and promise.",
    image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 9,
    slug: "best-compact-home",
    number: "07",
    title: "Best Compact Home",
    shortDescription: "Recognising residential projects that creatively maximise functionality, comfort and design appeal within a limited floor area.",
    recognizes: "Residential projects that creatively maximise functionality, comfort and design appeal within a limited floor area.",
    image: "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 10,
    slug: "best-smart-home",
    number: "08",
    title: "Best Smart Home",
    shortDescription: "Recognising residences that seamlessly integrate automated technologies for lighting, climate control, security, entertainment and other aspects of home living.",
    recognizes: "Residences that seamlessly integrate automated technologies for lighting, climate control, security, entertainment and other aspects of home living.",
    image: "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 11,
    slug: "best-themed-project-of-the-year",
    number: "09",
    title: "Best Themed Project of the Year (Concept & Design)",
    shortDescription: "Recognising projects that create a cohesive and immersive design experience by effectively translating a distinctive creative concept or cultural theme into a physical living space.",
    recognizes: "Projects that create a cohesive and immersive design experience by effectively translating a distinctive creative concept or cultural theme into a physical living space.",
    image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 12,
    slug: "luxury-villa-project-of-the-year",
    number: "10",
    title: "Luxury Villa Project of the Year",
    shortDescription: "Recognising standalone villa projects that combine sophisticated architecture, elegant interiors, premium materials and thoughtfully designed indoor and outdoor living spaces.",
    recognizes: "Standalone villa projects that combine sophisticated architecture, elegant interiors, premium materials and thoughtfully designed indoor and outdoor living spaces.",
    image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 14,
    slug: "best-developer-of-the-year",
    number: "11",
    title: "Best Developer of the Year",
    shortDescription: "Recognising real estate developers who demonstrate excellence in project planning, design coordination, construction quality, timely delivery and the development of high-quality residential or commercial properties.",
    recognizes: "Real estate developers who demonstrate excellence in project planning, design coordination, construction quality, timely delivery and the development of high-quality residential or commercial properties.",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 15,
    slug: "best-organised-township-of-the-year",
    number: "12",
    title: "Best Organised Township of the Year",
    shortDescription: "Recognising well-planned township developments that integrate residential spaces, infrastructure, amenities, open spaces and community facilities to create a well-organised, sustainable and comfortable living environment.",
    recognizes: "Well-planned township developments that integrate residential spaces, infrastructure, amenities, open spaces and community facilities to create a well-organised, sustainable and comfortable living environment.",
    image: "https://images.unsplash.com/photo-1519999482648-25049ddd37b1?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 16,
    slug: "best-office-design-of-the-year",
    number: "13",
    title: "Best Office Design of the Year",
    shortDescription: "Recognising office spaces that demonstrate excellence in workplace planning, functionality, aesthetics, ergonomics and the effective use of space to support productivity, employee well-being and a positive work environment.",
    recognizes: "Office spaces that demonstrate excellence in workplace planning, functionality, aesthetics, ergonomics and the effective use of space to support productivity, employee well-being and a positive work environment.",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 17,
    slug: "best-commercial-building-of-the-year",
    number: "14",
    title: "Best Commercial Building of the Year",
    shortDescription: "Recognising commercial buildings that demonstrate excellence in architectural design, functionality, construction quality, sustainability and the effective integration of infrastructure and user-oriented facilities.",
    recognizes: "Commercial buildings that demonstrate excellence in architectural design, functionality, construction quality, sustainability and the effective integration of infrastructure and user-oriented facilities.",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
  },
];

// The 6 featured categories for homepage preview
export const FEATURED_CATEGORIES: AwardCategory[] = AWARD_CATEGORIES.filter((c) =>
  [1, 2, 4, 5, 7, 14].includes(c.id)
);

export function getCategoryBySlug(slug: string): AwardCategory | undefined {
  return AWARD_CATEGORIES.find((cat) => cat.slug === slug);
}
