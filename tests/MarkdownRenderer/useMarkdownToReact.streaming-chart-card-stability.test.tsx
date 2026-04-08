import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React, { useEffect } from 'react';
import { describe, expect, it } from 'vitest';
import {
  ChartBlockRenderer,
  SchemaBlockRenderer,
  useMarkdownToReact,
} from '../../src/MarkdownRenderer';
import type { RendererBlockProps } from '../../src/MarkdownRenderer';

interface Counters {
  mounts: number;
  unmounts: number;
}

const createMountProbe = (
  testId: string,
  counters: Counters,
): React.FC<{ children: React.ReactNode }> => {
  const Probe: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    useEffect(() => {
      counters.mounts += 1;
      return () => {
        counters.unmounts += 1;
      };
    }, []);

    return <div data-testid={testId}>{children}</div>;
  };
  Probe.displayName = `MountProbe(${testId})`;
  return Probe;
};

/**
 * 与 MarkdownRenderer 中 DefaultCodeRouter 一致的语言分支，用于对图表 / 卡片做挂载计数。
 */
const createInstrumentedCodeBlock = (counters: {
  chart: Counters;
  card: Counters;
}) => {
  const ChartProbe = createMountProbe('streaming-chart-probe', counters.chart);
  const CardProbe = createMountProbe('streaming-card-probe', counters.card);

  const InstrumentedCodeBlock: React.FC<RendererBlockProps> = (props) => {
    const { language } = props;

    if (language === 'chart' || language === 'json-chart') {
      return (
        <ChartProbe>
          <ChartBlockRenderer {...props} language={language} />
        </ChartProbe>
      );
    }

    if (
      language === 'schema' ||
      language === 'apaasify' ||
      language === 'apassify' ||
      language === 'agentar-card'
    ) {
      return (
        <CardProbe>
          <SchemaBlockRenderer {...props} language={language} />
        </CardProbe>
      );
    }

    return (
      <pre data-testid="instrumented-fallback-pre">
        <code>{language}</code>
      </pre>
    );
  };

  InstrumentedCodeBlock.displayName = 'InstrumentedCodeBlock';
  return InstrumentedCodeBlock;
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

describe('useMarkdownToReact streaming — 图表 / 卡片重组件稳定性', () => {
  it('流式追加 chart 块 JSON 时，ChartBlockRenderer 不应重复挂载', () => {
    const chart = { chart: { mounts: 0, unmounts: 0 }, card: { mounts: 0, unmounts: 0 } };
    const CodeBlock = createInstrumentedCodeBlock(chart);

    const { rerender, unmount } = render(
      <HookHarness
        content={'```chart\n{"config":[{"chartType":"line"}],"dataSource":[]'}
        streaming
        codeBlockComponent={CodeBlock}
      />,
    );

    expect(screen.getByTestId('streaming-chart-probe')).toBeInTheDocument();
    expect(chart.chart.mounts).toBe(1);
    expect(chart.chart.unmounts).toBe(0);

    rerender(
      <HookHarness
        content={
          '```chart\n{"config":[{"chartType":"line"}],"dataSource":[],"x":"m"'
        }
        streaming
        codeBlockComponent={CodeBlock}
      />,
    );

    expect(chart.chart.mounts).toBe(1);
    expect(chart.chart.unmounts).toBe(0);

    unmount();
    expect(chart.chart.unmounts).toBe(1);
  });

  it('chart 块封版后追加新块时，图表不应重复挂载', () => {
    const chart = { chart: { mounts: 0, unmounts: 0 }, card: { mounts: 0, unmounts: 0 } };
    const CodeBlock = createInstrumentedCodeBlock(chart);

    const chartFence =
      '```chart\n{"config":[{"chartType":"bar"}],"dataSource":[]}\n```';

    const { rerender, unmount } = render(
      <HookHarness
        content={chartFence}
        streaming
        codeBlockComponent={CodeBlock}
      />,
    );

    expect(chart.chart.mounts).toBe(1);

    rerender(
      <HookHarness
        content={`${chartFence}\n\n\n下一段说明`}
        streaming
        codeBlockComponent={CodeBlock}
      />,
    );

    expect(chart.chart.mounts).toBe(1);
    expect(chart.chart.unmounts).toBe(0);

    unmount();
  });

  it('流式追加 agentar-card 块 JSON 时，SchemaBlockRenderer 不应重复挂载', () => {
    const chart = { chart: { mounts: 0, unmounts: 0 }, card: { mounts: 0, unmounts: 0 } };
    const CodeBlock = createInstrumentedCodeBlock(chart);

    const { rerender, unmount } = render(
      <HookHarness
        content={
          '```agentar-card\n{"type":"form","properties":{"a":{"type":"string"'
        }
        streaming
        codeBlockComponent={CodeBlock}
      />,
    );

    expect(screen.getByTestId('streaming-card-probe')).toBeInTheDocument();
    expect(chart.card.mounts).toBe(1);
    expect(chart.card.unmounts).toBe(0);

    rerender(
      <HookHarness
        content={
          '```agentar-card\n{"type":"form","properties":{"a":{"type":"string","title":"t"}}'
        }
        streaming
        codeBlockComponent={CodeBlock}
      />,
    );

    expect(chart.card.mounts).toBe(1);
    expect(chart.card.unmounts).toBe(0);

    unmount();
    expect(chart.card.unmounts).toBe(1);
  });

  it('agentar-card 块封版后追加新块时，卡片不应重复挂载', () => {
    const chart = { chart: { mounts: 0, unmounts: 0 }, card: { mounts: 0, unmounts: 0 } };
    const CodeBlock = createInstrumentedCodeBlock(chart);

    const cardFence =
      '```agentar-card\n' +
      JSON.stringify({
        type: 'object',
        properties: { name: { type: 'string' } },
      }) +
      '\n```';

    const { rerender, unmount } = render(
      <HookHarness
        content={cardFence}
        streaming
        codeBlockComponent={CodeBlock}
      />,
    );

    expect(chart.card.mounts).toBe(1);

    rerender(
      <HookHarness
        content={`${cardFence}\n\n\n后续内容`}
        streaming
        codeBlockComponent={CodeBlock}
      />,
    );

    expect(chart.card.mounts).toBe(1);
    expect(chart.card.unmounts).toBe(0);

    unmount();
  });
});
