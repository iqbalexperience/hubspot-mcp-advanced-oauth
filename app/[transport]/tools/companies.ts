import { z } from "zod";
import { getHubspotToken } from "../route";
import { handleEndpoint, makeApiRequestWithErrorHandling } from "../helpers";

export const companyPropertiesSchema = z.object({
  name: z.string().optional(),
  domain: z.string().optional(),
  website: z.string().url().optional(),
  description: z.string().optional(),
  industry: z.string().optional(),
  numberofemployees: z.number().optional(),
  annualrevenue: z.number().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  address2: z.string().optional(),
  zip: z.string().optional(),
  type: z.string().optional(),
  lifecyclestage: z.enum(['lead', 'customer', 'opportunity', 'subscriber', 'other']).optional(),
}).catchall(z.any());

export function registerCompaniesTools(server: any) {
  server.registerTool(
    "crm_create_company",
    {
      description: "Create a new company with validated properties",
      inputSchema: {
        properties: companyPropertiesSchema,
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
        const endpoint = '/crm/v3/objects/companies';
        return await makeApiRequestWithErrorHandling(hubspotAccessToken, endpoint, {}, 'POST', {
          properties: params.properties,
          associations: params.associations
        });
      });
    }
  );

  server.registerTool(
    "crm_update_company",
    {
      description: "Update an existing company with validated properties",
      inputSchema: {
        companyId: z.string(),
        properties: companyPropertiesSchema
      }
    },
    async (params: any, extra: any) => {
      const hubspotAccessToken = getHubspotToken(extra);
      return handleEndpoint(async () => {
        const endpoint = `/crm/v3/objects/companies/${params.companyId}`;
        return await makeApiRequestWithErrorHandling(hubspotAccessToken, endpoint, {}, 'PATCH', {
          properties: params.properties
        });
      });
    }
  );

  server.registerTool(
    "crm_get_company",
    {
      description: "Get a single company by ID with specific properties and associations",
      inputSchema: {
        companyId: z.string(),
        properties: z.array(z.string()).optional(),
        associations: z.array(z.enum(['contacts', 'deals', 'tickets'])).optional()
      }
    },
    async (params: any, extra: any) => {
      const hubspotAccessToken = getHubspotToken(extra);
      return handleEndpoint(async () => {
        const endpoint = `/crm/v3/objects/companies/${params.companyId}`;
        return await makeApiRequestWithErrorHandling(hubspotAccessToken, endpoint, {
          properties: params.properties?.join(','),
          associations: params.associations?.join(',')
        });
      });
    }
  );

  server.registerTool(
    "crm_search_companies",
    {
      description: "Search companies with company-specific filters",
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
        const endpoint = '/crm/v3/objects/companies/search';
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
    "crm_batch_create_companies",
    {
      description: "Create multiple companies in a single request",
      inputSchema: {
        inputs: z.array(z.object({
          properties: companyPropertiesSchema,
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
        const endpoint = '/crm/v3/objects/companies/batch/create';
        return await makeApiRequestWithErrorHandling(hubspotAccessToken, endpoint, {}, 'POST', {
          inputs: params.inputs
        });
      });
    }
  );

  server.registerTool(
    "crm_batch_update_companies",
    {
      description: "Update multiple companies in a single request",
      inputSchema: {
        inputs: z.array(z.object({
          id: z.string(),
          properties: companyPropertiesSchema
        }))
      }
    },
    async (params: any, extra: any) => {
      const hubspotAccessToken = getHubspotToken(extra);
      return handleEndpoint(async () => {
        const endpoint = '/crm/v3/objects/companies/batch/update';
        return await makeApiRequestWithErrorHandling(hubspotAccessToken, endpoint, {}, 'POST', {
          inputs: params.inputs
        });
      });
    }
  );

  server.registerTool(
    "crm_get_company_properties",
    {
      description: "Get all properties for companies",
      inputSchema: {
        archived: z.boolean().optional(),
        properties: z.array(z.string()).optional()
      }
    },
    async (params: any, extra: any) => {
      const hubspotAccessToken = getHubspotToken(extra);
      return handleEndpoint(async () => {
        const endpoint = '/crm/v3/properties/companies';
        return await makeApiRequestWithErrorHandling(hubspotAccessToken, endpoint, {
          archived: params.archived,
          properties: params.properties?.join(',')
        });
      });
    }
  );

  server.registerTool(
    "crm_create_company_property",
    {
      description: "Create a new company property",
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
        const endpoint = '/crm/v3/properties/companies';
        return await makeApiRequestWithErrorHandling(hubspotAccessToken, endpoint, {}, 'POST', params);
      });
    }
  );
}
