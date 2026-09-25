/**
 * bubblePropsAreEqual deepen5：metaEqualForMemo a===b / 空 meta /
 * metadata 单侧缺失；style 对象浅等与 ||{}。
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
  ...o,
});

const props = (o?: Partial<BubbleProps>) =>
  ({
    id: 'm1',
    originData: origin(),
    ...o,
  }) as BubbleProps;

describe('bubblePropsAreEqual deepen5 residual branches', () => {
  it('meta 引用相同或双方无 metadata 时相等', () => {
    const meta = { title: 't', metadata: { k: 1 } };
    expect(
      bubblePropsAreEqual(
        props({ originData: origin({ meta }) }),
        props({ originData: origin({ meta }) }),
      ),
    ).toBe(true);
    expect(
      bubblePropsAreEqual(
        props({ originData: origin({ meta: { title: 'a' } }) }),
        props({ originData: origin({ meta: { title: 'a' } }) }),
      ),
    ).toBe(true);
  });

  it('metadata 单侧缺失时不相等', () => {
    expect(
      bubblePropsAreEqual(
        props({
          originData: origin({ meta: { title: 'a', metadata: { x: 1 } } }),
        }),
        props({ originData: origin({ meta: { title: 'a' } }) }),
      ),
    ).toBe(false);
  });

  it('style 引用不同但浅等时仍相等；一侧 undefined 走 ||{}', () => {
    expect(
      bubblePropsAreEqual(
        props({ style: { color: 'red' } }),
        props({ style: { color: 'red' } }),
      ),
    ).toBe(true);
    expect(
      bubblePropsAreEqual(props({ style: {} }), props({ style: undefined })),
    ).toBe(true);
    expect(
      bubblePropsAreEqual(
        props({ style: { color: 'red' } }),
        props({ style: { color: 'blue' } }),
      ),
    ).toBe(false);
  });
});
