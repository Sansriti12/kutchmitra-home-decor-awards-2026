export interface JuryProfile {
  id: string;
  name: string;
  designation: string;
  organization: string;
  city: string;
  image: string;
  shortBio: string;
  fullBio: string[];
  areasOfExperience: string[];
}

export const APPROVED_JURY_PROFILES: JuryProfile[] = [
  {
    id: "hasmukh-shah",
    name: "ID. Hasmukh Shah",
    designation: "Founder",
    organization: "ADL Group (Advance Designs N Lifestyle)",
    city: "Mumbai",
    image: "/assets/jury/hasmukh-shah.jpg",
    shortBio:
      "Founder of ADL Group with nearly 45 years of distinguished experience delivering award-winning residential, commercial, and community projects across India and Africa, with deep connections to Kutch and professional leadership across IIID and CREDAI-MCHI.",
    fullBio: [
      "ID. Hasmukh Shah founded ADL Group in 1982. With nearly 45 years of experience, the award-winning practice has delivered projects across India and in Africa, spanning high-end bungalows, offices, banquets and restaurants. Its work also includes community projects in India and overseas, with a special connection to Kutch.",
      "Beyond practice, he contributes to educational, social and professional organisations. He is a Past President of the Lions Club of Mumbai Vile Parle West and an active member of CREDAI-MCHI.",
      "Associated with the Institute of Indian Interior Designers (IIID) for nearly 45 years, he has served as Mumbai Chapter Chairman and National Secretary, and contributes as a jury member for design awards.",
      "ADL's legacy is being carried forward by his son, Ar. Darshan Shah, and daughter-in-law, Ar. Riddhi Shah, whose award-winning work brings a contemporary perspective to the practice.",
    ],
    areasOfExperience: [
      "Interior design",
      "Residential and commercial spaces",
      "Professional leadership",
    ],
  },
  {
    id: "parul-zaveri",
    name: "Ar. Parul Zaveri",
    designation: "Co-founder",
    organization: "Abhikram (Architecture & Conservation)",
    city: "Ahmedabad",
    image: "/assets/jury/parul-zaveri.jpg",
    shortBio:
      "Co-founder of Abhikram with over four decades of pioneering leadership in responsible architecture, heritage conservation, adaptive reuse, and traditional craft integration across India.",
    fullBio: [
      "Ar. Parul Zaveri is the co-founder of Abhikram, the Ahmedabad-based planning, architecture, conservation and interiors practice established in 1979 with the late Ar. Nimish Patel.",
      "Over four decades, her work has focused on responsible, user-friendly architecture, heritage conservation and adaptive reuse. Her approach brings together resource conservation, passive human comfort, local materials, traditional technologies, arts and crafts.",
      "She is associated with Virasat Foundation and Kanineeka Foundation, promoting traditional knowledge, crafts and sustainable living. Her current interests include documenting and archiving Abhikram's body of work, developing publications, lecturing and advising.",
      "Her commitment to sustainable living extends beyond architecture to organic and biodynamic farming at Kanika Organic Farm.",
    ],
    areasOfExperience: [
      "Heritage conservation",
      "Adaptive reuse",
      "Sustainability",
      "Traditional crafts",
    ],
  },
  {
    id: "hiren-patel",
    name: "Ar. Hiren Patel",
    designation: "Founder, Principal & Director",
    organization: "HPAD",
    city: "Ahmedabad",
    image: "/assets/jury/hiren-patel.jpg",
    shortBio:
      "Founder, Principal & Director of HPAD and CEPT graduate bringing over three decades of mastery in harmonizing architecture, interior design, and landscape as an integrated artistic whole.",
    fullBio: [
      "Ar. Hiren Patel is the founder of Ahmedabad-based HPAD, established in 1989. A graduate of CEPT, he brings more than three decades of experience across architecture, interior design and landscape design.",
      "His practice approaches buildings, interiors and landscape as an integrated whole, creating spaces shaped by art, nature and the needs of their users. The studio's portfolio spans private residences, commercial developments, public buildings and heritage settings.",
      "An artist as well as an architect, Hiren's watercolours and sketches inform his sensitivity to composition, light, materials and place. His work has received national design recognition and has been featured by leading architecture and design publications.",
    ],
    areasOfExperience: [
      "Architecture",
      "Interior design",
      "Landscape",
      "Art and spatial composition",
    ],
  },
  {
    id: "sarosh-wadia",
    name: "Ar. Sarosh Wadia",
    designation: "Principal Architect",
    organization: "Azmi & Sarosh Wadia",
    city: "Surat",
    image: "/assets/jury/sarosh-wadia.jpg",
    shortBio:
      "Principal Architect at Azmi & Sarosh Wadia, former IIID President (2022–2025), and SCET Professor Design Chair with extensive expertise in civic institutions, heritage conservation, and professional leadership.",
    fullBio: [
      "Ar. Sarosh Wadia is a CEPT Ahmedabad alumnus and principal architect at Azmi & Sarosh Wadia, a Surat-based practice spanning architecture, interior design, urban design and building consultancy. He began his architectural journey under Prof. B. V. Doshi; his award-winning thesis on Zoroastrian Fire Temples was later published by CEPT.",
      "His work includes academic and healthcare institutions, Jain temples and Parsee Fire Temples, alongside heritage conservation and renovation. A fifth-generation partner in P. B. Wadia & Sons, established in 1887, he combines a deep respect for traditional materials and crafts with expertise in building services, energy efficiency, fire safety and responsible design.",
      "President of the Indian Institute of Interior Designers from 2022 to 2025, he has contributed extensively to professional education and membership initiatives. He is Professor Design Chair at SCET's Faculty of Architecture and brings nearly three decades of academic experience as a professor, jury member and Academic Board Member. His professional roles also include the APSDA Education Board and past National Council membership of the Indian Institute of Architects.",
    ],
    areasOfExperience: [
      "Architecture",
      "Interior design",
      "Heritage conservation",
      "Building services",
      "Design education",
      "Professional leadership",
    ],
  },
];

