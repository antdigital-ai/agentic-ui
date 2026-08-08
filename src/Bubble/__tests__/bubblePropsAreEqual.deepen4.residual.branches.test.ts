/**
 * bubblePropsAreEqual deepen4：deps 长度/项差异、originData 缺省、
 * isFinished/isLast、content 引用。
 */
import { describe, expect, it } from 'vitest';
import { bubblePropsAreEqual } from '../bubblePropsAreEqual';
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

describe('bubblePropsAreEqual deepen4 residual branches', () => {
  it('deps 一侧缺省 / 长度不同 / 项不同', () => {
    expect(bubblePropsAreEqual(props({ deps: [1] }), props())).toBe(false);
    expect(
      bubblePropsAreEqual(props({ deps: [1] }), props({ deps: [1, 2] })),
    ).toBe(false);
    expect(
      bubblePropsAreEqual(props({ deps: [1, 2] }), props({ deps: [1, 3] })),
    ).toBe(false);
    expect(
      bubblePropsAreEqual(props({ deps: [1, 2] }), props({ deps: [1, 2] })),
    ).toBe(true);
  });

  it('originData 一侧 undefined', () => {
    expect(
      bubblePropsAreEqual(
        { id: 'm1' } as any,
        props({ originData: origin() }),
      ),
    ).toBe(false);
  });

  it('isFinished / isLast / updateAt 差异', () => {
    expect(
      bubblePropsAreEqual(
        props({ originData: origin({ isFinished: true }) }),
        props({ originData: origin({ isFinished: false }) }),
      ),
    ).toBe(false);
    expect(
      bubblePropsAreEqual(
        props({ originData: origin({ isLast: true }) }),
        props({ originData: origin({ isLast: false }) }),
      ),
    ).toBe(false);
    expect(
      bubblePropsAreEqual(
        props({ originData: origin({ updateAt: 1 }) }),
        props({ originData: origin({ updateAt: 2 }) }),
      ),
    ).toBe(false);
  });

  it('content 同字符串 true；placement/className 差异 false', () => {
    expect(
      bubblePropsAreEqual(
        props({ originData: origin({ content: 'same' }) }),
        props({ originData: origin({ content: 'same' }) }),
      ),
    ).toBe(true);
    expect(
      bubblePropsAreEqual(
        props({ placement: 'left' } as any),
        props({ placement: 'right' } as any),
      ),
    ).toBe(false);
    expect(
      bubblePropsAreEqual(
        props({ className: 'a' }),
        props({ className: 'b' }),
      ),
    ).toBe(false);
  });
});
