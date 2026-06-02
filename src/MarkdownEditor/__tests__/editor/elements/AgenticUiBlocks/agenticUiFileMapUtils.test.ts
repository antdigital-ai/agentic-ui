import { describe, expect, it } from 'vitest';
import { normalizeFileMapPropsFromJson } from '../../../../editor/elements/AgenticUiBlocks/agenticUiEmbedUtils';

describe('normalizeFileMapPropsFromJson', () => {
  it('从 fileList 字段解析文件列表', () => {
    const r = normalizeFileMapPropsFromJson({
      fileList: [
        { name: 'a.ts', type: 'text/typescript', url: '/a.ts', uuid: 'u1' },
        { name: 'b.css', type: 'text/css', url: '/b.css', uuid: 'u2' },
      ],
    });
    expect(r.fileList).toHaveLength(2);
    expect(r.fileList[0].name).toBe('a.ts');
    expect(r.fileList[0].uuid).toBe('u1');
    expect(r.fileList[1].name).toBe('b.css');
  });

  it('从 files 字段解析（别名）', () => {
    const r = normalizeFileMapPropsFromJson({
      files: [{ name: 'readme.md', uuid: 'f1' }],
    });
    expect(r.fileList).toHaveLength(1);
    expect(r.fileList[0].name).toBe('readme.md');
  });

  it('顶层为数组时解析为文件列表', () => {
    const r = normalizeFileMapPropsFromJson([
      { name: 'x.js', uuid: 'x1' },
      { name: 'y.js', uuid: 'y1' },
    ]);
    expect(r.fileList).toHaveLength(2);
    expect(r.fileList[0].name).toBe('x.js');
  });

  it('uuid 回退到 id，再回退到 file-{index}', () => {
    const r = normalizeFileMapPropsFromJson({
      fileList: [
        { name: 'a', uuid: 'u1' },
        { name: 'b', id: 'i2' },
        { name: 'c' },
      ],
    });
    expect(r.fileList[0].uuid).toBe('u1');
    expect(r.fileList[1].uuid).toBe('i2');
    expect(r.fileList[2].uuid).toBe('file-2');
  });

  it('name 缺失时回退到 file-{index}', () => {
    const r = normalizeFileMapPropsFromJson({
      fileList: [{ uuid: 'u1' }, { name: 'b.ts' }],
    });
    expect(r.fileList[0].name).toBe('file-0');
    expect(r.fileList[1].name).toBe('b.ts');
  });

  it('type 缺失时默认 application/octet-stream', () => {
    const r = normalizeFileMapPropsFromJson({
      fileList: [{ name: 'unknown', uuid: 'u1' }],
    });
    expect(r.fileList[0].type).toBe('application/octet-stream');
  });

  it('size 字段传递', () => {
    const r = normalizeFileMapPropsFromJson({
      fileList: [{ name: 'big.bin', uuid: 'u1', size: 1024 }],
    });
    expect(r.fileList[0].size).toBe(1024);
  });

  it('size 非数字时为 undefined', () => {
    const r = normalizeFileMapPropsFromJson({
      fileList: [{ name: 'a', uuid: 'u1', size: 'large' }],
    });
    expect(r.fileList[0].size).toBeUndefined();
  });

  it('status 仅接受合法值', () => {
    const r = normalizeFileMapPropsFromJson({
      fileList: [
        { name: 'a', uuid: 'u1', status: 'uploading' },
        { name: 'b', uuid: 'u2', status: 'done' },
        { name: 'c', uuid: 'u3', status: 'error' },
        { name: 'd', uuid: 'u4', status: 'pending' },
        { name: 'e', uuid: 'u5', status: 'invalid' },
      ],
    });
    expect(r.fileList[0].status).toBe('uploading');
    expect(r.fileList[1].status).toBe('done');
    expect(r.fileList[2].status).toBe('error');
    expect(r.fileList[3].status).toBe('pending');
    expect(r.fileList[4].status).toBeUndefined();
  });

  it('previewUrl 和 url 传递', () => {
    const r = normalizeFileMapPropsFromJson({
      fileList: [
        {
          name: 'img.png',
          uuid: 'u1',
          url: '/img.png',
          previewUrl: '/thumb.png',
        },
      ],
    });
    expect(r.fileList[0].url).toBe('/img.png');
    expect(r.fileList[0].previewUrl).toBe('/thumb.png');
  });

  it('errorMessage 传递', () => {
    const r = normalizeFileMapPropsFromJson({
      fileList: [
        { name: 'a', uuid: 'u1', status: 'error', errorMessage: 'timeout' },
      ],
    });
    expect(r.fileList[0].errorMessage).toBe('timeout');
  });

  it('errorMessage 非字符串时为 undefined', () => {
    const r = normalizeFileMapPropsFromJson({
      fileList: [{ name: 'a', uuid: 'u1', errorMessage: 42 }],
    });
    expect(r.fileList[0].errorMessage).toBeUndefined();
  });

  it('className 从根对象提取', () => {
    const r = normalizeFileMapPropsFromJson({
      fileList: [{ name: 'a', uuid: 'u1' }],
      className: 'my-class',
    });
    expect(r.className).toBe('my-class');
  });

  it('className 非字符串时为 undefined', () => {
    const r = normalizeFileMapPropsFromJson({
      fileList: [{ name: 'a', uuid: 'u1' }],
      className: 123,
    });
    expect(r.className).toBeUndefined();
  });

  it('normalizeFile 回调可自定义文件项', () => {
    const r = normalizeFileMapPropsFromJson(
      { fileList: [{ name: 'a', uuid: 'u1', custom: 'yes' }] },
      (raw, defaultFile) => ({
        ...defaultFile,
        name: `prefix-${defaultFile.name}`,
      }),
    );
    expect(r.fileList).toHaveLength(1);
    expect(r.fileList[0].name).toBe('prefix-a');
  });

  it('normalizeFile 返回 null 时过滤该条目', () => {
    const r = normalizeFileMapPropsFromJson(
      { fileList: [{ name: 'a', uuid: 'u1' }, { name: 'b', uuid: 'u2' }] },
      (raw) => (raw.name === 'a' ? null : { ...raw, name: raw.name as string, type: 'application/octet-stream', uuid: raw.uuid as string }),
    );
    expect(r.fileList).toHaveLength(1);
    expect(r.fileList[0].name).toBe('b');
  });

  it('null/undefined 条目被过滤', () => {
    const r = normalizeFileMapPropsFromJson({
      fileList: [null, { name: 'a', uuid: 'u1' }, undefined, { name: 'b', uuid: 'u2' }],
    });
    expect(r.fileList).toHaveLength(2);
  });

  it('空输入返回空列表', () => {
    expect(normalizeFileMapPropsFromJson(null).fileList).toEqual([]);
    expect(normalizeFileMapPropsFromJson(undefined).fileList).toEqual([]);
    expect(normalizeFileMapPropsFromJson({}).fileList).toEqual([]);
    expect(normalizeFileMapPropsFromJson([]).fileList).toEqual([]);
    expect(normalizeFileMapPropsFromJson(42).fileList).toEqual([]);
    expect(normalizeFileMapPropsFromJson('string').fileList).toEqual([]);
  });
});
