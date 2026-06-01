import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { mcpCodes } from "@/lib/store";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const hubspotCode = searchParams.get("code");
  const stateStr = searchParams.get("state");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  if (error || errorDescription) {
    return new NextResponse(
      `HubSpot Authorization Failed: ${errorDescription || error}`,
      { status: 400 },
    );
  }

  if (!hubspotCode || !stateStr) {
    return new NextResponse(
      "Missing authorization code or state from HubSpot.",
      { status: 400 },
    );
  }

  let clientParams: {
    redirect_uri: string;
    client_state?: string;
    code_challenge: string;
    hs_code_verifier: string;
  };

  try {
    const jsonStr = Buffer.from(stateStr, "base64url").toString("utf8");
    clientParams = JSON.parse(jsonStr);
  } catch {
    return new NextResponse("Invalid OAuth state parameter.", { status: 400 });
  }

  const { redirect_uri, client_state, code_challenge, hs_code_verifier } =
    clientParams;

  if (!redirect_uri || !code_challenge || !hs_code_verifier) {
    return new NextResponse(
      "Corrupted state parameters in the OAuth handshake.",
      { status: 400 },
    );
  }

  const hubspotClientId = process.env.HUBSPOT_CLIENT_ID;
  const hubspotClientSecret = process.env.HUBSPOT_CLIENT_SECRET;

  if (!hubspotClientId || !hubspotClientSecret) {
    return new NextResponse(
      "HubSpot Client ID or Secret not configured on the server.",
      { status: 500 },
    );
  }

  const host =
    req.headers.get("x-forwarded-host") ||
    req.headers.get("host") ||
    "localhost:3000";
  const protocol = req.headers.get("x-forwarded-proto") || "http";
  const ourCallbackUrl = `${protocol}://${host}/oauth/callback`;

  try {
    // HubSpot requires client_secret (confidential client) AND code_verifier (PKCE) together.
    const tokenResponse = await fetch("https://api.hubapi.com/oauth/v1/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: hubspotClientId,
        client_secret: hubspotClientSecret,
        redirect_uri: ourCallbackUrl,
        code: hubspotCode,
        code_verifier: hs_code_verifier,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error("HubSpot token exchange error:", errorData);
      return new NextResponse(
        `Failed to exchange tokens with HubSpot: ${errorData}`,
        { status: 400 },
      );
    }

    const tokenData = await tokenResponse.json();
    const { access_token, refresh_token } = tokenData;

    if (!access_token) {
      return new NextResponse("HubSpot responded without an access token.", {
        status: 400,
      });
    }

    // Issue a short-lived MCP authorization code for the MCP client to exchange
    const mcpCode = `mcp_code_${crypto.randomUUID()}`;

    mcpCodes.set(mcpCode, {
      codeChallenge: code_challenge, // Used by our /oauth/v3/token to verify MCP client PKCE
      hubspotAccessToken: access_token,
      hubspotRefreshToken: refresh_token,
    });

    // Redirect back to the MCP client's redirect_uri with our mcp code
    const clientRedirectUrl = new URL(redirect_uri);
    clientRedirectUrl.searchParams.set("code", mcpCode);
    if (client_state) {
      clientRedirectUrl.searchParams.set("state", client_state);
    }

    return NextResponse.redirect(clientRedirectUrl.toString());
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Error during HubSpot callback handling:", message);
    return new NextResponse(`Internal Server Error during login: ${message}`, {
      status: 500,
    });
  }
}
export const dynamic = "force-dynamic";
