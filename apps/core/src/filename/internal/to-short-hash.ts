const SHORT_HASH_LENGTH = 5;

export const toShortHash = (hashValue: string): string =>
  hashValue.substring(0, SHORT_HASH_LENGTH);
