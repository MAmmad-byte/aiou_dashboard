import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = await cookies();
  cookieStore.delete("dash_session");

  const laravelUrl = process.env.LARAVEL_URL ?? "https://eoffice.aiou.edu.pk";
  return NextResponse.redirect(`${laravelUrl}`);
}