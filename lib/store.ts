// Simple global-safe in-memory store for authorization codes and session tokens.
// This ensures states are shared and preserved between different API routes during local execution.

const globalForAuth = global as unknown as {
  mcpCodes: Map<
    string,
    {
      codeChallenge: string;
      hubspotAccessToken: string;
      hubspotRefreshToken?: string;
    }
  >;
  mcpTokens: Map<
    string,
    {
      hubspotAccessToken: string;
      hubspotRefreshToken?: string;
    }
  >;
};

if (!globalForAuth.mcpCodes) {
  globalForAuth.mcpCodes = new Map();
}
if (!globalForAuth.mcpTokens) {
  globalForAuth.mcpTokens = new Map();
}

export const mcpCodes = globalForAuth.mcpCodes;
export const mcpTokens = globalForAuth.mcpTokens;
