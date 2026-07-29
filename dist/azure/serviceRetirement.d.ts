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
export type ServiceRetirementKnownRenderKind = 'hdd-os-disk' | 'benefit-expiry' | 'application-credential';
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
export type ServiceRetirementKnownRenderData = HddOsDiskRetirementRenderData | BenefitExpiryRetirementRenderData | ApplicationCredentialRetirementRenderData;
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
//# sourceMappingURL=serviceRetirement.d.ts.map