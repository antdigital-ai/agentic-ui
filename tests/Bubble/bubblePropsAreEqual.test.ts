import { describe, expect, it } from 'vitest';
import { bubblePropsAreEqual } from '../../src/Bubble/bubblePropsAreEqual';
import type { BubbleProps, MessageBubbleData } from '../../src/Bubble/type';

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
});
