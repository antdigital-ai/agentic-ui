import { describe, expect, it, vi } from 'vitest';

describe('throttleByAnimationFrame 工具函数 - 简化测试', () => {
  it('应该导出默认函数', async () => {
    const module = await import('../throttleByAnimationFrame');
    expect(typeof module.default).toBe('function');
  });

  it('应该返回一个函数', async () => {
    const module = await import('../throttleByAnimationFrame');
    const fn = vi.fn();
    const throttled = module.default(fn);
    expect(typeof throttled).toBe('function');
  });

  it('应该有 cancel 方法', async () => {
    const module = await import('../throttleByAnimationFrame');
    const fn = vi.fn();
    const throttled = module.default(fn);
    expect(typeof throttled.cancel).toBe('function');
  });

  it('应该能够调用节流函数', async () => {
    const module = await import('../throttleByAnimationFrame');
    const fn = vi.fn();
    const throttled = module.default(fn);
    expect(() => throttled()).not.toThrow();
  });

  it('应该能够传递参数', async () => {
    const module = await import('../throttleByAnimationFrame');
    const fn = vi.fn();
    const throttled = module.default(fn);
    expect(() => throttled('arg1', 'arg2')).not.toThrow();
  });

  it('应该能够调用 cancel', async () => {
    const module = await import('../throttleByAnimationFrame');
    const fn = vi.fn();
    const throttled = module.default(fn);
    expect(() => throttled.cancel()).not.toThrow();
  });

  it('应该多次调用 cancel 不报错', async () => {
    const module = await import('../throttleByAnimationFrame');
    const fn = vi.fn();
    const throttled = module.default(fn);
    throttled.cancel();
    expect(() => throttled.cancel()).not.toThrow();
  });

  it('应该处理复杂参数', async () => {
    const module = await import('../throttleByAnimationFrame');
    const fn = vi.fn();
    const throttled = module.default(fn);
    const complexArg = { nested: { value: 123 }, array: [1, 2, 3] };
    expect(() => throttled(complexArg)).not.toThrow();
  });

  it('应该处理 undefined 和 null 参数', async () => {
    const module = await import('../throttleByAnimationFrame');
    const fn = vi.fn();
    const throttled = module.default(fn);
    expect(() => throttled(undefined, null)).not.toThrow();
  });
});


