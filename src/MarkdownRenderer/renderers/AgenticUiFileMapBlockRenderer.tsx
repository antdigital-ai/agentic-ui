import React, { useMemo } from 'react';
import { normalizeFileMapPropsFromJson } from '../../MarkdownEditor/editor/elements/AgenticUiBlocks/agenticUiEmbedUtils';
import { FileMapView } from '../../MarkdownInputField/FileMapView';
import { extractBlockTextContent } from '../extractBlockTextContent';
import type { FileMapConfig, RendererBlockProps } from '../types';
import { parseJsonBody } from './utils/parseJsonBody';
import { RendererJsonFallback } from './utils/RendererJsonFallback';

/**
 * ```agentic-ui-filemap``` 代码块 → FileMapView
 */
export const AgenticUiFileMapBlockRenderer: React.FC<
  RendererBlockProps & { fileMapConfig?: FileMapConfig }
> = (props) => {
  const { fileMapConfig, ...rest } = props;
  const code = useMemo(
    () => extractBlockTextContent(rest.children),
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
      <RendererJsonFallback testId="agentic-ui-filemap-fallback" code={code} />
    );
  }

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
