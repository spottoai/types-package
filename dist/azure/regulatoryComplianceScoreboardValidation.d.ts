import { type JsonRecord } from '../common/validationHelpers';
import { type RegulatoryComplianceScoreboardSubscription, type RegulatoryComplianceScoreboardHistory } from './regulatoryComplianceScoreboard';
export declare function isRegulatoryComplianceScoreboardSubscription(value: unknown): value is RegulatoryComplianceScoreboardSubscription;
export declare function isRegulatoryComplianceScoreboardHistory(value: unknown): value is RegulatoryComplianceScoreboardHistory;
/** New report history fields are atomic: capped/incomplete baselines must be absent. */
export declare function isRegulatoryReportComparisonIdentities(value: JsonRecord): boolean;
//# sourceMappingURL=regulatoryComplianceScoreboardValidation.d.ts.map