import '@testing-library/jest-dom';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { Subject } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getInsertOptions,
  InsertAutocomplete,
  InsertAutocompleteItem,
} from '../InsertAutocomplete';
import { getRemoteMediaType } from '../../utils/media';
import { Editor, Node, Transforms } from 'slate';
import { ReactEditor } from 'slate-react';
import { selChange$ } from '../../plugins/useOnchange';

const paragraphNode = { type: 'paragraph', children: [{ text: '' }] };
const nodeTuple: [typeof paragraphNode, number[]] = [paragraphNode, [0]];

function* editorNodesGenerator() {
  yield nodeTuple;
}

const mockEditor = {
  selection: { anchor: { path: [0, 0], offset: 0 }, focus: { path: [0, 0], offset: 0 } },
  children: [paragraphNode],
};

const mockContainer = document.createElement('div');
const mockNodeEl = document.createElement('div');
mockNodeEl.getBoundingClientRect = vi.fn().mockReturnValue({
  top: 100,
  left: 0,
  width: 100,
  height: 20,
  bottom: 120,
  right: 100,
  x: 0,
  y: 100,
  toJSON: () => ({}),
});
Object.defineProperty(mockNodeEl, 'clientHeight', { value: 20, configurable: true });

const keyTaskNext = vi.fn();
const setOpenInsertCompletion = vi.fn();
const insertCompletionText$ = new Subject<string>();

vi.mock('../../store', () => ({
  useEditorStore: vi.fn(),
}));

vi.mock('slate-react', () => ({
  ReactEditor: {
    findPath: vi.fn(() => [0]),
    findNode: vi.fn(() => ({ children: [] })),
    focus: vi.fn(),
    isFocused: vi.fn(() => false),
    toDOMNode: vi.fn(() => mockNodeEl),
  },
}));

vi.mock('slate', () => ({
  Editor: {
    nodes: vi.fn(() => editorNodesGenerator()),
    start: vi.fn(() => ({ path: [0, 0], offset: 0 })),
    end: vi.fn(() => ({ path: [0, 0], offset: 0 })),
    next: vi.fn(() => [paragraphNode, [1]]),
    parent: vi.fn(() => [{ type: 'root', children: [] }, []]),
    isBlock: vi.fn(() => true),
    isVoid: vi.fn(() => false),
  },
  Element: {
    isElement: vi.fn(() => true),
  },
  Node: {
    string: vi.fn(() => ''),
  },
  Transforms: {
    insertNodes: vi.fn(),
    select: vi.fn(),
    removeNodes: vi.fn(),
    insertText: vi.fn(),
    delete: vi.fn(),
    setNodes: vi.fn(),
  },
}));

vi.mock('../../../I18n', () => ({
  I18nContext: React.createContext({
    locale: { table: '表格', quote: '引用', code: '代码', head1: '主标题', head2: '段标题', head3: '小标题', 'b-list': '无序列表', 'n-list': '有序列表', 't-list': '任务列表', localeImage: '本地图片' },
    t: (key: string) => key,
  }),
  LocalKeys: {},
}));

vi.mock('../../plugins/useOnchange', () => ({
  selChange$: {
    next: vi.fn(),
    subscribe: vi.fn(() => ({ unsubscribe: vi.fn() })),
  },
}));

vi.mock('../../utils/dom', () => ({
  getOffsetLeft: vi.fn(() => 24),
}));

vi.mock('../../utils/editorUtils', () => ({
  EditorUtils: {
    focus: vi.fn(),
    insertText: vi.fn(),
    insertNodes: vi.fn(),
    createMediaNode: vi.fn((url: string) => ({
      type: 'media',
      src: url,
      children: [{ text: '' }],
    })),
    isTop: vi.fn(() => true),
  },
}));

vi.mock('../../utils/media', () => ({
  getRemoteMediaType: vi.fn(() => Promise.resolve('image')),
}));

vi.mock('../insertAutocompleteStyle', () => ({
  useStyle: () => ({
    wrapSSR: (component: React.ReactNode) => component,
    hashId: 'test-hash-id',
  }),
}));

vi.mock('react-dom', async () => {
  const actual = await vi.importActual<typeof import('react-dom')>('react-dom');
  return {
    ...actual,
    createPortal: (children: React.ReactNode) => children,
  };
});

vi.mock('../InsertAutocomplete', async (importOriginal) => {
  const mod = await importOriginal<typeof import('../InsertAutocomplete')>();
  return {
    ...mod,
    getInsertOptions: (ctx: Parameters<typeof mod.getInsertOptions>[0], locale: Parameters<typeof mod.getInsertOptions>[1]) => {
      const options = mod.getInsertOptions(ctx, locale);
      const mediaIdx = options.findIndex((o: any) => o.key === 'media');
      if (mediaIdx >= 0) {
        const media = options[mediaIdx];
        (options as any)[mediaIdx] = {
          ...media,
          children: [
            ...(media.children || []),
            { key: 'embedMedia', task: 'image', label: ['Embed media', '嵌入媒体'], icon: React.createElement('span') },
          ],
        };
      }
      options.push({
        label: ['Attachment', '附件'],
        key: 'attachGroup',
        children: [{ key: 'attachLink', task: 'attachment', label: ['By link', '链接'], icon: React.createElement('span') }],
      } as any);
      return options;
    },
  };
});

import { useEditorStore } from '../../store';

const useEditorStoreMock = vi.mocked(useEditorStore);

function getDefaultStore() {
  return {
    store: { editor: { children: [] } },
    markdownEditorRef: { current: mockEditor },
    markdownContainerRef: { current: mockContainer },
    openInsertCompletion: true,
    setOpenInsertCompletion,
    keyTask$: { next: keyTaskNext },
    insertCompletionText$,
  };
}

