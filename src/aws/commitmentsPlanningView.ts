import type { ProviderName } from '../common/provider.js';
import type {
  AwsCommitmentsPlanningProviderScope,
  CommitmentEligibilityMetadata,
  CommitmentShape,
  CommitmentsInventoryItem,
  CommitmentsPlanningViewBase,
  CommitmentsPurchaseRecommendation,
  CommitmentsSourceMetadata,
} from '../azure/commitmentsPlanning.js';

/** AWS wire shape with an account identity and AWS-specific inventory and recommendation evidence. */
export interface AwsCommitmentsPlanningView extends CommitmentsPlanningViewBase<AwsCommitmentsInventoryItem, AwsCommitmentsPurchaseRecommendation> {
  providerScope: AwsCommitmentsPlanningProviderScope;
  subscription?: never;
  credentialHealth?: never;
  storageCapacity?: never;
}

export type AwsCommitmentShape = Omit<CommitmentShape, 'provider'> & {
  provider: 'aws';
};

export type AwsCommitmentsSourceMetadata = Omit<CommitmentsSourceMetadata, 'sourceKind'> & {
  sourceKind: 'aws-native';
};

export type AwsCommitmentEligibilityMetadata = Omit<
  CommitmentEligibilityMetadata,
  'currentShape' | 'targetShape' | 'quotePolicy' | 'unlockFinancialLedger' | 'source'
> & {
  currentShape?: AwsCommitmentShape;
  targetShape?: AwsCommitmentShape;
  quotePolicy?: never;
  unlockFinancialLedger?: never;
  source?: AwsCommitmentsSourceMetadata;
};

export interface AwsCommitmentsAppliedScopeProperties {
  accountId: string;
  region?: string;
  availabilityZone?: string;
}

export type AwsCommitmentsInventoryItem = Omit<
  CommitmentsInventoryItem,
  'sourceKind' | 'provider' | 'shape' | 'appliedScopeType' | 'appliedScopeProperties' | 'subscriptionId' | 'breakCostEstimate' | 'storageDimensions'
> & {
  sourceKind: 'aws-native';
  provider: ProviderName.Aws;
  shape?: AwsCommitmentShape;
  subscriptionId?: never;
  breakCostEstimate?: never;
  storageDimensions?: never;
  appliedScopeType: 'linked-account';
  appliedScopeProperties: AwsCommitmentsAppliedScopeProperties;
};

export type AwsCommitmentsPurchaseRecommendation = Omit<
  CommitmentsPurchaseRecommendation,
  | 'eligibility'
  | 'source'
  | 'currentShape'
  | 'targetShape'
  | 'quotePolicy'
  | 'unlockFinancialLedger'
  | 'purchaseScope'
  | 'appliedScopeProperties'
  | 'pricingQuote'
> & {
  eligibility?: AwsCommitmentEligibilityMetadata;
  source: AwsCommitmentsSourceMetadata;
  currentShape?: AwsCommitmentShape;
  targetShape: AwsCommitmentShape;
  quotePolicy?: never;
  unlockFinancialLedger?: never;
  purchaseScope: 'linked-account';
  appliedScopeProperties: AwsCommitmentsAppliedScopeProperties;
  pricingQuote?: never;
};
