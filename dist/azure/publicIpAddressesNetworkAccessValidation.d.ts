import { type PerimeterServiceClassification, type PublicIpAddressesNetworkAccessEvaluation } from './publicIpAddressesNetworkAccess';
export declare const isPerimeterServiceClassification: (value: unknown) => value is PerimeterServiceClassification;
/**
 * Checks bounded extension shape and declared evidence consistency only. It cannot
 * prove truthful collection, resolved selectors, exhaustive packet coverage, or
 * real network reachability. Readers must re-evaluate freshness using their clock.
 */
export declare const isPublicIpAddressesNetworkAccessEvaluation: (value: unknown) => value is PublicIpAddressesNetworkAccessEvaluation;
//# sourceMappingURL=publicIpAddressesNetworkAccessValidation.d.ts.map