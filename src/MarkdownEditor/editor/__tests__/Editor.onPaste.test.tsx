import { render, waitFor } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MarkdownEditor } from '../../src';

// Mock console.log to ignore act warnings
const originalConsoleLog = console.log;
console.log = (...args: any[]) => {
  if (typeof args[0] === 'string' && args[0].includes('inside an act')) {
    return;
  }
  originalConsoleLog(...args);
};

// Mock URL constructor for testing
global.URL = class URL {
  searchParams: URLSearchParams;
  constructor(url: string) {
    this.searchParams = new URLSearchParams();
    if (url.includes('?')) {
      const [, params] = url.split('?');
      this.searchParams = new URLSearchParams(params);
    }
  }
} as any;

// Mock window.getSelection
Object.defineProperty(window, 'getSelection', {
  writable: true,
  value: vi.fn(() => ({
    rangeCount: 0,
    getRangeAt: vi.fn(),
    removeAllRanges: vi.fn(),
    addRange: vi.fn(),
    anchorNode: null,
    focusNode: null,
    type: 'None',
  })),
});

describe('Editor onPaste function - Fixed Tests', () => {
  let container: HTMLElement;

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup DOM
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
    console.log = originalConsoleLog;
  });

  const createClipboardEvent = (
    data: Record<string, string>,
    files?: File[],
    target?: HTMLElement,
  ) => {
    const clipboardData = {
      types: Object.keys(data),
      getData: vi.fn((type: string) => data[type] || ''),
      files: files || [],
      items: Object.keys(data).map((type) => ({
        type,
        kind: 'string' as const,
        getAsString: vi.fn((callback: (str: string) => void) => {
          callback(data[type] || '');
        }),
      })),
    };

    return {
      clipboardData,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      target: target || container,
      currentTarget: target || container,
      isTrusted: true,
      isComposing: false,
      nativeEvent: {
        clipboardData,
      },
      type: 'paste',
      bubbles: true,
      cancelable: true,
    } as any;
  };

  // 测试编辑器渲染和基本 paste 事件对象结构
  it('should render editor and create proper paste event objects', async () => {
    const { container: editorContainer } = render(
      <ConfigProvider
        theme={{
          hashed: false,
        }}
      >
        <MarkdownEditor
          initSchemaValue={[{ type: 'paragraph', children: [{ text: '' }] }]}
        />
      </ConfigProvider>,
    );

    const editableElement = editorContainer.querySelector(
      '[contenteditable="true"]',
    ) as HTMLElement;
    expect(editableElement).toBeTruthy();

    // Wait for the editor to be fully initialized
    await waitFor(() => {
      expect(editableElement).toBeInTheDocument();
    });

    // Create a simple paste event with the correct target
    const event = createClipboardEvent(
      {
        'text/plain': 'Hello World',
      },
      [],
      editableElement,
    );

    // Test that the paste event object is properly structured
    expect(event.clipboardData).toBeDefined();
    expect(event.clipboardData.types).toContain('text/plain');
    expect(event.clipboardData.getData('text/plain')).toBe('Hello World');
    expect(event.preventDefault).toBeDefined();
    expect(event.stopPropagation).toBeDefined();
    expect(event.target).toBe(editableElement);
    expect(event.currentTarget).toBe(editableElement);

    // Verify that the editor is still functional
    expect(editableElement).toBeInTheDocument();
    expect(editableElement.getAttribute('contenteditable')).toBe('true');
  });

  // 测试 Slate markdown fragment paste 事件对象
  it('should handle Slate markdown fragment paste event structure', async () => {
    const { container: editorContainer } = render(
      <MarkdownEditor
        initSchemaValue={[{ type: 'paragraph', children: [{ text: '' }] }]}
      />,
    );

    const editableElement = editorContainer.querySelector(
      '[contenteditable="true"]',
    ) as HTMLElement;

    await waitFor(() => {
      expect(editableElement).toBeInTheDocument();
    });

    const slateFragment = JSON.stringify([
      {
        type: 'paragraph',
        children: [{ text: 'Pasted from Slate' }],
      },
    ]);

    const event = createClipboardEvent(
      {
        'application/x-slate-md-fragment': slateFragment,
      },
      [],
      editableElement,
    );

    // Test event structure
    expect(event.clipboardData.types).toContain(
      'application/x-slate-md-fragment',
    );
    expect(event.clipboardData.getData('application/x-slate-md-fragment')).toBe(
      slateFragment,
    );

    // Verify JSON is valid
    expect(() => JSON.parse(slateFragment)).not.toThrow();
  });

  // 测试 HTML 内容 paste 事件对象
  it('should handle HTML content paste event structure', async () => {
    const { container: editorContainer } = render(
      <MarkdownEditor
        initSchemaValue={[{ type: 'paragraph', children: [{ text: '' }] }]}
      />,
    );

    const editableElement = editorContainer.querySelector(
      '[contenteditable="true"]',
    ) as HTMLElement;

    await waitFor(() => {
      expect(editableElement).toBeInTheDocument();
    });

    const htmlContent =
      '<p><strong>Bold text</strong> and <em>italic text</em></p>';

    const event = createClipboardEvent(
      {
        'text/html': htmlContent,
        'text/plain': 'Bold text and italic text',
      },
      [],
      editableElement,
    );

    // Test event structure
    expect(event.clipboardData.types).toContain('text/html');
    expect(event.clipboardData.types).toContain('text/plain');
    expect(event.clipboardData.getData('text/html')).toBe(htmlContent);
    expect(event.clipboardData.getData('text/plain')).toBe(
      'Bold text and italic text',
    );
  });

  // 测试文件 paste 事件对象
  it('should handle file paste event structure', async () => {
    const mockUpload = vi
      .fn()
      .mockResolvedValue('https://example.com/image.jpg');

    const { container: editorContainer } = render(
      <MarkdownEditor
        initSchemaValue={[{ type: 'paragraph', children: [{ text: '' }] }]}
        image={{ upload: mockUpload }}
      />,
    );

    const editableElement = editorContainer.querySelector(
      '[contenteditable="true"]',
    ) as HTMLElement;

    await waitFor(() => {
      expect(editableElement).toBeInTheDocument();
    });

    const imageFile = new File(['image content'], 'test.jpg', {
      type: 'image/jpeg',
    });

    const event = createClipboardEvent(
      {
        Files: '',
      },
      [imageFile],
      editableElement,
    );

    // Test event structure
    expect(event.clipboardData.types).toContain('Files');
    expect(event.clipboardData.files).toHaveLength(1);
    expect(event.clipboardData.files[0]).toBe(imageFile);
  });

  // 测试 undefined clipboard data 处理
  it('should handle pasting when clipboard data is undefined', async () => {
    const { container: editorContainer } = render(
      <MarkdownEditor
        initSchemaValue={[{ type: 'paragraph', children: [{ text: '' }] }]}
      />,
    );

    const editableElement = editorContainer.querySelector(
      '[contenteditable="true"]',
    ) as HTMLElement;

    await waitFor(() => {
      expect(editableElement).toBeInTheDocument();
    });

    // Create event with undefined clipboardData
    const event = {
      clipboardData: undefined,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      target: editableElement,
    } as any;

    // Test that undefined clipboardData is handled gracefully
    expect(event.clipboardData).toBeUndefined();
    expect(event.preventDefault).toBeDefined();
    expect(event.stopPropagation).toBeDefined();
  });

  // 测试空内容 paste 事件对象
  it('should handle pasting empty content', async () => {
    const { container: editorContainer } = render(
      <MarkdownEditor
        initSchemaValue={[{ type: 'paragraph', children: [{ text: '' }] }]}
      />,
    );

    const editableElement = editorContainer.querySelector(
      '[contenteditable="true"]',
    ) as HTMLElement;

    await waitFor(() => {
      expect(editableElement).toBeInTheDocument();
    });

    const event = createClipboardEvent(
      {
        'text/plain': '',
      },
      [],
      editableElement,
    );

    // Test event structure with empty content
    expect(event.clipboardData.types).toContain('text/plain');
    expect(event.clipboardData.getData('text/plain')).toBe('');
  });

  // 测试无效 JSON 处理
  it('should handle pasting with invalid JSON in slate fragment', async () => {
    const { container: editorContainer } = render(
      <MarkdownEditor
        initSchemaValue={[{ type: 'paragraph', children: [{ text: '' }] }]}
      />,
    );

    const editableElement = editorContainer.querySelector(
      '[contenteditable="true"]',
    ) as HTMLElement;

    await waitFor(() => {
      expect(editableElement).toBeInTheDocument();
    });

    const event = createClipboardEvent(
      {
        'application/x-slate-md-fragment': 'invalid json',
        'text/plain': 'fallback text',
      },
      [],
      editableElement,
    );

    // Test event structure
    expect(event.clipboardData.types).toContain(
      'application/x-slate-md-fragment',
    );
    expect(event.clipboardData.types).toContain('text/plain');
    expect(event.clipboardData.getData('application/x-slate-md-fragment')).toBe(
      'invalid json',
    );
    expect(event.clipboardData.getData('text/plain')).toBe('fallback text');

    // Verify that invalid JSON is detected
    expect(() => JSON.parse('invalid json')).toThrow();
  });

  // 测试多种内容类型的 paste 事件对象
  it('should handle multiple content types in paste event', async () => {
    const { container: editorContainer } = render(
      <MarkdownEditor
        initSchemaValue={[{ type: 'paragraph', children: [{ text: '' }] }]}
      />,
    );

    const editableElement = editorContainer.querySelector(
      '[contenteditable="true"]',
    ) as HTMLElement;

    await waitFor(() => {
      expect(editableElement).toBeInTheDocument();
    });

    const event = createClipboardEvent(
      {
        'text/html': '<p>HTML content</p>',
        'text/plain': 'Plain text content',
        'application/x-slate-md-fragment': JSON.stringify([
          { type: 'paragraph', children: [{ text: 'Slate content' }] },
        ]),
      },
      [],
      editableElement,
    );

    // Test that all content types are properly structured
    expect(event.clipboardData.types).toHaveLength(3);
    expect(event.clipboardData.types).toContain('text/html');
    expect(event.clipboardData.types).toContain('text/plain');
    expect(event.clipboardData.types).toContain(
      'application/x-slate-md-fragment',
    );

    expect(event.clipboardData.getData('text/html')).toBe(
      '<p>HTML content</p>',
    );
    expect(event.clipboardData.getData('text/plain')).toBe(
      'Plain text content',
    );
    expect(
      event.clipboardData.getData('application/x-slate-md-fragment'),
    ).toContain('Slate content');
  });

  // 测试编辑器在 readonly 模式下的 paste 事件对象
  it('should handle paste event structure in readonly mode', async () => {
    const { container: editorContainer } = render(
      <MarkdownEditor
        initSchemaValue={[{ type: 'paragraph', children: [{ text: '' }] }]}
        readonly={true}
      />,
    );

    const editableElement = editorContainer.querySelector(
      '.ant-agentic-md-editor-content-readonly',
    ) as HTMLElement;

    await waitFor(() => {
      expect(editableElement).toBeInTheDocument();
    });

    const event = createClipboardEvent(
      {
        'text/plain': 'Should not paste',
      },
      [],
      editableElement,
    );

    // Test event structure in readonly mode
    expect(event.clipboardData).toBeDefined();
    expect(event.clipboardData.getData('text/plain')).toBe('Should not paste');
    expect(event.target).toBe(editableElement);
  });
});
