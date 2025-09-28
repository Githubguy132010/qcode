import { NextResponse } from 'next/server'

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return NextResponse.json({
    message: "Vercel Environment Variable Check",
    NEXT_PUBLIC_SUPABASE_URL_STATUS: supabaseUrl ? `Set (length: ${supabaseUrl.length})` : "Not Set",
    NEXT_PUBLIC_SUPABASE_ANON_KEY_STATUS: supabaseAnonKey ? `Set (length: ${supabaseAnonKey.length})` : "Not Set",
  });
}