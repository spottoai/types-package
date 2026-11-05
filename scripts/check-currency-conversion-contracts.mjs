import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const fixture = JSON.parse(readFileSync(new URL('../fixtures/currency-conversion.json', import.meta.url), 'utf8'));
const modules = [
  ['CommonJS root', '../dist/index.js'],
  ['ESM root', '../dist/esm/entries/root.js'],
  ['CommonJS narrow', '../dist/common/currencyConversion.js'],
  ['ESM narrow', '../dist/esm/common/currencyConversion.js'],
];

for (const [name, path] of modules) {
  const contracts = await import(path);
  const fresh = () => structuredClone(fixture);

  test(`${name}: exposes conversion contracts`, () => {
    assert.equal(contracts.CURRENCY_CONVERSION_CONTRACT_VERSION, 1);
    assert.equal(contracts.CURRENCY_CONVERSION_HEADER, 'X-Spotto-Currency-Conversion');
    assert.equal(contracts.CURRENCY_CONVERSION_RATE_SOURCE, fixture.context.rateSource);
    for (const guard of ['isCurrencyConversionContextV1', 'isCurrencyConversionRateV1', 'isCurrencyConversionV1', 'isCurrencyConversionDiscoveryV1'])
      assert.equal(typeof contracts[guard], 'function', guard);
  });

  test(`${name}: accepts single-source, mixed-source, empty and identity evidence without mutation`, () => {
    const input = fresh();
    assert.equal(contracts.isCurrencyConversionContextV1(input.context), true);
    assert.equal(contracts.isCurrencyConversionV1(input.converted), true);
    assert.equal(contracts.isCurrencyConversionV1(input.mixed), true);
    assert.equal(contracts.isCurrencyConversionV1(input.unchanged), true);
    assert.equal(contracts.isCurrencyConversionV1({ ...input.context, status: 'unchanged', rates: [] }), true);
    assert.equal(contracts.isCurrencyConversionDiscoveryV1(input.discovery), true);
    assert.deepEqual(input, fixture);
  });

  test(`${name}: rejects invalid context fields and private data`, () => {
    for (const patch of [
      { contractVersion: 2 },
      { targetCurrency: 'usd' },
      { targetCurrency: '' },
      { targetCurrency: 'US' },
      { targetCurrency: ' USD' },
      { rateDate: '2026-02-29' },
      { rateDate: '2026-11-31' },
      { rateDate: '2026-11-04T00:00:00Z' },
      { rateDate: '2026-1-04' },
      { rateSnapshotId: 'a'.repeat(63) },
      { rateSnapshotId: 'A'.repeat(64) },
      { rateSnapshotId: 'g'.repeat(64) },
      { rateSource: 'another source' },
      { companyId: 'private' },
    ])
      assert.equal(contracts.isCurrencyConversionContextV1({ ...fixture.context, ...patch }), false, JSON.stringify(patch));
    for (const key of Object.keys(fixture.context)) {
      const value = { ...fixture.context };
      delete value[key];
      assert.equal(contracts.isCurrencyConversionContextV1(value), false, `missing ${key}`);
    }
    assert.equal(contracts.isCurrencyConversionContextV1({ ...fixture.context, rateDate: '2024-02-29' }), true);
    assert.equal(contracts.isCurrencyConversionContextV1(Object.create(fixture.context)), false);
  });

  test(`${name}: validates exact positive quotes and bounded canonical disclosure decimals`, () => {
    const rate = fixture.converted.rates[0];
    for (const field of ['sourceRate', 'targetRate', 'rate']) {
      for (const invalid of ['', '-1', '-0', '+1', '01', '1.', '.5', '1.00', '1e0', 'NaN', 'Infinity', ' 1', '1\n', 1, null])
        assert.equal(contracts.isCurrencyConversionRateV1({ ...rate, [field]: invalid }), false, `${field}: ${JSON.stringify(invalid)}`);
    }
    assert.equal(contracts.isCurrencyConversionRateV1({ ...rate, sourceRate: '0' }), false);
    assert.equal(contracts.isCurrencyConversionRateV1({ ...rate, targetRate: '0' }), false);
    assert.equal(contracts.isCurrencyConversionRateV1({ ...rate, rate: '0.123456789012345678' }), true);
    assert.equal(contracts.isCurrencyConversionRateV1({ ...rate, rate: '0.1234567890123456789' }), false);
    assert.equal(contracts.isCurrencyConversionRateV1({ ...rate, rate: '0' }), true, 'disclosure may round a tiny exact ratio to zero');
    assert.equal(contracts.isCurrencyConversionRateV1({ ...rate, sourceCurrency: 'EUR', sourceRate: '2' }), false);
    assert.equal(contracts.isCurrencyConversionRateV1({ ...rate, sourceRate: rate.targetRate, rate: '0.5' }), false);
    assert.equal(contracts.isCurrencyConversionRateV1({ ...rate, rawArtifact: 'private' }), false);
  });

  test(`${name}: rejects contradictory status, source ordering and target quotes`, () => {
    for (const mutate of [
      value => {
        value.status = 'partial';
      },
      value => {
        value.status = 'unchanged';
      },
      value => {
        value.rates = [];
      },
      value => {
        value.rates.push({ ...value.rates[0] });
      },
      value => {
        value.rates = new Array(1);
      },
      value => {
        value.rates[0].sourceCurrency = 'nzd';
      },
      value => {
        value.targetCurrency = 'EUR';
      },
      value => {
        value.rates[0].sourceCurrency = value.targetCurrency;
      },
      value => {
        value.internal = 'private';
      },
    ]) {
      const value = fresh().converted;
      mutate(value);
      assert.equal(contracts.isCurrencyConversionV1(value), false);
    }
    const mixed = fresh().mixed;
    assert.equal(contracts.isCurrencyConversionV1({ ...mixed, rates: [...mixed.rates].reverse() }), false);
    mixed.rates[1].targetRate = '1.2';
    assert.equal(contracts.isCurrencyConversionV1(mixed), false);
    const identity = fresh().unchanged;
    assert.equal(contracts.isCurrencyConversionV1({ ...identity, status: 'converted' }), false);
    identity.rates[0].rate = '2';
    assert.equal(contracts.isCurrencyConversionV1(identity), false);
  });

  test(`${name}: discovery requires unique sorted currencies, EUR and supported scale representation`, () => {
    const valid = fresh().discovery;
    for (const currencies of [
      [],
      [valid.currencies[1]],
      [...valid.currencies].reverse(),
      [valid.currencies[0], valid.currencies[0]],
      new Array(1),
      [{ code: 'EUR', minorUnitScale: -1 }],
      [{ code: 'EUR', minorUnitScale: 1.5 }],
      [{ code: 'EUR', minorUnitScale: Number.NaN }],
      [{ code: 'EUR', minorUnitScale: 5 }],
      [{ code: 'eur', minorUnitScale: 2 }],
      [{ code: 'EUR', minorUnitScale: '2' }],
      [{ code: 'EUR', minorUnitScale: 2, symbol: 'private' }],
    ])
      assert.equal(contracts.isCurrencyConversionDiscoveryV1({ ...valid, currencies }), false);
    assert.equal(contracts.isCurrencyConversionDiscoveryV1({ ...valid, targetCurrency: 'USD' }), false);
    assert.equal(contracts.isCurrencyConversionDiscoveryV1({ ...valid, rateDate: 'invalid' }), false);
  });

  test(`${name}: guards reject non-object wire values`, () => {
    for (const guard of ['isCurrencyConversionContextV1', 'isCurrencyConversionRateV1', 'isCurrencyConversionV1', 'isCurrencyConversionDiscoveryV1'])
      for (const value of [null, undefined, [], '', 1, true]) assert.equal(contracts[guard](value), false, guard);
  });
}
