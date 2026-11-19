import type {
  LicensingAzureLicenseCharge,
  LicensingBilledVmHours,
  LicensingWindowsLicenseChargeCalculation,
  LicensingWindowsLicenseChargeComponent,
} from '../index';

const measuredHours: LicensingBilledVmHours = { availability: 'available', hours: 42.8 };
const unknownHours: LicensingBilledVmHours = { availability: 'unavailable', reason: 'missing-usage-units' };
const zeroHours: LicensingBilledVmHours = { availability: 'available', hours: 0 };

const includedComponent: LicensingWindowsLicenseChargeComponent = {
  kind: 'license-included-compute',
  billedVmHours: measuredHours,
  hourlyLicenseRate: { amount: 1.05, currency: 'AUD' },
  estimatedCharge: { amount: 44.94, currency: 'AUD' },
  sourceIds: ['windows-minus-linux-retail'],
  meterIds: ['windows-compute-meter'],
};
const separateComponent: LicensingWindowsLicenseChargeComponent = {
  kind: 'separate-license-charges',
  billedVmHours: { availability: 'available', hours: 0.2 },
  billedCharge: { amount: 0.06, currency: 'AUD' },
  sourceIds: ['stable-billing-window'],
};
const mixedCalculation: LicensingWindowsLicenseChargeCalculation = {
  version: '1.0',
  nonAdditive: true,
  observationWindow: { start: '2026-06-01T00:00:00.000Z', end: '2026-06-27T00:00:00.000Z', stableDays: 27 },
  billedVmHours: { availability: 'available', hours: 43 },
  provenance: 'mixed',
  components: [includedComponent, separateComponent],
  windowLicenseCharge: { amount: 45, currency: 'AUD' },
  normalizationDays: 30,
  projectionAssumption: 'observed-usage-repeats',
};
const explainedCharge: LicensingAzureLicenseCharge = {
  monthly: { amount: 50, currency: 'AUD' },
  annualized: { amount: 600, currency: 'AUD' },
  basis: 'azure-retail',
  confidence: 'medium',
  indicative: true,
  sourceIds: ['stable-billing-window', 'windows-minus-linux-retail'],
  observationWindow: mixedCalculation.observationWindow,
  calculation: mixedCalculation,
};
// Older artifacts remain valid without the additive evidence.
const { calculation: _calculation, ...legacyCharge } = explainedCharge;
const backwardCompatibleCharge: LicensingAzureLicenseCharge = legacyCharge;

// A separate licence charge remains explainable when its units are missing, even with reservation-covered compute.
const unknownHoursCalculation: LicensingWindowsLicenseChargeCalculation = {
  ...mixedCalculation,
  billedVmHours: unknownHours,
  provenance: 'billed',
  components: [{ ...separateComponent, billedVmHours: unknownHours }],
  windowLicenseCharge: { amount: 0.06, currency: 'AUD' },
};
const fallbackComponent: LicensingWindowsLicenseChargeComponent = {
  ...includedComponent,
  kind: 'compute-hours-retail-fallback',
  sourceIds: ['exact-license-meter-retail'],
};
const zeroComponent: LicensingWindowsLicenseChargeComponent = {
  ...separateComponent,
  billedVmHours: zeroHours,
  billedCharge: { amount: 0, currency: 'AUD' },
};
const scheduledCharge: LicensingAzureLicenseCharge = {
  ...explainedCharge,
  monthly: { amount: 44.94, currency: 'AUD' },
  annualized: { amount: 539.28, currency: 'AUD' },
  observationWindow: { start: '2026-06-01', end: '2026-06-30', stableDays: 30 },
  calculation: {
    ...mixedCalculation,
    observationWindow: { start: '2026-06-01', end: '2026-06-30', stableDays: 30 },
    billedVmHours: measuredHours,
    provenance: 'retail-estimate',
    components: [includedComponent],
    windowLicenseCharge: { amount: 44.94, currency: 'AUD' },
  },
};

// @ts-expect-error unknown hours cannot also advertise a measured numeric value.
const invalidUnknownHours: LicensingBilledVmHours = { availability: 'unavailable', reason: 'missing-usage-units', hours: 0 };
// @ts-expect-error missing hours require a reason, not a fabricated zero.
const invalidHoursWithoutReason: LicensingBilledVmHours = { availability: 'unavailable' };
// @ts-expect-error retail components require measured hours to explain the rate multiplication.
const invalidRetailHours: LicensingWindowsLicenseChargeComponent = { ...includedComponent, billedVmHours: unknownHours };
// @ts-expect-error a retail estimate cannot be represented as a directly billed charge.
const invalidRetailProvenance: LicensingWindowsLicenseChargeComponent = { ...includedComponent, billedCharge: { amount: 44.94, currency: 'AUD' } };
// @ts-expect-error directly billed components cannot advertise an estimated component amount.
const invalidBilledProvenance: LicensingWindowsLicenseChargeComponent = { ...separateComponent, estimatedCharge: { amount: 0.06, currency: 'AUD' } };
// @ts-expect-error the full-window calendar denominator must accompany the dates.
const invalidWindow: LicensingWindowsLicenseChargeCalculation['observationWindow'] = { start: '2026-06-01', end: '2026-06-27' };
// @ts-expect-error the current monthly calculation uses a 30-day normalization, not 730 runtime hours.
const invalidNormalization: LicensingWindowsLicenseChargeCalculation = { ...mixedCalculation, normalizationDays: 730 };
// @ts-expect-error explanatory calculation money must never be classified as additive portfolio savings.
const invalidAdditivity: LicensingWindowsLicenseChargeCalculation = { ...mixedCalculation, nonAdditive: false };
// @ts-expect-error an explanation must contain at least one charge component.
const invalidEmptyComponents: LicensingWindowsLicenseChargeCalculation = { ...mixedCalculation, components: [] };
// @ts-expect-error a retail component must retain its price evidence references.
const invalidMissingSources: LicensingWindowsLicenseChargeComponent = { ...includedComponent, sourceIds: [] };
const { provenance: _provenance, ...calculationWithoutProvenance } = mixedCalculation;
// @ts-expect-error a window total must explicitly label billed, estimated or mixed provenance.
const invalidMissingProvenance: LicensingWindowsLicenseChargeCalculation = calculationWithoutProvenance;

void measuredHours;
void zeroHours;
void explainedCharge;
void backwardCompatibleCharge;
void unknownHoursCalculation;
void fallbackComponent;
void zeroComponent;
void scheduledCharge;
void invalidUnknownHours;
void invalidHoursWithoutReason;
void invalidRetailHours;
void invalidRetailProvenance;
void invalidBilledProvenance;
void invalidWindow;
void invalidNormalization;
void invalidAdditivity;
void invalidEmptyComponents;
void invalidMissingSources;
void invalidMissingProvenance;
