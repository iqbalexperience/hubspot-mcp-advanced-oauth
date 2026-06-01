import { z } from "zod";
import { getHubspotToken } from "../route";
import { handleEndpoint, makeApiRequestWithErrorHandling } from "../helpers";

export const engagementDetailsSchema = z.object({
  type: z.enum(['EMAIL', 'CALL', 'MEETING', 'TASK', 'NOTE']),
  title: z.string(),
  description: z.string().optional(),
  owner: z.object({
    id: z.string(),
    email: z.string().email()
  }).optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  activityType: z.string().optional(),
  loggedAt: z.string().optional(),
  status: z.string().optional()
}).catchall(z.any());

export function registerEngagementsTools(server: any) {
  server.registerTool(
    "engagement_details_get",
    {
      description: "Get details of a specific engagement",
      inputSchema: {
        engagementId: z.string()
      }
    },
    async (params: any, extra: any) => {
      const hubspotAccessToken = getHubspotToken(extra);
      return handleEndpoint(async () => {
        const endpoint = `/engagements/v1/engagements/${params.engagementId}`;
        return await makeApiRequestWithErrorHandling(hubspotAccessToken, endpoint);
      });
    }
  );

  server.registerTool(
    "engagement_details_create",
    {
      description: "Create a new engagement with details",
      inputSchema: {
        engagement: engagementDetailsSchema,
        associations: z.object({
          contactIds: z.array(z.string()).optional(),
          companyIds: z.array(z.string()).optional(),
          dealIds: z.array(z.string()).optional(),
          ownerIds: z.array(z.string()).optional(),
          ticketIds: z.array(z.string()).optional()
        }).optional(),
        metadata: z.record(z.string(), z.any()).optional()
      }
    },
    async (params: any, extra: any) => {
      const hubspotAccessToken = getHubspotToken(extra);
      return handleEndpoint(async () => {
        const endpoint = '/engagements/v1/engagements';
        return await makeApiRequestWithErrorHandling(hubspotAccessToken, endpoint, {}, 'POST', {
          engagement: params.engagement,
          associations: params.associations,
          metadata: params.metadata
        });
      });
    }
  );

  server.registerTool(
    "engagement_details_update",
    {
      description: "Update an existing engagement's details",
      inputSchema: {
        engagementId: z.string(),
        engagement: engagementDetailsSchema,
        metadata: z.record(z.string(), z.any()).optional()
      }
    },
    async (params: any, extra: any) => {
      const hubspotAccessToken = getHubspotToken(extra);
      return handleEndpoint(async () => {
        const endpoint = `/engagements/v1/engagements/${params.engagementId}`;
        return await makeApiRequestWithErrorHandling(hubspotAccessToken, endpoint, {}, 'PATCH', {
          engagement: params.engagement,
          metadata: params.metadata
        });
      });
    }
  );

  server.registerTool(
    "engagement_details_list",
    {
      description: "List all engagements with optional filtering",
      inputSchema: {
        limit: z.number().min(1).max(100).optional(),
        offset: z.number().optional(),
        startTime: z.string().optional(),
        endTime: z.string().optional(),
        activityTypes: z.array(z.string()).optional()
      }
    },
    async (params: any, extra: any) => {
      const hubspotAccessToken = getHubspotToken(extra);
      return handleEndpoint(async () => {
        const endpoint = '/engagements/v1/engagements/paged';
        return await makeApiRequestWithErrorHandling(hubspotAccessToken, endpoint, {
          limit: params.limit,
          offset: params.offset,
          startTime: params.startTime,
          endTime: params.endTime,
          activityTypes: params.activityTypes?.join(',')
        });
      });
    }
  );

  server.registerTool(
    "engagement_details_archive",
    {
      description: "Archive (delete) an engagement",
      inputSchema: {
        engagementId: z.string()
      }
    },
    async (params: any, extra: any) => {
      const hubspotAccessToken = getHubspotToken(extra);
      return handleEndpoint(async () => {
        const endpoint = `/engagements/v1/engagements/${params.engagementId}`;
        return await makeApiRequestWithErrorHandling(hubspotAccessToken, endpoint, {}, 'DELETE');
      });
    }
  );

  server.registerTool(
    "engagement_details_get_associated",
    {
      description: "Get all engagements associated with an object",
      inputSchema: {
        objectType: z.enum(['CONTACT', 'COMPANY', 'DEAL', 'TICKET']),
        objectId: z.string(),
        startTime: z.string().optional(),
        endTime: z.string().optional(),
        activityTypes: z.array(z.string()).optional(),
        limit: z.number().min(1).max(100).optional(),
        offset: z.number().optional()
      }
    },
    async (params: any, extra: any) => {
      const hubspotAccessToken = getHubspotToken(extra);
      return handleEndpoint(async () => {
        const endpoint = `/engagements/v1/engagements/associated/${params.objectType}/${params.objectId}/paged`;
        return await makeApiRequestWithErrorHandling(hubspotAccessToken, endpoint, {
          startTime: params.startTime,
          endTime: params.endTime,
          activityTypes: params.activityTypes?.join(','),
          limit: params.limit,
          offset: params.offset
        });
      });
    }
  );
}
