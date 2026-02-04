import { beforeEach, describe, expect, it, vi } from 'vitest';
import { 
  imagePastingListener, 
  extractTagsFromHtml
} from '../../../../../src/MarkdownEditor/editor/utils/docx/utils';

// Mock blob-util
// 代码使用 import * as blobUtil，所以需要直接导出 base64StringToBlob
vi.mock('blob-util', () => ({
  base64StringToBlob: vi.fn((base64: string) => {
    return new Blob([base64], { type: 'image/png' });
  }),
}));

describe('docx utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.URL
    global.URL = {
      createObjectURL: vi.fn((blob: Blob) => `blob:${blob.type}`),
      revokeObjectURL: vi.fn(),
    } as any;
    global.window = {
      URL: global.URL,
      webkitURL: global.URL,
    } as any;
  });

  describe('extractTagsFromHtml', () => {
    it('should extract src attributes from img tags', () => {
      const html = '<img src="http://example.com/image1.jpg"><img src="http://example.com/image2.png">';
      const result = extractTagsFromHtml(html);
      expect(result).toEqual([
        'http://example.com/image1.jpg',
        'http://example.com/image2.png'
      ]);
    });

    it('should return empty array when no img tags are present', () => {
      const html = '<div>No images here</div>';
      const result = extractTagsFromHtml(html);
      expect(result).toEqual([]);
    });

    it('should handle malformed img tags', () => {
      const html = '<img src="http://example.com/image1.jpg"><img>';
      const result = extractTagsFromHtml(html);
      expect(result).toEqual(['http://example.com/image1.jpg']);
    });

    it('should handle empty html', () => {
      const html = '';
      const result = extractTagsFromHtml(html);
      expect(result).toEqual([]);
    });
  });

  describe('imagePastingListener', () => {
    it('should return undefined when no hex images are found', () => {
      const rtf = `{\\rtf1\\ansi\\ansicpg1252\\deff0\\deflang1033{\\fonttbl{\\f0\\fnil\\fcharset0 Calibri;}}
{\\*\\generator Riched20 10.0.19041}\\viewkind4\\uc1 
Some text without images
\\par
}`;
      const html = '<div>No images here</div>';
      const result = imagePastingListener(rtf, html);
      expect(result).toBeUndefined();
    });

    it('should handle empty inputs', () => {
      const rtf = '';
      const html = '';
      const result = imagePastingListener(rtf, html);
      expect(result).toBeUndefined();
    });

    it('should process PNG images from RTF', () => {
      // 创建一个包含 PNG 图片的 RTF 内容，需要包含 \\bliptag 以匹配正则表达式
      // RTF 图片格式: {\pict\pngblip\bliptag123 十六进制数据}
      // 注意：正则表达式期望 bliptag 之后直接是空白字符或 }，然后是十六进制数据
      const rtf = `{\\rtf1\\ansi{\\pict\\pngblip\\bliptag123 89504e470d0a1a0a0000000d4948445200000001000000010802000000907753de0000000a49444154789c6300010000000500010d0a2db40000000467414d41000186a031e8965f000000097048597300000ec400000ec401952b0e1b0000000c74455874536f667477617265004d6963726f736f6674204f66666963650000000049454e44ae426082}}`;
      const html = '<img src="file:///C:/temp/image.png">';
      const result = imagePastingListener(rtf, html);
      expect(result).toBeDefined();
      if (result) {
        expect(Object.keys(result).length).toBeGreaterThan(0);
        expect(result['file:///C:/temp/image.png']).toBeDefined();
      }
    });

    it('should process JPEG images from RTF', () => {
      // 创建一个包含 JPEG 图片的 RTF 内容，需要包含 \\bliptag
      const rtf = `{\\rtf1\\ansi{\\pict\\jpegblip\\bliptag456 ffd8ffe000104a46494600010101006000600000ffdb004300}}`;
      const html = '<img src="file:///C:/temp/image.jpg">';
      const result = imagePastingListener(rtf, html);
      expect(result).toBeDefined();
      if (result) {
        expect(Object.keys(result).length).toBeGreaterThan(0);
        expect(result['file:///C:/temp/image.jpg']).toBeDefined();
      }
    });

    it('should handle images with non-file:// URLs', () => {
      // 非 file:// URL 不会被处理，但函数仍然会返回对象（可能是空的）
      const rtf = `{\\rtf1\\ansi{\\pict\\pngblip\\bliptag789 89504e470d0a1a0a0000000d4948445200000001000000010802000000907753de0000000a49444154789c6300010000000500010d0a2db40000000467414d41000186a031e8965f000000097048597300000ec400000ec401952b0e1b0000000c74455874536f667477617265004d6963726f736f6674204f66666963650000000049454e44ae426082}}`;
      const html = '<img src="http://example.com/image.png">';
      const result = imagePastingListener(rtf, html);
      // 非 file:// URL 不应该被处理，但函数返回空对象而不是 undefined
      expect(result).toBeDefined();
      expect(result).toEqual({});
    });

    it('should handle mismatched image counts', () => {
      // 图片数量不匹配时，函数返回空对象（因为 imgTags.length !== newSrcValues.length）
      const rtf = `{\\rtf1\\ansi{\\pict\\pngblip\\bliptag999 89504e470d0a1a0a0000000d4948445200000001000000010802000000907753de0000000a49444154789c6300010000000500010d0a2db40000000467414d41000186a031e8965f000000097048597300000ec400000ec401952b0e1b0000000c74455874536f667477617265004d6963726f736f6674204f66666963650000000049454e44ae426082}}`;
      const html = '<img src="file:///C:/temp/image1.png"><img src="file:///C:/temp/image2.png">';
      const result = imagePastingListener(rtf, html);
      // 图片数量不匹配时应该返回空对象（因为条件 imgTags.length === newSrcValues.length 不满足）
      expect(result).toBeDefined();
      expect(result).toEqual({});
    });

    it('should use webkitURL when URL is not available', () => {
      const originalURL = global.URL;
      // @ts-ignore
      delete global.URL;
      global.window = {
        webkitURL: {
          createObjectURL: vi.fn((blob: Blob) => `webkit-blob:${blob.type}`),
        },
      } as any;

      const rtf = `{\\rtf1\\ansi{\\pict\\pngblip\\bliptag111 89504e470d0a1a0a0000000d4948445200000001000000010802000000907753de0000000a49444154789c6300010000000500010d0a2db40000000467414d41000186a031e8965f000000097048597300000ec400000ec401952b0e1b0000000c74455874536f667477617265004d6963726f736f6674204f66666963650000000049454e44ae426082}}`;
      const html = '<img src="file:///C:/temp/image.png">';
      const result = imagePastingListener(rtf, html);
      
      expect(result).toBeDefined();
      if (result) {
        expect(Object.keys(result).length).toBeGreaterThan(0);
      }
      global.URL = originalURL;
    });

    it('should handle extractFromRtf with PNG images', () => {
      const rtf = `{\\rtf1\\ansi{\\pict\\pngblip\\bliptag222 89504e470d0a1a0a0000000d4948445200000001000000010802000000907753de0000000a49444154789c6300010000000500010d0a2db40000000467414d41000186a031e8965f000000097048597300000ec400000ec401952b0e1b0000000c74455874536f667477617265004d6963726f736f6674204f66666963650000000049454e44ae426082}}`;
      const html = '<img src="file:///C:/temp/image.png">';
      const result = imagePastingListener(rtf, html);
      expect(result).toBeDefined();
      if (result) {
        expect(Object.keys(result).length).toBeGreaterThan(0);
      }
    });

    it('should handle extractFromRtf with JPEG images', () => {
      const rtf = `{\\rtf1\\ansi{\\pict\\jpegblip\\bliptag333 ffd8ffe000104a46494600010101006000600000ffdb004300}}`;
      const html = '<img src="file:///C:/temp/image.jpg">';
      const result = imagePastingListener(rtf, html);
      expect(result).toBeDefined();
      if (result) {
        expect(Object.keys(result).length).toBeGreaterThan(0);
      }
    });

    it('should skip images with unsupported types', () => {
      // 创建一个包含不支持图片类型的 RTF 内容（需要包含 \\bliptag 才能匹配正则）
      const rtf = `{\\rtf1\\ansi{\\pict\\wmetafile8\\bliptag444 89504e470d0a1a0a0000000d4948445200000001000000010802000000907753de0000000a49444154789c6300010000000500010d0a2db40000000467414d41000186a031e8965f000000097048597300000ec400000ec401952b0e1b0000000c74455874536f667477617265004d6963726f736f6674204f66666963650000000049454e44ae426082}}`;
      const html = '<img src="file:///C:/temp/image.wmf">';
      const result = imagePastingListener(rtf, html);
      // 不支持的图片类型（既不是 pngblip 也不是 jpegblip）会被跳过，extractFromRtf 返回空数组
      // 所以 imagePastingListener 返回 undefined
      expect(result).toBeUndefined();
    });

    it('should handle extractFromRtf with no matching images', () => {
      const rtf = `{\\rtf1\\ansi\\ansicpg1252\\deff0\\deflang1033{\\fonttbl{\\f0\\fnil\\fcharset0 Calibri;}}}`;
      const html = '<img src="file:///C:/temp/image.png">';
      const result = imagePastingListener(rtf, html);
      expect(result).toBeUndefined();
    });

    it('should handle convertHexStringToBytes function', () => {
      // 这个函数是私有的，我们通过 imagePastingListener 来间接测试
      const rtf = `{\\rtf1\\ansi{\\pict\\pngblip\\bliptag555 89504e470d0a1a0a0000000d4948445200000001000000010802000000907753de0000000a49444154789c6300010000000500010d0a2db40000000467414d41000186a031e8965f000000097048597300000ec400000ec401952b0e1b0000000c74455874536f667477617265004d6963726f736f6674204f66666963650000000049454e44ae426082}}`;
      const html = '<img src="file:///C:/temp/image.png">';
      const result = imagePastingListener(rtf, html);
      // 如果 convertHexStringToBytes 工作正常，应该能成功处理
      expect(result).toBeDefined();
      if (result) {
        expect(Object.keys(result).length).toBeGreaterThan(0);
      }
    });

    it('should handle convertBytesToBase64 with different array lengths', () => {
      // 测试 convertBytesToBase64 处理不同长度的字节数组
      // 通过使用不同长度的十六进制数据来间接测试
      const rtf = `{\\rtf1\\ansi{\\pict\\pngblip\\bliptag666 89504e470d0a1a0a}}`; // 较短的十六进制数据
      const html = '<img src="file:///C:/temp/image.png">';
      const result = imagePastingListener(rtf, html);
      // 即使数据较短，也应该能处理
      expect(result).toBeDefined();
    });

    it('should handle extractFromRtf with blipupi and blipuid', () => {
      // 测试包含 blipupi 和 blipuid 的 RTF 格式
      const rtf = `{\\rtf1\\ansi{\\pict\\pngblip\\bliptag777\\blipupi123{\\*\\blipuid abcdef123456 89504e470d0a1a0a0000000d4948445200000001000000010802000000907753de0000000a49444154789c6300010000000500010d0a2db40000000467414d41000186a031e8965f000000097048597300000ec400000ec401952b0e1b0000000c74455874536f667477617265004d6963726f736f6674204f66666963650000000049454e44ae426082}}`;
      const html = '<img src="file:///C:/temp/image.png">';
      const result = imagePastingListener(rtf, html);
      expect(result).toBeDefined();
      if (result) {
        expect(Object.keys(result).length).toBeGreaterThan(0);
      }
    });

    it('should handle extractFromRtf with negative bliptag', () => {
      // 测试负数的 bliptag
      const rtf = `{\\rtf1\\ansi{\\pict\\pngblip\\bliptag-888 89504e470d0a1a0a0000000d4948445200000001000000010802000000907753de0000000a49444154789c6300010000000500010d0a2db40000000467414d41000186a031e8965f000000097048597300000ec400000ec401952b0e1b0000000c74455874536f667477617265004d6963726f736f6674204f66666963650000000049454e44ae426082}}`;
      const html = '<img src="file:///C:/temp/image.png">';
      const result = imagePastingListener(rtf, html);
      expect(result).toBeDefined();
      if (result) {
        expect(Object.keys(result).length).toBeGreaterThan(0);
      }
    });
  });
});