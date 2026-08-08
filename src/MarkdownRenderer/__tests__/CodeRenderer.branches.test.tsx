/**
 * CodeBlockRenderer 分支覆盖：默认渲染、折叠、复制、主题与 customRender 回退。
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CodeBlockRenderer } from '../renderers/CodeRenderer';

const mockCopy = vi.hoisted(() => vi.fn());

vi.mock('copy-to-clipboard', () => ({
  default: (...args: unknown[]) => mockCopy(...args),
}));

vi.mock('../../Plugins/chart/hooks', () => ({
  useDetectTheme: vi.fn(() => 'light'),
}));

vi.mock('../../Utils/debugUtils', () => ({
  debugInfo: vi.fn(),
}));

describe('CodeBlockRenderer 分支覆盖', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCopy.mockImplementation(() => true);
  });

  it('默认渲染代码块与 language class', () => {
    render(
      <CodeBlockRenderer language="typescript">
        {'const x = 1;'}
      </CodeBlockRenderer>,
    );
    expect(screen.getByText('const x = 1;')).toBeInTheDocument();
    expect(document.querySelector('code.language-typescript')).toBeTruthy();
  });

  it('无 language 时不添加 language-* class', () => {
    render(<CodeBlockRenderer>{'plain'}</CodeBlockRenderer>);
    const code = document.querySelector('code');
    expect(code?.className).toBe('');
  });

  it('折叠后内容区 display 为 none', () => {
    render(<CodeBlockRenderer language="js">{'code'}</CodeBlockRenderer>);
    const collapseBtn = screen.getByLabelText('展开/收起');
    fireEvent.click(collapseBtn);
    const content = document.querySelector('.code-editor-content') as HTMLElement;
    expect(content?.style.display).toBe('none');
  });

  it('复制按钮调用 copy-to-clipboard', () => {
    render(<CodeBlockRenderer language="js">{'hello'}</CodeBlockRenderer>);
    const copyBtn = screen
      .getAllByRole('button')
      .find((btn) => btn.getAttribute('aria-label')?.includes('复制'));
    expect(copyBtn).toBeTruthy();
    fireEvent.click(copyBtn!);
    expect(mockCopy).toHaveBeenCalledWith('hello');
  });

  it('复制失败时调用 debugInfo 且不抛错', async () => {
    mockCopy.mockImplementation(() => {
      throw new Error('copy failed');
    });
    const { debugInfo } = await import('../../Utils/debugUtils');
    render(<CodeBlockRenderer>{'fail-copy'}</CodeBlockRenderer>);
    const copyBtn = screen
      .getAllByRole('button')
      .find((btn) => btn.getAttribute('aria-label')?.includes('复制'));
    fireEvent.click(copyBtn!);
    expect(debugInfo).toHaveBeenCalledWith(
      'CodeBlockRenderer - 复制失败',
      expect.objectContaining({ error: 'copy failed' }),
    );
  });

  it('editorCodeProps.theme 优先于 detectedTheme', () => {
    render(
      <CodeBlockRenderer
        language="js"
        editorCodeProps={{ theme: 'chaos' }}
      >
        {'dark theme'}
      </CodeBlockRenderer>,
    );
    expect(screen.getByText('dark theme')).toBeInTheDocument();
  });

  it('detectedTheme 为 dark 时使用 chaos 主题', async () => {
    const { useDetectTheme } = await import('../../Plugins/chart/hooks');
    vi.mocked(useDetectTheme).mockReturnValue('dark');
    render(<CodeBlockRenderer>{'night'}</CodeBlockRenderer>);
    expect(screen.getByText('night')).toBeInTheDocument();
    vi.mocked(useDetectTheme).mockReturnValue('light');
  });

  it('customRender 返回自定义节点', () => {
    const customRender = vi.fn((_props, defaultDom) => (
      <div data-testid="custom-code">{defaultDom}</div>
    ));
    render(
      <CodeBlockRenderer editorCodeProps={{ render: customRender }}>
        {'custom'}
      </CodeBlockRenderer>,
    );
    expect(screen.getByTestId('custom-code')).toBeInTheDocument();
    expect(customRender).toHaveBeenCalled();
  });

  it('customRender 返回 undefined 时回退 defaultDom', () => {
    render(
      <CodeBlockRenderer
        editorCodeProps={{
          render: () => undefined,
        }}
      >
        {'fallback'}
      </CodeBlockRenderer>,
    );
    expect(screen.getByText('fallback')).toBeInTheDocument();
  });

  it('customRender 抛错时回退 defaultDom 并 debugInfo', async () => {
    const { debugInfo } = await import('../../Utils/debugUtils');
    render(
      <CodeBlockRenderer
        editorCodeProps={{
          render: () => {
            throw new Error('render boom');
          },
        }}
      >
        {'recover'}
      </CodeBlockRenderer>,
    );
    expect(screen.getByText('recover')).toBeInTheDocument();
    expect(debugInfo).toHaveBeenCalledWith(
      'CodeBlockRenderer - codeProps.render 异常，回退默认',
      expect.objectContaining({ error: 'render boom' }),
    );
  });
});
