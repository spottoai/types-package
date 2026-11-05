import { type PublicIpAddressesNetworkAccessSource } from './publicIpAddressesNetworkAccess';
import type { PublicIpAddressesPortRange } from './publicIpAddresses';
export type JsonRecord = Record<string, unknown>;
export declare const isRecord: (value: unknown) => value is JsonRecord;
export declare const isText: (value: unknown, max?: number) => value is string;
export declare const isCount: (value: unknown) => value is number;
export declare const isOneOf: (value: unknown, options: readonly string[]) => value is string;
export declare const isArray: (value: unknown, max: number) => value is unknown[];
export declare const isTexts: (value: unknown, max: number, length?: number) => value is string[];
export declare const isUnique: (values: readonly string[]) => boolean;
export declare const protocols: string[];
/** Strict UTC timestamps with optional milliseconds; no wall-clock or freshness policy. */
export declare const timestamp: (value: unknown) => number | null;
export declare const isPortRange: (value: unknown) => value is PublicIpAddressesPortRange;
export declare const isPortRanges: (value: unknown) => value is PublicIpAddressesPortRange[];
export declare const knownPorts: (value: PublicIpAddressesPortRange[]) => boolean;
export declare const isResource: (value: unknown) => boolean;
export declare const isOmissions: (value: unknown, keys: readonly string[]) => value is Record<string, number>;
export declare const hasOmissions: (value: Record<string, number>) => boolean;
export declare const isSource: (value: unknown, assessedAt: number) => value is PublicIpAddressesNetworkAccessSource;
export declare const isIssue: (value: unknown) => boolean;
//# sourceMappingURL=publicIpAddressesEvidenceValidation.d.ts.map