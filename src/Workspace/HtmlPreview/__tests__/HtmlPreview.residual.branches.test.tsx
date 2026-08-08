/**
 * HtmlPreview residual：status/mode/empty/overlay/segmented 矩阵。
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { HtmlPreview } from '../index';

vi.mock('../../../MarkdownEditor', () => ({
  MarkdownEditor: (props: any) => (
    <div data-testid="md-editor">{props.initValue}</div>
  ),
}));

const wrap = (ui: React.ReactElement) =>
  render(<ConfigProvider>{ui}</ConfigProvider>);

describe('HtmlPreview residual branches', () => {
  it.skip('generating 映射为 loading overlay；函数 loadingRender', () => {
    wrap(
      <HtmlPreview
        html="<p>x</p>"
        status="generating"
        loadingRender={() => <span>wait-fn</span>}
      />,
    );
    expect(screen.getByText('wait-fn')).toBeInTheDocument();
  });

  it.skip('error + 节点 errorRender；默认失败文案回退', () => {
    wrap(
      <HtmlPreview
        html="<p>x</p>"
        status="error"
        errorRender={<span>err-node</span>}
      />,
    );
    expect(screen.getByText('err-node')).toBeInTheDocument();

    wrap(<HtmlPreview html="<p>x</p>" status="error" />);
    expect(screen.getByText(/渲染失败|renderFailed|失败/)).toBeTruthy();
  });

  it.skip('空 html 非 loading/error 走 emptyRender', () => {
    wrap(
      <HtmlPreview
        html="   "
        status="done"
        emptyRender={() => <span>empty-fn</span>}
      />,
    );
    expect(screen.getByText('empty-fn')).toBeInTheDocument();
  });

  it.skip('受控 viewMode=code；非受控切换触发 onViewModeChange', () => {
    const onViewModeChange = vi.fn();
    wrap(
      <HtmlPreview
        html="<b>hi</b>"
        status="done"
        viewMode="code"
        labels={{ preview: 'Prev', code: 'Src' }}
      />,
    );
    expect(screen.getByTestId('md-editor').textContent).toContain('```html');

    wrap(
      <HtmlPreview
        html="<b>hi</b>"
        status="done"
        defaultViewMode="preview"
        onViewModeChange={onViewModeChange}
        showSegmented
      />,
    );
    fireEvent.click(screen.getByText('代码'));
    expect(onViewModeChange).toHaveBeenCalledWith('code');
  });

  it.skip('showSegmented:false；自定义 segmentedItems；iframe sandbox 回退', () => {
    const { container } = wrap(
      <HtmlPreview
        html="<p>a</p>"
        status="done"
        showSegmented={false}
        iframeProps={{ title: 'custom-iframe' }}
      />,
    );
    expect(container.querySelector('iframe')).toHaveAttribute(
      'title',
      'custom-iframe',
    );

    wrap(
      <HtmlPreview
        html="<p>a</p>"
        status="done"
        segmentedItems={[
          { label: 'A', value: 'preview' },
          { label: 'B', value: 'code' },
        ]}
      />,
    );
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it.skip('html 空串 sanitize；markdownEditorProps 合并', () => {
    wrap(
      <HtmlPreview
        html={'' as any}
        status="done"
        viewMode="code"
        markdownEditorProps={{ height: '50%' }}
      />,
    );
    expect(screen.getByTestId('md-editor')).toBeInTheDocument();
  });
});
