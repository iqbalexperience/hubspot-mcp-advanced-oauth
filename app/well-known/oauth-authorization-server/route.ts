import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const host =
    req.headers.get("x-forwarded-host") ||
    req.headers.get("host") ||
    "localhost:3000";
  const protocol = req.headers.get("x-forwarded-proto") || "http";
  const origin = `${protocol}://${host}`;

  const metadata = {
    issuer: origin,
    authorization_endpoint: `${origin}/oauth/authorize/user`,
    token_endpoint: `${origin}/oauth/v3/token`,
    scopes_supported: [],
    response_types_supported: ["code"],
    response_modes_supported: ["query"],
    grant_types_supported: [
      "authorization_code",
      "refresh_token",
      "client_credentials",
    ],
    token_endpoint_auth_methods_supported: ["client_secret_post"],
    service_documentation:
      "https://developers.hubspot.com/docs/guides/apps/authentication/oauth-quickstart-guide",
    introspection_endpoint: `${origin}/oauth/v3/token/introspect`,
    introspection_endpoint_auth_methods_supported: ["client_secret_post"],
    introspection_endpoint_token_types_supported: [
      "access_token",
      "refresh_token",
      "client_credentials",
    ],
    code_challenge_methods_supported: ["S256"],
    // Keeping DCR compatibility endpoints for standard MCP clients
    registration_endpoint: `${origin}/oauth/register`,
    client_id_metadata_document_supported: true,
  };

  return NextResponse.json(metadata, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
export const dynamic = "force-dynamic";
