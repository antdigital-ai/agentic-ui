/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable no-param-reassign */
import { customAlphabet } from 'nanoid';
import React from 'react';

export const nid = customAlphabet(
  '1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
  13,
);

export const copy = <T = any>(data: T): T => JSON.parse(JSON.stringify(data));

export const isMod = (
  e: MouseEvent | KeyboardEvent | React.KeyboardEvent | React.MouseEvent,
) => {
  return e.metaKey || e.ctrlKey;
};

export { download, modal$ } from './sideEffects';

export { isMarkdown } from './isMarkdown';

export function debounce(
  func: { (): void; apply?: any },
  delay: number | undefined,
) {
  let timer: any = null;
  const fn = function () {
    clearTimeout(timer);
    timer = setTimeout(() => {
      //@ts-ignore
      func.apply(this, arguments);
    }, delay);
  };
  fn.flush = function () {
    clearTimeout(timer);
    //@ts-ignore
    func.apply(this, arguments);
  };
  fn.cancel = function () {
    clearTimeout(timer);
  };
  return fn;
}

import { DependencyList, useCallback, useEffect, useRef } from 'react';

function useTimeoutFn(
  fn: Function,
  ms: number = 0,
): [() => boolean | null, () => void, () => void] {
  const ready = useRef<boolean | null>(false);
  const timeout = useRef<ReturnType<typeof setTimeout>>();
  const callback = useRef(fn);

  const isReady = useCallback(() => ready.current, []);

  const set = useCallback(() => {
    ready.current = false;
    timeout.current && clearTimeout(timeout.current);

    timeout.current = setTimeout(() => {
      ready.current = true;
      callback.current();
    }, ms);
  }, [ms]);

  const clear = useCallback(() => {
    ready.current = null;
    timeout.current && clearTimeout(timeout.current);
  }, []);

  // update ref when function changes
  useEffect(() => {
    callback.current = fn;
  }, [fn]);

  // set on mount, clear on unmount
  useEffect(() => {
    set();

    return clear;
  }, [ms]);

  return [isReady, clear, set];
}

export function useDebounce(
  fn: Function,
  ms: number = 0,
  deps: DependencyList = [],
): [() => boolean | null, () => void] {
  const [isReady, cancel, reset] = useTimeoutFn(fn, ms);

  useEffect(reset, deps);

  return [isReady, cancel];
}

import { useReducer } from 'react';

const updateReducer = (num: number): number => (num + 1) % 1_000_000;

function useUpdate(): () => void {
  const [, update] = useReducer(updateReducer, 0);

  return update;
}

export const useGetSetState = <T extends object>(
  initialState: T = {} as T,
): [() => T, (patch: Partial<T>) => void] => {
  if (process.env.NODE_ENV !== 'production') {
    if (typeof initialState !== 'object') {
      console.error('useGetSetState initial state must be an object.');
    }
  }

  const update = useUpdate();
  const state = useRef<T>({ ...(initialState as object) } as T);
  const get = useCallback(() => state.current, []);
  const set = useCallback((patch: Partial<T>) => {
    if (!patch) {
      return;
    }
    if (process.env.NODE_ENV !== 'production') {
      if (typeof patch !== 'object') {
        console.error('useGetSetState setter patch must be an object.');
      }
    }
    Object.assign(state.current, patch);
    update();
  }, []);

  return [get, set];
};

export const MARKDOWN_EDITOR_EVENTS = {
  SELECTIONCHANGE: 'md-editor-selectionchange',
  FOCUS: 'md-editor-focus',
  BLUR: 'md-editor-blur',
};

export * from '../parser/parserSlateNodeToMarkdown';
export * from './editorUtils';
export * from './keyboard';
export * from './media';
export * from './path';
export * from './useLocalState';
