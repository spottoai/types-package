import assert from 'node:assert/strict';
import {
  REGULATORY_COMPLIANCE_SCOREBOARD_SCHEMA_VERSION as schemaVersion,
  REGULATORY_COMPLIANCE_SCOREBOARD_HISTORY_SCHEMA_VERSION as historyVersion,
  deriveControlOutcomeCounts, mergeRegulatoryControlOutcome, mergeRegulatoryScoreboardStandards,
  toMergeableRegulatoryScoreboardStandard, classifyRegulatoryScoreboardEvidence,
  mergeRegulatoryScoreboardTrend, toRegulatoryScoreboardTrendSeries,
  listRegulatoryScoreboardTrendDates, buildRegulatoryScoreboardHistoryPath,
  isRegulatoryComplianceScoreboardSubscription, isRegulatoryComplianceScoreboardHistory,
  isRegulatoryReportComparisonIdentities, RegulatoryScoreboardOverlappingSubscriptionsError,
} from '../dist/index.js';

const first = '11111111-1111-1111-1111-111111111111';
const second = '22222222-2222-2222-2222-222222222222';
const basis = 'a'.repeat(64);
const complete = { state: 'complete', sources: ['resourceGraph'] };
const control = (controlKey, outcome, extra = {}) => ({ controlKey, displayName: controlKey, outcome, policyEvidence: [], ...extra });
const standard = (controls, extra = {}) => ({ standardKey: 'mcsb', standardFamilyKey: 'mcsb', displayName: 'MCSB', source: 'azurePolicy', assessmentBasisKey: basis, assignments: [], controls, counts: deriveControlOutcomeCounts(controls), ...extra });
const scoreboard = (standards, coverage = { policy: complete, defender: complete }) => ({ schemaVersion, subscriptionId: first, generatedAt: '2026-10-03T00:00:00Z', observedAt: '2026-10-03T00:00:00Z', managementGroupPath: [], coverage, omittedStandardKeys: [], standards });
const one = toMergeableRegulatoryScoreboardStandard(first, standard([control('ns-1','passed'), control('ns-2','failed',{ failingResourceCount: 3 })], { failingResourceCount: 3 }));
const two = toMergeableRegulatoryScoreboardStandard(second, standard([control('ns-1','failed'), control('ns-3','notAssessed',{ notAssessedReason:'manual' })]));
const merged = mergeRegulatoryScoreboardStandards([two, one])[0];
assert.deepEqual(merged.counts, { passed:0, failed:2, notAssessed:1, assessed:2, total:3 });
assert.equal(merged.failingResourceCount,3);
assert.equal(merged.failingResourceCountIsMinimum,true);
assert.deepEqual(merged.subscriptions.map(row=>row.subscriptionId),[first,second]);
assert.equal(merged.controls.some(row=>'policyEvidence' in row),false);
assert.throws(()=>mergeRegulatoryScoreboardStandards([merged,one]),RegulatoryScoreboardOverlappingSubscriptionsError);
assert.deepEqual(mergeRegulatoryControlOutcome([{outcome:'notAssessed',notAssessedReason:'manual'},{outcome:'notAssessed',notAssessedReason:'noPolicies'}]),{outcome:'notAssessed',notAssessedReason:'noPolicies'});
assert.deepEqual(classifyRegulatoryScoreboardEvidence(scoreboard([])),{state:'loaded',absenceEstablished:true,partialSources:[]});
const failed = { state:'unavailable', sources:[] };
assert.equal(classifyRegulatoryScoreboardEvidence(scoreboard([],{policy:failed,defender:failed})).state,'unavailable');
assert.equal(classifyRegulatoryScoreboardEvidence(scoreboard([standard([control('ns-1','passed')])],{policy:complete,defender:failed})).state,'partial');
const valid = scoreboard([standard([control('ns-1','passed')])]);
assert.equal(isRegulatoryComplianceScoreboardSubscription(valid),true);
for(const mutate of [s=>s.standards[0].counts.passed++,s=>s.standards[0].controls.push(s.standards[0].controls[0]),s=>s.standards[0].failingResourceCountIsMinimum=true,s=>s.standards[0].controls[0].policyEvidence.push({assignmentKey:'missing',policyControlKey:'ns',outcome:'failed'})]){
 const invalid=structuredClone(valid); mutate(invalid); assert.equal(isRegulatoryComplianceScoreboardSubscription(invalid),false);
}
const history = (id, days) => ({ schemaVersion:historyVersion, subscriptionId:id, month:'2026-10', days });
const observation=(date,outcome,extra={})=>({date,observedAt:date+'T00:00:00Z',evidenceState:'complete',omittedStandardKeys:[],standards:[{standardKey:'mcsb',source:'azurePolicy',assessmentBasisKey:basis,passedControlKeys:outcome==='passed'?['ns-1']:[],failedControlKeys:outcome==='failed'?['ns-1']:[],notAssessedControlKeys:[],...extra}]});
const a=toRegulatoryScoreboardTrendSeries([history(first,[observation('2026-10-01','failed')])],'mcsb');
const b=toRegulatoryScoreboardTrendSeries([history(second,[observation('2026-10-04','passed'),observation('2026-10-05','passed')])],'mcsb');
const dates=listRegulatoryScoreboardTrendDates('2026-10-05',5);
const flat=mergeRegulatoryScoreboardTrend([a,b],dates);
assert.equal(flat.find(row=>row.date==='2026-10-04').counts.failed,1,'three-day freshness boundary');
assert.equal(flat.find(row=>row.date==='2026-10-05').counts.passed,1,'four-day expiry');
assert.equal(flat.find(row=>row.date==='2026-10-05').comparisonState,'coverageChanged');
assert.deepEqual(mergeRegulatoryScoreboardTrend([...([a]),...([b])],dates),flat,'chunk/hierarchy concatenate originals');
const reset=toRegulatoryScoreboardTrendSeries([history(first,[observation('2026-10-01','failed'),{date:'2026-10-02',observedAt:'2026-10-02T00:00:00Z',evidenceState:'unavailable',omittedStandardKeys:[],standards:[]}])],'mcsb');
assert.equal(mergeRegulatoryScoreboardTrend([reset],dates)[1].counts,undefined,'failed scan blocks carry-forward');
const change=toRegulatoryScoreboardTrendSeries([history(first,[observation('2026-10-01','failed'),observation('2026-10-02','passed',{source:'defenderForCloud',assessmentBasisKey:'b'.repeat(64)})])],'mcsb');
assert.equal(mergeRegulatoryScoreboardTrend([change],dates)[1].comparisonState,'basisChanged');
assert.throws(()=>mergeRegulatoryScoreboardTrend([a,a],dates),RegulatoryScoreboardOverlappingSubscriptionsError);
assert.equal(isRegulatoryComplianceScoreboardHistory(history(first,[observation('2026-10-01','failed')])),true);
const overlap=observation('2026-10-01','failed'); overlap.standards[0].passedControlKeys=['ns-1'];
assert.equal(isRegulatoryComplianceScoreboardHistory(history(first,[overlap])),false);
assert.throws(()=>listRegulatoryScoreboardTrendDates('2026-02-30',30));
assert.throws(()=>buildRegulatoryScoreboardHistoryPath('../escape','2026-10'));
assert.equal(buildRegulatoryScoreboardHistoryPath(first,'2026-10'),`subscriptions/${first}/history/regulatory-compliance/month_2026-10.json.gz`);
const pair={regulatoryFailingControlKeys:{rows:['mcsb:ns-1'],totalCount:1,omittedCount:0},regulatoryComparisonBasis:{evidenceComplete:true,standards:[{standardKey:'mcsb',source:'azurePolicy',assessmentBasisKey:basis}]}};
assert.equal(isRegulatoryReportComparisonIdentities(pair),true);
assert.equal(isRegulatoryReportComparisonIdentities({}),true);
assert.equal(isRegulatoryReportComparisonIdentities({regulatoryFailingControlKeys:pair.regulatoryFailingControlKeys}),false);
assert.equal(isRegulatoryReportComparisonIdentities({...pair,regulatoryFailingControlKeys:{rows:['mcsb:ns-1'],totalCount:2,omittedCount:1}}),false);
console.log('Regulatory scoreboard contracts: merge, coverage, original trends, resets, guards and atomic report baselines passed.');
