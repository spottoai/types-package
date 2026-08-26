/** Provider/evidence descriptor for one already-owned baseline component. */
export interface FinancialAuthorityComponentDescriptorV1 {
  baselineId: string;
  componentId: string;
  displayLabel: string;
  displayLabelSource: 'meter-name' | 'product-name' | 'meter-subcategory' | 'meter-category' | 'service-name' | 'charge-classification';
  serviceName?: string;
  meterCategory?: string;
  meterSubCategory?: string;
  meterName?: string;
  productName?: string;
  unitOfMeasure?: string;
  evidenceRefIds: [string, ...string[]];
}

/** Reference to one canonical component; it never copies or re-owns money. */
export interface FinancialDisplayRollupMembershipV1 {
  baselineId: string;
  componentId: string;
}

/**
 * Presentation-only grouping over canonical owner components. It deliberately
 * carries no amount; consumers may explain its members but never add the
 * rollup to an owner or aggregate baseline.
 */
export interface FinancialDisplayRollupV1 {
  displayRollupId: string;
  displayScopeId: string;
  purpose: 'cost-composition';
  additivity: 'non-additive';
  displayLabel: string;
  displayLabelSource: 'service-name' | 'meter-category' | 'charge-classification';
  members: [FinancialDisplayRollupMembershipV1, ...FinancialDisplayRollupMembershipV1[]];
}

export type FinancialDisplayRollupIdentityPreimageV1 = Omit<FinancialDisplayRollupV1, 'displayRollupId'>;
