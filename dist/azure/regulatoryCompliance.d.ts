export declare const REGULATORY_COMPLIANCE_REPORT_SCHEMA_VERSION: "2026-07-29.regulatory-compliance-v1";
export declare const REGULATORY_COMPLIANCE_ASSIGNMENT_DETAIL_SCHEMA_VERSION: "2026-07-29.regulatory-compliance-assignment-v1";
export declare const POLICY_EXEMPTION_COMMAND_SCHEMA_VERSION: "2026-07-29.policy-exemption-command-v1";
export declare const REGULATORY_COMPLIANCE_PORTAL_FILE: "regulatory-compliance.json.gz";
export declare const REGULATORY_COMPLIANCE_ASSIGNMENT_DETAIL_DIRECTORY: "regulatory-compliance/assignments";
export type PolicyExemptionCommandSchemaVersion = typeof POLICY_EXEMPTION_COMMAND_SCHEMA_VERSION;
export type AzurePolicyEvaluationState = 'compliant' | 'nonCompliant' | 'exempt' | 'error' | 'conflicting' | 'unknown' | 'protected' | 'notStarted' | 'notRegistered';
export type RegulatoryStateCounts = Record<AzurePolicyEvaluationState, number>;
export type RegulatoryEvidenceState = 'complete' | 'partial' | 'unavailable' | 'stale' | 'notCollected';
export type RegulatoryComplianceEvidenceSource = 'resourceGraph' | 'arm' | 'policyInsights' | 'derived';
export interface RegulatoryComplianceDiagnostic {
    code: string;
    message: string;
    source?: RegulatoryComplianceEvidenceSource;
}
export interface RegulatoryComplianceCoverageSection {
    state: RegulatoryEvidenceState;
    sources: RegulatoryComplianceEvidenceSource[];
    observedAt?: string;
    message?: string;
    requiredPermissions?: string[];
    diagnostics?: RegulatoryComplianceDiagnostic[];
}
export interface RegulatoryComplianceCoverage {
    state: RegulatoryEvidenceState;
    catalog: RegulatoryComplianceCoverageSection;
    assignments: RegulatoryComplianceCoverageSection;
    evaluations: RegulatoryComplianceCoverageSection;
    exemptions: RegulatoryComplianceCoverageSection;
    metadata: RegulatoryComplianceCoverageSection;
}
export interface RegulatoryStandardCatalogEntry {
    standardKey: string;
    standardFamilyKey: string;
    definitionId: string;
    definitionName: string;
    displayName: string;
    version?: string;
    category: string;
    policyType: 'BuiltIn' | 'Custom' | 'Static' | 'NotSpecified';
    isBuiltIn: boolean;
    isPreview: boolean;
    isDeprecated: boolean;
    popularityRank?: number;
    documentationUrl?: string;
}
export type RegulatoryControlResponsibility = 'customer' | 'microsoft' | 'shared' | 'unknown';
export interface RegulatoryControlMetadataResponse {
    policyMetadataId: string;
    name: string;
    displayName: string;
    domain?: string;
    responsibility: RegulatoryControlResponsibility;
    description?: string;
    requirements?: string;
    additionalContentUrl?: string;
}
export interface RegulatoryControlSummary {
    controlKey: string;
    name: string;
    displayName: string;
    domain?: string;
    responsibility: RegulatoryControlResponsibility;
    policyMetadataId?: string;
    evaluationState: AzurePolicyEvaluationState;
    counts: RegulatoryStateCounts;
    policyCount: number;
    affectedResourceCount: number;
    policyDefinitionReferenceIds: string[];
}
export interface RegulatoryStandardSummary {
    standardKey: string;
    standardFamilyKey: string;
    definitionId: string;
    definitionName: string;
    displayName: string;
    version?: string;
    assignmentKey: string;
    assignmentId: string;
    assignmentName: string;
    assignmentDisplayName: string;
    assignmentScope: string;
    effectiveScope: string;
    inherited: boolean;
    assignmentCreatedAt?: string;
    evaluationState: AzurePolicyEvaluationState;
    evaluationGeneratedAt?: string;
    counts: RegulatoryStateCounts;
    evaluatedResourceCompliancePercentage?: number;
    percentageNumerator?: number;
    percentageDenominator?: number;
    controlCount: number;
    controls: RegulatoryControlSummary[];
}
export type RegulatoryExemptionCategory = 'Waiver' | 'Mitigated';
export type RegulatoryExemptionLifecycleState = 'active' | 'expiring' | 'expired' | 'unknown';
export interface RegulatoryExemptionMetadata {
    requestedBy?: string;
    approvedBy?: string;
    approvedOn?: string;
    ticketRef?: string;
}
export interface RegulatoryExemptionSummary {
    exemptionKey: string;
    id: string;
    name: string;
    displayName: string;
    description: string;
    category: RegulatoryExemptionCategory;
    scope: string;
    policyAssignmentId: string;
    policyDefinitionReferenceIds: string[];
    lifecycleState: RegulatoryExemptionLifecycleState;
    expiresOn?: string;
    daysUntilExpiry?: number;
    metadata?: RegulatoryExemptionMetadata;
    createdAt?: string;
}
export interface RegulatoryPolicyEvaluationSummary {
    policyDefinitionId: string;
    policyDefinitionReferenceId: string;
    displayName: string;
    effect?: string;
    evaluationState: AzurePolicyEvaluationState;
    counts: RegulatoryStateCounts;
    affectedResourceCount: number;
}
export interface RegulatoryResourceEvaluation {
    resourceId: string;
    resourceName?: string;
    resourceType?: string;
    resourceGroupName?: string;
    location?: string;
    evaluationState: AzurePolicyEvaluationState;
    evaluatedAt?: string;
    policyAssignmentId: string;
    policyDefinitionId: string;
    policyDefinitionReferenceId: string;
}
export interface RegulatoryControlDetail extends RegulatoryControlSummary {
    description?: string;
    requirements?: string;
    additionalContentUrl?: string;
    policies: RegulatoryPolicyEvaluationSummary[];
    resources: RegulatoryResourceEvaluation[];
}
export interface RegulatoryComplianceSourceMetadata {
    queryFiles: string[];
}
export interface RegulatoryComplianceReport {
    schemaVersion: typeof REGULATORY_COMPLIANCE_REPORT_SCHEMA_VERSION;
    generatedAt: string;
    tenantId: string;
    subscriptionId: string;
    coverage: RegulatoryComplianceCoverage;
    catalog: RegulatoryStandardCatalogEntry[];
    standards: RegulatoryStandardSummary[];
    exemptions: RegulatoryExemptionSummary[];
    sourceMetadata: RegulatoryComplianceSourceMetadata;
}
export interface RegulatoryComplianceAssignmentDetail {
    schemaVersion: typeof REGULATORY_COMPLIANCE_ASSIGNMENT_DETAIL_SCHEMA_VERSION;
    generatedAt: string;
    tenantId: string;
    subscriptionId: string;
    assignmentKey: string;
    standard: RegulatoryStandardSummary;
    coverage: RegulatoryComplianceCoverage;
    controls: RegulatoryControlDetail[];
    exemptions: RegulatoryExemptionSummary[];
    sourceMetadata: RegulatoryComplianceSourceMetadata;
}
export interface RegulatoryResourceEvaluationPage {
    generatedAt: string;
    subscriptionId: string;
    assignmentKey: string;
    controlKey: string;
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    resources: RegulatoryResourceEvaluation[];
}
export declare const REGULATORY_COMPLIANCE_NOTE_TARGET_TYPES: readonly ["assignment", "control", "policy"];
export type RegulatoryComplianceNoteTargetType = (typeof REGULATORY_COMPLIANCE_NOTE_TARGET_TYPES)[number];
export interface RegulatoryComplianceNote {
    noteId: string;
    subscriptionId: string;
    assignmentKey: string;
    targetType: RegulatoryComplianceNoteTargetType;
    targetKey: string;
    targetLabel: string;
    content: string;
    createdAt: string;
    createdByUserId: string;
    createdByDisplayName?: string;
}
export interface RegulatoryComplianceNoteListResponse {
    notes: RegulatoryComplianceNote[];
}
export interface CreateRegulatoryComplianceNoteRequest {
    targetType: RegulatoryComplianceNoteTargetType;
    targetKey: string;
    content: string;
}
export type ComplianceExpectationScopeType = 'company' | 'cloudAccount' | 'subscription';
export type ComplianceExpectationValue = 'expected' | 'notExpected';
export type ComplianceExpectationSource = 'manual' | 'survey';
export interface ComplianceExpectationRecord {
    expectationId: string;
    companyId: string;
    provider: 'azure';
    scopeType: ComplianceExpectationScopeType;
    scopeId: string;
    standardFamilyKey: string;
    preferredDefinitionId?: string;
    expectation: ComplianceExpectationValue;
    reason?: string;
    source: ComplianceExpectationSource;
    createdAt: string;
    createdBy: string;
    updatedAt: string;
    updatedBy: string;
}
export interface EffectiveComplianceExpectation {
    standardFamilyKey: string;
    preferredDefinitionId?: string;
    expectation: ComplianceExpectationValue;
    source: ComplianceExpectationSource;
    sourceScopeType: ComplianceExpectationScopeType;
    sourceScopeId: string;
    inherited: boolean;
    reason?: string;
}
export type RegulatoryStandardRecommendationReason = 'popular' | 'applicable' | 'expected';
export interface RegulatoryStandardRecommendation {
    standard: RegulatoryStandardCatalogEntry;
    reason: RegulatoryStandardRecommendationReason;
}
export interface RegulatoryComplianceAssignmentGap {
    expectation: EffectiveComplianceExpectation;
    reason: 'noEffectiveAssignment';
    matchingDefinitionIds: string[];
}
export type RegulatoryComplianceWriteCapabilityState = 'available' | 'partial' | 'unavailable' | 'unknown';
export interface RegulatoryCompliancePermissionCheck {
    state: 'available' | 'unavailable' | 'unknown';
    scope: string;
    requiredActions: string[];
    missingActions: string[];
    message?: string;
}
export interface RegulatoryComplianceWriteCapability {
    state: RegulatoryComplianceWriteCapabilityState;
    checkedAt: string;
    targetScope: RegulatoryCompliancePermissionCheck;
    assignmentScope: RegulatoryCompliancePermissionCheck;
    setupUrl?: string;
}
export interface RegulatoryComplianceView {
    report: RegulatoryComplianceReport;
    expectations: EffectiveComplianceExpectation[];
    recommendations: RegulatoryStandardRecommendation[];
    assignmentGaps: RegulatoryComplianceAssignmentGap[];
    writeCapability: RegulatoryComplianceWriteCapability;
}
export interface UpsertComplianceExpectationRequest {
    provider: 'azure';
    scopeType: ComplianceExpectationScopeType;
    scopeId: string;
    standardFamilyKey: string;
    preferredDefinitionId?: string;
    expectation: ComplianceExpectationValue;
    reason?: string;
}
export interface ComplianceExpectationResponse {
    explicit?: ComplianceExpectationRecord;
    effective?: EffectiveComplianceExpectation;
}
export interface CreatePolicyExemptionMetadata {
    ticketRef?: string;
    requestedBy?: string;
    approvedBy?: string;
}
export interface CreatePolicyExemptionRequest {
    requestId: string;
    targetScope: string;
    policyAssignmentId: string;
    policyDefinitionReferenceIds: string[];
    category: RegulatoryExemptionCategory;
    displayName: string;
    description: string;
    expiresOn?: string;
    metadata?: CreatePolicyExemptionMetadata;
}
export interface CreatePolicyExemptionQueuedResponse {
    eventId: string;
    requestId: string;
    state: 'queued';
}
//# sourceMappingURL=regulatoryCompliance.d.ts.map