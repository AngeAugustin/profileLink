import { AppShell } from "@/components/app/AppShell";
import { QrEditorView } from "@/components/qr/QrEditorView";

export default function NewQrCodePage() {
  return (
    <AppShell>
      <QrEditorView />
    </AppShell>
  );
}
