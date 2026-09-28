"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAIChatFollowUpSuggestions = exports.AI_CHAT_FOLLOW_UP_LIMITS_V1 = void 0;
const internal_js_1 = require("../environment/internal.js");
exports.AI_CHAT_FOLLOW_UP_LIMITS_V1 = Object.freeze({
    suggestions: 3,
    identifierScalars: 64,
    textScalars: 160,
});
const isSuggestion = (value) => (0, internal_js_1.isRecord)(value) &&
    (0, internal_js_1.hasExactKeys)(value, ['suggestionId', 'text']) &&
    (0, internal_js_1.isBoundedString)(value.suggestionId, exports.AI_CHAT_FOLLOW_UP_LIMITS_V1.identifierScalars, { trimmed: true, controls: true }) &&
    (0, internal_js_1.isBoundedString)(value.text, exports.AI_CHAT_FOLLOW_UP_LIMITS_V1.textScalars, { trimmed: true, controls: true });
/** Strictly validates a bounded list of follow-up suggestions with unique ids and unique text. */
const isAIChatFollowUpSuggestions = (value) => Array.isArray(value) &&
    value.length <= exports.AI_CHAT_FOLLOW_UP_LIMITS_V1.suggestions &&
    value.every(isSuggestion) &&
    new Set(value.map(suggestion => suggestion.suggestionId)).size === value.length &&
    new Set(value.map(suggestion => suggestion.text.toLowerCase())).size === value.length;
exports.isAIChatFollowUpSuggestions = isAIChatFollowUpSuggestions;
//# sourceMappingURL=followUps.js.map