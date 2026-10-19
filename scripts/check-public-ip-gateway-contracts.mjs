import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { test } from 'node:test';
const require = createRequire(import.meta.url);
const formats = { commonjs: require('../dist/index.js'), esm: await import('../dist/esm/entries/root.js') };
const ref = name => ({ id: `/fictional/gateway/${name}`, name, type: 'fictional/resource' });
const association = (scope = 'gateway', mode = 'prevention') => ({
  id: scope,
  scope,
  attachment: ref(scope === 'gateway' ? 'edge' : scope),
  basis: 'policy',
  policy: ref(`policy-${scope}`),
  enabled: true,
  mode,
  sourceIds: ['gateway', 'policies'],
  customAllowRuleCount: 0,
  exclusionCount: 0,
  managedRuleSetCount: 1,
});
const route = () => ({
  assessedAt: '2026-10-19T01:00:00.000Z',
  freshness: 'current',
  coverage: {
    status: 'complete',
    issues: [],
    sources: ['gateway', 'policies'].map(id => ({
      id,
      family: id,
      location: `${id}.json`,
      status: 'complete',
      observedAt: '2026-10-19T00:00:00.000Z',
    })),
  },
  gateway: ref('edge'),
  listener: { resource: ref('listener'), frontendIPConfiguration: ref('frontend'), protocol: 'https', port: 8443, hostNames: ['app.example.test'] },
  route: {
    kind: 'basic',
    routingRule: ref('rule'),
    priority: 100,
    urlPathMap: null,
    pathRule: null,
    pathRuleOrder: null,
    pathPatterns: [],
    rewriteRuleSet: null,
    pathReevaluation: 'disabled',
  },
  forwarding: {
    kind: 'backend',
    pool: ref('pool'),
    settings: ref('settings'),
    protocol: 'http',
    port: 8080,
    target: { kind: 'fqdn', hostname: 'backend.example.test' },
    sourceIds: ['gateway'],
  },
  waf: {
    state: 'prevention',
    associations: [association()],
    selectedAssociationId: 'gateway',
    sourceIds: ['gateway', 'policies'],
    incompleteReasons: [],
    omitted: { associations: 0 },
  },
  incompleteReasons: [],
  omitted: { hostNames: 0, pathPatterns: 0, sources: 0 },
});
for (const [format, api] of Object.entries(formats)) {
  test(`${format}: gateway guards are exported`, () => {
    assert.equal(typeof api.isPublicIpAddressesGatewayRouteEvaluation, 'function');
    assert.equal(typeof api.isPublicIpAddressesWafAssessment, 'function');
    assert.equal(Object.isFrozen(api.PUBLIC_IP_ADDRESSES_GATEWAY_ROUTE_LIMITS), true);
  });
  test(`${format}: backend configuration, empty pools and redirects stay distinct`, () => {
    const value = route();
    assert.equal(api.isPublicIpAddressesGatewayRouteEvaluation(value), true);
    for (const target of [
      { kind: 'ip_address', address: '10.0.0.4' },
      { kind: 'ip_address', address: '2001:db8::4' },
      { kind: 'resource', resource: ref('workload') },
    ]) {
      const copy = structuredClone(value);
      copy.forwarding.target = target;
      assert.equal(api.isPublicIpAddressesGatewayRouteEvaluation(copy), true);
    }
    value.forwarding = { kind: 'empty_backend_pool', pool: ref('empty'), settings: null, sourceIds: ['gateway'] };
    assert.equal(api.isPublicIpAddressesGatewayRouteEvaluation(value), true);
    value.forwarding = {
      kind: 'redirect',
      configuration: ref('redirect'),
      target: { kind: 'listener', listener: ref('tls') },
      statusCode: 301,
      includePath: true,
      includeQueryString: false,
      sourceIds: ['gateway'],
    };
    assert.equal(api.isPublicIpAddressesGatewayRouteEvaluation(value), true);
    value.forwarding.target = { kind: 'external', url: 'https://public.example.test/login' };
    assert.equal(api.isPublicIpAddressesGatewayRouteEvaluation(value), true);
  });
  test(`${format}: default/path match and effective WAF selection preserve overrides`, () => {
    const value = route();
    value.route = { ...value.route, kind: 'path', urlPathMap: ref('map'), pathRule: ref('path'), pathRuleOrder: 0, pathPatterns: ['/admin/*'] };
    value.waf.associations.push(association('listener', 'detection'), association('path', 'detection'));
    value.waf.state = 'detection';
    value.waf.selectedAssociationId = 'path';
    assert.equal(api.isPublicIpAddressesGatewayRouteEvaluation(value), true);
    assert.equal(api.isPublicIpAddressesWafAssessment(value.waf), true);
    value.route = { ...value.route, kind: 'default', pathRule: null, pathRuleOrder: null, pathPatterns: [] };
    value.waf.associations.pop();
    value.waf.selectedAssociationId = 'listener';
    assert.equal(api.isPublicIpAddressesGatewayRouteEvaluation(value), true);
  });
  test(`${format}: unknown higher policy never falls back to a known gateway policy`, () => {
    const value = route();
    value.coverage.status = 'partial';
    value.incompleteReasons = ['policy_not_collected'];
    value.waf.associations.push({ ...association('listener'), mode: 'unknown', enabled: null });
    value.waf.state = 'unverified';
    value.waf.selectedAssociationId = 'listener';
    value.waf.incompleteReasons = ['policy_not_collected'];
    assert.equal(api.isPublicIpAddressesGatewayRouteEvaluation(value), true);
    value.waf.state = 'prevention';
    value.waf.selectedAssociationId = 'gateway';
    assert.equal(api.isPublicIpAddressesGatewayRouteEvaluation(value), false);
  });
  test(`${format}: disabled, inline and absent WAF configuration remain distinct`, () => {
    const value = route();
    value.waf.state = 'disabled';
    value.waf.associations[0].enabled = false;
    assert.equal(api.isPublicIpAddressesGatewayRouteEvaluation(value), true);
    Object.assign(value.waf.associations[0], { basis: 'inline', policy: null });
    assert.equal(api.isPublicIpAddressesGatewayRouteEvaluation(value), true);
    value.waf.state = 'not_configured';
    value.waf.associations = [];
    value.waf.selectedAssociationId = null;
    assert.equal(api.isPublicIpAddressesGatewayRouteEvaluation(value), true);
    value.coverage.status = 'partial';
    value.incompleteReasons = ['associations_clipped'];
    value.waf.state = 'unverified';
    value.waf.omitted.associations = 1;
    value.waf.incompleteReasons = ['associations_clipped'];
    assert.equal(api.isPublicIpAddressesGatewayRouteEvaluation(value), true);
  });
  test(`${format}: wildcard listeners and literal IPv6 redirect targets are portable`, () => {
    const value = route();
    value.listener.hostNames = ['*.example.test', 'app-?.example.test'];
    value.forwarding = {
      kind: 'redirect',
      configuration: ref('redirect'),
      target: { kind: 'external', url: 'https://[2001:db8::4]:8443/login' },
      statusCode: 302,
      includePath: true,
      includeQueryString: false,
      sourceIds: ['gateway'],
    };
    assert.equal(api.isPublicIpAddressesGatewayRouteEvaluation(value), true);
    value.forwarding.target.url = 'https://[::ffff:192.0.2.1]/';
    assert.equal(api.isPublicIpAddressesGatewayRouteEvaluation(value), true);
  });
  for (const url of [
    'https://user:secret@example.test/',
    'https://example.test/?secret=value',
    'https://example.test/#secret',
    'javascript:alert(1)',
    'https://example.test:65536/',
    'https://[::::]/',
    'https://example.test\\@private.test/',
  ]) {
    test(`${format}: rejects unsafe or malformed external redirect ${url}`, () => {
      const value = route();
      value.forwarding = {
        kind: 'redirect',
        configuration: ref('redirect'),
        target: { kind: 'external', url },
        statusCode: 301,
        includePath: true,
        includeQueryString: false,
        sourceIds: ['gateway'],
      };
      assert.equal(api.isPublicIpAddressesGatewayRouteEvaluation(value), false);
    });
  }
  const invalid = {
    'redirect with backend pool': v => {
      v.forwarding.kind = 'redirect';
    },
    'unknown target kind': v => {
      v.forwarding.target.kind = 'virtual_machine';
    },
    'invalid IPv4': v => {
      v.forwarding.target = { kind: 'ip_address', address: '999.0.0.1' };
    },
    'invalid IPv6': v => {
      v.forwarding.target = { kind: 'ip_address', address: '::::' };
    },
    'host with credentials': v => {
      v.forwarding.target.hostname = 'user:secret@example.test';
    },
    'invalid port': v => {
      v.listener.port = 65536;
    },
    'zero backend port': v => {
      v.forwarding.port = 0;
    },
    'impossible timestamp': v => {
      v.assessedAt = '2026-02-30T01:00:00.000Z';
    },
    'future source timestamp': v => {
      v.coverage.sources[0].observedAt = '2026-10-20T01:00:00.000Z';
    },
    'duplicate source': v => {
      v.coverage.sources.push(v.coverage.sources[0]);
    },
    'dangling source': v => {
      v.forwarding.sourceIds = ['absent'];
    },
    'missing observation': v => {
      v.coverage.sources[0].observedAt = null;
    },
    'duplicate association': v => {
      v.waf.associations.push(v.waf.associations[0]);
    },
    'duplicate scope': v => {
      v.waf.associations.push({ ...v.waf.associations[0], id: 'another' });
    },
    'unknown selected association': v => {
      v.waf.selectedAssociationId = 'absent';
    },
    'wrong attachment': v => {
      v.waf.associations[0].attachment = ref('another');
    },
    'disabled prevention': v => {
      v.waf.associations[0].enabled = false;
    },
    'detection prevention': v => {
      v.waf.associations[0].mode = 'detection';
    },
    'inline listener': v => {
      Object.assign(v.waf.associations[0], { scope: 'listener', basis: 'inline', policy: null });
    },
    'omitted association': v => {
      v.waf.omitted.associations = 1;
    },
    'clipped hosts complete': v => {
      v.omitted.hostNames = 1;
    },
    'empty path patterns': v => {
      v.route.kind = 'path';
      v.route.urlPathMap = ref('map');
      v.route.pathRule = ref('path');
      v.route.pathRuleOrder = 0;
    },
    'missing default path map': v => {
      v.route.kind = 'default';
    },
    'negative path order': v => {
      v.route.pathRuleOrder = -1;
    },
    'unassessed rewrite complete': v => {
      v.route.pathReevaluation = 'unknown';
    },
    'missing reasons partial': v => {
      v.coverage.status = 'partial';
    },
    'oversized hosts': v => {
      v.listener.hostNames = Array(65).fill('app.example.test');
    },
    'sparse hosts': v => {
      v.listener.hostNames = Array(1);
    },
    'sparse sources': v => {
      v.coverage.sources = Array(1);
    },
    'sparse associations': v => {
      v.waf.associations = Array(1);
    },
    'unbounded nested extras': v => {
      v.listener.resource.credentials = 'secret';
    },
    'unbounded issue extras': v => {
      v.coverage.status = 'partial';
      v.incompleteReasons = ['partial'];
      v.coverage.issues = [{ code: 'gap', message: 'partial', arbitrary: { rawSecret: 'x'.repeat(1000000) } }];
    },
    'oversized path patterns': v => {
      v.route.pathPatterns = Array(65).fill('/admin/*');
    },
    'oversized sources': v => {
      v.coverage.sources = Array.from({ length: 33 }, (_, i) => ({ ...v.coverage.sources[0], id: `source-${i}` }));
    },
    'oversized associations': v => {
      v.waf.associations = Array.from({ length: 4 }, (_, i) => ({ ...v.waf.associations[0], id: `policy-${i}` }));
    },
    'sparse forwarding sources': v => {
      v.forwarding.sourceIds = Array(1);
    },
    'sparse WAF sources': v => {
      v.waf.associations[0].sourceIds = Array(1);
    },
  };
  for (const [name, change] of Object.entries(invalid))
    test(`${format}: rejects ${name}`, () => {
      const value = route();
      change(value);
      assert.equal(api.isPublicIpAddressesGatewayRouteEvaluation(value), false);
    });
  test(`${format}: partial/unavailable and historical evidence preserve uncertainty`, () => {
    const value = route();
    value.freshness = 'stale';
    assert.equal(api.isPublicIpAddressesGatewayRouteEvaluation(value), true);
    value.coverage = { status: 'unavailable', sources: [], issues: [] };
    value.freshness = 'unknown';
    value.forwarding = { kind: 'unresolved', reason: 'not_collected', pool: null, settings: null, target: null, sourceIds: [] };
    value.waf = {
      state: 'unverified',
      associations: [],
      selectedAssociationId: null,
      sourceIds: [],
      incompleteReasons: ['not_collected'],
      omitted: { associations: 0 },
    };
    value.incompleteReasons = ['not_collected'];
    assert.equal(api.isPublicIpAddressesGatewayRouteEvaluation(value), true);
  });
}
