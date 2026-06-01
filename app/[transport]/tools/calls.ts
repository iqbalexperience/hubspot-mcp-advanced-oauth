import { z } from "zod";
import { getHubspotToken } from "../route";
import { handleEndpoint, makeApiRequestWithErrorHandling } from "../helpers";

export const callPropertiesSchema = z.object({
  hs_call_body: z.string(),
  hs_call_direction: z.enum(['INBOUND', 'OUTBOUND']).optional(),
  hs_call_disposition: z.string().optional(),
  hs_call_duration: z.number().optional(),
  hs_call_recording_url: z.string().url().optional(),
  hs_call_status: z.enum(['SCHEDULED', 'COMPLETED', 'CANCELED', 'NO_ANSWER']).optional(),
  hs_call_title: z.string(),
  hs_timestamp: z.string().optional(),
  hubspot_owner_id: z.string().optional()
}).catchall(z.any());

export function registerCallsTools(server: any) {
  server.registerTool(
    "calls_create",
    {
      description: "Create a new call record",
      inputSchema: {
        properties: callPropertiesSchema,
        associations: z.array(z.object({
          to: z.object({ id: z.string() }),
          types: z.array(z.object({
            associationCategory: z.string(),
            associationTypeId: z.number()
          }))
        })).optional()
      }
    },
    async (params: any, extra: any) => {
      const hubspotAccessToken = getHubspotToken(extra);
      return handleEndpoint(async () => {
        const endpoint = '/crm/v3/objects/calls';
        return await makeApiRequestWithErrorHandling(hubspotAccessToken, endpoint, {}, 'POST', {
          properties: params.properties,
          associations: params.associations
        });
      });
    }
  );

  server.registerTool(
    "calls_get",
    {
      description: "Get details of a specific call",
      inputSchema: {
        callId: z.string(),
        properties: z.array(z.string()).optional(),
        associations: z.array(z.enum(['contacts', 'companies', 'deals', 'tickets'])).optional()
      }
    },
    async (params: any, extra: any) => {
      const hubspotAccessToken = getHubspotToken(extra);
      return handleEndpoint(async () => {
        const endpoint = `/crm/v3/objects/calls/${params.callId}`;
        return await makeApiRequestWithErrorHandling(hubspotAccessToken, endpoint, {
          properties: params.properties?.join(','),
          associations: params.associations?.join(',')
        });
      });
    }
  );

  server.registerTool(
    "calls_update",
    {
      description: "Update an existing call record",
      inputSchema: {
        callId: z.string(),
        properties: callPropertiesSchema
      }
    },
    async (params: any, extra: any) => {
      const hubspotAccessToken = getHubspotToken(extra);
      return handleEndpoint(async () => {
        const endpoint = `/crm/v3/objects/calls/${params.callId}`;
        return await makeApiRequestWithErrorHandling(hubspotAccessToken, endpoint, {}, 'PATCH', {
          properties: params.properties
        });
      });
    }
  );

  server.registerTool(
    "calls_archive",
    {
      description: "Archive (delete) a call record",
      inputSchema: {
        callId: z.string()
      }
    },
    async (params: any, extra: any) => {
      const hubspotAccessToken = getHubspotToken(extra);
      return handleEndpoint(async () => {
        const endpoint = `/crm/v3/objects/calls/${params.callId}`;
        return await makeApiRequestWithErrorHandling(hubspotAccessToken, endpoint, {}, 'DELETE');
      });
    }
  );

  server.registerTool(
    "calls_list",
    {
      description: "List all calls with optional filtering",
      inputSchema: {
        limit: z.number().min(1).max(100).optional(),
        after: z.string().optional(),
        properties: z.array(z.string()).optional(),
        associations: z.array(z.enum(['contacts', 'companies', 'deals', 'tickets'])).optional(),
        archived: z.boolean().optional()
      }
    },
    async (params: any, extra: any) => {
      const hubspotAccessToken = getHubspotToken(extra);
      return handleEndpoint(async () => {
        const endpoint = '/crm/v3/objects/calls';
        return await makeApiRequestWithErrorHandling(hubspotAccessToken, endpoint, {
          limit: params.limit,
          after: params.after,
          properties: params.properties?.join(','),
          associations: params.associations?.join(','),
          archived: params.archived
        });
      });
    }
  );

  server.registerTool(
    "calls_search",
    {
      description: "Search calls with specific filters",
      inputSchema: {
        filterGroups: z.array(z.object({
          filters: z.array(z.object({
            propertyName: z.string(),
            operator: z.enum(['EQ', 'NEQ', 'LT', 'LTE', 'GT', 'GTE', 'BETWEEN', 'IN', 'NOT_IN', 'HAS_PROPERTY', 'NOT_HAS_PROPERTY', 'CONTAINS_TOKEN', 'NOT_CONTAINS_TOKEN']),
            value: z.any()
          }))
        })),
        properties: z.array(z.string()).optional(),
        limit: z.number().min(1).max(100).optional(),
        after: z.string().optional(),
        sorts: z.array(z.object({
          propertyName: z.string(),
          direction: z.enum(['ASCENDING', 'DESCENDING'])
        })).optional()
      }
    },
    async (params: any, extra: any) => {
      const hubspotAccessToken = getHubspotToken(extra);
      return handleEndpoint(async () => {
        const endpoint = '/crm/v3/objects/calls/search';
        return await makeApiRequestWithErrorHandling(hubspotAccessToken, endpoint, {}, 'POST', {
          filterGroups: params.filterGroups,
          properties: params.properties,
          limit: params.limit,
          after: params.after,
          sorts: params.sorts
        });
      });
    }
  );

  server.registerTool(
    "calls_batch_create",
    {
      description: "Create multiple call records in a single request",
      inputSchema: {
        inputs: z.array(z.object({
          properties: callPropertiesSchema,
          associations: z.array(z.object({
            to: z.object({ id: z.string() }),
            types: z.array(z.object({
              associationCategory: z.string(),
              associationTypeId: z.number()
            }))
          })).optional()
        }))
      }
    },
    async (params: any, extra: any) => {
      const hubspotAccessToken = getHubspotToken(extra);
      return handleEndpoint(async () => {
        const endpoint = '/crm/v3/objects/calls/batch/create';
        return await makeApiRequestWithErrorHandling(hubspotAccessToken, endpoint, {}, 'POST', {
          inputs: params.inputs
        });
      });
    }
  );

  server.registerTool(
    "calls_batch_read",
    {
      description: "Read multiple call records in a single request",
      inputSchema: {
        inputs: z.array(z.object({
          id: z.string(),
          properties: z.array(z.string()).optional(),
          associations: z.array(z.enum(['contacts', 'companies', 'deals', 'tickets'])).optional()
        }))
      }
    },
    async (params: any, extra: any) => {
      const hubspotAccessToken = getHubspotToken(extra);
      return handleEndpoint(async () => {
        const endpoint = '/crm/v3/objects/calls/batch/read';
        return await makeApiRequestWithErrorHandling(hubspotAccessToken, endpoint, {}, 'POST', {
          inputs: params.inputs
        });
      });
    }
  );

  server.registerTool(
    "calls_batch_update",
    {
      description: "Update multiple call records in a single request",
      inputSchema: {
        inputs: z.array(z.object({
          id: z.string(),
          properties: callPropertiesSchema
        }))
      }
    },
    async (params: any, extra: any) => {
      const hubspotAccessToken = getHubspotToken(extra);
      return handleEndpoint(async () => {
        const endpoint = '/crm/v3/objects/calls/batch/update';
        return await makeApiRequestWithErrorHandling(hubspotAccessToken, endpoint, {}, 'POST', {
          inputs: params.inputs
        });
      });
    }
  );

  server.registerTool(
    "calls_batch_archive",
    {
      description: "Archive (delete) multiple call records in a single request",
      inputSchema: {
        callIds: z.array(z.string()),
      }
    },
    async (params: any, extra: any) => {
      const hubspotAccessToken = getHubspotToken(extra);
      return handleEndpoint(async () => {
        const endpoint = '/crm/v3/objects/calls/batch/archive';
        return await makeApiRequestWithErrorHandling(hubspotAccessToken, endpoint, {}, 'POST', {
          inputs: params.callIds.map((id: string) => ({ id }))
        });
      });
    }
  );
}
