export const EMPTY_DYNAMIC_SEGMENT = "_empty";

export function ensureStaticParams<T>(params: T[], fallback: T): T[] {
  return params.length > 0 ? params : [fallback];
}
