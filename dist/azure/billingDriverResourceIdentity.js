"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSafeAwsBillingDriverResourceId = void 0;
/** Structural safety for recorded AWS IDs; service semantics and ownership require producer evidence. */
const isSafeAwsBillingDriverResourceId = (value, accountId) => {
    if (typeof accountId !== 'string' ||
        !/^\d{12}$/u.test(accountId) ||
        typeof value !== 'string' ||
        value.length === 0 ||
        value.length > 2048 ||
        value.trim() !== value ||
        /[\s\\%?#]/u.test(value) ||
        Array.from(value).some(character => character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127) ||
        value.split('/').some(segment => segment === '.' || segment === '..'))
        return false;
    if (value.startsWith('arn:')) {
        const arn = /^arn:(?:aws|aws-cn|aws-us-gov|aws-iso|aws-iso-b|aws-iso-e|aws-iso-f):[a-z0-9-]+:[a-z0-9-]*:(\d{12}|):\/?[A-Za-z0-9][A-Za-z0-9._:/+=,@$-]*$/u.exec(value);
        return Boolean(arn && (arn[1] === '' || arn[1] === accountId));
    }
    return /^[A-Za-z0-9][A-Za-z0-9._-]*$/u.test(value) && !/^[a-f0-9]{64}$/iu.test(value);
};
exports.isSafeAwsBillingDriverResourceId = isSafeAwsBillingDriverResourceId;
//# sourceMappingURL=billingDriverResourceIdentity.js.map