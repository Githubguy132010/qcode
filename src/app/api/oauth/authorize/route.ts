import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const redirectUri = searchParams.get("redirect_uri");
  const state = searchParams.get("state");

  if (!redirectUri || !state) {
    return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
  }

  if (!supabase) {
    return NextResponse.json({ error: "Supabase client is not initialized." }, { status: 500 });
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/api/oauth/callback?redirect_uri=${encodeURIComponent(redirectUri)}&state=${encodeURIComponent(state)}`,
    },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.redirect(data.url);
}