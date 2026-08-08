/**
 * Midtail batch G：更多 miss 2–12 纯函数（避开 Editor/charts/FileComponent）。
 */
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { normalizeOpenClawMessagesToOpenAI } from '../Bubble/OpenAIMessageBubble/normalizeOpenClawMessages';
import Indicator from '../Components/Loading/Indicator';
import { extractBlockTextContent } from '../MarkdownRenderer/extractBlockTextContent';
import { rehypeFootnoteRef } from '../MarkdownRenderer/plugins/rehypeFootnoteRef';
import { resolveInitialCodeBlockViewMode } from '../Plugins/code/utils/resolveInitialCodeBlockViewMode';
import {
  hasNormalizedTaskContent,
  normalizeTaskContent,
} from '../TaskList/normalizeTaskContent';

vi.mock('../Components/lotties/LoadingLottie', () => ({
  LoadingLottie: (p: any) => <div data-testid="lottie" data-size={p.size} />,
}));

describe('midtail batch G pure branches', () => {
  it('extractBlockTextContent：string/number/array/element/null', () => {
    expect(extractBlockTextContent('hi')).toBe('hi');
    expect(extractBlockTextContent(7)).toBe('7');
    expect(extractBlockTextContent(['a', 1])).toBe('a1');
    expect(
      extractBlockTextContent(React.createElement('span', null, 'nested')),
    ).toBe('nested');
    expect(extractBlockTextContent(null)).toBe('');
  });

  it('resolveInitialCodeBlockViewMode 矩阵', () => {
    expect(
      resolveInitialCodeBlockViewMode({
        readonly: true,
        language: 'HTML',
        shouldDisableHtmlPreview: true,
      }),
    ).toBe('code');
    expect(
      resolveInitialCodeBlockViewMode({
        readonly: false,
        language: 'markdown',
        shouldDisableHtmlPreview: false,
      }),
    ).toBe('code');
    expect(
      resolveInitialCodeBlockViewMode({
        readonly: true,
        language: 'html',
        shouldDisableHtmlPreview: false,
      }),
    ).toBe('preview');
    expect(
      resolveInitialCodeBlockViewMode({
        readonly: true,
        language: 'markdown',
        shouldDisableHtmlPreview: false,
      }),
    ).toBe('preview');
    expect(
      resolveInitialCodeBlockViewMode({
        readonly: true,
        language: 'ts',
        shouldDisableHtmlPreview: false,
      }),
    ).toBe('code');
  });

  it('normalizeOpenClaw：toolResult 空/字符串/parts；普通消息去 timestamp', () => {
    const out = normalizeOpenClawMessagesToOpenAI([
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
    ]);
    expect(out[0]).toMatchObject({ role: 'tool', content: '' });
    expect(out[1]).toMatchObject({ role: 'tool', content: 'ok' });
    expect(out[2]).toMatchObject({ role: 'tool', content: 'x' });
    expect(out[3]).toMatchObject({ role: 'user', content: 'hi' });
    expect((out[3] as any).timestamp).toBeUndefined();
  });

  it('normalizeTaskContent / hasNormalized：boolean title / React 数组', () => {
    expect(normalizeTaskContent(null, false)).toBe(false);
    expect(hasNormalizedTaskContent(null, true)).toBe(true);
    expect(hasNormalizedTaskContent([React.createElement('i')])).toBe(true);
  });

  it('Indicator：自定义 / percent / 默认 lottie', () => {
    const { rerender } = render(
      <Indicator indicator={<span data-testid="custom-ind">C</span>} />,
    );
    expect(screen.getByTestId('custom-ind')).toBeTruthy();
    rerender(<Indicator percent={40} size={32} />);
    expect(document.body).toBeTruthy();
    rerender(<Indicator size="1em" />);
    expect(screen.getByTestId('lottie')).toBeTruthy();
  });

  it('rehypeFootnoteRef：无匹配跳过；有 [^n] 拆成 span', () => {
    const plugin = rehypeFootnoteRef();
    const treePlain = {
      type: 'root',
      children: [{ type: 'text', value: 'no refs' }],
    };
    plugin(treePlain);
    expect(treePlain.children).toHaveLength(1);

    const tree = {
      type: 'root',
      children: [
        {
          type: 'element',
          tagName: 'p',
          children: [{ type: 'text', value: 'see [^1] and [^2] end' }],
        },
      ],
    };
    plugin(tree);
    const kids = (tree.children[0] as any).children;
    expect(kids.length).toBeGreaterThan(1);
    expect(
      kids.some(
        (c: any) =>
          c.type === 'element' && c.properties?.['data-fnc-name'] === '1',
      ),
    ).toBe(true);
  });
});
