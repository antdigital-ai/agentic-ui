import { describe, expect, it } from 'vitest';
import { normalizeFileMapPropsFromJson } from '../agenticUiEmbedUtils';

describe('normalizeFileMapPropsFromJson', () => {
  // ─── 基础字段解析 ──────────────────────────────────────────────────────────

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
    const input = [{ name: 'file.txt', uuid: 'txt-1' }];
    const result = normalizeFileMapPropsFromJson(input);
    expect(result.fileList).toHaveLength(1);
    expect(result.fileList[0].name).toBe('file.txt');
  });

  it('解析 previewUrl 字段', () => {
    const input = {
      fileList: [
        {
          name: 'photo.jpg',
          uuid: 'img-1',
          url: 'https://example.com/photo.jpg',
          previewUrl: 'https://example.com/photo-thumb.jpg',
        },
      ],
    };
    const result = normalizeFileMapPropsFromJson(input);
    expect(result.fileList[0].previewUrl).toBe(
      'https://example.com/photo-thumb.jpg',
    );
  });

  it('解析 errorMessage 字段', () => {
    const input = {
      fileList: [
        {
          name: 'bad.zip',
          uuid: 'err-1',
          status: 'error',
          errorMessage: '文件大小超出限制',
        },
      ],
    };
    const result = normalizeFileMapPropsFromJson(input);
    expect(result.fileList[0].errorMessage).toBe('文件大小超出限制');
  });

  it('解析可选的 className 字段', () => {
    const input = { fileList: [], className: 'my-custom-class' };
    const result = normalizeFileMapPropsFromJson(input);
    expect(result.className).toBe('my-custom-class');
  });

  // ─── name / uuid 回退逻辑 ──────────────────────────────────────────────────

  it('当缺少 name 字段时，使用 file-{index} 作为默认名', () => {
    const input = { fileList: [{ url: 'https://example.com/a.jpg' }] };
    const result = normalizeFileMapPropsFromJson(input);
    expect(result.fileList[0].name).toBe('file-0');
  });

  it('当 uuid 不存在时，使用 id 字段作为 uuid', () => {
    const input = { fileList: [{ name: 'file.txt', id: 'my-id' }] };
    const result = normalizeFileMapPropsFromJson(input);
    expect(result.fileList[0].uuid).toBe('my-id');
  });

  it('uuid 优先于 id', () => {
    const input = {
      fileList: [{ name: 'file.txt', uuid: 'uuid-val', id: 'id-val' }],
    };
    const result = normalizeFileMapPropsFromJson(input);
    expect(result.fileList[0].uuid).toBe('uuid-val');
  });

  it('uuid 和 id 均缺失时，自动生成 file-{index}', () => {
    const input = {
      fileList: [
        { name: 'first.txt' },
        { name: 'second.txt' },
      ],
    };
    const result = normalizeFileMapPropsFromJson(input);
    expect(result.fileList[0].uuid).toBe('file-0');
    expect(result.fileList[1].uuid).toBe('file-1');
  });

  it('多文件时索引各自独立', () => {
    const input = {
      fileList: [
        { name: 'a.txt', uuid: 'a' },
        { name: 'b.txt', uuid: 'b' },
        { name: 'c.txt', uuid: 'c' },
      ],
    };
    const result = normalizeFileMapPropsFromJson(input);
    expect(result.fileList).toHaveLength(3);
    expect(result.fileList.map((f) => f.name)).toEqual([
      'a.txt',
      'b.txt',
      'c.txt',
    ]);
  });

  // ─── type 字段 ─────────────────────────────────────────────────────────────

  it('缺少 type 字段时，默认为 application/octet-stream', () => {
    const input = { fileList: [{ name: 'file.bin', uuid: '1' }] };
    const result = normalizeFileMapPropsFromJson(input);
    expect(result.fileList[0].type).toBe('application/octet-stream');
  });

  it('正确保留 type 字段', () => {
    const input = {
      fileList: [{ name: 'img.png', uuid: '1', type: 'image/png' }],
    };
    const result = normalizeFileMapPropsFromJson(input);
    expect(result.fileList[0].type).toBe('image/png');
  });

  // ─── size 字段 ─────────────────────────────────────────────────────────────

  it('size 为字符串时忽略（返回 undefined）', () => {
    const input = { fileList: [{ name: 'f.txt', uuid: '1', size: '1024' }] };
    const result = normalizeFileMapPropsFromJson(input);
    expect(result.fileList[0].size).toBeUndefined();
  });

  it('size 为 0 时保留（边界值）', () => {
    const input = { fileList: [{ name: 'empty.txt', uuid: '1', size: 0 }] };
    const result = normalizeFileMapPropsFromJson(input);
    expect(result.fileList[0].size).toBe(0);
  });

  // ─── status 字段 ───────────────────────────────────────────────────────────

  it('正确映射全部合法 status 值', () => {
    const input = {
      fileList: [
        { name: 'a.txt', uuid: '1', status: 'done' },
        { name: 'b.txt', uuid: '2', status: 'uploading' },
        { name: 'c.txt', uuid: '3', status: 'pending' },
        { name: 'd.txt', uuid: '4', status: 'error' },
      ],
    };
    const result = normalizeFileMapPropsFromJson(input);
    expect(result.fileList[0].status).toBe('done');
    expect(result.fileList[1].status).toBe('uploading');
    expect(result.fileList[2].status).toBe('pending');
    expect(result.fileList[3].status).toBe('error');
  });

  it('非法 status 值返回 undefined', () => {
    const input = {
      fileList: [{ name: 'c.txt', uuid: '3', status: 'invalid-status' }],
    };
    const result = normalizeFileMapPropsFromJson(input);
    expect(result.fileList[0].status).toBeUndefined();
  });

  it('errorMessage 非字符串时忽略', () => {
    const input = {
      fileList: [{ name: 'f.txt', uuid: '1', errorMessage: 42 }],
    };
    const result = normalizeFileMapPropsFromJson(input);
    expect(result.fileList[0].errorMessage).toBeUndefined();
  });

  // ─── 过滤与容错 ────────────────────────────────────────────────────────────

  it('fileList 中含非对象项时过滤掉（null、字符串、数字）', () => {
    const input = {
      fileList: [
        null,
        'not-an-object',
        42,
        { name: 'valid.txt', uuid: 'v' },
      ],
    };
    const result = normalizeFileMapPropsFromJson(input);
    expect(result.fileList).toHaveLength(1);
    expect(result.fileList[0].name).toBe('valid.txt');
  });

  it('传入 null 返回空文件列表', () => {
    const result = normalizeFileMapPropsFromJson(null);
    expect(result.fileList).toHaveLength(0);
    expect(result.className).toBeUndefined();
  });

  it('传入 undefined 返回空文件列表', () => {
    const result = normalizeFileMapPropsFromJson(undefined);
    expect(result.fileList).toHaveLength(0);
  });

  it('传入空对象返回空文件列表', () => {
    const result = normalizeFileMapPropsFromJson({});
    expect(result.fileList).toHaveLength(0);
  });

  it('传入原始数字返回空文件列表', () => {
    const result = normalizeFileMapPropsFromJson(42);
    expect(result.fileList).toHaveLength(0);
  });

  it('传入 false 返回空文件列表', () => {
    const result = normalizeFileMapPropsFromJson(false);
    expect(result.fileList).toHaveLength(0);
  });

  it('传入空数组返回空文件列表', () => {
    const result = normalizeFileMapPropsFromJson([]);
    expect(result.fileList).toHaveLength(0);
  });

  // ─── className 边界 ────────────────────────────────────────────────────────

  it('className 为非字符串时忽略', () => {
    const input = { fileList: [], className: 123 };
    const result = normalizeFileMapPropsFromJson(input);
    expect(result.className).toBeUndefined();
  });

  it('className 缺失时为 undefined', () => {
    const input = { fileList: [{ name: 'f.txt', uuid: '1' }] };
    const result = normalizeFileMapPropsFromJson(input);
    expect(result.className).toBeUndefined();
  });

  // ─── fileList 优先于 files ─────────────────────────────────────────────────

  it('同时存在 fileList 和 files 时，fileList 优先', () => {
    const input = {
      fileList: [{ name: 'from-fileList.txt', uuid: '1' }],
      files: [{ name: 'from-files.txt', uuid: '2' }],
    };
    const result = normalizeFileMapPropsFromJson(input);
    expect(result.fileList).toHaveLength(1);
    expect(result.fileList[0].name).toBe('from-fileList.txt');
  });
});
