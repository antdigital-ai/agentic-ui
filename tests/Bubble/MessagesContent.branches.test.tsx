/**
 * BubbleMessageDisplay 分支覆盖补充测试
 *
 * 覆盖 fncProps.render 回调（reference_url_info_list 查找、funRender 回退、
 * !item / !origin_text 守卫、Popover 渲染、onOriginUrlClick / window.open）
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BubbleConfigContext } from '../../src/Bubble/BubbleConfigProvide';
import { BubbleMessageDisplay } from '../../src/Bubble/MessagesContent';

/* ---------- 关键 mock：MarkdownPreview 会调用 fncProps.render ---------- */
vi.mock('../../src/Bubble/MessagesContent/MarkdownPreview', () => ({
  MarkdownPreview: ({
    content,
    extra,
    fncProps,
  }: any) => {
    // 将 fncProps.render 的结果渲染出来以触发回调
    let renderedFnc: React.ReactNode = null;
    if (fncProps?.render) {
      // 模拟多个 footnote 调用以测试不同分支
      renderedFnc = (
        <>
          {/* 匹配 [1] 占位符 */}
          <span data-testid="fnc-result-1">
            {fncProps.render(
              { children: '1', identifier: '1' },
              <span>default child 1</span>,
            )}
          </span>
          {/* 匹配 [^2] 占位符 */}
          <span data-testid="fnc-result-2">
            {fncProps.render(
              { children: '2', identifier: '2' },
              <span>default child 2</span>,
            )}
          </span>
          {/* 无匹配 → !item 守卫 */}
          <span data-testid="fnc-result-none">
            {fncProps.render(
              { children: 'no-match', identifier: 'no-match' },
              <span>default child none</span>,
            )}
          </span>
          {/* 匹配但无 origin_text → !origin_text 守卫 */}
          <span data-testid="fnc-result-no-text">
            {fncProps.render(
              { children: '3', identifier: '3' },
              <span>default child 3</span>,
            )}
          </span>
        </>
      );
    }
    // 设置 nodeList（用于 funRender 回退）
    React.useEffect(() => {
      fncProps?.onFootnoteDefinitionChange?.([
        {
          id: 'fn1',
          placeholder: 'fn-placeholder',
          origin_text: 'from nodeList',
          url: 'http://nodelist.com',
          origin_url: 'http://nodelist-origin.com',
        },
      ]);
    }, []);
    return (
      <div data-testid="markdown-preview">
        <div data-testid="content">{content}</div>
        {extra && <div data-testid="extra">{extra}</div>}
        {renderedFnc && <div data-testid="fnc-renders">{renderedFnc}</div>}
      </div>
    );
  },
}));

vi.mock('../../src/Bubble/MessagesContent/BubbleExtra', () => ({
  BubbleExtra: ({ onRenderExtraNull }: any) => (
    <div data-testid="bubble-extra">
      <button
        data-testid="extra-null-btn"
        onClick={() => onRenderExtraNull?.(true)}
      >
        Set Extra Null
      </button>
    </div>
  ),
}));

vi.mock('../../src/Bubble/MessagesContent/DocInfo', () => ({
  DocInfoList: () => <div data-testid="doc-info-list">Doc Info</div>,
}));

vi.mock('../../src/Bubble/MessagesContent/EXCEPTION', () => ({
  EXCEPTION: ({ extra }: any) => (
    <div data-testid="exception">
      {extra && <div data-testid="exception-extra">{extra}</div>}
    </div>
  ),
}));

// Mock index (MarkdownEditor + useRefFunction)
vi.mock('../../src/index', () => ({
  MarkdownEditor: ({ initValue }: any) => (
    <div data-testid="markdown-editor">{initValue}</div>
  ),
  useRefFunction: (fn: any) => fn,
}));

// Mock Antd
vi.mock('antd', async (importOriginal) => {
  const actual = await importOriginal<typeof import('antd')>();
  return {
    ...actual,
    Popover: ({ children, content, title }: any) => (
      <div data-testid="popover">
        {title && <div data-testid="popover-title">{title}</div>}
        {children}
        {content && <div data-testid="popover-content">{content}</div>}
      </div>
    ),
    Tooltip: ({ children, title }: any) => (
      <div data-testid="tooltip" title={typeof title === 'string' ? title : undefined}>
        {typeof title !== 'string' && <div data-testid="tooltip-title">{title}</div>}
        {children}
      </div>
    ),
    Typography: {
      Text: ({ children, copyable }: any) => (
        <span data-testid="typography-text">{children}</span>
      ),
    },
    ConfigProvider: {
      ...actual.ConfigProvider,
      ConfigContext: React.createContext({
        getPrefixCls: (prefix?: string) => prefix || 'ant',
      }),
    },
  };
});

// Mock Icons
vi.mock('@ant-design/icons', () => ({
  ExportOutlined: () => <span data-testid="export-icon">Export</span>,
}));

