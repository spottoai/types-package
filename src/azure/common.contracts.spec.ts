import type { ResourceCostType } from './common';

const actualOnly: ResourceCostType = {
  name: 'Pay as you go',
  cost: 52.18,
};

const amortizedOnly: ResourceCostType = {
  name: 'Reserved Instances',
  costAmortized: 41.96,
};

const explicitZero: ResourceCostType = {
  name: 'No usage',
  cost: 0,
  costAmortized: 0,
};

const signedValues: ResourceCostType = {
  name: 'Credits and adjustments',
  cost: -12.5,
  costAmortized: -11.25,
};

// @ts-expect-error resource cost entries must identify the resource type.
const missingName: ResourceCostType = { cost: 1 };

const nonNumberActual: ResourceCostType = {
  name: 'Invalid actual cost',
  // @ts-expect-error actual cost must be numeric.
  cost: '1',
};

const nonNumberAmortized: ResourceCostType = {
  name: 'Invalid amortized cost',
  // @ts-expect-error amortized cost must be numeric.
  costAmortized: '1',
};

void actualOnly;
void amortizedOnly;
void explicitZero;
void signedValues;
void missingName;
void nonNumberActual;
void nonNumberAmortized;
