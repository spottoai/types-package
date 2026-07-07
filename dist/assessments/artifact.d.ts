import type { AssessmentScope, AssessmentTraceabilityReference } from './common';
import type { AssessmentContextPack, AssessmentEvidence, AssessmentEvidenceGap, AssessmentSourceCoverage } from './evidence';
import type { AssessmentEffortBand, AssessmentImpactLevel, AssessmentPillar, AssessmentPriority, AssessmentProviderName, AssessmentType } from './status';
export interface AssessmentCurrentState {
    summary: string;
    scopeSummary: string;
    topologySummary?: string;
    operationalSummary?: string;
    constraintSummary?: string;
}
export interface AssessmentNarrative {
    executiveSummary: string;
    scopeAndCoverage: string;
    currentState: string;
    targetStateThemes?: string;
    openQuestions?: string[];
}
export interface AssessmentFinding extends AssessmentTraceabilityReference {
    findingId: string;
    pillar: AssessmentPillar;
    title: string;
    summary: string;
    rationale: string;
    priority: AssessmentPriority;
    affectedResourceIds?: string[];
}
export interface AssessmentRecommendation extends AssessmentTraceabilityReference {
    recommendationId: string;
    pillar: AssessmentPillar;
    title: string;
    summary: string;
    priority: AssessmentPriority;
    effort: AssessmentEffortBand;
    impact: AssessmentImpactLevel;
    status?: 'new' | 'existing' | 'accepted' | 'deferred';
}
export interface AssessmentActionItem extends AssessmentTraceabilityReference {
    actionItemId: string;
    title: string;
    description: string;
    priority: AssessmentPriority;
    effort: AssessmentEffortBand;
    effortHours?: number;
    benefit: string;
    dependencies?: string[];
    assumptions?: string[];
    suggestedDeliveryPackage?: string;
    sequence?: number;
}
export interface ArchitectureAssessmentGenerationMetadata {
    generatedAt: string;
    generatedBy: 'cloud-engine';
    correlationId: string;
    sourceVersion?: string;
    narrativeOwner: 'cloud-engine' | 'none';
    narrativeModel?: string;
    promptVersion?: string;
}
export interface ArchitectureAssessmentArtifact {
    schemaVersion: 1;
    assessmentRunId: string;
    companyId: string;
    assessmentType: Extract<AssessmentType, 'architecture'>;
    providerName: AssessmentProviderName;
    scope: AssessmentScope;
    contextPack: AssessmentContextPack;
    sourceCoverage: AssessmentSourceCoverage[];
    evidence: AssessmentEvidence[];
    currentState: AssessmentCurrentState;
    findings: AssessmentFinding[];
    recommendations: AssessmentRecommendation[];
    actionItems: AssessmentActionItem[];
    narrative: AssessmentNarrative;
    gaps: AssessmentEvidenceGap[];
    generation: ArchitectureAssessmentGenerationMetadata;
}
export interface ArchitectureAssessmentEffectiveContent {
    artifact: ArchitectureAssessmentArtifact;
    narrative: AssessmentNarrative;
    findings: AssessmentFinding[];
    recommendations: AssessmentRecommendation[];
    actionItems: AssessmentActionItem[];
}
//# sourceMappingURL=artifact.d.ts.map