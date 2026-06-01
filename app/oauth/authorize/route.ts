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
      {
        status: 400,
      },
    );
  }

  if (codeChallengeMethod && codeChallengeMethod !== "S256") {
    return new NextResponse(
      "Unsupported code_challenge_method. Only 'S256' is supported.",
      {
        status: 400,
      },
    );
  }

  // Generate our own PKCE credentials for the HubSpot-facing authorization request
  const ourCodeVerifier = crypto.randomBytes(32).toString("base64url");
  const hash = crypto.createHash("sha256").update(ourCodeVerifier).digest();
  const ourCodeChallenge = hash.toString("base64url");

  // Package MCP client properties and our verifier into the state token
  const clientParams = {
    redirect_uri: redirectUri,
    client_state: state,
    code_challenge: codeChallenge,
    our_code_verifier: ourCodeVerifier, // Carrier verifier for HubSpot token exchange
  };

  const serializedState = Buffer.from(JSON.stringify(clientParams)).toString(
    "base64url",
  );

  // Retrieve HubSpot Client ID
  const hubspotClientId = process.env.HUBSPOT_CLIENT_ID;
  if (!hubspotClientId) {
    return new NextResponse("HubSpot Client ID not configured on the server.", {
      status: 500,
    });
  }

  // Derive our server's OAuth callback URL
  const host =
    req.headers.get("x-forwarded-host") ||
    req.headers.get("host") ||
    "localhost:3000";
  const protocol = req.headers.get("x-forwarded-proto") || "http";
  const ourCallbackUrl = `${protocol}://${host}/oauth/callback`;

  // Standard HubSpot CRM scopes
  const hubspotScopes =
    "crm.schemas.quotes.write%20crm.objects.contacts.read%20crm.objects.contacts.write%20crm.objects.companies.read%20crm.objects.companies.write%20crm.objects.deals.read%20crm.objects.deals.write%20crm.objects.quotes.read%20crm.objects.quotes.write%20crm.objects.line_items.read%20crm.objects.line_items.write%20crm.objects.tickets.read%20crm.objects.tickets.write%20crm.objects.owners.read%20crm.objects.custom.read%20crm.objects.custom.write%20crm.objects.marketing_events.read%20crm.objects.marketing_events.write%20crm.objects.appointments.read%20crm.objects.appointments.write%20crm.objects.commercepayments.read%20crm.objects.carts.read%20crm.objects.carts.write%20crm.lists.read%20crm.lists.write%20crm.schemas.contacts.read%20crm.schemas.companies.read%20crm.schemas.deals.read%20crm.schemas.quotes.read%20crm.schemas.line_items.read%20crm.schemas.tickets.read%20crm.schemas.custom.read%20content.read%20content.write%20files.read%20files.write%20forms.read%20forms.write%20automation%20settings.read%20settings.write%20webhooks%20oauth%20timeline%20business-intelligence%20collector.read%20collector.write%20integration-sync";

  const authorizeUrl = new URL("https://app.hubspot.com/oauth/authorize");
  authorizeUrl.searchParams.set("client_id", hubspotClientId);
  authorizeUrl.searchParams.set("redirect_uri", ourCallbackUrl);
  authorizeUrl.searchParams.set("scope", hubspotScopes);
  authorizeUrl.searchParams.set("state", serializedState);

  // Set the PKCE parameters for HubSpot
  authorizeUrl.searchParams.set("code_challenge", ourCodeChallenge);
  authorizeUrl.searchParams.set("code_challenge_method", "S256");

  return NextResponse.redirect(authorizeUrl.toString());
}
export const dynamic = "force-dynamic";
