export interface AwardCategory {
  id: number;
  slug: string;
  number: string;
  title: string;
  shortDescription: string;
  image: string;
}

export const AWARD_CATEGORIES: AwardCategory[] = [
  {
    id: 1,
    slug: "architect-of-the-year",
    number: "01",
    title: "Architect of the Year",
    shortDescription: "Honoring comprehensive architectural excellence, spatial innovation, and leadership in residential built design.",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 2,
    slug: "best-luxury-residence",
    number: "02",
    title: "Best Luxury Residence",
    shortDescription: "Recognizing exceptional bespoke residential architecture defined by elevated craftsmanship and refined materiality.",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 3,
    slug: "best-apartment-design",
    number: "03",
    title: "Best Apartment Design",
    shortDescription: "Celebrating intelligent spatial layouts, bespoke interior interventions, and elevated urban living environments.",
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 4,
    slug: "best-renovation-project",
    number: "04",
    title: "Best Renovation Project",
    shortDescription: "Highlighting exemplary transformations that reimagine existing structures while honoring structural character.",
    image: "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 5,
    slug: "best-sustainable-home",
    number: "05",
    title: "Best Sustainable Home",
    shortDescription: "Commending climate-responsive architecture, resource-efficient practices, and environmentally conscious design.",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 6,
    slug: "ultra-luxury-residential-project-of-the-year",
    number: "06",
    title: "Ultra-Luxury Residential Project of the Year",
    shortDescription: "Acknowledging landmark residential developments that embody peerless luxury, scale, and detailing.",
    image: "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 7,
    slug: "interior-designer-of-the-year",
    number: "07",
    title: "Interior Designer of the Year",
    shortDescription: "Spotlighting creative mastery in interior architecture, materiality curation, bespoke fixtures, and experiential ambience.",
    image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 8,
    slug: "emerging-designer",
    number: "08",
    title: "Emerging Designer",
    shortDescription: "Encouraging promising design practitioners demonstrating forward-thinking perspective and original creative rigor.",
    image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 9,
    slug: "best-compact-home",
    number: "09",
    title: "Best Compact Home",
    shortDescription: "Recognizing inventive multi-functional planning and meticulous design optimization in compact residential footprints.",
    image: "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 10,
    slug: "best-smart-home",
    number: "10",
    title: "Best Smart Home",
    shortDescription: "Celebrating seamless synergy between intuitive home automation, lighting technology, and architectural aesthetics.",
    image: "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 11,
    slug: "best-themed-project-of-the-year",
    number: "11",
    title: "Best Themed Project of the Year",
    shortDescription: "Commending distinctive design narratives that embody cohesive thematic, cultural, or stylistic execution.",
    image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 12,
    slug: "luxury-villa-project-of-the-year",
    number: "12",
    title: "Luxury Villa Project of the Year",
    shortDescription: "Honoring sprawling standalone villas showcasing harmonious landscape integration, architectural grandeur, and indoor-outdoor synergy.",
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
