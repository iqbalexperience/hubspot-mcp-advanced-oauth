import { z } from "zod";
import { getHubspotToken } from "../route";
import { handleEndpoint, makeApiRequestWithErrorHandling } from "../helpers";

export const leadPropertiesSchema = z.object({
  email: z.string().email().optional(),
  firstname: z.string().optional(),
  lastname: z.string().optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  jobtitle: z.string().optional(),
  leadstatus: z.enum(['new', 'open', 'in_progress', 'qualified', 'unqualified', 'converted', 'lost']).optional(),
  leadsource: z.string().optional(),
  industry: z.string().optional(),
  annualrevenue: z.number().optional(),
  numberofemployees: z.number().optional(),
  rating: z.enum(['hot', 'warm', 'cold']).optional(),
  website: z.string().url().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  country: z.string().optional(),
  notes: z.string().optional(),
}).catchall(z.any());

export function registerLeadsTools(server: any) {
  server.registerTool(
    "crm_create_lead",
    {
      description: "Create a new lead with validated properties",
      inputSchema: {
        properties: leadPropertiesSchema,
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
        const endpoint = '/crm/v3/objects/leads';
        return await makeApiRequestWithErrorHandling(hubspotAccessToken, endpoint, {}, 'POST', {
          properties: params.properties,
          associations: params.associations
        });
      });
    }
  );

  server.registerTool(
    "crm_update_lead",
    {
      description: "Update an existing lead with validated properties",
      inputSchema: {
        leadId: z.string(),
        properties: leadPropertiesSchema
      }
    },
    async (params: any, extra: any) => {
      const hubspotAccessToken = getHubspotToken(extra);
      return handleEndpoint(async () => {
        const endpoint = `/crm/v3/objects/leads/${params.leadId}`;
        return await makeApiRequestWithErrorHandling(hubspotAccessToken, endpoint, {}, 'PATCH', {
          properties: params.properties
        });
      });
    }
  );

  server.registerTool(
    "crm_get_lead",
    {
      description: "Get a single lead by ID with specific properties and associations",
      inputSchema: {
        leadId: z.string(),
        properties: z.array(z.string()).optional(),
        associations: z.array(z.enum(['companies', 'contacts', 'deals', 'notes', 'tasks'])).optional()
      }
    },
    async (params: any, extra: any) => {
      const hubspotAccessToken = getHubspotToken(extra);
      return handleEndpoint(async () => {
        const endpoint = `/crm/v3/objects/leads/${params.leadId}`;
        return await makeApiRequestWithErrorHandling(hubspotAccessToken, endpoint, {
          properties: params.properties?.join(','),
          associations: params.associations?.join(',')
        });
      });
    }
  );

  server.registerTool(
    "crm_search_leads",
    {
      description: "Search leads with lead-specific filters",
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
        const endpoint = '/crm/v3/objects/leads/search';
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
    "crm_batch_create_leads",
    {
      description: "Create multiple leads in a single request",
      inputSchema: {
        inputs: z.array(z.object({
          properties: leadPropertiesSchema,
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
        const endpoint = '/crm/v3/objects/leads/batch/create';
        return await makeApiRequestWithErrorHandling(hubspotAccessToken, endpoint, {}, 'POST', {
          inputs: params.inputs
        });
      });
    }
  );

  server.registerTool(
    "crm_batch_update_leads",
    {
      description: "Update multiple leads in a single request",
      inputSchema: {
        inputs: z.array(z.object({
          id: z.string(),
          properties: leadPropertiesSchema
        }))
      }
    },
    async (params: any, extra: any) => {
      const hubspotAccessToken = getHubspotToken(extra);
      return handleEndpoint(async () => {
        const endpoint = '/crm/v3/objects/leads/batch/update';
        return await makeApiRequestWithErrorHandling(hubspotAccessToken, endpoint, {}, 'POST', {
          inputs: params.inputs
        });
      });
    }
  );

  server.registerTool(
    "crm_get_lead_properties",
    {
      description: "Get all properties for leads",
      inputSchema: {
        archived: z.boolean().optional(),
        properties: z.array(z.string()).optional()
      }
    },
    async (params: any, extra: any) => {
      const hubspotAccessToken = getHubspotToken(extra);
      return handleEndpoint(async () => {
        const endpoint = '/crm/v3/properties/leads';
        return await makeApiRequestWithErrorHandling(hubspotAccessToken, endpoint, {
          archived: params.archived,
          properties: params.properties?.join(',')
        });
      });
    }
  );

  server.registerTool(
    "crm_create_lead_property",
    {
      description: "Create a new lead property",
      inputSchema: {
        name: z.string(),
        label: z.string(),
        type: z.enum(['string', 'number', 'date', 'datetime', 'enumeration', 'bool']),
        fieldType: z.enum(['text', 'textarea', 'select', 'radio', 'checkbox', 'number', 'date', 'file']),
        groupName: z.string(),
        description: z.string().optional(),
        options: z.array(z.object({
          label: z.string(),
          value: z.string(),
          description: z.string().optional(),
          displayOrder: z.number().optional(),
          hidden: z.boolean().optional()
        })).optional(),
        displayOrder: z.number().optional(),
        hasUniqueValue: z.boolean().optional(),
        hidden: z.boolean().optional(),
        formField: z.boolean().optional()
      }
    },
    async (params: any, extra: any) => {
      const hubspotAccessToken = getHubspotToken(extra);
      return handleEndpoint(async () => {
        const endpoint = '/crm/v3/properties/leads';
        return await makeApiRequestWithErrorHandling(hubspotAccessToken, endpoint, {}, 'POST', params);
      });
    }
  );
}
