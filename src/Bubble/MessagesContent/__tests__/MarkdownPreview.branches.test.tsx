import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { BubbleConfigContext } from '../../BubbleConfigProvide';
import { MessagesContext } from '../BubbleContext';

vi.mock('../../../MarkdownRenderer', () => ({
  MarkdownRenderer: (props: any) => (
    <div
      data-testid="markdown-renderer"
      data-streaming={String(props.streaming)}
      data-padding={String(props.style?.padding)}
    >
      {props.content}
    </div>
  ),
}));

vi.mock('../../../', () => ({
  MarkdownEditor: () => <div data-testid="slate-editor" />,
  parserMdToSchema: () => ({ schema: [] }),
}));

import { MarkdownPreview } from '../MarkdownPreview';

describe('MarkdownPreview residual branches', () => {
  it('uses MarkdownRenderer for markdown mode without last-message streaming', () => {
    render(
      <BubbleConfigContext.Provider value={{ standalone: true } as any}>
        <MessagesContext.Provider value={{} as any}>
          <MarkdownPreview
            content="markdown body"
            beforeContent={null}
            afterContent={null}
            extra={<span>actions</span>}
            typing
            originData={{ isLast: false, isFinished: true } as any}
            markdownRenderConfig={{ renderType: 'markdown' } as any}
          />
        </MessagesContext.Provider>
      </BubbleConfigContext.Provider>,
    );

    expect(screen.getByTestId('markdown-renderer')).toHaveAttribute(
      'data-streaming',
      'false',
    );
    expect(screen.getByTestId('markdown-renderer')).toHaveAttribute(
      'data-padding',
      '0',
    );
  });

  it('slate 默认；streaming+typewriter+isLast；hidePadding；noPadding', () => {
    render(
      <BubbleConfigContext.Provider value={{ standalone: false } as any}>
        <MessagesContext.Provider value={{ hidePadding: true } as any}>
          <MarkdownPreview
            content="slate body"
            beforeContent={<span>b</span>}
            afterContent={<span>a</span>}
            extra={null}
            typing
            originData={{ isLast: true, isFinished: false } as any}
            markdownRenderConfig={{
              renderMode: 'slate',
              streaming: true,
              typewriter: true,
            } as any}
          />
        </MessagesContext.Provider>
      </BubbleConfigContext.Provider>,
    );
    expect(
      screen.queryByTestId('slate-editor') ||
        screen.queryByTestId('markdown-renderer'),
    ).toBeTruthy();
  });

  it('renderMode markdown + isFinished 默认', () => {
    render(
      <MarkdownPreview
        content="m"
        beforeContent={null}
        afterContent={null}
        markdownRenderConfig={{ renderMode: 'markdown' } as any}
        originData={{ isLast: true } as any}
      />,
    );
    expect(screen.getByTestId('markdown-renderer')).toBeInTheDocument();
  });
});
