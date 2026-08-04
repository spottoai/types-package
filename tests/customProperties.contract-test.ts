import type {
  Company,
  CompanyCreate,
  CustomPropertyDefinition,
  CustomPropertyDefinitionInput,
  EffectiveCustomPropertyDefinition,
  ResolvedCustomProperties,
  SaveCustomPropertiesRequest,
} from '../src';

const localDefinition = {
  id: '2ae62863-3792-4d22-b72a-ee3614b4ed75',
  label: 'Business ID',
  placeholder: 'Enter the CRM business ID',
  kind: 'text',
  required: true,
} satisfies CustomPropertyDefinition;

const newDefinition = {
  label: 'CRM ID',
  kind: 'text',
  required: false,
} satisfies CustomPropertyDefinitionInput;

const effectiveDefinition = {
  ...localDefinition,
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

const saveRequest = {
  localDefinitions: [localDefinition, newDefinition],
  values,
} satisfies SaveCustomPropertiesRequest;

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
  // @ts-expect-error Text is the only supported custom-property kind in v1.
  kind: 'select',
  required: false,
};

void [localDefinition, newDefinition, effectiveDefinition, resolvedProperties, saveRequest, storedCompany, companyCreate, invalidDefinitionKind];