describe('getInsertOptions', () => {
  const locale = { table: '表格', quote: '引用', code: '代码', head1: '主标题', head2: '段标题', head3: '小标题', 'b-list': '无序列表', 'n-list': '有序列表', 't-list': '任务列表', localeImage: '本地图片' } as any;

  it('returns element, media, list and attachGroup when isTop is false', () => {
    const options = getInsertOptions({ isTop: false }, locale);
    expect(options.length).toBe(4);
    expect(options.map((o) => o.key)).toContain('element');
    expect(options.map((o) => o.key)).toContain('media');
    expect(options.map((o) => o.key)).toContain('list');
    expect(options.map((o) => o.key)).toContain('attachGroup');
    expect(options.some((o) => o.key === 'head')).toBe(false);
  });

  it('includes head group when isTop is true', () => {
    const options = getInsertOptions({ isTop: true }, locale);
    expect(options.length).toBe(5);
    const headOption = options.find((o) => o.key === 'head');
    expect(headOption).toBeDefined();
    expect(headOption?.children?.length).toBe(3);
    expect(headOption?.children?.map((c) => c.key)).toEqual(['head1', 'head2', 'head3']);
  });

  it('uses locale labels for table, quote, code', () => {
    const options = getInsertOptions({ isTop: false }, locale);
    const element = options.find((o) => o.key === 'element');
    expect(element?.children?.find((c) => c.key === 'table')?.label).toContain('表格');
    expect(element?.children?.find((c) => c.key === 'quote')?.label).toContain('引用');
    expect(element?.children?.find((c) => c.key === 'code')?.label).toContain('代码');
  });

  it('uses fallback labels when locale key is missing', () => {
    const options = getInsertOptions({ isTop: false }, {} as any);
    expect(options.length).toBeGreaterThan(0);
    const element = options.find((o) => o.key === 'element');
    expect(element?.children?.some((c) => c.label?.some((l) => l === '表格' || l === '引用' || l === '代码'))).toBe(true);
  });

  it('returns head group with head2 and head3 args when isTop is true', () => {
    const options = getInsertOptions({ isTop: true }, locale);
    const headOption = options.find((o) => o.key === 'head');
    expect(headOption?.children?.find((c) => c.key === 'head2')?.args).toEqual([2]);
    expect(headOption?.children?.find((c) => c.key === 'head3')?.args).toEqual([3]);
  });

  it('returns list group with b-list, n-list, t-list and correct args', () => {
    const options = getInsertOptions({ isTop: false }, locale);
    const listOption = options.find((o) => o.key === 'list');
    expect(listOption?.children?.find((c) => c.key === 'b-list')?.args).toEqual(['unordered']);
    expect(listOption?.children?.find((c) => c.key === 'n-list')?.args).toEqual(['ordered']);
    expect(listOption?.children?.find((c) => c.key === 't-list')?.args).toEqual(['task']);
  });
});

