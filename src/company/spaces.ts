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
