import { ConfigProvider } from 'antd';
import classNames from 'classnames';
import React, { CSSProperties, useCallback, useContext, useMemo } from 'react';
import { RenderLeafProps } from 'slate-react';

import { isMobileDevice } from '../../../../MarkdownInputField/AttachmentButton/utils';
import { MarkdownEditorProps } from '../../../types';
import { dragStart } from '../index';

interface FncLeafProps extends RenderLeafProps {
  fncProps: MarkdownEditorProps['fncProps'];
  linkConfig?: MarkdownEditorProps['linkConfig'];
  style?: CSSProperties;
  prefixClassName?: string;
}

/**
 * FncLeaf 组件：专门处理 fnc（函数调用）和 fnd（函数定义）类型的叶子节点
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

  // 使用 useMemo 优化 className 计算
  const fncClassName = useMemo(
    () =>
      classNames({
        [`${mdEditorBaseClass}-fnc`]: leaf.fnc,
        [`${mdEditorBaseClass}-fnd`]: leaf.fnd,
      }),
    [prefixClassName, mdEditorBaseClass, leaf.fnc, leaf.fnd],
  );

  // 使用 useMemo 优化文本格式化计算
  const formattedText = useMemo(() => {
    if (leaf.fnc || leaf.identifier) {
      return (
        leaf.text
          ?.replaceAll(']', '')
          ?.replaceAll('[^DOC_', '')
          ?.replaceAll('[^', '') || ''
      );
    }
    return children;
  }, [leaf.fnc, leaf.identifier, leaf.text, children]);

  // 使用 useMemo 优化 data-fnc-name 和 data-fnd-name 计算
  const dataFncName = useMemo(
    () => (leaf.fnc ? leaf.text?.replace(/\[\^(.+)]:?/g, '$1') : undefined),
    [leaf.fnc, leaf.text],
  );

  const dataFndName = useMemo(
    () => (leaf.fnd ? leaf.text?.replace(/\[\^(.+)]:?/g, '$1') : undefined),
    [leaf.fnd, leaf.text],
  );

  // 使用 useMemo 优化 style 对象
  const mergedStyle = useMemo(
    () => ({
      fontSize: leaf.fnc ? 10 : undefined,
      ...style,
    }),
    [leaf.fnc, style],
  );

  // 使用 useCallback 优化 onClick 处理函数
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      // 在手机上，如果是 fnc，阻止点击事件（使用长按代替）
      if (isMobile && hasFnc) {
        e.preventDefault();
        return;
      }
      if (hasFnc) {
        e.preventDefault();
        e.stopPropagation();
        if (fncProps?.onOriginUrlClick) {
          fncProps.onOriginUrlClick(leaf?.identifier);
        }
        // 如果同时有 URL，也要处理 URL 打开逻辑
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
    },
    [isMobile, hasFnc, fncProps, leaf?.identifier, leaf?.url, linkConfig],
  );

  // 使用 useMemo 优化自定义渲染的 children 计算
  const customRenderChildren = useMemo(
    () =>
      leaf.text
        ?.toLocaleUpperCase()
        ?.replaceAll('[^', '')
        .replaceAll(']', '') || '',
    [leaf.text],
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

  // 如果提供了自定义渲染函数，使用它
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

  return dom;
};
