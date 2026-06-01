import { z } from "zod";
import { getHubspotToken } from "../route";
import { handleEndpoint, makeApiRequestWithErrorHandling } from "../helpers";

export const notePropertiesSchema = z.object({
  hs_note_body: z.string(),
  hs_timestamp: z.string().optional(),
  hubspot_owner_id: z.string().optional()
}).catchall(z.any());

export function registerNotesTools(server: any) {
  server.registerTool(
    "notes_create",
    {
      description: "Create a new note",
      inputSchema: {
        properties: notePropertiesSchema,
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
        const endpoint = '/crm/v3/objects/notes';
        return await makeApiRequestWithErrorHandling(hubspotAccessToken, endpoint, {}, 'POST', {
          properties: params.properties,
          associations: params.associations
        });
      });
    }
  );

  server.registerTool(
    "notes_get",
    {
      description: "Get details of a specific note",
      inputSchema: {
        noteId: z.string(),
        properties: z.array(z.string()).optional(),
        associations: z.array(z.enum(['contacts', 'companies', 'deals', 'tickets'])).optional()
      }
    },
    async (params: any, extra: any) => {
      const hubspotAccessToken = getHubspotToken(extra);
      return handleEndpoint(async () => {
        const endpoint = `/crm/v3/objects/notes/${params.noteId}`;
        return await makeApiRequestWithErrorHandling(hubspotAccessToken, endpoint, {
          properties: params.properties?.join(','),
          associations: params.associations?.join(',')
        });
      });
    }
  );

  server.registerTool(
    "notes_update",
    {
      description: "Update an existing note",
      inputSchema: {
        noteId: z.string(),
        properties: notePropertiesSchema
      }
    },
    async (params: any, extra: any) => {
      const hubspotAccessToken = getHubspotToken(extra);
      return handleEndpoint(async () => {
        const endpoint = `/crm/v3/objects/notes/${params.noteId}`;
        return await makeApiRequestWithErrorHandling(hubspotAccessToken, endpoint, {}, 'PATCH', {
          properties: params.properties
        });
      });
    }
  );

  server.registerTool(
    "notes_archive",
    {
      description: "Archive (delete) a note",
      inputSchema: {
        noteId: z.string()
      }
    },
    async (params: any, extra: any) => {
      const hubspotAccessToken = getHubspotToken(extra);
      return handleEndpoint(async () => {
        const endpoint = `/crm/v3/objects/notes/${params.noteId}`;
        return await makeApiRequestWithErrorHandling(hubspotAccessToken, endpoint, {}, 'DELETE');
      });
    }
  );

  server.registerTool(
    "notes_list",
    {
      description: "List all notes with optional filtering",
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
        const endpoint = '/crm/v3/objects/notes';
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
    "notes_search",
    {
      description: "Search notes with specific filters",
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
        const endpoint = '/crm/v3/objects/notes/search';
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
    "notes_batch_create",
    {
      description: "Create multiple notes in a single request",
      inputSchema: {
        inputs: z.array(z.object({
          properties: notePropertiesSchema,
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
        const endpoint = '/crm/v3/objects/notes/batch/create';
        return await makeApiRequestWithErrorHandling(hubspotAccessToken, endpoint, {}, 'POST', {
          inputs: params.inputs
        });
      });
    }
  );

  server.registerTool(
    "notes_batch_read",
    {
      description: "Read multiple notes in a single request",
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
        const endpoint = '/crm/v3/objects/notes/batch/read';
        return await makeApiRequestWithErrorHandling(hubspotAccessToken, endpoint, {}, 'POST', {
          inputs: params.inputs
        });
      });
    }
  );

  server.registerTool(
    "notes_batch_update",
    {
      description: "Update multiple notes in a single request",
      inputSchema: {
        inputs: z.array(z.object({
          id: z.string(),
          properties: notePropertiesSchema
        }))
      }
    },
    async (params: any, extra: any) => {
      const hubspotAccessToken = getHubspotToken(extra);
      return handleEndpoint(async () => {
        const endpoint = '/crm/v3/objects/notes/batch/update';
        return await makeApiRequestWithErrorHandling(hubspotAccessToken, endpoint, {}, 'POST', {
          inputs: params.inputs
        });
      });
    }
  );

  server.registerTool(
    "notes_batch_archive",
    {
      description: "Archive (delete) multiple notes in a single request",
      inputSchema: {
        noteIds: z.array(z.string()),
      }
    },
    async (params: any, extra: any) => {
      const hubspotAccessToken = getHubspotToken(extra);
      return handleEndpoint(async () => {
        const endpoint = '/crm/v3/objects/notes/batch/archive';
        return await makeApiRequestWithErrorHandling(hubspotAccessToken, endpoint, {}, 'POST', {
          inputs: params.noteIds.map((id: string) => ({ id }))
        });
      });
    }
  );
}
