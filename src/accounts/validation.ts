import type { SubscriptionAccount } from './accounts';

export type SubscriptionValidationStatus = 'confirmed' | 'forbidden' | 'unauthorized' | 'throttled' | 'unavailable';

export interface SubscriptionReadValidationResult {
  subscription: SubscriptionAccount;
  valid: boolean;
  status: SubscriptionValidationStatus;
  statusCode: number;
  message?: string;
}

export interface CloudAccountReadAccessValidation {
  valid: boolean;
  subscriptions: SubscriptionAccount[];
  subscriptionResults: SubscriptionReadValidationResult[];
}

export interface CloudAccountWriteAccessValidation {
  valid: boolean;
  subscriptions: SubscriptionAccount[];
}

export interface CloudAccountValidationResult {
  valid: boolean;
  readAccess: CloudAccountReadAccessValidation;
  writeAccess?: CloudAccountWriteAccessValidation;
}
