import type React from 'react';
import { describe, expect, it, vi } from 'vitest';
import {
  bubblePropsAreEqual,
  shallowEqualRecord,
  shallowEqualStyles,
} from '../bubblePropsAreEqual';
import type { BubbleProps, MessageBubbleData } from '../type';

const baseOrigin = (overrides?: Partial<MessageBubbleData>): MessageBubbleData => ({
  id: 'm1',
  role: 'assistant',
  content: 'hello',
  createAt: 1,
  updateAt: 1,
  isFinished: true,
  isLast: false,
  ...overrides,
});

const baseProps = (overrides?: Partial<BubbleProps>): BubbleProps & { deps?: unknown[] } => ({
  id: 'm1',
  originData: baseOrigin(),
  ...overrides,
});

describe('shallowEqualRecord branches', () => {
  it('returns true for same reference', () => {
    const obj = { a: 1 };
    expect(shallowEqualRecord(obj, obj)).toBe(true);
  });

  it('returns true when both are null/undefined', () => {
    expect(shallowEqualRecord(null, undefined)).toBe(true);
    expect(shallowEqualRecord(undefined, null)).toBe(true);
  });

  it('returns false when only one side is null', () => {
    expect(shallowEqualRecord({ a: 1 }, null)).toBe(false);
    expect(shallowEqualRecord(null, { a: 1 })).toBe(false);
  });

  it('returns false when key counts differ', () => {
    expect(shallowEqualRecord({ a: 1 }, { a: 1, b: 2 })).toBe(false);
  });

  it('returns false when values differ', () => {
    expect(shallowEqualRecord({ a: 1 }, { a: 2 })).toBe(false);
  });

  it('returns true when keys and values match', () => {
    expect(shallowEqualRecord({ a: 1, b: 'x' }, { a: 1, b: 'x' })).toBe(true);
  });
});

describe('shallowEqualStyles branches', () => {
  it('returns true for same reference', () => {
    const styles = { root: { padding: 8 } };
    expect(shallowEqualStyles(styles, styles)).toBe(true);
  });

  it('returns true when both are null/undefined', () => {
    expect(shallowEqualStyles(undefined, null)).toBe(true);
  });

  it('returns false when only one side is null', () => {
    expect(shallowEqualStyles({ root: { padding: 1 } }, undefined)).toBe(false);
  });

  it('returns true when nested style objects are shallow-equal', () => {
    expect(
      shallowEqualStyles(
        { content: { color: 'red', margin: 0 } },
        { content: { color: 'red', margin: 0 } },
      ),
    ).toBe(true);
  });

  it('returns false when nested style values differ', () => {
    expect(
      shallowEqualStyles(
        { content: { color: 'red' } },
        { content: { color: 'blue' } },
      ),
    ).toBe(false);
  });

  it('returns false when one side is array instead of object', () => {
    expect(
      shallowEqualStyles(
        { content: [1, 2] as unknown as React.CSSProperties },
        { content: [1, 2] as unknown as React.CSSProperties },
      ),
    ).toBe(false);
  });

  it('returns false when primitive values differ', () => {
    expect(
      shallowEqualStyles(
        { root: 'a' as unknown as React.CSSProperties },
        { root: 'b' as unknown as React.CSSProperties },
      ),
    ).toBe(false);
  });

  it('merges keys from both sides via Set union', () => {
    expect(
      shallowEqualStyles({ root: { padding: 1 } }, { content: { padding: 1 } }),
    ).toBe(false);
  });
});

