import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await hash("password123", 12);

  const user = await prisma.user.upsert({
    where: { email: "alex@profile.link" },
    update: {},
    create: {
      email: "alex@profile.link",
      name: "Alexandre D.",
      passwordHash,
      plan: "PRO",
      role: "USER",
    },
  });

  const adminHash = await hash("admin12345", 12);
  await prisma.user.upsert({
    where: { email: "admin@profile.link" },
    update: {},
    create: {
      email: "admin@profile.link",
      name: "Admin ProfileLink",
      passwordHash: adminHash,
      plan: "TEAM",
      role: "ADMIN",
    },
  });

  const profile = await prisma.profile.upsert({
    where: { slug: "jean-dupont" },
    update: {},
    create: {
      userId: user.id,
      slug: "jean-dupont",
      firstName: "Jean",
      lastName: "Dupont",
      title: "VP of Product & Strategic Design",
      bio: "12+ ans d'expérience à bâtir des produits SaaS B2B scalables. Passionné par l'intersection entre le design system, l'expérience utilisateur et les métriques de croissance produit.",
      location: "Paris, France",
      email: "jean.dupont@profilelink.pro",
      phone: "+33 6 42 19 88 00",
      avatarUrl:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=256&h=256&fit=crop&crop=face",
      coverUrl:
        "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=400&fit=crop",
      theme: "executive",
      accent: "primary",
      status: "PUBLISHED",
      isPrimary: true,
      availability: "Disponible pour missions de conseil stratégique",
      views: 1920,
      clicks: 320,
      qrScans: 142,
      experiences: {
        create: [
          {
            title: "VP Product & Design System",
            company: "Lumio Tech Cloud",
            location: "Paris / Hybride",
            startDate: "2022",
            endDate: null,
            current: true,
            highlights:
              "Direction d'une équipe de 18 Product & Design\nRéduction de 42% du time-to-delivery sur le design system",
            sortOrder: 0,
          },
          {
            title: "Senior Staff Product Designer",
            company: "Hexa Payments",
            location: "Londres / Paris",
            startDate: "2019",
            endDate: "2022",
            current: false,
            highlights:
              "Checkout ayant généré 50M€ ARR\nMise en conformité WCAG AA sur toute la plateforme",
            sortOrder: 1,
          },
        ],
      },
      education: {
        create: [
          {
            degree: "Master en Stratégie Digitale & Ergonomie",
            school: "École Supérieure de Design & Gobelins Paris",
            field: "Design / UX",
            year: "2017",
            note: "Mention Très Bien • Félicitations du jury",
            sortOrder: 0,
          },
        ],
      },
      certifications: {
        create: [
          {
            abbrev: "AWS",
            title: "AWS Certified Cloud Practitioner",
            issuer: "Amazon Web Services",
            status: "Vérifié (2024-2027)",
            sortOrder: 0,
          },
          {
            abbrev: "UX",
            title: "Google UX Specialization",
            issuer: "Coursera",
            status: "Vérifié Coursera",
            sortOrder: 1,
          },
        ],
      },
      skills: {
        create: [
          { label: "Design Systems Architecture", tone: "primary", sortOrder: 0 },
          { label: "Product Discovery & Strategy", tone: "primary", sortOrder: 1 },
          { label: "Figma Tokens & Auto-Layout", tone: "secondary", sortOrder: 2 },
          { label: "React & Tailwind CSS", tone: "secondary", sortOrder: 3 },
          { label: "User Research Quantitative", tone: "secondary", sortOrder: 4 },
        ],
      },
      links: {
        create: [
          {
            label: "LinkedIn",
            url: "https://linkedin.com/in/jeandupont-product",
            icon: "linkedin",
            visible: true,
            sortOrder: 0,
          },
          {
            label: "Facebook",
            url: "https://facebook.com/jean.dupont.product",
            icon: "facebook",
            visible: true,
            sortOrder: 1,
          },
          {
            label: "GitHub",
            url: "https://github.com/jean-dupont-sys",
            icon: "github",
            visible: true,
            sortOrder: 2,
          },
          {
            label: "Dribbble",
            url: "https://dribbble.com/jean-ds",
            icon: "dribbble",
            visible: true,
            sortOrder: 3,
          },
          {
            label: "TikTok",
            url: "https://tiktok.com/@jeandupont.design",
            icon: "tiktok",
            visible: true,
            sortOrder: 4,
          },
        ],
      },
      interests: {
        create: [
          { label: "Design systems open source", sortOrder: 0 },
          { label: "Trail running", sortOrder: 1 },
          { label: "Photographie urbaine", sortOrder: 2 },
        ],
      },
      languages: {
        create: [
          { label: "Français", level: "Natif", sortOrder: 0 },
          { label: "English", level: "C1", sortOrder: 1 },
          { label: "Español", level: "B1", sortOrder: 2 },
        ],
      },
    },
  });

  await prisma.profile.upsert({
    where: { slug: "jean-dupont-advisory" },
    update: {},
    create: {
      userId: user.id,
      slug: "jean-dupont-advisory",
      firstName: "Jean",
      lastName: "Dupont",
      title: "Product Strategy & Design System Advisor",
      bio: "Conseil stratégique produit et design systems pour équipes scale-up.",
      location: "Paris, France",
      status: "PUBLISHED",
      isPrimary: false,
      views: 920,
      clicks: 167,
      qrScans: 52,
    },
  });

  await prisma.profile.upsert({
    where: { slug: "jean-dupont-speaker" },
    update: {},
    create: {
      userId: user.id,
      slug: "jean-dupont-speaker",
      firstName: "Jean",
      lastName: "Dupont",
      title: "Keynotes, ateliers & masterclasses tech",
      bio: "",
      status: "DRAFT",
      isPrimary: false,
    },
  });

  console.log("Seed OK");
  console.log("  User : alex@profile.link / password123");
  console.log("  Admin: admin@profile.link / admin12345");
  console.log("  Profil publié:", profile.slug);

  const planDefaults = [
    { plan: "FREE" as const, name: "Gratuit", priceMonthly: 0 },
    { plan: "PRO" as const, name: "Pro", priceMonthly: 7 },
    { plan: "TEAM" as const, name: "Team", priceMonthly: 19 },
  ];
  for (const offer of planDefaults) {
    await prisma.planOffer.upsert({
      where: { plan: offer.plan },
      create: offer,
      update: {},
    });
  }

  const admin = await prisma.user.findUnique({
    where: { email: "admin@profile.link" },
  });
  if (admin) {
    const existingNotifs = await prisma.notification.count({
      where: { userId: admin.id },
    });
    if (existingNotifs === 0) {
      await prisma.notification.createMany({
        data: [
          {
            userId: admin.id,
            type: "WELCOME",
            title: "Bienvenue sur ProfileLink",
            body: "Votre espace est prêt. Créez ou publiez un profil pour commencer.",
            href: "/app",
          },
          {
            userId: admin.id,
            type: "PROFILE_PUBLISHED",
            title: "Profil publié",
            body: `« ${profile.firstName} ${profile.lastName} » est en ligne sur /p/${profile.slug}.`,
            href: `/app/profils/${profile.id}`,
          },
          {
            userId: admin.id,
            type: "PLAN",
            title: "Forfait Pro actif",
            body: "Vous bénéficiez des profils illimités et des analytics avancées.",
            href: "/app/parametres?tab=subscription",
          },
          {
            userId: user.id,
            type: "WELCOME",
            title: "Bienvenue sur ProfileLink",
            body: "Créez votre premier profil professionnel et partagez-le avec un lien ou un QR code.",
            href: "/app/profils/nouveau",
          },
        ],
      });
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
