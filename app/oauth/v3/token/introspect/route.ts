import { NextResponse } from "next/server";
import { mcpTokens } from "@/lib/store";

export async function POST(req: Request) {
  let body: Record<string, string>;
  const contentType = req.headers.get("content-type") || "";

  try {
    if (contentType.includes("application/json")) {
      body = await req.json();
    } else {
      const text = await req.text();
      body = Object.fromEntries(new URLSearchParams(text).entries());
    }
  } catch {
    return NextResponse.json(
      {
        error: "invalid_request",
        error_description: "Failed to parse request body",
      },
      { status: 400, headers: corsHeaders() },
    );
  }

  const token = body.token;
  if (!token) {
    return NextResponse.json(
      {
        error: "invalid_request",
        error_description: "Missing required parameter 'token'.",
      },
      { status: 400, headers: corsHeaders() },
    );
  }

  const tokenSession = mcpTokens.get(token);
  if (!tokenSession) {
    return NextResponse.json(
      { active: false },
      { status: 200, headers: corsHeaders() },
    );
  }

  return NextResponse.json(
    {
      active: true,
      scope: "contacts deals",
      client_id: "mcp-hubspot-client",
      token_type: "Bearer",
    },
    {
      status: 200,
      headers: corsHeaders(),
    },
  );
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(),
  });
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}
export const dynamic = "force-dynamic";
