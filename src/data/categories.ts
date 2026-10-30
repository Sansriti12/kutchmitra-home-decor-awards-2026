export interface AwardCategory {
  id: number;
  slug: string;
  number: string;
  title: string;
  shortDescription: string;
  recognizes: string;
  image: string;
  suggestedParameters?: string[];
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
    suggestedParameters: [
      "Interpretation of Kutchi architectural heritage.",
      "Climate-responsive and context-sensitive design.",
      "Integration of traditional elements with contemporary needs.",
      "Use of local materials and construction techniques.",
    ],
  },
  {
    id: 2,
    slug: "best-luxury-residence",
    number: "02",
    title: "Best Luxury Residence",
    shortDescription: "Celebrating high-end residential projects distinguished by premium materials, bespoke design elements and exceptional craftsmanship.",
    recognizes: "High-end residential projects distinguished by premium materials, bespoke design elements and exceptional craftsmanship.",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
    suggestedParameters: [
      "Kutchi craftsmanship and local materials, where relevant.",
      "Climate-responsive luxury design.",
      "Harmony between architecture, interiors and landscape.",
      "Comfort and sustainability.",
    ],
  },
  {
    id: 4,
    slug: "best-renovation-project",
    number: "03",
    title: "Best Renovation Project",
    shortDescription: "Recognising projects that showcase a substantial and creative transformation of an existing space.",
    recognizes: "Projects that showcase a substantial and creative transformation of an existing space.",
    image: "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=800&q=80",
    suggestedParameters: [
      "Preservation of original architectural character, where applicable.",
      "Sensitive restoration of traditional elements.",
      "Modern facilities integrated without compromising heritage.",
      "Before-and-after documentation.",
    ],
  },
  {
    id: 5,
    slug: "best-sustainable-home",
    number: "04",
    title: "Best Sustainable Home",
    shortDescription: "Recognising residential projects that incorporate environmentally responsible materials, energy-efficient systems and climate-responsive design principles.",
    recognizes: "Residential projects that incorporate environmentally responsible materials, energy-efficient systems and climate-responsive design principles.",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
    suggestedParameters: [
      "Local stone, earth, lime, recycled or reclaimed materials.",
      "Passive cooling, ventilation, orientation and shading.",
      "Water conservation and sustainable landscaping.",
      "Energy efficiency and low-impact construction.",
    ],
  },
  {
    id: 7,
    slug: "interior-designer-of-the-year",
    number: "05",
    title: "Interior Designer of the Year",
    shortDescription: "Recognising interior design professionals or studios that demonstrate excellence in spatial planning, design aesthetics and overall execution.",
    recognizes: "Interior design professionals or studios that demonstrate excellence in spatial planning, design aesthetics and overall execution.",
    image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80",
    suggestedParameters: [
      "Integration of Kutchi crafts and regional materials, where relevant.",
      "Contemporary interpretation of traditional elements.",
      "Recognition and credit to artisans.",
      "Spatial harmony, natural light, ventilation and liveability.",
    ],
  },
  {
    id: 8,
    slug: "emerging-designer",
    number: "06",
    title: "Emerging Designer",
    shortDescription: "Recognising young design professionals or newly established firms, typically with less than 5–7 years of practice, who demonstrate exceptional potential, creativity and promise.",
    recognizes: "Young design professionals or newly established firms, typically with less than 5–7 years of practice, who demonstrate exceptional potential, creativity and promise.",
    image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80",
    suggestedParameters: [
      "Confirm the qualifying experience period before publication.",
      "Assess originality, quality of work and demonstrated potential.",
    ],
  },
  {
    id: 9,
    slug: "best-compact-home",
    number: "07",
    title: "Best Compact Home",
    shortDescription: "Recognising residential projects that creatively maximise functionality, comfort and design appeal within a limited floor area.",
    recognizes: "Residential projects that creatively maximise functionality, comfort and design appeal within a limited floor area.",
    image: "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=800&q=80",
    suggestedParameters: [
      "Efficient space utilisation and functional planning.",
      "Natural light and ventilation.",
      "Comfort, liveability and indoor-outdoor connection.",
    ],
  },
  {
    id: 10,
    slug: "best-smart-home",
    number: "08",
    title: "Best Smart Home",
    shortDescription: "Recognising residences that integrate automated technologies for lighting, climate control, security, entertainment and other aspects of modern home living.",
    recognizes: "Residences that integrate automated technologies for lighting, climate control, security, entertainment and other aspects of modern home living.",
    image: "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=800&q=80",
    suggestedParameters: [
      "Demonstrable performance and usefulness of technologies.",
      "Energy efficiency and intelligent climate control.",
      "Ease of use, reliability and integration.",
    ],
  },
  {
    id: 11,
    slug: "best-themed-project-of-the-year",
    number: "09",
    title: "Best Themed Project of the Year (Concept & Design)",
    shortDescription: "Recognising projects that translate a distinctive creative concept or cultural theme into a cohesive physical living space.",
    recognizes: "Projects that translate a distinctive creative concept or cultural theme into a cohesive physical living space.",
    image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80",
    suggestedParameters: [
      "Authenticity of cultural or regional concept.",
      "Meaningful integration of Kutchi motifs, textures and craftsmanship.",
      "Consistency between concept and execution.",
      "Avoid superficial cultural decoration.",
    ],
  },
  {
    id: 12,
    slug: "luxury-villa-project-of-the-year",
    number: "10",
    title: "Luxury Villa Project of the Year",
    shortDescription: "Recognising standalone villa projects that combine sophisticated architecture, elegant interiors, premium materials and thoughtfully designed indoor and outdoor living spaces.",
    recognizes: "Standalone villa projects that combine sophisticated architecture, elegant interiors, premium materials and thoughtfully designed indoor and outdoor living spaces.",
    image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80",
    suggestedParameters: [
      "Architectural quality and landscape integration.",
      "Craftsmanship, material quality and contextual response.",
      "Comfort, sustainability and climate response.",
    ],
  },
  {
    id: 14,
    slug: "best-developer-of-the-year",
    number: "11",
    title: "Best Developer of the Year",
    shortDescription: "Recognising real estate developers who demonstrate excellence in project planning, design coordination, construction quality, timely delivery and high-quality residential or commercial development.",
    recognizes: "Real estate developers who demonstrate excellence in project planning, design coordination, construction quality, timely delivery and high-quality residential or commercial development.",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80",
    suggestedParameters: [
      "Quality of planning and development approach.",
      "Construction quality, delivery and user experience.",
      "Sustainable development and local-context sensitivity.",
    ],
  },
  {
    id: 15,
    slug: "best-organised-township-of-the-year",
    number: "12",
    title: "Best Organised Township of the Year",
    shortDescription: "Recognising well-planned township developments integrating residential spaces, infrastructure, amenities, open spaces and community facilities.",
    recognizes: "Well-planned township developments integrating residential spaces, infrastructure, amenities, open spaces and community facilities.",
    image: "https://images.unsplash.com/photo-1519999482648-25049ddd37b1?auto=format&fit=crop&w=800&q=80",
    suggestedParameters: [
      "Integrated planning and community facilities.",
      "Open spaces and climate-responsive planning.",
      "Water management, infrastructure and sustainability.",
    ],
  },
  {
    id: 16,
    slug: "best-office-design-of-the-year",
    number: "13",
    title: "Best Office Design of the Year",
    shortDescription: "Recognising office spaces demonstrating excellence in workplace planning, functionality, aesthetics, ergonomics and effective use of space.",
    recognizes: "Office spaces demonstrating excellence in workplace planning, functionality, aesthetics, ergonomics and effective use of space.",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
    suggestedParameters: [
      "Workplace planning, ergonomics and functionality.",
      "Natural light, ventilation and employee comfort.",
      "Energy efficiency and responsible materials.",
    ],
  },
  {
    id: 17,
    slug: "best-commercial-building-of-the-year",
    number: "14",
    title: "Best Commercial Building of the Year",
    shortDescription: "Recognising commercial buildings demonstrating excellence in architectural design, functionality, construction quality, sustainability and user-oriented facilities.",
    recognizes: "Commercial buildings demonstrating excellence in architectural design, functionality, construction quality, sustainability and user-oriented facilities.",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
    suggestedParameters: [
      "Architectural quality and user experience.",
      "Sustainable design, climate response and material sensitivity.",
      "Infrastructure, accessibility and execution quality.",
    ],
  },
  {
    id: 18,
    slug: "excellence-in-vernacular-architecture",
    number: "15",
    title: "Excellence in Vernacular Architecture",
    shortDescription: "Recognising homes and residential projects that thoughtfully reinterpret Kutch's traditional architecture, including the bhunga, local building forms, courtyards, proportions and traditional spatial planning, while responding to contemporary living needs.",
    recognizes: "Homes and residential projects that thoughtfully reinterpret Kutch's traditional architecture, including the bhunga, local building forms, courtyards, proportions and traditional spatial planning, while responding to contemporary living needs.",
    image: "https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=800&q=80",
    suggestedParameters: [
      "Authentic understanding of traditional Kutchi building forms and spatial planning.",
      "Thoughtful interpretation of bhunga forms, courtyards and local architectural vocabulary.",
      "Traditional knowledge, local materials and techniques, where appropriate.",
      "Contemporary functionality and comfort without superficial imitation.",
    ],
  },
  {
    id: 19,
    slug: "excellence-in-kutchi-craft-and-artisan-integration",
    number: "16",
    title: "Excellence in Kutchi Craft & Artisan Integration",
    shortDescription: "Recognising interior or residential projects that meaningfully integrate Kutchi crafts and regional artisans, including embroidery, Ajrakh, Bandhani, woodwork, pottery, metalwork, leatherwork and other local craft traditions.",
    recognizes: "Interior or residential projects that meaningfully integrate Kutchi crafts and regional artisans, including embroidery, Ajrakh, Bandhani, woodwork, pottery, metalwork, leatherwork and other local craft traditions.",
    image: "https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=800&q=80",
    suggestedParameters: [
      "Meaningful and sensitive integration of Kutchi crafts.",
      "Quality, originality and relevance of craft application.",
      "Involvement, acknowledgement and appropriate credit to artisans.",
      "Contemporary interpretation that respects craft identity.",
    ],
  },
];

// The 6 featured categories for homepage preview
export const FEATURED_CATEGORIES: AwardCategory[] = AWARD_CATEGORIES.filter((c) =>
  [1, 2, 4, 5, 7, 14].includes(c.id)
);

export function getCategoryBySlug(slug: string): AwardCategory | undefined {
  // Support both hyphenated-and and plain forms for resilient matching
  if (slug === "excellence-in-kutchi-craft-artisan-integration") {
    return AWARD_CATEGORIES.find((cat) => cat.id === 19);
  }
  return AWARD_CATEGORIES.find((cat) => cat.slug === slug);
}
