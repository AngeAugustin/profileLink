import { AppShell } from "@/components/app/AppShell";
import { QrEditorView } from "@/components/qr/QrEditorView";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditQrCodePage({ params }: Props) {
  const { id } = await params;

  return (
    <AppShell>
      <QrEditorView qrId={id} />
    </AppShell>
  );
}
