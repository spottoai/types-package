"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isResourceSchedulePermissionManifestProjection = isResourceSchedulePermissionManifestProjection;
exports.isResourceSchedulePermissionManifestConsent = isResourceSchedulePermissionManifestConsent;
const resourceStrategyContracts_1 = require("./resourceStrategyContracts");
const resourceStrategyValidationShared_1 = require("./resourceStrategyValidationShared");
function isResourceSchedulePermissionManifestProjection(value) {
    if (!(0, resourceStrategyValidationShared_1.isWithinJsonByteLimit)(value, resourceStrategyContracts_1.RESOURCE_STRATEGY_CONTRACT_LIMITS.publicDtoBytes) ||
        !(0, resourceStrategyValidationShared_1.isRecord)(value) ||
        !(0, resourceStrategyValidationShared_1.hasOnlyKeys)(value, [
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
        !(0, resourceStrategyValidationShared_1.isBoundedString)(value.provider, 100) ||
        !(0, resourceStrategyValidationShared_1.isBoundedString)(value.version, 200) ||
        !(0, resourceStrategyValidationShared_1.isBoundedString)(value.contentHash, 200) ||
        !Array.isArray(value.capabilityVersions) ||
        value.capabilityVersions.length === 0 ||
        value.capabilityVersions.length > resourceStrategyContracts_1.RESOURCE_STRATEGY_CONTRACT_LIMITS.metadataItems ||
        !value.capabilityVersions.every(resourceStrategyValidationShared_1.isCapabilityRef) ||
        !Array.isArray(value.grantGroups) ||
        value.grantGroups.length === 0 ||
        value.grantGroups.length > resourceStrategyContracts_1.RESOURCE_STRATEGY_CONTRACT_LIMITS.grantGroups ||
        !Array.isArray(value.orderedGrantGroupHashes) ||
        value.orderedGrantGroupHashes.length !== value.grantGroups.length ||
        !(0, resourceStrategyValidationShared_1.isIsoTimestamp)(value.generatedAtUtc) ||
        !(0, resourceStrategyValidationShared_1.isIsoTimestamp)(value.evidenceObservedAtUtc) ||
        !(value.expiresAtUtc === null || (0, resourceStrategyValidationShared_1.isIsoTimestamp)(value.expiresAtUtc)) ||
        !['current', 'review-required', 'expired'].includes(String(value.reviewStatus)) ||
        !(0, resourceStrategyValidationShared_1.isRecord)(value.change) ||
        !(0, resourceStrategyValidationShared_1.hasOnlyKeys)(value.change, ['status', 'addedOperations', 'removedOperations']) ||
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
        if (!(0, resourceStrategyValidationShared_1.isRecord)(group) ||
            !(0, resourceStrategyValidationShared_1.hasOnlyKeys)(group, [
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
            !(0, resourceStrategyValidationShared_1.isBoundedString)(group.groupHash, 200) ||
            group.provider !== value.provider ||
            !(0, resourceStrategyValidationShared_1.isBoundedString)(group.providerScopeId, 300) ||
            !(0, resourceStrategyValidationShared_1.isBoundedString)(group.exactAssignmentScope, 2000) ||
            !(0, resourceStrategyValidationShared_1.isBoundedString)(group.operationSetHash, 200) ||
            !(0, resourceStrategyValidationShared_1.isBoundedString)(group.principalRef, 200) ||
            !(0, resourceStrategyValidationShared_1.isBoundedString)(group.roleDefinitionRef, 200) ||
            !(0, resourceStrategyValidationShared_1.isBoundedString)(group.roleName, 500) ||
            !(0, resourceStrategyValidationShared_1.isBoundedString)(group.roleDefinitionScope, 2000) ||
            !(0, resourceStrategyValidationShared_1.isBoundedString)(group.roleAssignmentRef, 200) ||
            !isPermissionOperations(group.actions) ||
            !isPermissionOperations(group.dataActions) ||
            group.actions.length + group.dataActions.length === 0 ||
            (group.disclosureKeys !== undefined && !(0, resourceStrategyValidationShared_1.isBoundedStringArray)(group.disclosureKeys)) ||
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
        !value.orderedGrantGroupHashes.every((hash, index) => (0, resourceStrategyValidationShared_1.isBoundedString)(hash, 200) && (0, resourceStrategyValidationShared_1.isRecord)(grantGroups[index]) && hash === grantGroups[index].groupHash)) {
        return false;
    }
    const currentOperationKeys = new Set();
    for (const group of grantGroups) {
        if (!(0, resourceStrategyValidationShared_1.isRecord)(group))
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
        value.length <= resourceStrategyContracts_1.RESOURCE_STRATEGY_CONTRACT_LIMITS.permissionOperations &&
        value.every(item => (0, resourceStrategyValidationShared_1.isRecord)(item) &&
            (0, resourceStrategyValidationShared_1.hasOnlyKeys)(item, ['groupHash', 'providerScopeId', 'exactAssignmentScope', 'operationKind', 'operation']) &&
            (0, resourceStrategyValidationShared_1.isBoundedString)(item.groupHash, 200) &&
            (0, resourceStrategyValidationShared_1.isBoundedString)(item.providerScopeId, 300) &&
            (0, resourceStrategyValidationShared_1.isBoundedString)(item.exactAssignmentScope, 2000) &&
            ['action', 'data-action'].includes(String(item.operationKind)) &&
            (0, resourceStrategyValidationShared_1.isBoundedString)(item.operation, 500) &&
            !item.operation.includes('*')));
}
function isPermissionOperations(value) {
    if (!Array.isArray(value) || value.length > resourceStrategyContracts_1.RESOURCE_STRATEGY_CONTRACT_LIMITS.metadataItems)
        return false;
    const operations = new Set();
    return value.every(item => {
        if (!(0, resourceStrategyValidationShared_1.isRecord)(item) ||
            !(0, resourceStrategyValidationShared_1.hasOnlyKeys)(item, ['operation', 'permissionSetRefs', 'reason', 'evidenceUrl']) ||
            !(0, resourceStrategyValidationShared_1.isBoundedString)(item.operation, 500) ||
            item.operation.includes('*') ||
            !Array.isArray(item.permissionSetRefs) ||
            item.permissionSetRefs.length === 0 ||
            !(0, resourceStrategyValidationShared_1.isBoundedStringArray)(item.permissionSetRefs) ||
            new Set(item.permissionSetRefs).size !== item.permissionSetRefs.length ||
            !(0, resourceStrategyValidationShared_1.isBoundedString)(item.reason, 2000) ||
            !(0, resourceStrategyValidationShared_1.isBoundedString)(item.evidenceUrl, 2000) ||
            operations.has(item.operation.toLowerCase())) {
            return false;
        }
        operations.add(item.operation.toLowerCase());
        return true;
    });
}
function isResourceSchedulePermissionManifestConsent(value) {
    return ((0, resourceStrategyValidationShared_1.isWithinJsonByteLimit)(value, resourceStrategyContracts_1.RESOURCE_STRATEGY_CONTRACT_LIMITS.publicDtoBytes) &&
        (0, resourceStrategyValidationShared_1.isRecord)(value) &&
        (0, resourceStrategyValidationShared_1.hasOnlyKeys)(value, ['version', 'contentHash', 'orderedGrantGroupHashes']) &&
        (0, resourceStrategyValidationShared_1.isBoundedString)(value.version, 200) &&
        (0, resourceStrategyValidationShared_1.isBoundedString)(value.contentHash, 200) &&
        Array.isArray(value.orderedGrantGroupHashes) &&
        value.orderedGrantGroupHashes.length > 0 &&
        value.orderedGrantGroupHashes.length <= resourceStrategyContracts_1.RESOURCE_STRATEGY_CONTRACT_LIMITS.grantGroups &&
        value.orderedGrantGroupHashes.every(item => (0, resourceStrategyValidationShared_1.isBoundedString)(item, 200)) &&
        new Set(value.orderedGrantGroupHashes).size === value.orderedGrantGroupHashes.length);
}
//# sourceMappingURL=resourceStrategyPermissionValidation.js.map