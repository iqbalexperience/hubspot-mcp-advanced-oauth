import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { mcpCodes, mcpTokens } from "@/lib/store";

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

  const grantType = body.grant_type;
  const code = body.code;
  const codeVerifier = body.code_verifier;

  if (grantType !== "authorization_code") {
    return NextResponse.json(
      {
        error: "unsupported_grant_type",
        error_description: "Only 'authorization_code' is supported.",
      },
      { status: 400, headers: corsHeaders() },
    );
  }

  if (!code || !codeVerifier) {
    return NextResponse.json(
      {
        error: "invalid_request",
        error_description: "Missing required parameters (code, code_verifier).",
      },
      { status: 400, headers: corsHeaders() },
    );
  }

  // Retrieve the authorization code session from store
  const session = mcpCodes.get(code);
  if (!session) {
    return NextResponse.json(
      {
        error: "invalid_grant",
        error_description: "Invalid or expired authorization code.",
      },
      { status: 400, headers: corsHeaders() },
    );
  }

  // PKCE Validation
  // RFC 7636: Calculate SHA-256 hash of code_verifier and encode as base64url
  const hash = crypto.createHash("sha256").update(codeVerifier).digest();
  const calculatedChallenge = hash.toString("base64url");

  if (calculatedChallenge !== session.codeChallenge) {
    return NextResponse.json(
      {
        error: "invalid_grant",
        error_description: "PKCE verification failed.",
      },
      { status: 400, headers: corsHeaders() },
    );
  }

  // Generate a cryptographically secure token for the MCP client
  const mcpAccessToken = `mcp_token_${crypto.randomBytes(32).toString("hex")}`;

  // Map the new client token to the HubSpot credentials in the active token store
  mcpTokens.set(mcpAccessToken, {
    hubspotAccessToken: session.hubspotAccessToken,
    hubspotRefreshToken: session.hubspotRefreshToken,
  });

  // Consume the authorization code (codes are strictly single-use)
  mcpCodes.delete(code);

  return NextResponse.json(
    {
      access_token: mcpAccessToken,
      token_type: "Bearer",
      expires_in: 3600,
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
