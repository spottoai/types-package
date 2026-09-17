import { type ResourceScheduleDryRunProjection, type ResourceSchedulingExecutionHistoryResponse, type ResourceSchedulingExecutionProjection, type ResourceStrategyScheduleCommand, type ResourceStrategyWeeklyScheduleSuggestion, type ResourceStrategyWeeklyScheduleListResponse, type ResourceStrategyWeeklyScheduleProjection, type ResourceStrategyWeeklyScheduleWriteRequest, type ScheduledResourceTransitionV1 } from './resourceStrategyContracts';
export declare function isResourceStrategyWeeklyScheduleSuggestion(value: unknown): value is ResourceStrategyWeeklyScheduleSuggestion;
export declare function isResourceStrategyWeeklyScheduleWriteRequest(value: unknown): value is ResourceStrategyWeeklyScheduleWriteRequest;
export declare function isResourceStrategyWeeklyScheduleProjection(value: unknown): value is ResourceStrategyWeeklyScheduleProjection;
/** Validates one bounded authoritative dry-run result for a schedule revision. */
export declare function isResourceScheduleDryRunProjection(value: unknown): value is ResourceScheduleDryRunProjection;
export declare function isScheduledResourceTransitionV1(value: unknown): value is ScheduledResourceTransitionV1;
export declare function isResourceSchedulingExecutionProjection(value: unknown): value is ResourceSchedulingExecutionProjection;
export declare function isResourceSchedulingExecutionHistoryResponse(value: unknown): value is ResourceSchedulingExecutionHistoryResponse;
export declare function isResourceStrategyScheduleCommand(value: unknown): value is ResourceStrategyScheduleCommand;
export declare function isResourceStrategyWeeklyScheduleListResponse(value: unknown): value is ResourceStrategyWeeklyScheduleListResponse;
//# sourceMappingURL=resourceStrategyScheduleValidation.d.ts.map