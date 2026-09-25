/**
 * MarkdownInputField deepen：top area、enlarge 高度、maxHeight、borderRadius 兜底。
 */
import '@testing-library/jest-dom';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MarkdownInputField } from '../MarkdownInputField';

vi.mock('../BorderBeamAnimation', () => ({
  BorderBeamAnimation: () => null,
}));

vi.mock('../../MarkdownEditor', () => ({
  BaseMarkdownEditor: React.forwardRef((props: any, ref: any) => {
    const contentRef = React.useRef(props.value ?? props.initValue ?? '');
    React.useImperativeHandle(ref, () => ({
      store: {
        getMDContent: () => contentRef.current,
        setMDContent: (v: string) => {
          contentRef.current = v;
        },
        clearContent: () => {
          contentRef.current = '';
        },
        editor: { children: [] },
        inputComposition: false,
      },
    }));
    React.useEffect(() => {
      if (props.editorRef) {
        props.editorRef.current = {
          store: {
            getMDContent: () => contentRef.current,
            setMDContent: (v: string) => {
              contentRef.current = v;
            },
            clearContent: () => {
              contentRef.current = '';
            },
            editor: { children: [] },
            inputComposition: false,
          },
        };
      }
    }, [props.editorRef]);
    return (
      <textarea
        data-testid="mock-editor"
        value={contentRef.current}
        onChange={(e) => {
          contentRef.current = e.target.value;
          props.onChange?.(e.target.value);
        }}
      />
    );
  }),
}));

describe('MarkdownInputField deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.restoreAllMocks();
  });

  it('isShowTopOperatingArea 渲染 top-area', () => {
    render(
      <MarkdownInputField
        isShowTopOperatingArea
        operationBtnRender={() => <span data-testid="op">op</span>}
      />,
    );
    expect(
      screen.getByTestId('markdown-input-field-top-area'),
    ).toBeInTheDocument();
  });

  it('enlargeable 自定义 height；maxHeight number；toolsRender 圆角 0', () => {
    const { container, rerender } = render(
      <MarkdownInputField
        enlargeable={{ enable: true, height: 480 }}
        maxHeight={200}
        toolsRender={() => <div data-testid="tools">t</div>}
        borderRadius={0}
      />,
    );
    const root = screen.getByTestId('markdown-input-field');
    expect(root).toBeInTheDocument();
    expect(screen.getByTestId('tools')).toBeInTheDocument();

    const enlargeBtn = container.querySelector(
      '[data-testid="markdown-input-field-enlarge"]',
    );
    if (enlargeBtn) {
      fireEvent.click(enlargeBtn);
    }

    rerender(
      <MarkdownInputField
        enlargeable={{ enable: true }}
        maxHeight="50vh"
        borderRadius={0}
      />,
    );
    expect(screen.getByTestId('markdown-input-field')).toBeInTheDocument();
  });

  it('beforeTools 渲染；typing/disabled class', () => {
    render(
      <MarkdownInputField
        typing
        disabled
        beforeToolsRender={() => <div data-testid="before">b</div>}
      />,
    );
    expect(screen.getByTestId('before')).toBeInTheDocument();
    expect(screen.getByTestId('markdown-input-field').className).toMatch(
      /disabled|typing/,
    );
  });
});
