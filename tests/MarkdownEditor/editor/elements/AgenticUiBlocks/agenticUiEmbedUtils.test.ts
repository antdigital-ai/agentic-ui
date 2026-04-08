import { describe, expect, it } from 'vitest';
import {
  normalizeTaskListPropsFromJson,
  normalizeToolUseBarPropsFromJson,
} from '../../../../../src/MarkdownEditor/editor/elements/AgenticUiBlocks/agenticUiEmbedUtils';

describe('agenticUiEmbedUtils', () => {
  describe('normalizeTaskListPropsFromJson', () => {
    it('items[].content 为数组时 join 为多行 (39)', () => {
      const r = normalizeTaskListPropsFromJson({
        items: [
          {
            key: 'a',
            status: 'success',
            content: ['line1', 'line2'],
          },
        ],
      });
      expect(r.items[0].content).toBe('line1\nline2');
    });

    it('variant 为 default 时使用 default', () => {
      const r = normalizeTaskListPropsFromJson({
        variant: 'default',
        items: [{ key: 'k', status: 'pending', content: 'x' }],
      });
      expect(r.variant).toBe('default');
    });

    it('顶层为数组时解析为 items', () => {
      const r = normalizeTaskListPropsFromJson([
        { key: '1', status: 'error', content: 'c' },
      ]);
      expect(r.items).toHaveLength(1);
      expect(r.items[0].key).toBe('1');
    });
  });

  describe('normalizeToolUseBarPropsFromJson', () => {
    it('解析 tools 数组', () => {
      const r = normalizeToolUseBarPropsFromJson({
        tools: [
          {
            id: 't1',
            toolName: 'read',
            toolTarget: '/a',
            status: 'success',
          },
        ],
      });
      expect(r.tools).toHaveLength(1);
      expect(r.tools[0].id).toBe('t1');
      expect(r.tools[0].toolName).toBe('read');
    });

    it('旧版 items 映射为 ToolCall', () => {
      const r = normalizeToolUseBarPropsFromJson({
        items: [{ text: 'suggest', key: 'k0' }],
      });
      expect(r.tools.length).toBeGreaterThan(0);
      expect(r.tools[0].toolName).toBe('suggest');
    });

    it('light 与 disableAnimation', () => {
      const r = normalizeToolUseBarPropsFromJson({
        tools: [{ id: 'x', toolName: 'n', toolTarget: '', status: 'idle' }],
        light: true,
        disableAnimation: true,
      });
      expect(r.light).toBe(true);
      expect(r.disableAnimation).toBe(true);
    });
  });
});
