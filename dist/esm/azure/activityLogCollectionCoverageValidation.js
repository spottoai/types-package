/** Strict bounded source proof shared by artifact and public readers. */
export function isActivityLogCollectionCoverage(value) {
    if (!record(value, ['state', 'timeWindow', 'expectedRegions', 'gaps', 'gapCount', 'gapsTruncated']) ||
        !['complete', 'partial', 'unavailable'].includes(value.state) ||
        !record(value.timeWindow, ['start', 'end']) ||
        !interval(value.timeWindow) ||
        !Array.isArray(value.expectedRegions) ||
        value.expectedRegions.length > 256 ||
        !value.expectedRegions.every(region => typeof region === 'string' && /^[a-z][a-z0-9-]{0,127}$/.test(region)) ||
        new Set(value.expectedRegions).size !== value.expectedRegions.length ||
        !Array.isArray(value.gaps) ||
        value.gaps.length > 128 ||
        !Number.isSafeInteger(value.gapCount) ||
        value.gapCount < value.gaps.length ||
        value.gapsTruncated !== value.gapCount > value.gaps.length)
        return false;
    if (value.state === 'complete' && (value.gapCount !== 0 || value.expectedRegions.length === 0))
        return false;
    if (value.state !== 'complete' && value.gapCount === 0)
        return false;
    for (const gap of value.gaps) {
        if (!record(gap, ['start', 'end', 'reason'], ['region']) ||
            !interval(gap) ||
            gap.start < value.timeWindow.start ||
            gap.end > value.timeWindow.end ||
            !['not-collected', 'coverage-gap', 'revision-unavailable', 'expected-regions-unavailable'].includes(gap.reason))
            return false;
        if (gap.reason === 'expected-regions-unavailable') {
            if (gap.region !== undefined || value.expectedRegions.length !== 0)
                return false;
        }
        else if (typeof gap.region !== 'string' || !value.expectedRegions.includes(gap.region))
            return false;
    }
    return true;
}
function record(value, required, optional = []) {
    if (!value || typeof value !== 'object' || Array.isArray(value))
        return false;
    const prototype = Object.getPrototypeOf(value);
    return ((prototype === Object.prototype || prototype === null) &&
        required.every(key => Object.prototype.hasOwnProperty.call(value, key)) &&
        Object.keys(value).every(key => required.includes(key) || optional.includes(key)));
}
function timestamp(value) {
    if (typeof value !== 'string' || value.length > 64)
        return false;
    const date = new Date(value);
    return Number.isFinite(date.valueOf()) && date.toISOString() === value;
}
function interval(value) {
    return timestamp(value.start) && timestamp(value.end) && value.start <= value.end;
}
