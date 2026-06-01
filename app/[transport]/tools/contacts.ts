import { z } from "zod";
import { getHubspotToken } from "../route";
import { handleEndpoint, makeApiRequestWithErrorHandling } from "../helpers";

export const contactPropertiesSchema = z.object({
  email: z.string().email().optional(),
  firstname: z.string().optional(),
  lastname: z.string().optional(),
  phone: z.string().optional(),
  mobilephone: z.string().optional(),
  company: z.string().optional(),
  jobtitle: z.string().optional(),
  lifecyclestage: z.enum(['subscriber', 'lead', 'marketingqualifiedlead', 'salesqualifiedlead', 'opportunity', 'customer', 'evangelist', 'other']).optional(),
  leadstatus: z.enum(['new', 'open', 'inprogress', 'opennotcontacted', 'opencontacted', 'closedconverted', 'closednotconverted']).optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  country: z.string().optional(),
  website: z.string().url().optional(),
  twitterhandle: z.string().optional(),
  facebookfanpage: z.string().optional(),
  linkedinbio: z.string().optional(),
}).catchall(z.any());

export function registerContactsTools(server: any) {
  server.registerTool(
    "crm_create_contact",
    {
      description: "Create a new contact with validated properties",
      inputSchema: {
        properties: contactPropertiesSchema,
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
        const endpoint = '/crm/v3/objects/contacts';
        return await makeApiRequestWithErrorHandling(hubspotAccessToken, endpoint, {}, 'POST', {
          properties: params.properties,
          associations: params.associations
        });
      });
    }
  );

  server.registerTool(
    "crm_update_contact",
    {
      description: "Update an existing contact with validated properties",
      inputSchema: {
        contactId: z.string(),
        properties: contactPropertiesSchema
      }
    },
    async (params: any, extra: any) => {
      const hubspotAccessToken = getHubspotToken(extra);
      return handleEndpoint(async () => {
        const endpoint = `/crm/v3/objects/contacts/${params.contactId}`;
        return await makeApiRequestWithErrorHandling(hubspotAccessToken, endpoint, {}, 'PATCH', {
          properties: params.properties
        });
      });
    }
  );

  server.registerTool(
    "crm_get_contact",
    {
      description: "Get a single contact by ID with specific properties and associations",
      inputSchema: {
        contactId: z.string(),
        properties: z.array(z.string()).optional(),
        associations: z.array(z.enum(['companies', 'deals', 'tickets', 'calls', 'emails', 'meetings', 'notes'])).optional()
      }
    },
    async (params: any, extra: any) => {
      const hubspotAccessToken = getHubspotToken(extra);
      return handleEndpoint(async () => {
        const endpoint = `/crm/v3/objects/contacts/${params.contactId}`;
        return await makeApiRequestWithErrorHandling(hubspotAccessToken, endpoint, {
          properties: params.properties?.join(','),
          associations: params.associations?.join(',')
        });
      });
    }
  );

  server.registerTool(
    "crm_search_contacts",
    {
      description: "Search contacts with contact-specific filters",
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
        const endpoint = '/crm/v3/objects/contacts/search';
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
    "crm_batch_create_contacts",
    {
      description: "Create multiple contacts in a single request",
      inputSchema: {
        inputs: z.array(z.object({
          properties: contactPropertiesSchema,
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
        const endpoint = '/crm/v3/objects/contacts/batch/create';
        return await makeApiRequestWithErrorHandling(hubspotAccessToken, endpoint, {}, 'POST', {
          inputs: params.inputs
        });
      });
    }
  );

  server.registerTool(
    "crm_batch_update_contacts",
    {
      description: "Update multiple contacts in a single request",
      inputSchema: {
        inputs: z.array(z.object({
          id: z.string(),
          properties: contactPropertiesSchema
        }))
      }
    },
    async (params: any, extra: any) => {
      const hubspotAccessToken = getHubspotToken(extra);
      return handleEndpoint(async () => {
        const endpoint = '/crm/v3/objects/contacts/batch/update';
        return await makeApiRequestWithErrorHandling(hubspotAccessToken, endpoint, {}, 'POST', {
          inputs: params.inputs
        });
      });
    }
  );

  server.registerTool(
    "crm_get_contact_properties",
    {
      description: "Get all properties for contacts",
      inputSchema: {
        archived: z.boolean().optional(),
        properties: z.array(z.string()).optional()
      }
    },
    async (params: any, extra: any) => {
      const hubspotAccessToken = getHubspotToken(extra);
      return handleEndpoint(async () => {
        const endpoint = '/crm/v3/properties/contacts';
        return await makeApiRequestWithErrorHandling(hubspotAccessToken, endpoint, {
          archived: params.archived,
          properties: params.properties?.join(',')
        });
      });
    }
  );

  server.registerTool(
    "crm_create_contact_property",
    {
      description: "Create a new contact property",
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
        const endpoint = '/crm/v3/properties/contacts';
        return await makeApiRequestWithErrorHandling(hubspotAccessToken, endpoint, {}, 'POST', params);
      });
    }
  );
}
