import type React from 'react';
import { describe, expect, it } from 'vitest';
import {
  bubblePropsAreEqual,
  shallowEqualRecord,
  shallowEqualStyles,
} from '../bubblePropsAreEqual';
import type { BubbleProps, MessageBubbleData } from '../type';

const baseOrigin = (): MessageBubbleData => ({
  id: 'm1',
  role: 'assistant',
  content: 'hello',
  createAt: 1,
  updateAt: 1,
  isFinished: true,
  isLast: false,
});

describe('bubblePropsAreEqual', () => {
  it('treats fresh style object references as equal when keys match', () => {
    const a: BubbleProps = {
      id: 'm1',
      originData: baseOrigin(),
      style: { padding: 8, margin: 0 },
    };
    const b: BubbleProps = {
      ...a,
      style: { padding: 8, margin: 0 },
    };
    expect(bubblePropsAreEqual(a, b)).toBe(true);
  });

  it('returns false when origin content changes', () => {
    const a: BubbleProps = {
      id: 'm1',
      originData: baseOrigin(),
    };
    const b: BubbleProps = {
      ...a,
      originData: { ...baseOrigin(), content: 'world' },
    };
    expect(bubblePropsAreEqual(a, b)).toBe(false);
  });

  it('treats markdownRenderConfig as equal when top-level keys match with new object references', () => {
    const a: BubbleProps = {
      id: 'm1',
      originData: baseOrigin(),
      markdownRenderConfig: {
        renderMode: 'markdown',
      },
    };
    const b: BubbleProps = {
      ...a,
      markdownRenderConfig: {
        renderMode: 'markdown',
      },
    };
    expect(bubblePropsAreEqual(a, b)).toBe(true);
  });

  it('returns false when markdownRenderConfig top-level value changes', () => {
    const a: BubbleProps = {
      id: 'm1',
      originData: baseOrigin(),
      markdownRenderConfig: { renderMode: 'markdown' },
    };
    const b: BubbleProps = {
      ...a,
      markdownRenderConfig: { renderMode: 'slate' },
    };
    expect(bubblePropsAreEqual(a, b)).toBe(false);
  });

  it('detects originData.meta.metadata shallow changes', () => {
    const a: BubbleProps = {
      id: 'm1',
      originData: {
        ...baseOrigin(),
        meta: { title: 't', metadata: { k: 1 } },
      },
    };
    const b: BubbleProps = {
      ...a,
      originData: {
        ...baseOrigin(),
        meta: { title: 't', metadata: { k: 2 } },
      },
    };
    expect(bubblePropsAreEqual(a, b)).toBe(false);
  });

  it('returns true when meta is absent on both sides', () => {
    const a: BubbleProps = { id: 'm1', originData: baseOrigin() };
    const b: BubbleProps = { id: 'm1', originData: { ...baseOrigin() } };
    expect(bubblePropsAreEqual(a, b)).toBe(true);
  });

  it('returns false when preMessage id changes', () => {
    const pre = { id: 'p1', role: 'user' as const, content: 'hi' };
    const a: BubbleProps = {
      id: 'm1',
      originData: baseOrigin(),
      preMessage: pre,
    };
    const b: BubbleProps = {
      ...a,
      preMessage: { ...pre, id: 'p2' },
    };
    expect(bubblePropsAreEqual(a, b)).toBe(false);
  });

  it('treats nested styles objects as equal when keys match', () => {
    const a: BubbleProps = {
      id: 'm1',
      originData: baseOrigin(),
      styles: { bubble: { padding: 4 } },
    };
    const b: BubbleProps = {
      ...a,
      styles: { bubble: { padding: 4 } },
    };
    expect(bubblePropsAreEqual(a, b)).toBe(true);
  });

  it('returns false when deps array length differs', () => {
    const a: BubbleProps & { deps?: unknown[] } = {
      id: 'm1',
      originData: baseOrigin(),
      deps: [1],
    };
    const b: BubbleProps & { deps?: unknown[] } = {
      ...a,
      deps: [1, 2],
    };
    expect(bubblePropsAreEqual(a, b)).toBe(false);
  });

  it('returns false when callback reference changes', () => {
    const a: BubbleProps = {
      id: 'm1',
      originData: baseOrigin(),
      onLike: () => {},
    };
    const b: BubbleProps = {
      ...a,
      onLike: () => {},
    };
    expect(bubblePropsAreEqual(a, b)).toBe(false);
  });

  it('treats userBubbleProps and aiBubbleProps as shallow config objects', () => {
    const a: BubbleProps = {
      id: 'm1',
      originData: baseOrigin(),
      userBubbleProps: { showAvatar: true },
      aiBubbleProps: { pure: false },
      aIBubbleProps: { readonly: true },
    };
    const b: BubbleProps = {
      ...a,
      userBubbleProps: { showAvatar: true },
      aiBubbleProps: { pure: false },
      aIBubbleProps: { readonly: true },
    };
    expect(bubblePropsAreEqual(a, b)).toBe(true);
  });

  it('returns false when aiBubbleProps nested value changes', () => {
    const a: BubbleProps = {
      id: 'm1',
      originData: baseOrigin(),
      aiBubbleProps: { nested: { k: 1 } },
    };
    const b: BubbleProps = {
      ...a,
      aiBubbleProps: { nested: { k: 2 } },
    };
    expect(bubblePropsAreEqual(a, b)).toBe(false);
  });

  it('compares avatar records shallowly', () => {
    const avatar = { src: 'a.png', alt: 'A' };
    const a: BubbleProps = {
      id: 'm1',
      originData: baseOrigin(),
      avatar,
    };
    const b: BubbleProps = {
      ...a,
      avatar: { src: 'a.png', alt: 'A' },
    };
    expect(bubblePropsAreEqual(a, b)).toBe(true);
  });

  it('returns false when classNames slot changes', () => {
    const a: BubbleProps = {
      id: 'm1',
      originData: baseOrigin(),
      classNames: { bubble: 'a' },
    };
    const b: BubbleProps = {
      ...a,
      classNames: { bubble: 'b' },
    };
    expect(bubblePropsAreEqual(a, b)).toBe(false);
  });

  it('returns false when originData.extra reference changes', () => {
    const a: BubbleProps = {
      id: 'm1',
      originData: { ...baseOrigin(), extra: { k: 1 } },
    };
    const b: BubbleProps = {
      id: 'm1',
      originData: { ...baseOrigin(), extra: { k: 1 } },
    };
    expect(bubblePropsAreEqual(a, b)).toBe(false);
  });

  it('compares meta when avatar is present', () => {
    const a: BubbleProps = {
      id: 'm1',
      originData: {
        ...baseOrigin(),
        meta: { avatar: 'x.png', title: 'T' },
      },
    };
    const b: BubbleProps = {
      id: 'm1',
      originData: {
        ...baseOrigin(),
        meta: { avatar: 'x.png', title: 'T' },
      },
    };
    expect(bubblePropsAreEqual(a, b)).toBe(true);
  });

  it('returns false when scalar Bubble props change', () => {
    const base: BubbleProps = { id: 'm1', originData: baseOrigin() };
    expect(bubblePropsAreEqual(base, { ...base, placement: 'right' })).toBe(
      false,
    );
    expect(bubblePropsAreEqual(base, { ...base, pure: true })).toBe(false);
    expect(bubblePropsAreEqual(base, { ...base, readonly: true })).toBe(false);
    expect(bubblePropsAreEqual(base, { ...base, shouldShowCopy: true })).toBe(
      false,
    );
  });

  it('returns false when avatar content differs', () => {
    const a: BubbleProps = {
      id: 'm1',
      originData: baseOrigin(),
      avatar: { src: 'a.png' },
    };
    const b: BubbleProps = {
      ...a,
      avatar: { src: 'b.png' },
    };
    expect(bubblePropsAreEqual(a, b)).toBe(false);
  });

  it('returns false when inline style values differ', () => {
    const a: BubbleProps = {
      id: 'm1',
      originData: baseOrigin(),
      style: { margin: 1 },
    };
    const b: BubbleProps = {
      ...a,
      style: { margin: 2 },
    };
    expect(bubblePropsAreEqual(a, b)).toBe(false);
  });

  it('returns false when nested styles differ', () => {
    const a: BubbleProps = {
      id: 'm1',
      originData: baseOrigin(),
      styles: { bubble: { color: 'red' } },
    };
    const b: BubbleProps = {
      ...a,
      styles: { bubble: { color: 'blue' } },
    };
    expect(bubblePropsAreEqual(a, b)).toBe(false);
  });

  it('returns false when userBubbleProps or aIBubbleProps change', () => {
    const base: BubbleProps = {
      id: 'm1',
      originData: baseOrigin(),
      userBubbleProps: { pure: false },
      aIBubbleProps: { readonly: false },
    };
    expect(
      bubblePropsAreEqual(base, {
        ...base,
        userBubbleProps: { pure: true },
      }),
    ).toBe(false);
    expect(
      bubblePropsAreEqual(base, {
        ...base,
        aIBubbleProps: { readonly: true },
      }),
    ).toBe(false);
  });

  it('returns false when config refs or fileView props change', () => {
    const base: BubbleProps = {
      id: 'm1',
      originData: baseOrigin(),
      bubbleRenderConfig: { a: 1 },
      docListProps: { b: 1 },
      customConfig: { c: 1 },
      fileViewConfig: { d: 1 },
    };
    expect(
      bubblePropsAreEqual(base, {
        ...base,
        bubbleRenderConfig: { a: 2 },
      }),
    ).toBe(false);
    expect(
      bubblePropsAreEqual(base, {
        ...base,
        docListProps: { b: 2 },
      }),
    ).toBe(false);
    expect(
      bubblePropsAreEqual(base, {
        ...base,
        customConfig: { c: 2 },
      }),
    ).toBe(false);
    expect(
      bubblePropsAreEqual(base, {
        ...base,
        fileViewConfig: { d: 2 },
      }),
    ).toBe(false);
  });

  it('returns false when originData scalar fields change', () => {
    const base: BubbleProps = { id: 'm1', originData: baseOrigin() };
    expect(
      bubblePropsAreEqual(base, {
        ...base,
        originData: { ...baseOrigin(), isAborted: true },
      }),
    ).toBe(false);
    expect(
      bubblePropsAreEqual(base, {
        ...base,
        originData: { ...baseOrigin(), feedback: 'like' as const },
      }),
    ).toBe(false);
    expect(
      bubblePropsAreEqual(base, {
        ...base,
        originData: { ...baseOrigin(), error: new Error('x') },
      }),
    ).toBe(false);
  });

  it('ignores meta fields that do not affect bubble rendering', () => {
    const a: BubbleProps = {
      id: 'm1',
      originData: { ...baseOrigin(), meta: { customOnly: 'a' } },
    };
    const b: BubbleProps = {
      id: 'm1',
      originData: { ...baseOrigin(), meta: { customOnly: 'b' } },
    };
    expect(bubblePropsAreEqual(a, b)).toBe(true);
  });

  it('returns false when one side metadata is missing', () => {
    const a: BubbleProps = {
      id: 'm1',
      originData: {
        ...baseOrigin(),
        meta: { title: 'T', metadata: { k: 1 } },
      },
    };
    const b: BubbleProps = {
      id: 'm1',
      originData: {
        ...baseOrigin(),
        meta: { title: 'T' },
      },
    };
    expect(bubblePropsAreEqual(a, b)).toBe(false);
  });

  it('returns false when metadata values differ', () => {
    const a: BubbleProps = {
      id: 'm1',
      originData: {
        ...baseOrigin(),
        meta: { title: 'T', metadata: { k: 1 } },
      },
    };
    const b: BubbleProps = {
      id: 'm1',
      originData: {
        ...baseOrigin(),
        meta: { title: 'T', metadata: { k: 2 } },
      },
    };
    expect(bubblePropsAreEqual(a, b)).toBe(false);
  });

  it('returns false when shallowEqualConfigObject keys differ', () => {
    const a: BubbleProps = {
      id: 'm1',
      originData: baseOrigin(),
      customConfig: { onlyA: 1 },
    };
    const b: BubbleProps = {
      id: 'm1',
      originData: baseOrigin(),
      customConfig: { onlyB: 1 },
    };
    expect(bubblePropsAreEqual(a, b)).toBe(false);
  });

  it('returns false when config nested value is an array', () => {
    const a: BubbleProps = {
      id: 'm1',
      originData: baseOrigin(),
      customConfig: { tags: ['a'] },
    };
    const b: BubbleProps = {
      id: 'm1',
      originData: baseOrigin(),
      customConfig: { tags: ['b'] },
    };
    expect(bubblePropsAreEqual(a, b)).toBe(false);
  });

  it('treats equal deps arrays as equal', () => {
    const dep = { k: 1 };
    const a: BubbleProps & { deps?: unknown[] } = {
      id: 'm1',
      originData: baseOrigin(),
      deps: [dep],
    };
    const b: BubbleProps & { deps?: unknown[] } = {
      ...a,
      deps: [dep],
    };
    expect(bubblePropsAreEqual(a, b)).toBe(true);
  });
});

