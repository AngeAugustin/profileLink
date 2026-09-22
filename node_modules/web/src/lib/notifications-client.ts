/** Client-safe icon map (no Prisma / server imports). */
export function notificationIcon(type: string): string {
  switch (type) {
    case "WELCOME":
      return "waving_hand";
    case "PROFILE_PUBLISHED":
      return "public";
    case "PROFILE_CREATED":
      return "person_add";
    case "PROFILE_VIEW":
      return "visibility";
    case "QR_SCAN":
      return "qr_code_2";
    case "LINK_CLICK":
      return "ads_click";
    case "WEEKLY_DIGEST":
      return "insights";
    case "PROFILE_INCOMPLETE":
      return "edit_note";
    case "PLAN":
      return "workspace_premium";
    case "PRODUCT":
      return "campaign";
    case "SYSTEM":
    default:
      return "info";
  }
}
