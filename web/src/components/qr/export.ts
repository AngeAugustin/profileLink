import { renderStyledQr, type QrStyle } from "@/lib/qr-style";

function triggerDownload(url: string, filename: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export function slugifyFilename(name: string) {
  return (
    name
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 50) || "qr-code"
  );
}

export function downloadQrSvg(text: string, style: QrStyle, filename: string) {
  const { svg } = renderStyledQr(text, style);
  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
  triggerDownload(url, `${filename}.svg`);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Rasterizes the SVG so its longest side is `size` pixels. */
export async function downloadQrPng(text: string, style: QrStyle, filename: string, size: number) {
  const { svg, width, height } = renderStyledQr(text, style);
  const scale = size / Math.max(width, height);
  const w = Math.round(width * scale);
  const h = Math.round(height * scale);
  const sized = svg.replace("<svg ", `<svg width="${w}" height="${h}" `);
  const src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(sized)}`;

  const img = new Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("SVG could not be rasterized"));
    img.src = src;
  });

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  ctx.drawImage(img, 0, 0, w, h);

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) throw new Error("PNG encoding failed");
  const url = URL.createObjectURL(blob);
  triggerDownload(url, `${filename}.png`);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