describe('shallowEqualRecord', () => {
  it('compares key sets and values', () => {
    expect(shallowEqualRecord({ a: 1 }, { a: 1 })).toBe(true);
    expect(shallowEqualRecord({ a: 1 }, { a: 2 })).toBe(false);
    expect(shallowEqualRecord(null, undefined)).toBe(true);
    expect(shallowEqualRecord({ a: 1 }, null)).toBe(false);
  });
});

describe('shallowEqualStyles', () => {
  it('compares nested style objects shallowly', () => {
    expect(
      shallowEqualStyles(
        { bubble: { color: 'red' } },
        { bubble: { color: 'red' } },
      ),
    ).toBe(true);
    expect(
      shallowEqualStyles(
        { bubble: { color: 'red' } },
        { bubble: { color: 'blue' } },
      ),
    ).toBe(false);
  });

  it('treats nullish sides as equal', () => {
    expect(shallowEqualStyles(undefined, undefined)).toBe(true);
    expect(shallowEqualStyles(null, undefined)).toBe(true);
    expect(shallowEqualStyles({ a: 1 }, undefined)).toBe(false);
  });

  it('returns false when style slot values are arrays', () => {
    expect(
      shallowEqualStyles(
        { bubble: ['a'] as unknown as React.CSSProperties },
        { bubble: ['b'] as unknown as React.CSSProperties },
      ),
    ).toBe(false);
  });
});

describe('shallowEqualClassNames via bubblePropsAreEqual', () => {
  it('treats equal classNames maps as equal across new object refs', () => {
    const a: BubbleProps = {
      id: 'm1',
      originData: baseOrigin(),
      classNames: { bubble: 'x', content: 'y' },
    };
    const b: BubbleProps = {
      ...a,
      classNames: { bubble: 'x', content: 'y' },
    };
    expect(bubblePropsAreEqual(a, b)).toBe(true);
  });
});
