import React from 'react';
import { RenderElementProps } from 'slate-react';
import { FileMapView } from '../../../../MarkdownInputField/FileMapView';
import { normalizeFileMapPropsFromJson } from './agenticUiEmbedUtils';

export const AgenticUiFileMapBlock: React.FC<RenderElementProps> = ({
  attributes,
  children,
  element,
}) => {
  const { fileList, className } = normalizeFileMapPropsFromJson(
    (element as any).value,
  );
  const fileMap = new Map(fileList.map((f) => [f.uuid || f.name, f]));

  return (
    <div
      {...attributes}
      contentEditable={false}
      data-testid="agentic-ui-filemap-block"
      style={{ margin: '0.75em 0' }}
    >
      <FileMapView fileMap={fileMap} className={className} />
      <span
        data-testid="agentic-ui-filemap-hidden-children"
        style={{ display: 'none' }}
      >
        {children}
      </span>
    </div>
  );
};

AgenticUiFileMapBlock.displayName = 'AgenticUiFileMapBlock';

export const ReadonlyAgenticUiFileMapBlock = React.memo(AgenticUiFileMapBlock);
ReadonlyAgenticUiFileMapBlock.displayName = 'ReadonlyAgenticUiFileMapBlock';
