import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const awsFixturePath = join(packageRoot, 'tests', 'fixtures', 'aws-public-root.consumer.ts.fixture');
const resourceOptimizationFixturePath = join(packageRoot, 'tests', 'fixtures', 'resource-optimization.consumer.ts.fixture');
const recommendationTracksFixturePath = join(packageRoot, 'tests', 'fixtures', 'recommendation-tracks.consumer.ts.fixture');
const recommendationWorkflowApiFixturePath = join(packageRoot, 'tests', 'fixtures', 'recommendation-workflow-api.consumer.ts.fixture');
const recommendationWorkflowUiFixturePath = join(packageRoot, 'tests', 'fixtures', 'recommendation-workflow-ui.consumer.ts.fixture');
const azureSpSetupApiFixturePath = join(packageRoot, 'tests', 'fixtures', 'azure-sp-setup-api.consumer.ts.fixture');
const azureSpSetupCloudEngineFixturePath = join(packageRoot, 'tests', 'fixtures', 'azure-sp-setup-cloud-engine.consumer.ts.fixture');
const azureSpSetupUiFixturePath = join(packageRoot, 'tests', 'fixtures', 'azure-sp-setup-ui.consumer.ts.fixture');
const commitmentsPlanningFixturePath = join(packageRoot, 'tests', 'fixtures', 'commitments-planning.consumer.ts.fixture');
const artifactEvidenceCorpusPath = join(packageRoot, 'fixtures', 'artifact-evidence-contract-corpus.json');
const artifactEvidenceCorpus = JSON.parse(await readFile(artifactEvidenceCorpusPath, 'utf8'));
const legacyBillingMetadataLiteral = JSON.stringify(artifactEvidenceCorpus.fixtures.legacyBillingCostAnalysisMetadataV1, null, 2);
const digestRepairRuntimeDocuments =
  '{"outputManifest":{"schemaVersion":2,"status":"completed","subscriptionId":"sub-123","generationId":"billing-input-generation-42","ownership":{"provider":"azure","tenantId":"tenant-1","companyId":"company-1","cloudAccountId":"cloud-account-1","accountId":"sub-123","ownershipEpochRevision":3},"revision":{"ownershipEpochRevision":3,"sourceRevision":42,"policyRevision":7},"inputManifestPath":"subscriptions/sub-123/history/billing/analyzer-inputs/generations/billing-input-generation-42/manifest.json","inputManifestDigest":"91dd12d5e391e3b6825669db62af9b38755f37d9a6d97c2e127d6957b96c412a","artifacts":[{"path":"subscriptions/sub-123/billing/generations/billing-input-generation-42/metadata.json","name":"metadata.json","mediaType":"application/json","contentEncoding":"identity","byteLength":1924,"sha256":"77e5c414e955b33a68e0131874eb95fc6e6f4cf81cd1cc318d3563712479fd5e"}],"publicationDecision":{"processing":"succeeded","evidence":"partial","publication":"partial","dependencies":[{"name":"billing-history","required":true,"support":"supported","applicability":"applicable","attempt":"succeeded","coverage":"complete","emptyEvidence":"populated","freshness":"current","evidence":"complete","publication":"completed","generationId":"billing-input-generation-42","digest":"91dd12d5e391e3b6825669db62af9b38755f37d9a6d97c2e127d6957b96c412a","sourceRevision":42,"policyRevision":7},{"name":"exchange-rates","required":false,"support":"supported","applicability":"applicable","attempt":"failed","coverage":"none","emptyEvidence":"not-observed","freshness":"unknown","evidence":"insufficient","publication":"suppressed","reasonCode":"exchange-rates-unavailable"}],"claims":[{"claimId":"cost-analysis","sectionPaths":["chartData","anomalies"],"requiredDependencies":["billing-history"],"evidence":"partial","publication":"partial","issues":[{"code":"exchange-rates-unavailable","blocking":false,"dependency":"exchange-rates"}]}],"issues":[{"code":"exchange-rates-unavailable","blocking":false,"dependency":"exchange-rates"}]},"manifestDigest":"eba62c30e4081c047d6ef10a62b72992905abed1350149b0e0b953328166ac06","completedAt":"2026-08-13T00:05:00.000Z","outputBindingDigest":"82073ad7769e4b90d979617dcebcadb6d25c54d7c0c287a561caa72df764ec63"},"metadata":{"schemaVersion":2,"subscriptionId":"sub-123","billingGenerationId":"billing-input-generation-42","ownership":{"provider":"azure","tenantId":"tenant-1","companyId":"company-1","cloudAccountId":"cloud-account-1","accountId":"sub-123","ownershipEpochRevision":3},"revision":{"ownershipEpochRevision":3,"sourceRevision":42,"policyRevision":7},"artifactState":"partial","artifactEvidence":{"processing":"succeeded","evidence":"partial","publication":"partial","dependencies":[{"name":"billing-history","required":true,"support":"supported","applicability":"applicable","attempt":"succeeded","coverage":"complete","emptyEvidence":"populated","freshness":"current","evidence":"complete","publication":"completed","generationId":"billing-input-generation-42","digest":"91dd12d5e391e3b6825669db62af9b38755f37d9a6d97c2e127d6957b96c412a","sourceRevision":42,"policyRevision":7},{"name":"exchange-rates","required":false,"support":"supported","applicability":"applicable","attempt":"failed","coverage":"none","emptyEvidence":"not-observed","freshness":"unknown","evidence":"insufficient","publication":"suppressed","reasonCode":"exchange-rates-unavailable"}],"claims":[{"claimId":"cost-analysis","sectionPaths":["chartData","anomalies"],"requiredDependencies":["billing-history"],"evidence":"partial","publication":"partial","issues":[{"code":"exchange-rates-unavailable","blocking":false,"dependency":"exchange-rates"}]}],"issues":[{"code":"exchange-rates-unavailable","blocking":false,"dependency":"exchange-rates"}]},"inputManifestDigest":"91dd12d5e391e3b6825669db62af9b38755f37d9a6d97c2e127d6957b96c412a","outputBindingDigest":"82073ad7769e4b90d979617dcebcadb6d25c54d7c0c287a561caa72df764ec63","chartData":{"schemaVersion":1,"source":"aggregated","dataWindow":{"startDate":1754006400,"endDate":1756684800,"pointCount":0},"views":{},"detectors":{"threshold":2,"methods":[]}},"anomalies":[],"currencyCode":"NZD","currencySymbol":"$"},"inputManifest":{"schemaVersion":2,"status":"completed","subscriptionId":"sub-123","generationId":"billing-input-generation-42","publicationKey":"billing-input:sub-123:source-run-42","ownership":{"provider":"azure","tenantId":"tenant-1","companyId":"company-1","cloudAccountId":"cloud-account-1","accountId":"sub-123","ownershipEpochRevision":3},"revision":{"ownershipEpochRevision":3,"sourceRevision":42,"policyRevision":7},"coveragePlanDigest":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa","asOfUtc":"2026-08-13T00:00:00.000Z","stableCutoffUtc":"2026-08-12T00:00:00.000Z","requestedPeriods":[{"fromInclusive":"2026-07-01T00:00:00.000Z","throughExclusive":"2026-08-01T00:00:00.000Z","dateBasis":"utc","basis":"amortized"}],"inputs":[{"path":"subscriptions/sub-123/history/billing/analyzer-inputs/generations/billing-input-generation-42/months/month_2026-07.json.gz","versionId":"version-1","etag":"etag-1","sha256":"bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb","byteCount":512,"rowCount":31,"basis":"amortized","currencyCode":"NZD","coverage":"complete"}],"manifestDigest":"91dd12d5e391e3b6825669db62af9b38755f37d9a6d97c2e127d6957b96c412a","completedAt":"2026-08-13T00:05:00.000Z"}}';
