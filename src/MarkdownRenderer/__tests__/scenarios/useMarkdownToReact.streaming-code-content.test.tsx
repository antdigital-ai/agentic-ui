import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import type { RendererBlockProps } from '../../..';
import { useMarkdownToReact } from '../../..';

const HookHarness: React.FC<{
  content: string;
  streaming: boolean;
}> = ({ content, streaming }) => {
  const reactNode = useMarkdownToReact(content, {
    streaming,
    components: {
      __codeBlock: ({ children }: RendererBlockProps) => (
        <pre data-testid="code-body">{children}</pre>
      ),
    },
  });
  return <div>{reactNode}</div>;
};

describe('useMarkdownToReact streaming code content', () => {
  it('围栏未闭合时 code 正文应随流式增长', () => {
    const { rerender } = render(
      <HookHarness content={'```json\n{"a":1'} streaming />,
    );
    expect(screen.getByTestId('code-body').textContent).toContain('{"a":1');

    rerender(<HookHarness content={'```json\n{"a":123'} streaming />);
    expect(screen.getByTestId('code-body').textContent).toContain('{"a":123');
  });
});
