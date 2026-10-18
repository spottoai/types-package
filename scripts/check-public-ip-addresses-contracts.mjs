import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { test } from 'node:test';

const require = createRequire(import.meta.url);
const formats = { commonjs: require('../dist/index.js'), esm: await import('../dist/esm/entries/root.js') };
const reference = name => ({ id: `/fictional/network/${name}`, name, type: 'fictional/filter' });
const range = (from = 443, to = from) => ({ value: from === to ? `${from}` : `${from}-${to}`, from, to });
const source = id => ({ id, family: 'network-filters', location: 'fictional-region', status: 'complete', observedAt: '2026-10-19T00:00:00.000Z' });
const decision = (access = 'deny') => ({
  level: 'nic',
  filter: reference('filter'),
  rule: reference('rule'),
  priority: 100,
  access,
  basis: 'rule',
  reasonCode: 'matching_inbound_rule',
  sourceIds: ['filters'],
});
const partition = (id = 'public-https', verdict = 'blocked') => ({
  id,
  sourceSelectors: [{ kind: 'ip_prefix', value: '0.0.0.0/0' }],
  sourcePortRanges: [range(0, 65535)],
  backendPortRanges: [range()],
  protocol: 'tcp',
  verdict,
  complete: true,
  decisions: [decision(verdict === 'allowed' ? 'allow' : 'deny')],
  incompleteReasons: [],
  omitted: { sourceSelectors: 0, sourcePortRanges: 0, backendPortRanges: 0, decisions: 0 },
});
const evaluation = () => ({
  verdict: 'blocked',
  assessedAt: '2026-10-19T00:01:00.000Z',
  freshness: 'current',
  exhaustive: true,
  coverage: { status: 'complete', sources: [source('filters')], issues: [] },
  partitions: [partition()],
  incompleteReasons: [],
  omitted: { partitions: 0, sources: 0 },
});
const service = () => ({
  id: 'https',
  label: 'HTTPS',
  category: 'web',
  basis: 'port',
  protocol: 'tcp',
  frontendPortRanges: [range()],
  backendPortRanges: [range(8443)],
});
const mutate = (factory, change) => {
  const value = factory();
  change(value);
  return value;
};

