import type { ArtifactFreshnessVerdict } from '../common/artifactEvidence';
import type { PublicIpAddressesCoverage, PublicIpAddressesCoverageSource, PublicIpAddressesExposureProtocol, PublicIpAddressesPortRange, PublicIpAddressesResourceReference } from './publicIpAddresses';
/** Representation limits; clipping must remain visible as incomplete evidence. */
export declare const PUBLIC_IP_ADDRESSES_NETWORK_ACCESS_LIMITS: Readonly<{
    readonly partitions: 64;
    readonly selectors: 64;
    readonly decisions: 8;
    readonly sources: 32;
    readonly reasons: 64;
    readonly idLength: 2048;
    readonly labelLength: 256;
    readonly selectorLength: 2048;
    readonly reasonLength: 512;
}>;
export type PerimeterServiceCategory = 'remote_access' | 'cluster_management' | 'database' | 'file_share' | 'messaging' | 'web' | 'other';
/** A configuration-derived hint, not a verified application identity. */
export interface PerimeterServiceClassification {
    id: string;
    label: string;
    category: PerimeterServiceCategory;
    basis: 'port' | 'listener' | 'resource_configuration';
    protocol: PublicIpAddressesExposureProtocol;
    /** Public entry ports supporting the hint. Null means unavailable. */
    frontendPortRanges: PublicIpAddressesPortRange[] | null;
    /** Translated destination ports supporting the hint, independently of public ports. */
    backendPortRanges: PublicIpAddressesPortRange[] | null;
}
/** Configured filtering of new inbound flows only; never a live/end-to-end reachability verdict. */
export type PublicIpAddressesNetworkAccessVerdict = 'allowed' | 'blocked' | 'unverified';
export interface PublicIpAddressesNetworkAccessSource extends PublicIpAddressesCoverageSource {
    /** Unique within this evaluation; decisions reference these IDs. */
    id: string;
    /** UTC source collection time, never report publication time. Null means unavailable. */
    observedAt: string | null;
}
export interface PublicIpAddressesNetworkAccessCoverage extends Omit<PublicIpAddressesCoverage, 'sources'> {
    sources: PublicIpAddressesNetworkAccessSource[];
}
export interface PublicIpAddressesPacketSourceSelector {
    kind: 'ip_prefix' | 'service_tag' | 'application_security_group' | 'unknown';
    /**
     * A native selector, not a resolved address list. Service tags/ASGs support a
     * complete partition only when the owning evaluator has resolved their context.
     */
    value: string;
}
export interface PublicIpAddressesNetworkRuleDecision {
    level: 'subnet' | 'nic' | 'gateway_subnet' | 'resource' | 'platform';
    filter: PublicIpAddressesResourceReference | null;
    rule: PublicIpAddressesResourceReference | null;
    priority: number | null;
    access: 'allow' | 'deny';
    basis: 'rule' | 'default_rule' | 'platform_default';
    reasonCode: string;
    /** Every source needed for this decision, including topology/SKU proof for platform defaults. */
    sourceIds: string[];
}
interface PublicIpAddressesPacketPartitionBase {
    id: string;
    sourceSelectors: PublicIpAddressesPacketSourceSelector[];
    /** Known bounds require matching numeric/range text (or '*' for 0-65535); null bounds remain unknown. */
    sourcePortRanges: PublicIpAddressesPortRange[];
    /** Post-NAT destination ports. Public service hints remain separate on exposures. */
    backendPortRanges: PublicIpAddressesPortRange[];
    protocol: PublicIpAddressesExposureProtocol;
    /** Ordered first-match decisions, one per filter attachment at each level; allow passes every required filter. */
    decisions: PublicIpAddressesNetworkRuleDecision[];
    incompleteReasons: string[];
    omitted: {
        sourceSelectors: number;
        sourcePortRanges: number;
        backendPortRanges: number;
        decisions: number;
    };
}
export type PublicIpAddressesPacketPartition = PublicIpAddressesPacketPartitionBase & ({
    complete: true;
    verdict: 'allowed' | 'blocked';
} | {
    complete: false;
    verdict: 'unverified';
});
export interface PublicIpAddressesNetworkAccessEvaluation {
    /** Allowed means at least one complete allowed subset, not all traffic or successful access. */
    verdict: PublicIpAddressesNetworkAccessVerdict;
    assessedAt: string;
    /** Consumers must independently re-evaluate source freshness as time passes. */
    freshness: ArtifactFreshnessVerdict;
    coverage: PublicIpAddressesNetworkAccessCoverage;
    /** Producer assertion that every relevant packet subset is represented; guards cannot prove packet algebra. */
    exhaustive: boolean;
    partitions: PublicIpAddressesPacketPartition[];
    incompleteReasons: string[];
    omitted: {
        partitions: number;
        sources: number;
    };
}
export {};
//# sourceMappingURL=publicIpAddressesNetworkAccess.d.ts.map