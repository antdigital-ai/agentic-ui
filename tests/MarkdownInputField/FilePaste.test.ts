import { describe, expect, it, vi } from 'vitest';
import { getFileListFromDataTransferItems } from '../../src/MarkdownInputField/FilePaste';

describe('FilePaste', () => {
  describe('getFileListFromDataTransferItems', () => {
    it('应该返回空数组当 items 为空', async () => {
      const mockEvent = {
        clipboardData: {
          items: [],
        },
      } as React.ClipboardEvent<HTMLDivElement>;

      const result = await getFileListFromDataTransferItems(mockEvent);
      expect(result).toEqual([]);
    });

    it('应该返回空数组当 clipboardData 为 undefined', async () => {
      const mockEvent = {
        clipboardData: undefined,
      } as any;

      // 现在代码已经处理了 undefined 的情况，应该返回空数组
      const result = await getFileListFromDataTransferItems(mockEvent);
      expect(result).toEqual([]);
    });

    it('应该处理单个文件项', async () => {
      const mockFile = new File(['test'], 'test.png', { type: 'image/png' });
      const mockItem = {
        kind: 'file',
        getAsFile: vi.fn().mockReturnValue(mockFile),
        webkitGetAsEntry: vi.fn(),
      } as any;

      const mockEvent = {
        clipboardData: {
          items: [mockItem],
        },
      } as React.ClipboardEvent<HTMLDivElement>;

      const result = await getFileListFromDataTransferItems(mockEvent);
      expect(result).toHaveLength(1);
      expect(result[0]).toBe(mockFile);
      expect(mockItem.getAsFile).toHaveBeenCalled();
    });

    it('应该处理多个文件项', async () => {
      const mockFile1 = new File(['test1'], 'test1.png', { type: 'image/png' });
      const mockFile2 = new File(['test2'], 'test2.jpg', {
        type: 'image/jpeg',
      });
      const mockItem1 = {
        kind: 'file',
        getAsFile: vi.fn().mockReturnValue(mockFile1),
        webkitGetAsEntry: vi.fn(),
      } as any;
      const mockItem2 = {
        kind: 'file',
        getAsFile: vi.fn().mockReturnValue(mockFile2),
        webkitGetAsEntry: vi.fn(),
      } as any;

      const mockEvent = {
        clipboardData: {
          items: [mockItem1, mockItem2],
        },
      } as React.ClipboardEvent<HTMLDivElement>;

      const result = await getFileListFromDataTransferItems(mockEvent);
      expect(result).toHaveLength(2);
      expect(result[0]).toBe(mockFile1);
      expect(result[1]).toBe(mockFile2);
    });

    it('应该处理非文件类型的项', async () => {
      const mockItem = {
        kind: 'string',
        getAsFile: vi.fn(),
        webkitGetAsEntry: vi.fn(),
      } as any;

      const mockEvent = {
        clipboardData: {
          items: [mockItem],
        },
      } as React.ClipboardEvent<HTMLDivElement>;

      const result = await getFileListFromDataTransferItems(mockEvent);
      expect(result).toEqual([]);
      expect(mockItem.getAsFile).not.toHaveBeenCalled();
    });

    it('应该处理 getAsFile 返回 null 的情况', async () => {
      const mockEntry = {
        isFile: true,
        file: vi.fn((callback) => {
          const mockFile = new File(['test'], 'test.png', {
            type: 'image/png',
          });
          callback(mockFile);
        }),
      } as any;

      const mockItem = {
        kind: 'file',
        getAsFile: vi.fn().mockReturnValue(null),
        webkitGetAsEntry: vi.fn().mockReturnValue(mockEntry),
      } as any;

      const mockEvent = {
        clipboardData: {
          items: [mockItem],
        },
      } as React.ClipboardEvent<HTMLDivElement>;

      const result = await getFileListFromDataTransferItems(mockEvent);
      expect(result).toHaveLength(1);
      expect(mockItem.getAsFile).toHaveBeenCalled();
      expect(mockItem.webkitGetAsEntry).toHaveBeenCalled();
      expect(mockEntry.file).toHaveBeenCalled();
    });

    it('应该处理目录类型的项', async () => {
      const mockFile1 = new File(['test1'], 'file1.png', {
        type: 'image/png',
      });
      const mockFile2 = new File(['test2'], 'file2.jpg', {
        type: 'image/jpeg',
      });

      const mockFileEntry1 = {
        isFile: true,
        file: vi.fn((callback) => callback(mockFile1)),
      } as any;

      const mockFileEntry2 = {
        isFile: true,
        file: vi.fn((callback) => callback(mockFile2)),
      } as any;

      const mockDirReader = {
        readEntries: vi.fn((callback) => {
          callback([mockFileEntry1, mockFileEntry2]);
        }),
      } as any;

      const mockDirEntry = {
        isDirectory: true,
        isFile: false,
        createReader: vi.fn().mockReturnValue(mockDirReader),
      } as any;

      const mockItem = {
        kind: 'file',
        getAsFile: vi.fn().mockReturnValue(null),
        webkitGetAsEntry: vi.fn().mockReturnValue(mockDirEntry),
      } as any;

      const mockEvent = {
        clipboardData: {
          items: [mockItem],
        },
      } as React.ClipboardEvent<HTMLDivElement>;

      const result = await getFileListFromDataTransferItems(mockEvent);
      expect(result).toHaveLength(2);
      expect(result[0]).toBe(mockFile1);
      expect(result[1]).toBe(mockFile2);
      expect(mockDirEntry.createReader).toHaveBeenCalled();
      expect(mockDirReader.readEntries).toHaveBeenCalled();
    });

    it('应该处理嵌套目录结构', async () => {
      const mockFile1 = new File(['test1'], 'file1.png', {
        type: 'image/png',
      });
      const mockFile2 = new File(['test2'], 'file2.jpg', {
        type: 'image/jpeg',
      });

      const mockFileEntry1 = {
        isFile: true,
        file: vi.fn((callback) => callback(mockFile1)),
      } as any;

      const mockFileEntry2 = {
        isFile: true,
        file: vi.fn((callback) => callback(mockFile2)),
      } as any;

      const mockSubDirReader = {
        readEntries: vi.fn((callback) => {
          callback([mockFileEntry2]);
        }),
      } as any;

      const mockSubDirEntry = {
        isDirectory: true,
        isFile: false,
        createReader: vi.fn().mockReturnValue(mockSubDirReader),
      } as any;

      const mockDirReader = {
        readEntries: vi.fn((callback) => {
          callback([mockFileEntry1, mockSubDirEntry]);
        }),
      } as any;

      const mockDirEntry = {
        isDirectory: true,
        isFile: false,
        createReader: vi.fn().mockReturnValue(mockDirReader),
      } as any;

      const mockItem = {
        kind: 'file',
        getAsFile: vi.fn().mockReturnValue(null),
        webkitGetAsEntry: vi.fn().mockReturnValue(mockDirEntry),
      } as any;

      const mockEvent = {
        clipboardData: {
          items: [mockItem],
        },
      } as React.ClipboardEvent<HTMLDivElement>;

      const result = await getFileListFromDataTransferItems(mockEvent);
      expect(result).toHaveLength(2);
      expect(result[0]).toBe(mockFile1);
      expect(result[1]).toBe(mockFile2);
    });

    it('应该处理既不是文件也不是目录的项', async () => {
      const mockEntry = {
        isFile: false,
        isDirectory: false,
      } as any;

      const mockItem = {
        kind: 'file',
        getAsFile: vi.fn().mockReturnValue(null),
        webkitGetAsEntry: vi.fn().mockReturnValue(mockEntry),
      } as any;

      const mockEvent = {
        clipboardData: {
          items: [mockItem],
        },
      } as React.ClipboardEvent<HTMLDivElement>;

      const result = await getFileListFromDataTransferItems(mockEvent);
      expect(result).toEqual([]);
    });

    it('应该处理 webkitGetAsEntry 返回 null 的情况', async () => {
      const mockItem = {
        kind: 'file',
        getAsFile: vi.fn().mockReturnValue(null),
        webkitGetAsEntry: vi.fn().mockReturnValue(null),
      } as any;

      const mockEvent = {
        clipboardData: {
          items: [mockItem],
        },
      } as React.ClipboardEvent<HTMLDivElement>;

      const result = await getFileListFromDataTransferItems(mockEvent);
      expect(result).toEqual([]);
      expect(mockItem.getAsFile).toHaveBeenCalled();
      expect(mockItem.webkitGetAsEntry).toHaveBeenCalled();
    });

    it('应该处理空目录', async () => {
      const mockDirReader = {
        readEntries: vi.fn((callback) => {
          callback([]);
        }),
      } as any;

      const mockDirEntry = {
        isDirectory: true,
        isFile: false,
        createReader: vi.fn().mockReturnValue(mockDirReader),
      } as any;

      const mockItem = {
        kind: 'file',
        getAsFile: vi.fn().mockReturnValue(null),
        webkitGetAsEntry: vi.fn().mockReturnValue(mockDirEntry),
      } as any;

      const mockEvent = {
        clipboardData: {
          items: [mockItem],
        },
      } as React.ClipboardEvent<HTMLDivElement>;

      const result = await getFileListFromDataTransferItems(mockEvent);
      expect(result).toEqual([]);
    });
  });
});
