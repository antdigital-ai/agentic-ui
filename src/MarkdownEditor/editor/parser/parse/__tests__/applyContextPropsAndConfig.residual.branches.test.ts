/**
 * applyContextPropsAndConfig residual：数组/单元素、align 回退、已有 otherProps。
 */
import { describe, expect, it } from 'vitest';
import { applyContextPropsAndConfig } from '../applyContextPropsAndConfig';

describe('applyContextPropsAndConfig residual branches', () => {
  it('空 context/config 不挂属性；nullish 安全', () => {
    const el = { type: 'paragraph', children: [{ text: 'a' }] };
    const out = applyContextPropsAndConfig(el, null, undefined);
    expect(out).toMatchObject({ type: 'paragraph' });
    expect((out as any).contextProps).toBeUndefined();
    expect((out as any).otherProps).toBeUndefined();
  });

  it('单元素：挂 contextProps；无 otherProps 时挂 config；align 来自 config', () => {
    const out = applyContextPropsAndConfig(
      { type: 'paragraph', children: [{ text: 'x' }] },
      { bubble: 1 },
      { align: 'center' },
    ) as any;
    expect(out.contextProps).toEqual({ bubble: 1 });
    expect(out.otherProps).toEqual({ align: 'center' });
    expect(out.align).toBe('center');
  });

  it('已有 otherProps 时不覆盖；align 回退 item.otherProps / item.align', () => {
    const out = applyContextPropsAndConfig(
      {
        type: 'head',
        align: 'left',
        otherProps: { keep: true },
        children: [{ text: 'h' }],
      },
      { c: 1 },
      { align: 'right', extra: 2 },
    ) as any;
    expect(out.otherProps).toEqual({ keep: true });
    expect(out.align).toBe('right');
  });

  it('数组映射；非 paragraph/head 不写 align', () => {
    const out = applyContextPropsAndConfig(
      [
        { type: 'code', children: [{ text: 'c' }] },
        {
          type: 'paragraph',
          otherProps: { align: 'justify' },
          children: [{ text: 'p' }],
        },
      ],
      { k: 1 },
      {},
    ) as any[];
    expect(out).toHaveLength(2);
    expect(out[0].contextProps).toEqual({ k: 1 });
    expect(out[0].align).toBeUndefined();
    expect(out[1].align).toBe('justify');
  });
});
