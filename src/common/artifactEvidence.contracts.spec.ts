import {
  compareArtifactRevisionVector,
  isArtifactOwnershipBinding,
  isArtifactPublicationDecision,
  isEnforceableArtifactOwnershipBinding,
  type ArtifactApplicabilityVerdict,
  type ArtifactAttemptOutcome,
  type ArtifactClaimDependencyDecision,
  type ArtifactCoverageVerdict,
  type ArtifactDependencyDescriptor,
  type ArtifactEmptyEvidenceVerdict,
  type ArtifactEvidenceVerdict,
  type ArtifactFreshnessVerdict,
  type ArtifactOwnershipBinding,
  type ArtifactProcessingLifecycle,
  type ArtifactPublicationDecision,
  type ArtifactPublicationVerdict,
  type ArtifactRevisionComparison,
  type ArtifactRevisionVector,
  type ArtifactSupportVerdict,
  type BillingArtifactReadState,
} from './artifactEvidence.js';
import type { ArtifactDescriptor, ArtifactProvider } from './artifactGeneration.js';

const provider: ArtifactProvider = 'azure';

const manifestDescriptor = {
  name: 'billing-input-manifest',
  mediaType: 'application/json',
  contentEncoding: 'identity',
  byteLength: 2048,
  sha256: 'b'.repeat(64),
} satisfies ArtifactDescriptor;

const ownership = {
  provider: 'azure',
  tenantId: 'tenant-1',
  companyId: 'company-1',
  cloudAccountId: 'cloud-account-1',
  accountId: 'sub-123',
  ownershipEpochRevision: 3,
} satisfies ArtifactOwnershipBinding;

const revision = {
  ownershipEpochRevision: 3,
  sourceRevision: 42,
  policyRevision: 7,
} satisfies ArtifactRevisionVector;

const dependency = {
  name: 'billing-history',
  required: true,
  support: 'supported',
  applicability: 'applicable',
  attempt: 'succeeded',
  coverage: 'complete',
  emptyEvidence: 'populated',
  freshness: 'current',
  evidence: 'complete',
  publication: 'completed',
  generationId: 'billing-source-generation-42',
  digest: 'a'.repeat(64),
  sourceRevision: 42,
  policyRevision: 7,
} satisfies ArtifactDependencyDescriptor;

const claim = {
  claimId: 'cost-analysis',
  sectionPaths: ['chartData', 'anomalies'],
  requiredDependencies: ['billing-history'],
  evidence: 'complete',
  publication: 'completed',
  issues: [],
} satisfies ArtifactClaimDependencyDecision;

const publicationDecision = {
  processing: 'succeeded',
  evidence: 'complete',
  publication: 'completed',
  dependencies: [dependency],
  claims: [claim],
  issues: [],
} satisfies ArtifactPublicationDecision;

const readStates: BillingArtifactReadState[] = ['current', 'stale', 'partial', 'fallback', 'suppressed', 'unavailable', 'complete-empty'];

const stateVocabulary: [
  ArtifactSupportVerdict,
  ArtifactApplicabilityVerdict,
  ArtifactAttemptOutcome,
  ArtifactCoverageVerdict,
  ArtifactEmptyEvidenceVerdict,
  ArtifactFreshnessVerdict,
  ArtifactEvidenceVerdict,
  ArtifactProcessingLifecycle,
  ArtifactPublicationVerdict,
] = ['supported', 'applicable', 'succeeded', 'complete', 'populated', 'current', 'complete', 'succeeded', 'completed'];

const comparison: ArtifactRevisionComparison = compareArtifactRevisionVector(revision, {
  ownershipEpochRevision: 3,
  sourceRevision: 41,
  policyRevision: 7,
});

void isArtifactOwnershipBinding(ownership);
void isEnforceableArtifactOwnershipBinding(ownership);
void isArtifactPublicationDecision(publicationDecision);

// @ts-expect-error A completed publication cannot report failed processing.
const failedCompletedPublication: ArtifactPublicationDecision = {
  ...publicationDecision,
  processing: 'failed',
};

// @ts-expect-error Complete-empty evidence requires a successful attempt, complete coverage, zero accepted rows, and an empty-proof reference.
const unprovenCompleteEmpty: ArtifactDependencyDescriptor = {
  ...dependency,
  emptyEvidence: 'complete-empty',
};

// @ts-expect-error A completed claim cannot carry insufficient evidence.
const insufficientCompletedClaim: ArtifactClaimDependencyDecision = {
  ...claim,
  evidence: 'insufficient',
};

// @ts-expect-error The public billing read-state vocabulary is closed.
const unknownReadState: BillingArtifactReadState = 'unknown';

void [
  ownership,
  provider,
  manifestDescriptor,
  revision,
  dependency,
  claim,
  publicationDecision,
  readStates,
  stateVocabulary,
  comparison,
  failedCompletedPublication,
  unprovenCompleteEmpty,
  insufficientCompletedClaim,
  unknownReadState,
];
