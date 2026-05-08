import { vi } from 'vitest';

// Mock dependencies
export const mockAntd = () => {
  vi.mock('antd', () => ({
    message: {
      error: vi.fn(),
      success: vi.fn(),
      loading: vi.fn(() => vi.fn()),
    },
  }));
};

export const mockCopyToClipboard = () => {
  vi.mock('copy-to-clipboard', () => ({
    default: vi.fn(() => true),
  }));
};

export const mockNavigatorClipboard = () => {
  Object.defineProperty(navigator, 'clipboard', {
    value: {
      readText: vi.fn(),
    },
    writable: true,
  });
};

export const mockInputElement = {
  id: '',
  type: 'file',
  accept: 'image/*',
  value: '',
  dataset: {} as any,
  onchange: vi.fn(),
  click: vi.fn(),
  remove: vi.fn(),
};

export const mockEditorUtils = () => {
  vi.mock('../../../../../src/MarkdownEditor/editor/utils/editorUtils', () => ({
    EditorUtils: {
      toggleFormat: vi.fn(),
      clearMarks: vi.fn(),
      wrapperCardNode: vi.fn((node) => node),
      isTop: vi.fn(() => true),
      createMediaNode: vi.fn(() => ({ type: 'media', url: 'test.jpg' })),
      p: { type: 'paragraph', children: [{ text: '' }] },
      findPrev: vi.fn(() => [0]),
      findNext: vi.fn(() => [1]),
    },
  }));
};

export const mockEditorStore = () => {
  vi.mock('../../../../../src/MarkdownEditor/editor/store', () => ({
    EditorStore: vi.fn(),
  }));
};

export const setupAllMocks = () => {
  mockAntd();
  mockCopyToClipboard();
  mockNavigatorClipboard();
  mockEditorUtils();
  mockEditorStore();
};
