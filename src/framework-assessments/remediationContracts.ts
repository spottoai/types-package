import type { AssessmentNativeScope } from './contracts';

export type FrameworkRemediationEffortProfile = 'clickops' | 'devops' | 'enterprise';
export type FrameworkRemediationTier = 'now' | 'next' | 'later';
export interface FrameworkRemediationEffortBreakdown {
  setupMinutes: number;
  perResourceMinutes: number;
  validationMinutes: number;
  resourceCount: number;
  /** Integer estimated person-minutes, never elapsed delivery time. */
  totalMinutes: number;
}
export interface FrameworkRemediationEffort {
  profiles: Record<FrameworkRemediationEffortProfile, FrameworkRemediationEffortBreakdown>;
  selectedProfile: FrameworkRemediationEffortProfile;
  provenance: 'curated-estimate' | 'company-override';
  targetCountBasis: 'scope-setting' | 'distinct-native-resources';
  assumptions: string[];
}
export interface FrameworkRemediationEffortTotal {
  /** Complete selected-profile total; null whenever any distinct action has unknown effort. */
  totalMinutes: number | null;
  /** Known selected-profile subtotal, incomplete when unknownActions is positive. */
  knownMinutes: number;
  unknownActions: number;
}
export interface FrameworkRemediationAction {
  /** Stable provider/native-scope/action/target identity, independent of framework and control. */
  id: string;
  actionKey: string;
  /** Empty only for explicit unknown-target actions representing a control with no check mapping. */
  checkIds: string[];
  controlIds: string[];
  /** Distinct canonical native top-level resource IDs; display labels are never identities. */
  resourceIds: string[];
  jobKey: string;
  targetKind: 'setting' | 'resources' | 'unknown';
  targetIdentity: string;
  risk: { level: 1 | 2 | 3 | 4 | 5 | null; source: 'threatscore' | 'severity' | 'unknown' };
  verification: 'verified' | 'unverified';
  effort: FrameworkRemediationEffort | null;
  /** Required exactly when effort is null. */
  effortUnavailableReason?: string;
  changeRisk: 'none' | 'low' | 'disruptive' | 'unknown';
  changeNote?: string;
  downtime: 'required' | 'not-required' | 'unknown';
  costState: 'no-added-cost' | 'adds-cost' | 'unknown';
  tier: FrameworkRemediationTier;
  reasons: string[];
}
export interface FrameworkRemediationControl {
  controlId: string;
  actionIds: string[];
  tier: FrameworkRemediationTier;
  /** Includes explanations for incomplete mappings; unknown work is represented by an explicit action. */
  reasons: string[];
}
export interface FrameworkRemediationJob {
  jobKey: string;
  actionIds: string[];
  controlIds: string[];
  resourceIds: string[];
  tier: FrameworkRemediationTier;
  effort: FrameworkRemediationEffortTotal;
}
/** First-delivery projection. It carries no monetary pricing, customer decisions or progress. */
export interface FrameworkRemediationPlanDocument {
  schemaVersion: 1;
  companyId: string;
  scope: AssessmentNativeScope;
  frameworkId: string;
  sourceVersion: string;
  catalogueBundleSha256: string;
  generationSha256: string;
  computedAt: string;
  inputs: {
    plannerVersion: string;
    profilesVersion: string;
    effortProfile: FrameworkRemediationEffortProfile;
    profileSource: 'account-setting' | 'default';
    /** Digest of the one bounded effective override snapshot; null when no overrides apply. */
    overridesSha256: string | null;
  };
  actions: FrameworkRemediationAction[];
  /** Only outstanding controls are projected; this is not a full framework control catalogue. */
  controls: FrameworkRemediationControl[];
  jobs: FrameworkRemediationJob[];
  totals: FrameworkRemediationEffortTotal;
}

export const FRAMEWORK_REMEDIATION_PLAN_LIMITS = Object.freeze({
  actions: 10000,
  controls: 10000,
  jobs: 10000,
  references: 10000,
  reasons: 64,
  reasonLength: 2048,
  identityLength: 1024,
  resourceIdLength: 4096,
});
