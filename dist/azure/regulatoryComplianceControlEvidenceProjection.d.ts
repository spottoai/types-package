import type { RegulatoryStandardCatalogEntry } from './regulatoryCompliance';
import type { CompanyRegulatoryStandardDetailControl } from './regulatoryComplianceScoreboard';
import { type CompanyRegulatoryControlEvidence, type RegulatoryControlEvidenceInput } from './regulatoryComplianceControlEvidence';
export declare function resolveRegulatoryStandardDisplayName(family: string, catalog: readonly RegulatoryStandardCatalogEntry[], assigned?: readonly {
    standardFamilyKey: string;
    displayName: string;
}[], preferredDefinitionId?: string): string;
export declare function projectRegulatoryControlEvidence({ control, inputs, unavailableSubscriptionIds, resourceSubscriptionId, resourcePage, }: {
    control: CompanyRegulatoryStandardDetailControl;
    inputs: readonly RegulatoryControlEvidenceInput[];
    unavailableSubscriptionIds?: readonly string[];
    resourceSubscriptionId?: string;
    resourcePage?: number;
}): Pick<CompanyRegulatoryControlEvidence, 'checks' | 'otherCheckCount' | 'assignmentTargets' | 'resourcePages'>;
//# sourceMappingURL=regulatoryComplianceControlEvidenceProjection.d.ts.map