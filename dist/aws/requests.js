"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AWS_REQUEST_FORBIDDEN_CREDENTIAL_FIELDS = exports.AWS_REQUEST_ACTIONS = exports.AWS_REQUEST_ENTITY = exports.AWS_REQUEST_PROVIDER = exports.AWS_REQUEST_SCHEMA_VERSION = void 0;
/** Schema version for the first AWS cloud-account Service Bus ingress contract. */
exports.AWS_REQUEST_SCHEMA_VERSION = 1;
/** Canonical provider wire value for AWS request messages. */
exports.AWS_REQUEST_PROVIDER = 'aws';
/** Entity handled by the first AWS Service Bus ingress contract. */
exports.AWS_REQUEST_ENTITY = 'cloudaccount';
/** Actions supported by the first AWS Service Bus ingress contract. */
exports.AWS_REQUEST_ACTIONS = ['onboard', 'refresh', 'delete'];
/** Credential-shaped keys rejected at the AWS request boundary. */
exports.AWS_REQUEST_FORBIDDEN_CREDENTIAL_FIELDS = [
    'accessKeyId',
    'secretAccessKey',
    'sessionToken',
    'credentials',
    'resolvedCredentials',
    'secret',
    'encryptedSecret',
    'credentialReference',
];
//# sourceMappingURL=requests.js.map