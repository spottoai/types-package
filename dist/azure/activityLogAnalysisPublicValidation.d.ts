import { type PortalActivityAnalysisResponse } from './activityLogAnalysis';
import { isPortalActivityAnalysisGroupId, isPortalActivityEvidenceId, isPortalActivityLogClassification } from './activityLogAnalysisPublicValidationHelpers';
export { isPortalActivityAnalysisGroupId, isPortalActivityEvidenceId, isPortalActivityLogClassification };
/** Validates the exact, bounded, consumer-safe V1 Activity Analysis response. */
export declare const isPortalActivityAnalysisResponse: (value: unknown) => value is PortalActivityAnalysisResponse;
/** Throws when a value is not the exact public V1 Activity Analysis response. */
export declare function assertPortalActivityAnalysisResponse(value: unknown): asserts value is PortalActivityAnalysisResponse;
//# sourceMappingURL=activityLogAnalysisPublicValidation.d.ts.map