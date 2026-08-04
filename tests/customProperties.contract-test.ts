import type {
  Company,
  CompanyCreate,
  CompanyUser,
  CheckboxCustomPropertyDefinitionInput,
  CustomPropertyAudience,
  CustomPropertyDefinition,
  CustomPropertyDefinitionInput,
  CustomPropertyEntityType,
  EffectiveCustomPropertyDefinition,
  DropdownCustomPropertyDefinitionInput,
  ResolvedCustomPropertyValues,
  ResolvedCustomProperties,
  ResolvedUserCustomPropertySchema,
  SaveCustomPropertyDefinitionsRequest,
  SaveCustomPropertyValuesRequest,
  User,
} from '../src';

const companyEntityType: CustomPropertyEntityType = 'company';
const everyoneAudience: CustomPropertyAudience = 'everyone';

const localDefinition = {
  id: '2ae62863-3792-4d22-b72a-ee3614b4ed75',
  label: 'Business ID',
  placeholder: 'Enter the CRM business ID',
  kind: 'text',
  required: true,
  entityType: 'company',
  audience: 'everyone',
} satisfies CustomPropertyDefinition;

const newDefinition = {
  label: 'CRM ID',
  kind: 'text',
  required: false,
  entityType: 'user',
  audience: 'childCompanies',
} satisfies CustomPropertyDefinitionInput;

const checkboxDefinition = {
  label: 'Requires purchase order',
  kind: 'checkbox',
  required: false,
  entityType: 'company',
  audience: 'currentCompany',
} satisfies CheckboxCustomPropertyDefinitionInput;

const dropdownDefinition = {
  label: 'Customer segment',
  kind: 'dropdown',
  options: ['Enterprise', 'Mid-market', 'Small business'],
  required: true,
  entityType: 'company',
  audience: 'everyone',
} satisfies DropdownCustomPropertyDefinitionInput;

const effectiveDefinition = {
  ...localDefinition,
  sourceCompanyId: 'parent-company',
  sourceCompanyName: 'Parent Company',
  inherited: true,
} satisfies EffectiveCustomPropertyDefinition;

const effectiveUserDefinition = {
  id: '6b97679f-9c79-48a3-a4dc-287a44c76d4c',
  ...newDefinition,
  sourceCompanyId: 'parent-company',
  sourceCompanyName: 'Parent Company',
  inherited: true,
} satisfies EffectiveCustomPropertyDefinition;

const values = {
  [localDefinition.id]: 'BUS-123',
};

const resolvedProperties = {
  companyId: 'child-company',
  localDefinitions: [localDefinition],
  effectiveDefinitions: [effectiveDefinition],
  values,
  revision: 'opaque-revision',
} satisfies ResolvedCustomProperties;

const saveDefinitionsRequest = {
  localDefinitions: [localDefinition, newDefinition],
} satisfies SaveCustomPropertyDefinitionsRequest;

const saveCompanyValues = {
  values,
} satisfies SaveCustomPropertyValuesRequest;

const resolvedUserValues = {
  entityType: 'user',
  subjectId: 'user-123',
  companyId: 'child-company',
  effectiveDefinitions: [effectiveUserDefinition],
  values: { [effectiveUserDefinition.id]: 'CRM-456' },
  revision: 'user-row-etag-and-tree-etag',
} satisfies ResolvedCustomPropertyValues;

const saveUserValues = {
  values,
} satisfies SaveCustomPropertyValuesRequest;

const resolvedUserSchema = {
  companyId: 'child-company',
  entityType: 'user',
  effectiveDefinitions: [effectiveUserDefinition],
} satisfies ResolvedUserCustomPropertySchema;

const storedCompany = {
  id: 'child-company',
  name: 'Child Company',
  createdAt: new Date('2026-08-04T00:00:00.000Z'),
  updatedAt: new Date('2026-08-04T00:00:00.000Z'),
  createdBy: 'user-123',
  customPropertyDefinitions: [localDefinition],
  customProperties: values,
} satisfies Company;

const companyCreate = {
  name: 'Child Company',
  parentId: 'parent-company',
  customProperties: values,
} satisfies CompanyCreate;

const invalidDefinitionKind: CustomPropertyDefinitionInput = {
  label: 'Unsupported property',
  // @ts-expect-error Only text, checkbox, and dropdown kinds are supported in v1.
  kind: 'select',
  required: false,
  entityType: 'company',
  audience: 'currentCompany',
};

// @ts-expect-error Dropdown definitions require an ordered options array.
const dropdownWithoutOptions: CustomPropertyDefinitionInput = {
  label: 'Invalid dropdown',
  kind: 'dropdown',
  required: false,
  entityType: 'company',
  audience: 'everyone',
};

const checkboxWithOptions = {
  label: 'Invalid checkbox',
  kind: 'checkbox',
  // @ts-expect-error Checkbox definitions do not own dropdown options.
  options: ['Yes', 'No'],
  required: false,
  entityType: 'company',
  audience: 'everyone',
} satisfies CustomPropertyDefinitionInput;

const invalidEntityType: CustomPropertyDefinitionInput = {
  label: 'Unsupported entity',
  kind: 'text',
  required: false,
  // @ts-expect-error Only company and user subjects are supported.
  entityType: 'resource',
  audience: 'everyone',
};

const invalidAudience: CustomPropertyDefinitionInput = {
  label: 'Unsupported audience',
  kind: 'text',
  required: false,
  entityType: 'company',
  // @ts-expect-error Audience must be relative to the owning company hierarchy.
  audience: 'tenant',
};

const user = {
  id: 'user-123',
  companyId: 'child-company',
  firstName: 'Ada',
  lastName: 'Lovelace',
  email: 'ada@example.com',
  createdAt: '2026-08-04T00:00:00.000Z',
  updatedAt: '2026-08-04T00:00:00.000Z',
  role: 1,
  isPendingInvite: false,
  invitedBy: 'admin-123',
  customProperties: values,
} satisfies User;

const companyUser = {
  userId: 'user-123',
  companyId: 'child-company',
  email: 'ada@example.com',
  firstName: 'Ada',
  lastName: 'Lovelace',
  role: 1,
  isPendingInvite: false,
  invitedBy: 'admin-123',
  createdAt: new Date('2026-08-04T00:00:00.000Z'),
  updatedAt: new Date('2026-08-04T00:00:00.000Z'),
  customProperties: values,
} satisfies CompanyUser;

void [
  companyEntityType,
  everyoneAudience,
  localDefinition,
  newDefinition,
  checkboxDefinition,
  dropdownDefinition,
  effectiveDefinition,
  effectiveUserDefinition,
  resolvedProperties,
  saveDefinitionsRequest,
  saveCompanyValues,
  resolvedUserValues,
  saveUserValues,
  resolvedUserSchema,
  storedCompany,
  companyCreate,
  invalidDefinitionKind,
  dropdownWithoutOptions,
  checkboxWithOptions,
  invalidEntityType,
  invalidAudience,
  user,
  companyUser,
];
