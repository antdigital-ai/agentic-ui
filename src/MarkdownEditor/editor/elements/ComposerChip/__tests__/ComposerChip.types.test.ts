import { describe, expect, it } from 'vitest';
import {
  ComposerSlashChip,
  LONG_TEXT_PASTE_MIN_CHARS,
  LONG_TEXT_PASTE_MIN_LINES,
  composerChipToText,
  composerFileChipText,
  composerSlashChipText,
  createLongTextChipNode,
  getLongTextStats,
  isSlashChipUnconfigured,
  readComposerChipData,
  shouldCollapsePastedText,
} from '../../../../editor/elements/ComposerChip/types';
import { findUnconfiguredSlashChips } from '../../../../editor/plugins/withComposerChips';

const slashChip: ComposerSlashChip = {
  kind: 'slash',
  version: 1,
  id: 'slash-1',
  name: 'plan',
  section: 'default',
  extensionId: 'builtin',
};

describe('ComposerChip types', () => {
  describe('readComposerChipData 校验', () => {
    it('合法 slash chip 通过校验', () => {
      expect(readComposerChipData(slashChip)).toEqual(slashChip);
    });

    it('非法 section 被拒绝', () => {
      expect(
        readComposerChipData({ ...slashChip, section: 'unknown' as any }),
      ).toBeUndefined();
    });

    it('缺少 version 的 slash chip 被拒绝', () => {
      const { version: _v, ...rest } = slashChip;
      expect(readComposerChipData(rest)).toBeUndefined();
    });

    it('null / 数组 / 字符串被拒绝', () => {
      expect(readComposerChipData(null)).toBeUndefined();
      expect(readComposerChipData([slashChip])).toBeUndefined();
      expect(readComposerChipData('slash')).toBeUndefined();
    });

    it('合法 file chip 通过校验，缺 path 被拒绝', () => {
      const fileChip = {
        kind: 'file' as const,
        id: 'f1',
        path: '/a/b.ts',
        name: 'b.ts',
      };
      expect(readComposerChipData(fileChip)).toEqual(fileChip);
      const { path: _p, ...noPath } = fileChip;
      expect(readComposerChipData(noPath)).toBeUndefined();
    });

    it('合法 symbol chip 通过校验', () => {
      const symbolChip = {
        kind: 'symbol' as const,
        id: 's1',
        name: 'useEffect',
        symbolKind: 'function',
      };
      expect(readComposerChipData(symbolChip)).toEqual(symbolChip);
    });

    it('合法 long-text chip 通过校验', () => {
      const chip = {
        kind: 'long-text' as const,
        id: 'lt1',
        text: 'abc',
        characterCount: 3,
        lineCount: 1,
      };
      expect(readComposerChipData(chip)).toEqual(chip);
    });
  });

  describe('序列化文本', () => {
    it('slash chip → /name（去重复斜杠）', () => {
      expect(composerSlashChipText({ ...slashChip, name: 'plan' })).toBe(
        '/plan',
      );
      expect(composerSlashChipText({ ...slashChip, name: '/plan' })).toBe(
        '/plan',
      );
    });

    it('file chip → @path，含空格用尖括号包裹', () => {
      expect(
        composerFileChipText({
          kind: 'file',
          id: 'f',
          path: 'src/a.ts',
          name: 'a.ts',
        }),
      ).toBe('@src/a.ts');
      expect(
        composerFileChipText({
          kind: 'file',
          id: 'f',
          path: 'my file.ts',
          name: 'my file.ts',
        }),
      ).toBe('@<my file.ts>');
    });

    it('composerChipToText 分发正确', () => {
      expect(composerChipToText(slashChip)).toBe('/plan');
      expect(
        composerChipToText({
          kind: 'symbol',
          id: 's',
          name: 'fn',
          symbolKind: 'function',
        }),
      ).toBe('@fn');
      expect(
        composerChipToText({
          kind: 'long-text',
          id: 'lt',
          text: '原文',
          characterCount: 2,
          lineCount: 1,
        }),
      ).toBe('原文');
    });
  });

  describe('未配置判定（发送前 gate 依据）', () => {
    it('无 payload 视为未配置', () => {
      expect(isSlashChipUnconfigured(slashChip)).toBe(true);
    });

    it('空 payload 对象也视为未配置', () => {
      expect(isSlashChipUnconfigured({ ...slashChip, payload: {} })).toBe(true);
    });

    it('有 payload 视为已配置', () => {
      expect(
        isSlashChipUnconfigured({ ...slashChip, payload: { topic: 'x' } }),
      ).toBe(false);
    });
  });

  describe('长文本统计与折叠阈值', () => {
    it('getLongTextStats 归一化 CRLF', () => {
      const stats = getLongTextStats('a\r\nb\rc');
      expect(stats).toEqual({ characterCount: 5, lineCount: 3 });
    });

    it('短文本不折叠', () => {
      expect(shouldCollapsePastedText('short text')).toBe(false);
    });

    it('空 / 纯空白不折叠', () => {
      expect(shouldCollapsePastedText('')).toBe(false);
      expect(shouldCollapsePastedText('   \n  ')).toBe(false);
    });

    it('达到字符阈值折叠', () => {
      expect(
        shouldCollapsePastedText('a'.repeat(LONG_TEXT_PASTE_MIN_CHARS)),
      ).toBe(true);
    });

    it('达到行数阈值折叠', () => {
      const lines = Array.from(
        { length: LONG_TEXT_PASTE_MIN_LINES },
        (_, i) => `line-${i}`,
      ).join('\n');
      expect(shouldCollapsePastedText(lines)).toBe(true);
    });

    it('createLongTextChipNode 携带统计', () => {
      const node = createLongTextChipNode('a\nb');
      expect(node.type).toBe('composer-chip');
      expect(node.chip.kind).toBe('long-text');
      expect(node.chip.characterCount).toBe(3);
      expect(node.chip.lineCount).toBe(2);
      expect(node.children).toEqual([{ text: '' }]);
    });
  });
});

