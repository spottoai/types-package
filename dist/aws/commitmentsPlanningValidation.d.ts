import type { AwsCommitmentsPlanningView } from '../azure/commitmentsPlanning.js';
/**
 * Validates the security-sensitive AWS identity boundary of a commitments view.
 * A full public-artifact validator should call this before publication or response.
 */
export declare function validateAwsCommitmentsPlanningViewIdentity(value: unknown, expectedAccountId?: string): asserts value is AwsCommitmentsPlanningView;
//# sourceMappingURL=commitmentsPlanningValidation.d.ts.map