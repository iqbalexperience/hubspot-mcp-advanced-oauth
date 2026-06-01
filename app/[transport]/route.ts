import { createMcpHandler, withMcpAuth } from "mcp-handler";
import { mcpTokens } from "@/lib/store";

import { registerCompaniesTools } from "./tools/companies";
import { registerObjectsTools } from "./tools/objects";
import { registerAssociationsTools } from "./tools/associations";
import { registerContactsTools } from "./tools/contacts";
import { registerLeadsTools } from "./tools/leads";
import { registerMeetingsTools } from "./tools/meetings";
import { registerNotesTools } from "./tools/notes";
import { registerTasksTools } from "./tools/tasks";
import { registerEngagementsTools } from "./tools/engagements";
import { registerCallsTools } from "./tools/calls";
import { registerEmailsTools } from "./tools/emails";
import { registerCommunicationsTools } from "./tools/communications";
import { registerProductsTools } from "./tools/products";



interface AuthInfoType {
  token: string;
  clientId: string;
  scopes: string[];
  expiresAt?: number;
  resource?: URL;
  extra?: Record<string, unknown>;
}

/**
 * Extracts the HubSpot access token from the MCP auth context that is
 * passed as the second argument to every tool callback.
 */
export function getHubspotToken(extra: unknown): string {
  const auth = (extra as { authInfo?: AuthInfoType } | undefined)?.authInfo;
  const token = auth?.extra?.hubspotAccessToken as string | undefined;
  if (!token) {
    throw new Error(
      "⚠️ Authentication required. Please connect your HubSpot account first.",
    );
  }
  return token;
}

const verifyToken = async (_req: Request, bearerToken?: string) => {
  if (!bearerToken) return undefined;
  const tokenSession = mcpTokens.get(bearerToken);
  if (!tokenSession) return undefined;

  return {
    token: bearerToken,
    clientId: "mcp-hubspot-client",
    scopes: ["contacts", "deals"],
    extra: {
      hubspotAccessToken: tokenSession.hubspotAccessToken,
    },
  } as AuthInfoType;
};


const handler = createMcpHandler(
  (server) => {
    // ── Utility tools ────────────────────────────────────────────────────

    server.registerTool(
      "get_current_user",
      {
        description:
          "Get details about the currently authenticated HubSpot user — email, portal ID, hub domain, app ID, scopes, and token expiry.",
        inputSchema: {},
      },
      async (_args, extra) => {
        const hubspotToken = getHubspotToken(extra);
        try {
          const response = await fetch(
            `https://api.hubapi.com/oauth/v1/access-tokens/${hubspotToken}`,
            { headers: { Authorization: `Bearer ${hubspotToken}` } },
          );
          if (!response.ok)
            throw new Error(`HubSpot API error: ${response.status} ${response.statusText}`);
          const data = await response.json();
          const summary = [
            `👤 **User:** ${data.user ?? "N/A"}`,
            `🏢 **Hub ID (Portal):** ${data.hub_id ?? "N/A"}`,
            `🌐 **Hub Domain:** ${data.hub_domain ?? "N/A"}`,
            `🔑 **App ID:** ${data.app_id ?? "N/A"}`,
            `📋 **Scopes:** ${Array.isArray(data.scopes) ? data.scopes.join(", ") : "N/A"}`,
            `⏰ **Token Expires In:** ${data.expires_in != null ? `${data.expires_in}s` : "N/A"}`,
          ].join("\n");
          return {
            content: [
              {
                type: "text",
                text: `HubSpot Authenticated User Details:\n\n${summary}\n\n**Raw:**\n${JSON.stringify(data, null, 2)}`,
              },
            ],
          };
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          return { content: [{ type: "text", text: `❌ Failed to fetch user details: ${message}` }] };
        }
      },
    );

    registerCompaniesTools(server);
    registerObjectsTools(server);
    registerAssociationsTools(server);
    registerContactsTools(server);
    registerLeadsTools(server);
    registerMeetingsTools(server);
    registerNotesTools(server);
    registerTasksTools(server);
    registerEngagementsTools(server);
    registerCallsTools(server);
    registerEmailsTools(server);
    registerCommunicationsTools(server);
    registerProductsTools(server);

  },
  {
    serverInfo: {
      name: "mcp-hubspot-server",
      version: "0.1.0",
    },
  },
  {
    basePath: "/",
    maxDuration: 60,
    verboseLogs: true,
  },
);

const authHandler = withMcpAuth(handler, verifyToken, {
  required: true,
  resourceMetadataPath: "/.well-known/oauth-protected-resource",
});

export { authHandler as GET, authHandler as POST };
export const dynamic = "force-dynamic";
