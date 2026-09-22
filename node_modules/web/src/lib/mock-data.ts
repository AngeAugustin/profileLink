export const ASSETS = {
  logo: "/logo.svg",
  avatarUser:
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=96&h=96&fit=crop&crop=face",
  avatarJean:
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=256&h=256&fit=crop&crop=face",
  cover:
    "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=400&fit=crop",
};

export const currentUser = {
  displayName: "Jean",
  accountName: "Alexandre D.",
  email: "alex@profile.link",
  plan: "Pro" as const,
  publicHandle: "profile.link/alexandre",
  avatarUrl: ASSETS.avatarUser,
};

export const dashboardKpis = {
  weeklyNewVisits: 342,
  activeProfiles: { count: 3, limit: 5, published: 2, drafts: 1 },
  views30d: { value: 2840, deltaPct: 18.4, previous: 2398 },
  clicks: { value: 487, deltaPct: 12.1, engagementPct: 17.1 },
  qrScans: { value: 194, deltaPct: 34.0 },
};

export type ProfileStatus = "online" | "draft";

export type ProfileCardData = {
  id: string;
  name: string;
  title: string;
  slug: string;
  status: ProfileStatus;
  badge?: string;
  isPrimary?: boolean;
  avatarType: "image" | "initials" | "icon";
  avatarUrl?: string;
  initials?: string;
  icon?: string;
  stats?: { views: number; clicks: number; qrScans: number };
  updatedAt?: string;
  createdAt?: string;
  completion?: number;
  completionHint?: string;
  slugReserved?: boolean;
};

export const profiles: ProfileCardData[] = [
  {
    id: "jean-dupont",
    name: "Jean Dupont",
    title: "VP Product & Design • SaaS Specialist",
    slug: "jean-dupont",
    status: "online",
    badge: "Principal",
    avatarType: "image",
    avatarUrl: ASSETS.avatarJean,
    stats: { views: 1920, clicks: 320, qrScans: 142 },
    updatedAt: "il y a 2 jours",
  },
  {
    id: "jean-dupont-advisory",
    name: "Conseil & Advisory",
    title: "Product Strategy & Design System Advisor",
    slug: "jean-dupont-advisory",
    status: "online",
    avatarType: "initials",
    initials: "JD",
    stats: { views: 920, clicks: 167, qrScans: 52 },
    updatedAt: "il y a 6 jours",
  },
  {
    id: "jean-dupont-speaker",
    name: "Conférencier & Mentor",
    title: "Keynotes, ateliers & masterclasses tech",
    slug: "jean-dupont-speaker",
    status: "draft",
    avatarType: "icon",
    icon: "mic",
    completion: 65,
    completionHint: "Ajoutez vos vidéos de présentation",
    createdAt: "Créé le 12 octobre",
    slugReserved: true,
  },
];

export const activityFeed = [
  {
    type: "qr_scan",
    icon: "qr_code",
    title: "Scan QR Card physique",
    meta: "Paris, France • Profil Principal",
    time: "il y a 4m",
  },
  {
    type: "link_click",
    icon: "link",
    title: "Clic lien: Calendly Book",
    meta: "San Francisco, US • Conseil & Advisory",
    time: "il y a 28m",
  },
  {
    type: "view",
    icon: "visibility",
    title: "Consultation directe",
    meta: "Lyon, France • Via LinkedIn",
    time: "il y a 1h",
  },
  {
    type: "vcard",
    icon: "download",
    title: "Téléchargement contact vCard",
    meta: "Bruxelles, Belgique",
    time: "il y a 3h",
  },
];

