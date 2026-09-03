import { type ActivityLogAnalysisCount, type PortalActivityEvidenceId, type PortalActivityAnalysisGroupId, type PortalActivityLogAnalysisScope, type PortalActivityLogClassification } from './activityLogAnalysis';
export declare const MONTH: RegExp;
export declare const TAG_IDS: Set<string>;
export declare const ORIGINS: Set<string>;
export declare const EFFECTS: Set<string>;
export declare const CONFIDENCES: Set<string>;
export declare const POWER_SUFFICIENCY: Set<string>;
export declare const LIMITATIONS: Set<string>;
export declare const isRecord: (value: unknown) => value is Record<string, unknown>;
export declare const hasExactKeys: (value: unknown, required: readonly string[], optional?: readonly string[]) => value is Record<string, unknown>;
export declare const isText: (value: unknown, maximum: number) => value is string;
export declare const isCount: (value: unknown) => value is number;
export declare const isPositiveCount: (value: unknown) => value is number;
export declare const isTimestamp: (value: unknown) => value is string;
export declare const isDate: (value: unknown) => value is string;
export declare const isSortedUniqueStrings: (value: unknown, maximum: number, predicate: (item: string) => boolean) => value is string[];
export declare const countRowsTotal: (rows: ActivityLogAnalysisCount[]) => number | undefined;
export declare const isCountRows: (value: unknown, maximum: number, valueMaximum: number, allowed?: ReadonlySet<string>) => value is ActivityLogAnalysisCount[];
export declare const isChronologicalCountRows: (value: unknown, predicate: (key: string) => boolean) => value is ActivityLogAnalysisCount[];
export declare const isScope: (value: unknown, subscriptionId: string, resourceId?: string) => value is PortalActivityLogAnalysisScope;
/** Validates the exact additive classification carried by one Portal Activity Log entry. */
export declare const isPortalActivityLogClassification: (value: unknown) => value is PortalActivityLogClassification;
/** Validates the opaque V1 public Activity Log evidence ID syntax. */
export declare const isPortalActivityEvidenceId: (value: unknown) => value is PortalActivityEvidenceId;
/** Validates the opaque V1 public Activity Analysis group ID syntax. */
export declare const isPortalActivityAnalysisGroupId: (value: unknown) => value is PortalActivityAnalysisGroupId;
export declare const isEvidenceIds: (value: unknown) => value is PortalActivityEvidenceId[];
export declare const isGroupIds: (value: unknown) => value is PortalActivityAnalysisGroupId[];
export declare const isTags: (value: unknown) => value is string[];
export declare const isReasons: (value: unknown) => boolean;
export declare const hasValidTimes: (value: Record<string, unknown>) => boolean;
export declare const utf8ByteLength: (value: string) => number;
//# sourceMappingURL=activityLogAnalysisPublicValidationHelpers.d.ts.map