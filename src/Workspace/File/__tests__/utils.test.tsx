import { render } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { FileCategory, FileType } from '../../types';
import {
  generateUniqueId,
  getFileTypeIcon,
  getGroupIcon,
} from '../utils';

describe('Workspace File utils', () => {
  describe('getFileTypeIcon', () => {
    it('应该返回自定义图标', () => {
      const customIcon = <div data-testid="custom">Custom Icon</div>;
      const result = getFileTypeIcon('plainText', customIcon);
      expect(result).toBe(customIcon);
    });

    it('应该根据文件名扩展名返回图标', () => {
      const result = getFileTypeIcon('plainText', undefined, 'document.txt');
      expect(result).toBeTruthy();
    });

    it('应该根据Excel扩展名返回图标', () => {
      const xlsxIcon = getFileTypeIcon('excel', undefined, 'data.xlsx');
      const xlsIcon = getFileTypeIcon('excel', undefined, 'data.xls');
      expect(xlsxIcon).toBeTruthy();
      expect(xlsIcon).toBeTruthy();
    });

    it('应该根据Word扩展名返回图标', () => {
      const docIcon = getFileTypeIcon('word', undefined, 'document.doc');
      const docxIcon = getFileTypeIcon('word', undefined, 'document.docx');
      expect(docIcon).toBeTruthy();
      expect(docxIcon).toBeTruthy();
    });

    it('应该根据PDF扩展名返回图标', () => {
      const result = getFileTypeIcon('pdf', undefined, 'file.pdf');
      expect(result).toBeTruthy();
    });

    it('应该根据CSV扩展名返回图标', () => {
      const result = getFileTypeIcon('csv', undefined, 'data.csv');
      expect(result).toBeTruthy();
    });

    it('应该根据XML扩展名返回图标', () => {
      const xmlIcon = getFileTypeIcon('config', undefined, 'config.xml');
      const htmlIcon = getFileTypeIcon('plainText', undefined, 'index.html');
      expect(xmlIcon).toBeTruthy();
      expect(htmlIcon).toBeTruthy();
    });

    it('应该根据Markdown扩展名返回图标', () => {
      const mdIcon = getFileTypeIcon('markdown', undefined, 'README.md');
      const markdownIcon = getFileTypeIcon(
        'markdown',
        undefined,
        'doc.markdown',
      );
      expect(mdIcon).toBeTruthy();
      expect(markdownIcon).toBeTruthy();
    });

    it('应该根据压缩文件扩展名返回图标', () => {
      const extensions = ['zip', 'rar', '7z', 'tar', 'gz', 'bz2'];
      extensions.forEach((ext) => {
        const result = getFileTypeIcon('archive', undefined, `file.${ext}`);
        expect(result).toBeTruthy();
      });
    });

    it('应该根据文件类型定义返回图标', () => {
      const result = getFileTypeIcon('excel');
      expect(result).toBeTruthy();
    });

    it('应该根据文件分类返回默认图标', () => {
      const result = getFileTypeIcon('javascript');
      expect(result).toBeTruthy();
    });

    it('应该处理未知文件类型', () => {
      const result = getFileTypeIcon('unknown' as FileType);
      expect(result).toBeTruthy();
    });

    it('应该处理没有扩展名的文件', () => {
      const result = getFileTypeIcon('plainText', undefined, 'README');
      expect(result).toBeTruthy();
    });

    it('应该处理大小写混合的扩展名', () => {
      const result = getFileTypeIcon('plainText', undefined, 'Document.TXT');
      expect(result).toBeTruthy();
    });
  });

  describe('getGroupIcon', () => {
    it('应该返回自定义图标', () => {
      const customIcon = <div data-testid="custom">Custom Group Icon</div>;
      const group = {
        id: 'g1',
        name: 'Group',
        type: 'plainText' as FileType,
        children: [],
      };
      const result = getGroupIcon(group, 'plainText', customIcon);
      expect(result).toBe(customIcon);
    });

    it('应该为多种文件类型显示文件夹图标', () => {
      const group = {
        id: 'g1',
        name: 'Mixed Group',
        type: 'plainText' as FileType,
        children: [
          { id: 'f1', name: 'doc.txt', type: 'plainText' as FileType },
          { id: 'f2', name: 'image.png', type: 'image' as FileType },
        ],
      };
      const result = getGroupIcon(group, 'plainText');
      expect(result).toBeTruthy();
    });

    it('应该为单一文件类型显示该类型图标', () => {
      const group = {
        id: 'g1',
        name: 'Text Group',
        type: 'plainText' as FileType,
        children: [
          { id: 'f1', name: 'doc1.txt', type: 'plainText' as FileType },
          { id: 'f2', name: 'doc2.txt', type: 'plainText' as FileType },
        ],
      };
      const result = getGroupIcon(group, 'plainText');
      expect(result).toBeTruthy();
    });

    it('应该根据文件名推断类型', () => {
      const group = {
        id: 'g1',
        name: 'Inferred Group',
        type: 'plainText' as FileType,
        children: [
          { id: 'f1', name: 'data.xlsx' },
          { id: 'f2', name: 'report.xlsx' },
        ],
      };
      const result = getGroupIcon(group, 'excel');
      expect(result).toBeTruthy();
    });

    it('应该为没有子文件的分组返回默认图标', () => {
      const group = {
        id: 'g1',
        name: 'Empty Group',
        type: 'plainText' as FileType,
        children: [],
      };
      const result = getGroupIcon(group, 'plainText');
      expect(result).toBeTruthy();
    });

    it('应该处理混合类型和推断类型', () => {
      const group = {
        id: 'g1',
        name: 'Mixed Group',
        type: 'plainText' as FileType,
        children: [
          { id: 'f1', name: 'doc.pdf', type: 'pdf' as FileType },
          { id: 'f2', name: 'image.png' }, // 需要推断
        ],
      };
      const result = getGroupIcon(group, 'plainText');
      expect(result).toBeTruthy();
    });

    it('应该处理未知扩展名', () => {
      const group = {
        id: 'g1',
        name: 'Unknown Group',
        type: 'plainText' as FileType,
        children: [
          { id: 'f1', name: 'file.unknown' },
          { id: 'f2', name: 'data.xyz' },
        ],
      };
      const result = getGroupIcon(group, 'plainText');
      expect(result).toBeTruthy();
    });

    it('应该处理没有扩展名的文件', () => {
      const group = {
        id: 'g1',
        name: 'No Extension Group',
        type: 'plainText' as FileType,
        children: [
          { id: 'f1', name: 'README' },
          { id: 'f2', name: 'LICENSE' },
        ],
      };
      const result = getGroupIcon(group, 'plainText');
      expect(result).toBeTruthy();
    });

    it('应该处理不同分类的文件', () => {
      const categories: FileType[] = [
        'plainText',
        'image',
        'video',
        'audio',
        'pdf',
        'word',
        'excel',
        'archive',
      ];

      categories.forEach((type) => {
        const group = {
          id: `g-${type}`,
          name: `${type} Group`,
          type,
          children: [{ id: 'f1', name: 'file', type }],
        };
        const result = getGroupIcon(group, type);
        expect(result).toBeTruthy();
      });
    });
  });

  describe('generateUniqueId', () => {
    it('应该返回已存在的ID', () => {
      const node = { id: 'existing-id', name: 'File', type: 'plainText' };
      const result = generateUniqueId(node);
      expect(result).toBe('existing-id');
    });

    it('应该为没有ID的节点生成唯一ID', () => {
      const node = { name: 'File.txt', type: 'plainText' };
      const result = generateUniqueId(node);
      expect(result).toContain('plainText');
      expect(result).toContain('File.txt');
    });

    it('应该生成包含时间戳的ID', () => {
      const node = { name: 'test.txt', type: 'plainText' };
      const result = generateUniqueId(node);
      // ID应该包含类型和名称
      expect(result).toMatch(/plainText_test\.txt_\d+_[a-z0-9]{6}/);
    });

    it('应该为不同调用生成不同的ID', () => {
      const node = { name: 'file.txt', type: 'plainText' };
      const id1 = generateUniqueId(node);
      // 等待一毫秒确保时间戳不同
      const id2 = generateUniqueId(node);
      // 由于包含随机字符串，ID应该不同
      expect(id1).not.toBe(id2);
    });

    it('应该处理特殊字符的文件名', () => {
      const node = { name: 'file name with spaces.txt', type: 'plainText' };
      const result = generateUniqueId(node);
      expect(result).toContain('file name with spaces.txt');
    });

    it('应该为分组节点生成ID', () => {
      const group = {
        name: 'Documents',
        type: 'plainText' as FileType,
        children: [],
      };
      const result = generateUniqueId(group);
      expect(result).toContain('plainText');
      expect(result).toContain('Documents');
    });

    it('应该处理中文文件名', () => {
      const node = { name: '文档.txt', type: 'plainText' };
      const result = generateUniqueId(node);
      expect(result).toContain('文档.txt');
    });

    it('应该处理长文件名', () => {
      const longName =
        'this_is_a_very_long_file_name_that_might_cause_issues.txt';
      const node = { name: longName, type: 'plainText' };
      const result = generateUniqueId(node);
      expect(result).toContain(longName);
    });
  });

  describe('Icon rendering', () => {
    it('应该能够渲染返回的图标', () => {
      const icon = getFileTypeIcon('pdf', undefined, 'document.pdf');
      const { container } = render(<div>{icon}</div>);
      expect(container.firstChild).toBeTruthy();
    });

    it('应该能够渲染分组图标', () => {
      const group = {
        id: 'g1',
        name: 'Group',
        type: 'plainText' as FileType,
        children: [{ id: 'f1', name: 'file.txt', type: 'plainText' as FileType }],
      };
      const icon = getGroupIcon(group, 'plainText');
      const { container } = render(<div>{icon}</div>);
      expect(container.firstChild).toBeTruthy();
    });
  });
});
