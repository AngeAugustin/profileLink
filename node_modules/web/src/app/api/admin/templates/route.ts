import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { audit } from "@/lib/audit-log";
import { jsonError } from "@/i18n/api";
import {
  createProfileTheme,
  ensureProfileThemes,
  isBuiltinThemeId,
  isThemeMood,
  isValidThemeId,
  listProfileThemes,
} from "@/lib/profile-themes";

export async function GET() {
  try {
    const admin = await getSessionUser();
    if (!admin) return jsonError("api.unauthorized", 401);
    if (admin.role !== "ADMIN") return jsonError("api.forbidden", 403);

    const [themes, themeGroups, publishedByTheme, totalProfiles] =
      await Promise.all([
        listProfileThemes(),
        prisma.profile.groupBy({
          by: ["theme"],
          _count: { _all: true },
          _sum: { views: true },
        }),
        prisma.profile.groupBy({
          by: ["theme"],
          where: { status: "PUBLISHED" },
          _count: { _all: true },
        }),
        prisma.profile.count(),
      ]);

    const usage = new Map(
      themeGroups.map((g) => [
        g.theme,
        { total: g._count._all, views: g._sum.views ?? 0 },
      ]),
    );
    const published = new Map(
      publishedByTheme.map((g) => [g.theme, g._count._all]),
    );

    const templates = themes
      .map((theme) => {
        const stats = usage.get(theme.id) ?? { total: 0, views: 0 };
        return {
          id: theme.id,
          name: theme.name,
          description: theme.description,
          mood: theme.mood,
          preview: theme.preview,
          accentDot: theme.accentDot,
          light: theme.light,
          enabled: theme.enabled,
          sortOrder: theme.sortOrder,
          profiles: stats.total,
          published: published.get(theme.id) ?? 0,
          views: stats.views,
          share:
            totalProfiles === 0
              ? 0
              : Math.round((stats.total / totalProfiles) * 1000) / 10,
          builtin: isBuiltinThemeId(theme.id),
        };
      })
      .sort((a, b) => b.profiles - a.profiles || a.sortOrder - b.sortOrder);

    return NextResponse.json({
      totalProfiles,
      templates,
    });
  } catch (error) {
    console.error(error);
    return jsonError("api.server", 500);
  }
}

const createSchema = z.object({
  id: z.string().trim().min(2).max(32),
  name: z.string().trim().min(1).max(80),
  description: z.string().trim().max(400).optional().default(""),
  mood: z.enum(["corporate", "light", "bold", "night"]).optional(),
  cloneFrom: z.string().trim().min(1).max(32).optional(),
  light: z.boolean().optional(),
  enabled: z.boolean().optional(),
});

export async function POST(request: Request) {
  try {
    const admin = await getSessionUser();
    if (!admin) return jsonError("api.unauthorized", 401);
    if (admin.role !== "ADMIN") return jsonError("api.forbidden", 403);

    await ensureProfileThemes();
    const body = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) return jsonError("api.invalid", 400);

    const id = parsed.data.id.toLowerCase();
    if (!isValidThemeId(id)) return jsonError("api.invalid", 400);
    if (parsed.data.mood && !isThemeMood(parsed.data.mood)) {
      return jsonError("api.invalid", 400);
    }

    try {
      const theme = await createProfileTheme({
        id,
        name: parsed.data.name,
        description: parsed.data.description,
        mood: parsed.data.mood,
        cloneFrom: parsed.data.cloneFrom,
        light: parsed.data.light,
        enabled: parsed.data.enabled,
      });

      audit({
        category: "ADMIN",
        action: "template.create",
        message: `Template créé : ${theme.id}`,
        actor: { id: admin.id, email: admin.email, role: admin.role },
        targetType: "ProfileTheme",
        targetId: theme.id,
        request,
        statusCode: 201,
        meta: { name: theme.name, cloneFrom: parsed.data.cloneFrom ?? null },
      });

      return NextResponse.json({ template: theme }, { status: 201 });
    } catch (err) {
      const code = err instanceof Error ? err.message : "";
      if (code === "ID_TAKEN") return jsonError("api.themeIdTaken", 409);
      if (code === "INVALID_ID") return jsonError("api.invalid", 400);
      throw err;
    }
  } catch (error) {
    console.error(error);
    return jsonError("api.server", 500);
  }
}
