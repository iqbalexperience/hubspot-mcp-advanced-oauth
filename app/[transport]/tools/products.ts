import { z } from "zod";
import { getHubspotToken } from "../route";
import { handleEndpoint, makeApiRequestWithErrorHandling } from "../helpers";

export const productPropertiesSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  price: z.number().optional(),
  sku: z.string().optional(),
  hs_product_type: z.string().optional(),
  hs_recurring_billing_period: z.string().optional(),
}).catchall(z.any());

export function registerProductsTools(server: any) {
  server.registerTool(
    "products_list",
    {
      description: "Read a page of products. Control what is returned via the `properties` query param. `after` is the paging cursor token of the last successfully read resource will be returned as the `paging.next.after` JSON property of a paged response containing more results.",
      inputSchema: {
        limit: z.number().min(1).optional(),
        after: z.string().optional(),
        properties: z.array(z.string()).optional()
      }
    },
    async (params: any, extra: any) => {
      const hubspotAccessToken = getHubspotToken(extra);
      return handleEndpoint(async () => {
        const endpoint = '/crm/v3/objects/products';
        return await makeApiRequestWithErrorHandling(hubspotAccessToken, endpoint, {
          limit: params.limit,
          after: params.after,
          properties: params.properties?.join(',')
        });
      });
    }
  );

  server.registerTool(
    "products_read",
    {
      description: "Read an Object identified by ID",
      inputSchema: {
        productId: z.string(),
        properties: z.array(z.string()).optional(),
        associations: z.array(z.string()).optional()
      }
    },
    async (params: any, extra: any) => {
      const hubspotAccessToken = getHubspotToken(extra);
      return handleEndpoint(async () => {
        const endpoint = `/crm/v3/objects/products/${params.productId}`;
        return await makeApiRequestWithErrorHandling(hubspotAccessToken, endpoint, {
          properties: params.properties?.join(','),
          associations: params.associations?.join(',')
        });
      });
    }
  );

  server.registerTool(
    "products_create",
    {
      description: "Create a product with the given properties and return a copy of the object, including the ID.",
      inputSchema: {
        properties: productPropertiesSchema
      }
    },
    async (params: any, extra: any) => {
      const hubspotAccessToken = getHubspotToken(extra);
      return handleEndpoint(async () => {
        const endpoint = '/crm/v3/objects/products';
        return await makeApiRequestWithErrorHandling(hubspotAccessToken, endpoint, {}, 'POST', { properties: params.properties });
      });
    }
  );

  server.registerTool(
    "products_update",
    {
      description: "Perform a partial update of an Object identified by ID. Read-only and non-existent properties will result in an error. Properties values can be cleared by passing an empty string.",
      inputSchema: {
        productId: z.string(),
        properties: productPropertiesSchema
      }
    },
    async (params: any, extra: any) => {
      const hubspotAccessToken = getHubspotToken(extra);
      return handleEndpoint(async () => {
        const endpoint = `/crm/v3/objects/products/${params.productId}`;
        return await makeApiRequestWithErrorHandling(hubspotAccessToken, endpoint, {}, 'PATCH', { properties: params.properties });
      });
    }
  );

  server.registerTool(
    "products_archive",
    {
      description: "Move an Object identified by ID to the recycling bin.",
      inputSchema: {
        productId: z.string()
      }
    },
    async (params: any, extra: any) => {
      const hubspotAccessToken = getHubspotToken(extra);
      return handleEndpoint(async () => {
        const endpoint = `/crm/v3/objects/products/${params.productId}`;
        return await makeApiRequestWithErrorHandling(hubspotAccessToken, endpoint, {}, 'DELETE');
      });
    }
  );

  server.registerTool(
    "products_search",
    {
      description: "Search products",
      inputSchema: {
        query: z.string().optional(),
        limit: z.number().min(1).optional(),
        after: z.string().optional(),
        sorts: z.array(z.string()).optional(),
        properties: z.array(z.string()).optional(),
        filterGroups: z.array(z.object({
          filters: z.array(z.object({
            propertyName: z.string(),
            operator: z.enum(['EQ', 'NEQ', 'LT', 'LTE', 'GT', 'GTE', 'BETWEEN', 'IN', 'NOT_IN', 'HAS_PROPERTY', 'NOT_HAS_PROPERTY', 'CONTAINS_TOKEN', 'NOT_CONTAINS_TOKEN']),
            value: z.any().optional(),
            values: z.array(z.any()).optional()
          }))
        })).optional()
      }
    },
    async (params: any, extra: any) => {
      const hubspotAccessToken = getHubspotToken(extra);
      return handleEndpoint(async () => {
        const endpoint = '/crm/v3/objects/products/search';
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
    "products_batch_archive",
    {
      description: "Archive (delete) a batch of products by ID",
      inputSchema: {
        productIds: z.array(z.string()),
      }
    },
    async (params: any, extra: any) => {
      const hubspotAccessToken = getHubspotToken(extra);
      return handleEndpoint(async () => {
        const endpoint = '/crm/v3/objects/products/batch/archive';
        return await makeApiRequestWithErrorHandling(hubspotAccessToken, endpoint, {}, 'POST', { inputs: params.productIds.map((id: string) => ({ id })) });
      });
    }
  );

  server.registerTool(
    "products_batch_create",
    {
      description: "Create a batch of products",
      inputSchema: {
        inputs: z.array(z.object({ properties: productPropertiesSchema }))
      }
    },
    async (params: any, extra: any) => {
      const hubspotAccessToken = getHubspotToken(extra);
      return handleEndpoint(async () => {
        const endpoint = '/crm/v3/objects/products/batch/create';
        return await makeApiRequestWithErrorHandling(hubspotAccessToken, endpoint, {}, 'POST', { inputs: params.inputs });
      });
    }
  );

  server.registerTool(
    "products_batch_read",
    {
      description: "Read a batch of products by internal ID, or unique property values. Retrieve records by the `idProperty` parameter to retrieve records by a custom unique value property.",
      inputSchema: {
        propertiesWithHistory: z.array(z.string()),
        idProperty: z.string().optional(),
        productIds: z.array(z.string()),
        properties: z.array(z.string())
      }
    },
    async (params: any, extra: any) => {
      const hubspotAccessToken = getHubspotToken(extra);
      return handleEndpoint(async () => {
        const endpoint = '/crm/v3/objects/products/batch/read';
        return await makeApiRequestWithErrorHandling(hubspotAccessToken, endpoint, {}, 'POST', { inputs: params.productIds.map((id: string) => ({ id })) });
      });
    }
  );

  server.registerTool(
    "products_batch_update",
    {
      description: "Update a batch of products by internal ID, or unique values specified by the `idProperty` query param.",
      inputSchema: {
        inputs: z.array(z.object({
          id: z.string(),
          idProperty: z.string().optional(),
          objectWriteTraceId: z.string().optional(),
          properties: productPropertiesSchema
        }))
      }
    },
    async (params: any, extra: any) => {
      const hubspotAccessToken = getHubspotToken(extra);
      return handleEndpoint(async () => {
        const endpoint = '/crm/v3/objects/products/batch/update';
        return await makeApiRequestWithErrorHandling(hubspotAccessToken, endpoint, {}, 'POST', { inputs: params.inputs });
      });
    }
  );
}