describe('bubblePropsAreEqual branches', () => {
  it('returns true when prev and next are the same reference', () => {
    const props = baseProps();
    expect(bubblePropsAreEqual(props, props)).toBe(true);
  });

  it('returns true when all comparable fields are shallow-equal', () => {
    const a = baseProps({
      placement: 'left',
      pure: false,
      readonly: true,
      style: { padding: 8 },
      classNames: { root: 'r' },
      styles: { content: { color: 'black' } },
      deps: [1, 'x'],
    });
    const b = baseProps({
      placement: 'left',
      pure: false,
      readonly: true,
      style: { padding: 8 },
      classNames: { root: 'r' },
      styles: { content: { color: 'black' } },
      deps: [1, 'x'],
    });
    expect(bubblePropsAreEqual(a, b)).toBe(true);
  });

  const scalarFields: Array<{
    key: keyof BubbleProps;
    a: unknown;
    b: unknown;
  }> = [
    { key: 'id', a: 'm1', b: 'm2' },
    { key: 'placement', a: 'left', b: 'right' },
    { key: 'pure', a: false, b: true },
    { key: 'readonly', a: false, b: true },
    { key: 'time', a: 1, b: 2 },
    { key: 'shouldShowVoice', a: false, b: true },
    { key: 'renderMode', a: 'slate', b: 'markdown' },
    { key: 'renderType', a: 'slate', b: 'markdown' },
    { key: 'className', a: 'a', b: 'b' },
  ];

  it.each(scalarFields)(
    'returns false when $key differs',
    ({ key, a, b }) => {
      expect(
        bubblePropsAreEqual(baseProps({ [key]: a }), baseProps({ [key]: b })),
      ).toBe(false);
    },
  );

  it('returns false when shouldShowCopy differs', () => {
    expect(
      bubblePropsAreEqual(
        baseProps({ shouldShowCopy: true }),
        baseProps({ shouldShowCopy: false }),
      ),
    ).toBe(false);
  });

  it('returns false when originData reference is missing on one side', () => {
    expect(
      bubblePropsAreEqual(baseProps(), baseProps({ originData: undefined })),
    ).toBe(false);
  });

  const originScalarFields: Array<{
    field: keyof MessageBubbleData;
    a: unknown;
    b: unknown;
  }> = [
    { field: 'id', a: 'm1', b: 'm2' },
    { field: 'role', a: 'assistant', b: 'user' },
    { field: 'content', a: 'a', b: 'b' },
    { field: 'isFinished', a: true, b: false },
    { field: 'isAborted', a: false, b: true },
    { field: 'isLast', a: false, b: true },
    { field: 'isLatest', a: false, b: true },
    { field: 'updateAt', a: 1, b: 2 },
    { field: 'createAt', a: 1, b: 2 },
    { field: 'feedback', a: 'like', b: 'dislike' },
    { field: 'originContent', a: 'a', b: 'b' },
    { field: 'error', a: null, b: { code: 1 } },
  ];

  it.each(originScalarFields)(
    'returns false when originData.$field differs',
    ({ field, a, b }) => {
      expect(
        bubblePropsAreEqual(
          baseProps({ originData: baseOrigin({ [field]: a }) }),
          baseProps({ originData: baseOrigin({ [field]: b }) }),
        ),
      ).toBe(false);
    },
  );

  it('returns false when originData.fileMap reference differs', () => {
    const fileMap = { f1: {} };
    expect(
      bubblePropsAreEqual(
        baseProps({ originData: baseOrigin({ fileMap }) }),
        baseProps({ originData: baseOrigin({ fileMap: { f2: {} } }) }),
      ),
    ).toBe(false);
  });

  it('returns false when originData.extra reference differs', () => {
    expect(
      bubblePropsAreEqual(
        baseProps({ originData: baseOrigin({ extra: { a: 1 } }) }),
        baseProps({ originData: baseOrigin({ extra: { a: 2 } }) }),
      ),
    ).toBe(false);
  });

  it('ignores meta differences when meta does not affect bubble', () => {
    const a = baseProps({
      originData: baseOrigin({ meta: { unknownKey: 'x' } }),
    });
    const b = baseProps({
      originData: baseOrigin({ meta: { unknownKey: 'y' } }),
    });
    expect(bubblePropsAreEqual(a, b)).toBe(true);
  });

  it('compares meta when avatar/title/name/description/backgroundColor/metadata present', () => {
    const metaCases = [
      { meta: { avatar: 'a.png' }, other: { avatar: 'b.png' } },
      { meta: { title: 't1' }, other: { title: 't2' } },
      { meta: { name: 'n1' }, other: { name: 'n2' } },
      { meta: { description: 'd1' }, other: { description: 'd2' } },
      { meta: { backgroundColor: '#fff' }, other: { backgroundColor: '#000' } },
      {
        meta: { metadata: { k: 1 } },
        other: { metadata: { k: 2 } },
      },
    ];
    metaCases.forEach(({ meta, other }) => {
      expect(
        bubblePropsAreEqual(
          baseProps({ originData: baseOrigin({ meta }) }),
          baseProps({ originData: baseOrigin({ meta: other }) }),
        ),
      ).toBe(false);
    });
  });

  it('returns true when meta is shallow-equal including metadata', () => {
    const meta = { title: 't', metadata: { k: 1 } };
    expect(
      bubblePropsAreEqual(
        baseProps({ originData: baseOrigin({ meta }) }),
        baseProps({ originData: baseOrigin({ meta: { ...meta } }) }),
      ),
    ).toBe(true);
  });

  it('returns false when preMessage id or role differs', () => {
    const pre: MessageBubbleData = { id: 'p1', role: 'user', content: 'hi' };
    expect(
      bubblePropsAreEqual(
        baseProps({ preMessage: pre }),
        baseProps({ preMessage: { ...pre, id: 'p2' } }),
      ),
    ).toBe(false);
    expect(
      bubblePropsAreEqual(
        baseProps({ preMessage: pre }),
        baseProps({ preMessage: { ...pre, role: 'assistant' } }),
      ),
    ).toBe(false);
  });

  it('returns false when preMessage is missing on one side', () => {
    const pre: MessageBubbleData = { id: 'p1', role: 'user', content: 'hi' };
    expect(
      bubblePropsAreEqual(baseProps(), baseProps({ preMessage: pre })),
    ).toBe(false);
  });

  const configKeys = [
    'markdownRenderConfig',
    'bubbleRenderConfig',
    'docListProps',
    'customConfig',
    'userBubbleProps',
    'aiBubbleProps',
    'aIBubbleProps',
  ] as const;

  it.each(configKeys)(
    'returns false when %s nested object value differs',
    (key) => {
      expect(
        bubblePropsAreEqual(
          baseProps({ [key]: { outer: { inner: 1 } } }),
          baseProps({ [key]: { outer: { inner: 2 } } }),
        ),
      ).toBe(false);
    },
  );

  it.each(configKeys)(
    'returns false when %s is missing a top-level key',
    (key) => {
      expect(
        bubblePropsAreEqual(
          baseProps({ [key]: { a: 1, b: 2 } }),
          baseProps({ [key]: { a: 1 } }),
        ),
      ).toBe(false);
    },
  );

  it('returns false when config top-level primitive differs', () => {
    expect(
      bubblePropsAreEqual(
        baseProps({ customConfig: { mode: 'a' } }),
        baseProps({ customConfig: { mode: 'b' } }),
      ),
    ).toBe(false);
  });

  it('treats config objects as equal when nested objects are shallow-equal', () => {
    expect(
      bubblePropsAreEqual(
        baseProps({ bubbleRenderConfig: { cfg: { x: 1, y: 2 } } }),
        baseProps({ bubbleRenderConfig: { cfg: { x: 1, y: 2 } } }),
      ),
    ).toBe(true);
  });

  it('compares avatar via shallowEqualRecord when references differ', () => {
    expect(
      bubblePropsAreEqual(
        baseProps({ avatar: { title: 'a', name: 'n' } }),
        baseProps({ avatar: { title: 'a', name: 'n' } }),
      ),
    ).toBe(true);
    expect(
      bubblePropsAreEqual(
        baseProps({ avatar: { title: 'a' } }),
        baseProps({ avatar: { title: 'b' } }),
      ),
    ).toBe(false);
  });

  it('skips avatar compare when references are equal', () => {
    const avatar = { title: 'same' };
    expect(
      bubblePropsAreEqual(
        baseProps({ avatar }),
        baseProps({ avatar }),
      ),
    ).toBe(true);
  });

  it('returns false when classNames values differ', () => {
    expect(
      bubblePropsAreEqual(
        baseProps({ classNames: { root: 'a' } }),
        baseProps({ classNames: { root: 'b' } }),
      ),
    ).toBe(false);
  });

  it('returns false when inline style keys differ', () => {
    expect(
      bubblePropsAreEqual(
        baseProps({ style: { padding: 1 } }),
        baseProps({ style: { padding: 2 } }),
      ),
    ).toBe(false);
  });

  const callbackFields = [
    'onReply',
    'onDisLike',
    'onDislike',
    'onLike',
    'onCancelLike',
    'onLikeCancel',
    'onAvatarClick',
    'onDoubleClick',
    'useSpeech',
    'fileViewEvents',
    'fileViewConfig',
    'renderFileMoreAction',
  ] as const;

  it.each(callbackFields)('returns false when %s reference differs', (key) => {
    const fnA = vi.fn();
    const fnB = vi.fn();
    expect(
      bubblePropsAreEqual(baseProps({ [key]: fnA }), baseProps({ [key]: fnB })),
    ).toBe(false);
  });

  it('returns false when bubbleListRef or bubbleRef differs', () => {
    const refA = { current: null };
    const refB = { current: null };
    expect(
      bubblePropsAreEqual(
        baseProps({ bubbleListRef: refA }),
        baseProps({ bubbleListRef: refB }),
      ),
    ).toBe(false);
    expect(
      bubblePropsAreEqual(
        baseProps({ bubbleRef: refA }),
        baseProps({ bubbleRef: refB }),
      ),
    ).toBe(false);
  });

  it('returns false when deps array length or items differ', () => {
    expect(
      bubblePropsAreEqual(
        baseProps({ deps: [1, 2] }),
        baseProps({ deps: [1] }),
      ),
    ).toBe(false);
    expect(
      bubblePropsAreEqual(
        baseProps({ deps: [1] }),
        baseProps({ deps: [2] }),
      ),
    ).toBe(false);
  });

  it('returns true when deps are both null/undefined', () => {
    expect(
      bubblePropsAreEqual(baseProps(), baseProps({ deps: undefined })),
    ).toBe(true);
  });

  it('returns false when one deps is null and other has values', () => {
    expect(
      bubblePropsAreEqual(
        baseProps({ deps: undefined }),
        baseProps({ deps: [1] }),
      ),
    ).toBe(false);
  });

  it('returns true when classNames references are equal', () => {
    const classNames = { root: 'r', content: 'c' };
    expect(
      bubblePropsAreEqual(
        baseProps({ classNames }),
        baseProps({ classNames }),
      ),
    ).toBe(true);
  });

  it('returns false when styles nested object values differ', () => {
    expect(
      bubblePropsAreEqual(
        baseProps({ styles: { root: { padding: 1, margin: 0 } } }),
        baseProps({ styles: { root: { padding: 1, margin: 1 } } }),
      ),
    ).toBe(false);
  });

  it('returns true when styles both sides missing key via Set union', () => {
    expect(
      bubblePropsAreEqual(
        baseProps({ styles: { root: { padding: 1 } } }),
        baseProps({ styles: { root: { padding: 1 }, content: undefined } as any }),
      ),
    ).toBe(true);
  });

  it('returns false when preMessage id differs even if content same', () => {
    const pre: MessageBubbleData = { id: 'p1', role: 'user', content: 'same' };
    expect(
      bubblePropsAreEqual(
        baseProps({ preMessage: pre }),
        baseProps({ preMessage: { ...pre, id: 'p2' } }),
      ),
    ).toBe(false);
  });

  it('returns true when meta empty objects shallow-equal', () => {
    expect(
      bubblePropsAreEqual(
        baseProps({ originData: baseOrigin({ meta: {} }) }),
        baseProps({ originData: baseOrigin({ meta: {} }) }),
      ),
    ).toBe(true);
  });

  it('returns false when userBubbleProps nested value differs', () => {
    expect(
      bubblePropsAreEqual(
        baseProps({ userBubbleProps: { cfg: { x: 1 } } }),
        baseProps({ userBubbleProps: { cfg: { x: 2 } } }),
      ),
    ).toBe(false);
  });

  it('returns false when aiBubbleProps missing top-level key', () => {
    expect(
      bubblePropsAreEqual(
        baseProps({ aiBubbleProps: { a: 1, b: 2 } }),
        baseProps({ aiBubbleProps: { a: 1 } }),
      ),
    ).toBe(false);
  });

  it('returns true when shouldShowCopy function references match', () => {
    const fn = () => true;
    expect(
      bubblePropsAreEqual(
        baseProps({ shouldShowCopy: fn }),
        baseProps({ shouldShowCopy: fn }),
      ),
    ).toBe(true);
  });

  it('returns false when meta description differs', () => {
    expect(
      bubblePropsAreEqual(
        baseProps({ originData: baseOrigin({ meta: { description: 'a' } }) }),
        baseProps({ originData: baseOrigin({ meta: { description: 'b' } }) }),
      ),
    ).toBe(false);
  });

  it('returns false when meta backgroundColor differs', () => {
    expect(
      bubblePropsAreEqual(
        baseProps({
          originData: baseOrigin({ meta: { backgroundColor: '#fff' } }),
        }),
        baseProps({
          originData: baseOrigin({ meta: { backgroundColor: '#000' } }),
        }),
      ),
    ).toBe(false);
  });

  it('returns true when meta only differs on non-affecting keys', () => {
    expect(
      bubblePropsAreEqual(
        baseProps({ originData: baseOrigin({ meta: { foo: 1 } as any }) }),
        baseProps({ originData: baseOrigin({ meta: { foo: 2 } as any }) }),
      ),
    ).toBe(true);
  });

  it('returns false when meta metadata nested value differs', () => {
    expect(
      bubblePropsAreEqual(
        baseProps({
          originData: baseOrigin({
            meta: { metadata: { traceId: 'a' } },
          }),
        }),
        baseProps({
          originData: baseOrigin({
            meta: { metadata: { traceId: 'b' } },
          }),
        }),
      ),
    ).toBe(false);
  });

  it('returns true when both meta metadata missing', () => {
    expect(
      bubblePropsAreEqual(
        baseProps({ originData: baseOrigin({ meta: { title: 't' } }) }),
        baseProps({ originData: baseOrigin({ meta: { title: 't' } }) }),
      ),
    ).toBe(true);
  });

  it('returns false when aIBubbleProps nested differs', () => {
    expect(
      bubblePropsAreEqual(
        baseProps({ aIBubbleProps: { x: { y: 1 } } }),
        baseProps({ aIBubbleProps: { x: { y: 2 } } }),
      ),
    ).toBe(false);
  });

  it('returns false when docListProps primitive top-level differs', () => {
    expect(
      bubblePropsAreEqual(
        baseProps({ docListProps: { mode: 'a' } }),
        baseProps({ docListProps: { mode: 'b' } }),
      ),
    ).toBe(false);
  });

  it('returns true when inline style shallow-equal via empty fallback', () => {
    expect(
      bubblePropsAreEqual(baseProps({ style: undefined }), baseProps({})),
    ).toBe(true);
  });

  it('returns false when originData one side undefined', () => {
    expect(
      bubblePropsAreEqual(
        baseProps({ originData: baseOrigin() }),
        baseProps({ originData: undefined }),
      ),
    ).toBe(false);
  });
});

