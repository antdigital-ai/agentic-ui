import { describe, it, expect } from 'vitest';
import { 
  imagePastingListener, 
  extractTagsFromHtml
} from '../../../../../src/MarkdownEditor/editor/utils/docx/utils';

describe('docx utils', () => {
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
  });
});