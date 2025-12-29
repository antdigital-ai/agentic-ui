import { renderHook } from '@testing-library/react';
import React, { useMemo } from 'react';
import { describe, expect, it } from 'vitest';
import { MarkdownEditorPlugin, parserMdToSchema } from '../../../src';
import type { Elements } from '../../../el';

const useCreateComponentPlugin = (tagName: string, targetType: string) => {
  const matchStr = `<${tagName}`;
  const spliceStr = `</${tagName}>`;

  const loopMatch = (node: any) => {
    if (
      node.type === 'html' &&
      (node.value.includes(matchStr) || node.value.includes(spliceStr))
    ) {
      return true;
    }
    return false;
  };
  const loopConvert = (node: any) => {
    if (node.type === 'html' && node.value.includes(matchStr)) {
      const context = node.value.match(/context=["'](.*)["']/)?.[1];
      return {
        type: targetType,
        context,
        children: [
          {
            text: '  ',
          },
        ],
        value: node.value,
      } as Elements;
    }
    if (node.type === 'html' && node.value.includes(spliceStr)) {
      return {
        text: '',
      };
    }
    if (node.children) {
      return {
        ...node,
        children: node.children.map(loopConvert).filter(Boolean),
      };
    }
    return node;
  };
  const customComponentPlugin: MarkdownEditorPlugin = {
    parseMarkdown: [
      {
        match: (node: any) => {
          return loopMatch(node);
        },
        convert: (node: any) => {
          return loopConvert(node);
        },
      },
    ],
    toMarkdown: [
      {
        match: (node: Elements) => {
          return node.type === targetType;
        },
        convert: (node: Elements) => {
          return {
            type: 'html',
            value: `<${tagName} context='${(node as any).context}'></${tagName}>`,
          };
        },
      },
    ],
    elements: {
      [targetType]: ({ attributes, children }: any) => {
        return (
          <span
            {...attributes}
            contentEditable={false}
            style={{
              color: 'red',
              display: 'inline-block',
              userSelect: 'none',
            }}
          >
            <div style={{ display: 'none' }}>{children}</div>^
          </span>
        );
      },
    },
  };
  return useMemo(() => {
    return customComponentPlugin;
  }, []);
};

describe('useCreateComponentPlugin', () => {
  it('should create a plugin that can parse markdown with custom tags', () => {
    // 渲染hook
    const { result } = renderHook(() =>
      useCreateComponentPlugin('md-tag', 'customTag'),
    );
    const plugin = result.current as MarkdownEditorPlugin;

    // 测试parseMarkdown功能
    const mdNode = {
      type: 'html',
      value: '<md-tag context="test"/>',
    };

    // 测试match函数
    expect(plugin.parseMarkdown?.[0].match(mdNode)).toBe(true);

    // 测试convert函数
    const converted = plugin.parseMarkdown?.[0].convert(mdNode);
    expect(converted).toEqual({
      type: 'customTag',
      context: 'test',
      children: [{ text: '  ' }],
      value: '<md-tag context="test"/>',
    });
  });

  it('should convert slate nodes back to markdown', () => {
    const { result } = renderHook(() =>
      useCreateComponentPlugin('md-tag', 'customTag'),
    );
    const plugin = result.current as MarkdownEditorPlugin;

    const slateNode = {
      type: 'customTag',
      context: 'test',
      alt: '',
      children: [{ text: '  ' }],
    } as any;

    // 测试match函数
    expect(plugin.toMarkdown?.[0].match(slateNode)).toBe(true);

    // 测试convert函数
    const converted = plugin.toMarkdown?.[0].convert(slateNode);
    expect(converted).toEqual({
      type: 'html',
      value: "<md-tag context='test'></md-tag>",
    });
  });

  it('should render custom element correctly', () => {
    const { result } = renderHook(() =>
      useCreateComponentPlugin('md-tag', 'customTag'),
    );
    const plugin = result.current as MarkdownEditorPlugin;

    const CustomElement = plugin.elements?.customTag;
    expect(CustomElement).toBeDefined();
  });

  it('should handle multiple plugins together', () => {
    const { result: tagResult } = renderHook(() =>
      useCreateComponentPlugin('md-tag', 'customTag'),
    );
    const { result: fieldResult } = renderHook(() =>
      useCreateComponentPlugin('md-field', 'customField'),
    );

    const mdString =
      '123<md-tag context="时间"/>789 <md-field context="test"/>';
    const schema = parserMdToSchema(mdString, [
      tagResult.current as MarkdownEditorPlugin,
      fieldResult.current as MarkdownEditorPlugin,
    ]).schema;

    expect(schema).toBeDefined();
    expect(Array.isArray(schema)).toBe(true);
    expect(schema.length).toBeGreaterThan(0);
  });

  it('should handle closing tags correctly', () => {
    const { result } = renderHook(() =>
      useCreateComponentPlugin('md-tag', 'customTag'),
    );
    const plugin = result.current as MarkdownEditorPlugin;

    const mdNode = {
      type: 'html',
      value: '</md-tag>',
    };

    const converted = plugin.parseMarkdown?.[0].convert(mdNode);
    expect(converted).toEqual({
      text: '',
    });
  });
});