describe('bubblePropsAreEqual istanbul residual', () => {
  it('config 同长度不同键走 !(k in rb) 分支', () => {
    expect(
      bubblePropsAreEqual(
        baseProps({ customConfig: { a: 1 } }),
        baseProps({ customConfig: { b: 1 } }),
      ),
    ).toBe(false);
  });

  it('config 顶层数组值走 Array.isArray else 分支', () => {
    expect(
      bubblePropsAreEqual(
        baseProps({ customConfig: { list: [1, 2] } }),
        baseProps({ customConfig: { list: [1, 2] } }),
      ),
    ).toBe(false);
  });

  it('styles 一侧数组一侧对象返回 false', () => {
    expect(
      bubblePropsAreEqual(
        baseProps({ styles: { root: [1] as any } }),
        baseProps({ styles: { root: { padding: 1 } } }),
      ),
    ).toBe(false);
  });

  it('meta metadata 一侧缺失一侧存在', () => {
    expect(
      bubblePropsAreEqual(
        baseProps({
          originData: baseOrigin({ meta: { title: 't', metadata: { k: 1 } } }),
        }),
        baseProps({
          originData: baseOrigin({ meta: { title: 't' } }),
        }),
      ),
    ).toBe(false);
  });

  it('meta metadata 空对象不计入 affect', () => {
    expect(
      bubblePropsAreEqual(
        baseProps({
          originData: baseOrigin({ meta: { metadata: {} } }),
        }),
        baseProps({
          originData: baseOrigin({ meta: { foo: 1 } as any }),
        }),
      ),
    ).toBe(true);
  });

  it('avatar 一侧 null 一侧对象', () => {
    expect(
      bubblePropsAreEqual(
        baseProps({ avatar: null as any }),
        baseProps({ avatar: { title: 'a' } }),
      ),
    ).toBe(false);
  });

  it('style 引用不同但浅相等', () => {
    expect(
      bubblePropsAreEqual(
        baseProps({ style: { margin: 1 } }),
        baseProps({ style: { margin: 1 } }),
      ),
    ).toBe(true);
  });

  it('classNames 一侧 null', () => {
    expect(
      bubblePropsAreEqual(
        baseProps({ classNames: { root: 'a' } }),
        baseProps({ classNames: null as any }),
      ),
    ).toBe(false);
  });

  it('deps 同长度中间项相等末项不等', () => {
    expect(
      bubblePropsAreEqual(
        baseProps({ deps: [1, 2, 3] }),
        baseProps({ deps: [1, 2, 9] }),
      ),
    ).toBe(false);
  });

  it('preMessage 同引用跳过比较', () => {
    const pre: MessageBubbleData = { id: 'p1', role: 'user', content: 'hi' };
    expect(
      bubblePropsAreEqual(
        baseProps({ preMessage: pre }),
        baseProps({ preMessage: pre }),
      ),
    ).toBe(true);
  });

  it('markdownRenderConfig 一侧 null', () => {
    expect(
      bubblePropsAreEqual(
        baseProps({ markdownRenderConfig: { a: 1 } as any }),
        baseProps({ markdownRenderConfig: null as any }),
      ),
    ).toBe(false);
  });

  it('originData 同引用直接相等', () => {
    const origin = baseOrigin();
    expect(
      bubblePropsAreEqual(
        baseProps({ originData: origin }),
        baseProps({ originData: origin }),
      ),
    ).toBe(true);
  });
});
