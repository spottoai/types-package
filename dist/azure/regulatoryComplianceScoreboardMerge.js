"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegulatoryScoreboardOverlappingSubscriptionsError = void 0;
exports.deriveControlOutcomeCounts = deriveControlOutcomeCounts;
exports.mergeRegulatoryControlOutcome = mergeRegulatoryControlOutcome;
exports.mergeRegulatoryScoreboardControls = mergeRegulatoryScoreboardControls;
exports.toMergeableRegulatoryScoreboardStandard = toMergeableRegulatoryScoreboardStandard;
exports.mergeRegulatoryScoreboardStandards = mergeRegulatoryScoreboardStandards;
exports.classifyRegulatoryScoreboardEvidence = classifyRegulatoryScoreboardEvidence;
exports.toRegulatoryScoreboardTrendSeries = toRegulatoryScoreboardTrendSeries;
exports.isRegulatoryScoreboardDate = isRegulatoryScoreboardDate;
exports.listRegulatoryScoreboardTrendDates = listRegulatoryScoreboardTrendDates;
exports.mergeRegulatoryScoreboardTrend = mergeRegulatoryScoreboardTrend;
exports.buildRegulatoryScoreboardHistoryRelativePath = buildRegulatoryScoreboardHistoryRelativePath;
exports.buildRegulatoryScoreboardHistoryPath = buildRegulatoryScoreboardHistoryPath;
exports.toRegulatoryFailingControlIdentity = toRegulatoryFailingControlIdentity;
const regulatoryComplianceScoreboard_1 = require("./regulatoryComplianceScoreboard");
const compare = (left, right) => (left < right ? -1 : left > right ? 1 : 0);
class RegulatoryScoreboardOverlappingSubscriptionsError extends Error {
    constructor(subscriptionId) {
        super(`Overlapping regulatory scoreboard subscription: ${subscriptionId}`);
        this.subscriptionId = subscriptionId;
        this.name = 'RegulatoryScoreboardOverlappingSubscriptionsError';
    }
}
exports.RegulatoryScoreboardOverlappingSubscriptionsError = RegulatoryScoreboardOverlappingSubscriptionsError;
function deriveControlOutcomeCounts(controls) {
    const result = { passed: 0, failed: 0, notAssessed: 0, assessed: 0, total: controls.length };
    for (const control of controls)
        result[control.outcome]++;
    result.assessed = result.passed + result.failed;
    return result;
}
function mergeRegulatoryControlOutcome(inputs) {
    if (inputs.some(input => input.outcome === 'failed'))
        return { outcome: 'failed' };
    if (inputs.some(input => input.outcome === 'passed'))
        return { outcome: 'passed' };
    const reasons = regulatoryComplianceScoreboard_1.REGULATORY_NOT_ASSESSED_REASONS.map(reason => ({ reason, count: inputs.filter(input => input.notAssessedReason === reason).length }));
    reasons.sort((left, right) => right.count - left.count);
    return { outcome: 'notAssessed', notAssessedReason: reasons[0].count ? reasons[0].reason : 'notEvaluated' };
}
function sumKnownCounts(inputs, key) {
    const known = inputs.filter(input => typeof input[key] === 'number');
    if (!known.length)
        return {};
    const minimumKey = `${key}IsMinimum`;
    return {
        [key]: known.reduce((sum, input) => sum + input[key], 0),
        ...(known.length < inputs.length || known.some(input => input[minimumKey] === true) ? { [minimumKey]: true } : {}),
    };
}
function mergeRegulatoryScoreboardControls(inputs) {
    const byKey = new Map();
    for (const controls of inputs) {
        for (const control of controls) {
            const originals = byKey.get(control.controlKey) ?? [];
            originals.push(control);
            byKey.set(control.controlKey, originals);
        }
    }
    return [...byKey].sort(([left], [right]) => compare(left, right)).map(([controlKey, controls]) => ({
        controlKey,
        displayName: controls.find(control => control.displayName)?.displayName ?? controlKey,
        ...(controls.find(control => control.domain)?.domain ? { domain: controls.find(control => control.domain)?.domain } : {}),
        ...mergeRegulatoryControlOutcome(controls),
        ...sumKnownCounts(controls.map(control => ({ ...control })), 'failingResourceCount'),
    }));
}
function toMergeableRegulatoryScoreboardStandard(subscriptionId, standard) {
    const { standardKey, standardFamilyKey, displayName, definitionId } = standard;
    const resourceCounts = {
        ...(standard.failingResourceCount === undefined ? {} : { failingResourceCount: standard.failingResourceCount, failingResourceCountIsMinimum: standard.failingResourceCountIsMinimum }),
        ...(standard.exemptResourceCount === undefined ? {} : { exemptResourceCount: standard.exemptResourceCount, exemptResourceCountIsMinimum: standard.exemptResourceCountIsMinimum }),
        ...(standard.activeExemptionCount === undefined ? {} : { activeExemptionCount: standard.activeExemptionCount, activeExemptionCountIsMinimum: standard.activeExemptionCountIsMinimum }),
    };
    return {
        standardKey, standardFamilyKey, displayName, ...(definitionId ? { definitionId } : {}),
        sources: [standard.source], ...resourceCounts,
        controls: standard.controls.map(({ policyEvidence: _evidence, ...control }) => control),
        subscriptions: [{ subscriptionId: subscriptionId.toLowerCase(), counts: { ...standard.counts }, source: standard.source,
                assessmentBasisKey: standard.assessmentBasisKey, assignments: standard.assignments.map(assignment => ({ ...assignment })),
                ...(standard.failingResourceCount === undefined ? {} : { failingResourceCount: standard.failingResourceCount, failingResourceCountIsMinimum: standard.failingResourceCountIsMinimum }),
            }],
    };
}
function mergeRegulatoryScoreboardStandards(inputs) {
    const groups = new Map();
    for (const input of inputs)
        groups.set(input.standardKey, [...(groups.get(input.standardKey) ?? []), input]);
    return [...groups].sort(([left], [right]) => compare(left, right)).map(([standardKey, unsorted]) => {
        const sorted = [...unsorted].sort((left, right) => compare([...left.subscriptions].map(row => row.subscriptionId).sort(compare)[0] ?? '', [...right.subscriptions].map(row => row.subscriptionId).sort(compare)[0] ?? ''));
        const subscriptions = sorted.flatMap(input => input.subscriptions).map(row => ({ ...row, subscriptionId: row.subscriptionId.toLowerCase() })).sort((left, right) => compare(left.subscriptionId, right.subscriptionId));
        const seen = new Set();
        for (const row of subscriptions) {
            if (seen.has(row.subscriptionId))
                throw new RegulatoryScoreboardOverlappingSubscriptionsError(row.subscriptionId);
            seen.add(row.subscriptionId);
        }
        const controls = mergeRegulatoryScoreboardControls(sorted.map(input => input.controls));
        const sourceSet = new Set(sorted.flatMap(input => input.sources));
        return {
            standardKey,
            standardFamilyKey: sorted.find(input => input.standardFamilyKey)?.standardFamilyKey ?? standardKey,
            displayName: sorted.find(input => input.displayName)?.displayName ?? standardKey,
            ...(sorted.find(input => input.definitionId)?.definitionId ? { definitionId: sorted.find(input => input.definitionId)?.definitionId } : {}),
            sources: regulatoryComplianceScoreboard_1.REGULATORY_SCORE_SOURCES.filter(source => sourceSet.has(source)),
            controls, counts: deriveControlOutcomeCounts(controls), subscriptions, subscriptionCount: subscriptions.length,
            ...sumKnownCounts(sorted.map(input => ({ ...input })), 'failingResourceCount'),
            ...sumKnownCounts(sorted.map(input => ({ ...input })), 'exemptResourceCount'),
            ...sumKnownCounts(sorted.map(input => ({ ...input })), 'activeExemptionCount'),
        };
    });
}
function classifyRegulatoryScoreboardEvidence(scoreboard) {
    const partialSources = regulatoryComplianceScoreboard_1.REGULATORY_SCORE_SOURCES.filter(source => scoreboard.coverage[source === 'azurePolicy' ? 'policy' : 'defender'].state !== 'complete');
    const absenceEstablished = partialSources.length === 0 && scoreboard.omittedStandardKeys.length === 0 && scoreboard.standards.length === 0;
    return {
        state: scoreboard.standards.length === 0 && !absenceEstablished ? 'unavailable' : partialSources.length > 0 || scoreboard.omittedStandardKeys.length > 0 ? 'partial' : 'loaded',
        absenceEstablished, partialSources,
    };
}
function toRegulatoryScoreboardTrendSeries(histories, standardKey) {
    if (!histories.length)
        throw new Error('At least one original history is required');
    const subscriptionId = histories[0].subscriptionId.toLowerCase();
    const days = new Map();
    for (const history of histories) {
        if (history.subscriptionId.toLowerCase() !== subscriptionId)
            throw new Error('History subscription scope mismatch');
        for (const day of history.days) {
            const standard = day.standards.find(row => row.standardKey === standardKey);
            const snapshot = {
                date: day.date, observedAt: day.observedAt,
                ...(day.evidenceState === 'unavailable' || day.omittedStandardKeys.includes(standardKey)
                    ? { kind: 'unavailable' }
                    : standard ? { kind: 'observed', evidenceState: day.evidenceState, standard }
                        : { kind: day.evidenceState === 'complete' ? 'notReported' : 'unavailable' }),
            };
            const previous = days.get(day.date);
            if (!previous || Date.parse(previous.observedAt) < Date.parse(day.observedAt))
                days.set(day.date, snapshot);
        }
    }
    return { subscriptionId, snapshots: [...days.values()].sort((left, right) => compare(left.date, right.date)) };
}
function isRegulatoryScoreboardDate(value) {
    return /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(`${value}T00:00:00Z`)) && new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;
}
function listRegulatoryScoreboardTrendDates(endDate, days) {
    if (!isRegulatoryScoreboardDate(endDate) || !Number.isInteger(days) || days < 1 || days > 90)
        throw new Error('Invalid regulatory trend date/window');
    return Array.from({ length: days }, (_, index) => new Date(Date.parse(`${endDate}T00:00:00Z`) - (days - index - 1) * 86400000).toISOString().slice(0, 10));
}
function mergeRegulatoryScoreboardTrend(series, dates) {
    const seen = new Set();
    for (const input of series) {
        const id = input.subscriptionId.toLowerCase();
        if (seen.has(id))
            throw new RegulatoryScoreboardOverlappingSubscriptionsError(id);
        seen.add(id);
    }
    if (dates.some(date => !isRegulatoryScoreboardDate(date)))
        throw new Error('Invalid regulatory trend date');
    const requested = new Set(dates);
    const originals = series.map(input => ({ ...input, subscriptionId: input.subscriptionId.toLowerCase(), snapshots: [...input.snapshots].sort((left, right) => compare(left.date, right.date)) }));
    const eventDates = [...new Set(originals.flatMap(input => input.snapshots.map(snapshot => snapshot.date)))].sort(compare);
    let previous;
    const result = [];
    for (const date of eventDates) {
        if (dates.length && date > dates[dates.length - 1])
            break;
        const contributors = [];
        for (const input of originals) {
            const snapshot = [...input.snapshots].reverse().find(row => row.date <= date);
            if (snapshot?.kind === 'observed' && (Date.parse(`${date}T00:00:00Z`) - Date.parse(`${snapshot.date}T00:00:00Z`)) / 86400000 <= regulatoryComplianceScoreboard_1.REGULATORY_SCOREBOARD_LIMITS.trendCarryForwardDays)
                contributors.push({ id: input.subscriptionId, snapshot });
        }
        contributors.sort((left, right) => compare(left.id, right.id));
        const failed = new Set(contributors.flatMap(row => row.snapshot.standard.failedControlKeys));
        const passed = new Set(contributors.flatMap(row => row.snapshot.standard.passedControlKeys).filter(key => !failed.has(key)));
        const notAssessed = new Set(contributors.flatMap(row => row.snapshot.standard.notAssessedControlKeys).filter(key => !failed.has(key) && !passed.has(key)));
        const ids = JSON.stringify(contributors.map(row => row.id));
        const basis = JSON.stringify(contributors.map(row => [row.id, row.snapshot.standard.source, row.snapshot.standard.assessmentBasisKey]));
        const comparisonState = !contributors.length ? 'unavailable' : previous && previous.ids !== ids ? 'coverageChanged' : previous && previous.basis !== basis ? 'basisChanged' : 'comparable';
        if (requested.has(date))
            result.push({
                date,
                state: !contributors.length ? 'unavailable' : contributors.length < series.length || contributors.some(row => row.snapshot.evidenceState === 'partial') ? 'partial' : 'complete',
                ...(contributors.length ? { counts: { passed: passed.size, failed: failed.size, notAssessed: notAssessed.size, assessed: passed.size + failed.size, total: passed.size + failed.size + notAssessed.size } } : {}),
                evidenceSubscriptionIds: contributors.map(row => row.id),
                sources: regulatoryComplianceScoreboard_1.REGULATORY_SCORE_SOURCES.filter(source => contributors.some(row => row.snapshot.standard.source === source)),
                comparisonState,
            });
        if (contributors.length)
            previous = { ids, basis };
    }
    return result;
}
function buildRegulatoryScoreboardHistoryRelativePath(month) {
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month))
        throw new Error('Invalid regulatory history month');
    return regulatoryComplianceScoreboard_1.REGULATORY_COMPLIANCE_SCOREBOARD_HISTORY_PATTERN.replace('{year}', month.slice(0, 4)).replace('{month}', month.slice(5, 7));
}
function buildRegulatoryScoreboardHistoryPath(subscriptionId, month) {
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(subscriptionId))
        throw new Error('Invalid regulatory history subscription');
    return `subscriptions/${subscriptionId.toLowerCase()}/${buildRegulatoryScoreboardHistoryRelativePath(month)}`;
}
function toRegulatoryFailingControlIdentity(standardKey, controlKey) {
    if (!standardKey || !controlKey || /\s/.test(standardKey + controlKey))
        throw new Error('Invalid regulatory control identity');
    return `${standardKey}:${controlKey}`;
}
//# sourceMappingURL=regulatoryComplianceScoreboardMerge.js.map