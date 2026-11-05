/** Case-preserving ARN syntax shared by graph and environment contracts. */
export function parseAwsArn(value) {
    if (typeof value !== 'string' || value.length === 0 || value.length > 4096)
        return null;
    for (const character of value) {
        const codePoint = character.codePointAt(0);
        if (codePoint <= 0x20 || (codePoint >= 0x7f && codePoint <= 0x9f) || (codePoint >= 0xd800 && codePoint <= 0xdfff))
            return null;
    }
    const match = /^arn:(aws(?:-[a-z0-9-]+)?):([^:]+):([^:]*):([^:]*):(.+)$/u.exec(value);
    if (!match)
        return null;
    const [, partition, service, region, accountId, resource] = match;
    return { partition, service, region, accountId, resource };
}
