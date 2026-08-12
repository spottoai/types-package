export type CustomPropertyKind = 'text' | 'checkbox' | 'dropdown';

export type CustomPropertyEntityType = 'company' | 'user';

/** The company levels selected relative to the company that owns the definition. */
export type CustomPropertyAudience = 'currentCompany' | 'directChildCompanies' | 'childCompanies' | 'everyone';

interface CustomPropertyDefinitionBase {
  id: string;
  label: string;
  required: boolean;
  entityType: CustomPropertyEntityType;
  audience: CustomPropertyAudience;
}

interface CustomPropertyDefinitionInputBase {
  id?: string;
  label: string;
  required: boolean;
  entityType: CustomPropertyEntityType;
  audience: CustomPropertyAudience;
}

export interface TextCustomPropertyDefinition extends CustomPropertyDefinitionBase {
  kind: 'text';
  placeholder?: string;
}

export interface CheckboxCustomPropertyDefinition extends CustomPropertyDefinitionBase {
  kind: 'checkbox';
}

export interface DropdownCustomPropertyDefinition extends CustomPropertyDefinitionBase {
  kind: 'dropdown';
  options: string[];
}

export type CustomPropertyDefinition = TextCustomPropertyDefinition | CheckboxCustomPropertyDefinition | DropdownCustomPropertyDefinition;

export interface TextCustomPropertyDefinitionInput extends CustomPropertyDefinitionInputBase {
  kind: 'text';
  placeholder?: string;
}

export interface CheckboxCustomPropertyDefinitionInput extends CustomPropertyDefinitionInputBase {
  kind: 'checkbox';
}

export interface DropdownCustomPropertyDefinitionInput extends CustomPropertyDefinitionInputBase {
  kind: 'dropdown';
  options: string[];
}

export type CustomPropertyDefinitionInput =
  | TextCustomPropertyDefinitionInput
  | CheckboxCustomPropertyDefinitionInput
  | DropdownCustomPropertyDefinitionInput;

/**
 * Values keyed by definition ID. Checkbox values use "true"/"false" and
 * dropdown values contain the selected option.
 */
export type CustomPropertyValues = Record<string, string>;

export type EffectiveCustomPropertyDefinition = CustomPropertyDefinition & {
  sourceCompanyId: string;
  sourceCompanyName: string;
  inherited: boolean;
};

export interface ResolvedCustomProperties {
  companyId: string;
  localDefinitions: CustomPropertyDefinition[];
  effectiveDefinitions: EffectiveCustomPropertyDefinition[];
  values: CustomPropertyValues;
  revision: string;
}

/** Replaces the complete locally owned definition list without writing values. */
export interface SaveCustomPropertyDefinitionsRequest {
  localDefinitions: CustomPropertyDefinitionInput[];
}

/** Identifies the row that owns custom-property values and its hierarchy context. */
export interface CustomPropertySubject {
  entityType: CustomPropertyEntityType;
  subjectId: string;
  companyId: string;
}

/** Reusable value context for company or user create/edit surfaces. */
export interface ResolvedCustomPropertyValues extends CustomPropertySubject {
  effectiveDefinitions: EffectiveCustomPropertyDefinition[];
  values: CustomPropertyValues;
  revision: string;
}

/** Effective user-target schema for company-scoped invite and edit-user forms. */
export interface ResolvedUserCustomPropertySchema {
  companyId: string;
  entityType: 'user';
  effectiveDefinitions: EffectiveCustomPropertyDefinition[];
}

/** Replaces the selected subject's custom-property values without writing definitions. */
export interface SaveCustomPropertyValuesRequest {
  values: CustomPropertyValues;
}
