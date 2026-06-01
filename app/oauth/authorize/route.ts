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
    "crm.objects.contacts.read crm.objects.contacts.write crm.objects.companies.read crm.objects.companies.write crm.objects.deals.read crm.objects.deals.write crm.objects.quotes.read crm.objects.quotes.write crm.objects.line_items.read crm.objects.line_items.write crm.objects.tickets.read crm.objects.tickets.write crm.objects.owners.read crm.objects.custom.read crm.objects.custom.write crm.objects.marketing_events.read crm.objects.marketing_events.write crm.objects.appointments.read crm.objects.appointments.write crm.objects.commercepayments.read crm.objects.carts.read crm.objects.carts.write crm.lists.read crm.lists.write crm.schemas.contacts.read crm.schemas.companies.read crm.schemas.deals.read crm.schemas.quotes.read crm.schemas.line_items.read crm.schemas.tickets.read crm.schemas.custom.read content.read content.write files.read files.write forms.read forms.write automation settings.read settings.write webhooks oauth timeline business-intelligence collector.read collector.write integration-sync oauth";

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