describe('findUnconfiguredSlashChips（发送前 gate）', () => {
  it('找出文档中所有未配置 slash chip（含嵌套）', () => {
    const nodes: any[] = [
      {
        type: 'paragraph',
        children: [
          { type: 'composer-chip', chip: slashChip, children: [{ text: '' }] },
          { text: ' middle ' },
          {
            type: 'composer-chip',
            chip: { ...slashChip, id: 'slash-2', payload: { ok: 1 } },
            children: [{ text: '' }],
          },
        ],
      },
      {
        type: 'blockquote',
        children: [
          {
            type: 'paragraph',
            children: [
              {
                type: 'composer-chip',
                chip: { ...slashChip, id: 'slash-3' },
                children: [{ text: '' }],
              },
            ],
          },
        ],
      },
    ];
    const result = findUnconfiguredSlashChips(nodes);
    expect(result.map((c) => c.id)).toEqual(['slash-1', 'slash-3']);
  });

  it('配置过的 chip 不被检出', () => {
    const nodes: any[] = [
      {
        type: 'paragraph',
        children: [
          {
            type: 'composer-chip',
            chip: { ...slashChip, payload: { any: true } },
            children: [{ text: '' }],
          },
        ],
      },
    ];
    expect(findUnconfiguredSlashChips(nodes)).toEqual([]);
  });

  it('file chip 不参与 gate', () => {
    const nodes: any[] = [
      {
        type: 'paragraph',
        children: [
          {
            type: 'composer-chip',
            chip: { kind: 'file', id: 'f', path: 'a.ts', name: 'a.ts' },
            children: [{ text: '' }],
          },
        ],
      },
    ];
    expect(findUnconfiguredSlashChips(nodes)).toEqual([]);
  });
});
