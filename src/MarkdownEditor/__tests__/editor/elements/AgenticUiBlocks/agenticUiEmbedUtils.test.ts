import { describe, expect, it } from 'vitest';
import {
  normalizeTaskListPropsFromJson,
  normalizeToolUseBarPropsFromJson,
} from '../../../../editor/elements/AgenticUiBlocks/agenticUiEmbedUtils';

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

    it('variant 缺省时为 simple', () => {
      const r = normalizeTaskListPropsFromJson({
        items: [{ key: 'k', status: 'pending', content: 'x' }],
      });
      expect(r.variant).toBe('simple');
    });

    it('variant 非法时回退为 simple', () => {
      const r = normalizeTaskListPropsFromJson({
        variant: 'unknown',
        items: [{ key: 'k', status: 'pending', content: 'x' }],
      });
      expect(r.variant).toBe('simple');
    });

    it('key 缺失的条目被过滤', () => {
      const r = normalizeTaskListPropsFromJson({
        items: [
          { status: 'pending', content: 'no-key' },
          { key: 'valid', status: 'pending', content: 'ok' },
        ],
      });
      expect(r.items).toHaveLength(1);
      expect(r.items[0].key).toBe('valid');
    });

    it('status 非法时回退为 pending', () => {
      const r = normalizeTaskListPropsFromJson({
        items: [{ key: 'k', status: 'invalid', content: 'x' }],
      });
      expect(r.items[0].status).toBe('pending');
    });

    it('status 缺失时回退为 pending', () => {
      const r = normalizeTaskListPropsFromJson({
        items: [{ key: 'k', content: 'x' }],
      });
      expect(r.items[0].status).toBe('pending');
    });

    it('key 为数字时转为字符串', () => {
      const r = normalizeTaskListPropsFromJson({
        items: [{ key: 42, status: 'success', content: 'x' }],
      });
      expect(r.items[0].key).toBe('42');
    });

    it('key 为 null 时条目被过滤', () => {
      const r = normalizeTaskListPropsFromJson({
        items: [{ key: null, status: 'pending', content: 'x' }],
      });
      expect(r.items).toHaveLength(0);
    });

    it('null/undefined 条目被过滤', () => {
      const r = normalizeTaskListPropsFromJson({
        items: [null, { key: 'a', status: 'success', content: 'c' }, undefined],
      });
      expect(r.items).toHaveLength(1);
    });

    it('title 为 null 时转为 undefined', () => {
      const r = normalizeTaskListPropsFromJson({
        items: [{ key: 'k', status: 'pending', content: 'x', title: null }],
      });
      expect(r.items[0].title).toBeUndefined();
    });

    it('className 从根对象提取', () => {
      const r = normalizeTaskListPropsFromJson({
        items: [{ key: 'k', status: 'pending', content: 'x' }],
        className: 'my-task-list',
      });
      expect(r.className).toBe('my-task-list');
    });

    it('className 非字符串时为 undefined', () => {
      const r = normalizeTaskListPropsFromJson({
        items: [{ key: 'k', status: 'pending', content: 'x' }],
        className: 123,
      });
      expect(r.className).toBeUndefined();
    });

    it('空输入返回空 items', () => {
      expect(normalizeTaskListPropsFromJson(null).items).toEqual([]);
      expect(normalizeTaskListPropsFromJson(undefined).items).toEqual([]);
      expect(normalizeTaskListPropsFromJson({}).items).toEqual([]);
      expect(normalizeTaskListPropsFromJson(42).items).toEqual([]);
      expect(normalizeTaskListPropsFromJson('string').items).toEqual([]);
    });

    it('content 为 undefined 时 normalizeTaskContent 处理', () => {
      const r = normalizeTaskListPropsFromJson({
        items: [{ key: 'k', status: 'pending' }],
      });
      expect(r.items[0].content).toBeDefined();
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

    it('id 回退到 key，再回退到空字符串（条目被过滤）', () => {
      const r = normalizeToolUseBarPropsFromJson({
        tools: [
          { toolName: 'no-id', toolTarget: '', status: 'idle' },
          { key: 'from-key', toolName: 'has-key', toolTarget: '', status: 'idle' },
        ],
      });
      // 没有 id 也没有 key 的条目 id 为空字符串 → toolFromRecord 返回 null → 被过滤
      expect(r.tools).toHaveLength(1);
      expect(r.tools[0].id).toBe('from-key');
    });

    it('status 非法时回退为 idle', () => {
      const r = normalizeToolUseBarPropsFromJson({
        tools: [{ id: 't', toolName: 'n', toolTarget: '', status: 'unknown' }],
      });
      expect(r.tools[0].status).toBe('idle');
    });

    it('status 缺失时回退为 idle', () => {
      const r = normalizeToolUseBarPropsFromJson({
        tools: [{ id: 't', toolName: 'n', toolTarget: '' }],
      });
      expect(r.tools[0].status).toBe('idle');
    });

    it('toolName/toolTarget 为 null 时转为空字符串', () => {
      const r = normalizeToolUseBarPropsFromJson({
        tools: [{ id: 't', toolName: null, toolTarget: null, status: 'idle' }],
      });
      expect(r.tools[0].toolName).toBe('');
      expect(r.tools[0].toolTarget).toBe('');
    });

    it('time 和 errorMessage 字段传递', () => {
      const r = normalizeToolUseBarPropsFromJson({
        tools: [
          {
            id: 't',
            toolName: 'n',
            toolTarget: '',
            status: 'error',
            time: '2.3s',
            errorMessage: 'timeout',
          },
        ],
      });
      expect(r.tools[0].time).toBe('2.3s');
      expect(r.tools[0].errorMessage).toBe('timeout');
    });

    it('time 非 null/undefined 时转为字符串，errorMessage 非字符串时为 undefined', () => {
      const r = normalizeToolUseBarPropsFromJson({
        tools: [
          {
            id: 't',
            toolName: 'n',
            toolTarget: '',
            status: 'idle',
            time: 123,
            errorMessage: 456,
          },
        ],
      });
      expect(r.tools[0].time).toBe('123');
      expect(r.tools[0].errorMessage).toBeUndefined();
    });

    it('type 字段：summary/normal/任意字符串均可', () => {
      const r = normalizeToolUseBarPropsFromJson({
        tools: [
          { id: 'a', toolName: 'n', toolTarget: '', status: 'idle', type: 'summary' },
          { id: 'b', toolName: 'n', toolTarget: '', status: 'idle', type: 'normal' },
          { id: 'c', toolName: 'n', toolTarget: '', status: 'idle', type: 'custom-type' },
        ],
      });
      expect(r.tools[0].type).toBe('summary');
      expect(r.tools[1].type).toBe('normal');
      expect(r.tools[2].type).toBe('custom-type');
    });

    it('type 非字符串时为 undefined', () => {
      const r = normalizeToolUseBarPropsFromJson({
        tools: [{ id: 't', toolName: 'n', toolTarget: '', status: 'idle', type: 42 }],
      });
      expect(r.tools[0].type).toBeUndefined();
    });

    it('testId 字段传递', () => {
      const r = normalizeToolUseBarPropsFromJson({
        tools: [{ id: 't', toolName: 'n', toolTarget: '', status: 'idle', testId: 'my-test' }],
      });
      expect(r.tools[0].testId).toBe('my-test');
    });

    it('testId 非字符串时为 undefined', () => {
      const r = normalizeToolUseBarPropsFromJson({
        tools: [{ id: 't', toolName: 'n', toolTarget: '', status: 'idle', testId: 123 }],
      });
      expect(r.tools[0].testId).toBeUndefined();
    });

    it('className 从根对象提取', () => {
      const r = normalizeToolUseBarPropsFromJson({
        tools: [{ id: 't', toolName: 'n', toolTarget: '', status: 'idle' }],
        className: 'my-toolbar',
      });
      expect(r.className).toBe('my-toolbar');
    });

    it('light/disableAnimation 为 false 或缺失时为 undefined', () => {
      const r = normalizeToolUseBarPropsFromJson({
        tools: [{ id: 't', toolName: 'n', toolTarget: '', status: 'idle' }],
        light: false,
        disableAnimation: false,
      });
      expect(r.light).toBeUndefined();
      expect(r.disableAnimation).toBeUndefined();
    });

    it('空输入返回空 tools', () => {
      expect(normalizeToolUseBarPropsFromJson(null).tools).toEqual([]);
      expect(normalizeToolUseBarPropsFromJson(undefined).tools).toEqual([]);
      expect(normalizeToolUseBarPropsFromJson({}).tools).toEqual([]);
      expect(normalizeToolUseBarPropsFromJson(42).tools).toEqual([]);
      expect(normalizeToolUseBarPropsFromJson('string').tools).toEqual([]);
    });

    it('null/undefined 条目在 tools 数组中被过滤', () => {
      const r = normalizeToolUseBarPropsFromJson({
        tools: [null, { id: 't', toolName: 'n', toolTarget: '', status: 'idle' }, undefined],
      });
      expect(r.tools).toHaveLength(1);
    });

    it('旧版 items 中无 text 的条目被过滤', () => {
      const r = normalizeToolUseBarPropsFromJson({
        items: [{ key: 'k0' }, { text: 'valid', key: 'k1' }],
      });
      expect(r.tools).toHaveLength(1);
      expect(r.tools[0].toolName).toBe('valid');
    });
  });
});
