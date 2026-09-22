import { Prisma } from "@prisma/client";
import { prisma } from "./db";

export type ExperienceInput = {
  title: string;
  company: string;
  location?: string;
  startDate: string;
  endDate?: string | null;
  current?: boolean;
  highlights?: string;
  sortOrder?: number;
};

export type EducationInput = {
  degree: string;
  school: string;
  field?: string;
  year: string;
  note?: string;
  sortOrder?: number;
};

export type CertificationInput = {
  abbrev?: string;
  title: string;
  issuer?: string;
  status?: string;
  url?: string | null;
  sortOrder?: number;
};

export type SkillInput = {
  label: string;
  tone?: string;
  sortOrder?: number;
};

export type LinkInput = {
  label: string;
  url: string;
  icon?: string;
  visible?: boolean;
  sortOrder?: number;
};

export type InterestInput = {
  label: string;
  sortOrder?: number;
};

export type LanguageInput = {
  label: string;
  level?: string;
  sortOrder?: number;
};

export type ProjectInput = {
  title: string;
  role?: string;
  description?: string;
  url?: string | null;
  year?: string;
  tags?: string;
  sortOrder?: number;
};

export type ProfileNestedInput = {
  experiences?: ExperienceInput[];
  projects?: ProjectInput[];
  education?: EducationInput[];
  certifications?: CertificationInput[];
  skills?: SkillInput[];
  links?: LinkInput[];
  interests?: InterestInput[];
  languages?: LanguageInput[];
};

export async function syncProfileNested(profileId: string, nested: ProfileNestedInput) {
  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    if (nested.experiences !== undefined) {
      await tx.experience.deleteMany({ where: { profileId } });
      if (nested.experiences.length > 0) {
        await tx.experience.createMany({
          data: nested.experiences.map((e, i) => ({
            profileId,
            title: e.title,
            company: e.company,
            location: e.location ?? "",
            startDate: e.startDate,
            endDate: e.current ? null : (e.endDate ?? null),
            current: e.current ?? false,
            highlights: e.highlights ?? "",
            sortOrder: e.sortOrder ?? i,
          })),
        });
      }
    }

    if (nested.projects !== undefined) {
      await tx.project.deleteMany({ where: { profileId } });
      if (nested.projects.length > 0) {
        await tx.project.createMany({
          data: nested.projects.map((p, i) => ({
            profileId,
            title: p.title,
            role: p.role ?? "",
            description: p.description ?? "",
            url: p.url || null,
            year: p.year ?? "",
            tags: p.tags ?? "",
            sortOrder: p.sortOrder ?? i,
          })),
        });
      }
    }

    if (nested.education !== undefined) {
      await tx.education.deleteMany({ where: { profileId } });
      if (nested.education.length > 0) {
        await tx.education.createMany({
          data: nested.education.map((e, i) => ({
            profileId,
            degree: e.degree,
            school: e.school,
            field: e.field ?? "",
            year: e.year,
            note: e.note ?? "",
            sortOrder: e.sortOrder ?? i,
          })),
        });
      }
    }

    if (nested.certifications !== undefined) {
      await tx.certification.deleteMany({ where: { profileId } });
      if (nested.certifications.length > 0) {
        await tx.certification.createMany({
          data: nested.certifications.map((c, i) => ({
            profileId,
            abbrev: c.abbrev ?? "",
            title: c.title,
            issuer: c.issuer ?? "",
            status: c.status ?? "",
            url: c.url ?? null,
            sortOrder: c.sortOrder ?? i,
          })),
        });
      }
    }

    if (nested.skills !== undefined) {
      await tx.skill.deleteMany({ where: { profileId } });
      if (nested.skills.length > 0) {
        await tx.skill.createMany({
          data: nested.skills.map((s, i) => ({
            profileId,
            label: s.label,
            tone: s.tone ?? "secondary",
            sortOrder: s.sortOrder ?? i,
          })),
        });
      }
    }

    if (nested.links !== undefined) {
      await tx.socialLink.deleteMany({ where: { profileId } });
      if (nested.links.length > 0) {
        await tx.socialLink.createMany({
          data: nested.links.map((l, i) => ({
            profileId,
            label: l.label,
            url: l.url,
            icon: l.icon ?? "link",
            visible: l.visible ?? true,
            sortOrder: l.sortOrder ?? i,
          })),
        });
      }
    }

    if (nested.interests !== undefined) {
      await tx.interest.deleteMany({ where: { profileId } });
      if (nested.interests.length > 0) {
        await tx.interest.createMany({
          data: nested.interests.map((item, i) => ({
            profileId,
            label: item.label,
            sortOrder: item.sortOrder ?? i,
          })),
        });
      }
    }

    if (nested.languages !== undefined) {
      await tx.language.deleteMany({ where: { profileId } });
      if (nested.languages.length > 0) {
        await tx.language.createMany({
          data: nested.languages.map((item, i) => ({
            profileId,
            label: item.label,
            level: item.level ?? "",
            sortOrder: item.sortOrder ?? i,
          })),
        });
      }
    }
  });
}

/** Parse "2022 — Présent (Paris)" into startDate / endDate / current */
export function parseExperiencePeriod(period: string) {
  const parts = period.split("—").map((s) => s.trim());
  const startDate = parts[0] ?? "";
  const rest = parts[1] ?? "";
  const current = /présent|present|aujourd|now/i.test(rest);
  const endDate = current ? null : rest.split("(")[0]?.trim() || null;
  const locationMatch = rest.match(/\(([^)]+)\)/);
  return {
    startDate,
    endDate,
    current,
    location: locationMatch?.[1] ?? "",
  };
}

export function formatExperiencePeriod(
  startDate: string,
  endDate: string | null,
  current: boolean,
  location?: string,
) {
  const end = current ? "Présent" : endDate ?? "";
  const loc = location ? ` (${location})` : "";
  return `${startDate} — ${end}${loc}`.trim();
}

export function getProfilePublicUrl(slug: string) {
  const base =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");
  return `${base}/p/${slug}`;
}
