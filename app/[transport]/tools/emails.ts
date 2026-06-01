import { z } from "zod";
import { getHubspotToken } from "../route";
import { handleEndpoint, makeApiRequestWithErrorHandling } from "../helpers";

export const emailPropertiesSchema = z.object({
  hs_email_subject: z.string(),
  hs_email_text: z.string(),
  hs_email_html: z.string().optional(),
  hs_email_status: z.enum(['SENT', 'DRAFT', 'SCHEDULED']).optional(),
  hs_email_direction: z.enum(['INBOUND', 'OUTBOUND']).optional(),
  hs_timestamp: z.string().optional(),
  hs_email_headers: z.record(z.string(), z.string()).optional(),
  hs_email_from_email: z.string().email(),
  hs_email_from_firstname: z.string().optional(),
  hs_email_from_lastname: z.string().optional(),
  hs_email_to_email: z.string().email(),
  hs_email_to_firstname: z.string().optional(),
  hs_email_to_lastname: z.string().optional(),
  hs_email_cc: z.array(z.string().email()).optional(),
  hs_email_bcc: z.array(z.string().email()).optional(),
  hubspot_owner_id: z.string().optional()
}).catchall(z.any());

export function registerEmailsTools(server: any) {
  server.registerTool(
    "emails_create",
    {
      description: "Create a new email record",
      inputSchema: {
        properties: emailPropertiesSchema,
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
        const endpoint = '/crm/v3/objects/emails';
        return await makeApiRequestWithErrorHandling(hubspotAccessToken, endpoint, {}, 'POST', {
          properties: params.properties,
          associations: params.associations
        });
      });
    }
  );

  server.registerTool(
    "emails_get",
    {
      description: "Get details of a specific email",
      inputSchema: {
        emailId: z.string(),
        properties: z.array(z.string()).optional(),
        associations: z.array(z.enum(['contacts', 'companies', 'deals', 'tickets'])).optional()
      }
    },
    async (params: any, extra: any) => {
      const hubspotAccessToken = getHubspotToken(extra);
      return handleEndpoint(async () => {
        const endpoint = `/crm/v3/objects/emails/${params.emailId}`;
        return await makeApiRequestWithErrorHandling(hubspotAccessToken, endpoint, {
          properties: params.properties?.join(','),
          associations: params.associations?.join(',')
        });
      });
    }
  );

  server.registerTool(
    "emails_update",
    {
      description: "Update an existing email record",
      inputSchema: {
        emailId: z.string(),
        properties: emailPropertiesSchema
      }
    },
    async (params: any, extra: any) => {
      const hubspotAccessToken = getHubspotToken(extra);
      return handleEndpoint(async () => {
        const endpoint = `/crm/v3/objects/emails/${params.emailId}`;
        return await makeApiRequestWithErrorHandling(hubspotAccessToken, endpoint, {}, 'PATCH', {
          properties: params.properties
        });
      });
    }
  );

  server.registerTool(
    "emails_archive",
    {
      description: "Archive (delete) an email record",
      inputSchema: {
        emailId: z.string()
      }
    },
    async (params: any, extra: any) => {
      const hubspotAccessToken = getHubspotToken(extra);
      return handleEndpoint(async () => {
        const endpoint = `/crm/v3/objects/emails/${params.emailId}`;
        return await makeApiRequestWithErrorHandling(hubspotAccessToken, endpoint, {}, 'DELETE');
      });
    }
  );

  server.registerTool(
    "emails_list",
    {
      description: "List all emails with optional filtering",
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
        const endpoint = '/crm/v3/objects/emails';
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
    "emails_search",
    {
      description: "Search emails with specific filters",
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
        const endpoint = '/crm/v3/objects/emails/search';
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
    "emails_batch_create",
    {
      description: "Create multiple email records in a single request",
      inputSchema: {
        inputs: z.array(z.object({
          properties: emailPropertiesSchema,
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
        const endpoint = '/crm/v3/objects/emails/batch/create';
        return await makeApiRequestWithErrorHandling(hubspotAccessToken, endpoint, {}, 'POST', {
          inputs: params.inputs
        });
      });
    }
  );

  server.registerTool(
    "emails_batch_read",
    {
      description: "Read multiple email records in a single request",
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
        const endpoint = '/crm/v3/objects/emails/batch/read';
        return await makeApiRequestWithErrorHandling(hubspotAccessToken, endpoint, {}, 'POST', {
          inputs: params.inputs
        });
      });
    }
  );

  server.registerTool(
    "emails_batch_update",
    {
      description: "Update multiple email records in a single request",
      inputSchema: {
        inputs: z.array(z.object({
          id: z.string(),
          properties: emailPropertiesSchema
        }))
      }
    },
    async (params: any, extra: any) => {
      const hubspotAccessToken = getHubspotToken(extra);
      return handleEndpoint(async () => {
        const endpoint = '/crm/v3/objects/emails/batch/update';
        return await makeApiRequestWithErrorHandling(hubspotAccessToken, endpoint, {}, 'POST', {
          inputs: params.inputs
        });
      });
    }
  );

  server.registerTool(
    "emails_batch_archive",
    {
      description: "Archive (delete) multiple email records in a single request",
      inputSchema: {
        emailIds: z.array(z.string()),
      }
    },
    async (params: any, extra: any) => {
      const hubspotAccessToken = getHubspotToken(extra);
      return handleEndpoint(async () => {
        const endpoint = '/crm/v3/objects/emails/batch/archive';
        return await makeApiRequestWithErrorHandling(hubspotAccessToken, endpoint, {}, 'POST', {
          inputs: params.emailIds.map((id: string) => ({ id }))
        });
      });
    }
  );
}
