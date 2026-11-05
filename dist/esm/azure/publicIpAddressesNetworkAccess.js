/** Representation limits; clipping must remain visible as incomplete evidence. */
export const PUBLIC_IP_ADDRESSES_NETWORK_ACCESS_LIMITS = Object.freeze({
    partitions: 64,
    selectors: 64,
    decisions: 8,
    sources: 32,
    reasons: 64,
    idLength: 2048,
    labelLength: 256,
    selectorLength: 2048,
    reasonLength: 512,
});
