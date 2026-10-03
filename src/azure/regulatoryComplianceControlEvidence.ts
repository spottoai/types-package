import type {
  AzurePolicyEvaluationState,
  RegulatoryControlDetail,
  RegulatoryControlMetadataResponse,
  RegulatoryControlSummary,
} from './regulatoryCompliance';
import type { CompanyRegulatoryStandardDetailControl, RegulatoryControlOutcome } from './regulatoryComplianceScoreboard';

export const REGULATORY_CONTROL_RESOURCE_PAGE_SIZE = 25;

export interface RegulatoryControlEvidenceReference {
  subscriptionId: string;
  assignmentKey: string;
  policyControlKey: string;
  policyAssignmentId: string;
}

export interface RegulatoryControlEvidenceTarget extends RegulatoryControlEvidenceReference {
  control: RegulatoryControlSummary;
  policies: { policyDefinitionReferenceId: string; displayName: string }[];
}

export interface RegulatoryControlEvidenceCheck {
  policyDefinitionId: string;
  displayName: string;
  outcome: RegulatoryControlOutcome;
  subscriptionIds: string[];
  references: (RegulatoryControlEvidenceReference & { policyDefinitionReferenceId: string })[];
  /** Distinct observed failing Policy resources. Never a Defender assessment count. */
  failingResourceCount: number;
  failingResourceCountIsMinimum?: true;
  resourceTypes: string[];
}

export interface RegulatoryControlEvidenceResource {
  resourceId: string;
  displayName: string;
  resourceType?: string;
  resourceGroupName?: string;
  /** Check names are supporting evidence, not invented failure explanations. */
  failingChecks: { policyDefinitionId: string; displayName: string; policyDefinitionReferenceId: string; assignmentKey: string }[];
}

export interface RegulatoryControlEvidenceResourcePage {
  subscriptionId: string;
  state: 'complete' | 'partial' | 'unavailable' | 'notLinked';
  observedAt?: string;
  page: number;
  pageSize: number;
  /** Distinct failing resources materialized in the Policy artifact. */
  totalItems?: number;
  totalItemsIsMinimum?: true;
  totalPages?: number;
  resources: RegulatoryControlEvidenceResource[];
}

/** One bounded projection; resourcePage only changes the selected resource group's page. */
export interface CompanyRegulatoryControlEvidence {
  companyId: string;
  standardKey: string;
  standardDisplayName: string;
  generatedAt: string;
  control: CompanyRegulatoryStandardDetailControl;
  metadataState: 'available' | 'unavailable' | 'notLinked';
  metadata?: RegulatoryControlMetadataResponse;
  checks: RegulatoryControlEvidenceCheck[];
  /** Undefined when one or more linked evidence sources are unavailable. */
  otherCheckCount?: number;
  assignmentTargets: RegulatoryControlEvidenceTarget[];
  resourcePages: RegulatoryControlEvidenceResourcePage[];
}

/** Authorized, identity-validated artifact inputs; deliberately not a browser transport. */
export interface RegulatoryControlEvidenceInput extends RegulatoryControlEvidenceReference {
  observedAt: string;
  state: 'complete' | 'partial';
  control: RegulatoryControlDetail;
}

export function regulatoryPolicyEvidenceOutcome(state: AzurePolicyEvaluationState): RegulatoryControlOutcome {
  if (state === 'nonCompliant') return 'failed';
  if (state === 'compliant' || state === 'protected') return 'passed';
  return 'notAssessed';
}
