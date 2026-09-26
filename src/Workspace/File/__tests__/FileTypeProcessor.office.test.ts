import { describe, expect, it } from 'vitest';
import { fileTypeProcessor } from '../FileTypeProcessor';
import type { FileNode } from '../../types';

const node = (name: string, overrides: Partial<FileNode> = {}): FileNode => ({
  name,
  url: `https://example.com/${name}`,
  ...overrides,
});

describe('FileTypeProcessor Office OOXML preview', () => {
  it('docx / xlsx / pptx 应可预览且为 inline', () => {
    for (const name of ['a.docx', 'b.xlsx', 'c.pptx']) {
      const result = fileTypeProcessor.processFile(node(name));
      expect(result.canPreview).toBe(true);
      expect(result.previewMode).toBe('inline');
    }
  });

  it('旧版二进制 .doc / .xls / .ppt 不可预览', () => {
    for (const name of ['a.doc', 'b.xls', 'c.ppt']) {
      const result = fileTypeProcessor.processFile(node(name));
      expect(result.canPreview).toBe(false);
      expect(result.previewMode).toBe('none');
    }
  });

  it('csv（Excel 分类）不应走 Office 预览能力', () => {
    const result = fileTypeProcessor.processFile(node('data.csv'));
    // csv 属于 Excel 分类但非 OOXML；文本预览链路由其它类型覆盖，此处不应因 Office 放开
    // 若被推断为 csv 文件类型，category 为 excel，但扩展名非 docx/xlsx/pptx → 不可预览
    if (result.typeInference.category === 'excel') {
      expect(result.canPreview).toBe(false);
    }
  });
});
