/**
 * Midtail batch L（exclusive later）：miss≥2 轻量 UI / hook，避开 H/I/J 与 deepen 饱和面。
 * Timers: shouldAdvanceTime + clearAllTimers。
 */
import '@testing-library/jest-dom';
import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
} from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SuggestionList } from '../Components/SuggestionList';
import { TextAnimate } from '../Components/TextAnimate';
import { TextSwap } from '../Components/TextSwap';
import { TypingAnimation } from '../Components/TypingAnimation';
import { VisualList } from '../Components/VisualList';
import EffectPlayer from '../Components/effects/EffectPlayer';
import { GroupMenu } from '../History/menu';
import { useElementSize } from '../Hooks/useElementSize';
import { useSpeechSynthesis } from '../Hooks/useSpeechSynthesis';
import { AttachmentFileList } from '../MarkdownInputField/AttachmentButton/AttachmentFileList';
import { FileMapViewItem } from '../MarkdownInputField/FileMapView/FileMapViewItem';
import { SkillModeBar } from '../MarkdownInputField/SkillModeBar';
import { MarkdownBlockPiece } from '../MarkdownRenderer/streaming/MarkdownBlockPiece';
import { useProgressiveBlocks } from '../MarkdownRenderer/streaming/useProgressiveBlocks';
import { TaskList } from '../TaskList/TaskList';
import { FileItem } from '../Workspace/File/components/FileItem';
import { PlaceholderContent } from '../Workspace/File/preview/components/PlaceholderContent';
import { UnsupportedFileCard } from '../Workspace/File/preview/components/UnsupportedFileCard';

vi.mock('../History/style', () => ({
  useStyle: () => ({ wrapSSR: (n: any) => n, hashId: 'm' }),
}));

vi.mock('../Components/TextAnimate/style', () => ({
  useTextAnimateStyle: () => ({ hashId: 'h' }),
}));

vi.mock('../Components/TypingAnimation/style', () => ({
  useTypingAnimationStyle: () => ({ hashId: 'h' }),
}));

vi.mock('../Components/TextSwap/style', () => ({
  useTextSwapStyle: () => ({ hashId: 'h' }),
}));

vi.mock('../Components/VisualList/style', () => ({
  useStyle: () => ({ hashId: 'h' }),
}));

vi.mock('../Components/SuggestionList/style', () => ({
  useStyle: () => ({ hashId: 'h' }),
}));

vi.mock('../TaskList/style', () => ({
  useStyle: () => ({ hashId: 'h' }),
}));

vi.mock('../MarkdownInputField/AttachmentButton/AttachmentFileList/style', () => ({
  useStyle: () => ({ hashId: 'h' }),
}));

vi.mock('../MarkdownRenderer/markdownReactShared', async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    renderMarkdownBlock: (src: string) => (
      <div data-testid="md-block">{src}</div>
    ),
  };
});

vi.mock('../Components/ActionIconBox', () => ({
  ActionIconBox: ({ children, onClick, title }: any) => (
    <button type="button" onClick={onClick} title={title || 'a'}>
      {typeof children === 'function' ? children(false) : children}
    </button>
  ),
}));

vi.mock(
  '../MarkdownInputField/AttachmentButton/AttachmentFileList/AttachmentFileIcon',
  () => ({
    AttachmentFileIcon: () => <div data-testid="file-icon" />,
    FileMetaPlaceholder: ({ file }: { file: { name?: string } }) => (
      <div data-testid="meta-placeholder">{file?.name}</div>
    ),
  }),
);

const effectPlayer = vi.hoisted(() => ({
  loadScene: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
  resize: vi.fn(),
  dispose: vi.fn(),
  onError: undefined as undefined | (() => void),
}));

vi.mock('@galacean/effects', () => ({
  Player: vi.fn((options: any) => {
    effectPlayer.onError = options.onError;
    return effectPlayer;
  }),
}));

const wrap = (ui: React.ReactElement) =>
  render(<ConfigProvider>{ui}</ConfigProvider>);

const FILE_PREFIX = 'ant-workspace-file';
const PREVIEW_PREFIX = 'ant-workspace-file-preview';

