import type { CompanyNoteRichTextAnswerValue } from '../company/companyNotes';
import type {
  PortalAccessAction,
  PortalCompanyFeatureOverrideUpsertRequest,
  PortalFeatureSetAuditAction,
  PortalFeatureSetAuditContinuation,
  PortalFeatureSetAuditEvent,
  PortalRestrictionSource,
} from './access';

/** Identity only. The API must validate owner ancestry at assignment and read time. */
export interface PortalPromotionTemplateRef {
  ownerCompanyId: string;
  templateId: string;
}

/** API validation applies the restricted promotion schema; JSON alone is not trusted content. */
export type PortalPromotionTemplateBody = Pick<CompanyNoteRichTextAnswerValue, 'format' | 'doc'>;

export interface PortalPromotionContactAction {
  label: string;
  href: string;
}

export type PortalPromotionTemplateStatus = 'active' | 'archived';

export interface PortalPromotionTemplateContent {
  name: string;
  title: string;
  body: PortalPromotionTemplateBody;
  contactAction?: PortalPromotionContactAction;
}

/** Server-owned persisted content; the Blob ETag is returned separately as a revision. */
export interface PortalPromotionTemplateDocument extends PortalPromotionTemplateContent {
  schemaVersion: 1;
  ownerCompanyId: string;
  templateId: string;
  status: PortalPromotionTemplateStatus;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

export interface PortalPromotionTemplateResponse extends PortalPromotionTemplateDocument {
  /** Opaque conditional-write token, not a message-cache identity. */
  revision: string;
}

export interface PortalPromotionTemplateDetailResponse extends PortalPromotionTemplateResponse {
  /** References at the route company only; excludes inherited and descendant usage. */
  localUsageCount: number;
}

export type PortalPromotionTemplateSummary = Pick<
  PortalPromotionTemplateResponse,
  'ownerCompanyId' | 'templateId' | 'name' | 'title' | 'status' | 'revision' | 'updatedAt' | 'updatedBy'
>;

/** Complete own/ancestor catalog within the API's per-owner cap; no pagination. */
export interface PortalPromotionTemplateListResponse {
  companyId: string;
  templates: PortalPromotionTemplateSummary[];
}

export type PortalPromotionTemplateCreateRequest = PortalPromotionTemplateContent;

/** Full replacement, including archive/restore; omitted contactAction clears the contact button. */
export interface PortalPromotionTemplateUpdateRequest extends PortalPromotionTemplateContent {
  status: PortalPromotionTemplateStatus;
  expectedRevision: string;
}

/** New authoring clients use this matrix; the older broad transport DTO remains compatible. */
export type PortalCompanyFeatureOverrideWriteRequest = Pick<PortalCompanyFeatureOverrideUpsertRequest, 'appliesTo' | 'reason'> &
  (
    | { decision: 'allow'; presentationMode?: never; promotionTemplateRef?: never }
    | { decision: 'deny' | 'restrict'; presentationMode?: 'hidden' | 'teaser'; promotionTemplateRef?: never }
    | { decision: 'deny' | 'restrict'; presentationMode: 'promo'; promotionTemplateRef?: PortalPromotionTemplateRef }
  );

/** Internal evaluator metadata. Project only promotionAvailable into ordinary bootstrap. */
export interface PortalFeaturePresentationSource {
  featureSetKey: string;
  sourceCompanyId?: string;
  restrictionSource?: PortalRestrictionSource;
  promotionTemplateRef?: PortalPromotionTemplateRef;
}

/** Company and feature are route parameters; callers cannot select an owner or template. */
export interface PortalFeaturePromotionQuery {
  action?: PortalAccessAction;
}

/** Customer-facing content only. No storage identity, audit metadata or cache revision. */
export interface PortalFeaturePromotionResponse {
  companyId: string;
  featureKey: string;
  action: PortalAccessAction;
  title: string;
  body: PortalPromotionTemplateBody;
  contactAction?: PortalPromotionContactAction;
}

export type PortalPromotionTemplateAuditAction = 'template_created' | 'template_updated' | 'template_archived' | 'template_restored';

/** Audit snapshots intentionally exclude template bodies and contact details. */
export interface PortalPromotionTemplateAuditSnapshot {
  revision: string;
  status: PortalPromotionTemplateStatus;
}

type TemplateAuditIdentity = Pick<
  PortalFeatureSetAuditEvent,
  'eventId' | 'companyId' | 'actorId' | 'actorDisplayName' | 'actorEmail' | 'occurredAt'
> & {
  targetType: 'promotion_template';
  templateId: string;
  featureSetKey?: never;
};

type TemplateUpdatedAuditEvent = {
  [Status in PortalPromotionTemplateStatus]: {
    action: 'template_updated';
    before: PortalPromotionTemplateAuditSnapshot & { status: Status };
    after: PortalPromotionTemplateAuditSnapshot & { status: Status };
  };
}[PortalPromotionTemplateStatus];

export type PortalPromotionTemplateAuditEvent = TemplateAuditIdentity &
  (
    | { action: 'template_created'; before?: never; after: PortalPromotionTemplateAuditSnapshot & { status: 'active' } }
    | TemplateUpdatedAuditEvent
    | {
        action: 'template_archived';
        before: PortalPromotionTemplateAuditSnapshot & { status: 'active' };
        after: PortalPromotionTemplateAuditSnapshot & { status: 'archived' };
      }
    | {
        action: 'template_restored';
        before: PortalPromotionTemplateAuditSnapshot & { status: 'archived' };
        after: PortalPromotionTemplateAuditSnapshot & { status: 'active' };
      }
  );

export type PortalFeatureAuditAction = PortalFeatureSetAuditAction | PortalPromotionTemplateAuditAction;

/** New mixed-stream readers narrow targetType; absent targetType is a legacy feature-set event. */
export type PortalFeatureAuditEvent = PortalFeatureSetAuditEvent | PortalPromotionTemplateAuditEvent;

/** Mixed projection of the existing audit stream; legacy feature-set pages remain source compatible. */
export interface PortalFeatureAuditPage {
  events: PortalFeatureAuditEvent[];
  continuation?: PortalFeatureSetAuditContinuation;
}