for (const [format, root] of Object.entries(formats)) {
  test(`${format}: new perimeter guards and wire bounds are exported`, () => {
    assert.equal(typeof root.isPublicIpAddressesNetworkAccessEvaluation, 'function');
    assert.equal(typeof root.isPerimeterServiceClassification, 'function');
    assert.deepEqual(root.PUBLIC_IP_ADDRESSES_NETWORK_ACCESS_LIMITS, {
      partitions: 64,
      selectors: 64,
      decisions: 8,
      sources: 32,
      reasons: 64,
      idLength: 2048,
      labelLength: 256,
      selectorLength: 2048,
      reasonLength: 512,
    });
    assert.ok(Object.isFrozen(root.PUBLIC_IP_ADDRESSES_NETWORK_ACCESS_LIMITS));
  });
  test(`${format}: accepts complete blocked and permitted subsets with honest partial coverage`, () => {
    const guard = root.isPublicIpAddressesNetworkAccessEvaluation;
    assert.equal(guard(evaluation()), true);
    const allowed = evaluation();
    allowed.verdict = 'allowed';
    allowed.partitions = [partition('allowed', 'allowed')];
    assert.equal(guard(allowed), true);
    allowed.coverage.status = 'partial';
    allowed.exhaustive = false;
    allowed.omitted.partitions = 3;
    allowed.incompleteReasons = ['partition_limit'];
    allowed.coverage.sources.push({ ...source('missing'), status: 'missing', observedAt: null, reason: 'not_collected' });
    assert.equal(guard(allowed), true);
    const unknown = evaluation();
    unknown.verdict = 'unverified';
    unknown.exhaustive = false;
    unknown.coverage.status = 'unavailable';
    unknown.coverage.sources = [];
    unknown.partitions = [];
    unknown.incompleteReasons = ['not_collected'];
    unknown.freshness = 'unknown';
    assert.equal(guard(unknown), true);
    const historical = evaluation();
    historical.verdict = 'allowed';
    historical.freshness = 'stale';
    historical.partitions = [partition('allowed', 'allowed')];
    assert.equal(guard(historical), true, 'a historical positive is retained; consumers must check freshness');
  });
  const invalid = {
    'partial blocked': v => {
      v.coverage.status = 'partial';
    },
    'stale blocked': v => {
      v.freshness = 'stale';
    },
    'expired blocked': v => {
      v.freshness = 'expired';
    },
    'nonexhaustive blocked': v => {
      v.exhaustive = false;
    },
    'clipped blocked': v => {
      v.omitted.partitions = 1;
    },
    'clipped source blocked': v => {
      v.omitted.sources = 1;
    },
    'clipped selector': v => {
      v.partitions[0].omitted.sourceSelectors = 1;
    },
    'clipped decision': v => {
      v.partitions[0].omitted.decisions = 1;
    },
    'empty blocked': v => {
      v.partitions = [];
    },
    'empty provenance': v => {
      v.coverage.sources = [];
    },
    'missing timestamp': v => {
      v.coverage.sources[0].observedAt = null;
    },
    'publication-only timestamp': v => {
      delete v.coverage.sources[0].observedAt;
    },
    'invalid timestamp': v => {
      v.coverage.sources[0].observedAt = '2026-02-30T00:00:00Z';
    },
    'future source': v => {
      v.coverage.sources[0].observedAt = '2026-10-19T00:02:00.000Z';
    },
    'timezone-free assessment': v => {
      v.assessedAt = '2026-10-19T00:01:00';
    },
    'invalid assessment': v => {
      v.assessedAt = 'nonsense';
    },
    'duplicate source': v => {
      v.coverage.sources.push({ ...v.coverage.sources[0] });
    },
    'duplicate partition': v => {
      v.partitions.push(structuredClone(v.partitions[0]));
    },
    'dangling source': v => {
      v.partitions[0].decisions[0].sourceIds = ['missing'];
    },
    'duplicate decision source': v => {
      v.partitions[0].decisions[0].sourceIds = ['filters', 'filters'];
    },
    'unobserved deciding source': v => {
      v.coverage.sources[0].status = 'partial';
    },
    'missing decision provenance': v => {
      v.partitions[0].decisions[0].sourceIds = [];
    },
    'contradictory blocked partition': v => {
      v.partitions[0].decisions[0].access = 'allow';
    },
    'contradictory allowed': v => {
      v.verdict = 'allowed';
    },
    'contradictory unknown': v => {
      v.verdict = 'unverified';
    },
    'incomplete partition': v => {
      v.partitions[0].complete = false;
    },
    'unknown selector': v => {
      v.partitions[0].sourceSelectors[0].kind = 'unknown';
    },
    'unknown protocol': v => {
      v.partitions[0].protocol = 'unknown';
    },
    'invalid protocol': v => {
      v.partitions[0].protocol = 'http';
    },
    'negative port': v => {
      v.partitions[0].backendPortRanges = [range(-1)];
    },
    'oversized port': v => {
      v.partitions[0].sourcePortRanges = [range(65536)];
    },
    'reversed ports': v => {
      v.partitions[0].backendPortRanges = [range(443, 80)];
    },
    'contradictory port text': v => {
      v.partitions[0].backendPortRanges[0].value = '3389';
    },
    'contradictory wildcard': v => {
      v.partitions[0].backendPortRanges[0].value = '*';
    },
    'fractional port': v => {
      v.partitions[0].backendPortRanges = [range(80.5)];
    },
    'null port bounds': v => {
      v.partitions[0].backendPortRanges = [{ value: '*', from: null, to: null }];
    },
    'empty selectors': v => {
      v.partitions[0].sourceSelectors = [];
    },
    'malformed resource': v => {
      v.partitions[0].decisions[0].rule.name = {};
    },
    'unbounded string': v => {
      v.partitions[0].sourceSelectors[0].value = 'a'.repeat(2049);
    },
    'too many partitions': v => {
      v.partitions = Array.from({ length: 65 }, (_, i) => partition(`${i}`));
    },
    'too many sources': v => {
      v.coverage.sources = Array.from({ length: 33 }, (_, i) => source(i === 0 ? 'filters' : `${i}`));
    },
    'too many selectors': v => {
      v.partitions[0].sourceSelectors = Array.from({ length: 65 }, () => ({ kind: 'ip_prefix', value: '0.0.0.0/0' }));
    },
    'too many ranges': v => {
      v.partitions[0].backendPortRanges = Array.from({ length: 65 }, () => range());
    },
    'too many decisions': v => {
      v.partitions[0].decisions = Array.from({ length: 9 }, () => decision());
    },
  };
  for (const [name, change] of Object.entries(invalid)) {
    test(`${format}: rejects ${name}`, () => assert.equal(root.isPublicIpAddressesNetworkAccessEvaluation(mutate(evaluation, change)), false));
  }
  test(`${format}: accepts maximum wire bounds, UTC seconds and complete resolved selectors`, () => {
    const value = evaluation();
    value.coverage.sources = Array.from({ length: 32 }, (_, i) => source(i === 0 ? 'filters' : `${i}`));
    value.partitions = Array.from({ length: 64 }, (_, i) => {
      const part = partition(`${i}`);
      part.sourceSelectors = Array.from({ length: 64 }, (_, j) => ({ kind: 'service_tag', value: `resolved-tag-${j}` }));
      part.sourcePortRanges = Array.from({ length: 64 }, () => ({ value: '*', from: 0, to: 65535 }));
      part.backendPortRanges = Array.from({ length: 64 }, (_, j) => range(j));
      part.decisions = Array.from({ length: 8 }, (_, index) => ({
        ...decision(),
        filter: reference(`filter-${index}`),
        sourceIds: value.coverage.sources.map(s => s.id),
      }));
      return part;
    });
    value.assessedAt = '2026-10-19T00:01:00Z';
    value.coverage.sources[0].observedAt = '2026-10-19T00:00:00Z';
    assert.equal(root.isPublicIpAddressesNetworkAccessEvaluation(value), true);
  });
  test(`${format}: rejects silent gaps and unavailable positive claims`, () => {
    const allowed = () => {
      const value = evaluation();
      value.verdict = 'allowed';
      value.partitions = [partition('allowed', 'allowed')];
      return value;
    };
    for (const change of [
      v => {
        v.exhaustive = false;
      },
      v => {
        v.coverage.status = 'unavailable';
      },
      v => {
        v.partitions[0].incompleteReasons = ['unknown_tag'];
      },
      v => {
        v.coverage.sources[0].status = 'missing';
        v.coverage.sources[0].observedAt = null;
        v.coverage.sources[0].reason = 'not_collected';
        v.coverage.status = 'partial';
      },
      v => {
        v.partitions[0].decisions.push(decision('deny'));
      },
    ]) {
      assert.equal(root.isPublicIpAddressesNetworkAccessEvaluation(mutate(allowed, change)), false);
    }
    const unknown = evaluation();
    unknown.verdict = 'unverified';
    unknown.exhaustive = false;
    unknown.incompleteReasons = ['unsupported_context'];
    unknown.coverage.status = 'partial';
    unknown.freshness = 'unknown';
    Object.assign(unknown.partitions[0], {
      verdict: 'unverified',
      complete: false,
      protocol: 'unknown',
      decisions: [],
      incompleteReasons: ['unsupported_context'],
    });
    unknown.partitions[0].sourceSelectors = [{ kind: 'unknown', value: 'unresolved' }];
    unknown.partitions[0].backendPortRanges = [{ value: 'unknown', from: null, to: null }];
    assert.equal(root.isPublicIpAddressesNetworkAccessEvaluation(unknown), true);
    unknown.omitted.partitions = 1;
    assert.equal(root.isPublicIpAddressesNetworkAccessEvaluation(unknown), true, 'explicitly clipped unknown evidence is retained');
  });
  test(`${format}: rejects multiple first-match decisions for the same filter instance`, () => {
    for (const access of ['allow', 'deny']) {
      const value = evaluation();
      value.partitions[0].decisions.unshift({ ...decision(access), priority: 50 });
      assert.equal(root.isPublicIpAddressesNetworkAccessEvaluation(value), false);
    }
    const platform = evaluation();
    platform.partitions[0].decisions = Array.from({ length: 2 }, () => ({
      ...decision(),
      level: 'platform',
      filter: null,
      rule: null,
      priority: null,
      basis: 'platform_default',
    }));
    assert.equal(root.isPublicIpAddressesNetworkAccessEvaluation(platform), false);
    const distinctLevels = evaluation();
    distinctLevels.partitions[0].decisions.unshift({ ...decision('allow'), level: 'subnet' });
    assert.equal(root.isPublicIpAddressesNetworkAccessEvaluation(distinctLevels), true, 'same native filter can be attached at two distinct levels');
  });
  test(`${format}: rejects sparse arrays and malformed plain values without throwing`, () => {
    for (const value of [undefined, null, false, 0, 'blocked', [], {}]) {
      assert.equal(root.isPublicIpAddressesNetworkAccessEvaluation(value), false);
      assert.equal(root.isPerimeterServiceClassification(value), false);
    }
    for (const change of [
      v => {
        v.partitions = new Array(1);
      },
      v => {
        v.coverage.sources = new Array(1);
      },
      v => {
        v.partitions[0].decisions = new Array(1);
      },
      v => {
        v.partitions[0].sourceSelectors = new Array(1);
      },
      v => {
        v.partitions[0].backendPortRanges = new Array(1);
      },
      v => {
        v.partitions[0].decisions[0].sourceIds = new Array(1);
      },
    ]) {
      assert.equal(root.isPublicIpAddressesNetworkAccessEvaluation(mutate(evaluation, change)), false);
    }
    assert.equal(
      root.isPerimeterServiceClassification(
        mutate(service, v => {
          v.frontendPortRanges = new Array(1);
        })
      ),
      false
    );
  });
  test(`${format}: validates service hints and public/backend provenance`, () => {
    assert.equal(root.isPerimeterServiceClassification(service()), true);
    for (const change of [
      v => {
        v.category = 'verified_app';
      },
      v => {
        v.basis = 'live_probe';
      },
      v => {
        v.backendPortRanges = [range(65536)];
      },
      v => {
        v.frontendPortRanges = null;
        v.backendPortRanges = null;
      },
      v => {
        v.label = {};
      },
      v => {
        v.id = '';
      },
    ]) {
      assert.equal(root.isPerimeterServiceClassification(mutate(service, change)), false);
    }
    assert.equal(root.isPerimeterServiceClassification(null), false);
    assert.equal(root.isPublicIpAddressesNetworkAccessEvaluation(null), false);
  });
}
