import { formatExactDecimalValue, parseCanonicalDecimal, subtractExactDecimalValues } from '../common/exactDecimal.js';
import { sha256Utf8 } from '../common/sha256.js';
import { FINANCIAL_RESOURCE_SURFACE_PROJECTION_CONTRACT_VERSION_V1, FINANCIAL_RESOURCE_SURFACE_PROJECTION_SCHEMA_VERSION_V1, } from './financialResourceSurfaceProjection.js';
import { isFinancialSurfaceCoordinateDefinitionV1, isFinancialSurfaceMoneyV1, } from './financialCurrentSpendSurfaceProjectionValidation.js';
import { canonicalizeFinancialSavingsJsonValue, hasExactFinancialSavingsFields, isFinancialSavingsHash, isFinancialSavingsIdentity, isFinancialSavingsIsoInstant, isFinancialSavingsRecord, } from './financialSavingsAuthorityValidationPrimitives.js';
import { isCanonicalExactMoney } from './financialValidationPrimitives.js';
const MAX_COORDINATES = 128;
const MAX_RESOURCES = 50000;
const MAX_VALUES_PER_RESOURCE = 128;
const MAX_SCENARIOS_PER_RESOURCE = 1024;
const MAX_REASONS = 64;
const RESOURCE_ROLES = new Set(['owner', 'display-only', 'unclassified']);
const SCENARIO_CATEGORIES = new Set(['cost', 'security', 'reliability', 'performance', 'operational-excellence', 'compliance']);
const CURRENCY = /^[A-Z]{3}$/;
const isCurrency = (value) => typeof value === 'string' && CURRENCY.test(value);
const isReasonCodes = (value) => Array.isArray(value) &&
    value.length > 0 &&
    value.length <= MAX_REASONS &&
    value.every(isFinancialSavingsIdentity) &&
    new Set(value).size === value.length;
const isExactAmount = (amount, currencyCode) => isCurrency(currencyCode) && isCanonicalExactMoney({ amount, currencyCode });
const isScenario = (value, coordinateIds, requestedCurrencyCode) => {
    if (!isFinancialSavingsRecord(value))
        return false;
    const commonValid = isFinancialSavingsIdentity(value.scenarioId) &&
        isFinancialSavingsHash(value.coordinateId) &&
        coordinateIds.has(value.coordinateId) &&
        (value.recommendationId === undefined || isFinancialSavingsIdentity(value.recommendationId)) &&
        typeof value.category === 'string' &&
        SCENARIO_CATEGORIES.has(value.category) &&
        value.additivity === 'non-additive';
    if (!commonValid)
        return false;
    const optionalCommon = ['recommendationId'];
    if (value.status === 'available') {
        if (!hasExactFinancialSavingsFields(value, [
            'scenarioId',
            'coordinateId',
            'category',
            'additivity',
            'status',
            'currentAmount',
            'targetAmount',
            'changeAmount',
            'currencyCode',
        ], optionalCommon) ||
            !isExactAmount(value.currentAmount, value.currencyCode) ||
            !isExactAmount(value.targetAmount, value.currencyCode) ||
            !isExactAmount(value.changeAmount, value.currencyCode) ||
            (requestedCurrencyCode !== undefined && value.currencyCode !== requestedCurrencyCode))
            return false;
        return (value.changeAmount ===
            formatExactDecimalValue(subtractExactDecimalValues(parseCanonicalDecimal(value.targetAmount), parseCanonicalDecimal(value.currentAmount))));
    }
    if (value.status === 'unavailable') {
        return hasExactFinancialSavingsFields(value, ['scenarioId', 'coordinateId', 'category', 'additivity', 'status', 'reasonCodes'], optionalCommon) && isReasonCodes(value.reasonCodes);
    }
    if (value.status !== 'partial')
        return false;
    if (!hasExactFinancialSavingsFields(value, ['scenarioId', 'coordinateId', 'category', 'additivity', 'status', 'reasonCodes'], [...optionalCommon, 'currentAmount', 'targetAmount', 'changeAmount', 'currencyCode']) ||
        !isReasonCodes(value.reasonCodes))
        return false;
    const monetaryFields = [value.currentAmount, value.targetAmount, value.changeAmount];
    const presentAmounts = monetaryFields.filter(amount => amount !== undefined);
    if (presentAmounts.length === 0)
        return value.currencyCode === undefined;
    return (isCurrency(value.currencyCode) &&
        (requestedCurrencyCode === undefined || value.currencyCode === requestedCurrencyCode) &&
        presentAmounts.every(amount => isExactAmount(amount, value.currencyCode)));
};
const canonicalizeValue = (value) => value.status === 'available' ? value : { ...value, reasonCodes: [...value.reasonCodes].sort() };
const canonicalizeScenario = (value) => value.status === 'available' ? value : { ...value, reasonCodes: [...value.reasonCodes].sort() };
export const canonicalizeFinancialResourceSurfaceProjectionIdentityV1 = (value) => JSON.stringify(canonicalizeFinancialSavingsJsonValue({
    ...value,
    providerAccountRefs: [...value.providerAccountRefs].sort(),
    coordinates: [...value.coordinates].sort((left, right) => left.coordinateId.localeCompare(right.coordinateId)),
    resources: [...value.resources]
        .sort((left, right) => left.resourceId.localeCompare(right.resourceId))
        .map(resource => ({
        ...resource,
        values: [...resource.values]
            .sort((left, right) => left.coordinateId.localeCompare(right.coordinateId))
            .map(canonicalizeValue),
        ...(resource.scenarios === undefined
            ? {}
            : {
                scenarios: [...resource.scenarios]
                    .sort((left, right) => left.scenarioId.localeCompare(right.scenarioId) || left.coordinateId.localeCompare(right.coordinateId))
                    .map(canonicalizeScenario),
            }),
    })),
}));
export const createFinancialResourceSurfaceProjectionIdV1 = (value) => `sha256:${sha256Utf8(canonicalizeFinancialResourceSurfaceProjectionIdentityV1(value))}`;
/**
 * Selects one resource member without copying unrelated members or coordinates.
 * The returned projection remains independently content-addressed and valid.
 */
