import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req: NextRequest) {
  const { code } = await req.json();

  if (!code) {
    return NextResponse.json({ error: "Missing required parameter: code" }, { status: 400 });
  }

  if (!supabase) {
    return NextResponse.json({ error: "Supabase client is not initialized." }, { status: 500 });
  }

  const { data, error } = await supabase
    .from("mcp_access_tokens")
    .select("access_token, expires_at")
    .eq("access_token", code)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return NextResponse.json({ error: "Token expired" }, { status: 401 });
  }

  return NextResponse.json({
    access_token: data.access_token,
    token_type: "bearer",
    expires_in: data.expires_at ? Math.floor((new Date(data.expires_at).getTime() - Date.now()) / 1000) : 3600,
  });
}