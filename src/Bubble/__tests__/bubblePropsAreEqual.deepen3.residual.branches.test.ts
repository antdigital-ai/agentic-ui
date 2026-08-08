/**
 * bubblePropsAreEqual deepen3：meta 同引用、原型链 metadata、
 * style || {} 两侧真值。
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

/** own keys 不含 metadata，经原型暴露 metadata，以绕过顶层浅比较引用 */
const metaWithProtoMetadata = (
  own: Record<string, unknown>,
  metadata: Record<string, unknown> | undefined,
) => Object.assign(Object.create({ metadata }), own);

describe('bubblePropsAreEqual deepen3 residual branches', () => {
  it('meta 同引用早退 a===b', () => {
    const shared = { title: 't', name: 'n', metadata: { k: 1 } };
    const a = props({ originData: origin({ meta: shared }) });
    const b = props({ originData: origin({ meta: shared }) });
    expect(bubblePropsAreEqual(a, b)).toBe(true);
  });

  it('原型 metadata：一侧有一侧无 → false', () => {
    expect(
      bubblePropsAreEqual(
        props({
          originData: origin({
            meta: metaWithProtoMetadata(
              { title: 't', name: 'n' },
              { a: 1 },
            ) as any,
          }),
        }),
        props({
          originData: origin({
            meta: { title: 't', name: 'n' },
          }),
        }),
      ),
    ).toBe(false);
  });

  it('原型 metadata：两侧不同引用但值相等 → true', () => {
    expect(
      bubblePropsAreEqual(
        props({
          originData: origin({
            meta: metaWithProtoMetadata(
              { title: 't' },
              { x: 1 },
            ) as any,
          }),
        }),
        props({
          originData: origin({
            meta: metaWithProtoMetadata(
              { title: 't' },
              { x: 1 },
            ) as any,
          }),
        }),
      ),
    ).toBe(true);
  });

  it('style：两侧均有对象走 || 短路真值分支', () => {
    expect(
      bubblePropsAreEqual(
        props({ style: { padding: 1 } }),
        props({ style: { padding: 1 } }),
      ),
    ).toBe(true);
    expect(
      bubblePropsAreEqual(
        props({ style: { padding: 1 } }),
        props({ style: { padding: 2 } }),
      ),
    ).toBe(false);
  });

  it('undefined meta 两侧：|| {} 空对象浅相等', () => {
    expect(
      bubblePropsAreEqual(
        props({ originData: origin({ meta: undefined }) }),
        props({ originData: origin({ meta: undefined }) }),
      ),
    ).toBe(true);
  });
});
