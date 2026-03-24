import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React, { useEffect } from 'react';
import { describe, expect, it } from 'vitest';
import { useMarkdownToReact } from '../../src/MarkdownRenderer';
import type { RendererBlockProps } from '../../src/MarkdownRenderer';

interface Counters {
  mounts: number;
  unmounts: number;
}

const createCodeBlockProbe = (counters: Counters) => {
  const CodeBlockProbe: React.FC<RendererBlockProps> = ({ children }) => {
    useEffect(() => {
      counters.mounts += 1;
      return () => {
        counters.unmounts += 1;
      };
    }, []);

    return <div data-testid="streaming-code-block-probe">{children}</div>;
  };

  return CodeBlockProbe;
};

const HookHarness: React.FC<{
  content: string;
  streaming: boolean;
  codeBlockComponent: React.ComponentType<RendererBlockProps>;
}> = ({ content, streaming, codeBlockComponent }) => {
  const reactNode = useMarkdownToReact(content, {
    streaming,
    components: {
      __codeBlock: codeBlockComponent,
    },
  });

  return <div data-testid="hook-output">{reactNode}</div>;
};

describe('useMarkdownToReact streaming stability', () => {
  it('流式场景下追加末块内容时，不应重复卸载挂载代码块组件', () => {
    const counters: Counters = { mounts: 0, unmounts: 0 };
    const CodeBlockProbe = createCodeBlockProbe(counters);

    const { rerender, unmount } = render(
      <HookHarness
        content={'```chart\n{"value":1'}
        streaming
        codeBlockComponent={CodeBlockProbe}
      />,
    );

    expect(screen.getByTestId('streaming-code-block-probe')).toBeInTheDocument();
    expect(counters.mounts).toBe(1);
    expect(counters.unmounts).toBe(0);

    rerender(
      <HookHarness
        content={'```chart\n{"value":12'}
        streaming
        codeBlockComponent={CodeBlockProbe}
      />,
    );
    rerender(
      <HookHarness
        content={'```chart\n{"value":123'}
        streaming
        codeBlockComponent={CodeBlockProbe}
      />,
    );

    expect(counters.mounts).toBe(1);
    expect(counters.unmounts).toBe(0);

    unmount();
    expect(counters.unmounts).toBe(1);
  });

  it('末块变为非末块时（流式追加新块），已完成块不应卸载重挂', () => {
    const counters: Counters = { mounts: 0, unmounts: 0 };
    const CodeBlockProbe = createCodeBlockProbe(counters);

    const chartBlock =
      '```chart\n{"config":[{"chartType":"line"}],"dataSource":[]}\n```';

    const { rerender, unmount } = render(
      <HookHarness
        content={chartBlock}
        streaming
        codeBlockComponent={CodeBlockProbe}
      />,
    );

    expect(screen.getByTestId('streaming-code-block-probe')).toBeInTheDocument();
    expect(counters.mounts).toBe(1);
    expect(counters.unmounts).toBe(0);

    // 分块逻辑：围栏外需连续两个空行（\n\n\n）才切块，与 splitMarkdownBlocks 一致
    rerender(
      <HookHarness
        content={`${chartBlock}\n\n\n后续段落`}
        streaming
        codeBlockComponent={CodeBlockProbe}
      />,
    );

    expect(counters.mounts).toBe(1);
    expect(counters.unmounts).toBe(0);

    unmount();
    expect(counters.unmounts).toBe(1);
  });
});
