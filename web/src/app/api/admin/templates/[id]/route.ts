import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { audit } from "@/lib/audit-log";
import { jsonError } from "@/i18n/api";
import {
  deleteProfileTheme,
  getProfileTheme,
  isThemeMood,
  parseThemeTokens,
  updateProfileTheme,
} from "@/lib/profile-themes";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const admin = await getSessionUser();
    if (!admin) return jsonError("api.unauthorized", 401);
    if (admin.role !== "ADMIN") return jsonError("api.forbidden", 403);

    const { id } = await params;
    const theme = await getProfileTheme(id);
    if (!theme) return jsonError("api.notFound", 404);

    const [profiles, published, viewsAgg] = await Promise.all([
      prisma.profile.count({ where: { theme: id } }),
      prisma.profile.count({ where: { theme: id, status: "PUBLISHED" } }),
      prisma.profile.aggregate({
        where: { theme: id },
        _sum: { views: true },
      }),
    ]);

    return NextResponse.json({
      template: {
        ...theme,
        profiles,
        published,
        views: viewsAgg._sum.views ?? 0,
      },
    });
  } catch (error) {
    console.error(error);
    return jsonError("api.server", 500);
  }
}

const patchSchema = z.object({
  name: z.string().trim().min(1).max(80).optional(),
  description: z.string().trim().max(400).optional(),
  mood: z.enum(["corporate", "light", "bold", "night"]).optional(),
  preview: z.string().trim().min(1).max(200).optional(),
  accentDot: z.string().trim().min(1).max(80).optional(),
  light: z.boolean().optional(),
  enabled: z.boolean().optional(),
  sortOrder: z.number().int().min(0).max(999).optional(),
  tokens: z.record(z.string(), z.string()).optional(),
});

export async function PATCH(request: Request, { params }: Params) {
  try {
    const admin = await getSessionUser();
    if (!admin) return jsonError("api.unauthorized", 401);
    if (admin.role !== "ADMIN") return jsonError("api.forbidden", 403);

    const { id } = await params;
    const existing = await getProfileTheme(id);
    if (!existing) return jsonError("api.notFound", 404);

    const body = await request.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) return jsonError("api.invalid", 400);

    if (parsed.data.mood && !isThemeMood(parsed.data.mood)) {
      return jsonError("api.invalid", 400);
    }

    let tokens = undefined;
    if (parsed.data.tokens) {
      const merged = { ...existing.tokens, ...parsed.data.tokens };
      const ok = parseThemeTokens(merged);
      if (!ok) return jsonError("api.invalid", 400);
      tokens = ok;
    }

    const theme = await updateProfileTheme(id, {
      name: parsed.data.name,
      description: parsed.data.description,
      mood: parsed.data.mood,
      preview: parsed.data.preview,
      accentDot: parsed.data.accentDot,
      light: parsed.data.light,
      enabled: parsed.data.enabled,
      sortOrder: parsed.data.sortOrder,
      tokens,
    });

    audit({
      category: "ADMIN",
      action: "template.update",
      message: `Template modifié : ${theme.id}`,
      actor: { id: admin.id, email: admin.email, role: admin.role },
      targetType: "ProfileTheme",
      targetId: theme.id,
      request,
      statusCode: 200,
      meta: { fields: Object.keys(parsed.data) },
    });

    return NextResponse.json({ template: theme });
  } catch (error) {
    console.error(error);
    return jsonError("api.server", 500);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const admin = await getSessionUser();
    if (!admin) return jsonError("api.unauthorized", 401);
    if (admin.role !== "ADMIN") return jsonError("api.forbidden", 403);

    const { id } = await params;

    try {
      await deleteProfileTheme(id);
    } catch (err) {
      const code = err instanceof Error ? err.message : "";
      if (code === "NOT_FOUND") return jsonError("api.notFound", 404);
      if (code === "IN_USE") return jsonError("api.themeInUse", 409);
      if (code === "BUILTIN") return jsonError("api.themeBuiltin", 400);
      throw err;
    }

    audit({
      category: "ADMIN",
      action: "template.delete",
      message: `Template supprimé : ${id}`,
      actor: { id: admin.id, email: admin.email, role: admin.role },
      targetType: "ProfileTheme",
      targetId: id,
      request: _request,
      statusCode: 200,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return jsonError("api.server", 500);
  }
}
