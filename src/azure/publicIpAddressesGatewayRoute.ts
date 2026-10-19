import type { ArtifactFreshnessVerdict } from '../common/artifactEvidence';
import type { PublicIpAddressesResourceReference } from './publicIpAddresses';
import type { PublicIpAddressesNetworkAccessCoverage } from './publicIpAddressesNetworkAccess';

export const PUBLIC_IP_ADDRESSES_GATEWAY_ROUTE_LIMITS = Object.freeze({
  hostNames: 64,
  pathPatterns: 64,
  sources: 32,
  associations: 3,
  reasons: 64,
  idLength: 2048,
  labelLength: 256,
  patternLength: 2048,
  reasonLength: 512,
} as const);

export type PublicIpAddressesGatewayHttpProtocol = 'http' | 'https' | 'unknown';

/** Configured address only. No DNS resolution, resource ownership or workload state is implied. */
export type PublicIpAddressesGatewayBackendTarget =
  | { kind: 'ip_address'; address: string }
  | { kind: 'fqdn'; hostname: string }
  | { kind: 'resource'; resource: PublicIpAddressesResourceReference };

export interface PublicIpAddressesGatewayListener {
  resource: PublicIpAddressesResourceReference | null;
  frontendIPConfiguration: PublicIpAddressesResourceReference | null;
  protocol: PublicIpAddressesGatewayHttpProtocol;
  port: number | null;
  /** Native host patterns, including wildcards. Empty means no configured hostname selector. */
  hostNames: string[];
}

export interface PublicIpAddressesGatewayRouteMatch {
  kind: 'basic' | 'default' | 'path' | 'unknown';
  routingRule: PublicIpAddressesResourceReference | null;
  priority: number | null;
  urlPathMap: PublicIpAddressesResourceReference | null;
  pathRule: PublicIpAddressesResourceReference | null;
  /** Zero-based native path-rule order; path rules use first-match order. */
  pathRuleOrder: number | null;
  pathPatterns: string[];
  rewriteRuleSet: PublicIpAddressesResourceReference | null;
  pathReevaluation: 'enabled' | 'disabled' | 'unknown';
}

/** One configured target per path avoids repeating entire backend pools on every destination. */
export type PublicIpAddressesGatewayForwarding =
  | {
      kind: 'backend';
      pool: PublicIpAddressesResourceReference;
      settings: PublicIpAddressesResourceReference;
      protocol: Exclude<PublicIpAddressesGatewayHttpProtocol, 'unknown'>;
      port: number;
      target: PublicIpAddressesGatewayBackendTarget;
      sourceIds: string[];
    }
  | {
      /** An empty configured pool is not proof that the public frontend is orphaned. */ kind: 'empty_backend_pool';
      pool: PublicIpAddressesResourceReference;
      settings: PublicIpAddressesResourceReference | null;
      sourceIds: string[];
    }
  | {
      kind: 'redirect';
      configuration: PublicIpAddressesResourceReference;
      target:
        | { kind: 'listener'; listener: PublicIpAddressesResourceReference }
        | {
            /** Sanitized HTTP(S) URL: no credentials, query string or fragment. */ kind: 'external';
            url: string;
          };
      statusCode: 301 | 302 | 303 | 307 | 308 | null;
      includePath: boolean | null;
      includeQueryString: boolean | null;
      sourceIds: string[];
    }
  | {
      kind: 'unresolved';
      reason: string;
      pool: PublicIpAddressesResourceReference | null;
      settings: PublicIpAddressesResourceReference | null;
      target: PublicIpAddressesGatewayBackendTarget | null;
      sourceIds: string[];
    };

export interface PublicIpAddressesWafPolicyAssociation {
  id: string;
  scope: 'gateway' | 'listener' | 'path';
  attachment: PublicIpAddressesResourceReference;
  basis: 'policy' | 'inline';
  /** Null only for legacy inline gateway configuration. */
  policy: PublicIpAddressesResourceReference | null;
  enabled: boolean | null;
  mode: 'prevention' | 'detection' | 'unknown';
  /** Binding and policy collection evidence, referencing the parent evaluation's sources. */
  sourceIds: string[];
  /** Null is unassessed; zero requires collected configuration. Counts do not establish WAF effectiveness. */
  customAllowRuleCount: number | null;
  exclusionCount: number | null;
  managedRuleSetCount: number | null;
}

/** Configuration state only: Prevention does not guarantee every request is inspected or blocked. */
export interface PublicIpAddressesWafAssessment {
  state: 'prevention' | 'detection' | 'disabled' | 'not_configured' | 'unverified';
  /** At most one applicable association per level: path > listener > gateway. */
  associations: PublicIpAddressesWafPolicyAssociation[];
  selectedAssociationId: string | null;
  /** Includes collection evidence needed to establish absence or precedence. */
  sourceIds: string[];
  incompleteReasons: string[];
  omitted: { associations: number };
}

/** Additive metadata for one configured route, not proof of live traffic or end-to-end access. */
export interface PublicIpAddressesGatewayRouteEvaluation {
  assessedAt: string;
  /** Readers independently re-evaluate original source observation times as they age. */
  freshness: ArtifactFreshnessVerdict;
  /** Reuses the identified observation-source envelope; not a packet-filter verdict. */
  coverage: PublicIpAddressesNetworkAccessCoverage;
  gateway: PublicIpAddressesResourceReference;
  listener: PublicIpAddressesGatewayListener;
  route: PublicIpAddressesGatewayRouteMatch;
  forwarding: PublicIpAddressesGatewayForwarding;
  waf: PublicIpAddressesWafAssessment;
  incompleteReasons: string[];
  omitted: { hostNames: number; pathPatterns: number; sources: number };
}
