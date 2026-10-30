/**
 * Provider-neutral resource identity vocabulary.
 *
 * Families, relationship types, and synthetic types are open kebab-case
 * identifiers so a provider can add a service without a package change.
 * Validators check identifier format only, never membership in a list.
 */
/** Open, kebab-case discovery family identifier, for example `ec2-instance`. */
export type ResourceFamilyId = string;
/** Provider-native resource type, for example `AWS::EC2::Instance`. */
export type ProviderResourceType = string;
/** Open, kebab-case identifier of the capability or source that produced evidence. */
export type CapabilitySourceId = string;
export type AttributeScalar = string | number | boolean;
/** A scalar, a list of scalars, or a list of flat records of scalars. */
export type AttributeValue = AttributeScalar | AttributeScalar[] | Array<Record<string, AttributeScalar>>;
/** Provider-native resource attributes keyed by camelCase names. */
export type ResourceAttributes = Record<string, AttributeValue>;
export declare const KEBAB_IDENTIFIER_PATTERN: RegExp;
export declare const ATTRIBUTE_KEY_PATTERN: RegExp;
export declare const isKebabIdentifier: (value: unknown) => value is string;
export declare const isResourceFamilyId: (value: unknown) => value is ResourceFamilyId;
export declare const isCapabilitySourceId: (value: unknown) => value is CapabilitySourceId;
export declare const isAttributeKey: (value: unknown) => value is string;
export declare const isAttributeScalar: (value: unknown) => value is AttributeScalar;
export declare const isAttributeValue: (value: unknown) => value is AttributeValue;
export declare const isResourceAttributes: (value: unknown) => value is ResourceAttributes;
//# sourceMappingURL=resourceIdentity.d.ts.map