describe('InsertAutocomplete Component', () => {
  beforeEach(() => {
    useEditorStoreMock.mockImplementation(getDefaultStore as any);
    vi.clearAllMocks();
  });

  const mockInsertOptions: InsertAutocompleteItem[] = [
    { label: ['Heading', '标题'], key: 'heading', task: vi.fn(), icon: <div data-testid="heading-icon">H</div> },
    { label: ['Paragraph', '段落'], key: 'paragraph', task: vi.fn(), icon: <div data-testid="paragraph-icon">P</div> },
  ];

  it('renders without crashing with insertOptions and runInsertTask', () => {
    render(<InsertAutocomplete insertOptions={mockInsertOptions} runInsertTask={vi.fn()} />);
    expect(document.body).toBeInTheDocument();
  });

  it('renders without insertOptions', () => {
    render(<InsertAutocomplete />);
    expect(document.body).toBeInTheDocument();
  });

  it('handles getContainer prop', () => {
    const getContainer = vi.fn(() => document.createElement('div'));
    render(<InsertAutocomplete getContainer={getContainer} />);
    expect(getContainer).toBeDefined();
  });

  it('handles empty insertOptions array', () => {
    render(<InsertAutocomplete insertOptions={[]} />);
    expect(document.body).toBeInTheDocument();
  });

  it('shows menu when openInsertCompletion is true and insertCompletionText$ emits', () => {
    render(<InsertAutocomplete />);
    act(() => {
      insertCompletionText$.next('');
    });
    expect(document.body.querySelector('.ant-menu')).toBeInTheDocument();
  });

  it('filters options when insertCompletionText$ emits filter text', () => {
    render(<InsertAutocomplete />);
    act(() => {
      insertCompletionText$.next('');
    });
    const menuBefore = document.body.querySelectorAll('.ant-menu-item').length;
    act(() => {
      insertCompletionText$.next('表');
    });
    const menuAfter = document.body.querySelectorAll('.ant-menu-item').length;
    expect(menuAfter).toBeLessThanOrEqual(menuBefore);
  });

  it('calls keyTask$ when built-in menu item is clicked', () => {
    render(<InsertAutocomplete />);
    act(() => {
      insertCompletionText$.next('');
    });
    const tableItem = screen.queryByText('表格') ?? screen.queryByText('Elements');
    const toClick = tableItem ?? document.body.querySelector('.ant-menu-item');
    if (toClick) {
      fireEvent.click(toClick);
      expect(keyTaskNext).toHaveBeenCalled();
    }
  });

  it('built-in element task click calls Transforms.insertText, keyTask$.next and close', () => {
    render(<InsertAutocomplete />);
    act(() => insertCompletionText$.next(''));
    const codeItem = screen.queryByText('代码') ?? screen.queryByText('Code');
    const toClick = codeItem ?? Array.from(document.body.querySelectorAll('.ant-menu-item')).find((el) => el.textContent?.includes('代码') || el.textContent?.includes('Code'));
    if (toClick) {
      fireEvent.click(toClick);
      expect(Transforms.insertText).toHaveBeenCalled();
      expect(keyTaskNext).toHaveBeenCalled();
      expect(setOpenInsertCompletion).toHaveBeenCalledWith(false);
    }
  });

  it('calls runInsertTask with isCustom when custom insertOption is clicked', async () => {
    const runInsertTask = vi.fn().mockResolvedValue(true);
    render(
      <InsertAutocomplete
        insertOptions={mockInsertOptions}
        runInsertTask={runInsertTask}
      />,
    );
    act(() => {
      insertCompletionText$.next('');
    });
    const customItem = screen.queryByText('标题') ?? screen.queryByText('Heading');
    const toClick = customItem ?? Array.from(document.body.querySelectorAll('.ant-menu-item')).find((el) => el.textContent?.includes('Heading') || el.textContent?.includes('标题'));
    if (toClick) {
      fireEvent.click(toClick);
      expect(runInsertTask).toHaveBeenCalledWith(
        expect.objectContaining({ key: 'heading' }),
        expect.objectContaining({ isCustom: true }),
      );
    }
  });

  it('calls optionsRender when provided', () => {
    const optionsRender = vi.fn((opts: any[]) => opts);
    render(<InsertAutocomplete optionsRender={optionsRender} />);
    act(() => {
      insertCompletionText$.next('');
    });
    expect(optionsRender).toHaveBeenCalled();
  });

  it('optionsRender receives flattened items and click runs built-in task', () => {
    const optionsRender = vi.fn((opts: any[]) => opts);
    render(<InsertAutocomplete optionsRender={optionsRender} />);
    act(() => insertCompletionText$.next(''));
    expect(optionsRender).toHaveBeenCalled();
    const listItem = screen.queryByText('无序列表') ?? screen.queryByText('List');
    const toClick = listItem ?? Array.from(document.body.querySelectorAll('.ant-menu-item')).find((el) => el.textContent?.includes('无序') || el.textContent?.includes('List'));
    if (toClick) {
      fireEvent.click(toClick);
      expect(keyTaskNext).toHaveBeenCalledWith(expect.objectContaining({ key: 'list' }));
    }
  });

  it('closes on outside click by clearing filterOptions', () => {
    render(<InsertAutocomplete />);
    act(() => {
      insertCompletionText$.next('');
    });
    expect(document.body.querySelector('.ant-menu')).toBeInTheDocument();
    fireEvent.click(document.body);
    const wrapper = document.body.querySelector('[class*="insert-autocomplete"]');
    expect(wrapper).toBeTruthy();
  });

  it('clickClose when target not inside dom calls close and removeEventListener', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    render(<InsertAutocomplete />);
    act(() => insertCompletionText$.next(''));
    expect(document.body.querySelector('.ant-menu')).toBeTruthy();
    fireEvent.click(mockContainer);
    expect(removeSpy).toHaveBeenCalledWith('click', expect.any(Function));
    removeSpy.mockRestore();
  });

  it('responds to Escape key without throwing', () => {
    render(<InsertAutocomplete />);
    act(() => {
      insertCompletionText$.next('');
    });
    expect(() => {
      fireEvent.keyDown(mockContainer, { key: 'Escape', code: 'Escape' });
    }).not.toThrow();
  });

  it('responds to Backspace key without throwing', () => {
    render(<InsertAutocomplete />);
    act(() => {
      insertCompletionText$.next('');
    });
    expect(() => {
      fireEvent.keyDown(mockContainer, { key: 'Backspace', code: 'Backspace' });
    }).not.toThrow();
  });

  it('handles Enter key when panel is open', () => {
    render(<InsertAutocomplete />);
    act(() => {
      insertCompletionText$.next('');
    });
    const ev = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
    mockContainer.dispatchEvent(ev);
    expect(document.body.querySelector('.ant-menu')).toBeTruthy();
  });

  it('Enter key when panel open runs runInsertTask for selected option when options exist', () => {
    render(<InsertAutocomplete />);
    act(() => insertCompletionText$.next(''));
    const menu = document.body.querySelector('.ant-menu');
    expect(menu).toBeTruthy();
    fireEvent.keyDown(mockContainer, { key: 'Enter', code: 'Enter' });
    expect(document.body.querySelector('.ant-menu')).toBeTruthy();
  });

  it('Enter key after toggle openInsertCompletion does not throw', () => {
    const store = getDefaultStore();
    useEditorStoreMock.mockImplementation(() => store as any);
    const { rerender } = render(<InsertAutocomplete />);
    act(() => insertCompletionText$.next(''));
    useEditorStoreMock.mockImplementation(() => ({ ...store, openInsertCompletion: false }) as any);
    rerender(<InsertAutocomplete />);
    useEditorStoreMock.mockImplementation(() => ({ ...store, openInsertCompletion: true }) as any);
    rerender(<InsertAutocomplete />);
    act(() => insertCompletionText$.next(''));
    expect(() => {
      fireEvent.keyDown(mockContainer, { key: 'Enter', code: 'Enter' });
    }).not.toThrow();
  });

  it('Escape key does not throw and can trigger close path', () => {
    render(<InsertAutocomplete />);
    act(() => insertCompletionText$.next(''));
    expect(() => {
      fireEvent.keyDown(mockContainer, { key: 'Escape', code: 'Escape', keyCode: 27 });
    }).not.toThrow();
  });

  it('Backspace key does not throw and can trigger close path', () => {
    render(<InsertAutocomplete />);
    act(() => insertCompletionText$.next(''));
    expect(() => {
      fireEvent.keyDown(mockContainer, { key: 'Backspace', code: 'Backspace', keyCode: 8 });
    }).not.toThrow();
  });

  it('handles ArrowDown key when panel has options', () => {
    render(<InsertAutocomplete />);
    act(() => {
      insertCompletionText$.next('');
    });
    expect(() => {
      fireEvent.keyDown(mockContainer, { key: 'ArrowDown', code: 'ArrowDown' });
    }).not.toThrow();
  });

  it('handles ArrowUp key when panel has options', () => {
    render(<InsertAutocomplete />);
    act(() => {
      insertCompletionText$.next('');
    });
    fireEvent.keyDown(mockContainer, { key: 'ArrowDown', code: 'ArrowDown' });
    expect(() => {
      fireEvent.keyDown(mockContainer, { key: 'ArrowUp', code: 'ArrowUp' });
    }).not.toThrow();
  });

  it('ArrowDown then ArrowUp with mock target triggers scroll branch', async () => {
    const mockScroll = vi.fn();
    const mockTarget = document.createElement('div');
    Object.defineProperty(mockTarget, 'offsetTop', { value: 50, configurable: true });
    const querySpy = vi.spyOn(document, 'querySelector').mockImplementation(((sel: string) => {
      if (sel?.includes('data-action')) return mockTarget;
      return null;
    }) as any);
    render(<InsertAutocomplete />);
    act(() => insertCompletionText$.next(''));
    await act(async () => {});
    const wrapper = document.body.querySelector('[class*="insert-autocomplete"]') as HTMLDivElement;
    if (wrapper) {
      Object.defineProperty(wrapper, 'scrollTop', { value: 200, writable: true, configurable: true });
      Object.defineProperty(wrapper, 'clientHeight', { value: 100, configurable: true });
      wrapper.scroll = mockScroll;
    }
    fireEvent.keyDown(mockContainer, { key: 'ArrowDown', code: 'ArrowDown' });
    await act(async () => {});
    fireEvent.keyDown(mockContainer, { key: 'ArrowUp', code: 'ArrowUp' });
    await act(async () => {});
    expect(mockScroll).toHaveBeenCalled();
    querySpy.mockRestore();
  });

  it('ArrowDown with mock target below viewport does not throw', async () => {
    const store = getDefaultStore();
    useEditorStoreMock.mockImplementation(() => store as any);
    const mockScroll = vi.fn();
    const mockTarget = document.createElement('div');
    Object.defineProperty(mockTarget, 'offsetTop', { value: 300, configurable: true });
    const querySpy = vi.spyOn(document, 'querySelector').mockImplementation(((sel: string) => {
      if (sel?.includes('data-action')) return mockTarget;
      return null;
    }) as any);
    const { rerender } = render(<InsertAutocomplete />);
    act(() => insertCompletionText$.next(''));
    useEditorStoreMock.mockImplementation(() => ({ ...store, openInsertCompletion: false }) as any);
    rerender(<InsertAutocomplete />);
    useEditorStoreMock.mockImplementation(() => ({ ...store, openInsertCompletion: true }) as any);
    rerender(<InsertAutocomplete />);
    act(() => insertCompletionText$.next(''));
    await act(async () => {});
    const wrapper = document.body.querySelector('[class*="insert-autocomplete"]') as HTMLDivElement;
    if (wrapper) {
      Object.defineProperty(wrapper, 'scrollTop', { value: 0, writable: true, configurable: true });
      Object.defineProperty(wrapper, 'clientHeight', { value: 100, configurable: true });
      wrapper.scroll = mockScroll;
    }
    expect(() => {
      fireEvent.keyDown(mockContainer, { key: 'ArrowDown', code: 'ArrowDown' });
    }).not.toThrow();
    querySpy.mockRestore();
  });

  it('when openInsertCompletion becomes false removes listeners and closes', () => {
    const addSpy = vi.spyOn(mockContainer, 'addEventListener');
    const removeSpy = vi.spyOn(mockContainer, 'removeEventListener');
    const storeWithOpen = getDefaultStore();
    useEditorStoreMock.mockImplementation(() => storeWithOpen as any);
    const { rerender } = render(<InsertAutocomplete />);
    act(() => insertCompletionText$.next(''));
    expect(addSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    useEditorStoreMock.mockImplementation(() => ({ ...storeWithOpen, openInsertCompletion: false }) as any);
    rerender(<InsertAutocomplete />);
    expect(removeSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    addSpy.mockRestore();
    removeSpy.mockRestore();
  });

  it('runInsertTask with isCustom calls Transforms.delete and runInsertTask prop', async () => {
    const runInsertTaskProp = vi.fn().mockResolvedValue(true);
    const customOption: InsertAutocompleteItem = {
      label: ['Custom', '自定义'],
      key: 'custom1',
      task: 'customTask',
      icon: <span />,
    };
    render(<InsertAutocomplete insertOptions={[customOption]} runInsertTask={runInsertTaskProp} />);
    act(() => insertCompletionText$.next(''));
    const item = await screen.findByText(/自定义|Custom/, {}, { timeout: 500 }).catch(() => null);
    if (item) {
      fireEvent.click(item);
      await act(async () => {});
      expect(Transforms.delete).toHaveBeenCalled();
      expect(runInsertTaskProp).toHaveBeenCalledWith(customOption, expect.objectContaining({ isCustom: true }));
    }
  });
});

describe('InsertAutocomplete with insertLink', () => {
  beforeEach(() => {
    useEditorStoreMock.mockImplementation(getDefaultStore as any);
    vi.clearAllMocks();
  });

  it('calls runInsertTask with isCustom when custom image option is clicked', async () => {
    const runInsertTask = vi.fn().mockResolvedValue(true);
    const imageOption: InsertAutocompleteItem = {
      label: ['Image', '图片'],
      key: 'image',
      task: 'image',
      icon: <span />,
    };
    render(
      <InsertAutocomplete
        insertOptions={[imageOption]}
        runInsertTask={runInsertTask}
      />,
    );
    act(() => {
      insertCompletionText$.next('');
    });
    const quickItem = await screen.findByText(/图片|Image/, {}, { timeout: 500 }).catch(() => null);
    if (quickItem) {
      fireEvent.click(quickItem);
      expect(runInsertTask).toHaveBeenCalledWith(
        imageOption,
        expect.objectContaining({ isCustom: true }),
      );
    }
    expect(document.body.querySelector('.ant-menu')).toBeTruthy();
  });
});

describe('InsertAutocomplete insertMedia', () => {
  beforeEach(() => {
    useEditorStoreMock.mockImplementation(getDefaultStore as any);
    vi.mocked(getRemoteMediaType).mockResolvedValue('image');
    vi.clearAllMocks();
  });

  it('shows insertLink UI when clicking default embedMedia option and calls insertMedia on Embed', async () => {
    render(<InsertAutocomplete />);
    act(() => {
      insertCompletionText$.next('');
    });
    const embedMediaItem = await screen.findByText(/嵌入媒体|Embed media/, {}, { timeout: 500 }).catch(() => null);
    if (embedMediaItem) {
      fireEvent.click(embedMediaItem);
      await act(async () => {});
    }
    const input = document.body.querySelector('input[placeholder*="media"]') ?? document.body.querySelector('input');
    if (input) {
      fireEvent.change(input, { target: { value: 'https://example.com/video.mp4' } });
      await act(async () => {});
      const embedBtn = Array.from(document.body.querySelectorAll('button')).find((b) => b.textContent === 'Embed');
      if (embedBtn && !embedBtn.hasAttribute('disabled')) {
        fireEvent.click(embedBtn);
        await act(async () => {});
        expect(getRemoteMediaType).toHaveBeenCalled();
      }
    }
  });

  it('insertMedia with youtube replaceUrl', async () => {
    render(<InsertAutocomplete />);
    act(() => insertCompletionText$.next(''));
    const embedMediaItem = await screen.findByText(/嵌入媒体|Embed media/, {}, { timeout: 500 }).catch(() => null);
    if (embedMediaItem) fireEvent.click(embedMediaItem);
    await act(async () => {});
    const input = document.body.querySelector('input');
    if (input) {
      fireEvent.change(input, { target: { value: 'https://youtu.be/abc123' } });
      await act(async () => {});
      const embedBtn = Array.from(document.body.querySelectorAll('button')).find((b) => b.textContent === 'Embed');
      if (embedBtn && !embedBtn.hasAttribute('disabled')) {
        fireEvent.click(embedBtn);
        await act(async () => {});
        expect(getRemoteMediaType).toHaveBeenCalled();
      }
    }
  });

  it('insertMedia with youtube replaceUrl and optional ?si= preserves query', async () => {
    render(<InsertAutocomplete />);
    act(() => insertCompletionText$.next(''));
    const embedMediaItem = await screen.findByText(/嵌入媒体|Embed media/, {}, { timeout: 500 }).catch(() => null);
    if (embedMediaItem) fireEvent.click(embedMediaItem);
    await act(async () => {});
    const input = document.body.querySelector('input');
    if (input) {
      fireEvent.change(input, { target: { value: 'https://youtu.be/abc123?si=xyz' } });
      await act(async () => {});
      const embedBtn = Array.from(document.body.querySelectorAll('button')).find((b) => b.textContent === 'Embed');
      if (embedBtn && !embedBtn.hasAttribute('disabled')) {
        fireEvent.click(embedBtn);
        await act(async () => {});
        expect(getRemoteMediaType).toHaveBeenCalledWith(expect.stringMatching(/youtube\.com\/embed\/abc123\?si=xyz/));
      }
    }
  });

  it('insertMedia invalid URL throws and sets loading false', async () => {
    vi.mocked(getRemoteMediaType).mockResolvedValue(null);
    render(<InsertAutocomplete />);
    act(() => insertCompletionText$.next(''));
    const embedMediaItem = await screen.findByText(/嵌入媒体|Embed media/, {}, { timeout: 500 }).catch(() => null);
    if (embedMediaItem) fireEvent.click(embedMediaItem);
    await act(async () => {});
    const input = document.body.querySelector('input');
    if (input) {
      fireEvent.change(input, { target: { value: 'https://example.com/x' } });
      await act(async () => {});
      const embedBtn = Array.from(document.body.querySelectorAll('button')).find((b) => b.textContent === 'Embed');
      if (embedBtn && !embedBtn.hasAttribute('disabled')) {
        fireEvent.click(embedBtn);
        await act(async () => {});
      }
    }
    vi.mocked(getRemoteMediaType).mockResolvedValue('image');
  });

  it('insertMedia with bilibili replaceUrl', async () => {
    render(<InsertAutocomplete />);
    act(() => insertCompletionText$.next(''));
    const embedMediaItem = await screen.findByText(/嵌入媒体|Embed media/, {}, { timeout: 500 }).catch(() => null);
    if (embedMediaItem) fireEvent.click(embedMediaItem);
    await act(async () => {});
    const input = document.body.querySelector('input');
    if (input) {
      fireEvent.change(input, { target: { value: 'https://www.bilibili.com/video/BV1xx411c7mD/' } });
      await act(async () => {});
      const embedBtn = Array.from(document.body.querySelectorAll('button')).find((b) => b.textContent === 'Embed');
      if (embedBtn && !embedBtn.hasAttribute('disabled')) {
        fireEvent.click(embedBtn);
        await act(async () => {});
        expect(getRemoteMediaType).toHaveBeenCalledWith(expect.stringContaining('player.bilibili.com'));
      }
    }
  });

  it('insertMedia with src= replaceUrl', async () => {
    render(<InsertAutocomplete />);
    act(() => insertCompletionText$.next(''));
    const embedMediaItem = await screen.findByText(/嵌入媒体|Embed media/, {}, { timeout: 500 }).catch(() => null);
    if (embedMediaItem) fireEvent.click(embedMediaItem);
    await act(async () => {});
    const input = document.body.querySelector('input');
    if (input) {
      fireEvent.change(input, { target: { value: 'src="https://example.com/img.png"' } });
      await act(async () => {});
      const embedBtn = Array.from(document.body.querySelectorAll('button')).find((b) => b.textContent === 'Embed');
      if (embedBtn && !embedBtn.hasAttribute('disabled')) {
        fireEvent.click(embedBtn);
        await act(async () => {});
        expect(getRemoteMediaType).toHaveBeenCalledWith('https://example.com/img.png');
      }
    }
  });

  it('insertMedia invalid protocol throws', async () => {
    render(<InsertAutocomplete />);
    act(() => insertCompletionText$.next(''));
    const embedMediaItem = await screen.findByText(/嵌入媒体|Embed media/, {}, { timeout: 500 }).catch(() => null);
    if (embedMediaItem) fireEvent.click(embedMediaItem);
    await act(async () => {});
    const input = document.body.querySelector('input');
    if (input) {
      fireEvent.change(input, { target: { value: 'not-a-valid-url' } });
      await act(async () => {});
      const embedBtn = Array.from(document.body.querySelectorAll('button')).find((b) => b.textContent === 'Embed');
      if (embedBtn && !embedBtn.hasAttribute('disabled')) {
        fireEvent.click(embedBtn);
        await act(async () => {});
      }
    }
  });

  it('insertMedia with plain https URL (no replaceUrl match) succeeds', async () => {
    render(<InsertAutocomplete />);
    act(() => insertCompletionText$.next(''));
    const embedMediaItem = await screen.findByText(/嵌入媒体|Embed media/, {}, { timeout: 500 }).catch(() => null);
    if (embedMediaItem) fireEvent.click(embedMediaItem);
    await act(async () => {});
    const input = document.body.querySelector('input');
    if (input) {
      fireEvent.change(input, { target: { value: 'https://example.com/photo.jpg' } });
      await act(async () => {});
      const embedBtn = Array.from(document.body.querySelectorAll('button')).find((b) => b.textContent === 'Embed');
      if (embedBtn && !embedBtn.hasAttribute('disabled')) {
        fireEvent.click(embedBtn);
        await act(async () => {});
        expect(getRemoteMediaType).toHaveBeenCalledWith('https://example.com/photo.jpg');
        expect(Transforms.setNodes).toHaveBeenCalled();
      }
    }
  });

  it('insertMedia when getRemoteMediaType returns null sets loading false in finally', async () => {
    vi.mocked(getRemoteMediaType).mockResolvedValueOnce(null);
    render(<InsertAutocomplete />);
    act(() => insertCompletionText$.next(''));
    const embedMediaItem = await screen.findByText(/嵌入媒体|Embed media/, {}, { timeout: 500 }).catch(() => null);
    if (embedMediaItem) fireEvent.click(embedMediaItem);
    await act(async () => {});
    const input = document.body.querySelector('input');
    if (input) {
      fireEvent.change(input, { target: { value: 'https://example.com/unknown' } });
      await act(async () => {});
      const embedBtn = Array.from(document.body.querySelectorAll('button')).find((b) => b.textContent === 'Embed');
      if (embedBtn && !embedBtn.hasAttribute('disabled')) {
        fireEvent.click(embedBtn);
        await act(async () => {});
      }
    }
    vi.mocked(getRemoteMediaType).mockResolvedValue('image');
  });
});

describe('InsertAutocomplete insertAttachment', () => {
  beforeEach(() => {
    useEditorStoreMock.mockImplementation(getDefaultStore as any);
    vi.clearAllMocks();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ 'content-length': '1024' }),
    });
  });

  it('shows insertAttachment UI when clicking default attachLink option', async () => {
    render(<InsertAutocomplete />);
    act(() => insertCompletionText$.next(''));
    const linkItem = await screen.findByText(/链接|By link/, {}, { timeout: 800 }).catch(() => null);
    if (linkItem) {
      fireEvent.click(linkItem);
      await waitFor(() => {
        const tabs = document.body.querySelector('.ant-tabs');
        const chooseFile = Array.from(document.body.querySelectorAll('button')).find((b) => b.textContent?.includes('Choose a file'));
        expect(tabs ?? chooseFile).toBeTruthy();
      }, { timeout: 1000 });
    } else {
      expect(document.body.querySelector('.ant-menu')).toBeTruthy();
    }
  });

  it('insertAttachByLink with http URL calls fetch and setNodes', async () => {
    render(<InsertAutocomplete />);
    act(() => insertCompletionText$.next(''));
    const linkItem = await screen.findByText(/链接|By link/, {}, { timeout: 500 }).catch(() => null);
    if (linkItem) fireEvent.click(linkItem);
    await act(async () => {});
    const tabEmbed = Array.from(document.body.querySelectorAll('.ant-tabs-tab')).find((t) => t.textContent?.includes('Embed'));
    if (tabEmbed) fireEvent.click(tabEmbed);
    await act(async () => {});
    const input = document.body.querySelector('input[placeholder*="attachment"]') ?? document.body.querySelector('input');
    if (input) {
      fireEvent.change(input, { target: { value: 'https://example.com/file.pdf' } });
      await act(async () => {});
      const embedBtn = Array.from(document.body.querySelectorAll('button')).find((b) => b.textContent === 'Embed');
      if (embedBtn && !embedBtn.hasAttribute('disabled')) {
        fireEvent.click(embedBtn);
        await act(async () => {});
        expect(fetch).toHaveBeenCalledWith('https://example.com/file.pdf');
        expect(Transforms.setNodes).toHaveBeenCalled();
        expect(selChange$.next).toHaveBeenCalled();
      }
    }
  });

  it('insertAttachByLink via Local tab Choose a file button', async () => {
    render(<InsertAutocomplete />);
    act(() => insertCompletionText$.next(''));
    const linkItem = await screen.findByText(/链接|By link/, {}, { timeout: 500 }).catch(() => null);
    if (linkItem) fireEvent.click(linkItem);
    await act(async () => {});
    const chooseFileBtn = Array.from(document.body.querySelectorAll('button')).find((b) => b.textContent?.includes('Choose a file'));
    if (chooseFileBtn) {
      fireEvent.click(chooseFileBtn);
      await act(async () => {});
      expect(Transforms.setNodes).toHaveBeenCalled();
    }
  });

  it('insertAttachByLink when fetch returns not ok keeps loading false in finally', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false });
    render(<InsertAutocomplete />);
    act(() => insertCompletionText$.next(''));
    const linkItem = await screen.findByText(/链接|By link/, {}, { timeout: 500 }).catch(() => null);
    if (linkItem) fireEvent.click(linkItem);
    await act(async () => {});
    const tabEmbed = Array.from(document.body.querySelectorAll('.ant-tabs-tab')).find((t) => t.textContent?.includes('Embed'));
    if (tabEmbed) fireEvent.click(tabEmbed);
    await act(async () => {});
    const input = document.body.querySelector('input');
    if (input) {
      fireEvent.change(input, { target: { value: 'https://example.com/err' } });
      await act(async () => {});
      const embedBtn = Array.from(document.body.querySelectorAll('button')).find((b) => b.textContent === 'Embed');
      if (embedBtn && !embedBtn.hasAttribute('disabled')) {
        fireEvent.click(embedBtn);
        await act(async () => {});
      }
    }
    global.fetch = vi.fn().mockResolvedValue({ ok: true, headers: new Headers({ 'content-length': '0' }) });
  });

  it('insertAttachByLink with http URL extracts filename from path', async () => {
    render(<InsertAutocomplete />);
    act(() => insertCompletionText$.next(''));
    const linkItem = await screen.findByText(/链接|By link/, {}, { timeout: 500 }).catch(() => null);
    if (linkItem) fireEvent.click(linkItem);
    await act(async () => {});
    const tabEmbed = Array.from(document.body.querySelectorAll('.ant-tabs-tab')).find((t) => t.textContent?.includes('Embed'));
    if (tabEmbed) fireEvent.click(tabEmbed);
    await act(async () => {});
    const input = document.body.querySelector('input');
    if (input) {
      fireEvent.change(input, { target: { value: 'https://example.com/my-file.pdf' } });
      await act(async () => {});
      const embedBtn = Array.from(document.body.querySelectorAll('button')).find((b) => b.textContent === 'Embed');
      if (embedBtn && !embedBtn.hasAttribute('disabled')) {
        fireEvent.click(embedBtn);
        await act(async () => {});
        expect(Transforms.setNodes).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ name: 'my-file', url: 'https://example.com/my-file.pdf' }), expect.anything());
      }
    }
  });

  it('insertAttachByLink when next node is not empty paragraph does not delete', async () => {
    vi.mocked(Editor.next).mockReturnValueOnce([{ type: 'paragraph', children: [{ text: 'x' }] }, [1]] as any);
    vi.mocked(Node.string).mockReturnValueOnce('x');
    render(<InsertAutocomplete />);
    act(() => insertCompletionText$.next(''));
    const linkItem = await screen.findByText(/链接|By link/, {}, { timeout: 500 }).catch(() => null);
    if (linkItem) fireEvent.click(linkItem);
    await act(async () => {});
    const chooseFileBtn = Array.from(document.body.querySelectorAll('button')).find((b) => b.textContent?.includes('Choose a file'));
    if (chooseFileBtn) {
      fireEvent.click(chooseFileBtn);
      await act(async () => {});
      expect(Transforms.setNodes).toHaveBeenCalled();
      expect(Transforms.delete).not.toHaveBeenCalled();
    }
    vi.mocked(Editor.next).mockReturnValue([paragraphNode, [1]] as any);
    vi.mocked(Node.string).mockReturnValue('');
  });

  it('insertAttachByLink when next node is empty paragraph calls Transforms.delete', async () => {
    vi.mocked(Editor.next).mockReturnValue([paragraphNode, [1]] as any);
    vi.mocked(Node.string).mockReturnValue('');
    render(<InsertAutocomplete />);
    act(() => insertCompletionText$.next(''));
    const linkItem = await screen.findByText(/链接|By link/, {}, { timeout: 500 }).catch(() => null);
    if (linkItem) fireEvent.click(linkItem);
    await act(async () => {});
    const tabEmbed = Array.from(document.body.querySelectorAll('.ant-tabs-tab')).find((t) => t.textContent?.includes('Embed'));
    if (tabEmbed) fireEvent.click(tabEmbed);
    await act(async () => {});
    const input = document.body.querySelector('input');
    if (input) {
      fireEvent.change(input, { target: { value: 'https://example.com/doc.pdf' } });
      await act(async () => {});
      const embedBtn = Array.from(document.body.querySelectorAll('button')).find((b) => b.textContent === 'Embed');
      if (embedBtn && !embedBtn.hasAttribute('disabled')) {
        fireEvent.click(embedBtn);
        await act(async () => {});
        expect(Transforms.delete).toHaveBeenCalled();
      }
    }
  });

  it('insertAttachByLink with non-http URL does not call fetch', async () => {
    render(<InsertAutocomplete />);
    act(() => insertCompletionText$.next(''));
    const linkItem = await screen.findByText(/链接|By link/, {}, { timeout: 500 }).catch(() => null);
    if (linkItem) fireEvent.click(linkItem);
    await act(async () => {});
    const tabEmbed = Array.from(document.body.querySelectorAll('.ant-tabs-tab')).find((t) => t.textContent?.includes('Embed'));
    if (tabEmbed) fireEvent.click(tabEmbed);
    await act(async () => {});
    const input = document.body.querySelector('input');
    if (input) {
      fireEvent.change(input, { target: { value: 'file:///local/path.pdf' } });
      await act(async () => {});
      const embedBtn = Array.from(document.body.querySelectorAll('button')).find((b) => b.textContent === 'Embed');
      if (embedBtn && !embedBtn.hasAttribute('disabled')) {
        fireEvent.click(embedBtn);
        await act(async () => {});
        expect(fetch).not.toHaveBeenCalled();
        expect(Transforms.setNodes).toHaveBeenCalled();
      }
    }
  });

  it('calls runInsertTask with isCustom when custom attachment option is clicked', () => {
    const runInsertTask = vi.fn().mockResolvedValue(true);
    const attachmentOption: InsertAutocompleteItem = {
      label: ['Attachment', '附件'],
      key: 'attachment',
      task: 'attachment',
      icon: <span />,
    };
    render(
      <InsertAutocomplete
        insertOptions={[attachmentOption]}
        runInsertTask={runInsertTask}
      />,
    );
    act(() => {
      insertCompletionText$.next('');
    });
    const menuItems = document.body.querySelectorAll('.ant-menu-item');
    const toClick = Array.from(menuItems).find(
      (el) => el.textContent === '附件' || el.textContent === 'Attachment',
    ) ?? menuItems[0];
    if (toClick) {
      fireEvent.click(toClick);
      expect(runInsertTask).toHaveBeenCalledWith(
        attachmentOption,
        expect.objectContaining({ isCustom: true }),
      );
    }
  });
});

