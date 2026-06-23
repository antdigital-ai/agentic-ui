import { ConfigProvider } from 'antd';
import classNames from 'clsx';
import React, { CSSProperties, useContext, useMemo, useState } from 'react';
import { RenderLeafProps } from 'slate-react';

import { useRefFunction } from '../../../../Hooks/useRefFunction';
import { isMobileDevice } from '../../../../MarkdownInputField/AttachmentButton/utils';
import { MarkdownEditorProps } from '../../../types';
import { EditorStoreContext } from '../../editorStoreContext';
import {
  extractFootnoteDefinitionIdentifier,
  formatFootnoteRefDisplayLabel,
  resolveFootnoteRefIdentifier,
} from '../../utils/footnoteDisplay';
import { dragStart } from '../index';
import { FncLeafMobileModal } from './FncLeafMobileModal';

interface FncLeafProps extends RenderLeafProps {
  fncProps: MarkdownEditorProps['fncProps'];
  linkConfig?: MarkdownEditorProps['linkConfig'];
  style?: CSSProperties;
  prefixClassName?: string;
}

/**
 * FncLeaf：脚注引用（fnc）与行内脚注定义标记（fnd）的叶子渲染
 */
export const FncLeaf = ({
  attributes,
  children,
  leaf,
  fncProps,
  linkConfig,
  style = {},
  prefixClassName = '',
}: FncLeafProps) => {
  const context = useContext(ConfigProvider.ConfigContext);
  const mdEditorBaseClass = context?.getPrefixCls('agentic-md-editor-content');
  const isMobile = isMobileDevice();
  const hasFnc = leaf.fnc || leaf.identifier;
  const store = useContext(EditorStoreContext)?.store;
  const [mobileModalOpen, setMobileModalOpen] = useState(false);

  const resolvedIdentifier = useMemo(
    () => resolveFootnoteRefIdentifier(leaf.text, leaf.identifier),
    [leaf.text, leaf.identifier],
  );

  const footnoteDefinition = useMemo(() => {
    if (!resolvedIdentifier || !store?.footnoteDefinitionMap?.get) {
      return undefined;
    }
    return store.footnoteDefinitionMap.get(resolvedIdentifier);
  }, [resolvedIdentifier, store?.footnoteDefinitionMap]);

  const fncClassName = useMemo(
    () =>
      classNames({
        [`${mdEditorBaseClass}-fnc`]: leaf.fnc,
        [`${mdEditorBaseClass}-fnd`]: leaf.fnd,
      }),
    [prefixClassName, mdEditorBaseClass, leaf.fnc, leaf.fnd],
  );

  const displayLabel = useMemo(
    () => formatFootnoteRefDisplayLabel(leaf.text, leaf.identifier),
    [leaf.text, leaf.identifier],
  );

  const formattedText = useMemo(() => {
    if (leaf.fnc || leaf.identifier) {
      return displayLabel;
    }
    return children;
  }, [leaf.fnc, leaf.identifier, displayLabel, children]);

  const dataFncName = useMemo(
    () => (leaf.fnc ? resolvedIdentifier : undefined),
    [leaf.fnc, resolvedIdentifier],
  );

  const dataFndName = useMemo(
    () => (leaf.fnd ? extractFootnoteDefinitionIdentifier(leaf.text) : undefined),
    [leaf.fnd, leaf.text],
  );

  const mergedStyle = useMemo(
    () => ({
      fontSize: leaf.fnc ? 10 : undefined,
      ...style,
    }),
    [leaf.fnc, style],
  );

  const handleClick = useRefFunction((e: React.MouseEvent) => {
    if (isMobile && hasFnc) {
      e.preventDefault();
      e.stopPropagation();
      setMobileModalOpen(true);
      fncProps?.onOriginUrlClick?.(leaf?.identifier);
      return;
    }
    if (hasFnc) {
      e.preventDefault();
      e.stopPropagation();
      if (fncProps?.onOriginUrlClick) {
        fncProps.onOriginUrlClick(leaf?.identifier);
      }
      if (leaf.url) {
        if (linkConfig?.onClick) {
          const res = linkConfig.onClick(leaf.url);
          if (res === false) {
            return false;
          }
        }
        if (linkConfig?.openInNewTab !== false) {
          window.open(leaf.url, '_blank');
        } else {
          window.location.href = leaf.url;
        }
      }
      return false;
    }
  });

  const customRenderChildren = useMemo(
    () => displayLabel,
    [displayLabel],
  );

  let dom = (
    <span
      {...attributes}
      data-be="text"
      draggable={false}
      onDragStart={dragStart}
      onClick={handleClick}
      contentEditable={leaf.fnc ? false : undefined}
      data-fnc={leaf.fnc || leaf.identifier ? 'fnc' : undefined}
      data-fnd={leaf.fnd ? 'fnd' : undefined}
      data-fnc-name={dataFncName}
      data-fnd-name={dataFndName}
      className={fncClassName ? fncClassName : undefined}
      style={mergedStyle}
    >
      {formattedText}
    </span>
  );

  if (fncProps?.render && (leaf.fnc || leaf.identifier)) {
    dom = (
      <>
        {fncProps.render?.(
          {
            ...leaf,
            children: customRenderChildren,
          },
          dom,
        )}
      </>
    );
  }

  return (
    <>
      {dom}
      {isMobile && hasFnc ? (
        <FncLeafMobileModal
          open={mobileModalOpen}
          onClose={() => setMobileModalOpen(false)}
          displayLabel={displayLabel}
          identifier={resolvedIdentifier}
          definition={footnoteDefinition}
          leafUrl={leaf.url}
          linkConfig={linkConfig}
          fncProps={fncProps}
        />
      ) : null}
    </>
  );
};
