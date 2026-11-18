import type { Microsoft365OptimizationAccountListRequest, Microsoft365OptimizationAccountListResponse, Microsoft365OptimizationAccountReadRequest, Microsoft365OptimizationAccountResponse, Microsoft365OptimizationCatalogue, Microsoft365OptimizationConfigurationInput, Microsoft365OptimizationConfigurationPreview, Microsoft365OptimizationConfigurationWriteRequest, Microsoft365OptimizationHistorySnapshot, Microsoft365OptimizationManagementResponse, Microsoft365OptimizationProjectionBinding, Microsoft365OptimizationSummaryResponse, Microsoft365PricingConfigurationDocument } from './microsoft365OptimizationManagement';
/** Authenticated API validates inventory membership, source ownership and activation dates; this guard checks bounded authored input. */
export declare function isMicrosoft365OptimizationConfigurationInput(value: unknown): value is Microsoft365OptimizationConfigurationInput;
/** Both versions are readable; existing v1 guard/allowlist stays unchanged. Reader adoption must precede the first v2 write. */
export declare function isMicrosoft365PricingConfigurationDocument(value: unknown): value is Microsoft365PricingConfigurationDocument;
export declare function isMicrosoft365OptimizationConfigurationWriteRequest(value: unknown): value is Microsoft365OptimizationConfigurationWriteRequest;
export declare function isMicrosoft365OptimizationCatalogue(value: unknown): value is Microsoft365OptimizationCatalogue;
export declare function isMicrosoft365OptimizationManagementResponse(value: unknown): value is Microsoft365OptimizationManagementResponse;
export declare function isMicrosoft365OptimizationConfigurationPreview(value: unknown): value is Microsoft365OptimizationConfigurationPreview;
/** Captures one scan's monthly observation. Only later completed months can become stable-demand history. */
export declare function isMicrosoft365OptimizationHistorySnapshot(value: unknown): value is Microsoft365OptimizationHistorySnapshot;
export declare function isMicrosoft365OptimizationProjectionBinding(value: unknown): value is Microsoft365OptimizationProjectionBinding;
export declare function isMicrosoft365OptimizationAccountReadRequest(value: unknown): value is Microsoft365OptimizationAccountReadRequest;
export declare function isMicrosoft365OptimizationAccountListRequest(value: unknown): value is Microsoft365OptimizationAccountListRequest;
export declare function isMicrosoft365OptimizationSummaryResponse(value: unknown): value is Microsoft365OptimizationSummaryResponse;
export declare function isMicrosoft365OptimizationAccountResponse(value: unknown): value is Microsoft365OptimizationAccountResponse;
export declare function isMicrosoft365OptimizationAccountListResponse(value: unknown): value is Microsoft365OptimizationAccountListResponse;
//# sourceMappingURL=microsoft365OptimizationManagementValidation.d.ts.map