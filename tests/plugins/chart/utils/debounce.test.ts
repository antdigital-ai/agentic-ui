import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { debounce } from '../../../../src/Plugins/chart/utils';

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('应该延迟执行函数', () => {
    const func = vi.fn();
    const debouncedFunc = debounce(func, 100);

    debouncedFunc();
    expect(func).not.toHaveBeenCalled();

    vi.advanceTimersByTime(50);
    expect(func).not.toHaveBeenCalled();

    vi.advanceTimersByTime(50);
    expect(func).toHaveBeenCalledTimes(1);
  });

  it('应该在延迟时间内多次调用时重新计时', () => {
    const func = vi.fn();
    const debouncedFunc = debounce(func, 100);

    debouncedFunc();
    vi.advanceTimersByTime(50);

    debouncedFunc(); // 重新触发
    vi.advanceTimersByTime(50);
    expect(func).not.toHaveBeenCalled(); // 仍未执行

    vi.advanceTimersByTime(50);
    expect(func).toHaveBeenCalledTimes(1); // 现在执行了
  });

  it('应该正确传递参数', () => {
    const func = vi.fn();
    const debouncedFunc = debounce(func, 100);

    // @ts-ignore - 忽略参数类型检查
    debouncedFunc('arg1', 'arg2');
    vi.advanceTimersByTime(100);

    expect(func).toHaveBeenCalledWith('arg1', 'arg2');
  });

  it('应该正确处理this上下文', () => {
    const obj = {
      value: 42,
      func: vi.fn(function (this: any) {
        return this.value;
      }),
    };

    const debouncedFunc = debounce(obj.func, 100);

    const boundFunc = debouncedFunc.bind(obj);
    boundFunc();
    vi.advanceTimersByTime(100);

    expect(obj.func).toHaveBeenCalled();
  });

  it('应该支持flush方法立即执行', () => {
    const func = vi.fn();
    const debouncedFunc = debounce(func, 100);

    debouncedFunc();
    expect(func).not.toHaveBeenCalled();

    debouncedFunc.flush();
    expect(func).toHaveBeenCalledTimes(1);
  });

  it('应该支持cancel方法取消执行', () => {
    const func = vi.fn();
    const debouncedFunc = debounce(func, 100);

    debouncedFunc();
    expect(func).not.toHaveBeenCalled();

    debouncedFunc.cancel();
    vi.advanceTimersByTime(100);
    expect(func).not.toHaveBeenCalled();
  });

  it('应该在flush后正确处理后续调用', () => {
    const func = vi.fn();
    const debouncedFunc = debounce(func, 100);

    debouncedFunc();
    debouncedFunc.flush();
    expect(func).toHaveBeenCalledTimes(1);

    debouncedFunc();
    vi.advanceTimersByTime(100);
    expect(func).toHaveBeenCalledTimes(2);
  });

  it('应该在cancel后正确处理后续调用', () => {
    const func = vi.fn();
    const debouncedFunc = debounce(func, 100);

    debouncedFunc();
    debouncedFunc.cancel();
    expect(func).not.toHaveBeenCalled();

    debouncedFunc();
    vi.advanceTimersByTime(100);
    expect(func).toHaveBeenCalledTimes(1);
  });

  it('应该处理没有延迟参数的情况', () => {
    const func = vi.fn();
    // @ts-ignore - 忽略参数数量检查
    const debouncedFunc = debounce(func, undefined);

    debouncedFunc();
    // 当delay为undefined时，setTimeout会立即执行
    vi.advanceTimersByTime(0);
    expect(func).toHaveBeenCalledTimes(1);
  });
});
