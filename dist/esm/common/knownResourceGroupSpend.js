export function isKnownResourceGroupSpend(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value))
        return false;
    const record = value;
    const allowed = new Set(['currency', 'totalResourceCount', 'billedResourceCount', 'amortizedResourceCount', 'cost', 'costAmortized']);
    if (!Object.keys(record).every(key => allowed.has(key)))
        return false;
    if (typeof record.currency !== 'string' || !/^[A-Z]{3}$/u.test(record.currency))
        return false;
    const total = record.totalResourceCount;
    const billed = record.billedResourceCount;
    const amortized = record.amortizedResourceCount;
    if (!isCount(total) || total === 0 || !isCount(billed) || !isCount(amortized))
        return false;
    if (billed > total || amortized > total || billed + amortized === 0)
        return false;
    return validAmount(record.cost, billed) && validAmount(record.costAmortized, amortized);
}
function isCount(value) {
    return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}
function validAmount(value, count) {
    return count === 0 ? value === undefined : typeof value === 'number' && Number.isFinite(value);
}
