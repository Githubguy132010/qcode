import { Mcp, Tool, ToolVisibility } from "@modelcontextprotocol/sdk";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabase } from "@/lib/supabaseClient";

const addCodeSchema = z.object({
  code: z.string().describe("The coupon code"),
  description: z.string().describe("A description of the coupon"),
  store: z.string().describe("The store the coupon is for"),
  expiry_date: z.string().optional().describe("The expiration date of the coupon in ISO 8601 format"),
  category: z.string().optional().describe("The category of the coupon"),
});

const removeCodeSchema = z.object({
  id: z.number().describe("The ID of the coupon to remove"),
});

const listCodesSchema = z.object({});

const addCodeTool = new Tool(addCodeSchema, {
  name: "addCode",
  description: "Adds a new coupon code.",
  visibility: ToolVisibility.Private,
  handler: async (input, context: any) => {
    // TODO: Replace with actual user ID from auth context
    const userId = context?.user?.id;
    if (!userId) {
      return { success: false, error: "User not authenticated." };
    }

    if (!supabase) {
      return { success: false, error: "Supabase client is not initialized." };
    }

    const { error } = await supabase
      .from('coupons')
      .insert([{
        user_id: userId,
        code: input.code,
        description: input.description,
        store: input.store,
        expiry_date: input.expiry_date,
        category: input.category,
      }]);

    if (error) {
      console.error("Error adding code:", error);
      return { success: false, error: error.message };
    }

    return {
      success: true,
      _meta: {
        "openai": {
          "outputTemplate": {
            "url": `${process.env.NEXT_PUBLIC_BASE_URL}/widgets/add-code-confirmation.html`
          }
        }
      }
    };
  },
});

const removeCodeTool = new Tool(removeCodeSchema, {
  name: "removeCode",
  description: "Removes a coupon code.",
  visibility: ToolVisibility.Private,
  handler: async (input, context: any) => {
    const userId = context?.user?.id;
    if (!userId) {
        return { success: false, error: "User not authenticated." };
    }

    if (!supabase) {
        return { success: false, error: "Supabase client is not initialized." };
    }

    const { data, error } = await supabase
      .from('coupons')
      .delete()
      .match({ id: input.id, user_id: userId });

    if (error) {
      console.error("Error removing code:", error);
      return { success: false, error: error.message };
    }

    if (!error) {
        return { success: true };
    } else {
        return { success: false, error: "Coupon not found or permission denied." };
    }
  },
});

const listCodesTool = new Tool(listCodesSchema, {
  name: "listCodes",
  description: "Lists all coupon codes.",
  visibility: ToolVisibility.Private,
  handler: async (input, context: any) => {
    const userId = context?.user?.id;
    if (!userId) {
        return { codes: [], error: "User not authenticated." };
    }

    if (!supabase) {
        return { codes: [], error: "Supabase client is not initialized." };
    }

    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error("Error listing codes:", error);
      return { codes: [], error: error.message };
    }

    return {
      codes: data,
      _meta: {
        "openai": {
          "outputTemplate": {
            "url": `${process.env.NEXT_PUBLIC_BASE_URL}/widgets/list-codes.html`,
            "payload": { "codes": data }
          }
        }
      }
    };
  },
});


const mcp = new Mcp({
  tools: [addCodeTool, removeCodeTool, listCodesTool],
  auth: {
    type: "oauth2",
    authorizationUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/oauth/authorize`,
    tokenUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/oauth/token`,
    // These values should be set in your environment variables
    // clientId: process.env.OAUTH_CLIENT_ID,
    // clientSecret: process.env.OAUTH_CLIENT_SECRET,
  },
});

async function getUserFromRequest(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return null;
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return null;
  }

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("mcp_access_tokens")
    .select("user_id")
    .eq("access_token", token)
    .single();

  if (error || !data) {
    return null;
  }

  return { id: data.user_id };
}

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  const payload = await req.json();
  const mcpResponse = await mcp.process(payload, { user });
  return NextResponse.json(mcpResponse, { status: 200 });
}

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  const mcpResponse = await mcp.process({}, { user });
  return NextResponse.json(mcpResponse, { status: 200 });
}