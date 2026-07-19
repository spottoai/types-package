import {
  BaseAlertDefinition,
  BaseAlertDestinations,
  BaseAlertInstance,
  BaseAlertScope,
  CreateAlertDefinitionInput,
  UpdateAlertDefinitionInput,
} from './baseAlert.js';
import type { CostAlertDefinition, CostAlertInstance } from './cost.js';

export const QUICK_ALERT_TYPES = ['credentialExpiry', 'benefitExpiry', 'serviceRetirement', 'backupFailure'] as const;

export type QuickAlertType = (typeof QUICK_ALERT_TYPES)[number];
export type QuickAlertCategory = 'other';

export type QuickAlertTemplateId = 'credential-expiry-30d' | 'benefit-expiry-30d' | 'benefit-expiry-7d' | 'service-retirement-30d' | 'backup-failure';

export type QuickAlertSource = 'serviceRetirement' | 'commitmentsPlanning' | 'dataProtection';

export type QuickAlertBenefitType = 'reservation' | 'savingsPlan';

interface QuickAlertCriteriaBase<TKind extends QuickAlertType, TSource extends QuickAlertSource, TTemplateId extends QuickAlertTemplateId> {
  kind: TKind;
  source: TSource;
  templateId?: TTemplateId;
}

export interface CredentialExpiryAlertCriteria extends QuickAlertCriteriaBase<'credentialExpiry', 'serviceRetirement', 'credential-expiry-30d'> {
  lookaheadDays: number;
}

export interface BenefitExpiryAlertCriteria
  extends QuickAlertCriteriaBase<'benefitExpiry', 'commitmentsPlanning', 'benefit-expiry-30d' | 'benefit-expiry-7d'> {
  lookaheadDays: number;
  benefitTypes?: QuickAlertBenefitType[];
}

export interface ServiceRetirementAlertCriteria extends QuickAlertCriteriaBase<'serviceRetirement', 'serviceRetirement', 'service-retirement-30d'> {
  lookaheadDays: number;
}

export interface BackupFailureAlertCriteria extends QuickAlertCriteriaBase<'backupFailure', 'dataProtection', 'backup-failure'> {
  minimumConsecutiveFailures: number;
  workloadTypes?: string[];
}

export type QuickAlertCriteria =
  | CredentialExpiryAlertCriteria
  | BenefitExpiryAlertCriteria
  | ServiceRetirementAlertCriteria
  | BackupFailureAlertCriteria;

export type QuickAlertCriteriaFor<TType extends QuickAlertType> = Extract<QuickAlertCriteria, { kind: TType }>;

export interface QuickAlertSummary {
  summaryText?: string;
  matchedItemCount?: number;
  source?: QuickAlertSource;
  templateId?: QuickAlertTemplateId;
  objectId?: string;
  objectName?: string;
  subscriptionId?: string;
  expiresAt?: string;
  workloadType?: string;
}

export type QuickAlertDefinitionFor<TType extends QuickAlertType> = BaseAlertDefinition<
  QuickAlertCriteriaFor<TType>,
  BaseAlertDestinations,
  BaseAlertScope,
  TType
> & {
  category: QuickAlertCategory;
  type: TType;
};

export type QuickAlertDefinition = {
  [TType in QuickAlertType]: QuickAlertDefinitionFor<TType>;
}[QuickAlertType];

type EditableQuickAlertCriteria<TType extends QuickAlertType> = Omit<QuickAlertCriteriaFor<TType>, 'kind' | 'source' | 'templateId'>;

export type QuickAlertDefinitionUpdateInput = {
  [TType in QuickAlertType]: UpdateAlertDefinitionInput<QuickAlertDefinitionFor<TType>, EditableQuickAlertCriteria<TType>>;
}[QuickAlertType];

export type QuickAlertInstanceFor<TType extends QuickAlertType> = BaseAlertInstance<QuickAlertSummary, BaseAlertScope, TType> & {
  category: QuickAlertCategory;
  type: TType;
};

export type QuickAlertInstance = {
  [TType in QuickAlertType]: QuickAlertInstanceFor<TType>;
}[QuickAlertType];

export type AlertDefinitionRecord = CostAlertDefinition | QuickAlertDefinition;
export type AlertInstanceRecord = CostAlertInstance | QuickAlertInstance;
export type AlertDefinitionCreateInput = CreateAlertDefinitionInput<AlertDefinitionRecord>;
export type AlertDefinitionUpdateInput = UpdateAlertDefinitionInput<CostAlertDefinition> | QuickAlertDefinitionUpdateInput;

export const isQuickAlertType = (value: string): value is QuickAlertType => QUICK_ALERT_TYPES.includes(value as QuickAlertType);
