import { Subscription, SubscriptionPolicies } from './subscriptions.js';

export interface ProcessPayload {
  subscriptionId?: string;
  tenantId?: string;
  authToken?: string;
  authClientId?: string;
  authClientSecret?: string;
  authTenantId?: string;
  companyId?: string;
}

export interface RequestMessage {
  entity: string;
  action: string; // create, delete
  companyId: string;
  cloudAccountId: string;
  tenantId: string;
  clientId: string;
  subscriptionId?: string;
}

export interface SubscriptionMessage {
  authToken?: string;
  authClientId?: string;
  authClientSecret?: string;
  authTenantId?: string;
  subscription: Subscription;
  companyId?: string;
  cloudAccountId?: string;
  tenantId?: string;
  clientId?: string;
  refreshComponents?: string[]; // Provide a list of components to refresh. Leave empty to refresh all components.
}

export interface SubscriptionResponse {
  displayName: string;
  id: string;
  state: string;
  subscriptionId: string;
  subscriptionPolicies: SubscriptionPolicies;
  tenantId: string;
}