describe('midtail batch L UI branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('PlaceholderContent：prefix / fileInfo / download / 仅 children', () => {
    const onDownload = vi.fn();
    wrap(
      <PlaceholderContent prefixCls="custom" hashId="h">
        waiting
      </PlaceholderContent>,
    );
    expect(
      screen.getByText('waiting').closest('.custom-placeholder'),
    ).toBeTruthy();

    wrap(
      <PlaceholderContent
        showFileInfo
        file={{ name: 'report.pdf', size: '1KB' } as any}
        locale={{
          'workspace.file.fileName': 'Name: ',
          'workspace.file.fileSize': 'Size: ',
          'workspace.file.clickToDownload': 'Get',
          'workspace.file.download': 'DL',
        }}
        onDownload={onDownload}
      />,
    );
    expect(screen.getByText(/Name: report.pdf/)).toBeInTheDocument();
    expect(screen.getByText(/Size: 1KB/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'DL' }));
    expect(onDownload).toHaveBeenCalled();

    wrap(
      <PlaceholderContent>
        <span>only-child</span>
      </PlaceholderContent>,
    );
    expect(screen.getByText('only-child')).toBeTruthy();
  });

  it('UnsupportedFileCard：有下载 + locale；无 size/mtime', () => {
    const onDownload = vi.fn();
    wrap(
      <UnsupportedFileCard
        file={
          {
            id: '1',
            name: 'a.bin',
            size: 10,
            lastModified: '2024-01-01',
          } as any
        }
        canDownload
        onDownload={onDownload}
        filePrefixCls={FILE_PREFIX}
        prefixCls={PREVIEW_PREFIX}
        hashId="h"
        locale={{
          'workspace.file.download': 'Get it',
          'workspace.file.unsupportedWithDownload': 'No preview, download.',
        }}
      />,
    );
    expect(screen.getByText('a.bin')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Get it' }));
    expect(onDownload).toHaveBeenCalled();

    wrap(
      <UnsupportedFileCard
        file={{ id: '2', name: 'b.bin' } as any}
        canDownload={false}
        filePrefixCls={FILE_PREFIX}
        prefixCls={PREVIEW_PREFIX}
        hashId="h"
      />,
    );
    expect(screen.getByText('b.bin')).toBeInTheDocument();
  });

  it('FileItem：tree layout 渲染文件名', () => {
    wrap(
      <FileItem
        file={{ id: 'f', name: 'x.txt', url: 'https://x' } as any}
        prefixCls={FILE_PREFIX}
        hashId="h"
        layout="tree"
      />,
    );
    expect(screen.getByText('x.txt')).toBeInTheDocument();
  });

  it('GroupMenu：选中项 + 点击触发 onSelect', () => {
    const onSelect = vi.fn();
    wrap(
      <GroupMenu
        selectedKeys={['a']}
        onSelect={onSelect}
        items={[
          { key: 'a', label: 'Alpha', icon: <span>I</span> },
          { key: 'b', label: 'Beta' },
        ]}
        classNames={{
          menuItemClassName: 'mi',
          menuItemActiveClassName: 'mia',
        }}
      />,
    );
    fireEvent.click(screen.getByText('Beta'));
    expect(onSelect).toHaveBeenCalledWith({ key: 'b' });
  });

  it('SkillModeBar：rightContent 非数组；closable false', () => {
    wrap(
      <SkillModeBar
        skillMode={{
          open: true,
          title: 'T',
          rightContent: <span>solo</span>,
          closable: false,
        }}
      />,
    );
    expect(screen.getByText('solo')).toBeInTheDocument();
    expect(screen.queryByTestId('skill-mode-close')).toBeNull();
  });

  it('AttachmentFileList：空 map 隐藏高度；有 uuid/name；uploading 无清空', () => {
    const onDelete = vi.fn();
    const { container } = wrap(
      <AttachmentFileList fileMap={new Map()} onDelete={onDelete} />,
    );
    expect(
      container.querySelector('.ant-agentic-md-editor-attachment-list-container-empty') ||
        container.querySelector('[class*="container-empty"]'),
    ).toBeTruthy();

    wrap(
      <AttachmentFileList
        fileMap={
          new Map([
            [
              '1',
              {
                uuid: 'u1',
                name: 'a.png',
                status: 'uploading',
                type: 'image/png',
              } as any,
            ],
            [
              '2',
              { name: 'b.txt', status: 'done', type: 'text/plain' } as any,
            ],
          ])
        }
        onDelete={onDelete}
      />,
    );
    expect(screen.getByText('a')).toBeInTheDocument();
    expect(screen.getByText(/Uploading/i)).toBeInTheDocument();
  });

  it('FileMapViewItem：无扩展名；size=0', () => {
    wrap(
      <FileMapViewItem
        file={
          {
            name: 'README',
            size: 0,
            status: 'done',
            type: 'text/plain',
          } as any
        }
      />,
    );
    expect(screen.getByText('README')).toBeInTheDocument();
  });

  it('TextSwap / TextAnimate / TypingAnimation / VisualList / SuggestionList', () => {
    wrap(
      <TextSwap swapKey="k1" durationMs={50}>
        A
      </TextSwap>,
    );
    expect(screen.getByText('A')).toBeInTheDocument();

    wrap(
      <TextAnimate animation="fadeIn" by="character" startOnView={false}>
        Hi
      </TextAnimate>,
    );
    expect(document.body.textContent).toContain('H');

    wrap(
      <TypingAnimation
        words={['abc']}
        typeSpeed={1}
        delay={1}
        loop={false}
        showCursor={false}
        startOnView={false}
      />,
    );
    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(document.body.textContent).toMatch(/a|b|c/);

    wrap(
      <VisualList
        data={[
          { id: '1', src: 'https://img/a.png', title: 'A' },
          { id: '2', src: '', title: 'B' },
        ]}
      />,
    );
    expect(screen.getByTitle('A')).toBeInTheDocument();

    const onItemClick = vi.fn();
    wrap(
      <SuggestionList
        items={[{ key: 's1', text: 'Sug' }]}
        onItemClick={onItemClick}
        type="transparent"
        layout="horizontal"
      />,
    );
    fireEvent.click(screen.getByText('Sug'));
    expect(onItemClick).toHaveBeenCalled();
  });

  it('EffectPlayer：autoplay false + error 降级', () => {
    effectPlayer.loadScene.mockClear();
    effectPlayer.pause.mockClear();
    wrap(
      <EffectPlayer
        sceneUrl={'scene' as any}
        autoplay={false}
        size={24}
        downgradeImage="/fb.png"
      />,
    );
    expect(effectPlayer.pause).toHaveBeenCalled();
    act(() => {
      effectPlayer.onError?.();
    });
    expect(screen.getByAltText('fallback')).toHaveAttribute('src', '/fb.png');
  });

  it('TaskList：simple / empty / controlled expanded', () => {
    wrap(
      <TaskList
        items={[]}
        variant="simple"
        open={false}
        onOpenChange={vi.fn()}
      />,
    );
    wrap(
      <TaskList
        items={[
          {
            key: 't1',
            title: 'Task1',
            status: 'success',
            content: 'done',
          },
        ]}
        expandedKeys={['t1']}
        onExpandedKeysChange={vi.fn()}
        showProgress
      />,
    );
    expect(screen.getByText('Task1')).toBeInTheDocument();
  });

  it('MarkdownBlockPiece：sealed cache / tail streaming', () => {
    const processor = {} as any;
    const comps = {};
    const { rerender } = wrap(
      <MarkdownBlockPiece
        variant="sealed"
        blockSource="hello"
        processor={processor}
        components={comps}
        streaming={false}
      />,
    );
    expect(screen.getByTestId('md-block')).toHaveTextContent('hello');
    rerender(
      <ConfigProvider>
        <MarkdownBlockPiece
          variant="sealed"
          blockSource="hello"
          processor={processor}
          components={comps}
          streaming={false}
        />
      </ConfigProvider>,
    );

    wrap(
      <MarkdownBlockPiece
        variant="tail"
        blockSource="tail-a"
        processor={processor}
        components={comps}
        streaming={false}
      />,
    );
    wrap(
      <MarkdownBlockPiece
        variant="tail"
        blockSource="tail-b"
        processor={processor}
        components={comps}
        streaming
      />,
    );
    expect(screen.getAllByTestId('md-block').length).toBeGreaterThanOrEqual(2);
  });

  it('useProgressiveBlocks：streaming / 隐藏拉满 / 重置', () => {
    const { result, rerender } = renderHook(
      ({ total, streaming }) => useProgressiveBlocks(total, streaming),
      { initialProps: { total: 12, streaming: false } },
    );
    expect(result.current).toBe(12);
    act(() => {
      rerender({ total: 30, streaming: true });
    });
    expect(result.current).toBe(30);

    Object.defineProperty(document, 'hidden', {
      configurable: true,
      get: () => true,
    });
    const rafCbs: FrameRequestCallback[] = [];
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      rafCbs.push(cb);
      return rafCbs.length;
    });
    vi.stubGlobal('cancelAnimationFrame', vi.fn());

    const { result: r2, rerender: rr2, unmount } = renderHook(
      ({ total, streaming, gen }) =>
        useProgressiveBlocks(total, streaming, gen),
      { initialProps: { total: 40, streaming: false, gen: 1 } },
    );
    expect(r2.current).toBe(40);

    Object.defineProperty(document, 'hidden', {
      configurable: true,
      get: () => false,
    });
    act(() => {
      rr2({ total: 40, streaming: false, gen: 2 });
    });
    expect(r2.current).toBe(8);
    act(() => {
      rafCbs[rafCbs.length - 1]?.(performance.now());
    });
    expect(r2.current).toBeGreaterThanOrEqual(8);
    unmount();
    vi.unstubAllGlobals();
  });

  it('useElementSize：挂载测量；同节点；卸载归零', () => {
    const el = document.createElement('div');
    el.getBoundingClientRect = () =>
      ({
        width: 40,
        height: 20,
        top: 0,
        left: 0,
        bottom: 20,
        right: 40,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }) as DOMRect;

    const { result } = renderHook(() => useElementSize());
    act(() => {
      result.current.ref(el);
    });
    expect(result.current.size.width).toBe(40);
    act(() => {
      result.current.ref(el);
    });
    act(() => {
      result.current.ref(null);
    });
    expect(result.current.size).toEqual({ width: 0, height: 0 });
  });

  it('useSpeechSynthesis：空 text；voices 超时；onend', () => {
    const utterHandlers: {
      onend: null | (() => void);
      onerror: null | (() => void);
    } = { onend: null, onerror: null };
    const speak = vi.fn((u: SpeechSynthesisUtterance) => {
      utterHandlers.onend = u.onend as any;
      utterHandlers.onerror = u.onerror as any;
    });
    const cancel = vi.fn();
    const getVoices = vi.fn(() => []);
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      writable: true,
      value: {
        speak,
        cancel,
        pause: vi.fn(),
        resume: vi.fn(),
        getVoices,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      },
    });
    (global as any).SpeechSynthesisUtterance = function (
      this: any,
      text: string,
    ) {
      this.text = text;
      this.rate = 1;
      this.lang = '';
      this.voice = null;
      this.onend = null;
      this.onerror = null;
    };

    const { result } = renderHook(() =>
      useSpeechSynthesis({ text: '', voiceURI: 'x' }),
    );
    act(() => {
      result.current.start();
    });
    expect(speak).not.toHaveBeenCalled();

    const { result: r2 } = renderHook(() =>
      useSpeechSynthesis({ text: 'hi', voiceURI: 'uri-x', lang: 'en-US' }),
    );
    act(() => {
      r2.current.start();
    });
    act(() => {
      vi.advanceTimersByTime(1600);
    });
    expect(speak).toHaveBeenCalled();
    act(() => {
      utterHandlers.onend?.();
    });
    expect(r2.current.isPlaying).toBe(false);
  });
});
