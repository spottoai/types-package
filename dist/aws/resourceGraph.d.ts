import type { ResourceGraphArtifact } from '../common/resourceGraph.js';
import type { AwsPublicArtifactForbiddenCredentialFields } from './publicArtifacts.js';
/** CloudFormation-style resource type, for example `AWS::EC2::Instance`. */
export declare const AWS_RESOURCE_TYPE_PATTERN: RegExp;
/** Region value for account-global resources such as IAM. */
export declare const AWS_GLOBAL_REGION: "global";
/** The AWS resource graph: the provider-neutral graph bound to one AWS account. */
export type AwsResourceGraphArtifact<AccountId extends string = string, RunId extends string = string> = ResourceGraphArtifact<'aws', AccountId, RunId> & AwsPublicArtifactForbiddenCredentialFields;
/**
 * Validates one untrusted AWS resource graph. Adds AWS identifier formats to
 * the generic structural checks; any discovery family is accepted.
 */
export declare function validateAwsResourceGraphArtifact(value: unknown): AwsResourceGraphArtifact;
//# sourceMappingURL=resourceGraph.d.ts.map