export const projectFinancialResourceSurfaceMemberV1 = (source, resourceId) => {
    if (!isFinancialResourceSurfaceProjectionV1(source)) {
        throw new TypeError('Invalid FinancialResourceSurfaceProjectionV1.');
    }
    const normalizedResourceId = resourceId.trim().toLowerCase().replace(/\/+$/, '');
    const member = source.resources.find(candidate => candidate.resourceId.trim().toLowerCase().replace(/\/+$/, '') === normalizedResourceId);
    if (!member)
        return undefined;
    const coordinateIds = new Set([
        ...member.values.map(value => value.coordinateId),
        ...(member.scenarios ?? []).map(scenario => scenario.coordinateId),
    ]);
    const identity = {
        schemaVersion: source.schemaVersion,
        contractVersion: source.contractVersion,
        provider: source.provider,
        providerAccountRefs: [...source.providerAccountRefs],
        artifactGeneration: source.artifactGeneration,
        financialAuthorityId: source.financialAuthorityId,
        coordinates: source.coordinates.filter(coordinate => coordinateIds.has(coordinate.coordinateId)),
        resources: [member],
    };
    const projection = {
        ...identity,
        projectionId: createFinancialResourceSurfaceProjectionIdV1(identity),
    };
    if (!isFinancialResourceSurfaceProjectionV1(projection)) {
        throw new TypeError('Invalid projected FinancialResourceSurfaceProjectionV1.');
    }
    return projection;
};
/**
 * Removes mutable recommendation scenarios while preserving authoritative
 * current-spend values. Used when lifecycle state is newer than the immutable
 * financial artifact.
 */
