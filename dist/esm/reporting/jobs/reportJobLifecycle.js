import { isBoundedPlainText, isIsoUtcTimestamp } from '../shared/reportingIds.js';
import { parseReportJobNotificationDestinationCountsV1 } from './reportJobNotifications.js';
import { parseReportJobRowV1, REPORT_JOB_NOTIFICATION_FIELDS, REPORT_JOB_WORKER_FIELDS } from './reportJobRow.js';
import { canTransitionReportJobStatus, isTerminalReportJobStatus } from './reportJobStatus.js';
const failureFields = ['status', 'failureCode', 'failureStage', 'completedAtUtc'];
const pinnedFields = [
    'startedAtUtc',
    'sourceObservedAtUtc',
    'sourceSnapshotSha256',
    'sourceCoverageSummary',
    'generatedAtUtc',
    'artifactContentSha256',
    'artifactBytes',
];
/**
 * Pure lifecycle boundary, not a storage lock. The caller MUST conditionally replace the returned full row with
 * If-Match expectedEtag; a read/validate followed by an unconditional write remains unsafe. No wildcard ETags.
 * Parsing both rows preserves all default field groups and rejects malformed stored requests.
 */
export const validateReportJobUpdateV1 = async (current, next, context) => {
    try {
        const reject = (...errors) => ({ ok: false, errors });
        if (!isBoundedPlainText(context.expectedEtag, 2000) ||
            context.expectedEtag === '*' ||
            context.expectedEtag !== context.actualEtag ||
            !isIsoUtcTimestamp(context.nowUtc))
            return reject('update: stale/invalid ETag or time');
        const oldParsed = await parseReportJobRowV1(current);
        const newParsed = await parseReportJobRowV1(next);
        if (!oldParsed.ok || !newParsed.ok)
            return reject('update: invalid row');
        const before = oldParsed.row;
        const after = newParsed.row;
        if (isTerminalReportJobStatus(before.status))
            return reject('update: terminal job');
        if (before.status !== after.status && !canTransitionReportJobStatus(before.status, after.status))
            return reject('update: milestone regression or skip');
        const now = Date.parse(context.nowUtc);
        if (now < Date.parse(before.requestedAtUtc))
            return reject('update: time precedes acceptance');
        if ((before.leaseOwner === undefined) !== (before.leaseExpiresAtUtc === undefined) ||
            (after.leaseOwner === undefined) !== (after.leaseExpiresAtUtc === undefined))
            return reject('update: incomplete lease');
        const liveLease = before.leaseExpiresAtUtc !== undefined && Date.parse(before.leaseExpiresAtUtc) > now;
        let allowed;
        if (context.writer === 'worker')
            allowed = [...REPORT_JOB_WORKER_FIELDS, 'notificationStatus'];
        else if (context.writer === 'notifier' || context.writer === 'notification-blocker')
            allowed = [...REPORT_JOB_NOTIFICATION_FIELDS, 'status', 'completedAtUtc'];
        else if (context.writer === 'maintenance')
            allowed = [...failureFields, 'leaseOwner', 'leaseExpiresAtUtc'];
        else if (context.writer === 'producer')
            allowed = failureFields;
        else
            return reject('update: unknown writer');
        const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
        for (const key of keys)
            if (!allowed.includes(key) && before[key] !== after[key])
                return reject(`update: forbidden field ${key}`);
        for (const key of pinnedFields)
            if (before[key] !== undefined && before[key] !== after[key])
                return reject(`update: pinned field ${key}`);
        if (after.attemptCount < before.attemptCount || (after.notificationAttemptCount ?? 0) < (before.notificationAttemptCount ?? 0))
            return reject('update: attempt regression');
        if (context.writer === 'producer') {
            if (before.status !== 'accepted' || before.attemptCount !== 0 || before.leaseOwner !== undefined || after.status !== 'failed')
                return reject('producer: job already dispatched');
            if (after.failureCode === 'publication-rejected') {
                if (context.publicationOutcome !== 'definitively-rejected')
                    return reject('producer: ambiguous publication outcome');
            }
            else if (!['request', 'authorization-or-entitlement', 'scope-resolution'].includes(after.failureStage ?? '') ||
                after.failureCode === 'recovery-exhausted' ||
                after.failureCode === 'retries-exhausted')
                return reject('producer: invalid pre-dispatch failure');
        }
        else if (context.writer === 'maintenance') {
            if (!Number.isSafeInteger(context.minimumAgeMs) ||
                context.minimumAgeMs <= 0 ||
                !Number.isSafeInteger(context.maximumRecoveryAttempts) ||
                context.maximumRecoveryAttempts < 1 ||
                !Number.isSafeInteger(context.recoveryAttempts) ||
                context.recoveryAttempts < context.maximumRecoveryAttempts ||
                now - Date.parse(before.requestedAtUtc) < context.minimumAgeMs ||
                liveLease ||
                before.notificationStatus !== 'none' ||
                (before.status === 'generated' && before.notificationPolicyId !== undefined) ||
                after.status !== 'failed' ||
                after.failureCode !== 'recovery-exhausted' ||
                after.leaseOwner !== undefined)
                return reject('maintenance: age, budget or lease fence');
        }
        else if (context.writer === 'worker') {
            if (!isBoundedPlainText(context.workerId, 256))
                return reject('worker: invalid owner');
            const acquiring = after.attemptCount === before.attemptCount + 1;
            if (acquiring) {
                const acquisitionFields = ['status', 'attemptCount', 'leaseOwner', 'leaseExpiresAtUtc', 'lastAttemptAtUtc', 'startedAtUtc'];
                for (const key of keys)
                    if (!acquisitionFields.includes(key) && before[key] !== after[key])
                        return reject('worker: lease acquisition cannot publish milestones');
                if (before.startedAtUtc === undefined && after.startedAtUtc !== context.nowUtc)
                    return reject('worker: invalid start time');
                if (liveLease ||
                    after.leaseOwner !== context.workerId ||
                    after.leaseExpiresAtUtc === undefined ||
                    Date.parse(after.leaseExpiresAtUtc) <= now ||
                    after.lastAttemptAtUtc !== context.nowUtc ||
                    (before.status === 'accepted' ? after.status !== 'running' : after.status !== before.status) ||
                    before.notificationStatus !== 'none')
                    return reject('worker: invalid lease acquisition');
            }
            else if (!liveLease || before.leaseOwner !== context.workerId || after.attemptCount !== before.attemptCount)
                return reject('worker: lease not owned');
            else if (after.lastAttemptAtUtc !== before.lastAttemptAtUtc)
                return reject('worker: attempt time changes only on acquisition');
            if (after.leaseOwner !== undefined &&
                (after.leaseOwner !== context.workerId ||
                    Date.parse(after.leaseExpiresAtUtc ?? '') <= now ||
                    (liveLease && Date.parse(after.leaseExpiresAtUtc ?? '') < Date.parse(before.leaseExpiresAtUtc ?? ''))))
                return reject('worker: invalid lease renewal');
            if (before.notificationStatus !== after.notificationStatus &&
                !(before.notificationStatus === 'none' &&
                    after.notificationStatus === 'pending' &&
                    after.status === 'generated' &&
                    after.notificationPolicyId !== undefined))
                return reject('worker: invalid notification initialization');
            if (after.status === 'completed' && (after.notificationPolicyId !== undefined || after.notificationStatus !== 'none'))
                return reject('worker: notifications require notifier completion');
            if (after.status === 'completed-with-notification-errors' ||
                (after.status === 'failed' && (after.failureStage === 'notification' || before.notificationStatus !== 'none')))
                return reject('worker: notifier-only outcome');
        }
        else {
            const blocked = context.writer === 'notification-blocker';
            if (before.status !== 'generated' ||
                before.notificationStatus !== 'pending' ||
                before.notificationPolicyId === undefined ||
                (blocked ? context.blockedArtifactContentSha256 : context.verifiedArtifactContentSha256) !== before.artifactContentSha256)
                return reject('notifier: generation/artifact fence');
            if (after.notificationStatus === 'none')
                return reject('notifier: notification regression');
            if (blocked && context.notificationAttemptCount === 0 && after.notificationStatus !== 'failed')
                return reject('notifier: no delivery evidence before first attempt');
            if (after.notificationAttemptCount === undefined ||
                (blocked
                    ? !Number.isSafeInteger(context.notificationAttemptCount) ||
                        context.notificationAttemptCount < 0 ||
                        context.notificationAttemptCount > 3 ||
                        after.notificationAttemptCount !== context.notificationAttemptCount
                    : after.notificationAttemptCount < 1 || after.notificationAttemptCount > (before.notificationAttemptCount ?? 0) + 1))
                return reject('notifier: invalid attempt count');
            const counts = after.notificationDestinationCounts === undefined ? null : parseReportJobNotificationDestinationCountsV1(after.notificationDestinationCounts);
            const oldCounts = before.notificationDestinationCounts === undefined
                ? null
                : parseReportJobNotificationDestinationCountsV1(before.notificationDestinationCounts);
            if (oldCounts)
                for (const [channel, count] of Object.entries(oldCounts)) {
                    const updated = counts?.[channel];
                    if (!updated || updated.total !== count.total || updated.delivered < count.delivered || updated.failed < count.failed)
                        return reject('notifier: destination regression');
                }
            if (after.notificationStatus === 'pending') {
                if (blocked)
                    return reject('notifier: integrity block must settle delivery');
                if (after.status !== 'generated' || after.notificationCompletedAtUtc !== undefined || after.completedAtUtc !== undefined)
                    return reject('notifier: pending completion');
            }
            else {
                const expected = after.notificationStatus === 'delivered' ? 'completed' : 'completed-with-notification-errors';
                if (after.status !== expected || after.completedAtUtc !== context.nowUtc || after.notificationCompletedAtUtc !== context.nowUtc)
                    return reject('notifier: invalid finalization');
                const totals = Object.values(counts ?? {}).reduce((sum, c) => ({ total: sum.total + c.total, delivered: sum.delivered + c.delivered, failed: sum.failed + c.failed }), { total: 0, delivered: 0, failed: 0 });
                if (after.notificationStatus !== 'failed' && (!counts || totals.delivered + totals.failed !== totals.total))
                    return reject('notifier: unfinished destinations');
                if ((after.notificationStatus === 'delivered' && totals.failed !== 0) ||
                    (after.notificationStatus === 'attachment-too-large' && (!counts?.email || counts.email.delivered === 0 || totals.failed !== 0)) ||
                    (after.notificationStatus === 'partially-delivered' && (totals.delivered === 0 || totals.failed === 0)) ||
                    (after.notificationStatus === 'failed' && counts && (totals.delivered !== 0 || totals.failed !== totals.total)))
                    return reject('notifier: outcome/count mismatch');
            }
        }
        if (after.completedAtUtc !== before.completedAtUtc && after.completedAtUtc !== context.nowUtc)
            return reject('update: invalid completion time');
        return { ok: true, row: after, expectedEtag: context.expectedEtag };
    }
    catch {
        return { ok: false, errors: ['update: unreadable'] };
    }
};