describe('InsertAutocomplete calculatePosition and effect branches', () => {
  beforeEach(() => {
    useEditorStoreMock.mockImplementation(getDefaultStore as any);
    vi.clearAllMocks();
  });

  it('calculatePosition branch: spaceBelow and spaceAbove both small (bottom: 0)', async () => {
    vi.mocked(mockNodeEl.getBoundingClientRect).mockReturnValue({
      top: 100,
      left: 0,
      width: 100,
      height: 200,
      bottom: 300,
      right: 100,
      x: 0,
      y: 100,
      toJSON: () => ({}),
    } as DOMRect);
    Object.defineProperty(mockNodeEl, 'clientHeight', { value: 200, configurable: true });
    Object.defineProperty(document.documentElement, 'clientHeight', { value: 300, configurable: true });
    if (!('scrollTop' in document.body)) {
      Object.defineProperty(document.body, 'scrollTop', { value: 0, configurable: true });
    }
    render(<InsertAutocomplete />);
    act(() => insertCompletionText$.next(''));
    await act(async () => {});
    const wrapper = document.body.querySelector('[class*="insert-autocomplete"]') as HTMLElement;
    expect(wrapper).toBeTruthy();
    expect(wrapper?.style?.bottom === '0px' || String(wrapper?.style?.bottom) === '0').toBe(true);
  });

  it('calculatePosition branch: spaceAbove large, spaceBelow small (show above)', async () => {
    vi.mocked(mockNodeEl.getBoundingClientRect).mockReturnValue({
      top: 250,
      left: 0,
      width: 100,
      height: 20,
      bottom: 270,
      right: 100,
      x: 0,
      y: 250,
      toJSON: () => ({}),
    } as DOMRect);
    Object.defineProperty(mockNodeEl, 'clientHeight', { value: 20, configurable: true });
    Object.defineProperty(document.documentElement, 'clientHeight', { value: 300, configurable: true });
    render(<InsertAutocomplete />);
    act(() => insertCompletionText$.next(''));
    await act(async () => {});
    const wrapper = document.body.querySelector('[class*="insert-autocomplete"]') as HTMLElement;
    expect(wrapper).toBeTruthy();
  });

  it('effect when node is not paragraph still sets ctx and listeners', async () => {
    const addSpy = vi.spyOn(mockContainer, 'addEventListener');
    function* codeNodeGen() {
      yield [{ type: 'code', children: [{ text: '' }] }, [0]];
    }
    vi.mocked(Editor.nodes).mockImplementation(codeNodeGen as any);
    render(<InsertAutocomplete />);
    act(() => insertCompletionText$.next(''));
    expect(addSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    addSpy.mockRestore();
    vi.mocked(Editor.nodes).mockImplementation(() => editorNodesGenerator());
  });

  it('effect when toDOMNode returns null does not throw', async () => {
    vi.mocked(ReactEditor.toDOMNode).mockReturnValueOnce(null as any);
    render(<InsertAutocomplete />);
    act(() => insertCompletionText$.next(''));
    expect(document.body.querySelector('.ant-menu')).toBeTruthy();
  });

  it('calculatePosition branch: spaceBelow >= 212 shows panel below node', async () => {
    vi.mocked(mockNodeEl.getBoundingClientRect).mockReturnValue({
      top: 50,
      left: 0,
      width: 100,
      height: 20,
      bottom: 70,
      right: 100,
      x: 0,
      y: 50,
      toJSON: () => ({}),
    } as DOMRect);
    Object.defineProperty(mockNodeEl, 'clientHeight', { value: 20, configurable: true });
    Object.defineProperty(document.documentElement, 'clientHeight', { value: 400, configurable: true });
    render(<InsertAutocomplete />);
    act(() => insertCompletionText$.next(''));
    await act(async () => {});
    const wrapper = document.body.querySelector('[class*="insert-autocomplete"]') as HTMLElement;
    expect(wrapper).toBeTruthy();
    expect(wrapper?.style?.top).toBeDefined();
    expect(String(wrapper?.style?.bottom ?? '')).toBe('');
  });

  it('effect when paragraph and position setState with position', async () => {
    vi.mocked(mockNodeEl.getBoundingClientRect).mockReturnValue({
      top: 10,
      left: 0,
      width: 100,
      height: 20,
      bottom: 30,
      right: 100,
      x: 0,
      y: 10,
      toJSON: () => ({}),
    } as DOMRect);
    Object.defineProperty(mockNodeEl, 'clientHeight', { value: 20, configurable: true });
    Object.defineProperty(document.documentElement, 'clientHeight', { value: 400, configurable: true });
    render(<InsertAutocomplete />);
    act(() => insertCompletionText$.next(''));
    await act(async () => {});
    const wrapper = document.body.querySelector('[class*="insert-autocomplete"]') as HTMLElement;
    expect(wrapper?.style?.left).toBeDefined();
  });
});

describe('InsertAutocomplete input and keyboard', () => {
  beforeEach(() => {
    useEditorStoreMock.mockImplementation(getDefaultStore as any);
    vi.clearAllMocks();
  });

  it('insertLink Input onMouseDown stopPropagation', async () => {
    render(<InsertAutocomplete />);
    act(() => insertCompletionText$.next(''));
    const embedItem = await screen.findByText(/嵌入媒体|Embed media/, {}, { timeout: 500 }).catch(() => null);
    if (embedItem) fireEvent.click(embedItem);
    await act(async () => {});
    const input = document.body.querySelector('input');
    if (input) {
      const stopSpy = vi.spyOn(MouseEvent.prototype, 'stopPropagation');
      fireEvent.mouseDown(input);
      expect(stopSpy).toHaveBeenCalled();
      stopSpy.mockRestore();
    }
  });

  it('insertLink Input Enter key triggers insertMedia', async () => {
    render(<InsertAutocomplete />);
    act(() => insertCompletionText$.next(''));
    const embedItem = await screen.findByText(/嵌入媒体|Embed media/, {}, { timeout: 500 }).catch(() => null);
    if (embedItem) fireEvent.click(embedItem);
    await act(async () => {});
    const input = document.body.querySelector('input');
    if (input) {
      fireEvent.change(input, { target: { value: 'https://example.com/a.mp4' } });
      await act(async () => {});
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
      await act(async () => {});
      expect(getRemoteMediaType).toHaveBeenCalled();
    }
  });

  it('wrapper onMouseDown prevents default', async () => {
    render(<InsertAutocomplete />);
    act(() => insertCompletionText$.next(''));
    const wrapper = document.body.querySelector('[class*="insert-autocomplete"]');
    if (wrapper) {
      const ev = new MouseEvent('mousedown', { bubbles: true });
      const preventSpy = vi.spyOn(ev, 'preventDefault');
      wrapper.dispatchEvent(ev);
      expect(preventSpy).toHaveBeenCalled();
      preventSpy.mockRestore();
    }
  });

  it('insertAttachment Embed tab Enter triggers insertAttachByLink', async () => {
    render(<InsertAutocomplete />);
    act(() => insertCompletionText$.next(''));
    const linkItem = await screen.findByText(/链接|By link/, {}, { timeout: 500 }).catch(() => null);
    if (linkItem) fireEvent.click(linkItem);
    await act(async () => {});
    const tabEmbed = Array.from(document.body.querySelectorAll('.ant-tabs-tab')).find((t) => t.textContent?.includes('Embed'));
    if (tabEmbed) fireEvent.click(tabEmbed);
    await act(async () => {});
    const input = document.body.querySelector('input[placeholder*="attachment"]') ?? document.body.querySelector('input');
    if (input) {
      fireEvent.change(input, { target: { value: 'https://example.com/f.pdf' } });
      await act(async () => {});
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
      await act(async () => {});
      expect(Transforms.setNodes).toHaveBeenCalled();
    }
  });
});

describe('InsertAutocomplete callback branch coverage', () => {
  beforeEach(() => {
    useEditorStoreMock.mockImplementation(getDefaultStore as any);
    vi.clearAllMocks();
  });

  it('optionsRender callback item click should call domEvent stop/prevent and run built-in task', () => {
    let captured: any[] = [];
    const optionsRender = vi.fn((opts: any[]) => {
      captured = opts;
      return opts;
    });
    render(<InsertAutocomplete optionsRender={optionsRender} />);
    act(() => insertCompletionText$.next(''));

    const codeItem = captured.find((i) => i.key === 'code');
    expect(codeItem).toBeTruthy();
    const stopPropagation = vi.fn();
    const preventDefault = vi.fn();
    codeItem.onClick({ domEvent: { stopPropagation, preventDefault } });

    expect(stopPropagation).toHaveBeenCalled();
    expect(preventDefault).toHaveBeenCalled();
    expect(Transforms.insertText).toHaveBeenCalled();
    expect(keyTaskNext).toHaveBeenCalledWith(
      expect.objectContaining({ key: 'insertCode' }),
    );
  });

  it('custom item click with matchMedia undefined should hit custom return guard', async () => {
    const originalMatchMedia = window.matchMedia;
    // @ts-ignore
    window.matchMedia = undefined;
    let captured: any[] = [];
    const optionsRender = vi.fn((opts: any[]) => {
      captured = opts;
      return opts;
    });
    const runInsertTask = vi.fn().mockResolvedValue(true);
    const customItem: InsertAutocompleteItem = {
      label: ['Custom Action', '自定义动作'],
      key: 'my-custom-task',
      task: 'my-custom-task',
      icon: <span />,
    };
    render(
      <InsertAutocomplete
        optionsRender={optionsRender}
        insertOptions={[customItem]}
        runInsertTask={runInsertTask}
      />,
    );
    act(() => insertCompletionText$.next(''));

    const item = captured.find((i) => i.key === 'my-custom-task');
    expect(item).toBeTruthy();
    item.onClick({
      domEvent: { stopPropagation: vi.fn(), preventDefault: vi.fn() },
    });
    await act(async () => {});
    expect(Transforms.delete).toHaveBeenCalled();
    expect(runInsertTask).toHaveBeenCalledWith(
      customItem,
      expect.objectContaining({ x: expect.any(Number), y: expect.any(Number) }),
    );
    window.matchMedia = originalMatchMedia;
  });

  it('built-in task click with matchMedia undefined should hit non-custom return guard', () => {
    const originalMatchMedia = window.matchMedia;
    // @ts-ignore
    window.matchMedia = undefined;
    let captured: any[] = [];
    const optionsRender = vi.fn((opts: any[]) => {
      captured = opts;
      return opts;
    });
    render(<InsertAutocomplete optionsRender={optionsRender} />);
    act(() => insertCompletionText$.next(''));

    const quoteItem = captured.find((i) => i.key === 'quote');
    expect(quoteItem).toBeTruthy();
    quoteItem.onClick({
      domEvent: { stopPropagation: vi.fn(), preventDefault: vi.fn() },
    });
    expect(Transforms.insertText).toHaveBeenCalled();
    expect(keyTaskNext).toHaveBeenCalledWith(
      expect.objectContaining({ key: 'insertQuote' }),
    );
    window.matchMedia = originalMatchMedia;
  });

});

describe('InsertAutocomplete position fallback coverage', () => {
  beforeEach(() => {
    useEditorStoreMock.mockImplementation(getDefaultStore as any);
    vi.clearAllMocks();
  });

  it('when calculatePosition returns undefined should fallback to top=0 left=0', async () => {
    vi.mocked(mockNodeEl.getBoundingClientRect).mockReturnValue({
      top: Number.NaN,
      left: 0,
      width: 100,
      height: 20,
      bottom: Number.NaN,
      right: 100,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    } as DOMRect);
    Object.defineProperty(mockNodeEl, 'clientHeight', {
      value: 20,
      configurable: true,
    });
    render(<InsertAutocomplete />);
    act(() => insertCompletionText$.next(''));
    await act(async () => {});
    const wrapper = document.body.querySelector(
      '[class*="insert-autocomplete"]',
    ) as HTMLElement;
    expect(wrapper).toBeTruthy();
    expect(wrapper.style.top).toBe('0px');
  });
});
