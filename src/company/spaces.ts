import type { ProviderName, ProviderScope } from '../common/provider';

export const SPACE_FEATURE_KEY = 'spaces' as const;
export const SPACE_VIEW_PERMISSION_KEY = 'spaces.view' as const;
export const SPACE_MANAGE_PERMISSION_KEY = 'spaces.manage' as const;

export type SpaceStatus = 'active' | 'archived';

/** Server-resolved availability. Only a finite, authorized selection can resolve. */
export type SpaceCloudEvidence = 'referencesOnly' | 'resolvedEmpty' | 'unavailable' | 'resolved';

export interface SpaceAzureSubscription extends ProviderScope {
  providerName: ProviderName.Azure;
}

export interface SpaceSubscriptionSelection extends SpaceAzureSubscription {
  displayName?: string;
}

/** A whole Azure resource group. Its subscription does not need to be selected as well. */
export interface SpaceResourceGroupSelection extends SpaceAzureSubscription {
  resourceGroup: string;
}

export interface SpaceResourceGroupSelectionDetail extends SpaceResourceGroupSelection {
  subscriptionDisplayName?: string;
}

/**
 * Matches a resource whose Azure tag or Spotto tag rule has this key and value, like a scoped-access tag filter.
 * A Space's tags narrow its directly selected subscriptions and resource groups; any one tag is enough.
 */
export interface SpaceTagSelection {
  key: string;
  value: string;
}

/** An existing scoped-access definition. It keeps its own subscriptions and tag rule. */
export interface SpaceNamedScopeSelection {
  scopeId: string;
}

export interface SpaceNamedScopeSelectionDetail extends SpaceNamedScopeSelection {
  name: string;
  enabled: boolean;
}

export interface SpaceSummary {
  id: string;
  name: string;
  purpose?: string;
  ownerId?: string;
  updatedAt: string;
  status: SpaceStatus;
}

export interface SpaceDetail extends SpaceSummary {
  revision: number;
  areaId?: string;
  teamId?: string;
  answerPreferences?: string;
  /** Contains only references the current viewer may access at their owning source. */
  references: SpaceReferenceSummary[];
  cloudEvidence: SpaceCloudEvidence;
  /** Saved subscriptions visible to the current viewer. Other selections remain server-managed. */
  subscriptions?: SpaceSubscriptionSelection[];
  /** Saved resource groups visible to the current viewer. */
  resourceGroups?: SpaceResourceGroupSelectionDetail[];
  /** Narrows the direct subscription and resource-group selections. Absent or empty means no tag filter. */
  tags?: SpaceTagSelection[];
  /** Named scopes the current viewer may see. */
  namedScopes?: SpaceNamedScopeSelectionDetail[];
  /** True when the Space has selections this viewer cannot see. The number is never disclosed. */
  hasHiddenSelections?: boolean;
}

export interface SpaceListResponse {
  items: SpaceSummary[];
  continuation?: string;
}

export interface SpaceCreateRequest {
  name: string;
  purpose?: string;
  ownerId?: string;
  teamId?: string;
  areaId?: string;
  answerPreferences?: string;
}

export interface SpaceRevisionRequest {
  /** The editable Space revision returned by the last successful read or mutation. */
  revision: number;
}

export interface SpaceUpdateRequest extends SpaceRevisionRequest {
  name?: string;
  purpose?: string | null;
  ownerId?: string | null;
  teamId?: string | null;
  areaId?: string | null;
  answerPreferences?: string | null;
}

/** Changes explicit selections atomically while preserving every other stored selection. */
export interface SpaceSubscriptionUpdateRequest extends SpaceRevisionRequest {
  add?: SpaceAzureSubscription[];
  remove?: SpaceAzureSubscription[];
  addResourceGroups?: SpaceResourceGroupSelection[];
  removeResourceGroups?: SpaceResourceGroupSelection[];
  addNamedScopes?: SpaceNamedScopeSelection[];
  removeNamedScopes?: SpaceNamedScopeSelection[];
  /** Replaces the whole tag filter. Omit to keep it; an empty list clears it. */
  tags?: SpaceTagSelection[];
}

export type SpaceSelectionUpdateRequest = SpaceSubscriptionUpdateRequest;

export interface SpaceResourceGroupOption extends SpaceResourceGroupSelection {
  resourceCount: number;
}

export interface SpaceResourceGroupOptionsResponse {
  items: SpaceResourceGroupOption[];
}

export interface SpaceTagOption {
  key: string;
  values: string[];
}

export interface SpaceTagOptionsResponse {
  items: SpaceTagOption[];
  /** Some selected subscriptions had no readable inventory, so their tags are missing. */
  unavailableSubscriptionCount?: number;
  /** The option list hit its size limit. */
  limited?: boolean;
}

export interface SpaceNamedScopeOption {
  scopeId: string;
  name: string;
  enabled: boolean;
}

export interface SpaceNamedScopeOptionsResponse {
  items: SpaceNamedScopeOption[];
}

export type SpaceReferenceInput =
  | {
      kind: 'markdown';
      title: string;
      markdown: string;
      confirmCompanyShare: true;
    }
  | {
      kind: 'companyNote' | 'companyMemory';
      sourceId: string;
    };

export interface SpaceReferenceWriteRequest extends SpaceRevisionRequest {
  reference: SpaceReferenceInput;
}

export interface SpaceReferenceSummary {
  id: string;
  kind: SpaceReferenceInput['kind'];
  title: string;
  /** Exact reference or linked-source revision used when opening citations. */
  revision: string;
}

export interface SpaceReferenceDetail extends SpaceReferenceSummary {
  markdown?: string;
  /** An authorized Portal route. Blob paths and arbitrary redirects are never returned. */
  sourcePath?: string;
}
