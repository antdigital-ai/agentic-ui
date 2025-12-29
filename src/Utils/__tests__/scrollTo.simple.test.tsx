import { describe, expect, it, vi } from 'vitest';
import scrollTo from '../@ant-design/agentic-ui/Utils/scrollTo';

describe('scrollTo 工具函数 - 简化测试', () => {
  it('应该导出 scrollTo 函数', async () => {
    const scrollToModule = await import('../@ant-design/agentic-ui/Utils/scrollTo');
    expect(typeof scrollToModule.default).toBe('function');
  });

  it('应该接受目标位置参数', async () => {
    const scrollToModule = await import('../@ant-design/agentic-ui/Utils/scrollTo');
    expect(() => scrollToModule.default(100)).not.toThrow();
  });

  it('应该接受选项参数', async () => {
    const scrollToModule = await import('../@ant-design/agentic-ui/Utils/scrollTo');
    expect(() => scrollToModule.default(100, { duration: 500 })).not.toThrow();
  });

  it('应该接受回调函数', async () => {
    const scrollToModule = await import('../@ant-design/agentic-ui/Utils/scrollTo');
    const callback = vi.fn();
    expect(() => scrollToModule.default(100, { callback })).not.toThrow();
  });

  it('应该接受自定义容器', async () => {
    const scrollToModule = await import('../@ant-design/agentic-ui/Utils/scrollTo');
    const container = document.createElement('div');
    expect(() => scrollToModule.default(100, { container })).not.toThrow();
  });
});

describe('scrollTo - 完整功能测试', () => {
  it('应该调用 scrollTo 不抛出错误', () => {
    expect(() => scrollTo(100)).not.toThrow();
  });

  it('应该接受持续时间参数', () => {
    expect(() => scrollTo(100, { duration: 1000 })).not.toThrow();
  });

  it('应该接受回调函数参数', () => {
    const callback = vi.fn();
    expect(() => scrollTo(100, { callback, duration: 10 })).not.toThrow();
  });

  it('应该接受 Document 容器', () => {
    expect(() => scrollTo(100, { container: document })).not.toThrow();
  });

  it('应该接受 HTMLElement 容器', () => {
    const div = document.createElement('div');
    expect(() => scrollTo(100, { container: div })).not.toThrow();
  });

  it('应该处理零持续时间', () => {
    const callback = vi.fn();
    expect(() => scrollTo(100, { duration: 0, callback })).not.toThrow();
  });

  it('应该接受 Window 作为默认容器', () => {
    expect(() => scrollTo(200)).not.toThrow();
  });
});
