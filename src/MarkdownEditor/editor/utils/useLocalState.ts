/* eslint-disable @typescript-eslint/ban-types */
import { useRef, useState } from 'react';
import { useRefFunction } from '../../../Hooks/useRefFunction';

type GetFields<
  T,
  K = {
    [P in keyof T]: T[P] extends Function ? never : P;
  },
> = K[keyof K];

type SetState<T extends Record<string, any>, F extends GetFields<T>> = (
  data: { [P in F]?: T[P] } | ((state: T) => void),
) => void;

export const useLocalState = <T extends Record<string, any>>(
  data: (() => T) | T,
): [T, SetState<T, GetFields<T>>] => {
  const initialData = data instanceof Function ? data() : data;
  const [state, setReactState] = useState<T>(initialData);

  // Use ref to ensure we always have the latest state in our setter
  const stateRef = useRef(state);
  stateRef.current = state;

  const setState = useRefFunction((update: any) => {
    if (update instanceof Function) {
      setReactState((prevState) => {
        const newState = { ...prevState };
        update(newState);
        return newState;
      });
    } else {
      setReactState((prevState) => ({
        ...prevState,
        ...update,
      }));
    }
  });

  return [state, setState];
};
