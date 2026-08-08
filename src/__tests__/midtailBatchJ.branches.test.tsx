/**
 * Midtail batch J（exclusive #7）：HtmlPreview / ToolUseBar / BubbleExtra / Suggestion / SendButton。
 */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BubbleExtra } from '../Bubble/MessagesContent/BubbleExtra';
import { ContentFilemapView } from '../Bubble/ContentFilemapView';
import { Suggestion } from '../MarkdownInputField/Suggestion';
import { resolveSendDisabled } from '../MarkdownInputField/SendButton';
import {
  getSendButtonPalette,
  resolveSendButtonDisplayColors,
} from '../MarkdownInputField/SendButton/sendButtonPalette';
import { ToolUseBar } from '../ToolUseBar';
import {
  ToolContent,
  ToolHeaderRight,
  ToolImage,
} from '../ToolUseBar/BarItem/Content';
import { ToolUseBarThink } from '../ToolUseBarThink';
import { HtmlPreview } from '../Workspace/HtmlPreview';

vi.mock('../MarkdownEditor', () => ({
  MarkdownEditor: (props: any) => (
    <div data-testid="md-editor">{props.initValue}</div>
  ),
}));

vi.mock('../MarkdownInputField/FileMapView', () => ({
  FileMapView: (props: any) => {
    (globalThis as any).__lastFmv = props;
    return <div data-testid="file-view-list" />;
  },
}));

vi.mock('../Components/ActionIconBox', () => ({
  ActionIconBox: ({ children, onClick, title, ...props }: any) => (
    <button type="button" onClick={onClick} title={title} {...props}>
      {typeof children === 'function' ? children(false) : children}
    </button>
  ),
}));

class ResizeObserverMock {
  observe = vi.fn();
  disconnect = vi.fn();
}
vi.stubGlobal('ResizeObserver', ResizeObserverMock);

const wrap = (ui: React.ReactElement) =>
  render(<ConfigProvider>{ui}</ConfigProvider>);

