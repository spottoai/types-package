import { Tags } from '../tags';
import { ServiceRetirementRecommendation } from './recommendations';
import type { BenefitCoverageSummary } from './views.js';

export interface ServiceRetirement {
  id: string;
  subscriptionId: string;
  resourceId: string;
  resourceName: string;
  resourceType: string;
  resourceGroup: string;
  location: string;
  retiringFeature: string;
  retirementDate: string;
  effort?: 'high' | 'medium' | 'low';
  effortHours?: number;
  tags?: Record<string, string>;
  spottoTags?: Tags;
}

export interface ServiceRetirementPortalResource {
  id: string;
  name?: string;
  resourceType?: string;
  benefitsCoverage?: BenefitCoverageSummary;
}

export type KeyVaultObjectType = 'secret' | 'key' | 'certificate';

export type ServiceRetirementKnownRenderKind =
  | 'hdd-os-disk'
  | 'benefit-expiry'
  | 'application-credential'
  | 'key-vault-object'
  | 'aws-certificate';

export interface HddOsDiskRetirementRenderData {
  kind: 'hdd-os-disk';
  recommendationId: string;
}

export interface BenefitExpiryRetirementRenderData {
  kind: 'benefit-expiry';
  benefitId: string;
  benefitType: 'reservation' | 'savings-plan';
  subscriptionId?: string;
}

export interface ApplicationCredentialRetirementRenderData {
  kind: 'application-credential';
  applicationId?: string;
  applicationObjectId?: string;
  credentialId?: string;
  credentialName?: string;
  credentialType: 'secret' | 'certificate';
}

export interface KeyVaultObjectRetirementRenderData {
  kind: 'key-vault-object';
  vaultResourceId: string;
  vaultName: string;
  objectName: string;
  objectType: KeyVaultObjectType;
  enabled: boolean;
}

/**
 * An AWS certificate expiry: an ACM certificate or an IAM server certificate. Neither is an Entra application
 * credential nor a Key Vault object, so it has its own render kind.
 */
export interface AwsCertificateRetirementRenderData {
  kind: 'aws-certificate';
  manager: 'acm' | 'iam';
  certificateArn: string;
  domainName?: string;
  /** ACM certificate type, e.g. `AMAZON_ISSUED`, `IMPORTED` or `PRIVATE`. */
  certificateType?: string;
  /** ACM renewal eligibility, e.g. `ELIGIBLE` or `INELIGIBLE`. */
  renewalEligibility?: string;
  /** ACM managed-renewal status, e.g. `PENDING_AUTO_RENEWAL`, `PENDING_VALIDATION`, `SUCCESS` or `FAILED`. */
  renewalStatus?: string;
  keyAlgorithm?: string;
  /** ARNs of the resources that use the certificate. */
  inUseBy?: string[];
}

export type ServiceRetirementKnownRenderData =
  | HddOsDiskRetirementRenderData
  | BenefitExpiryRetirementRenderData
  | ApplicationCredentialRetirementRenderData
  | KeyVaultObjectRetirementRenderData
  | AwsCertificateRetirementRenderData;

/**
 * Forward-compatible shape for retirement render strategies introduced by
 * newer producers. Consumers should use their generic retirement view when a
 * kind is not registered locally.
 */
export interface ServiceRetirementUnknownRenderData {
  kind: string;
  [key: string]: unknown;
}

export type ServiceRetirementRenderData = ServiceRetirementKnownRenderData | ServiceRetirementUnknownRenderData;

export interface ServiceRetirementPortalEntry extends ServiceRetirementRecommendation {
  resources: ServiceRetirementPortalResource[];
  renderData?: ServiceRetirementRenderData;
}

export type KeyVaultObjectCollectionStatus =
  | 'current'
  | 'permission-denied'
  | 'network-blocked'
  | 'throttled'
  | 'unavailable';

export interface KeyVaultObjectFamilyCoverage {
  objectType: KeyVaultObjectType;
  status: KeyVaultObjectCollectionStatus;
  itemCount: number;
  reasonCode?: string;
}

export interface KeyVaultRetirementVaultCoverage {
  vaultResourceId: string;
  vaultName: string;
  authorizationModel: 'rbac' | 'access-policy' | 'unknown';
  families: KeyVaultObjectFamilyCoverage[];
}

export interface KeyVaultRetirementCoverageArtifact {
  schemaVersion: 1;
  generatedAt: string;
  subscriptionId: string;
  status: 'current' | 'partial' | 'unavailable';
  vaultCount: number;
  currentVaultCount: number;
  vaults: KeyVaultRetirementVaultCoverage[];
}
