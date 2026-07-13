import type { LicensingPlanningView as ExportedLicensingPlanningView } from '../index';
import type { LicensingPlanningView, LicensingPurchaseScenarioEconomics } from './licensing';

const windowsOpportunity: LicensingPlanningView = {
  version: '1.0',
  generatedAt: '2026-07-13T00:00:00.000Z',
  sourceRunId: 'run-123',
  summary: {
    resourceCount: 1,
    appliedCount: 0,
    opportunityCount: 1,
    needsReviewCount: 0,
    ineligibleCount: 0,
    configuration: [{ status: 'disabled', count: 1 }],
    technicalEligibility: [{ status: 'eligible', count: 1 }],
    coverage: [{ status: 'uncovered', count: 1 }],
    entitlement: [{ status: 'unknown', count: 1 }],
    currencies: [
      {
        currency: 'NZD',
        chargeEvidenceResourceCount: 1,
        purchaseScenarioResourceCount: 1,
        historicalEvidenceResourceCount: 1,
        potentialAzureLicenseChargeAvoidedMonthly: 205.28,
        advertisedFullTermInvestment: 487.05,
        advertisedMonthlyEquivalent: 40.59,
        advertisedNetBenefitOverTerm: 1976.31,
        advertisedNetBenefitMonthlyEquivalent: 164.69,
        advertisedPaybackMonths: 2.37,
        historicalGrossPotential: 1847.52,
      },
    ],
  },
  resources: [
    {
      resourceId: '/subscriptions/sub-123/resourceGroups/rg/providers/Microsoft.Compute/virtualMachines/vm-1',
      resourceName: 'vm-1',
      resourceType: 'microsoft.compute/virtualmachines',
      subscriptionId: 'sub-123',
      serviceModel: 'virtual-machine',
      productFamily: 'windows-server',
      edition: 'standard',
      configurationStatus: 'disabled',
      technicalEligibilityStatus: 'eligible',
      coverageStatus: 'uncovered',
      entitlementStatus: 'unknown',
      reasonCodes: ['hybrid-benefit-disabled', 'eligible-opportunity', 'entitlement-not-confirmed'],
      decision: {
        status: 'worth-getting-quote',
        headline: 'Potentially worth investigating',
        explanation: 'The advertised one-year licence investment pays back in less than three months.',
        confidence: 'medium',
        attentionReasons: ['The exact qualifying offer and customer price still require confirmation.'],
      },
      evidence: {
        basis: 'observed-billing',
        confidence: 'high',
        observationWindow: {
          start: '2026-06-13T00:00:00.000Z',
          end: '2026-07-09T00:00:00.000Z',
          stableDays: 27,
        },
        sourceIds: ['stable-billing-window'],
      },
      licenseRequirement: {
        basis: 'per-resource-minimum',
        resourceCoreCount: 4,
        minimumLicensableCores: 8,
        requiredLicenseCores: 8,
        packSizeCores: 8,
        requiredPackCount: 1,
      },
      economics: {
        azureLicenseCharge: {
          monthly: { amount: 205.28, currency: 'NZD' },
          annualized: { amount: 2463.36, currency: 'NZD' },
          basis: 'observed-billing',
          confidence: 'high',
          indicative: false,
          observationWindow: {
            start: '2026-06-13T00:00:00.000Z',
            end: '2026-07-09T00:00:00.000Z',
            stableDays: 27,
          },
          sourceIds: ['stable-billing-window'],
        },
        purchaseScenario: {
          scenarioType: 'advertised-public-price',
          offer: {
            productKey: 'windows-server-standard-2025-subscription-8-core-1-year',
            productName: 'Windows Server 2025 Standard',
            productFamily: 'windows-server',
            productVersion: '2025',
            edition: 'standard',
            acquisitionModel: 'annual-subscription',
            qualifyingRightsStatus: 'approved',
            advertisedUnitPrice: { amount: 275, currency: 'USD' },
            priceUnit: 'core-pack-term',
            packSizeCores: 8,
            commitmentTermMonths: 12,
            billingCadence: 'annual',
            cancellationTerms: 'unknown',
            taxTreatment: 'tax-exclusive',
            sourceId: 'seepath-msrp-2026-04',
            asOf: '2026-04-01',
          },
          conversion: {
            sourceCurrency: 'USD',
            displayCurrency: 'NZD',
            rate: '1.77107594',
            asOf: '2026-07-10',
            sourceId: 'azure-retail-fx-2026-07-10',
            sourceUnitPrice: { amount: 275, currency: 'USD' },
            convertedUnitPrice: { amount: 487.05, currency: 'NZD' },
          },
          calculation: {
            version: '1.0',
            fullTermInvestmentBasis: 'converted-unit-price-times-required-packs',
            runtimeLicenseCostBasis: 'whole-committed-terms-required',
            paybackBasis: 'full-term-investment-divided-by-monthly-avoidable-charge',
            moneyDecimalPlaces: 2,
            ratioDecimalPlaces: 2,
          },
          economics: {
            fullTermInvestment: { amount: 487.05, currency: 'NZD' },
            monthlyEquivalent: { amount: 40.59, currency: 'NZD' },
            grossAvoidedOverTerm: { amount: 2463.36, currency: 'NZD' },
            netBenefitOverTerm: { amount: 1976.31, currency: 'NZD' },
            netBenefitMonthlyEquivalent: { amount: 164.69, currency: 'NZD' },
            paybackMonths: 2.37,
            roiOverTermPercent: 405.77,
            breakEvenUtilizationPercent: 19.77,
            maximumUsageReductionBeforeLossPercent: 80.23,
            runtimeScenarios: [
              {
                expectedRuntimeMonths: 1,
                licenseTermsRequired: 1,
                committedLicenseCost: { amount: 487.05, currency: 'NZD' },
                azureLicenseChargeAvoided: { amount: 205.28, currency: 'NZD' },
                netBenefit: { amount: -281.77, currency: 'NZD' },
                roiPercent: -57.85,
              },
              {
                expectedRuntimeMonths: 12,
                licenseTermsRequired: 1,
                committedLicenseCost: { amount: 487.05, currency: 'NZD' },
                azureLicenseChargeAvoided: { amount: 2463.36, currency: 'NZD' },
                netBenefit: { amount: 1976.31, currency: 'NZD' },
                roiPercent: 405.77,
              },
            ],
          },
          confidence: 'medium',
          sourceIds: ['seepath-msrp-2026-04', 'azure-retail-fx-2026-07-10', 'stable-billing-window'],
          assumptionCodes: ['full-term-commitment', 'runtime-charge-remains-stable'],
        },
        outcome: 'indicative-saving',
      },
      historicalEvidence: {
        window: {
          startDate: '2025-07-01',
          endDate: '2026-06-30',
          stableCutoffDate: '2026-07-09',
          lookbackMonths: 12,
          basis: 'stable-actual-billing',
        },
        grossPotential: { amount: 1847.52, currency: 'NZD' },
        averageObservedMonthlyCharge: { amount: 205.28, currency: 'NZD' },
        minimumObservedMonthlyCharge: { amount: 198.2, currency: 'NZD' },
        maximumObservedMonthlyCharge: { amount: 208.4, currency: 'NZD' },
        consecutiveObservedMonths: 9,
        firstObservedChargeDate: '2025-10-01',
        lastObservedChargeDate: '2026-06-30',
        persistence: 'persistent',
        confidence: 'high',
        coverage: {
          observedMonths: 9,
          partialMonths: 0,
          zeroMonths: 0,
          unavailableMonths: 3,
          conflictingMonths: 0,
        },
        months: [
          {
            month: '2026-06',
            status: 'observed',
            includedCharge: { amount: 205.28, currency: 'NZD' },
            observedStartDate: '2026-06-01',
            observedEndDate: '2026-06-30',
            sourceIds: ['billing-2026-06'],
            reasonCodes: [],
          },
        ],
        sourceIds: ['historical-stable-billing'],
        reasonCodes: ['partial-historical-coverage'],
      },
      actionProfile: {
        implementationEffort: 'medium',
        serviceRestartRequired: false,
        reversible: true,
        procurementRequired: true,
        licenseTrackingRequired: true,
        renewalRequired: true,
        renewalIntervalMonths: 12,
        rolesRequired: ['procurement', 'licensing-administrator', 'azure-resource-owner'],
        steps: [
          {
            order: 1,
            code: 'confirm-rights-or-quote',
            title: 'Confirm qualifying rights or request a quote',
            description: 'Confirm the exact offer, core quantity, term, and Azure Hybrid Benefit rights.',
          },
          {
            order: 2,
            code: 'enable-hybrid-benefit',
            title: 'Enable Azure Hybrid Benefit',
            description: 'Enable the benefit on the Azure VM after rights are confirmed.',
            link: {
              label: 'Microsoft activation guidance',
              url: 'https://learn.microsoft.com/azure/virtual-machines/windows/hybrid-use-benefit-licensing',
            },
          },
        ],
      },
      recommendationIds: ['resources-subscriptions_ahb-windows-vm'],
    },
  ],
  pricingContext: {
    displayCurrency: 'NZD',
    sources: [
      {
        id: 'seepath-msrp-2026-04',
        type: 'public-guide',
        name: 'Seepath Microsoft CSP Pricing Guide',
        url: 'https://www.seepath.com/microsoft-products',
        asOf: '2026-04-01',
        snapshotId: 'seepath-msrp-2026-04',
      },
    ],
    assumptions: [
      {
        code: 'full-term-commitment',
        label: 'Full term is committed',
        value: '12 months',
        explanation: 'Runtime scenarios include the full committed licence term even when expected runtime is shorter.',
      },
      {
        code: 'runtime-charge-remains-stable',
        label: 'PAYG charge remains stable',
        explanation: 'Future avoided charges use the current observed monthly licence charge.',
      },
    ],
    disclaimer: 'Indicative decision-support estimate only.',
  },
  freshness: {
    status: 'partial',
    resources: { status: 'current', asOf: '2026-07-13T00:00:00.000Z' },
    billing: { status: 'partial', asOf: '2026-07-09T00:00:00.000Z' },
    historicalBilling: { status: 'partial', asOf: '2026-06-30T00:00:00.000Z' },
    azureRetail: { status: 'partial' },
    publicPricing: { status: 'current', asOf: '2026-04-01' },
    fx: { status: 'current', asOf: '2026-07-10' },
  },
};

