import { notFound } from "next/navigation";
import { ThemePreviewPage } from "@/components/marketing/ThemePreviewPage";
import { getProfileTheme } from "@/lib/profile-themes";

type Props = { params: Promise<{ theme: string }> };

export default async function ThemePreviewRoute({ params }: Props) {
  const { theme: themeId } = await params;
  const theme = await getProfileTheme(themeId);
  if (!theme || !theme.enabled) notFound();

  return (
    <ThemePreviewPage
      theme={{
        id: theme.id,
        name: theme.name,
        description: theme.description,
        mood: theme.mood,
        preview: theme.preview,
        tokens: theme.tokens,
      }}
    />
  );
}
