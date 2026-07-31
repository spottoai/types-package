import type { AwsEstateAccountMembership, AwsEstateBillingSource, AwsEstatesManifest, AwsOrganizationEstate, AwsStandaloneEstate } from '../index';

// @ts-expect-error The deleted request-status Table DTO must not remain exported.
import type { AwsCloudAccountEngineRequestStatusRecord } from '../index';
// @ts-expect-error Alpha contracts do not retain version-suffixed manifest aliases.
import type { AwsEstatesManifestV1 } from '../index';

type ExampleCompanyId = 'company-example-organization';
type ExampleEstateId = 'estate-example-organization';
type ExampleAccountId = '111122223333' | '444455556666' | '123456789012';

const managementAccount: AwsEstateAccountMembership<ExampleCompanyId, ExampleEstateId, '111122223333'> = {
  schemaVersion: 1,
  companyId: 'company-example-organization',
  estateId: 'estate-example-organization',
  accountId: '111122223333',
  name: 'Example management account',
  roleArn: 'arn:aws:iam::111122223333:role/ExampleReadOnlyRole',
  purposes: ['organization-discovery', 'billing-definition'],
  enabled: true,
};

const billingStorageAccount: AwsEstateAccountMembership<ExampleCompanyId, ExampleEstateId, '444455556666'> = {
  schemaVersion: 1,
  companyId: 'company-example-organization',
  estateId: 'estate-example-organization',
  accountId: '444455556666',
  name: 'Example billing storage account',
  roleArn: 'arn:aws:iam::444455556666:role/ExampleReadOnlyRole',
  purposes: ['billing-storage'],
  enabled: true,
};

const resourceAccount: AwsEstateAccountMembership<ExampleCompanyId, ExampleEstateId, '123456789012'> = {
  schemaVersion: 1,
  companyId: 'company-example-organization',
  estateId: 'estate-example-organization',
  accountId: '123456789012',
  name: 'Example resource account',
  roleArn: 'arn:aws:iam::123456789012:role/ExampleReadOnlyRole',
  purposes: ['resource-discovery'],
  enabled: true,
};

const organizationBillingSource: AwsEstateBillingSource<ExampleCompanyId, ExampleEstateId, ExampleAccountId, '111122223333', '444455556666'> = {
  schemaVersion: 1,
  companyId: 'company-example-organization',
  estateId: 'estate-example-organization',
  billingSourceId: 'example-data-export',
  name: 'Example Data Export',
  definitionRoleAccountId: '111122223333',
  payerAccountId: '111122223333',
  storageRoleAccountId: '444455556666',
  export: {
    type: 'DATA_EXPORTS',
    exportArn: 'arn:aws:bcm-data-exports:us-east-1:111122223333:export/00000000-0000-4000-8000-000000000000',
    exportName: 'example-data-export',
    destination: {
      bucketName: 'example-organization-data-exports',
      basePrefix: 'billing/data-exports',
      region: 'us-east-1',
      bucketOwnerAccountId: '444455556666',
    },
  },
  coverage: { type: 'estate' },
  enabled: true,
};

const organizationEstate: AwsOrganizationEstate<ExampleCompanyId, ExampleEstateId, ExampleAccountId> = {
  schemaVersion: 1,
  companyId: 'company-example-organization',
  estateId: 'estate-example-organization',
  name: 'Example organization',
  kind: 'organization',
  enabled: true,
  organization: {
    schemaVersion: 1,
    companyId: 'company-example-organization',
    estateId: 'estate-example-organization',
    organizationId: 'o-exampleorg123',
    managementAccountId: '111122223333',
    accountSource: 'manual',
    roleDeploymentMode: 'customer-managed',
    excludedAccounts: [
      {
        schemaVersion: 1,
        companyId: 'company-example-organization',
        estateId: 'estate-example-organization',
        accountId: '999988887777',
        name: 'Example intentionally excluded account',
      },
    ],
  },
  accounts: [managementAccount, billingStorageAccount, resourceAccount],
  billingSources: [organizationBillingSource],
};

const organizationManifest: AwsEstatesManifest<ExampleCompanyId> = {
  schemaVersion: 1,
  provider: 'AWS',
  companyId: 'company-example-organization',
  updatedAt: '2026-07-31T00:00:00.000Z',
  estates: [organizationEstate],
};