const sqlUnavailable: LicensingPlanningView = {
  ...windowsOpportunity,
  summary: {
    ...windowsOpportunity.summary,
    opportunityCount: 0,
    needsReviewCount: 1,
    currencies: [],
  },
  resources: [
    {
      resourceId: '/subscriptions/sub-123/resourceGroups/rg/providers/Microsoft.Sql/managedInstances/sql-mi',
      resourceName: 'sql-mi',
      resourceType: 'microsoft.sql/managedinstances',
      subscriptionId: 'sub-123',
      serviceModel: 'sql-managed-instance',
      productFamily: 'sql-server',
      edition: 'enterprise',
      configurationStatus: 'enabled',
      technicalEligibilityStatus: 'conditionally-eligible',
      coverageStatus: 'unknown',
      entitlementStatus: 'unknown',
      reasonCodes: ['hybrid-benefit-enabled', 'insufficient-billing-evidence', 'entitlement-not-confirmed'],
      decision: {
        status: 'eligibility-or-pricing-unresolved',
        headline: 'Confirm existing licence coverage',
        explanation: 'The benefit is enabled but qualifying entitlement and billing coverage are not confirmed.',
        confidence: 'unknown',
        attentionReasons: ['Do not purchase or reconfigure until central assignment is reviewed.'],
      },
      evidence: {
        basis: 'unavailable',
        confidence: 'unknown',
      },
      economics: {
        outcome: 'unavailable',
        unavailableReason: 'insufficient-billing-evidence',
      },
      actionProfile: {
        implementationEffort: 'medium',
        serviceRestartRequired: 'unknown',
        reversible: 'unknown',
        procurementRequired: false,
        licenseTrackingRequired: true,
        renewalRequired: true,
        rolesRequired: ['billing-administrator', 'software-asset-manager'],
        steps: [],
      },
    },
  ],
};