const artifactEvidenceConsumerSource = `
import {
  canonicalizeBillingAnalyzerInputManifestV2ForDigest,
  canonicalizeBillingAnalyzerOutputManifestV2ForDigest,
  canonicalizeBillingOutputBindingV1,
  compareArtifactRevisionVector,
  isArtifactOwnershipBinding,
  isArtifactPublicationDecision,
  isBillingAnalysisCurrentPointerV1,
  isBillingAnalyzerInputCurrentPointerV1,
  isBillingAnalyzerInputManifestV2,
  isBillingAnalyzerOutputManifestV2,
  isBillingAnalyzerRequestV2,
  isBillingCostAnalysisMetadataV2,
  isCompletedAzureViewSetV2,
  isCompletedViewManifestV3,
  isEnforceableArtifactOwnershipBinding,
  projectBillingOutputBindingV1FromManifest,
  projectBillingOutputBindingV1FromMetadata,
  type ArtifactApplicabilityVerdict,
  type ArtifactAttemptOutcome,
  type ArtifactClaimDependencyDecision,
  type ArtifactCoverageVerdict,
  type ArtifactDependencyDescriptor,
  type ArtifactEmptyEvidenceVerdict,
  type ArtifactEvidenceVerdict,
  type ArtifactFreshnessVerdict,
  type ArtifactObservedRange,
  type ArtifactOwnershipBinding,
  type ArtifactProcessingLifecycle,
  type ArtifactPublicationDecision,
  type ArtifactPublicationVerdict,
  type ArtifactRevisionComparison,
  type ArtifactRevisionVector,
  type ArtifactSupportVerdict,
  type BillingAnalysisCurrentPointerV1,
  type BillingAnalyzerInputCurrentPointerV1,
  type BillingAnalyzerInputManifestV2,
  type BillingAnalyzerOutputManifestV2,
  type BillingAnalyzerRequestV2,
  type BillingArtifactReadState,
  type BillingCostAnalysisMetadata,
  type BillingCostAnalysisMetadataV2,
  type BillingOutputBindingV1,
  type CompletedAzureViewSetV2,
  type CompletedViewManifestV3,
} from '@spottoai/types-package';

const runtimeExports = [
  canonicalizeBillingAnalyzerInputManifestV2ForDigest,
  canonicalizeBillingAnalyzerOutputManifestV2ForDigest,
  canonicalizeBillingOutputBindingV1,
  compareArtifactRevisionVector,
  isArtifactOwnershipBinding,
  isArtifactPublicationDecision,
  isBillingAnalysisCurrentPointerV1,
  isBillingAnalyzerInputCurrentPointerV1,
  isBillingAnalyzerInputManifestV2,
  isBillingAnalyzerOutputManifestV2,
  isBillingAnalyzerRequestV2,
  isBillingCostAnalysisMetadataV2,
  isCompletedAzureViewSetV2,
  isCompletedViewManifestV3,
  isEnforceableArtifactOwnershipBinding,
  projectBillingOutputBindingV1FromManifest,
  projectBillingOutputBindingV1FromMetadata,
];

type Dev1036PublishedTypes = [
  ArtifactApplicabilityVerdict,
  ArtifactAttemptOutcome,
  ArtifactClaimDependencyDecision,
  ArtifactCoverageVerdict,
  ArtifactDependencyDescriptor,
  ArtifactEmptyEvidenceVerdict,
  ArtifactEvidenceVerdict,
  ArtifactFreshnessVerdict,
  ArtifactObservedRange,
  ArtifactOwnershipBinding,
  ArtifactProcessingLifecycle,
  ArtifactPublicationDecision,
  ArtifactPublicationVerdict,
  ArtifactRevisionComparison,
  ArtifactRevisionVector,
  ArtifactSupportVerdict,
  BillingAnalysisCurrentPointerV1,
  BillingAnalyzerInputCurrentPointerV1,
  BillingAnalyzerInputManifestV2,
  BillingAnalyzerOutputManifestV2,
  BillingAnalyzerRequestV2,
  BillingArtifactReadState,
  BillingCostAnalysisMetadata,
  BillingCostAnalysisMetadataV2,
  BillingOutputBindingV1,
  CompletedAzureViewSetV2,
  CompletedViewManifestV3,
];

const legacyBillingMetadata = ${legacyBillingMetadataLiteral} satisfies BillingCostAnalysisMetadata;
const digestRepairDocuments = ${digestRepairRuntimeDocuments} as unknown as {
  outputManifest: BillingAnalyzerOutputManifestV2;
  metadata: BillingCostAnalysisMetadataV2;
  inputManifest: BillingAnalyzerInputManifestV2;
};
const manifestBinding: BillingOutputBindingV1 = projectBillingOutputBindingV1FromManifest(digestRepairDocuments.outputManifest);
const metadataBinding: BillingOutputBindingV1 = projectBillingOutputBindingV1FromMetadata(digestRepairDocuments.metadata);
const packedCanonicalPreimages: string[] = [
  canonicalizeBillingOutputBindingV1(manifestBinding),
  canonicalizeBillingOutputBindingV1(metadataBinding),
  canonicalizeBillingAnalyzerInputManifestV2ForDigest(digestRepairDocuments.inputManifest),
  canonicalizeBillingAnalyzerOutputManifestV2ForDigest(digestRepairDocuments.outputManifest),
];

void runtimeExports;
void legacyBillingMetadata;
void packedCanonicalPreimages;
void (null as unknown as Dev1036PublishedTypes);
`;
const dev1036RuntimeExportNames = [
  'compareArtifactRevisionVector',
  'isArtifactOwnershipBinding',
  'isArtifactPublicationDecision',
  'isBillingAnalysisCurrentPointerV1',
  'isBillingAnalyzerInputCurrentPointerV1',
  'isBillingAnalyzerInputManifestV2',
  'isBillingAnalyzerOutputManifestV2',
  'isBillingAnalyzerRequestV2',
  'isBillingCostAnalysisMetadataV2',
  'isCompletedAzureViewSetV2',
  'isCompletedViewManifestV3',
  'isEnforceableArtifactOwnershipBinding',
  'projectBillingOutputBindingV1FromManifest',
  'projectBillingOutputBindingV1FromMetadata',
  'canonicalizeBillingOutputBindingV1',
  'canonicalizeBillingAnalyzerInputManifestV2ForDigest',
  'canonicalizeBillingAnalyzerOutputManifestV2ForDigest',
];
const requiredDigestRepairRuntimeExports = [
  'projectBillingOutputBindingV1FromManifest',
  'projectBillingOutputBindingV1FromMetadata',
  'canonicalizeBillingOutputBindingV1',
  'canonicalizeBillingAnalyzerInputManifestV2ForDigest',
  'canonicalizeBillingAnalyzerOutputManifestV2ForDigest',
];
for (const exportName of requiredDigestRepairRuntimeExports) {
  if (!dev1036RuntimeExportNames.includes(exportName)) {
    throw new Error(`packed DEV-1036 gate must execute digest-repair root export: ${exportName}`);
  }
}
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const nodeModulesBin = join(packageRoot, 'node_modules', '.bin');
const tscCommand = join(nodeModulesBin, process.platform === 'win32' ? 'tsc.cmd' : 'tsc');
const subprocessEnvironment = { ...process.env };
delete subprocessEnvironment.npm_config_dry_run;
delete subprocessEnvironment.NPM_CONFIG_DRY_RUN;

