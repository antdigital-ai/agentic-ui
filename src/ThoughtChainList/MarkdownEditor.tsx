import React, { useEffect } from 'react';
import {
  MarkdownEditor,
  MarkdownEditorInstance,
  MarkdownEditorProps,
  parserMdToSchema,
} from '../MarkdownEditor';
import { MarkdownFormatter } from '../plugins/formatter';

/**
 * 将内容转换为列表格式的 Markdown
 * @param {string} content - 原始内容
 * @returns {string} 转换后的内容
 */
const toListMarkdown = (content: string) => {
  return content;
};

/**
 * MarkdownEditorUpdate 组件 - Markdown 编辑器更新组件
 *
 * 该组件是对 MarkdownEditor 的封装，提供自动更新和格式化功能。
 * 主要用于在思维链中显示和更新 Markdown 内容。
 *
 * @component
 * @description Markdown 编辑器更新组件，提供自动更新和格式化功能
 * @param {MarkdownEditorProps & {isFinished?: boolean}} props - 组件属性
 * @param {boolean} [props.isFinished] - 内容是否已完成
 * @param {string} [props.initValue] - 初始内容
 * @param {boolean} [props.typewriter] - 是否启用打字机效果
 * @param {MarkdownEditorProps} props - 其他 MarkdownEditor 属性
 *
 * @example
 * ```tsx
 * import { MarkdownEditorUpdate } from './MarkdownEditor';
 *
 * <MarkdownEditorUpdate
 *   initValue="# Hello World"
 *   isFinished={true}
 *   typewriter={false}
 * />
 * ```
 *
 * @returns {React.ReactElement} 渲染的 Markdown 编辑器组件
 *
 * @remarks
 * - 自动格式化 Markdown 内容
 * - 支持内容完成状态检测
 * - 提供打字机效果
 * - 只读模式
 * - 自动更新节点列表
 * - 响应式布局
 */
export const MarkdownEditorUpdate = (
  props: MarkdownEditorProps & {
    isFinished?: boolean;
  },
) => {
  const editorRef = React.useRef<MarkdownEditorInstance>();
  useEffect(() => {
    editorRef.current?.store?.updateNodeList(
      parserMdToSchema(
        toListMarkdown(
          MarkdownFormatter.format(props.initValue || '') || '',
        ).trim(),
        props.plugins,
      ).schema,
    );
  }, [props.initValue]);

  useEffect(() => {
    if (props.isFinished) {
      editorRef.current?.store?.setMDContent(
        MarkdownFormatter.format(props.initValue || ''),
        props.plugins,
      );
    }
  }, [props.isFinished]);

  return (
    <MarkdownEditor
      editorRef={editorRef}
      style={{
        padding: 0,
        width: '100%',
      }}
      toc={false}
      readonly
      contentStyle={{
        padding: 0,
        width: '100%',
      }}
      codeProps={{
        showLineNumbers: false,
      }}
      {...props}
      typewriter={props.typewriter && !props.isFinished}
      initValue=""
    />
  );
};
