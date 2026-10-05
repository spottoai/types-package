import type { ResourceSpend } from '../src/azure/prices.js';

const legacy: ResourceSpend = {
  cost: 0,
  quantity: 0,
  meterCategory: '',
  meterSubCategory: '',
  serviceName: '',
  meter: '',
  serviceTier: '',
  resourceGuid: '',
};

// Provider strings remain open-ended and historical rows need no new fields.
const classified: ResourceSpend = {
  ...legacy,
  pricingModel: 'FutureProviderModel',
  chargeType: 'FutureProviderCharge',
};
void classified;
