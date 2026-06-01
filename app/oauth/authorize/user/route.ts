import crypto from "node:crypto";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const responseType = searchParams.get("response_type");
  const redirectUri = searchParams.get("redirect_uri");
  const codeChallenge = searchParams.get("code_challenge");
  const codeChallengeMethod = searchParams.get("code_challenge_method");
  const state = searchParams.get("state");

  if (!responseType || !redirectUri || !codeChallenge) {
    return new NextResponse(
      "Missing required OAuth parameters (response_type, redirect_uri, code_challenge).",
      { status: 400 },
    );
  }

  if (responseType !== "code") {
    return new NextResponse(
      "Unsupported response_type. Only 'code' is supported.",
      { status: 400 },
    );
  }

  if (codeChallengeMethod && codeChallengeMethod !== "S256") {
    return new NextResponse(
      "Unsupported code_challenge_method. Only 'S256' is supported.",
      { status: 400 },
    );
  }

  // Generate a fresh PKCE pair for the HubSpot-facing leg of the flow.
  // HubSpot requires code_challenge on /authorize AND code_verifier on /token
  // (even when client_secret is also present).
  const hsCodeVerifier = crypto.randomBytes(32).toString("base64url");
  const hsCodeChallenge = crypto
    .createHash("sha256")
    .update(hsCodeVerifier)
    .digest("base64url");

  // Carry all MCP-client params + our HubSpot verifier through the HubSpot redirect.
  // State is the only field that survives the round-trip back to /oauth/callback.
  const serializedState = Buffer.from(
    JSON.stringify({
      redirect_uri: redirectUri,
      client_state: state,
      code_challenge: codeChallenge, // MCP client's PKCE challenge (for our token endpoint)
      hs_code_verifier: hsCodeVerifier, // Our PKCE verifier (for HubSpot token endpoint)
    }),
  ).toString("base64url");

  const hubspotClientId = process.env.HUBSPOT_CLIENT_ID;
  if (!hubspotClientId) {
    return new NextResponse("HubSpot Client ID not configured on the server.", {
      status: 500,
    });
  }

  const host =
    req.headers.get("x-forwarded-host") ||
    req.headers.get("host") ||
    "localhost:8000";
  const protocol = req.headers.get("x-forwarded-proto") || "http";
  const ourCallbackUrl = `${protocol}://${host}/oauth/callback`;

  const hubspotScopes =
    "crm.objects.contacts.read crm.objects.contacts.write crm.objects.deals.read oauth";

  const authorizeUrl = new URL("https://app.hubspot.com/oauth/authorize");
  authorizeUrl.searchParams.set("client_id", hubspotClientId);
  authorizeUrl.searchParams.set("redirect_uri", ourCallbackUrl);
  authorizeUrl.searchParams.set("scope", hubspotScopes);
  authorizeUrl.searchParams.set("state", serializedState);
  // HubSpot requires PKCE on the authorization request
  authorizeUrl.searchParams.set("code_challenge", hsCodeChallenge);
  authorizeUrl.searchParams.set("code_challenge_method", "S256");

  return NextResponse.redirect(authorizeUrl.toString());
}
export const dynamic = "force-dynamic";
