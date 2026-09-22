import { AppShell } from "@/components/app/AppShell";
import { EditorView } from "@/components/app/EditorView";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditProfilePage({ params }: Props) {
  const { id } = await params;

  return (
    <AppShell>
      <EditorView profileId={id} />
    </AppShell>
  );
}
