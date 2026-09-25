import { describe, expect, it, vi } from 'vitest';
import { parserMdToSchema } from '../parserMdToSchema';
import type { MarkdownEditorPlugin } from '../../../plugin';

describe('parserMdToSchema 分支覆盖', () => {
  it('istanbul one-miss: 过滤 html+isConfig 节点', () => {
    const plugin: MarkdownEditorPlugin = {
      parseMarkdown: [
        {
          match: () => true,
          convert: () =>
            ({
              type: 'code',
              language: 'html',
              isConfig: true,
              children: [{ text: '' }],
            }) as any,
        },
      ],
    };

    const result = parserMdToSchema('# heading', [plugin]);

    expect(
      result.schema.some(
        (s: any) => s.language === 'html' && s.isConfig,
      ),
    ).toBe(false);
  });

  it('istanbul one-miss: 过滤无 type 且无 text 节点', () => {
    const convertFn = vi.fn(() => ({}) as any);
    const plugin: MarkdownEditorPlugin = {
      parseMarkdown: [{ match: () => true, convert: convertFn }],
    };

    const result = parserMdToSchema('x', [plugin]);

    expect(convertFn).toHaveBeenCalled();
    expect(result.schema).toHaveLength(0);
  });
});
