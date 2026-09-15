export type PortalPrincipalType = 'user' | 'api_key';

export interface PortalPrincipal {
  principalType: PortalPrincipalType;
  principalId: string;
  displayName?: string;
}

export type PortalDelegationScope = 'SELF' | 'SELF_AND_DIRECT_CHILDREN' | 'SELF_AND_ALL_CHILDREN' | 'GLOBAL';

export type PortalAccessAction = 'view' | 'use' | 'manage' | 'assign';

export type PortalPresentationMode = 'hidden' | 'normal' | 'teaser' | 'promo';

export type PortalReleaseStage = 'preview' | 'ga' | 'deprecated';

export type PortalSystemAvailability = 'available_by_default' | 'unavailable_by_default' | 'restricted';

export type PortalFeatureSetOverrideDecision = 'allow' | 'deny' | 'restrict';

export type PortalFeatureSetOverrideAppliesTo = 'all_users' | 'local_company_users' | 'delegated_admins';

export type PortalEntitlementState = 'enabled' | 'not_available' | 'disabled' | 'blocked_by_parent';

export type PortalVisibilityState = 'hidden' | 'visible' | 'teaser' | 'promo';

export type PortalActionabilityState = 'actionable' | 'locked';

export type PortalAccessReasonCode =
  | 'allowed'
  | 'missing_view_permission'
  | 'missing_use_permission'
  | 'missing_manage_permission'
  | 'missing_assign_permission'
  | 'feature_not_entitled'
  | 'feature_disabled'
  | 'blocked_by_parent'
  | 'presentation_hidden'
  | 'unknown_feature';

export interface PortalFeatureDefinition {
  featureKey: string;
  featureSetKey: string;
  displayName: string;
  description?: string;
  releaseStage: PortalReleaseStage;
  systemAvailability: PortalSystemAvailability;
  defaultPresentationMode: PortalPresentationMode;
}

export type PortalFeatureSetOverrideAuthority = 'none' | 'portal_admin' | 'company_admin';

export interface PortalFeatureSetDefinition {
  featureSetKey: string;
  displayName: string;
  description?: string;
  defaultAvailability: PortalSystemAvailability;
  customerManaged: boolean;
  overrideAuthority?: PortalFeatureSetOverrideAuthority;
  rootCompanyOnly?: boolean;
  featureKeys: string[];
}

export interface PortalPermissionDefinition {
  permissionKey: string;
  featureKey: string;
  action: PortalAccessAction;
  displayName: string;
  description?: string;
}

export interface PortalRoleDefinition {
  roleKey: string;
  displayName: string;
  description?: string;
  permissionKeys: string[];
  assignablePrincipalTypes: PortalPrincipalType[];
  defaultDelegationScope: PortalDelegationScope;
}

export interface PortalAccessSystemCatalog {
  version: string;
  generatedAt: string;
  featureSets: PortalFeatureSetDefinition[];
  features: PortalFeatureDefinition[];
  permissions: PortalPermissionDefinition[];
  roles: PortalRoleDefinition[];
}

