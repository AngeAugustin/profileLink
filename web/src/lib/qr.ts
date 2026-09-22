import QRCode from "qrcode";
import { getProfilePublicUrl } from "./profile-sync";

type QrOptions = {
  slug: string;
  format?: "png" | "svg";
  size?: number;
};

export async function generateProfileQr({ slug, format = "png", size = 512 }: QrOptions) {
  const url = getProfilePublicUrl(slug);

  if (format === "svg") {
    const svg = await QRCode.toString(url, {
      type: "svg",
      margin: 2,
      color: {
        dark: "#0037b0",
        light: "#ffffff",
      },
    });
    return { url, data: svg, contentType: "image/svg+xml" };
  }

  const buffer = await QRCode.toBuffer(url, {
    type: "png",
    width: size,
    margin: 2,
    color: {
      dark: "#0037b0",
      light: "#ffffff",
    },
  });

  return { url, data: buffer, contentType: "image/png" };
}

export async function generateProfileQrDataUrl(slug: string, size = 256) {
  const url = getProfilePublicUrl(slug);
  const dataUrl = await QRCode.toDataURL(url, {
    width: size,
    margin: 2,
    color: { dark: "#0037b0", light: "#ffffff" },
  });
  return { url, dataUrl };
}
