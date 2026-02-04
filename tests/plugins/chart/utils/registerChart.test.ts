import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
  registerChartComponents,
  registerLineChartComponents,
  registerBarChartComponents,
} from '../../../../src/Plugins/chart/utils/registerChart';

describe('registerChartComponents', () => {
  it('应该调用注册函数', () => {
    const registerFn = vi.fn();

    // 使用唯一的组件名避免与其他测试冲突
    registerChartComponents('test-chart-unique-1', registerFn);

    expect(registerFn).toHaveBeenCalledTimes(1);
  });

  it('不应该重复注册相同的组件', () => {
    const registerFn = vi.fn();

    // 使用唯一的组件名避免与其他测试冲突
    const componentName = 'test-chart-unique-2';
    registerChartComponents(componentName, registerFn);
    registerChartComponents(componentName, registerFn);
    registerChartComponents(componentName, registerFn);

    expect(registerFn).toHaveBeenCalledTimes(1);
  });

  it('应该允许注册不同的组件', () => {
    const registerFn1 = vi.fn();
    const registerFn2 = vi.fn();

    registerChartComponents('chart-unique-1', registerFn1);
    registerChartComponents('chart-unique-2', registerFn2);

    expect(registerFn1).toHaveBeenCalledTimes(1);
    expect(registerFn2).toHaveBeenCalledTimes(1);
  });

  it('在 SSR 环境中应该不执行注册', () => {
    const originalWindow = global.window;
    // @ts-ignore
    delete global.window;

    const registerFn = vi.fn();

    registerChartComponents('test-chart-ssr', registerFn);

    expect(registerFn).not.toHaveBeenCalled();

    global.window = originalWindow;
  });
});

describe('registerLineChartComponents', () => {
  it('应该能够调用注册函数', () => {
    // 由于 registerLineChartComponents 会调用 ChartJS.register
    // 我们主要测试函数不会抛出错误
    expect(() => {
      registerLineChartComponents();
    }).not.toThrow();
  });

  it('不应该在第二次调用时抛出错误', () => {
    // 第一次调用
    registerLineChartComponents();

    // 第二次调用不应该抛出错误（因为会跳过注册）
    expect(() => {
      registerLineChartComponents();
    }).not.toThrow();
  });
});

describe('registerBarChartComponents', () => {
  it('应该能够调用注册函数', () => {
    // 由于 registerBarChartComponents 会调用 ChartJS.register
    // 我们主要测试函数不会抛出错误
    expect(() => {
      registerBarChartComponents();
    }).not.toThrow();
  });

  it('不应该在第二次调用时抛出错误', () => {
    // 第一次调用
    registerBarChartComponents();

    // 第二次调用不应该抛出错误（因为会跳过注册）
    expect(() => {
      registerBarChartComponents();
    }).not.toThrow();
  });
});