export const editorProfile = {
  id: "jean-dupont",
  versionLabel: "v2.4 Live",
  completionPct: 85,
  slug: "jean-dupont",
  indexed: true,
  theme: "executive",
  accent: "primary",
  identity: {
    firstName: "Jean",
    lastName: "Dupont",
    title: "Head of Product & Design Systems Lead",
    bio: "Architecte d'expériences numériques scalables. 12+ ans à bâtir des produits SaaS B2B à l'intersection du design system, de l'UX et de la croissance produit.",
    location: "Paris, France & Remote",
    email: "jean.dupont@profilelink.pro",
    phone: "+33 6 42 19 88 00",
  },
  media: {
    avatarUrl: ASSETS.avatarJean,
    coverUrl: ASSETS.cover,
  },
  links: [
    {
      id: "1",
      label: "LinkedIn",
      url: "linkedin.com/in/jeandupont-product",
      visible: true,
      icon: "linkedin",
    },
    {
      id: "2",
      label: "Facebook",
      url: "facebook.com/jean.dupont.product",
      visible: true,
      icon: "facebook",
    },
    {
      id: "3",
      label: "GitHub",
      url: "github.com/jean-dupont-sys",
      visible: true,
      icon: "github",
    },
    {
      id: "4",
      label: "Dribbble",
      url: "dribbble.com/jean-ds",
      visible: true,
      icon: "dribbble",
    },
    {
      id: "5",
      label: "TikTok",
      url: "tiktok.com/@jeandupont.design",
      visible: true,
      icon: "tiktok",
    },
  ],
  experiences: [
    {
      id: "1",
      title: "VP Product & Design System",
      company: "Lumio Tech Cloud",
      location: "Paris / Hybride",
      period: "2022 — Aujourd'hui",
      current: true,
      highlights:
        "Direction d'une équipe de 18 Product & Design\nRéduction de 42% du time-to-delivery sur le design system\nMise en place du design system multi-produits et gouvernance des tokens",
    },
    {
      id: "2",
      title: "Senior Staff Product Designer",
      company: "Hexa Payments",
      location: "Londres / Paris",
      period: "2019 — 2022",
      current: false,
      highlights:
        "Checkout ayant généré 50M€ ARR\nMise en conformité WCAG AA sur toute la plateforme\nAnimation des rituels Product Discovery & Design Ops",
    },
    {
      id: "3",
      title: "Product Designer",
      company: "Nova Mobility",
      location: "Paris, France",
      period: "2017 — 2019",
      current: false,
      highlights:
        "Conception de l'app mobilité B2B (iOS / Android)\nRecherche utilisateur quantitative & ateliers stakeholders\nDesign system initial partagé avec l'équipe engineering",
    },
  ],
  projects: [
    {
      id: "1",
      title: "Design System Lumio",
      role: "Lead Design System",
      year: "2023 — 2024",
      url: "https://example.com/lumio-ds",
      tags: "Figma, Tokens, React",
      description:
        "Système multi-marque adopté par 6 produits — documentation live, gouvernance tokens et CI visuelle.",
    },
    {
      id: "2",
      title: "Checkout Hexa",
      role: "Product Design",
      year: "2021",
      url: "",
      tags: "Fintech, Conversion",
      description:
        "Parcours de paiement simplifié ayant porté le taux de conversion checkout de +18 pts.",
    },
  ],
  education: [
    {
      id: "1",
      degree: "Master en Stratégie Digitale & Ergonomie",
      school: "École Supérieure de Design & Gobelins Paris",
      year: "2017",
      note: "Mention Très Bien • Félicitations du jury",
    },
  ],
  certifications: [
    {
      id: "1",
      abbrev: "AWS",
      title: "AWS Certified Cloud Practitioner",
      status: "Vérifié (2024-2027)",
    },
    {
      id: "2",
      abbrev: "UX",
      title: "Google UX Specialization",
      status: "Vérifié Coursera",
    },
  ],
  skills: [
    { id: "1", label: "Design Systems Architecture", tone: "primary" as const },
    { id: "2", label: "Product Discovery & Strategy", tone: "primary" as const },
    { id: "3", label: "Figma Tokens & Auto-Layout", tone: "secondary" as const },
    { id: "4", label: "React & Tailwind CSS", tone: "secondary" as const },
    { id: "5", label: "User Research Quantitative", tone: "secondary" as const },
  ],
  interests: [
    { id: "1", label: "Design systems open source" },
    { id: "2", label: "Trail running" },
    { id: "3", label: "Photographie urbaine" },
    { id: "4", label: "Café de spécialité" },
  ],
  languages: [
    { id: "1", label: "Français", level: "Natif" },
    { id: "2", label: "English", level: "C1" },
    { id: "3", label: "Español", level: "B1" },
  ],
};

