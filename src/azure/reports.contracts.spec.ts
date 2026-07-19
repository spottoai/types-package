import type { BillingChargeContext, DecompositionTreeNode, ResourceLifecycleContext } from './reports';
import type { ResourceSpend } from './prices';

const marketplaceCharge: BillingChargeContext = {
  source: 'marketplace',
  publisher: 'nerdio',
  product: 'nmm',
  cadence: 'monthly',
};

const lifecycle: ResourceLifecycleContext = {
  createdAt: '2022-06-09T23:07:35.4448617Z',
  createdInPeriod: false,
};

const node: DecompositionTreeNode = {
  name: 'nerdiomsp',
  cost: 613.2,
  percentageOfTotal: 100,
  totalSpend: 613.2,
  chargeContext: marketplaceCharge,
  resourceLifecycle: lifecycle,
};

const spend: ResourceSpend = {
  cost: 613.20383,
  quantity: 37.459,
  meterCategory: 'Azure Applications',
  meterSubCategory: 'Nerdio Manager for MSP',
  serviceName: 'Azure Applications',
  meter: 'Per desktop user per month - Desktop users',
  serviceTier: 'Application Solution',
  resourceGuid: 'nerdio',
  publisherType: 'Marketplace',
};

void node;
void spend;
