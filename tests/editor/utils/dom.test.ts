import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getMediaType,
  getOffsetLeft,
  getOffsetTop,
  getSelRect,
  slugify,
} from '../../../src/MarkdownEditor/editor/utils/dom';

// Mock diacritics
vi.mock('diacritics', () => ({
  remove: (str: string) => str.normalize('NFD').replace(/[\u0300-\u036f]/g, ''),
}));

describe('DOM Utils', () => {
  let mockElement: HTMLElement;
  let mockParent: HTMLElement;
  let mockTarget: HTMLElement;

  beforeEach(() => {
    // Create mock DOM elements
    mockElement = document.createElement('div');
    mockParent = document.createElement('div');
    mockTarget = document.createElement('div');

    // Mock offset properties
    Object.defineProperty(mockElement, 'offsetTop', {
      value: 100,
      writable: true,
    });
    Object.defineProperty(mockElement, 'offsetLeft', {
      value: 50,
      writable: true,
    });
    Object.defineProperty(mockElement, 'offsetParent', {
      value: mockParent,
      writable: true,
    });

    Object.defineProperty(mockParent, 'offsetTop', {
      value: 200,
      writable: true,
    });
    Object.defineProperty(mockParent, 'offsetLeft', {
      value: 150,
      writable: true,
    });
    Object.defineProperty(mockParent, 'offsetParent', {
      value: null,
      writable: true,
    });

    // Mock contains method
    mockTarget.contains = vi.fn((element) => {
      // For getOffsetTop: target.contains(dom.offsetParent)
      if (element === mockParent) return true;
      // For getOffsetLeft: target.contains(dom)
      if (element === mockElement) return true;
      return false;
    });

    // Mock document.body
    Object.defineProperty(document, 'body', {
      value: mockTarget,
      writable: true,
    });
  });

  describe('getOffsetTop', () => {
    it('应该计算元素相对于目标元素的偏移顶部距离', () => {
      const result = getOffsetTop(mockElement, mockTarget);

      expect(result).toBe(100); // 只计算当前元素的offsetTop
      expect(mockTarget.contains).toHaveBeenCalledWith(mockParent);
    });

    it('当目标元素不包含当前元素时应该返回0', () => {
      mockTarget.contains = vi.fn(() => false);

      const result = getOffsetTop(mockElement, mockTarget);

      expect(result).toBe(0);
    });

    it('当目标元素等于当前元素时应该返回0', () => {
      const result = getOffsetTop(mockElement, mockElement);

      expect(result).toBe(0);
    });

    it('应该使用document.body作为默认目标', () => {
      const result = getOffsetTop(mockElement);

      expect(result).toBe(100);
    });
  });

  describe('getOffsetLeft', () => {
    it('应该计算元素相对于目标元素的偏移左侧距离', () => {
      const result = getOffsetLeft(mockElement, mockTarget);

      expect(result).toBe(200); // 累加当前元素(50)和父元素(150)的offsetLeft
      expect(mockTarget.contains).toHaveBeenCalledWith(mockElement);
    });

    it('当目标元素不包含当前元素时应该返回0', () => {
      mockTarget.contains = vi.fn(() => false);

      const result = getOffsetLeft(mockElement, mockTarget);

      expect(result).toBe(0);
    });

    it('当目标元素等于当前元素时应该返回0', () => {
      const result = getOffsetLeft(mockElement, mockElement);

      expect(result).toBe(0);
    });

    it('应该使用document.body作为默认目标', () => {
      const result = getOffsetLeft(mockElement);

      expect(result).toBe(200); // 累加当前元素(50)和父元素(150)的offsetLeft
    });
  });

  describe('slugify', () => {
    it('应该将字符串转换为slug格式', () => {
      const result = slugify('Hello World!');

      expect(result).toBe('hello-world');
    });

    it('应该移除重音符号', () => {
      const result = slugify('café résumé');

      expect(result).toBe('cafe-resume');
    });

    it('应该处理连续的分隔符', () => {
      const result = slugify('hello--world---test');

      expect(result).toBe('hello-world-test');
    });

    it('应该移除前缀和后缀的分隔符', () => {
      const result = slugify('-hello-world-');

      expect(result).toBe('hello-world');
    });

    it('应该处理以数字开头的字符串', () => {
      const result = slugify('123hello');

      expect(result).toBe('_123hello');
    });

    it('应该处理特殊字符', () => {
      const result = slugify('hello@world#test');

      expect(result).toBe('hello-world-test');
    });

    it('应该处理控制字符', () => {
      const result = slugify('hello\nworld\ttest');

      expect(result).toBe('helloworldtest');
    });

    it('应该处理空字符串', () => {
      const result = slugify('');

      expect(result).toBe('');
    });

    it('应该处理只包含特殊字符的字符串', () => {
      const result = slugify('!@#$%^&*()');

      expect(result).toBe('');
    });
  });

  describe('getMediaType', () => {
    it('应该识别图片文件', () => {
      expect(getMediaType('image.png')).toBe('image');
      expect(getMediaType('photo.jpg')).toBe('image');
      expect(getMediaType('icon.svg')).toBe('image');
      expect(getMediaType('picture.jpeg')).toBe('image');
      expect(getMediaType('banner.webp')).toBe('image');
    });

    it('应该识别音频文件', () => {
      expect(getMediaType('music.mp3')).toBe('audio');
      expect(getMediaType('sound.ogg')).toBe('audio');
      expect(getMediaType('audio.aac')).toBe('audio');
      expect(getMediaType('voice.wav')).toBe('audio');
    });

    it('应该识别视频文件', () => {
      expect(getMediaType('video.mp4')).toBe('video');
      expect(getMediaType('movie.mpg')).toBe('video');
      expect(getMediaType('clip.webm')).toBe('video');
      expect(getMediaType('film.mpeg')).toBe('video');
    });

    it('应该识别文档文件', () => {
      expect(getMediaType('document.pdf')).toBe('document');
      expect(getMediaType('report.doc')).toBe('document');
      expect(getMediaType('spreadsheet.xlsx')).toBe('document');
      expect(getMediaType('presentation.pptx')).toBe('document');
      expect(getMediaType('text.txt')).toBe('document');
    });

    it('应该识别Markdown文件', () => {
      expect(getMediaType('readme.md')).toBe('markdown');
      expect(getMediaType('guide.markdown')).toBe('markdown');
    });

    it('应该处理blob URL', () => {
      expect(getMediaType('blob:http://example.com/123')).toBe('image');
    });

    it('应该根据alt参数处理blob URL', () => {
      expect(getMediaType('blob:http://example.com/123', 'video:test')).toBe(
        'video',
      );
      expect(getMediaType('blob:http://example.com/123', 'audio:test')).toBe(
        'audio',
      );
      expect(
        getMediaType('blob:http://example.com/123', 'attachment:test'),
      ).toBe('attachment');
      expect(getMediaType('blob:http://example.com/123', 'image')).toBe(
        'image',
      );
      expect(getMediaType('blob:http://example.com/123', 'data:image/png')).toBe(
        'image',
      );
    });

    it('应根据 alt 参数处理非 blob 文件名', () => {
      expect(getMediaType('file.png', 'video:test')).toBe('video');
      expect(getMediaType('file.png', 'audio:test')).toBe('audio');
      expect(getMediaType('file.png', 'attachment:test')).toBe('attachment');
    });

    it('应该处理data URL', () => {
      expect(getMediaType('data:image/png;base64,123')).toBe('image');
      expect(getMediaType('test.jpg', 'data:image/png;base64,123')).toBe(
        'image',
      );
    });

    it('应该处理没有扩展名的文件', () => {
      expect(getMediaType('file')).toBe('other');
      expect(getMediaType('')).toBe('other');
      expect(getMediaType(undefined)).toBe('other');
    });

    it('应该处理带查询参数的文件名', () => {
      expect(getMediaType('image.png?v=123')).toBe('image');
      expect(getMediaType('video.mp4?t=456')).toBe('video');
    });

    it('应该处理未知扩展名', () => {
      expect(getMediaType('file.xyz')).toBe('other');
      expect(getMediaType('unknown.abc')).toBe('other');
    });
  });

  describe('getSelRect', () => {
    it('应该返回当前选区的边界矩形', () => {
      const mockRange = {
        getBoundingClientRect: vi.fn(() => ({
          top: 100,
          left: 200,
          width: 300,
          height: 50,
        })),
      };

      const mockSelection = {
        rangeCount: 1,
        getRangeAt: vi.fn(() => mockRange),
      };

      Object.defineProperty(window, 'getSelection', {
        value: vi.fn(() => mockSelection),
        writable: true,
      });

      const result = getSelRect();

      expect(result).toEqual({
        top: 100,
        left: 200,
        width: 300,
        height: 50,
      });
    });

    it('当没有选区时应该返回null', () => {
      const mockSelection = {
        rangeCount: 0,
      };

      Object.defineProperty(window, 'getSelection', {
        value: vi.fn(() => mockSelection),
        writable: true,
      });

      const result = getSelRect();

      expect(result).toBeNull();
    });

    it('当getBoundingClientRect返回null时应该返回null', () => {
      const mockRange = {
        getBoundingClientRect: vi.fn(() => null),
      };

      const mockSelection = {
        rangeCount: 1,
        getRangeAt: vi.fn(() => mockRange),
      };

      Object.defineProperty(window, 'getSelection', {
        value: vi.fn(() => mockSelection),
        writable: true,
      });

      const result = getSelRect();

      expect(result).toBeNull();
    });

    it('在非浏览器环境中应该返回null', () => {
      const originalWindow = global.window;
      // @ts-ignore
      delete global.window;

      const result = getSelRect();

      expect(result).toBeNull();

      global.window = originalWindow;
    });
  });
});
