import { type EnvironmentCardinalityV1, type EnvironmentCoverageStateV1, type EnvironmentPillarV1 } from './contracts.js';
/** Validates one admitted environment pillar. */
export declare const isEnvironmentPillarV1: (value: unknown) => value is EnvironmentPillarV1;
/** Validates the closed coverage-state union and state-specific freshness rules. */
export declare const isEnvironmentCoverageStateV1: (value: unknown) => value is EnvironmentCoverageStateV1;
/** Validates exact, lower-bound, and unavailable count evidence without ambiguous totals. */
export declare const isEnvironmentCardinalityV1: (value: unknown) => value is EnvironmentCardinalityV1;
//# sourceMappingURL=valueValidation.d.ts.map