export const publicProfile = {
  ...editorProfile,
  headline: "VP of Product & Strategic Design",
  location: "Paris, France",
  availability: "Disponible pour missions de conseil stratégique",
  bio: "12+ ans d'expérience à bâtir des produits SaaS B2B scalables. Passionné par l'intersection entre le design system, l'expérience utilisateur et les métriques de croissance produit.",
  stats: [
    { icon: "rocket_launch", label: "Produits lancés", value: "14+", sub: "SaaS B2B & Apps grand public", tone: "primary" as const },
    { icon: "groups", label: "Équipe dirigée", value: "18", sub: "Product, Design & Research", tone: "tertiary" as const },
    { icon: "trending_up", label: "Croissance ARR", value: "×4.2", sub: "Sur 3 exercices consécutifs", tone: "primary" as const },
  ],
};

export const pricingPlans = [
  {
    id: "starter",
    name: "Starter",
    price: "0€",
    period: "/ pour toujours",
    blurb: "Pour les étudiants et freelances débutants voulant une présence soignée.",
    featured: false,
    cta: "Commencer gratuitement",
    ctaHref: "/inscription",
    features: [
      "1 profil professionnel complet",
      "QR code vectoriel standard",
      "Analytics sur 30 jours glissants",
      "URL en profilelink.me/p/nom",
    ],
  },
  {
    id: "pro",
    name: "Professionnel",
    price: "39€",
    period: "/ an (soit ~3,25€/mois)",
    blurb:
      "Pour les consultants, dirigeants et experts souhaitant une vitrine ultra-performante.",
    featured: true,
    badge: "Le plus populaire",
    cta: "Essai Pro 14 jours offert",
    ctaHref: "/inscription",
    features: [
      "Profils illimités (Multi-casquettes)",
      "Tous les templates & thèmes premium",
      "QR code sur-mesure (logo, couleurs HD)",
      "Connexion de votre nom de domaine propre",
      "Analytics complètes en temps réel illimitées",
      "Profil protégé par mot de passe (option)",
    ],
  },
  {
    id: "team",
    name: "Team & Entreprise",
    price: "Sur mesure",
    period: "",
    blurb: "Pour agences, cabinets de recrutement et équipes commerciales entières.",
    featured: false,
    cta: "Contacter l'équipe commerciale",
    ctaHref: "/contact",
    features: [
      "Console centralisée d'équipe",
      "Charte graphique & templates d'entreprise",
      "Commande groupée de cartes NFC métal",
      "SSO Okta/Google + conformité RGPD dédiée",
    ],
  },
];

export const faqItems = [
  {
    q: "En quoi ProfileLink diffère-t-il d'un profil LinkedIn ou d'un Linktree ?",
    a: "LinkedIn est un réseau social fermé qui force vos visiteurs à se connecter pour voir votre parcours, tout en affichant des publicités et profils concurrents. Linktree est conçu pour empiler des liens sociaux superficiels. ProfileLink est un véritable portfolio structuré haut de gamme avec vos réalisations, votre QR code, vos certifications vérifiables et vos coordonnées directes, sans friction.",
  },
  {
    q: "Si je mets à jour mon profil, dois-je régénérer mon QR code ?",
    a: "Absolument pas ! Tous nos QR codes sont dynamiques. Vous pouvez changer d'entreprise, modifier votre numéro de téléphone, remplacer vos liens ou modifier entièrement votre biographie : le QR code déjà imprimé sur vos cartes de visite physiques continuera de diriger immédiatement vers vos informations actualisées.",
  },
  {
    q: "Puis-je utiliser mon propre nom de domaine personnalisé ?",
    a: "Oui. Avec le forfait Pro, vous pouvez lier en 2 minutes un domaine ou sous-domaine que vous possédez déjà (comme profil.votrenom.fr ou votrenom.com). Nous générons et renouvelons le certificat de sécurité SSL HTTPS automatiquement sans frais supplémentaires.",
  },
  {
    q: "Comment fonctionne la protection par mot de passe ?",
    a: "Si vous travaillez sur des projets sous accord de confidentialité (NDA) ou souhaitez réserver votre CV à des recruteurs précis, vous pouvez verrouiller l'ensemble ou une sous-section de votre profil par un mot de passe que vous partagez uniquement aux personnes concernées.",
  },
  {
    q: "Mes données personnelles sont-elles protégées et conformes au RGPD ?",
    a: "Totalement. Nos serveurs d'hébergement sont implantés dans l'Union Européenne. Nous ne vendons aucune donnée personnelle ni comportementale à des régies publicitaires. Vous disposez d'un bouton d'exportation complète et de suppression définitive de votre compte en conformité totale avec les règlements européens.",
  },
];
