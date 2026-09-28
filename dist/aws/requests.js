"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AWS_FORBIDDEN_CREDENTIAL_FIELDS = exports.AWS_SCHEDULED_REFRESH_SCAN_KINDS = exports.AWS_COMMAND_ACTIONS = exports.AWS_COMMAND_ENTITIES = exports.AWS_COMMAND_PROVIDER = exports.AWS_COMMAND_SCHEMA_VERSION = void 0;
/** Schema version for AWS estate orchestration commands. */
exports.AWS_COMMAND_SCHEMA_VERSION = 1;
/** Canonical provider wire value for AWS commands. */
exports.AWS_COMMAND_PROVIDER = 'aws';
/** Entities handled by AWS estate orchestration. */
exports.AWS_COMMAND_ENTITIES = ['estate', 'account', 'billing-source', 'organization-commitments', 'scheduler'];
/** Actions supported across AWS estate orchestration commands. */
exports.AWS_COMMAND_ACTIONS = ['reconcile', 'refresh', 'delete', 'tick'];
/** Scheduled AWS scan cadences emitted by the enqueue-only API scheduler. */
exports.AWS_SCHEDULED_REFRESH_SCAN_KINDS = ['full', 'components'];
/** Credential-shaped keys forbidden from shared AWS configuration and commands. */
exports.AWS_FORBIDDEN_CREDENTIAL_FIELDS = [
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