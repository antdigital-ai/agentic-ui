/**
 * bubblePropsAreEqual residual：styles 嵌套、config 对象、deps、avatar。
 */
import { describe, expect, it } from 'vitest';
import {
  bubblePropsAreEqual,
  shallowEqualRecord,
  shallowEqualStyles,
} from '../bubblePropsAreEqual';
import type { BubbleProps, MessageBubbleData } from '../type';

const origin = (o?: Partial<MessageBubbleData>): MessageBubbleData => ({
  id: 'm1',
  role: 'assistant',
  content: 'hi',
  createAt: 1,
  updateAt: 1,
  isFinished: true,
  isLast: false,
  ...o,
});

const props = (o?: Partial<BubbleProps> & { deps?: unknown[] }) =>
  ({
    id: 'm1',
    originData: origin(),
    ...o,
  }) as BubbleProps & { deps?: unknown[] };

describe('bubblePropsAreEqual deep residual branches', () => {
  it('shallowEqualStyles：一边假值；嵌套对象不等', () => {
    expect(shallowEqualStyles(undefined, undefined)).toBe(true);
    expect(shallowEqualStyles({}, undefined)).toBe(false);
    expect(
      shallowEqualStyles(
        { content: { color: 'red' } } as any,
        { content: { color: 'blue' } } as any,
      ),
    ).toBe(false);
    expect(
      shallowEqualStyles(
        { content: { color: 'red' } } as any,
        { content: { color: 'red' } } as any,
      ),
    ).toBe(true);
  });

  it('shallowEqualRecord：长度不等 / 键值不等', () => {
    expect(shallowEqualRecord({ a: 1 }, { a: 1, b: 2 })).toBe(false);
    expect(shallowEqualRecord({ a: 1 }, { a: 2 })).toBe(false);
    expect(shallowEqualRecord(null, null)).toBe(true);
    expect(shallowEqualRecord(null, {})).toBe(false);
  });

  it('config / deps / avatar / shouldShowCopy 矩阵', () => {
    const base = props();
    expect(bubblePropsAreEqual(base, base)).toBe(true);
    expect(
      bubblePropsAreEqual(base, props({ shouldShowCopy: true })),
    ).toBe(false);
    expect(
      bubblePropsAreEqual(
        props({ markdownRenderConfig: { a: { x: 1 } } as any }),
        props({ markdownRenderConfig: { a: { x: 1 } } as any }),
      ),
    ).toBe(true);
    expect(
      bubblePropsAreEqual(
        props({ markdownRenderConfig: { a: { x: 1 } } as any }),
        props({ markdownRenderConfig: { a: { x: 2 } } as any }),
      ),
    ).toBe(false);
    expect(
      bubblePropsAreEqual(props({ deps: [1] }), props({ deps: [1, 2] })),
    ).toBe(false);
    expect(
      bubblePropsAreEqual(
        props({ avatar: { title: 'A' } as any }),
        props({ avatar: { title: 'B' } as any }),
      ),
    ).toBe(false);
    expect(
      bubblePropsAreEqual(
        props({ originData: origin({ meta: { title: 't' } }) }),
        props({ originData: origin({ meta: { title: 't' } }) }),
      ),
    ).toBe(true);
  });
});