// Mock Components/ActionIconBox
vi.mock('../../src/Components/ActionIconBox', () => ({
  ActionIconBox: ({ children, onClick, title }: any) => (
    <button data-testid="action-icon-box" onClick={onClick} title={title}>
      {children}
    </button>
  ),
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

// Mock copy-to-clipboard
vi.mock('copy-to-clipboard', () => ({ default: vi.fn() }));

// Mock style
vi.mock('../../src/Bubble/MessagesContent/style', () => ({
  useMessagesContentStyle: () => ({
    hashId: 'test-hash',
    wrapSSR: (node: any) => node,
  }),
}));

describe('BubbleMessageDisplay fncProps.render 分支覆盖', () => {
  const baseContext = {
    standalone: false,
    compact: false,
    thoughtChain: { alwaysRender: false },
    thoughtChainList: {},
  };

  const baseOriginData = {
    id: 'msg-1',
    role: 'assistant' as const,
    content: 'Hello',
    createAt: Date.now(),
    updateAt: Date.now(),
    isFinished: true,
    extra: {
      reference_url_info_list: [
        {
          placeholder: '[1]',
          docId: 'doc-1',
          origin_text: 'Reference text 1',
          origin_url: 'http://example.com/1',
          url: 'http://example.com/1',
          doc_name: 'Doc One',
        },
        {
          placeholder: '[^2]',
          docId: 'doc-2',
          origin_text: 'Reference text 2',
          origin_url: '',
          url: '',
        },
        {
          placeholder: '[3]',
          docId: 'doc-3',
          origin_text: '', // 空 origin_text
          origin_url: '',
          url: '',
        },
      ],
    },
  };

  const renderComp = (overrides: any = {}, ctx: any = baseContext) => {
    const props = {
      content: 'Hello',
      bubbleRef: { current: { setMessageItem: vi.fn() } },
      readonly: false,
      placement: 'left' as const,
      originData: baseOriginData,
      ...overrides,
    };
    return render(
      <BubbleConfigContext.Provider value={ctx as any}>
        <BubbleMessageDisplay {...props} />
      </BubbleConfigContext.Provider>,
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fncProps.render 匹配 [n] 占位符并渲染 Popover', () => {
    renderComp();

    // [1] 匹配 → 有 origin_text → 渲染 Popover
    expect(screen.getAllByTestId('popover').length).toBeGreaterThan(0);
    // 应该渲染 MarkdownEditor 内容
    expect(screen.getAllByTestId('markdown-editor').length).toBeGreaterThan(0);
  });

  it('fncProps.render 无匹配时返回 undefined (!item 守卫)', () => {
    renderComp();

    // fnc-result-none 内不应有 popover
    const noneResult = screen.getByTestId('fnc-result-none');
    expect(noneResult.querySelector('[data-testid="popover"]')).toBeNull();
  });

  it('fncProps.render 匹配但 origin_text 为空时返回 null', () => {
    renderComp();

    // fnc-result-no-text 内不应有 popover（origin_text 为空字符串）
    const noTextResult = screen.getByTestId('fnc-result-no-text');
    expect(noTextResult.querySelector('[data-testid="popover"]')).toBeNull();
  });

  it('有 origin_url 时渲染 ActionIconBox，无 origin_url 时不渲染', () => {
    renderComp();

    // [1] 有 origin_url → 应有 ActionIconBox
    const result1 = screen.getByTestId('fnc-result-1');
    expect(result1.querySelector('[data-testid="action-icon-box"]')).toBeTruthy();

    // [^2] 无 origin_url → 不应有 ActionIconBox
    const result2 = screen.getByTestId('fnc-result-2');
    expect(
      result2.querySelector('[data-testid="action-icon-box"]'),
    ).toBeNull();
  });

  it('点击 ActionIconBox 调用 onOriginUrlClick 时走自定义回调', () => {
    const onOriginUrlClick = vi.fn();

    renderComp({
      markdownRenderConfig: {
        fncProps: { onOriginUrlClick },
      },
    });

    const result1 = screen.getByTestId('fnc-result-1');
    const iconBox = result1.querySelector(
      '[data-testid="action-icon-box"]',
    ) as HTMLElement;
    expect(iconBox).toBeTruthy();

    fireEvent.click(iconBox);

    expect(onOriginUrlClick).toHaveBeenCalledWith('http://example.com/1');
  });

  it('点击 ActionIconBox 无 onOriginUrlClick 时调用 window.open', () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

    renderComp();

    const result1 = screen.getByTestId('fnc-result-1');
    const iconBox = result1.querySelector(
      '[data-testid="action-icon-box"]',
    ) as HTMLElement;
    expect(iconBox).toBeTruthy();

    fireEvent.click(iconBox);

    expect(openSpy).toHaveBeenCalledWith('http://example.com/1');
    openSpy.mockRestore();
  });

  it('有 docId 和 doc_name 时渲染文档标签', () => {
    renderComp();

    // [1] 有 docId + doc_name → 应渲染 doc tag
    expect(screen.getByText('Doc One')).toBeInTheDocument();
  });

  it('funRender 通过 nodeList 回退查找', () => {
    // 使用没有 reference_url_info_list 的数据，让 funRender 走 nodeList 回退
    const originData = {
      ...baseOriginData,
      extra: {
        reference_url_info_list: [],
      },
    };

    renderComp({ originData });

    // 所有 fnc 调用都走 funRender 路径（reference_url_info_list 为空）
    // fnc-result-none 无匹配 → !item 守卫
    const noneResult = screen.getByTestId('fnc-result-none');
    expect(noneResult.querySelector('[data-testid="popover"]')).toBeNull();
  });
});
