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

export interface PortalFeatureSetDefinition {
  featureSetKey: string;
  displayName: string;
  description?: string;
  defaultAvailability: PortalSystemAvailability;
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
  presentationMode?: PortalPresentationMode;
  reason?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type PortalRoleAssignmentSource = 'legacy_migration' | 'admin_assignment' | 'seed';

export interface PortalPrincipalRoleAssignment {
  companyId: string;
  principalType: PortalPrincipalType;
  principalId: string;
  roleKey: string;
  delegationScope: PortalDelegationScope;
  assignmentSource: PortalRoleAssignmentSource;
  assignedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export type PortalEffectiveAccessSourceType =
  | 'feature_set'
  | 'role'
  | 'permission'
  | 'delegation_scope'
  | 'parent_restriction'
  | 'presentation';

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

export interface PortalFeatureActionAccess {
  action: PortalAccessAction;
  actionabilityState: PortalActionabilityState;
  reasonCode: PortalAccessReasonCode;
}

export interface PortalFeatureAccessSummary {
  featureKey: string;
  entitlementState: PortalEntitlementState;
  visibilityState: PortalVisibilityState;
  actions: Partial<Record<PortalAccessAction, PortalFeatureActionAccess>>;
}

export interface PortalAccessBootstrapResponse {
  customerId: string;
  principalType: PortalPrincipalType;
  principalId: string;
  catalogVersion: string;
  features: PortalFeatureAccessSummary[];
}
