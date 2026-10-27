import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { test } from 'node:test';

const require = createRequire(import.meta.url);
const formats = { commonjs: require('../dist/index.js'), esm: await import('../dist/esm/entries/root.js') };
const skuId = '00000000-0000-4000-8000-00000000a001';
const accountId = '00000000-0000-4000-8000-00000000a003';
const scope = { companyId: 'company-one', tenantId: 'tenant-one' };
const attribution = { updatedAt: '2026-10-27T01:02:03.000Z', updatedBy: 'Manager One' };
const input = () => ({ strategy: 'contain', notes: 'Pilot project.\nReview before renewal.', reviewOn: '2027-02-28' });
const product = () => ({ skuId, ...input(), ...attribution });
const account = () => ({ accountId, notes: 'Temporary absence.', ...attribution });
const document = () => ({ schemaVersion: 'microsoft-365-license-context/v1', ...scope, products: [product()] });
const accountDocument = () => ({ schemaVersion: 'microsoft-365-account-context/v1', ...scope, accountId, context: account() });
const compact = () => {
  const { notes, ...row } = product();
  return { ...row, hasNotes: notes.length > 0 };
};

for (const [format, api] of Object.entries(formats)) {
  test(`${format}: exports the subject-only contracts, with no summary pipeline extension`, () => {
    for (const name of [
      'isMicrosoft365LicenseStrategy',
      'isMicrosoft365ProductContextInput',
      'isMicrosoft365AccountContextInput',
      'isMicrosoft365ProductContext',
      'isMicrosoft365AccountContext',
      'isMicrosoft365ProductContextDocument',
      'isMicrosoft365AccountContextDocument',
      'isMicrosoft365ProductContextResponse',
      'isMicrosoft365AccountContextResponse',
      'isMicrosoft365ProductContextCollectionResponse',
      'isMicrosoft365ProductContextSummary',
    ])
      assert.equal(typeof api[name], 'function', name);
    for (const removed of [
      'isMicrosoft365LicensePlanTiming',
      'isMicrosoft365LicensingContextProjection',
      'isMicrosoft365LicenseSummaryWithContext',
      'MICROSOFT365_LICENSE_CONTEXT_VERSION',
    ])
      assert.equal(api[removed], undefined, removed);
  });

  test(`${format}: complete preview inputs accept only the supported fields`, () => {
    assert.equal(api.isMicrosoft365ProductContextInput(input()), true);
    assert.equal(api.isMicrosoft365ProductContextInput({ strategy: null, notes: '', reviewOn: null }), true);
    assert.equal(api.isMicrosoft365ProductContextInput({ ...input(), notes: '  preserved\nparagraphs  ' }), true);
    assert.equal(api.isMicrosoft365AccountContextInput({ notes: '' }), true);
    for (const extra of [
      { owner: 'Person' },
      { timing: { kind: 'renewal' } },
      { replacementSkuId: skuId },
      { updatedBy: 'Forged' },
      { revision: 'old' },
      { companyId: 'another' },
      { skuId },
      { currency: 'USD' },
      { kept: true },
    ])
      assert.equal(api.isMicrosoft365ProductContextInput({ ...input(), ...extra }), false);
    assert.equal(api.isMicrosoft365AccountContextInput({ notes: 'note', reviewOn: '2027-01-01' }), false);
    for (const key of Object.keys(input())) {
      const missing = input();
      delete missing[key];
      assert.equal(api.isMicrosoft365ProductContextInput(missing), false, key);
    }
  });

  test(`${format}: strategy and date guards preserve explicit intent and local-calendar dates`, () => {
    for (const strategy of ['encourage', 'contain', 'exit']) assert.equal(api.isMicrosoft365LicenseStrategy(strategy), true);
    for (const strategy of ['replace', 'active', 'Contain', null, undefined]) assert.equal(api.isMicrosoft365LicenseStrategy(strategy), false);
    for (const reviewOn of ['2028-02-29', '2020-01-01']) assert.equal(api.isMicrosoft365ProductContextInput({ ...input(), reviewOn }), true);
    for (const reviewOn of ['2027-02-29', '2026-04-31', '2026-13-01', '2026-01-01T00:00:00Z', undefined])
      assert.equal(api.isMicrosoft365ProductContextInput({ ...input(), reviewOn }), false);
  });

  test(`${format}: normalized entries carry attribution for all viewers and enforce identity`, () => {
    assert.equal(api.isMicrosoft365ProductContext(product()), true);
    assert.equal(api.isMicrosoft365AccountContext(account()), true);
    for (const patch of [
      { notes: ' not normalized ' },
      { skuId: skuId.toUpperCase() },
      { skuId: '../sku' },
      { updatedBy: null },
      { updatedBy: '' },
      { updatedBy: undefined },
      { updatedAt: '2026-02-30T01:02:03.000Z' },
      { updatedAt: '2026-10-27' },
    ])
      assert.equal(api.isMicrosoft365ProductContext({ ...product(), ...patch }), false);
    assert.equal(api.isMicrosoft365AccountContext({ ...account(), accountId: 'person@example.test' }), false);
  });

  test(`${format}: stored envelopes bind company, tenant and account and retain cleared state`, () => {
    assert.equal(api.isMicrosoft365ProductContextDocument(document(), scope), true);
    assert.equal(api.isMicrosoft365ProductContextDocument({ ...document(), products: [] }, scope), true);
    for (const expected of [
      { ...scope, tenantId: 'another' },
      { ...scope, companyId: 'another' },
    ])
      assert.equal(api.isMicrosoft365ProductContextDocument(document(), expected), false);
    assert.equal(api.isMicrosoft365ProductContextDocument({ ...document(), products: [product(), product()] }), false);
    assert.equal(api.isMicrosoft365ProductContextDocument({ ...document(), revision: 'internal-only' }), false);
    assert.equal(api.isMicrosoft365ProductContextDocument({ ...document(), schemaVersion: 'v2' }), false);
    assert.equal(api.isMicrosoft365AccountContextDocument(accountDocument(), { ...scope, accountId }), true);
    assert.equal(api.isMicrosoft365AccountContextDocument({ ...accountDocument(), context: null }, { ...scope, accountId }), true);
    assert.equal(api.isMicrosoft365AccountContextDocument(accountDocument(), { ...scope, accountId: skuId }), false);
    assert.equal(api.isMicrosoft365AccountContextDocument({ ...accountDocument(), context: { ...account(), accountId: skuId } }), false);
  });

  test(`${format}: character, count, sparse-array and UTF-8 storage bounds are enforced`, () => {
    assert.equal(api.isMicrosoft365ProductContextInput({ ...input(), notes: 'n'.repeat(4000) }), true);
    assert.equal(api.isMicrosoft365ProductContextInput({ ...input(), notes: 'n'.repeat(4001) }), false);
    assert.equal(api.isMicrosoft365AccountContextInput({ notes: 'n'.repeat(4001) }), false);
    const rows = count =>
      Array.from({ length: count }, (_, index) => ({
        ...product(),
        skuId: `10000000-0000-4000-8000-${index.toString(16).padStart(12, '0')}`,
        notes: '',
      }));
    assert.equal(api.isMicrosoft365ProductContextDocument({ ...document(), products: rows(1000) }), true);
    assert.equal(api.isMicrosoft365ProductContextDocument({ ...document(), products: rows(1001) }), false);
    assert.equal(api.isMicrosoft365ProductContextDocument({ ...document(), products: Array(1) }), false);
    for (const note of ['界'.repeat(4000), '\u0000'.repeat(4000)]) {
      const oversized = { ...document(), products: rows(100).map(row => ({ ...row, notes: note })) };
      assert.ok(Buffer.byteLength(JSON.stringify(oversized)) > 1024 * 1024);
      assert.equal(api.isMicrosoft365ProductContextDocument(oversized), false);
    }
  });

  test(`${format}: compact metadata remains readable near the stored-document byte limit`, () => {
    const stored = {
      ...document(),
      products: Array.from({ length: 1000 }, (_, index) => ({
        ...product(),
        skuId: `10000000-0000-4000-8000-${index.toString(16).padStart(12, '0')}`,
        notes: '',
        updatedBy: 'actor',
      })),
    };
    let remaining = 1024 * 1024 - Buffer.byteLength(JSON.stringify(stored));
    for (const row of stored.products) {
      const count = Math.min(250, Math.floor((remaining + 5) / 6));
      if (count < 1) break;
      row.updatedBy = '\u0000'.repeat(count);
      remaining -= 6 * count - 5;
    }
    const collection = {
      tenantId: stored.tenantId,
      products: stored.products.map(({ notes, ...row }) => ({ ...row, hasNotes: false })),
    };
    assert.ok(Buffer.byteLength(JSON.stringify(collection)) > 1024 * 1024);
    assert.equal(api.isMicrosoft365ProductContextDocument(stored), true);
    assert.equal(api.isMicrosoft365ProductContextCollectionResponse(collection), true);
  });

  test(`${format}: subject responses have no client revision and return clear or absent as null`, () => {
    const response = { tenantId: scope.tenantId, context: product() };
    assert.equal(api.isMicrosoft365ProductContextResponse(response), true);
    assert.equal(api.isMicrosoft365ProductContextResponse({ ...response, context: null }), true);
    assert.equal(api.isMicrosoft365AccountContextResponse({ ...response, context: account() }), true);
    assert.equal(api.isMicrosoft365AccountContextResponse({ ...response, context: null }), true);
    assert.equal(api.isMicrosoft365ProductContextResponse({ ...response, revision: 'etag' }), false);
    assert.equal(api.isMicrosoft365AccountContextResponse(response), false);
    assert.equal(api.isMicrosoft365ProductContextResponse({ ...response, tenantId: '../tenant' }), false);
  });

  test(`${format}: collection is compact and includes shared attribution but no note bodies`, () => {
    const response = { tenantId: scope.tenantId, products: [compact()] };
    assert.equal(api.isMicrosoft365ProductContextCollectionResponse(response), true);
    assert.equal(api.isMicrosoft365ProductContextSummary(compact()), true);
    assert.equal(api.isMicrosoft365ProductContextCollectionResponse({ ...response, products: [] }), true);
    for (const products of [
      [product()],
      [{ ...compact(), notes: 'Private body' }],
      [compact(), compact()],
      Array(1),
      [{ ...compact(), updatedBy: null }],
      [{ ...compact(), hasNotes: 'yes' }],
    ])
      assert.equal(api.isMicrosoft365ProductContextCollectionResponse({ ...response, products }), false);
    assert.equal(api.isMicrosoft365ProductContextCollectionResponse({ ...response, revision: 'etag' }), false);
  });
}
