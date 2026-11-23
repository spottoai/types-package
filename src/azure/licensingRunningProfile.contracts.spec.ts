import {
  isUtilizationProfile,
  type AzureResourcePluginItemDetailed,
  type LicensingResourceItem,
  type OversizedResourceRow,
  type UtilizationProfile,
} from '../index';

// Use the same producer DTOs already consumed by At a Glance and resource details.
declare const atAGlanceRow: OversizedResourceRow;
declare const resourceDetails: AzureResourcePluginItemDetailed;
declare const licensingResource: LicensingResourceItem;

const fromAtAGlance: LicensingResourceItem = { ...licensingResource, utilizationProfile: atAGlanceRow.profile };
const fromResourceDetails: LicensingResourceItem = { ...licensingResource, utilizationProfile: resourceDetails.utilizationProfile };
const canonicalProfile: UtilizationProfile | undefined = fromAtAGlance.utilizationProfile;
const resourceProfile: AzureResourcePluginItemDetailed['utilizationProfile'] = fromAtAGlance.utilizationProfile;
const storyProfile: OversizedResourceRow['profile'] | undefined = fromAtAGlance.utilizationProfile;

// Absence stays compatible with older licensing artifacts, not an inferred off-state.
const { utilizationProfile: omitted, ...withoutProfile } = licensingResource;
const legacyItem: LicensingResourceItem = withoutProfile;

// The existing validator applies directly; no licensing-specific running validator is needed.
const sharedGuard: (value: unknown, days?: number) => value is NonNullable<LicensingResourceItem['utilizationProfile']> = isUtilizationProfile;

// @ts-expect-error a partial wrapper is not the canonical profile used by other resource surfaces.
const partialWrapper: NonNullable<LicensingResourceItem['utilizationProfile']> = {
  running: atAGlanceRow.profile.running,
  evidenceWindow: atAGlanceRow.profile.evidenceWindow,
};
// @ts-expect-error the superseded licensing-specific runningProfile field must not be introduced.
const duplicateField: LicensingResourceItem = { ...licensingResource, runningProfile: atAGlanceRow.profile.running };

void [
  fromAtAGlance,
  fromResourceDetails,
  canonicalProfile,
  resourceProfile,
  storyProfile,
  omitted,
  legacyItem,
  sharedGuard,
  partialWrapper,
  duplicateField,
];
