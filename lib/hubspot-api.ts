/**
 * Shared HubSpot API helper utilities for MCP tools.
 * All tools receive a `hubspotToken` string at call time via OAuth auth context.
 */

export function formatResponse(data: unknown): { content: Array<{ type: "text"; text: string }> } {
  let text: string;
  if (typeof data === "string") {
    text = data;
  } else if (data === null || data === undefined) {
    text = "No data returned";
  } else if (typeof data === "object") {
    text = JSON.stringify(data, null, 2);
  } else {
    text = String(data);
  }
  return { content: [{ type: "text" as const, text }] };
}

export async function makeApiRequest(
  apiKey: string,
  endpoint: string,
  params: Record<string, unknown> = {},
  method = "GET",
  body: Record<string, unknown> | null = null,
): Promise<unknown> {
  if (!apiKey) throw new Error("No HubSpot access token provided");

  const queryParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      queryParams.append(key, String(value));
    }
  }

  const url = `https://api.hubapi.com${endpoint}${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

  const headers: Record<string, string> = {
    Accept: "application/json",
    Authorization: `Bearer ${apiKey}`,
  };
  if (body) headers["Content-Type"] = "application/json";

  const requestOptions: RequestInit = { method, headers };
  if (body) requestOptions.body = JSON.stringify(body);

  const response = await fetch(url, requestOptions);

  if (!response.ok)
    return `Error fetching data from HubSpot: Status ${response.status} ${response.statusText}`;
  if (response.status === 204) return "No data returned: Status 204";

  return response.json();
}

export async function makeApiRequestWithErrorHandling(
  apiKey: string,
  endpoint: string,
  params: Record<string, unknown> = {},
  method = "GET",
  body: Record<string, unknown> | null = null,
): Promise<{ content: Array<{ type: "text"; text: string }> }> {
  try {
    const data = await makeApiRequest(apiKey, endpoint, params, method, body);
    return formatResponse(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return formatResponse(`Error performing request: ${message}`);
  }
}

export async function handleEndpoint(
  apiCall: () => Promise<{ content: Array<{ type: "text"; text: string }> }>,
): Promise<{ content: Array<{ type: "text"; text: string }> }> {
  try {
    return await apiCall();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return formatResponse(message);
  }
}
