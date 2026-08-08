/**
 * bubblePropsAreEqual 残留：回调/配置/style 假值与 aiBubble 别名边角。
 */
import { describe, expect, it, vi } from 'vitest';
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

describe('bubblePropsAreEqual more residual branches', () => {
  it('primitive fields 任一不等立即 false', () => {
    const base = props();
    expect(bubblePropsAreEqual(base, props({ placement: 'right' }))).toBe(
      false,
    );
    expect(bubblePropsAreEqual(base, props({ pure: true }))).toBe(false);
    expect(bubblePropsAreEqual(base, props({ readonly: true }))).toBe(false);
    expect(bubblePropsAreEqual(base, props({ time: true }))).toBe(false);
    expect(bubblePropsAreEqual(base, props({ shouldShowVoice: true }))).toBe(
      false,
    );
    expect(
      bubblePropsAreEqual(base, props({ renderMode: 'markdown' as any })),
    ).toBe(false);
    expect(
      bubblePropsAreEqual(base, props({ renderType: 'custom' as any })),
    ).toBe(false);
  });

  it('回调引用不等返回 false', () => {
    const base = props();
    const a = vi.fn();
    const b = vi.fn();
    expect(bubblePropsAreEqual(base, props({ onReply: a }))).toBe(false);
    expect(
      bubblePropsAreEqual(props({ onReply: a }), props({ onReply: b })),
    ).toBe(false);
    expect(
      bubblePropsAreEqual(props({ onLike: a }), props({ onLike: b })),
    ).toBe(false);
    expect(
      bubblePropsAreEqual(props({ onDislike: a }), props({ onDislike: b })),
    ).toBe(false);
    expect(
      bubblePropsAreEqual(props({ onDisLike: a }), props({ onDisLike: b })),
    ).toBe(false);
    expect(
      bubblePropsAreEqual(
        props({ onCancelLike: a }),
        props({ onCancelLike: b }),
      ),
    ).toBe(false);
    expect(
      bubblePropsAreEqual(
        props({ onLikeCancel: a }),
        props({ onLikeCancel: b }),
      ),
    ).toBe(false);
    expect(
      bubblePropsAreEqual(
        props({ onAvatarClick: a }),
        props({ onAvatarClick: b }),
      ),
    ).toBe(false);
    expect(
      bubblePropsAreEqual(
        props({ onDoubleClick: a }),
        props({ onDoubleClick: b }),
      ),
    ).toBe(false);
    expect(
      bubblePropsAreEqual(props({ useSpeech: a }), props({ useSpeech: b })),
    ).toBe(false);
    expect(
      bubblePropsAreEqual(
        props({ fileViewEvents: a as any }),
        props({ fileViewEvents: b as any }),
      ),
    ).toBe(false);
    expect(
      bubblePropsAreEqual(
        props({ fileViewConfig: { a: 1 } as any }),
        props({ fileViewConfig: { a: 2 } as any }),
      ),
    ).toBe(false);
    expect(
      bubblePropsAreEqual(
        props({ renderFileMoreAction: a as any }),
        props({ renderFileMoreAction: b as any }),
      ),
    ).toBe(false);
  });

  it('customConfig / bubbleRenderConfig 一侧 undefined', () => {
    const cfg = { foo: 1 };
    expect(
      bubblePropsAreEqual(
        props({ customConfig: cfg as any }),
        props({ customConfig: undefined }),
      ),
    ).toBe(false);
    expect(
      bubblePropsAreEqual(
        props({ bubbleRenderConfig: undefined }),
        props({ bubbleRenderConfig: cfg as any }),
      ),
    ).toBe(false);
  });

  it('className 字符串不等；style 同引用跳过浅比较', () => {
    const style = { margin: 1 };
    expect(
      bubblePropsAreEqual(props({ className: 'a' }), props({ className: 'b' })),
    ).toBe(false);
    expect(
      bubblePropsAreEqual(props({ style }), props({ style })),
    ).toBe(true);
  });

  it('shallowEqualRecord / Styles 空对象与假值', () => {
    expect(shallowEqualRecord({}, {})).toBe(true);
    expect(shallowEqualRecord({ a: undefined }, { a: undefined })).toBe(true);
    expect(shallowEqualStyles({}, {})).toBe(true);
    expect(shallowEqualStyles({ a: undefined }, { a: null as any })).toBe(
      false,
    );
  });

  it('userBubbleProps 与 aiBubbleProps 同时浅相等', () => {
    const user = { x: 1 };
    const ai = { y: 2 };
    expect(
      bubblePropsAreEqual(
        props({ userBubbleProps: user as any, aiBubbleProps: ai as any }),
        props({
          userBubbleProps: { x: 1 } as any,
          aiBubbleProps: { y: 2 } as any,
        }),
      ),
    ).toBe(true);
  });
});
