import { NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabaseServer";

export async function POST() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.json({ ok: true });
}
