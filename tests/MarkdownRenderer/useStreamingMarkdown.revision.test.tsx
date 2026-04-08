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

    return <div data-testid="revision-code-block-probe">{children}</div>;
  };

  return CodeBlockProbe;
};

const RevisionHarness: React.FC<{
  content: string;
  streaming: boolean;
  codeBlockComponent: React.ComponentType<RendererBlockProps>;
  contentRevisionSource?: string;
}> = ({
  content,
  streaming,
  codeBlockComponent,
  contentRevisionSource,
}) => {
  const reactNode = useMarkdownToReact(content, {
    streaming,
    contentRevisionSource,
    components: {
      __codeBlock: codeBlockComponent,
    },
  });

  return <div data-testid="hook-output">{reactNode}</div>;
};

describe('useMarkdownToReact contentRevisionSource', () => {
  it('可解析串从占位跳变时，单调修订源仍只挂载一次代码块', () => {
    const counters: Counters = { mounts: 0, unmounts: 0 };
    const CodeBlockProbe = createCodeBlockProbe(counters);

    const chartBlock =
      '```chart\n{"config":[{"chartType":"line"}],"dataSource":[]}\n```';

    const revisionBase = 'stream-chunk-';
    const rev1 = `${revisionBase}1`;
    const rev2 = `${revisionBase}1${chartBlock}`;

    const { rerender, unmount } = render(
      <RevisionHarness
        content="..."
        streaming
        codeBlockComponent={CodeBlockProbe}
        contentRevisionSource={rev1}
      />,
    );

    expect(counters.mounts).toBe(0);

    rerender(
      <RevisionHarness
        content={chartBlock}
        streaming
        codeBlockComponent={CodeBlockProbe}
        contentRevisionSource={rev2}
      />,
    );

    expect(screen.getByTestId('revision-code-block-probe')).toBeInTheDocument();
    expect(counters.mounts).toBe(1);
    expect(counters.unmounts).toBe(0);

    unmount();
    expect(counters.unmounts).toBe(1);
  });
});
