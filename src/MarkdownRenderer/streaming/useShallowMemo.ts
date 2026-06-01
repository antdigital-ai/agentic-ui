import { useRef } from 'react';

const shallowEqual = (
  a: Record<string, any> | undefined,
  b: Record<string, any> | undefined,
): boolean => {
  if (a === b) return true;
  if (!a || !b) return false;
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  for (const key of keysA) {
    if (a[key] !== b[key]) return false;
  }
  return true;
};

export const useShallowMemo = <T extends Record<string, any> | undefined>(
  value: T,
): T => {
  const ref = useRef<T>(value);
  if (!shallowEqual(ref.current, value)) {
    ref.current = value;
  }
  return ref.current;
};
