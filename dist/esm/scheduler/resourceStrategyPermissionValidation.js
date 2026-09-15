import { RESOURCE_STRATEGY_CONTRACT_LIMITS, } from './resourceStrategyContracts.js';
import { hasOnlyKeys, isBoundedString, isBoundedStringArray, isCapabilityRef, isIsoTimestamp, isRecord, isWithinJsonByteLimit, } from './resourceStrategyValidationShared.js';
export function isResourceSchedulePermissionManifestProjection(value) {
    if (!isWithinJsonByteLimit(value, RESOURCE_STRATEGY_CONTRACT_LIMITS.publicDtoBytes) ||
        !isRecord(value) ||
        !hasOnlyKeys(value, [
            'schemaVersion',
            'provider',
            'version',
            'contentHash',
            'capabilityVersions',
            'orderedGrantGroupHashes',
            'grantGroups',
            'generatedAtUtc',
            'evidenceObservedAtUtc',
            'expiresAtUtc',
            'reviewStatus',
            'change',
        ]) ||
        value.schemaVersion !== 1 ||
        !isBoundedString(value.provider, 100) ||
        !isBoundedString(value.version, 200) ||
        !isBoundedString(value.contentHash, 200) ||
        !Array.isArray(value.capabilityVersions) ||
        value.capabilityVersions.length === 0 ||
        value.capabilityVersions.length > RESOURCE_STRATEGY_CONTRACT_LIMITS.metadataItems ||
        !value.capabilityVersions.every(isCapabilityRef) ||
        !Array.isArray(value.grantGroups) ||
        value.grantGroups.length === 0 ||
        value.grantGroups.length > RESOURCE_STRATEGY_CONTRACT_LIMITS.grantGroups ||
        !Array.isArray(value.orderedGrantGroupHashes) ||
        value.orderedGrantGroupHashes.length !== value.grantGroups.length ||
        !isIsoTimestamp(value.generatedAtUtc) ||
        !isIsoTimestamp(value.evidenceObservedAtUtc) ||
        !(value.expiresAtUtc === null || isIsoTimestamp(value.expiresAtUtc)) ||
        !['current', 'review-required', 'expired'].includes(String(value.reviewStatus)) ||
        !isRecord(value.change) ||
        !hasOnlyKeys(value.change, ['status', 'addedOperations', 'removedOperations']) ||
        !['new', 'unchanged', 'expanding', 'narrowing', 'missing'].includes(String(value.change.status)) ||
        !isPermissionChangeOperations(value.change.addedOperations) ||
        !isPermissionChangeOperations(value.change.removedOperations) ||
        Date.parse(value.evidenceObservedAtUtc) > Date.parse(value.generatedAtUtc) ||
        (typeof value.expiresAtUtc === 'string' && Date.parse(value.expiresAtUtc) < Date.parse(value.generatedAtUtc)) ||
        new Set(value.capabilityVersions.map(item => `${item.capabilityId}:${item.capabilityVersion}`)).size !== value.capabilityVersions.length) {
        return false;
    }
    const change = value.change;
    const addedKeys = new Set(change.addedOperations.map(permissionChangeOperationKey));
    const removedKeys = new Set(change.removedOperations.map(permissionChangeOperationKey));
    if (addedKeys.size !== change.addedOperations.length ||
        removedKeys.size !== change.removedOperations.length ||
        [...addedKeys].some(key => removedKeys.has(key))) {
        return false;
    }
    if ((value.change.status === 'unchanged' && (change.addedOperations.length > 0 || change.removedOperations.length > 0)) ||
        ((value.change.status === 'new' || value.change.status === 'missing') &&
            (change.addedOperations.length === 0 || change.removedOperations.length > 0)) ||
        (value.change.status === 'expanding' && change.addedOperations.length === 0) ||
        (value.change.status === 'narrowing' && (change.addedOperations.length > 0 || change.removedOperations.length === 0))) {
        return false;
    }
    const grantGroups = value.grantGroups;
    const seenGroupHashes = new Set();
    const validGrantGroups = grantGroups.every(group => {
        if (!isRecord(group) ||
            !hasOnlyKeys(group, [
                'groupHash',
                'provider',
                'providerScopeId',
                'exactAssignmentScope',
                'operationSetHash',
                'principalRef',
                'roleDefinitionRef',
                'roleName',
                'roleDefinitionScope',
                'roleAssignmentRef',
                'actions',
                'dataActions',
                'disclosureKeys',
            ]) ||
            !isBoundedString(group.groupHash, 200) ||
            group.provider !== value.provider ||
            !isBoundedString(group.providerScopeId, 300) ||
            !isBoundedString(group.exactAssignmentScope, 2000) ||
            !isBoundedString(group.operationSetHash, 200) ||
            !isBoundedString(group.principalRef, 200) ||
            !isBoundedString(group.roleDefinitionRef, 200) ||
            !isBoundedString(group.roleName, 500) ||
            !isBoundedString(group.roleDefinitionScope, 2000) ||
            !isBoundedString(group.roleAssignmentRef, 200) ||
            !isPermissionOperations(group.actions) ||
            !isPermissionOperations(group.dataActions) ||
            group.actions.length + group.dataActions.length === 0 ||
            (group.disclosureKeys !== undefined && !isBoundedStringArray(group.disclosureKeys)) ||
            seenGroupHashes.has(group.groupHash)) {
            return false;
        }
        const actions = group.actions;
        const dataActions = group.dataActions;
        if (actions.some(action => dataActions.some(dataAction => dataAction.operation.toLowerCase() === action.operation.toLowerCase()))) {
            return false;
        }
        seenGroupHashes.add(group.groupHash);
        return true;
    });
    if (!validGrantGroups ||
        !value.orderedGrantGroupHashes.every((hash, index) => isBoundedString(hash, 200) && isRecord(grantGroups[index]) && hash === grantGroups[index].groupHash)) {
        return false;
    }
    const currentOperationKeys = new Set();
    for (const group of grantGroups) {
        if (!isRecord(group))
            return false;
        for (const operation of group.actions) {
            currentOperationKeys.add(permissionChangeOperationKey({
                groupHash: String(group.groupHash),
                providerScopeId: String(group.providerScopeId),
                exactAssignmentScope: String(group.exactAssignmentScope),
                operationKind: 'action',
                operation: operation.operation,
            }));
        }
        for (const operation of group.dataActions) {
            currentOperationKeys.add(permissionChangeOperationKey({
                groupHash: String(group.groupHash),
                providerScopeId: String(group.providerScopeId),
                exactAssignmentScope: String(group.exactAssignmentScope),
                operationKind: 'data-action',
                operation: operation.operation,
            }));
        }
    }
    if ((value.change.status === 'new' || value.change.status === 'missing') &&
        (addedKeys.size !== currentOperationKeys.size || [...currentOperationKeys].some(key => !addedKeys.has(key)))) {
        return false;
    }
    return (change.addedOperations.every(operation => currentOperationKeys.has(permissionChangeOperationKey(operation))) &&
        change.removedOperations.every(operation => !currentOperationKeys.has(permissionChangeOperationKey(operation))));
}
function permissionChangeOperationKey(value) {
    return [value.groupHash, value.providerScopeId, value.exactAssignmentScope, value.operationKind, value.operation]
        .map(item => item.toLowerCase())
        .join('\u0000');
}
function isPermissionChangeOperations(value) {
    return (Array.isArray(value) &&
        value.length <= RESOURCE_STRATEGY_CONTRACT_LIMITS.permissionOperations &&
        value.every(item => isRecord(item) &&
            hasOnlyKeys(item, ['groupHash', 'providerScopeId', 'exactAssignmentScope', 'operationKind', 'operation']) &&
            isBoundedString(item.groupHash, 200) &&
            isBoundedString(item.providerScopeId, 300) &&
            isBoundedString(item.exactAssignmentScope, 2000) &&
            ['action', 'data-action'].includes(String(item.operationKind)) &&
            isBoundedString(item.operation, 500) &&
            !item.operation.includes('*')));
}
function isPermissionOperations(value) {
    if (!Array.isArray(value) || value.length > RESOURCE_STRATEGY_CONTRACT_LIMITS.metadataItems)
        return false;
    const operations = new Set();
    return value.every(item => {
        if (!isRecord(item) ||
            !hasOnlyKeys(item, ['operation', 'permissionSetRefs', 'reason', 'evidenceUrl']) ||
            !isBoundedString(item.operation, 500) ||
            item.operation.includes('*') ||
            !Array.isArray(item.permissionSetRefs) ||
            item.permissionSetRefs.length === 0 ||
            !isBoundedStringArray(item.permissionSetRefs) ||
            new Set(item.permissionSetRefs).size !== item.permissionSetRefs.length ||
            !isBoundedString(item.reason, 2000) ||
            !isBoundedString(item.evidenceUrl, 2000) ||
            operations.has(item.operation.toLowerCase())) {
            return false;
        }
        operations.add(item.operation.toLowerCase());
        return true;
    });
}
export function isResourceSchedulePermissionManifestConsent(value) {
    return (isWithinJsonByteLimit(value, RESOURCE_STRATEGY_CONTRACT_LIMITS.publicDtoBytes) &&
        isRecord(value) &&
        hasOnlyKeys(value, ['version', 'contentHash', 'orderedGrantGroupHashes']) &&
        isBoundedString(value.version, 200) &&
        isBoundedString(value.contentHash, 200) &&
        Array.isArray(value.orderedGrantGroupHashes) &&
        value.orderedGrantGroupHashes.length > 0 &&
        value.orderedGrantGroupHashes.length <= RESOURCE_STRATEGY_CONTRACT_LIMITS.grantGroups &&
        value.orderedGrantGroupHashes.every(item => isBoundedString(item, 200)) &&
        new Set(value.orderedGrantGroupHashes).size === value.orderedGrantGroupHashes.length);
}