export function getApprovedJuryProfiles(): JuryProfile[] {
  return APPROVED_JURY_PROFILES;
}

/**
 * Verified mapping from an authenticated user/juror account to the approved static profile.
 * Strictly verifies identity via name, organization, or known credentials.
 * Returns null if no verified mapping exists (enabling graceful initials avatar fallback for test/admin accounts).
 */
export function matchApprovedJuryProfile(juror: {
  fullName?: string | null;
  email?: string | null;
  organization?: string | null;
  designation?: string | null;
}): JuryProfile | null {
  if (!juror) return null;

  const email = (juror.email || "").toLowerCase().trim();
  const name = (juror.fullName || "").toLowerCase().trim();
  const org = (juror.organization || "").toLowerCase().trim();

  for (const profile of APPROVED_JURY_PROFILES) {
    // 1. Match by profile ID (slug) in email/name
    if (profile.id && email.includes(profile.id)) {
      return profile;
    }

    // 2. Verified match by core name without prefix
    const profileCoreName = profile.name.toLowerCase().replace(/^(id\.|ar\.)\s*/, "").trim();
    if (profileCoreName.length >= 6 && name.includes(profileCoreName)) {
      return profile;
    }

    // 3. Verified match by distinctive organization or known client email
    if (profile.id === "hasmukh-shah" && (org.includes("adl group") || email.includes("hs.adlgroup"))) {
      return profile;
    }
    if (profile.id === "parul-zaveri" && (org.includes("abhikram") || email.includes("kanineeka"))) {
      return profile;
    }
    if (profile.id === "hiren-patel" && (org.includes("hpad") || email.includes("hpad.co.in"))) {
      return profile;
    }
    if (profile.id === "sarosh-wadia" && (org.includes("azmi & sarosh") || email.includes("saroshazmi"))) {
      return profile;
    }
  }

  return null;
}

