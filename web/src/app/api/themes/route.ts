import { NextResponse } from "next/server";
import { listProfileThemes } from "@/lib/profile-themes";

/** Public catalog of enabled profile themes. */
export async function GET() {
  try {
    const themes = await listProfileThemes({ enabledOnly: true });
    return NextResponse.json({
      themes: themes.map((t) => ({
        id: t.id,
        name: t.name,
        description: t.description,
        mood: t.mood,
        preview: t.preview,
        accentDot: t.accentDot,
        light: t.light,
        sortOrder: t.sortOrder,
        tokens: t.tokens,
      })),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ themes: [] }, { status: 500 });
  }
}
