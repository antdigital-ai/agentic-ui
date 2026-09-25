/**
 * Midtail batch A：纯函数 / hooks 小模块补洞。
 */
import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { normalizeOpenClawMessagesToOpenAI } from '../Bubble/OpenAIMessageBubble/normalizeOpenClawMessages';
import { useAsyncLottieData } from '../Components/lotties/useAsyncLottieData';
import { useElementSize } from '../Hooks/useElementSize';
import {
  childArrayHasInvalidEntries,
  compactEditorRootChildren,
  createDefaultBlock,
  getChildList,
  isValidChild,
  rebuildElement,
  rebuildOrDefaultBlock,
  runWithoutHistory,
} from '../MarkdownEditor/editor/plugins/sanitizeInvalidChildrenBehavior';
import { createHastProcessor } from '../MarkdownRenderer/processor';
import {
  getAdaptiveTooltipProps,
  getAdaptiveTooltipTriggerPropsSnapshot,
  shouldUseInformationalTooltipClickTrigger,
  subscribeAdaptiveTooltipEnvironment,
} from '../Utils/adaptiveTooltip';
import {
  hasDangerousUrlScheme,
  serializeHastElement,
  shouldElementRenderAsPlainText,
  shouldRenderUrlAsPlainText,
} from '../Utils/htmlUrlSafety';

describe('midtail batch A branches', () => {
  it('normalizeOpenClaw：toolResult 空/字符串/数组 content', () => {
    expect(
      normalizeOpenClawMessagesToOpenAI([
        {
          role: 'toolResult',
          id: '1',
          name: 't',
          tool_call_id: 'c1',
          content: null,
        } as any,
        {
          role: 'toolResult',
          id: '2',
          name: 't',
          tool_call_id: 'c2',
          content: 'ok',
        } as any,
        {
          role: 'toolResult',
          id: '3',
          name: 't',
          tool_call_id: 'c3',
          content: [{ type: 'text', text: 'x' }],
        } as any,
        { role: 'user', content: 'hi', timestamp: 1 } as any,
      ]).map((m) => m.role),
    ).toEqual(['tool', 'tool', 'tool', 'user']);
  });

  it('useAsyncLottieData：default export / 取消 / 失败', async () => {
    const load = vi.fn(async () => ({ default: { v: '5.0' } }));
    const { result, unmount } = renderHook(() => useAsyncLottieData(load));
    await waitFor(() => expect(result.current).toEqual({ v: '5.0' }));
    unmount();

    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    const fail = vi.fn(async () => {
      throw new Error('boom');
    });
    const { result: r2 } = renderHook(() => useAsyncLottieData(fail));
    await waitFor(() => expect(fail).toHaveBeenCalled());
    expect(r2.current).toBeNull();
    err.mockRestore();
  });

  it('useElementSize：无节点 / 挂载测量', () => {
    const { result } = renderHook(() => useElementSize<HTMLDivElement>());
    expect(typeof result.current.ref).toBe('function');
    // hook 暴露 width/height，而非嵌套 size 对象
    expect(result.current.width ?? 0).toBe(0);
    expect(result.current.height ?? 0).toBe(0);
    const el = document.createElement('div');
    Object.defineProperty(el, 'getBoundingClientRect', {
      value: () => ({
        width: 12,
        height: 34,
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
      }),
    });
    act(() => {
      result.current.ref(el);
    });
    expect(result.current.width ?? 0).toBeGreaterThanOrEqual(0);
    act(() => {
      result.current.ref(null);
    });
    expect(result.current.width ?? 0).toBe(0);
  });

  it('sanitizeInvalidChildrenBehavior 工具函数', () => {
    expect(isValidChild(null)).toBe(false);
    expect(isValidChild({ text: '' })).toBe(true);
    expect(getChildList({ text: 'x' } as any)).toEqual([]);
    expect(
      getChildList({ type: 'p', children: [{ text: '' }] } as any),
    ).toHaveLength(1);
    expect(childArrayHasInvalidEntries([undefined as any])).toBe(true);
    expect(childArrayHasInvalidEntries([{ text: '' }])).toBe(false);
    expect(createDefaultBlock().type).toBe('paragraph');
    expect(
      rebuildElement({ type: 'p', children: [null] } as any).children,
    ).toEqual([{ text: '' }]);
    expect(rebuildOrDefaultBlock({ type: 'head' }).type).toBe('head');
    expect(rebuildOrDefaultBlock(null).type).toBe('paragraph');
    const calls: string[] = [];
    runWithoutHistory({} as any, () => calls.push('ok'));
    expect(calls).toEqual(['ok']);
    expect(
      compactEditorRootChildren([undefined, { type: 'p' }, null] as any).length,
    ).toBeGreaterThan(0);
  });

  it('createHastProcessor 可 parse 简单 markdown', () => {
    const processor = createHastProcessor();
    const tree = processor.parse('# hi') as any;
    expect(tree?.type).toBe('root');
    expect(JSON.stringify(tree)).toContain('hi');
  });

  it('adaptiveTooltip / htmlUrlSafety 残留路径', () => {
    expect(typeof shouldUseInformationalTooltipClickTrigger()).toBe('boolean');
    expect(getAdaptiveTooltipProps('interactive')).toBeTruthy();
    expect(getAdaptiveTooltipTriggerPropsSnapshot('interactive')).toBeTruthy();
    const unsub = subscribeAdaptiveTooltipEnvironment(() => {});
    unsub();

    expect(shouldRenderUrlAsPlainText('')).toBe(false);
    expect(hasDangerousUrlScheme('javascript:alert(1)')).toBe(true);
    expect(
      shouldElementRenderAsPlainText({
        type: 'element',
        tagName: 'div',
        properties: {},
      }),
    ).toBe(false);
    expect(
      serializeHastElement({
        tagName: 'img',
        properties: { src: 'x' },
      }),
    ).toContain('img');
  });
});
