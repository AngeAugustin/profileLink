/** Contact channel icons (header row next to mail) — files in /public. */
export const CONTACT_SOCIAL_ICONS = ["whatsapp", "linkedin", "facebook"] as const;

export type ContactSocialIcon = (typeof CONTACT_SOCIAL_ICONS)[number];

export const SOCIAL_LINK_ICONS: Record<string, string> = {
  whatsapp: "/whatsapp.png",
  linkedin: "/linkedin.png",
  facebook: "/facebook.png",
};

export function socialLinkIconSrc(icon: string): string | null {
  return SOCIAL_LINK_ICONS[icon.toLowerCase()] ?? null;
}

export function isContactSocialIcon(icon: string): boolean {
  return (CONTACT_SOCIAL_ICONS as readonly string[]).includes(icon.toLowerCase());
}

/** Builds a WhatsApp deep link from a phone number (digits only). */
export function whatsappHrefFromPhone(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 8) return null;
  return `https://wa.me/${digits}`;
}

export function normalizeExternalHref(url: string): string {
  if (!url) return "#";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("mailto:")) {
    return url;
  }
  return `https://${url}`;
}
