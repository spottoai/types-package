import type { RecommendationResource } from './recommendations.js';

// Unresolved provider rows carry identity without inventing a billing amount.
const unknownSpend = {
  id: 'arn:aws:trustedadvisor::012345678901:recommendation-resource/Flagged',
  name: 'Orders',
  type: 'AWS::TrustedAdvisor::Resource',
} satisfies RecommendationResource;
const measuredZero = { ...unknownSpend, spend: 0, spendAmortized: 0, currency: 'USD' } satisfies RecommendationResource;
const billedCredit = { ...unknownSpend, spend: -5, spendAmortized: -3, currency: 'USD' } satisfies RecommendationResource;
const malformedSpend: RecommendationResource = {
  ...unknownSpend,
  // @ts-expect-error Absent and numeric spend are valid; text is not monetary evidence.
  spend: '0',
};

void unknownSpend;
void measuredZero;
void billedCredit;
void malformedSpend;