const standaloneEstate: AwsStandaloneEstate<'company-example-standalone', 'estate-example-standalone', '123456789012'> = {
  schemaVersion: 1,
  companyId: 'company-example-standalone',
  estateId: 'estate-example-standalone',
  name: 'Example standalone estate',
  kind: 'standalone',
  enabled: true,
  accounts: [
    {
      schemaVersion: 1,
      companyId: 'company-example-standalone',
      estateId: 'estate-example-standalone',
      accountId: '123456789012',
      name: 'Example standalone account',
      roleArn: 'arn:aws:iam::123456789012:role/ExampleReadOnlyRole',
      purposes: ['resource-discovery', 'billing-definition', 'billing-storage'],
      enabled: true,
    },
  ],
  billingSources: [
    {
      schemaVersion: 1,
      companyId: 'company-example-standalone',
      estateId: 'estate-example-standalone',
      billingSourceId: 'example-cur',
      name: 'Example CUR',
      definitionRoleAccountId: '123456789012',
      payerAccountId: '123456789012',
      storageRoleAccountId: '123456789012',
      export: {
        type: 'CUR',
        reportName: 'example-cur-report',
        destination: {
          bucketName: 'example-cur-bucket',
          basePrefix: 'billing/cur',
          region: 'ap-southeast-2',
        },
      },
      coverage: { type: 'estate' },
      enabled: true,
    },
  ],
};

const invalidManifestCompany: AwsEstatesManifest<ExampleCompanyId> = {
  ...organizationManifest,
  // @ts-expect-error The route-authoritative company identity must match the manifest.
  companyId: 'company-other',
};

const invalidMembershipEstate: AwsEstateAccountMembership<ExampleCompanyId, ExampleEstateId, '123456789012'> = {
  ...resourceAccount,
  // @ts-expect-error A membership cannot silently move to another estate.
  estateId: 'estate-other',
};

const invalidMembershipRoleAccount: AwsEstateAccountMembership<ExampleCompanyId, ExampleEstateId, '123456789012'> = {
  ...resourceAccount,
  // @ts-expect-error The AssumeRole ARN account must match the membership account.
  roleArn: 'arn:aws:iam::444455556666:role/ExampleReadOnlyRole',
};

const invalidDefinitionRoleAccount: AwsEstateBillingSource<ExampleCompanyId, ExampleEstateId, ExampleAccountId, '111122223333', '444455556666'> = {
  ...organizationBillingSource,
  // @ts-expect-error Definition and storage role identities are independently bound.
  definitionRoleAccountId: '444455556666',
};

const invalidDataExportArnAccount: AwsEstateBillingSource<ExampleCompanyId, ExampleEstateId, ExampleAccountId, '111122223333', '444455556666'> = {
  ...organizationBillingSource,
  export: {
    ...organizationBillingSource.export,
    // @ts-expect-error The Data Exports ARN account must match the definition role account.
    exportArn: 'arn:aws:bcm-data-exports:us-east-1:444455556666:export/00000000-0000-4000-8000-000000000000',
  },
};

const invalidStandaloneOrganization: AwsStandaloneEstate<'company-example-standalone', 'estate-example-standalone', '123456789012'> = {
  ...standaloneEstate,
  // @ts-expect-error Standalone estates cannot persist AWS Organizations metadata.
  organization: {
    schemaVersion: 1,
    companyId: 'company-example-standalone',
    estateId: 'estate-example-standalone',
    organizationId: 'o-unexpectedexample',
    managementAccountId: '123456789012',
    accountSource: 'manual',
    roleDeploymentMode: 'customer-managed',
    excludedAccounts: [],
  },
};

const invalidOrganizationAccountSource: AwsOrganizationEstate<ExampleCompanyId, ExampleEstateId, ExampleAccountId> = {
  ...organizationEstate,
  organization: {
    ...organizationEstate.organization,
    // @ts-expect-error AWS Organizations discovery is not implemented yet.
    accountSource: 'aws-organizations',
  },
};

const invalidOrganizationRoleDeployment: AwsOrganizationEstate<ExampleCompanyId, ExampleEstateId, ExampleAccountId> = {
  ...organizationEstate,
  organization: {
    ...organizationEstate.organization,
    // @ts-expect-error Automatic role deployment is not implemented yet.
    roleDeploymentMode: 'automatic',
  },
};

const invalidManifestExternalId: AwsEstatesManifest<ExampleCompanyId> = {
  ...organizationManifest,
  // @ts-expect-error External ID is setup-only and must never be persisted.
  externalId: 'server-owned-value',
};

const invalidMembershipAccessKey: AwsEstateAccountMembership<ExampleCompanyId, ExampleEstateId, '123456789012'> = {
  ...resourceAccount,
  // @ts-expect-error Raw AWS credentials must never be persisted.
  accessKeyId: 'AKIAEXAMPLE',
};

const invalidBillingConnectionString: AwsEstateBillingSource<ExampleCompanyId, ExampleEstateId, ExampleAccountId> = {
  ...organizationBillingSource,
  // @ts-expect-error Storage credentials must never be persisted.
  connectionString: 'DefaultEndpointsProtocol=https;AccountKey=example',
};

void organizationManifest;
void standaloneEstate;
void invalidManifestCompany;
void invalidMembershipEstate;
void invalidMembershipRoleAccount;
void invalidDefinitionRoleAccount;
void invalidDataExportArnAccount;
void invalidStandaloneOrganization;
void invalidOrganizationAccountSource;
void invalidOrganizationRoleDeployment;
void invalidManifestExternalId;
void invalidMembershipAccessKey;
void invalidBillingConnectionString;
