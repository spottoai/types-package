import type { ResourceScheduleWeekday, ResourceStrategyWeeklyRule } from './resourceStrategy';
export interface WeeklyAvailabilityFixtureBoundary {
    dayOfWeek: ResourceScheduleWeekday;
    timeLocal: string;
}
export interface WeeklyAvailabilityFixturePeriod {
    periodKey: string;
    start: WeeklyAvailabilityFixtureBoundary;
    end: WeeklyAvailabilityFixtureBoundary;
}
export interface WeeklyAvailabilityStateSample {
    instantUtc: string;
    expectedState: 'normal' | 'reduced';
}
export interface WeeklyAvailabilityFixtureV1 {
    caseId: string;
    timezone: string;
    validity: 'valid' | 'invalid';
    periods: readonly WeeklyAvailabilityFixturePeriod[];
    expectedRules?: readonly ResourceStrategyWeeklyRule[];
    stateSamples?: readonly WeeklyAvailabilityStateSample[];
    invalidReason?: 'overlap' | 'conflicting-transition';
    dstPolicy?: 'spring-forward-first-valid' | 'fall-back-restore-first' | 'fall-back-reduce-second';
}
export declare const WEEKLY_AVAILABILITY_FIXTURES_V1: readonly WeeklyAvailabilityFixtureV1[];
//# sourceMappingURL=weeklyAvailabilityFixtures.d.ts.map