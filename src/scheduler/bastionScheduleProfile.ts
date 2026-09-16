type JsonRecord = Record<string, unknown>;

const MAX_IDENTIFIER_LENGTH = 2_048;
const MAX_ETAG_LENGTH = 4_096;
const MAX_LOCATION_LENGTH = 128;
const MAX_IP_CONFIGURATION_NAME_LENGTH = 80;
const MAX_TAG_COUNT = 50;
const MAX_TAG_NAME_LENGTH = 512;
const MAX_TAG_VALUE_LENGTH = 256;

export type BastionScheduleSupportedSkuV1 = 'Basic' | 'Standard' | 'Premium';

export interface BastionScheduleSupportedProfileV1 {
  skuName: BastionScheduleSupportedSkuV1;
  location: string;
  zones?: string[];
  scaleUnits: number;
  disableCopyPaste: boolean;
  enableFileCopy: boolean;
  enableIpConnect: boolean;
  enableShareableLink: boolean;
  enableTunneling: boolean;
  enableKerberos: boolean;
  enableSessionRecording: false;
  enablePrivateOnlyBastion: false;
  tags: Record<string, string>;
  ipConfigurationName: string;
  publicIpId: string;
  subnetId: string;
  virtualNetworkId: string;
  sourceEtag: string;
}

