/**
 * MarkdownPreview deepen residual：MessagesContext 空、chartType minWidth、
 * standalone/非 standalone、error.unexpected 默认文案。
 */
import '@testing-library/jest-dom';
import { cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../MarkdownRenderer', () => ({
  MarkdownRenderer: ({ content }: any) => (
    <div data-testid="md-renderer">{content}</div>
  ),
}));

vi.mock('../../../', () => ({
  MarkdownEditor: (props: any) => (
    <div
      data-testid="md-editor"
      data-min-width={props.style?.minWidth || ''}
      data-max-width={props.style?.maxWidth || ''}
    >
      {props.initValue}
    </div>
  ),
  parserMdToSchema: () => ({ schema: [] }),
}));

vi.mock('../../../I18n', () => ({
  useLocale: () => ({}),
}));

vi.mock('react-error-boundary', () => ({
  ErrorBoundary: ({ children }: any) => <div data-testid="eb">{children}</div>,
}));

import { BubbleConfigContext } from '../../BubbleConfigProvide';
import { MessagesContext } from '../BubbleContext';
import { MarkdownPreview } from '../MarkdownPreview';

const baseProps = {
  content: 'hello',
  beforeContent: null,
  afterContent: null,
};

describe('MarkdownPreview deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
  });

  it('MessagesContext 为空；无 chartType 无 minWidth', () => {
    render(
      <BubbleConfigContext.Provider value={{ standalone: false } as any}>
        <MarkdownPreview {...baseProps} />
      </BubbleConfigContext.Provider>,
    );
    expect(screen.getByTestId('md-editor')).toHaveAttribute('data-min-width', '');
  });

  it('chartType + standalone 走 max(clientWidth||600)-23', () => {
    const htmlRef = {
      current: { clientWidth: 0 },
    } as React.RefObject<HTMLDivElement>;
    render(
      <BubbleConfigContext.Provider value={{ standalone: true } as any}>
        <MessagesContext.Provider value={{ hidePadding: true } as any}>
          <MarkdownPreview
            {...baseProps}
            content={'<!-- {"chartType":"line"} -->\n| a |\n| - |\n| 1 |'}
            htmlRef={htmlRef}
          />
        </MessagesContext.Provider>
      </BubbleConfigContext.Provider>,
    );
    expect(screen.getByTestId('md-editor').getAttribute('data-min-width')).toContain(
      'min(',
    );
    expect(screen.getByTestId('md-editor')).toHaveAttribute('data-max-width', '100%');
  });

  it('chartType 非 standalone 走 min(clientWidth||600)-128；无 htmlRef', () => {
    render(
      <BubbleConfigContext.Provider value={{ standalone: false } as any}>
        <MessagesContext.Provider value={null as any}>
          <MarkdownPreview
            {...baseProps}
            content={'chartType: pie'}
          />
        </MessagesContext.Provider>
      </BubbleConfigContext.Provider>,
    );
    expect(screen.getByTestId('md-editor').getAttribute('data-min-width')).toContain(
      'min(',
    );
  });
});
