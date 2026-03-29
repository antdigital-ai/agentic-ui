import { describe, expect, it } from 'vitest';
import { normalizeFileMapPropsFromJson } from '../agenticUiEmbedUtils';

describe('normalizeFileMapPropsFromJson', () => {
  it('从 fileList 字段解析文件数组', () => {
    const input = {
      fileList: [
        {
          name: 'README.md',
          size: 2048,
          type: 'text/markdown',
          url: 'https://example.com/README.md',
          uuid: 'file-1',
        },
      ],
    };
    const result = normalizeFileMapPropsFromJson(input);
    expect(result.fileList).toHaveLength(1);
    expect(result.fileList[0].name).toBe('README.md');
    expect(result.fileList[0].url).toBe('https://example.com/README.md');
    expect(result.fileList[0].uuid).toBe('file-1');
    expect(result.fileList[0].size).toBe(2048);
  });

  it('从 files 字段解析文件数组（别名支持）', () => {
    const input = {
      files: [
        {
          name: 'doc.pdf',
          size: 512,
          type: 'application/pdf',
          uuid: 'pdf-1',
        },
      ],
    };
    const result = normalizeFileMapPropsFromJson(input);
    expect(result.fileList).toHaveLength(1);
    expect(result.fileList[0].name).toBe('doc.pdf');
  });

  it('支持直接传入数组', () => {
    const input = [
      { name: 'file.txt', uuid: 'txt-1' },
    ];
    const result = normalizeFileMapPropsFromJson(input);
    expect(result.fileList).toHaveLength(1);
    expect(result.fileList[0].name).toBe('file.txt');
  });

  it('当解析到的文件缺少 name 字段时，使用 file-{index} 作为默认名', () => {
    const input = { fileList: [{ url: 'https://example.com/a.jpg' }] };
    const result = normalizeFileMapPropsFromJson(input);
    expect(result.fileList[0].name).toBe('file-0');
  });

  it('当 uuid 不存在时，使用 id 字段作为 uuid', () => {
    const input = { fileList: [{ name: 'file.txt', id: 'my-id' }] };
    const result = normalizeFileMapPropsFromJson(input);
    expect(result.fileList[0].uuid).toBe('my-id');
  });

  it('正确映射 status 字段', () => {
    const input = {
      fileList: [
        { name: 'a.txt', uuid: '1', status: 'done' },
        { name: 'b.txt', uuid: '2', status: 'uploading' },
        { name: 'c.txt', uuid: '3', status: 'invalid' },
      ],
    };
    const result = normalizeFileMapPropsFromJson(input);
    expect(result.fileList[0].status).toBe('done');
    expect(result.fileList[1].status).toBe('uploading');
    expect(result.fileList[2].status).toBeUndefined();
  });

  it('传入 null 返回空文件列表', () => {
    const result = normalizeFileMapPropsFromJson(null);
    expect(result.fileList).toHaveLength(0);
  });

  it('传入空对象返回空文件列表', () => {
    const result = normalizeFileMapPropsFromJson({});
    expect(result.fileList).toHaveLength(0);
  });

  it('解析可选的 className 字段', () => {
    const input = {
      fileList: [],
      className: 'my-custom-class',
    };
    const result = normalizeFileMapPropsFromJson(input);
    expect(result.className).toBe('my-custom-class');
  });
});
