/**
 * bubblePropsAreEqual deepen2：classNames/config nullish、metaEqual 全臂、style || {}。
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

describe('bubblePropsAreEqual deepen2 residual branches', () => {
  it('classNames：一侧有值一侧 null/undefined → false；两侧 null → true', () => {
    expect(
      bubblePropsAreEqual(
        props({ classNames: { root: 'a' } }),
        props({ classNames: undefined }),
      ),
    ).toBe(false);
    expect(
      bubblePropsAreEqual(
        props({ classNames: null as any }),
        props({ classNames: { root: 'a' } }),
      ),
    ).toBe(false);
    expect(
      bubblePropsAreEqual(
        props({ classNames: null as any }),
        props({ classNames: undefined }),
      ),
    ).toBe(true);
  });

  it('markdownRenderConfig：两侧 null/undefined → true；一侧 {} → false', () => {
    expect(
      bubblePropsAreEqual(
        props({ markdownRenderConfig: null as any }),
        props({ markdownRenderConfig: undefined }),
      ),
    ).toBe(true);
    expect(
      bubblePropsAreEqual(
        props({ markdownRenderConfig: null as any }),
        props({ markdownRenderConfig: {} as any }),
      ),
    ).toBe(false);
  });

  it('metaEqual：同引用；title 不同；metadata 两侧 null；metadata 浅相等/不等', () => {
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
        props({ originData: origin({ meta: { title: 'b' } }) }),
      ),
    ).toBe(false);

    // 同 metadata 引用：L146 ma===mb 早退
    const sharedMeta = { a: 1 };
    expect(
      bubblePropsAreEqual(
        props({
          originData: origin({
            meta: { title: 't', metadata: sharedMeta },
          }),
        }),
        props({
          originData: origin({
            meta: { title: 't', metadata: sharedMeta },
          }),
        }),
      ),
    ).toBe(true);

    // 两侧 metadata 均为 falsy（缺省）走 !ma && !mb
    expect(
      bubblePropsAreEqual(
        props({
          originData: origin({
            meta: { title: 't', name: 'n' },
          }),
        }),
        props({
          originData: origin({
            meta: { title: 't', name: 'n' },
          }),
        }),
      ),
    ).toBe(true);

    expect(
      bubblePropsAreEqual(
        props({
          originData: origin({
            meta: { title: 't', metadata: { a: 1 } },
          }),
        }),
        props({
          originData: origin({
            meta: { title: 't', metadata: { a: 2 } },
          }),
        }),
      ),
    ).toBe(false);
  });

  it('style：不同引用但键值相等；一侧 undefined 走 || {}', () => {
    expect(
      bubblePropsAreEqual(
        props({ style: { color: 'red', margin: 1 } }),
        props({ style: { color: 'red', margin: 1 } }),
      ),
    ).toBe(true);
    expect(
      bubblePropsAreEqual(
        props({ style: { color: 'red' } }),
        props({ style: { color: 'blue' } }),
      ),
    ).toBe(false);
    // null vs {}：进入 style !== 后走 || {} 两侧
    expect(
      bubblePropsAreEqual(
        props({ style: null as any }),
        props({ style: {} }),
      ),
    ).toBe(true);
    expect(
      bubblePropsAreEqual(
        props({ style: undefined }),
        props({ style: { color: 'x' } }),
      ),
    ).toBe(false);
  });
});
