import { z } from "zod";
import { getHubspotToken } from "../route";
import { handleEndpoint, makeApiRequestWithErrorHandling } from "../helpers";

export const communicationPreferencesSchema = z.object({
  subscriptionId: z.string(),
  status: z.enum(['SUBSCRIBED', 'UNSUBSCRIBED', 'NOT_OPTED']),
  legalBasis: z.enum(['LEGITIMATE_INTEREST_CLIENT', 'LEGITIMATE_INTEREST_PUB', 'PERFORMANCE_OF_CONTRACT', 'CONSENT_WITH_NOTICE', 'CONSENT_WITH_NOTICE_AND_OPT_OUT']).optional(),
  legalBasisExplanation: z.string().optional()
}).catchall(z.any());

export function registerCommunicationsTools(server: any) {
  server.registerTool(
    "communications_get_preferences",
    {
      description: "Get communication preferences for a contact",
      inputSchema: {
        contactId: z.string(),
        subscriptionId: z.string().optional()
      }
    },
    async (params: any, extra: any) => {
      const hubspotAccessToken = getHubspotToken(extra);
      return handleEndpoint(async () => {
        const subscriptionEndpointPath = params.subscriptionId ? `/subscription/${params.subscriptionId}` : '';
        const endpoint = `/communication-preferences/v3/status/email/${params.contactId}${subscriptionEndpointPath}`;
        return await makeApiRequestWithErrorHandling(hubspotAccessToken, endpoint);
      });
    }
  );

  server.registerTool(
    "communications_update_preferences",
    {
      description: "Update communication preferences for a contact",
      inputSchema: {
        contactId: z.string(),
        subscriptionId: z.string(),
        preferences: communicationPreferencesSchema
      }
    },
    async (params: any, extra: any) => {
      const hubspotAccessToken = getHubspotToken(extra);
      return handleEndpoint(async () => {
        const endpoint = `/communication-preferences/v3/status/email/${params.contactId}/subscription/${params.subscriptionId}`;
        return await makeApiRequestWithErrorHandling(hubspotAccessToken, endpoint, {}, 'PUT', params.preferences);
      });
    }
  );

  server.registerTool(
    "communications_unsubscribe_contact",
    {
      description: "Unsubscribe a contact from all email communications",
      inputSchema: {
        contactId: z.string(),
        portalSubscriptionLegalBasis: z.enum(['LEGITIMATE_INTEREST_CLIENT', 'LEGITIMATE_INTEREST_PUB', 'PERFORMANCE_OF_CONTRACT', 'CONSENT_WITH_NOTICE', 'CONSENT_WITH_NOTICE_AND_OPT_OUT']).optional(),
        portalSubscriptionLegalBasisExplanation: z.string().optional()
      }
    },
    async (params: any, extra: any) => {
      const hubspotAccessToken = getHubspotToken(extra);
      return handleEndpoint(async () => {
        const endpoint = `/communication-preferences/v3/unsubscribe/email/${params.contactId}`;
        return await makeApiRequestWithErrorHandling(hubspotAccessToken, endpoint, {}, 'PUT', {
          portalSubscriptionLegalBasis: params.portalSubscriptionLegalBasis,
          portalSubscriptionLegalBasisExplanation: params.portalSubscriptionLegalBasisExplanation
        });
      });
    }
  );

  server.registerTool(
    "communications_subscribe_contact",
    {
      description: "Subscribe a contact to all email communications",
      inputSchema: {
        contactId: z.string(),
        portalSubscriptionLegalBasis: z.enum(['LEGITIMATE_INTEREST_CLIENT', 'LEGITIMATE_INTEREST_PUB', 'PERFORMANCE_OF_CONTRACT', 'CONSENT_WITH_NOTICE', 'CONSENT_WITH_NOTICE_AND_OPT_OUT']).optional(),
        portalSubscriptionLegalBasisExplanation: z.string().optional()
      }
    },
    async (params: any, extra: any) => {
      const hubspotAccessToken = getHubspotToken(extra);
      return handleEndpoint(async () => {
        const endpoint = `/communication-preferences/v3/subscribe/email/${params.contactId}`;
        return await makeApiRequestWithErrorHandling(hubspotAccessToken, endpoint, {}, 'PUT', {
          portalSubscriptionLegalBasis: params.portalSubscriptionLegalBasis,
          portalSubscriptionLegalBasisExplanation: params.portalSubscriptionLegalBasisExplanation
        });
      });
    }
  );

  server.registerTool(
    "communications_get_subscription_definitions",
    {
      description: "Get all subscription definitions for the portal",
      inputSchema: {
        archived: z.boolean().optional()
      }
    },
    async (params: any, extra: any) => {
      const hubspotAccessToken = getHubspotToken(extra);
      return handleEndpoint(async () => {
        const endpoint = '/communication-preferences/v3/definitions';
        return await makeApiRequestWithErrorHandling(hubspotAccessToken, endpoint, {
          archived: params.archived
        });
      });
    }
  );

  server.registerTool(
    "communications_get_subscription_status",
    {
      description: "Get subscription status for multiple contacts",
      inputSchema: {
        subscriptionId: z.string(),
        contactIds: z.array(z.string())
      }
    },
    async (params: any, extra: any) => {
      const hubspotAccessToken = getHubspotToken(extra);
      return handleEndpoint(async () => {
        const endpoint = `/communication-preferences/v3/status/email/subscription/${params.subscriptionId}/bulk`;
        return await makeApiRequestWithErrorHandling(hubspotAccessToken, endpoint, {}, 'POST', {
          contactIds: params.contactIds
        });
      });
    }
  );

  server.registerTool(
    "communications_update_subscription_status",
    {
      description: "Update subscription status for multiple contacts",
      inputSchema: {
        subscriptionId: z.string(),
        updates: z.array(z.object({
          contactId: z.string(),
          status: z.enum(['SUBSCRIBED', 'UNSUBSCRIBED', 'NOT_OPTED']),
          legalBasis: z.enum(['LEGITIMATE_INTEREST_CLIENT', 'LEGITIMATE_INTEREST_PUB', 'PERFORMANCE_OF_CONTRACT', 'CONSENT_WITH_NOTICE', 'CONSENT_WITH_NOTICE_AND_OPT_OUT']).optional(),
          legalBasisExplanation: z.string().optional()
        }))
      }
    },
    async (params: any, extra: any) => {
      const hubspotAccessToken = getHubspotToken(extra);
      return handleEndpoint(async () => {
        const endpoint = `/communication-preferences/v3/status/email/subscription/${params.subscriptionId}/bulk`;
        return await makeApiRequestWithErrorHandling(hubspotAccessToken, endpoint, {}, 'PUT', {
          updates: params.updates
        });
      });
    }
  );
}
