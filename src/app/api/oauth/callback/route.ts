import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const redirectUri = searchParams.get("redirect_uri");
  const state = searchParams.get("state");

  if (!code || !redirectUri || !state) {
    return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
  }

  if (!supabase) {
    return NextResponse.json({ error: "Supabase client is not initialized." }, { status: 500 });
  }

  const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);

  if (sessionError) {
    return NextResponse.json({ error: sessionError.message }, { status: 500 });
  }

  const { user, session } = sessionData;

  if (!session || !user) {
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }

  const { error: dbError } = await supabase
    .from("mcp_access_tokens")
    .insert([{
      user_id: user.id,
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_at: new Date(Date.now() + (session.expires_in ?? 3600) * 1000).toISOString(),
    }]);

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  const finalRedirectUri = new URL(redirectUri);
  finalRedirectUri.searchParams.set("code", session.access_token);
  finalRedirectUri.searchParams.set("state", state);

  return NextResponse.redirect(finalRedirectUri.toString());
}