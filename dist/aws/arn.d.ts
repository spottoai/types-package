/** A parsed ARN is an identifier, never proof of ownership or permission. */
export interface AwsArn {
    partition: string;
    service: string;
    region: string;
    accountId: string;
    resource: string;
}
/** Case-preserving ARN syntax shared by graph and environment contracts. */
export declare function parseAwsArn(value: unknown): AwsArn | null;
//# sourceMappingURL=arn.d.ts.map