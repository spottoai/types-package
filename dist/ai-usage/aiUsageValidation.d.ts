import { type AiProviderCredentialKind, type AiUsageCollectRequestMessage, type AiUsageLatestPointer, type AiUsagePeopleArtifact, type AiUsageProvider, type AiUsageSummaryArtifact, type PutAiUsageAllocationRequest, type AiUsageAllocation } from './aiUsage';
export declare const isAiUsageProvider: (value: unknown) => value is AiUsageProvider;
/** Allocation tags: at most AI_USAGE_MAX_TAGS, keys and values matching the contract patterns. */
export declare const isAiUsageTags: (value: unknown) => value is Record<string, string>;
/** Body of `PUT …/ai-usage/allocations`. */
export declare function isPutAiUsageAllocationRequest(value: unknown): value is PutAiUsageAllocationRequest;
export declare function isAiUsageAllocation(value: unknown): value is AiUsageAllocation;
export declare const isAiProviderCredentialKindFor: (provider: AiUsageProvider, kind: unknown) => kind is AiProviderCredentialKind;
export declare const isAiProviderConnectionStatus: (value: unknown) => boolean;
export declare function isAiUsageCollectRequestMessage(value: unknown): value is AiUsageCollectRequestMessage;
export declare function isAiUsageSummaryArtifact(value: unknown): value is AiUsageSummaryArtifact;
/** Structural guard for the people artifact of one month. */
export declare function isAiUsagePeopleArtifact(value: unknown): value is AiUsagePeopleArtifact;
export declare function isAiUsageLatestPointer(value: unknown): value is AiUsageLatestPointer;
//# sourceMappingURL=aiUsageValidation.d.ts.map