describe('midtail batch J component branches', () => {
  afterEach(() => {
    vi.clearAllTimers();
  });

  it('HtmlPreview：generating→loading；error/empty；code 受控；showSegmented false', () => {
    wrap(
      <HtmlPreview
        html="<p>x</p>"
        status="generating"
        loadingRender={() => <span>wait-fn</span>}
      />,
    );
    expect(screen.getByText('wait-fn')).toBeInTheDocument();

    wrap(
      <HtmlPreview
        html="<p>x</p>"
        status="error"
        errorRender={<span>err-node</span>}
      />,
    );
    expect(screen.getByText('err-node')).toBeInTheDocument();

    wrap(
      <HtmlPreview
        html="   "
        status="done"
        emptyRender={() => <span>empty-fn</span>}
      />,
    );
    expect(screen.getByText('empty-fn')).toBeInTheDocument();

    wrap(
      <HtmlPreview
        html="<b>hi</b>"
        status="done"
        viewMode="code"
        labels={{ preview: 'Prev', code: 'Src' }}
      />,
    );
    expect(screen.getByTestId('md-editor').textContent).toContain('```html');

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
  });

  it('ToolUseBar / Content / Think：空 tools、loading、light、无 content', () => {
    wrap(<ToolUseBar tools={undefined as any} />);
    wrap(<ToolUseBar tools={[]} testId="tub-empty" />);

    wrap(
      <ToolImage
        tool={
          {
            id: '1',
            toolName: 'n',
            status: 'loading',
            icon: <span data-testid="ico">ICO</span>,
          } as any
        }
        prefixCls="tool"
        hashId="h"
      />,
    );
    expect(screen.getByTestId('ico')).toBeInTheDocument();

    wrap(
      <ToolHeaderRight
        tool={
          {
            id: '1',
            toolName: 'n',
            toolTarget: 'tgt',
            time: '1s',
            status: 'loading',
          } as any
        }
        prefixCls="tool"
        hashId="h"
        light
        disableAnimation
      />,
    );
    expect(screen.getByText('n')).toBeInTheDocument();

    wrap(
      <ToolContent
        tool={
          {
            id: '2',
            toolName: 'c',
            status: 'error',
            errorMessage: 'boom',
            content: 'body',
          } as any
        }
        prefixCls="tool"
        hashId="h"
        light
        showContent
        expanded
        disableAnimation
      />,
    );
    expect(screen.getByText('boom')).toBeInTheDocument();

    vi.useFakeTimers({ shouldAdvanceTime: true });
    wrap(
      <ToolUseBarThink
        toolName="think"
        thinkContent="c"
        status="loading"
        light
        defaultExpanded
        defaultFloatingExpanded
      />,
    );
    expect(screen.getByText('think')).toBeInTheDocument();
    vi.clearAllTimers();
  });

  it('BubbleExtra like 门控；ContentFilemap uuid/name；Suggestion items 函数', async () => {
    const onLike = vi.fn();
    const onDislike = vi.fn();
    wrap(
      <BubbleExtra
        bubble={
          {
            originData: {
              content: 'ans',
              isFinished: true,
              feedback: 'thumbsUp',
            },
          } as any
        }
        readonly={false}
        onLike={onLike}
        onDislike={onDislike}
      />,
    );
    expect(document.body.querySelector('.ant-chat-item-extra')).toBeTruthy();

    wrap(
      <BubbleExtra
        bubble={
          {
            originData: {
              content: 'ans',
              isFinished: true,
              extra: { answerStatus: 'done' },
            },
          } as any
        }
        onLike={onLike}
      />,
    );

    const body = JSON.stringify({
      fileList: [{ name: 'only-name.png', url: 'https://x/a.png' }],
    });
    wrap(
      <ContentFilemapView
        blocks={[{ raw: body, body } as any]}
        placement="right"
        fileViewEvents={() => ({})}
      />,
    );
    expect(screen.getByTestId('file-view-list')).toBeInTheDocument();

    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    wrap(
      <ContentFilemapView
        blocks={[{ raw: body, body } as any]}
        fileViewEvents={() => {
          throw new Error('evt');
        }}
      />,
    );
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();

    const itemsFn = vi.fn(async () => [
      { key: 'k1', label: 'Item1' },
    ]);
    wrap(
      <Suggestion tagInputProps={{ items: itemsFn, onSelect: vi.fn() } as any}>
        <button type="button">trigger</button>
      </Suggestion>,
    );
    expect(screen.getByText('trigger')).toBeInTheDocument();
  });

  it('SendButton resolve + palette rgba/invalid bg', () => {
    expect(resolveSendDisabled(undefined, 'uploading')).toBe(true);
    expect(resolveSendDisabled({ disabled: false }, 'uploading')).toBe(false);
    expect(resolveSendDisabled({ disabled: true }, 'done')).toBe(true);

    const token = {
      colorPrimary: '#1677ff',
      colorBgContainer: 'not-a-color',
      colorTextLightSolid: '#fff',
      colorTextTertiary: 'rgba(0,0,0,0.45)',
      colorFillTertiary: 'rgba(0,0,0,0.04)',
    };
    const p = getSendButtonPalette(token as any);
    expect(p.backgroundActive).toBe('#1677ff');

    const ok = getSendButtonPalette({
      colorPrimary: '#1677ff',
      colorBgContainer: '#ffffff',
      colorTextLightSolid: '#ffffff',
      colorTextTertiary: 'rgba(0,0,0,0.45)',
      colorFillTertiary: '#00000080',
    });
    const resolved = resolveSendButtonDisplayColors(
      ok,
      { background: '#1677ff', icon: '#fff' },
      {
        colorPrimary: '#1677ff',
        colorBgContainer: '#ffffff',
        colorTextLightSolid: '#ffffff',
        colorTextTertiary: 'rgba(0,0,0,0.45)',
        colorFillTertiary: 'rgba(0,0,0,0.04)',
      },
    );
    expect(resolved.backgroundActive).toBe('#1677ff');
    expect(resolved.iconActive).toBe('#fff');
  });
});
