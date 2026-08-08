/**
 * remarkContainer residual：默认 options / 自定义 class。
 */
import { describe, expect, it } from 'vitest';
import { remarkContainer } from '../remarkContainer';

describe('remarkContainer residual branches', () => {
  it('默认与自定义 options 返回 transformer', () => {
    const t1 = remarkContainer();
    const t2 = remarkContainer({
      className: 'c',
      containerTag: 'section',
      titleElement: null,
    });
    expect(typeof t1).toBe('function');
    expect(typeof t2).toBe('function');
  });

  it('transformer 处理空 tree 不抛', () => {
    const transform = remarkContainer() as any;
    const tree = { type: 'root', children: [] };
    expect(() => transform(tree)).not.toThrow();
  });
});
