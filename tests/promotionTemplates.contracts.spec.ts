import type {
  CompanyNoteRichTextAnswerValue,
  CompanyNoteTipTapContent,
  PortalCompanyFeatureOverride,
  PortalCompanyFeatureOverrideUpsertRequest,
  PortalCompanyFeatureOverrideWriteRequest,
  PortalEffectiveAccessResponse,
  PortalFeatureAccessSummary,
  PortalFeatureAuditAction,
  PortalFeatureAuditEvent,
  PortalFeatureAuditPage,
  PortalFeatureSetAccessSummary,
  PortalFeatureSetAuditEvent,
  PortalFeatureSetAuditPage,
  PortalFeatureSetConfigurationSummary,
  PortalFeaturePromotionQuery,
  PortalFeaturePromotionResponse,
  PortalPromotionTemplateAuditEvent,
  PortalPromotionTemplateBody,
  PortalPromotionTemplateCreateRequest,
  PortalPromotionTemplateDetailResponse,
  PortalPromotionTemplateDocument,
  PortalPromotionTemplateListResponse,
  PortalPromotionTemplateRef,
  PortalPromotionTemplateResponse,
  PortalPromotionTemplateUpdateRequest,
  PortalRestrictionSource,
} from '../src';

type Assert<T extends true> = T;
type Exact<T, U> = [T] extends [U] ? ([U] extends [T] ? true : false) : false;

type RestrictionSources = Assert<Exact<PortalRestrictionSource, 'catalog' | 'override'>>;
type AuditActions = Assert<
  Exact<
    PortalFeatureAuditAction,
    | 'override_created'
    | 'override_updated'
    | 'override_deleted'
    | 'locked'
    | 'unlocked'
    | 'template_created'
    | 'template_updated'
    | 'template_archived'
    | 'template_restored'
  >
>;
type BodyMatchesAnswer = Assert<Exact<PortalPromotionTemplateBody, Pick<CompanyNoteRichTextAnswerValue, 'format' | 'doc'>>>;
type OrdinaryNotesStillUseDocument = Assert<Exact<CompanyNoteTipTapContent['document'], PortalPromotionTemplateBody['doc']>>;
type PublicMessageHasOnlyDisplayFields = Assert<
  Exact<keyof PortalFeaturePromotionResponse, 'companyId' | 'featureKey' | 'action' | 'title' | 'body' | 'contactAction'>
>;

const body: PortalPromotionTemplateBody = {
  format: 'tiptap-json',
  doc: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Services included in Silver.' }] }] },
};
const ref: PortalPromotionTemplateRef = { ownerCompanyId: 'msp', templateId: 'template-1' };
const create: PortalPromotionTemplateCreateRequest = { name: 'Silver benefits', title: 'Get more with Silver', body };
const update: PortalPromotionTemplateUpdateRequest = { ...create, status: 'archived', expectedRevision: 'etag-1' };
const document: PortalPromotionTemplateDocument = {
  ...create,
  schemaVersion: 1,
  ownerCompanyId: 'msp',
  templateId: 'template-1',
  status: 'active',
  createdAt: '2026-10-29T00:00:00Z',
  createdBy: 'author-1',
  updatedAt: '2026-10-29T00:00:00Z',
  updatedBy: 'author-1',
};
const response: PortalPromotionTemplateResponse = { ...document, revision: 'etag-1' };
const detail: PortalPromotionTemplateDetailResponse = { ...response, localUsageCount: 2 };
const list: PortalPromotionTemplateListResponse = { companyId: 'bronze', templates: [response] };
const message: PortalFeaturePromotionResponse = { companyId: 'customer', featureKey: 'ai_chat', action: 'use', title: create.title, body };
const query: PortalFeaturePromotionQuery = { action: 'view' };
const allow: PortalCompanyFeatureOverrideWriteRequest = { decision: 'allow' };
const deny: PortalCompanyFeatureOverrideWriteRequest = { decision: 'deny', presentationMode: 'hidden' };
const promo: PortalCompanyFeatureOverrideWriteRequest = { decision: 'restrict', presentationMode: 'promo', promotionTemplateRef: ref };
const legacyRequest: PortalCompanyFeatureOverrideUpsertRequest = { decision: 'allow', presentationMode: 'normal' };
const rollingRequest: PortalCompanyFeatureOverrideUpsertRequest = promo;
const override: PortalCompanyFeatureOverride = {
  ...promo,
  companyId: 'bronze',
  featureSetKey: 'ai_assistant',
  createdBy: 'author-1',
  createdAt: '',
  updatedAt: '',
};
const feature: PortalFeatureAccessSummary = {
  featureKey: 'ai_chat',
  entitlementState: 'blocked_by_parent',
  visibilityState: 'promo',
  actions: {},
  promotionAvailable: true,
  restrictionSource: 'override',
};
const featureSet: PortalFeatureSetAccessSummary = {
  featureSetKey: 'ai_assistant',
  entitlementState: 'blocked_by_parent',
  visibilityState: 'promo',
  reasonCode: 'blocked_by_parent',
  presentationMode: 'promo',
  sourceCompanyId: 'bronze',
  restrictionSource: 'override',
  sources: [],
};
const configuration: PortalFeatureSetConfigurationSummary = { ...featureSet, appliesTo: 'local_company_users', promotionTemplateRef: ref };
const effective: PortalEffectiveAccessResponse = {
  customerId: 'customer',
  principalType: 'user',
  principalId: 'user-1',
  featureKey: 'ai_chat',
  requestedAction: 'use',
  entitlementState: 'blocked_by_parent',
  visibilityState: 'promo',
  actionabilityState: 'locked',
  reasonCode: 'blocked_by_parent',
  sources: [],
  restrictionSource: 'override',
  promotionAvailable: true,
};