function isPlainRecord(value: unknown): value is JsonRecord {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  const prototype = Reflect.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function hasOnlyFields(value: JsonRecord, fields: readonly string[]): boolean {
  const allowed = new Set(fields);
  return Object.keys(value).every(field => allowed.has(field));
}

function readString(value: unknown, maximumLength: number): string | undefined {
  if (typeof value !== 'string' || value.trim().length === 0 || value.length > maximumLength) return undefined;
  return value.trim();
}

function normalizeResourceId(value: unknown): string | undefined {
  const resourceId = readString(value, MAX_IDENTIFIER_LENGTH);
  if (!resourceId || resourceId.includes('\\') || resourceId.includes('//') || resourceId.endsWith('/')) return undefined;
  return resourceId.toLowerCase();
}

function readBastionSubscriptionId(resourceId: string): string | undefined {
  return /^\/subscriptions\/([a-z0-9-]+)\/resourcegroups\/[a-z0-9._()-]+\/providers\/microsoft\.network\/bastionhosts\/[a-z0-9._()-]+$/.exec(
    resourceId
  )?.[1];
}

function readBoolean(value: unknown): boolean | undefined {
  return value === undefined ? false : typeof value === 'boolean' ? value : undefined;
}

function readTags(value: unknown): Record<string, string> | undefined {
  if (value === undefined) return {};
  if (!isPlainRecord(value) || Object.keys(value).length > MAX_TAG_COUNT) return undefined;

  const entries: Array<readonly [string, string]> = [];
  for (const key of Object.keys(value).sort()) {
    const tagValue = value[key];
    if (key.length === 0 || key.length > MAX_TAG_NAME_LENGTH || typeof tagValue !== 'string' || tagValue.length > MAX_TAG_VALUE_LENGTH) {
      return undefined;
    }
    entries.push([key, tagValue]);
  }
  return Object.fromEntries(entries);
}

function readZones(value: unknown): string[] | undefined | false {
  if (value === undefined) return undefined;
  if (
    !Array.isArray(value) ||
    value.length < 1 ||
    value.length > 3 ||
    !value.every(zone => typeof zone === 'string' && /^[1-3]$/.test(zone)) ||
    new Set(value).size !== value.length
  ) {
    return false;
  }
  return [...value].sort();
}

function readSku(value: unknown): BastionScheduleSupportedSkuV1 | undefined {
  if (!isPlainRecord(value) || !hasOnlyFields(value, ['name'])) return undefined;
  const name = value['name'];
  return name === 'Basic' || name === 'Standard' || name === 'Premium' ? name : undefined;
}

/** Normalizes an eligible public dedicated Azure Bastion profile for schedule readiness and recovery. */
export function readSupportedBastionScheduleProfileV1(value: unknown, expectedResourceId: string): BastionScheduleSupportedProfileV1 | undefined {
  try {
    if (
      !isPlainRecord(value) ||
      !hasOnlyFields(value, ['name', 'id', 'etag', 'type', 'location', 'tags', 'sku', 'properties', 'systemData', 'zones'])
    ) {
      return undefined;
    }

    const normalizedExpectedResourceId = normalizeResourceId(expectedResourceId);
    const normalizedSourceResourceId = normalizeResourceId(value['id']);
    const bastionSubscriptionId = normalizedSourceResourceId ? readBastionSubscriptionId(normalizedSourceResourceId) : undefined;
    const resourceType = readString(value['type'], MAX_IDENTIFIER_LENGTH)?.toLowerCase();
    const sourceEtag = readString(value['etag'], MAX_ETAG_LENGTH);
    const location = readString(value['location'], MAX_LOCATION_LENGTH)?.toLowerCase();
    const tags = readTags(value['tags']);
    const skuName = readSku(value['sku']);
    const zones = readZones(value['zones']);
    if (
      !normalizedExpectedResourceId ||
      normalizedSourceResourceId !== normalizedExpectedResourceId ||
      !bastionSubscriptionId ||
      resourceType !== 'microsoft.network/bastionhosts' ||
      !sourceEtag ||
      !location ||
      !tags ||
      !skuName ||
      zones === false
    ) {
      return undefined;
    }

    if (
      !isPlainRecord(value['properties']) ||
      !hasOnlyFields(value['properties'], [
        'provisioningState',
        'dnsName',
        'publicUri',
        'scaleUnits',
        'disableCopyPaste',
        'enableFileCopy',
        'enableIpConnect',
        'enableShareableLink',
        'enableTunneling',
        'enableKerberos',
        'enableSessionRecording',
        'enablePrivateOnlyBastion',
        'ipConfigurations',
        'networkAcls',
        'virtualNetwork',
      ]) ||
      value['properties']['provisioningState'] !== 'Succeeded' ||
      value['properties']['networkAcls'] !== undefined ||
      value['properties']['virtualNetwork'] !== undefined
    ) {
      return undefined;
    }

    const properties = value['properties'];
    const scaleUnits = properties['scaleUnits'];
    if (
      typeof scaleUnits !== 'number' ||
      !Number.isInteger(scaleUnits) ||
      (skuName === 'Basic' ? scaleUnits !== 2 : scaleUnits < 2 || scaleUnits > 50)
    ) {
      return undefined;
    }

    const disableCopyPaste = readBoolean(properties['disableCopyPaste']);
    const enableFileCopy = readBoolean(properties['enableFileCopy']);
    const enableIpConnect = readBoolean(properties['enableIpConnect']);
    const enableShareableLink = readBoolean(properties['enableShareableLink']);
    const enableTunneling = readBoolean(properties['enableTunneling']);
    const enableKerberos = readBoolean(properties['enableKerberos']);
    const enableSessionRecording = readBoolean(properties['enableSessionRecording']);
    const enablePrivateOnlyBastion = readBoolean(properties['enablePrivateOnlyBastion']);
    if (
      disableCopyPaste === undefined ||
      enableFileCopy === undefined ||
      enableIpConnect === undefined ||
      enableShareableLink === undefined ||
      enableTunneling === undefined ||
      enableKerberos === undefined ||
      enableSessionRecording !== false ||
      enablePrivateOnlyBastion !== false ||
      (skuName === 'Basic' && (enableFileCopy || enableIpConnect || enableShareableLink || enableTunneling || enableKerberos))
    ) {
      return undefined;
    }

    const configurations = properties['ipConfigurations'];
    if (!Array.isArray(configurations) || configurations.length !== 1) return undefined;
    const configuration = configurations[0];
    if (
      !isPlainRecord(configuration) ||
      !hasOnlyFields(configuration, ['name', 'id', 'etag', 'type', 'properties']) ||
      !isPlainRecord(configuration['properties']) ||
      !hasOnlyFields(configuration['properties'], ['provisioningState', 'privateIPAllocationMethod', 'publicIPAddress', 'subnet']) ||
      (configuration['properties']['provisioningState'] !== undefined && configuration['properties']['provisioningState'] !== 'Succeeded') ||
      configuration['properties']['privateIPAllocationMethod'] !== 'Dynamic'
    ) {
      return undefined;
    }

    const ipConfigurationName = readString(configuration['name'], MAX_IP_CONFIGURATION_NAME_LENGTH);
    const publicIp = configuration['properties']['publicIPAddress'];
    const subnet = configuration['properties']['subnet'];
    if (
      !ipConfigurationName ||
      !isPlainRecord(publicIp) ||
      !hasOnlyFields(publicIp, ['id']) ||
      !isPlainRecord(subnet) ||
      !hasOnlyFields(subnet, ['id'])
    ) {
      return undefined;
    }

    const publicIpId = normalizeResourceId(publicIp['id']);
    const subnetId = normalizeResourceId(subnet['id']);
    const publicIpMatch = publicIpId
      ? /^\/subscriptions\/([a-z0-9-]+)\/resourcegroups\/[a-z0-9._()-]+\/providers\/microsoft\.network\/publicipaddresses\/[a-z0-9._()-]+$/.exec(
          publicIpId
        )
      : undefined;
    const subnetMatch = subnetId
      ? /^\/subscriptions\/([a-z0-9-]+)\/resourcegroups\/[a-z0-9._()-]+\/providers\/microsoft\.network\/virtualnetworks\/[a-z0-9._()-]+\/subnets\/azurebastionsubnet$/.exec(
          subnetId
        )
      : undefined;
    if (
      !publicIpId ||
      !publicIpMatch ||
      publicIpMatch[1] !== bastionSubscriptionId ||
      !subnetId ||
      !subnetMatch ||
      subnetMatch[1] !== bastionSubscriptionId
    ) {
      return undefined;
    }

    return {
      skuName,
      location,
      ...(zones ? { zones } : {}),
      scaleUnits,
      disableCopyPaste,
      enableFileCopy,
      enableIpConnect,
      enableShareableLink,
      enableTunneling,
      enableKerberos,
      enableSessionRecording: false,
      enablePrivateOnlyBastion: false,
      tags,
      ipConfigurationName,
      publicIpId,
      subnetId,
      virtualNetworkId: subnetId.slice(0, subnetId.lastIndexOf('/subnets/')),
      sourceEtag,
    };
  } catch {
    return undefined;
  }
}
