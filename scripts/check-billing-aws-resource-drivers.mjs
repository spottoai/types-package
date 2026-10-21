import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const corpus = JSON.parse(await readFile(new URL('../fixtures/artifact-evidence-contract-corpus.json', import.meta.url), 'utf8'));
const reference = corpus.fixtures.billingCostAnalysisMetadataV2;
for (const entry of ['../dist/index.js', '../dist/esm/index.js']) {
  const { isBillingCostAnalysisBusinessPayloadV1 } = await import(entry);
  const accountId = '111122223333';
  const resourceId = `arn:aws:ec2:ap-southeast-2:${accountId}:instance/i-example`;
  const resource = {
    name: 'i-example',
    resourceScope: 'resource',
    resourceId,
    cost: 96,
    baseline: 6,
    delta: 90,
    percentChange: 1500,
    isNew: false,
    summary: 'Recorded resource usage increased from its seven-day baseline.',
  };
  const payload = {
    subscriptionId: accountId,
    billingGenerationId: reference.billingGenerationId,
    chartData: reference.chartData,
    currencyCode: reference.currencyCode,
    currencySymbol: reference.currencySymbol,
    anomalies: [
      {
        date: 1789257600000,
        summary: 'Usage increased.',
        confidence: 'High',
        notes: [],
        impact: {
          cost: 102,
          delta: 90,
          baseline7Day: 12,
          baseline30Day: null,
          percentChange: 750,
          previousDayCost: 12,
          previousDayDelta: 90,
          monthToDateCost: 200,
          monthToDateBaseline: null,
          monthToDateDelta: null,
          monthToDatePercentChange: null,
        },
        drivers: [
          {
            type: 'service',
            name: 'AmazonEC2',
            summary: 'EC2 usage increased.',
            cost: 102,
            baseline: 12,
            delta: 90,
            percentChange: 750,
            shareOfImpactPercent: 100,
            isNew: false,
            resources: [resource],
          },
        ],
      },
    ],
  };
  const withResource = replacement => {
    const copy = structuredClone(payload);
    copy.anomalies[0].drivers[0].resources[0] = replacement;
    return copy;
  };
  assert.equal(isBillingCostAnalysisBusinessPayloadV1(payload), true, 'exact-account AWS driver ARN crosses the business boundary');
  for (const id of [
    'i-example',
    'vol-example',
    'arn:aws:future-service:us-east-1::/resource/example',
    'arn:aws:future-service:::resource/example',
    `arn:aws:future-service::${accountId}:/resource/example`,
    `arn:aws:future-service:us-east-1:${accountId}:resource/example`,
    `arn:aws:future-service:us-east-1:${accountId}:resource/name+suffix=tag,value@example.invalid:$LATEST`,
    'arn:aws:s3:::example-usage-bucket',
    'arn:aws:apigateway:ap-southeast-2::/restapis/a1b2c3',
    'arn:aws:apigateway:us-east-1::/apis/a1b2c3/stages/prod',
    'arn:aws:apigateway:us-east-1::/domainnames/example.invalid',
    `arn:aws:apigateway:us-east-1:${accountId}:/domainnameaccessassociations/domainname/example.invalid/vpcesource/vpce-example`,
    'arn:aws:route53:::hostedzone/Z123EXAMPLE',
    'arn:aws:route53:::healthcheck/example-id',
    'arn:aws-cn:apigateway:cn-north-1::/restapis/a1b2c3',
    'arn:aws-us-gov:apigateway:us-gov-west-1::/apis/a1b2c3',
    'arn:aws-cn:route53:::hostedzone/Z123EXAMPLE',
  ]) {
    assert.equal(isBillingCostAnalysisBusinessPayloadV1(withResource({ ...resource, resourceId: id })), true, `recorded native identity ${id}`);
  }
  for (const id of [
    resourceId.replace(accountId, '123456789012'),
    'arn:aws::us-east-1::resource/example',
    'arn:aws:future-service:us-east-1:11112222333:resource/example',
    'arn:aws:future-service:us-east-1:foreign:resource/example',
    'arn:aws:future-service:us-east-1:123456789012:/resource/example',
    'arn:aws:future-service:us-east-1::',
    'arn:other-partition:future-service:us-east-1::resource/example',
    'arn:aws:future-service:us-east-1::resource/*',
    'arn:aws:apigateway:us-east-1::/',
    'arn:aws:apigateway:us-east-1:://apis/a1b2c3',
    'arn:aws:apigateway:us-east-1::/apis/../secret',
    'arn:aws:apigateway:us-east-1::/apis/%2e%2e/secret',
    'arn:aws:apigateway:us-east-1::/apis/a1b2c3?token=secret',
    'arn:aws:apigateway:us-east-1:123456789012:/restapis/a1b2c3',
    'arn:aws:route53:::hostedzone/../secret',
    'https://storage.example.invalid/secret',
    'file:///tmp/input.json',
    '/tmp/input.json',
    'i-example/../secret',
    'history/billing/input.json',
    'i%2Fexample',
    'i-example\\secret',
    'i-example\nsecret',
    'a'.repeat(64),
  ]) {
    assert.equal(
      isBillingCostAnalysisBusinessPayloadV1(withResource({ ...resource, resourceId: id })),
      false,
      `unsafe or foreign identity ${JSON.stringify(id)}`
    );
  }
  assert.equal(isBillingCostAnalysisBusinessPayloadV1({ ...payload, subscriptionId: 'sub-123' }), false, 'Azure scope never permits a native ARN');
  assert.equal(
    isBillingCostAnalysisBusinessPayloadV1({ ...payload, future: { resourceId } }),
    false,
    'native allowance cannot escape the driver field'
  );
  assert.equal(
    isBillingCostAnalysisBusinessPayloadV1({ ...payload, future: payload.anomalies[0].drivers[0].resources[0] }),
    false,
    'shared alias cannot inherit driver permissions'
  );
  for (const forbidden of [
    { accessToken: 'secret' },
    { inputManifestDigest: 'a'.repeat(64) },
    { blobUrl: 'https://storage.example.invalid/input' },
  ]) {
    assert.equal(
      isBillingCostAnalysisBusinessPayloadV1(withResource({ ...resource, ...forbidden })),
      false,
      'driver identities do not allow private controls'
    );
  }
  const unassessed = withResource({
    ...resource,
    baseline: null,
    delta: null,
    percentChange: null,
    summary: 'Observed cost; recent resource comparison is unassessed.',
  });
  assert.equal(isBillingCostAnalysisBusinessPayloadV1(unassessed), true, 'unknown resource comparison is never a fabricated zero');
  for (const [cost, baseline, delta, percentChange] of [
    [3, 6, -3, -50],
    [0, 6, -6, -100],
  ]) {
    const decrease = withResource({
      ...resource,
      resourceId: 'arn:aws:route53:::hostedzone/Z123EXAMPLE',
      cost,
      baseline,
      delta,
      percentChange,
      summary: 'Recorded resource spend decreased against its assessed baseline.',
    });
    assert.equal(isBillingCostAnalysisBusinessPayloadV1(decrease), true, 'signed resource changes and assessed zero remain valid');
    for (const field of ['cost', 'baseline', 'delta', 'percentChange']) {
      const invalid = structuredClone(decrease);
      invalid.anomalies[0].drivers[0].resources[0][field] = Number.NaN;
      assert.equal(isBillingCostAnalysisBusinessPayloadV1(invalid), false, `${field} cannot be nonfinite`);
    }
  }
  for (const role of ['impact', 'data-window', 'detector', 'point']) {
    const copy = structuredClone(payload);
    let shared;
    if (role === 'impact') {
      shared = { ...copy.anomalies[0].impact, ...resource };
      copy.anomalies[0].impact = shared;
    } else if (role === 'data-window') {
      shared = { ...copy.chartData.dataWindow, ...resource };
      copy.chartData.dataWindow = shared;
    } else if (role === 'detector') {
      shared = { ...resource, status: 'completed', triggeredDates: [] };
      copy.chartData.detectors.methods = [shared];
    } else {
      shared = { ...resource, date: '2026-09-12', timestamp: 1789257600000, isAnomaly: false, anomalyVotes: 0 };
      copy.chartData.views.nativeProbe = { aggregation: 'daily', points: [shared] };
    }
    copy.anomalies[0].drivers[0].resources = [shared];
    assert.equal(isBillingCostAnalysisBusinessPayloadV1(copy), false, `schema-owned ${role} alias cannot inherit driver identity permission`);
    assert.equal(isBillingCostAnalysisBusinessPayloadV1(JSON.parse(JSON.stringify(copy))), false, `serialized ${role} alias stays rejected`);
  }
  const samePath = structuredClone(payload);
  samePath.anomalies[0].drivers[0].resources.push(samePath.anomalies[0].drivers[0].resources[0]);
  assert.equal(isBillingCostAnalysisBusinessPayloadV1(samePath), true, 'same-role aliases preserve valid driver references');
  console.log(`AWS billing driver identity contract checks passed: ${entry}`);
}
