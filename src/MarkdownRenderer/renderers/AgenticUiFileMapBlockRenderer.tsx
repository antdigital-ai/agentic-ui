import json5 from 'json5';
import React, { useMemo } from 'react';
import { normalizeFileMapPropsFromJson } from '../../MarkdownEditor/editor/elements/AgenticUiBlocks/agenticUiEmbedUtils';
import partialParse from '../../MarkdownEditor/editor/parser/json-parse';
import { FileMapView } from '../../MarkdownInputField/FileMapView';
import type { FileMapConfig, RendererBlockProps } from '../types';

const extractTextContent = (children: React.ReactNode): string => {
  if (typeof children === 'string') return children;
  if (typeof children === 'number') return String(children);
  if (Array.isArray(children)) return children.map(extractTextContent).join('');
  if (React.isValidElement(children) && children.props?.children) {
    return extractTextContent(children.props.children);
  }
  return '';
};

const parseJsonBody = (code: string): unknown => {
  try {
    return json5.parse(code || '{}');
  } catch {
    try {
      return partialParse(code || '{}');
    } catch {
      return null;
    }
  }
};

/**
 * ```agentic-ui-filemap``` 代码块 → FileMapView
 */
export const AgenticUiFileMapBlockRenderer: React.FC<
  RendererBlockProps & { fileMapConfig?: FileMapConfig }
> = (props) => {
  const { fileMapConfig, ...rest } = props;
  const code = useMemo(
    () => extractTextContent(rest.children),
    [rest.children],
  );
  const parsed = useMemo(() => parseJsonBody(code), [code]);
  const { fileList, className } = useMemo(
    () => normalizeFileMapPropsFromJson(parsed, fileMapConfig?.normalizeFile),
    [parsed, fileMapConfig?.normalizeFile],
  );
  const fileMap = useMemo(
    () => new Map(fileList.map((f) => [f.uuid || f.name, f])),
    [fileList],
  );

  if (parsed === null) {
    return (
      <pre
        data-testid="agentic-ui-filemap-fallback"
        style={{
          background: 'rgb(242, 241, 241)',
          padding: '1em',
          borderRadius: '0.5em',
          margin: '0.75em 0',
          fontSize: '0.8em',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all',
        }}
      >
        <code>{code}</code>
      </pre>
    );
  }

  if (fileMapConfig?.hide) return null;

  return (
    <div data-testid="agentic-ui-filemap-block" style={{ margin: '0.75em 0' }}>
      <FileMapView
        fileMap={fileMap}
        className={className}
        onPreview={fileMapConfig?.onPreview}
        itemRender={fileMapConfig?.itemRender}
      />
    </div>
  );
};

AgenticUiFileMapBlockRenderer.displayName = 'AgenticUiFileMapBlockRenderer';