export interface PortalCompanyFeatureOverride {
  companyId: string;
  featureSetKey: string;
  decision: PortalFeatureSetOverrideDecision;
  appliesTo?: PortalFeatureSetOverrideAppliesTo;
  presentationMode?: PortalPresentationMode;
  reason?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface PortalCompanyFeatureOverrideUpsertRequest {
  decision: PortalFeatureSetOverrideDecision;
  appliesTo?: PortalFeatureSetOverrideAppliesTo;
  presentationMode?: PortalPresentationMode;
  reason?: string;
}

export type PortalRoleAssignmentSource = 'legacy_migration' | 'admin_assignment' | 'seed';

export type PortalAssignmentDataScope = { mode: 'unrestricted' } | { mode: 'scoped'; scopeIds: string[] };

export type PortalAccessIdSelector = { mode: 'all' } | { mode: 'selected'; ids: string[] };
export type PortalAccessGroupSelector = { mode: 'all' } | { mode: 'selected'; names: string[] };
export type PortalAccessResourceFilter = { mode: 'none' } | { mode: 'tag_collection'; tagCollectionId: string };

export type PortalAccessTagPredicate =
  | { all: PortalAccessTagPredicate[] }
  | { any: PortalAccessTagPredicate[] }
  | { source: 'azure' | 'spotto'; key: string; operator: 'equals'; value: string }
  | { source: 'azure' | 'spotto'; key: string; operator: 'in'; values: string[] };

export interface PortalAccessTagCollection {
  id: string;
  name: string;
  predicate: PortalAccessTagPredicate;
}

export interface PortalAccessScopeDefinition {
  id: string;
  name: string;
  enabled: boolean;
  providerName: 'azure';
  cloudAccounts: PortalAccessIdSelector;
  subscriptionGroups: PortalAccessGroupSelector;
  subscriptions: PortalAccessIdSelector;
  resourceFilter: PortalAccessResourceFilter;
}

export interface PortalAccessScopeDocument {
  version: '1.0';
  revision: number;
  updatedAt: string;
  updatedBy: string;
  tagCollections: PortalAccessTagCollection[];
  scopes: PortalAccessScopeDefinition[];
}

export interface PortalPrincipalRoleAssignment {
  companyId: string;
  principalType: PortalPrincipalType;
  principalId: string;
  roleKey: string;
  delegationScope: PortalDelegationScope;
  /** Absent only on legacy rows; a present invalid value must never grant unrestricted access. */
  dataScope?: PortalAssignmentDataScope;
  assignmentSource: PortalRoleAssignmentSource;
  assignedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PortalPrincipalRoleAssignmentUpsertRequest {
  delegationScope?: PortalDelegationScope;
  dataScope?: PortalAssignmentDataScope;
}

export type PortalEffectiveAccessSourceType = 'feature_set' | 'role' | 'permission' | 'delegation_scope' | 'parent_restriction' | 'presentation';

export interface PortalEffectiveAccessSource {
  sourceType: PortalEffectiveAccessSourceType;
  key: string;
  decision?: string;
}

export interface PortalEffectiveAccessResponse {
  customerId: string;
  principalType: PortalPrincipalType;
  principalId: string;
  featureKey: string;
  requestedAction: PortalAccessAction;
  entitlementState: PortalEntitlementState;
  visibilityState: PortalVisibilityState;
  actionabilityState: PortalActionabilityState;
  reasonCode: PortalAccessReasonCode;
  sources: PortalEffectiveAccessSource[];
}

export type PortalDataScopeMode = 'unrestricted' | 'restricted' | 'none' | 'unavailable';

export interface PortalAccessScopeSummaryItem {
  id: string;
  name: string;
}

export interface PortalAccessScopeSummary {
  /** Opaque cache identity for the caller's effective scope. It is not an authorization token. */
  fingerprint: string;
  eligibleSubscriptionCount: number;
  scopes: PortalAccessScopeSummaryItem[];
}

export interface PortalFeatureActionAccess {
  action: PortalAccessAction;
  actionabilityState: PortalActionabilityState;
  reasonCode: PortalAccessReasonCode;
  /** Present on scope-aware bootstrap responses; optional while older API deployments remain in rotation. */
  dataScopeMode?: PortalDataScopeMode;
}

export interface PortalFeatureAccessSummary {
  featureKey: string;
  entitlementState: PortalEntitlementState;
  visibilityState: PortalVisibilityState;
  actions: Partial<Record<PortalAccessAction, PortalFeatureActionAccess>>;
}

export interface PortalFeatureSetAccessSummary {
  featureSetKey: string;
  entitlementState: PortalEntitlementState;
  visibilityState: PortalVisibilityState;
  reasonCode: PortalAccessReasonCode;
  sourceCompanyId?: string;
  presentationMode: PortalPresentationMode;
  sources: PortalEffectiveAccessSource[];
}

export interface PortalAccessBootstrapResponse {
  customerId: string;
  principalType: PortalPrincipalType;
  principalId: string;
  catalogVersion: string;
  scopeSummary?: PortalAccessScopeSummary;
  featureSets: PortalFeatureSetAccessSummary[];
  features: PortalFeatureAccessSummary[];
}
