import { Node } from 'slate';
import { describe, expect, it } from 'vitest';
import { parserSlateNodeToMarkdown } from '../../../parser/parserSlateNodeToMarkdown';

const slashChip = {
  kind: 'slash' as const,
  version: 1 as const,
  id: 'slash-1',
  name: 'plan',
  section: 'default' as const,
  extensionId: 'builtin',
  payload: { topic: 'refactor' },
};

describe('composer-chip 序列化到 markdown', () => {
  const serialize = (nodes: Node[]): string =>
    parserSlateNodeToMarkdown(nodes as any, '', [{ root: true } as any], []);

  it('slash chip 序列化为 /name', () => {
    const md = serialize([
      {
        type: 'paragraph',
        children: [
          { type: 'composer-chip', chip: slashChip, children: [{ text: '' }] },
          { text: ' 重构一下' },
        ],
      } as any,
    ]);
    expect(md).toContain('/plan');
    expect(md).toContain('重构一下');
  });

  it('file chip 序列化为 @path（含空格加尖括号）', () => {
    const md = serialize([
      {
        type: 'paragraph',
        children: [
          {
            type: 'composer-chip',
            chip: {
              kind: 'file',
              id: 'f1',
              path: 'src/my file.ts',
              name: 'my file.ts',
            },
            children: [{ text: '' }],
          },
        ],
      } as any,
    ]);
    expect(md).toContain('@<src/my file.ts>');
  });

  it('symbol chip 序列化为 @name', () => {
    const md = serialize([
      {
        type: 'paragraph',
        children: [
          {
            type: 'composer-chip',
            chip: {
              kind: 'symbol',
              id: 's1',
              name: 'useHook',
              symbolKind: 'function',
            },
            children: [{ text: '' }],
          },
        ],
      } as any,
    ]);
    expect(md).toContain('@useHook');
  });

  it('多行 long-text chip 序列化为 fenced code 原文', () => {
    const original = 'line1\nline2\n    indented';
    const md = serialize([
      {
        type: 'paragraph',
        children: [
          {
            type: 'composer-chip',
            chip: {
              kind: 'long-text',
              id: 'lt1',
              text: original,
              characterCount: original.length,
              lineCount: 3,
            },
            children: [{ text: '' }],
          },
        ],
      } as any,
    ]);
    expect(md).toContain('```');
    expect(md).toContain('line1');
    expect(md).toContain('    indented');
  });

  it('非法 chip 数据序列化为空（不崩溃）', () => {
    const md = serialize([
      {
        type: 'paragraph',
        children: [
          { type: 'composer-chip', chip: null, children: [{ text: '' }] },
          { text: 'ok' },
        ],
      } as any,
    ]);
    expect(md).toContain('ok');
  });
});
