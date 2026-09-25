/**
 * agenticUiEmbedUtils residual：toolusebar / filemap 全矩阵。
 */
import { describe, expect, it } from 'vitest';
import {
  normalizeFileMapPropsFromJson,
  normalizeTaskListPropsFromJson,
  normalizeToolUseBarPropsFromJson,
} from '../agenticUiEmbedUtils';

describe('agenticUiEmbedUtils residual embed matrices', () => {
  it('task：数组根、variant、className、过滤无 key', () => {
    expect(normalizeTaskListPropsFromJson([{ key: 'a' }]).items).toHaveLength(
      1,
    );
    const withVariant = normalizeTaskListPropsFromJson({
      items: [{ key: '1', title: 'T', status: 'error' }],
      variant: 'default',
      className: 'c',
    });
    expect(withVariant.variant).toBe('default');
    expect(withVariant.className).toBe('c');
    expect(withVariant.items[0].status).toBe('error');

    expect(
      normalizeTaskListPropsFromJson({
        items: [null, 'x', { title: 'no-key' }],
      }).items,
    ).toEqual([]);
  });

  it('toolusebar：tools / 旧 items；status / type / 假值字段', () => {
    expect(normalizeToolUseBarPropsFromJson(null).tools).toEqual([]);
    expect(normalizeToolUseBarPropsFromJson([]).tools).toEqual([]);

    const fromTools = normalizeToolUseBarPropsFromJson({
      tools: [
        { id: '1', toolName: 't', status: 'success', type: 'summary' },
        { key: '2', toolName: 'u', status: 'bad' },
        { toolName: 'no-id' },
        null,
      ],
      className: 'x',
      light: true,
      disableAnimation: true,
    });
    expect(fromTools.tools).toHaveLength(2);
    expect(fromTools.tools[0].status).toBe('success');
    expect(fromTools.tools[1].id).toBe('2');
    expect(fromTools.tools[1].status).toBe('idle');
    expect(fromTools.light).toBe(true);
    expect(fromTools.disableAnimation).toBe(true);

    const fromItems = normalizeToolUseBarPropsFromJson({
      items: [{ text: 'A', key: 'k1' }, { text: 'B' }, { foo: 1 }],
    });
    expect(fromItems.tools.map((t) => t.toolName)).toEqual(['A', 'B']);
  });

  it('filemap：fileList / files / 数组根；normalizeFile 过滤；status', () => {
    expect(normalizeFileMapPropsFromJson(null).fileList).toEqual([]);
    const fromFiles = normalizeFileMapPropsFromJson({
      files: [{ name: 'a.txt', status: 'done', size: 3 }],
      className: 'fm',
    });
    expect(fromFiles.fileList[0].name).toBe('a.txt');
    expect(fromFiles.fileList[0].status).toBe('done');
    expect(fromFiles.className).toBe('fm');

    const fromList = normalizeFileMapPropsFromJson({
      fileList: [{ url: 'u', id: 'i1' }],
    });
    expect(fromList.fileList[0].uuid).toBe('i1');

    const arr = normalizeFileMapPropsFromJson([{ name: 'x' }]);
    expect(arr.fileList).toHaveLength(1);

    const filtered = normalizeFileMapPropsFromJson(
      { files: [{ name: 'keep' }, { name: 'drop' }] },
      (raw, def) => (raw.name === 'drop' ? null : def),
    );
    expect(filtered.fileList.map((f) => f.name)).toEqual(['keep']);
  });
});
