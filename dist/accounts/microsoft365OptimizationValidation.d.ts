import type { Microsoft365CommercialSubscription, Microsoft365OptimizationAccountDetail, Microsoft365OptimizationCohortEvidence, Microsoft365OptimizationEvidence, Microsoft365OptimizationSummary } from './microsoft365Optimization';
/** Shape/provenance guard only. Applications prove source identity, authenticity, RBAC, source joins and commercial rules. */
export declare function isMicrosoft365CommercialSubscription(value: unknown): value is Microsoft365CommercialSubscription;
export declare function isMicrosoft365ObservedCommercialSubscription(value: unknown): value is import('./microsoft365Optimization').Microsoft365ObservedCommercialSubscription;
/** Private page guard. Other published pages are not omissions; byte limits and cross-page authorization remain application duties. */
export declare function isMicrosoft365OptimizationEvidence(value: unknown): value is Microsoft365OptimizationEvidence;
/** Anonymous internal weights let API project full populations without reading every private person page. */
export declare function isMicrosoft365OptimizationCohortEvidence(value: unknown): value is Microsoft365OptimizationCohortEvidence;
/** Anonymous wire guard. Price multiplication, compatible portfolio allocation, catalogue and provider authenticity remain consumer duties. */
export declare function isMicrosoft365OptimizationSummary(value: unknown): value is Microsoft365OptimizationSummary;
/** One-account detail with finding-local option identities and disjoint selected products across financial and protection actions. */
export declare function isMicrosoft365OptimizationAccountDetail(value: unknown): value is Microsoft365OptimizationAccountDetail;
//# sourceMappingURL=microsoft365OptimizationValidation.d.ts.map