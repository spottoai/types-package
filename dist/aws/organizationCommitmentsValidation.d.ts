import type { AwsOrganizationCommitmentsPlanningView } from './organizationCommitments.js';
export interface AwsOrganizationCommitmentsExpectedIdentity {
    companyId: string;
    estateId: string;
    organizationId: string;
    managementAccountId: string;
    manifestRevision: string;
    memberAccountIds: readonly string[];
}
/** Validates the multi-account identity boundary of an AWS organization commitments view. */
export declare function validateAwsOrganizationCommitmentsPlanningViewIdentity(value: unknown, expected: AwsOrganizationCommitmentsExpectedIdentity): asserts value is AwsOrganizationCommitmentsPlanningView;
//# sourceMappingURL=organizationCommitmentsValidation.d.ts.map