export type CustomPropertyKind = 'text';

export interface CustomPropertyDefinition {
  id: string;
  label: string;
  placeholder?: string;
  kind: CustomPropertyKind;
  required: boolean;
}

export interface CustomPropertyDefinitionInput {
  id?: string;
  label: string;
  placeholder?: string;
  kind: CustomPropertyKind;
  required: boolean;
}

export type CustomPropertyValues = Record<string, string>;

export interface EffectiveCustomPropertyDefinition extends CustomPropertyDefinition {
  sourceCompanyId: string;
  sourceCompanyName: string;
  inherited: boolean;
}

export interface ResolvedCustomProperties {
  companyId: string;
  localDefinitions: CustomPropertyDefinition[];
  effectiveDefinitions: EffectiveCustomPropertyDefinition[];
  values: CustomPropertyValues;
  revision: string;
}

export interface SaveCustomPropertiesRequest {
  localDefinitions: CustomPropertyDefinitionInput[];
  values: CustomPropertyValues;
}
