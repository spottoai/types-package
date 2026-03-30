import type { SubscriptionMessage } from './payloads';
import type { Subscription } from './subscriptions';

const subscription: Subscription = {
  companyId: 'comp-123',
  tenantId: 'tenant-123',
  tenantSubscriptionIds: ['sub-123'],
  subscriptionId: 'sub-123',
  displayName: 'Production Subscription',
  spendingLimit: false,
  quotaId: 'payg',
};

const subscriptionMessage: SubscriptionMessage = {
  subscription,
  companyId: 'comp-123',
};

void subscriptionMessage;

// @ts-expect-error SubscriptionMessage.companyId is required for queue payload compatibility.
const invalidSubscriptionMessage: SubscriptionMessage = {
  subscription,
};

void invalidSubscriptionMessage;