export const projectFinancialResourceSurfaceWithoutScenariosV1 = (source) => {
    if (!isFinancialResourceSurfaceProjectionV1(source)) {
        throw new TypeError('Invalid FinancialResourceSurfaceProjectionV1.');
    }
    const referencedCoordinateIds = new Set(source.resources.flatMap(resource => resource.values.map(value => value.coordinateId)));
    const identity = {
        schemaVersion: source.schemaVersion,
        contractVersion: source.contractVersion,
        provider: source.provider,
        providerAccountRefs: [...source.providerAccountRefs],
        artifactGeneration: source.artifactGeneration,
        financialAuthorityId: source.financialAuthorityId,
        coordinates: source.coordinates.filter(coordinate => referencedCoordinateIds.has(coordinate.coordinateId)),
        resources: source.resources.map(resource => {
            const { scenarios: _scenarios, ...currentSpendOnly } = resource;
            return currentSpendOnly;
        }),
    };
    const projection = {
        ...identity,
        projectionId: createFinancialResourceSurfaceProjectionIdV1(identity),
    };
    if (!isFinancialResourceSurfaceProjectionV1(projection)) {
        throw new TypeError('Invalid current-spend-only FinancialResourceSurfaceProjectionV1.');
    }
    return projection;
};
export const isFinancialResourceSurfaceProjectionV1 = (value) => {
    if (!isFinancialSavingsRecord(value) ||
        !hasExactFinancialSavingsFields(value, [
            'schemaVersion',
            'contractVersion',
            'projectionId',
            'provider',
            'providerAccountRefs',
            'artifactGeneration',
            'financialAuthorityId',
            'coordinates',
            'resources',
        ]) ||
        value.schemaVersion !== FINANCIAL_RESOURCE_SURFACE_PROJECTION_SCHEMA_VERSION_V1 ||
        value.contractVersion !== FINANCIAL_RESOURCE_SURFACE_PROJECTION_CONTRACT_VERSION_V1 ||
        !isFinancialSavingsHash(value.projectionId) ||
        value.provider !== 'azure' ||
        !Array.isArray(value.providerAccountRefs) ||
        value.providerAccountRefs.length === 0 ||
        value.providerAccountRefs.length > 64 ||
        !value.providerAccountRefs.every(isFinancialSavingsIdentity) ||
        new Set(value.providerAccountRefs).size !== value.providerAccountRefs.length ||
        !isFinancialSavingsRecord(value.artifactGeneration) ||
        !hasExactFinancialSavingsFields(value.artifactGeneration, ['runId', 'generatedAt']) ||
        !isFinancialSavingsIdentity(value.artifactGeneration.runId) ||
        !isFinancialSavingsIsoInstant(value.artifactGeneration.generatedAt) ||
        !isFinancialSavingsHash(value.financialAuthorityId) ||
        !Array.isArray(value.coordinates) ||
        value.coordinates.length === 0 ||
        value.coordinates.length > MAX_COORDINATES ||
        !value.coordinates.every(isFinancialSurfaceCoordinateDefinitionV1) ||
        new Set(value.coordinates.map(coordinate => coordinate.coordinateId)).size !== value.coordinates.length ||
        !Array.isArray(value.resources) ||
        value.resources.length > MAX_RESOURCES)
        return false;
    const coordinateById = new Map(value.coordinates.map(coordinate => [coordinate.coordinateId, coordinate]));
    const coordinateIds = new Set(coordinateById.keys());
    const resourceIds = new Set();
    for (const resource of value.resources) {
        if (!isFinancialSavingsRecord(resource) ||
            !hasExactFinancialSavingsFields(resource, ['resourceId', 'resourceType', 'financialRole', 'values'], ['scenarios']) ||
            !isFinancialSavingsIdentity(resource.resourceId) ||
            resourceIds.has(resource.resourceId.toLowerCase()) ||
            !isFinancialSavingsIdentity(resource.resourceType) ||
            typeof resource.financialRole !== 'string' ||
            !RESOURCE_ROLES.has(resource.financialRole) ||
            !Array.isArray(resource.values) ||
            resource.values.length === 0 ||
            resource.values.length > MAX_VALUES_PER_RESOURCE)
            return false;
        resourceIds.add(resource.resourceId.toLowerCase());
        const valueCoordinates = new Set();
        for (const memberValue of resource.values) {
            if (!isFinancialSavingsRecord(memberValue) || !isFinancialSavingsHash(memberValue.coordinateId))
                return false;
            const definition = coordinateById.get(memberValue.coordinateId);
            if (definition === undefined || valueCoordinates.has(memberValue.coordinateId))
                return false;
            const money = Object.fromEntries(Object.entries(memberValue).filter(([key]) => key !== 'coordinateId'));
            if (!isFinancialSurfaceMoneyV1(money, definition.requestedCurrencyCode))
                return false;
            valueCoordinates.add(memberValue.coordinateId);
        }
        if (resource.scenarios !== undefined) {
            if (!Array.isArray(resource.scenarios) || resource.scenarios.length > MAX_SCENARIOS_PER_RESOURCE)
                return false;
            const scenarioCoordinates = new Set();
            for (const scenario of resource.scenarios) {
                if (!isFinancialSavingsRecord(scenario) || !isFinancialSavingsHash(scenario.coordinateId))
                    return false;
                const definition = coordinateById.get(scenario.coordinateId);
                if (definition === undefined ||
                    !isScenario(scenario, coordinateIds, definition.requestedCurrencyCode) ||
                    scenarioCoordinates.has(`${scenario.scenarioId}\u0000${scenario.coordinateId}`))
                    return false;
                scenarioCoordinates.add(`${scenario.scenarioId}\u0000${scenario.coordinateId}`);
            }
        }
    }
    const projection = value;
    const { projectionId: _projectionId, ...identity } = projection;
    return projection.projectionId === createFinancialResourceSurfaceProjectionIdV1(identity);
};
