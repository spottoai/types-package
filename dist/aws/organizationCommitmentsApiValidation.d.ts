import { type AwsOrganizationCommitmentsRefreshAcceptedResponse, type AwsOrganizationCommitmentsRefreshStatusResponse, type AwsOrganizationCommitmentsScopeListResponse } from './organizationCommitments.js';
export interface AwsOrganizationCommitmentsAdmissionExpectedIdentity {
    companyId: string;
    estateId: string;
    manifestRevision: string;
}
export interface AwsOrganizationCommitmentsStatusExpectedIdentity {
    companyId: string;
    estateId: string;
    organizationId: string;
    managementAccountId: string;
    targetManifestRevision: string;
    requestId?: string;
}
/** Validates one API-authored organization commitments refresh receipt. */
export declare function validateAwsOrganizationCommitmentsRefreshAcceptedResponse(value: unknown, expected: AwsOrganizationCommitmentsAdmissionExpectedIdentity): AwsOrganizationCommitmentsRefreshAcceptedResponse;
/** Validates the safe organization scope selector response for one company. */
export declare function validateAwsOrganizationCommitmentsScopeListResponse(value: unknown, expectedCompanyId: string): AwsOrganizationCommitmentsScopeListResponse;
/** Validates one sanitized Blob-backed organization commitments status projection. */
export declare function validateAwsOrganizationCommitmentsRefreshStatusResponse(value: unknown, expected: AwsOrganizationCommitmentsStatusExpectedIdentity): AwsOrganizationCommitmentsRefreshStatusResponse;
//# sourceMappingURL=organizationCommitmentsApiValidation.d.ts.map