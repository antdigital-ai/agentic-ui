import { Modal } from 'antd';
import React from 'react';
import { Node } from 'slate';

import type { FootnoteDefinitionNode } from '../../../el';
import type { MarkdownEditorProps } from '../../../types';

export interface FncLeafMobileModalProps {
  open: boolean;
  onClose: () => void;
  displayLabel: string;
  identifier?: string;
  definition?: FootnoteDefinitionNode;
  leafUrl?: string;
  linkConfig?: MarkdownEditorProps['linkConfig'];
  fncProps?: MarkdownEditorProps['fncProps'];
}

const resolveDefinitionBody = (definition?: FootnoteDefinitionNode): string => {
  if (!definition) {
    return '';
  }
  if (definition.value) {
    return definition.value;
  }
  try {
    return Node.string(definition);
  } catch {
    return '';
  }
};

export const FncLeafMobileModal: React.FC<FncLeafMobileModalProps> = ({
  open,
  onClose,
  displayLabel,
  identifier,
  definition,
  leafUrl,
  linkConfig,
  fncProps,
}) => {
  const bodyText = resolveDefinitionBody(definition);
  const url = definition?.url ?? leafUrl;

  const defaultContent = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {bodyText ? (
        <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {bodyText}
        </div>
      ) : (
        <div style={{ color: 'var(--color-gray-text-secondary, #666)' }}>
          {identifier
            ? `未找到脚注「${identifier}」的定义内容`
            : '暂无脚注说明'}
        </div>
      )}
      {url ? (
        <a
          href={url}
          target={linkConfig?.openInNewTab === false ? undefined : '_blank'}
          rel="noreferrer"
          onClick={(e) => {
            if (linkConfig?.onClick) {
              const res = linkConfig.onClick(url);
              if (res === false) {
                e.preventDefault();
              }
            }
          }}
          style={{ color: 'var(--color-primary, #1677ff)' }}
        >
          查看来源
        </a>
      ) : null}
    </div>
  );

  const modalBody =
    fncProps?.renderMobileModal?.({
      identifier,
      displayLabel,
      definition,
      defaultContent,
    }) ?? defaultContent;

  return (
    <Modal
      open={open}
      title={displayLabel ? `脚注 ${displayLabel}` : '脚注'}
      footer={null}
      onCancel={onClose}
      destroyOnClose
      centered
    >
      {modalBody}
    </Modal>
  );
};
