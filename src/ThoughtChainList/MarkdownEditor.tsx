import React, { useEffect } from 'react';
import {
  MarkdownEditor,
  MarkdownEditorInstance,
  MarkdownEditorProps,
  parserMdToSchema,
} from '../MarkdownEditor';
import { MarkdownFormatter } from '../Plugins/formatter';

/** 思维链中的 MarkdownEditor 封装，自动格式化 + 流式更新 */
export const MarkdownEditorUpdate = (
  props: MarkdownEditorProps & { isFinished?: boolean },
) => {
  const editorRef = React.useRef<MarkdownEditorInstance>();

  useEffect(() => {
    const formatted = MarkdownFormatter.format(props.initValue || '') || '';
    editorRef.current?.store?.updateNodeList(
      parserMdToSchema(formatted.trim(), props.plugins).schema,
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
      style={{ padding: 0, width: '100%' }}
      toc={false}
      readonly
      contentStyle={{ padding: 0, width: '100%' }}
      codeProps={{ showLineNumbers: false }}
      {...props}
      streaming={
        (props.streaming ?? props.typewriter) && !props.isFinished
      }
      initValue=""
    />
  );
};
