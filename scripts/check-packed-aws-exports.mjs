import { copyFile, mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
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
const artifactEvidenceConsumerSource = `
import {
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
  type CompletedAzureViewSetV2,
  type CompletedViewManifestV3,
} from '@spottoai/types-package';

const runtimeExports = [
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
  CompletedAzureViewSetV2,
  CompletedViewManifestV3,
];

const legacyBillingMetadata = {
  subscriptionId: 'sub-123',
  billingGenerationId: 'billing-generation-v1',
  chartData: {
    schemaVersion: 1,
    source: 'aggregated',
    dataWindow: { startDate: 1782864000, endDate: 1785542400, pointCount: 0 },
    views: {},
    detectors: { threshold: 3, methods: [] },
  },
  anomalies: [],
  currencyCode: 'NZD',
  currencySymbol: '$',
} satisfies BillingCostAnalysisMetadata;

void runtimeExports;
void legacyBillingMetadata;
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
];
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
      `import root from '@spottoai/types-package'; import aws from '@spottoai/types-package/aws'; import recommendations from '@spottoai/types-package/azure/recommendations'; import provider from '@spottoai/types-package/common/provider'; const dev1036RuntimeExportNames = ${JSON.stringify(dev1036RuntimeExportNames)}; if (root.AWS_COMMAND_PROVIDER !== 'aws' || root.AWS_COMMAND_SCHEMA_VERSION !== 1 || root.ARTIFACT_GENERATION_SCHEMA_VERSION !== 1 || root.SystemTrackIds.resourceHygiene !== 'resource-hygiene' || root.RecommendationFocusModes.finops !== 'finops' || !Array.isArray(root.AWS_COMMAND_ACTIONS) || !Array.isArray(root.AWS_COMMAND_ENTITIES) || !Array.isArray(root.AWS_FORBIDDEN_CREDENTIAL_FIELDS) || aws.AWS_ESTATES_MANIFEST_SCHEMA_VERSION !== 1 || aws.AWS_PUBLIC_ARTIFACT_SCHEMA_VERSION !== 1 || aws.AWS_PLUGIN_PUBLIC_ARTIFACT_SCHEMA_VERSION !== 1 || aws.AWS_PORTAL_PUBLIC_ARTIFACT_SCHEMA_VERSION !== 1 || aws.AWS_PORTAL_RELATIONSHIP_SCHEMA_VERSION !== 2 || !aws.AWS_PUBLIC_ARTIFACT_TYPES.includes('plugin-resource') || !aws.AWS_PUBLIC_ARTIFACT_TYPES.includes('account-summary-ai-cost-summary') || aws.AWS_PORTAL_RESOURCE_COLLECTION_LOGICAL_NAME !== 'resources.json.gz' || aws.AWS_PORTAL_RELATIONSHIP_LOGICAL_NAME !== 'relationships.json.gz' || aws.buildAwsPluginSubscriptionLogicalName('a'.repeat(64)) !== 'plugin-subscription--' + 'a'.repeat(64) + '.json.gz' || typeof aws.sha256AwsPluginIdentity !== 'function' || typeof aws.validateAwsPluginGenerationManifest !== 'function' || typeof aws.validateAwsPortalAccountSummaryAiCostSummaryArtifact !== 'function' || typeof aws.validateAwsPortalRelationshipArtifact !== 'function' || typeof aws.validateAwsCommitmentsPlanningViewIdentity !== 'function' || !dev1036RuntimeExportNames.every(name => typeof root[name] === 'function') || recommendations.RecommendationCategory.Cost !== 'Cost' || provider.ProviderName.Azure !== 'azure') process.exit(1);`,
    ],
    consumerRoot
  );
  run(
    process.execPath,
    [
      '-e',
      `const root = require('@spottoai/types-package'); const aws = require('@spottoai/types-package/aws'); const recommendations = require('@spottoai/types-package/azure/recommendations'); const provider = require('@spottoai/types-package/common/provider'); const dev1036RuntimeExportNames = ${JSON.stringify(dev1036RuntimeExportNames)}; if (root.ARTIFACT_GENERATION_SCHEMA_VERSION !== 1 || root.SystemTrackIds.resourceHygiene !== 'resource-hygiene' || root.RecommendationFocusModes.finops !== 'finops' || aws.AWS_PUBLIC_ARTIFACT_SCHEMA_VERSION !== 1 || aws.AWS_PLUGIN_PUBLIC_ARTIFACT_SCHEMA_VERSION !== 1 || aws.AWS_PORTAL_PUBLIC_ARTIFACT_SCHEMA_VERSION !== 1 || typeof root.validateAwsPluginSubscriptionDetailArtifact !== 'function' || typeof aws.buildAwsPluginResourceLogicalName !== 'function' || typeof root.validateAwsPortalResourceCollectionDetailArtifact !== 'function' || typeof root.validateAwsPortalRelationshipArtifact !== 'function' || typeof root.validateAwsCommitmentsPlanningViewIdentity !== 'function' || !dev1036RuntimeExportNames.every(name => typeof root[name] === 'function') || recommendations.RecommendationCategory.Cost !== 'Cost' || provider.ProviderName.Azure !== 'azure') process.exit(1);`,
    ],
    consumerRoot
  );

  process.stdout.write('Packed Node 24 ESM/CommonJS root/AWS plus API/cloud-engine/UI consumers verified.\n');
} finally {
  await rm(tempRoot, { recursive: true, force: true });
}