const exportedContract: ExportedLicensingPlanningView = windowsOpportunity;

const invalidVersion: LicensingPlanningView = {
  ...windowsOpportunity,
  // @ts-expect-error the initial AHUB contract only accepts version 1.0.
  version: '9.9',
};

const invalidBillingCadence: LicensingPlanningView = {
  ...windowsOpportunity,
  resources: [
    {
      ...windowsOpportunity.resources[0],
      economics: {
        ...windowsOpportunity.resources[0].economics,
        purchaseScenario: {
          ...windowsOpportunity.resources[0].economics.purchaseScenario!,
          offer: {
            ...windowsOpportunity.resources[0].economics.purchaseScenario!.offer,
            // @ts-expect-error billing cadence describes payment timing, not the commitment term.
            billingCadence: 'twelve-month-term',
          },
        },
      },
    },
  ],
};

// @ts-expect-error a purchase scenario must expose the full committed investment.
const invalidIncompleteScenarioEconomics: LicensingPurchaseScenarioEconomics = {
  monthlyEquivalent: { amount: 40.59, currency: 'NZD' },
  grossAvoidedOverTerm: { amount: 2463.36, currency: 'NZD' },
  netBenefitOverTerm: { amount: 1976.31, currency: 'NZD' },
  netBenefitMonthlyEquivalent: { amount: 164.69, currency: 'NZD' },
  paybackMonths: 2.37,
  roiOverTermPercent: 405.77,
  breakEvenUtilizationPercent: 19.77,
  maximumUsageReductionBeforeLossPercent: 80.23,
  runtimeScenarios: [],
};

const invalidHistoricalMonthStatus: LicensingPlanningView = {
  ...windowsOpportunity,
  resources: [
    {
      ...windowsOpportunity.resources[0],
      historicalEvidence: {
        ...windowsOpportunity.resources[0].historicalEvidence!,
        months: [
          {
            ...windowsOpportunity.resources[0].historicalEvidence!.months[0],
            // @ts-expect-error estimated months cannot be represented as stable historical evidence.
            status: 'estimated',
          },
        ],
      },
    },
  ],
};

void windowsOpportunity;
void sqlUnavailable;
void exportedContract;
void invalidVersion;
void invalidBillingCadence;
void invalidIncompleteScenarioEconomics;
void invalidHistoricalMonthStatus;