const run = (command, args, cwd, captureOutput = false) => {
  const invocation =
    process.platform === 'win32' && command.toLowerCase().endsWith('.cmd')
      ? {
          command: process.env.ComSpec || 'cmd.exe',
          args: ['/d', '/s', '/c', command, ...args],
        }
      : { command, args };

  const result = spawnSync(invocation.command, invocation.args, {
    cwd,
    encoding: 'utf8',
    env: subprocessEnvironment,
    stdio: captureOutput ? ['ignore', 'pipe', 'inherit'] : 'inherit',
  });

  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    throw new Error(`${command} exited with status ${result.status}.`);
  }

  return result.stdout ?? '';
};

const tempRoot = await mkdtemp(join(tmpdir(), 'spotto-types-package-'));

try {
  run(npmCommand, ['run', 'build'], packageRoot);
  const packOutput = run(npmCommand, ['pack', '--ignore-scripts', '--json', '--pack-destination', tempRoot], packageRoot, true);
  const [packedArtifact] = JSON.parse(packOutput);
  if (!packedArtifact?.filename) {
    throw new Error('npm pack did not return an artifact filename.');
  }

  const consumerRoot = join(tempRoot, 'consumer');
  await mkdir(consumerRoot, { recursive: true });
  await writeFile(join(consumerRoot, 'package.json'), JSON.stringify({ private: true, type: 'module' }, null, 2));
  await copyFile(awsFixturePath, join(consumerRoot, 'aws-public-root.consumer.ts'));
  await copyFile(resourceOptimizationFixturePath, join(consumerRoot, 'resource-optimization.consumer.ts'));
  await copyFile(recommendationTracksFixturePath, join(consumerRoot, 'recommendation-tracks.consumer.ts'));
  await copyFile(recommendationWorkflowApiFixturePath, join(consumerRoot, 'recommendation-workflow-api.consumer.ts'));
  await copyFile(recommendationWorkflowUiFixturePath, join(consumerRoot, 'recommendation-workflow-ui.consumer.ts'));
  await copyFile(azureSpSetupApiFixturePath, join(consumerRoot, 'azure-sp-setup-api.consumer.ts'));
  await copyFile(azureSpSetupCloudEngineFixturePath, join(consumerRoot, 'azure-sp-setup-cloud-engine.consumer.ts'));
  await copyFile(azureSpSetupUiFixturePath, join(consumerRoot, 'azure-sp-setup-ui.consumer.ts'));
  await copyFile(commitmentsPlanningFixturePath, join(consumerRoot, 'commitments-planning.consumer.ts'));
  await writeFile(join(consumerRoot, 'artifact-evidence.consumer.ts'), artifactEvidenceConsumerSource);

  run(
    npmCommand,
    ['install', '--ignore-scripts', '--no-save', '--package-lock=false', '--legacy-peer-deps', join(tempRoot, packedArtifact.filename)],
    consumerRoot
  );
  run(
    tscCommand,
    [
      '--noEmit',
      '--strict',
      '--skipLibCheck',
      '--target',
      'ES2022',
      '--module',
      'NodeNext',
      '--moduleResolution',
      'NodeNext',
      'aws-public-root.consumer.ts',
      'resource-optimization.consumer.ts',
      'recommendation-tracks.consumer.ts',
      'recommendation-workflow-api.consumer.ts',
      'recommendation-workflow-ui.consumer.ts',
      'azure-sp-setup-api.consumer.ts',
      'azure-sp-setup-cloud-engine.consumer.ts',
      'azure-sp-setup-ui.consumer.ts',
      'commitments-planning.consumer.ts',
      'artifact-evidence.consumer.ts',
    ],
    consumerRoot
  );
  run(
    process.execPath,
    [
      '--input-type=module',
      '-e',
      `import root from '@spottoai/types-package'; import aws from '@spottoai/types-package/aws'; import recommendations from '@spottoai/types-package/azure/recommendations'; import provider from '@spottoai/types-package/common/provider'; const dev1036RuntimeExportNames = ${JSON.stringify(dev1036RuntimeExportNames)}; const documents = ${digestRepairRuntimeDocuments}; const manifestBinding = root.projectBillingOutputBindingV1FromManifest(documents.outputManifest); const metadataBinding = root.projectBillingOutputBindingV1FromMetadata(documents.metadata); const bindingCanonical = root.canonicalizeBillingOutputBindingV1(manifestBinding); const metadataBindingCanonical = root.canonicalizeBillingOutputBindingV1(metadataBinding); const inputPreimage = root.canonicalizeBillingAnalyzerInputManifestV2ForDigest(documents.inputManifest); const outputPreimage = root.canonicalizeBillingAnalyzerOutputManifestV2ForDigest(documents.outputManifest); if (JSON.stringify(manifestBinding) !== JSON.stringify(metadataBinding) || bindingCanonical !== metadataBindingCanonical || !bindingCanonical.includes('"kind":"billing-analysis-output"') || inputPreimage.includes('"manifestDigest"') || outputPreimage.includes('"manifestDigest"') || !outputPreimage.includes('"outputBindingDigest"') || root.AWS_COMMAND_PROVIDER !== 'aws' || root.AWS_COMMAND_SCHEMA_VERSION !== 1 || root.ARTIFACT_GENERATION_SCHEMA_VERSION !== 1 || root.SystemTrackIds.resourceHygiene !== 'resource-hygiene' || root.RecommendationFocusModes.finops !== 'finops' || !Array.isArray(root.AWS_COMMAND_ACTIONS) || !Array.isArray(root.AWS_COMMAND_ENTITIES) || !Array.isArray(root.AWS_FORBIDDEN_CREDENTIAL_FIELDS) || aws.AWS_ESTATES_MANIFEST_SCHEMA_VERSION !== 1 || aws.AWS_PUBLIC_ARTIFACT_SCHEMA_VERSION !== 1 || aws.AWS_PLUGIN_PUBLIC_ARTIFACT_SCHEMA_VERSION !== 1 || aws.AWS_PORTAL_PUBLIC_ARTIFACT_SCHEMA_VERSION !== 1 || aws.AWS_PORTAL_RELATIONSHIP_SCHEMA_VERSION !== 2 || !aws.AWS_PUBLIC_ARTIFACT_TYPES.includes('plugin-resource') || !aws.AWS_PUBLIC_ARTIFACT_TYPES.includes('account-summary-ai-cost-summary') || aws.AWS_PORTAL_RESOURCE_COLLECTION_LOGICAL_NAME !== 'resources.json.gz' || aws.AWS_PORTAL_RELATIONSHIP_LOGICAL_NAME !== 'relationships.json.gz' || aws.buildAwsPluginSubscriptionLogicalName('a'.repeat(64)) !== 'plugin-subscription--' + 'a'.repeat(64) + '.json.gz' || typeof aws.sha256AwsPluginIdentity !== 'function' || typeof aws.validateAwsPluginGenerationManifest !== 'function' || typeof aws.validateAwsPortalAccountSummaryAiCostSummaryArtifact !== 'function' || typeof aws.validateAwsPortalRelationshipArtifact !== 'function' || typeof aws.validateAwsCommitmentsPlanningViewIdentity !== 'function' || !dev1036RuntimeExportNames.every(name => typeof root[name] === 'function') || recommendations.RecommendationCategory.Cost !== 'Cost' || provider.ProviderName.Azure !== 'azure') process.exit(1);`,
    ],
    consumerRoot
  );
  run(
    process.execPath,
    [
      '-e',
      `const root = require('@spottoai/types-package'); const aws = require('@spottoai/types-package/aws'); const recommendations = require('@spottoai/types-package/azure/recommendations'); const provider = require('@spottoai/types-package/common/provider'); const dev1036RuntimeExportNames = ${JSON.stringify(dev1036RuntimeExportNames)}; const documents = ${digestRepairRuntimeDocuments}; const manifestBinding = root.projectBillingOutputBindingV1FromManifest(documents.outputManifest); const metadataBinding = root.projectBillingOutputBindingV1FromMetadata(documents.metadata); const bindingCanonical = root.canonicalizeBillingOutputBindingV1(manifestBinding); const metadataBindingCanonical = root.canonicalizeBillingOutputBindingV1(metadataBinding); const inputPreimage = root.canonicalizeBillingAnalyzerInputManifestV2ForDigest(documents.inputManifest); const outputPreimage = root.canonicalizeBillingAnalyzerOutputManifestV2ForDigest(documents.outputManifest); if (JSON.stringify(manifestBinding) !== JSON.stringify(metadataBinding) || bindingCanonical !== metadataBindingCanonical || !bindingCanonical.includes('"kind":"billing-analysis-output"') || inputPreimage.includes('"manifestDigest"') || outputPreimage.includes('"manifestDigest"') || !outputPreimage.includes('"outputBindingDigest"') || root.ARTIFACT_GENERATION_SCHEMA_VERSION !== 1 || root.SystemTrackIds.resourceHygiene !== 'resource-hygiene' || root.RecommendationFocusModes.finops !== 'finops' || aws.AWS_PUBLIC_ARTIFACT_SCHEMA_VERSION !== 1 || aws.AWS_PLUGIN_PUBLIC_ARTIFACT_SCHEMA_VERSION !== 1 || aws.AWS_PORTAL_PUBLIC_ARTIFACT_SCHEMA_VERSION !== 1 || typeof root.validateAwsPluginSubscriptionDetailArtifact !== 'function' || typeof aws.buildAwsPluginResourceLogicalName !== 'function' || typeof root.validateAwsPortalResourceCollectionDetailArtifact !== 'function' || typeof root.validateAwsPortalRelationshipArtifact !== 'function' || typeof root.validateAwsCommitmentsPlanningViewIdentity !== 'function' || !dev1036RuntimeExportNames.every(name => typeof root[name] === 'function') || recommendations.RecommendationCategory.Cost !== 'Cost' || provider.ProviderName.Azure !== 'azure') process.exit(1);`,
    ],
    consumerRoot
  );

  process.stdout.write('Packed Node 24 ESM/CommonJS root/AWS plus API/cloud-engine/UI consumers verified.\n');
} finally {
  await rm(tempRoot, { recursive: true, force: true });
}