const legacyAudit: PortalFeatureSetAuditEvent = {
  eventId: 'event-1',
  companyId: 'bronze',
  featureSetKey: 'ai_assistant',
  action: 'override_updated',
  actorId: 'author-1',
  occurredAt: '',
  after: { decision: 'restrict', presentationMode: 'promo', promotionTemplateRef: ref },
};
const archive: PortalPromotionTemplateAuditEvent = {
  eventId: 'event-2',
  companyId: 'msp',
  targetType: 'promotion_template',
  templateId: 'template-1',
  action: 'template_archived',
  actorId: 'author-1',
  occurredAt: '',
  before: { revision: 'etag-1', status: 'active' },
  after: { revision: 'etag-2', status: 'archived' },
};
const mixed: PortalFeatureAuditPage = { events: [legacyAudit, archive] };
const legacyPage: PortalFeatureSetAuditPage = { events: [legacyAudit] };
const legacyPageAsMixed: PortalFeatureAuditPage = legacyPage;

function auditTarget(event: PortalFeatureAuditEvent): string {
  if (event.targetType === 'promotion_template') return event.templateId;
  return event.featureSetKey;
}

// @ts-expect-error Allow cannot carry authored presentation, even Hidden.
const invalidAllow: PortalCompanyFeatureOverrideWriteRequest = { decision: 'allow', presentationMode: 'hidden' };
// @ts-expect-error Denied Normal cannot be authored.
const invalidNormal: PortalCompanyFeatureOverrideWriteRequest = { decision: 'deny', presentationMode: 'normal' };
// @ts-expect-error A template reference requires explicit Promo presentation.
const invalidTeaser: PortalCompanyFeatureOverrideWriteRequest = { decision: 'restrict', presentationMode: 'teaser', promotionTemplateRef: ref };
// @ts-expect-error A reference cannot be attached to an omitted presentation.
const invalidUnpresented: PortalCompanyFeatureOverrideWriteRequest = { decision: 'deny', promotionTemplateRef: ref };
// @ts-expect-error Template contact details must include both label and href.
const partialContact: PortalPromotionTemplateCreateRequest = { ...create, contactAction: { label: 'Contact us' } };
// @ts-expect-error Updates require a concurrency token.
const unconditionalUpdate: PortalPromotionTemplateUpdateRequest = { ...create, status: 'active' };
// @ts-expect-error The public message must not expose owner identity.
const leakedOwner: PortalFeaturePromotionResponse = { ...message, ownerCompanyId: 'msp' };
// @ts-expect-error Resolved messages have no cache revision.
const cachedMessage: PortalFeaturePromotionResponse = { ...message, revision: 'etag-1' };
// @ts-expect-error Resolved-message queries cannot select a template owner.
const ownerQuery: PortalFeaturePromotionQuery = { ownerCompanyId: 'msp' };
// @ts-expect-error Template events cannot masquerade as feature-set events.
const falseTarget: PortalPromotionTemplateAuditEvent = { ...archive, featureSetKey: 'ai_assistant' };
// @ts-expect-error Template events require their own template identity.
const missingTarget: PortalPromotionTemplateAuditEvent = { ...legacyAudit, targetType: 'promotion_template', action: 'template_updated' };
// @ts-expect-error An archive event must end in the archived status.
const wrongArchiveStatus: PortalPromotionTemplateAuditEvent = { ...archive, after: { revision: 'etag-2', status: 'active' } };
// @ts-expect-error A status transition must use the archived/restored lifecycle action.
const statusChangingUpdate: PortalPromotionTemplateAuditEvent = { ...archive, action: 'template_updated' };
// @ts-expect-error Template authors cannot set server-owned identity in create requests.
const ownerCreate: PortalPromotionTemplateCreateRequest = { ...create, ownerCompanyId: 'msp' };

void [
  update,
  detail,
  list,
  query,
  allow,
  deny,
  rollingRequest,
  legacyRequest,
  override,
  feature,
  configuration,
  effective,
  mixed,
  legacyPageAsMixed,
  auditTarget,
  invalidAllow,
  invalidNormal,
  invalidTeaser,
  invalidUnpresented,
  partialContact,
  unconditionalUpdate,
  leakedOwner,
  cachedMessage,
  ownerQuery,
  falseTarget,
  missingTarget,
  wrongArchiveStatus,
  statusChangingUpdate,
  ownerCreate,
];
export type { RestrictionSources, AuditActions, BodyMatchesAnswer, OrdinaryNotesStillUseDocument, PublicMessageHasOnlyDisplayFields };
