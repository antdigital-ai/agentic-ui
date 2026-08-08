/**
 * RealtimeFollow deepen residual：Overlay、empty、header、segmented、getEditorConfig md。
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { I18nContext } from '../../../I18n';
import {
  getContentForEditor,
  RealtimeFollow,
  RealtimeFollowList,
  shouldUpdateEditor,
} from '../index';

vi.mock('../style', () => ({
  useRealtimeFollowStyle: () => ({ hashId: 'hash-rt' }),
}));

const wrap = (ui: React.ReactElement, locale: Record<string, string> = {}) =>
  render(
    <ConfigProvider>
      <I18nContext.Provider
        value={{ locale, language: 'zh-CN' } as any}
      >
        {ui}
      </I18nContext.Provider>
    </ConfigProvider>,
  );

describe('RealtimeFollow deepen residual branches', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('getContentForEditor：html 非字符串 content 走空 html', () => {
    expect(getContentForEditor('html', { original: 'a', modified: 'b' })).toBe(
      '```html\n\n```',
    );
  });

  it('shouldUpdateEditor：default 类型返回 false', () => {
    expect(shouldUpdateEditor('default', 'preview')).toBe(false);
  });

  it('RealtimeHeader 无 onBack 时显示 icon；有 subTitle', () => {
    wrap(
      <RealtimeFollowList
        data={{
          type: 'markdown',
          content: '# title',
          status: 'done',
          subTitle: '副标题很长很长很长',
        }}
      />,
    );
    expect(screen.getByText('Markdown 内容')).toBeInTheDocument();
    expect(screen.getByText('副标题很长很长很长')).toBeInTheDocument();
  });

  it('html 非受控 segmented 默认选项切换', () => {
    const onViewModeChange = vi.fn();
    wrap(
      <RealtimeFollowList
        data={{
          type: 'html',
          content: '<p>hi</p>',
          status: 'done',
          defaultViewMode: 'preview',
          onViewModeChange,
        }}
      />,
      { 'htmlPreview.preview': '预览', 'htmlPreview.code': '代码' },
    );
    fireEvent.click(screen.getByText('代码'));
    expect(onViewModeChange).toHaveBeenCalledWith('code');
  });

  it('html segmentedExtra 与默认 segmented 并排', () => {
    wrap(
      <RealtimeFollowList
        data={{
          type: 'html',
          content: '<b>x</b>',
          status: 'done',
          segmentedExtra: <span data-testid="seg-extra">extra</span>,
        }}
      />,
    );
    expect(screen.getByTestId('seg-extra')).toBeInTheDocument();
  });

  it('shell 空内容在 test 环境仍渲染内容区', () => {
    const { container } = wrap(
      <RealtimeFollow
        data={{
          type: 'shell',
          content: '   ',
          status: 'done',
          emptyRender: () => <span data-testid="empty-fn">empty</span>,
        }}
      />,
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('customContent 非函数节点直接渲染', () => {
    wrap(
      <RealtimeFollow
        data={{
          type: 'default',
          status: 'done',
          customContent: <span data-testid="custom-node">node</span>,
        }}
      />,
    );
    expect(screen.getByTestId('custom-node')).toBeInTheDocument();
  });

  it('md 类型走 markdown 编辑器分支', () => {
    const { container } = wrap(
      <RealtimeFollow
        data={{
          type: 'md',
          content: '## md',
          status: 'done',
        }}
      />,
    );
    expect(container.textContent).toContain('md');
  });

  it('html preview 模式渲染 RealtimeFollow 内容区', () => {
    const { container } = wrap(
      <RealtimeFollow
        data={{ type: 'html', content: '<i>a</i>', status: 'done' }}
        htmlViewMode="preview"
      />,
    );
    expect(container.innerHTML.length).toBeGreaterThan(0);
  });

  it('RealtimeFollowList html 受控 viewMode 渲染 segmentedItems', () => {
    wrap(
      <RealtimeFollowList
        data={{
          type: 'html',
          content: '<p>c</p>',
          status: 'done',
          viewMode: 'code',
          segmentedItems: [
            { label: 'P', value: 'preview' },
            { label: 'C', value: 'code' },
          ],
        }}
      />,
    );
    expect(screen.getByText('P')).toBeInTheDocument();
    expect(screen.getByText('C')).toBeInTheDocument();
  });

  it('labels 自定义覆盖 locale', () => {
    wrap(
      <RealtimeFollowList
        data={{
          type: 'html',
          content: '<p>l</p>',
          status: 'done',
          labels: { preview: 'Prev', code: 'Src' },
        }}
      />,
    );
    expect(screen.getByText('Prev')).toBeInTheDocument();
    expect(screen.getByText('Src')).toBeInTheDocument();
  });

  it('typewriter 兼容 streaming 优先级', () => {
    wrap(
      <RealtimeFollow
        data={{
          type: 'markdown',
          content: 'stream',
          status: 'done',
          streaming: false,
          typewriter: true,
        }}
      />,
    );
    expect(screen.getByText('stream')).toBeInTheDocument();
  });
});
