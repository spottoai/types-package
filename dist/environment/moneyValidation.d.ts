import { type EnvironmentMoneyValueV1, type EnvironmentSavingsBasisV1 } from './contracts.js';
/** Validates the producer projection rule and window behind a savings amount. */
export declare const isEnvironmentSavingsBasisV1: (value: unknown) => value is EnvironmentSavingsBasisV1;
/** Validates canonical decimal money with explicit currency, basis, period, and provenance. */
export declare const isEnvironmentMoneyValueWithProvenanceV1: <Provenance extends string>(value: unknown, provenances: ReadonlySet<Provenance>) => value is EnvironmentMoneyValueV1<Provenance>;
//# sourceMappingURL=moneyValidation.d.ts.map