/** Primitive values accepted in billing analyzer request metadata. */
export type BillingAnalyzerMetadataPrimitive = string | number | boolean | null;
/** JSON-serializable values accepted in billing analyzer request metadata. */
export type BillingAnalyzerMetadataValue = BillingAnalyzerMetadataPrimitive | BillingAnalyzerMetadataValue[] | {
    [key: string]: BillingAnalyzerMetadataValue;
};
/** Optional JSON metadata forwarded with a billing analyzer request. */
export interface BillingAnalyzerMetadata {
    [key: string]: BillingAnalyzerMetadataValue;
}
/** One source billing file whose expected dates are incomplete. */
export interface BillingAnalyzerFileWithGaps {
    file: string;
    missingDays: string[];
    issueReasons?: string[];
}
/** Shared identity for one subscription's opaque billing generation. */
export interface BillingGenerationRef {
    subscriptionId: string;
    billingGenerationId: string;
}
/** Current expected billing generation reserved for one published source run. */
export interface BillingGenerationState extends BillingGenerationRef {
    sourceRunId: string;
    /** UTC ISO 8601 timestamp for publication of the source run. */
    sourcePublishedAt: string;
}
/** Latest-only queue contract consumed by the Azure billing analyzer. */
export interface BillingAnalyzerRequest extends BillingGenerationRef {
    correlationId: string;
    producerProfile: 'cloud-engine-billing-calendar';
    producerSchemaVersion: 'v1';
    requestedBasis: 'amortized';
    currencyCode: string;
    currencySymbol: string;
    detectDataGaps: boolean;
    companyId: string;
    cloudAccountId: string;
    tenantId: string;
    clientId: string;
    metadata?: BillingAnalyzerMetadata;
    filesWithGaps?: BillingAnalyzerFileWithGaps[];
}
/** Manifest published after all output for a billing generation is complete. */
export interface BillingGenerationOutput extends BillingGenerationRef {
    status: 'completed';
    /** UTC ISO 8601 timestamp for completion of the generation output. */
    completedAt: string;
}
//# sourceMappingURL=billingGeneration.d.ts.map