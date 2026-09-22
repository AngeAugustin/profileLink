import { NextResponse } from "next/server";
import { destroySession, getSessionUser } from "@/lib/auth";
import { audit } from "@/lib/audit-log";

export async function POST(request: Request) {
  const user = await getSessionUser();
  await destroySession();
  if (user) {
    audit({
      category: "AUTH",
      action: "auth.logout",
      message: `User signed out (${user.email})`,
      actor: { id: user.id, email: user.email, role: user.role },
      request,
      statusCode: 200,
    });
  }
  return NextResponse.json({ ok: true });
}
