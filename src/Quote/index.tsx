import { CloseCircleFill, CornerLeftUp, QuoteBefore } from '@sofa-design/icons';
import { ConfigProvider } from 'antd';
import classNames from 'clsx';
import React, { useContext, useMemo } from 'react';
import { useRefFunction } from '../Hooks/useRefFunction';
import { useStyle } from './style';

const POPUP_ICON_STYLE: React.CSSProperties = {
  fontSize: 14,
  display: 'flex',
  alignItems: 'center',
};

/**
 * Quote 组件的属性接口
 * @interface QuoteProps
 */
export interface QuoteProps {
  /** 文件名 */
  fileName?: string;
  /** 行号范围（可选） */
  lineRange?: string;
  /** 引用描述 */
  quoteDescription: string;
  /** 详细内容（点击查看详情） */
  popupDetail?: string;
  /** 弹出层方向 */
  popupDirection?: 'left' | 'right';
  /** 是否显示关闭按钮 */
  closable?: boolean;
  /** 关闭回调 */
  onClose?: () => void;
  /** 自定义类名 @deprecated 请使用 classNames.root 替代 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 自定义样式类名，用于各个部分 */
  classNames?: {
    root?: string;
    description?: string;
    icon?: string;
    closeButton?: string;
    popup?: string;
    popupHeader?: string;
    popupContent?: string;
  };
  /** 自定义内联样式，用于各个部分 */
  styles?: {
    root?: React.CSSProperties;
    description?: React.CSSProperties;
    icon?: React.CSSProperties;
    closeButton?: React.CSSProperties;
    popup?: React.CSSProperties;
    popupHeader?: React.CSSProperties;
    popupContent?: React.CSSProperties;
  };
  /** File 子组件点击事件（点击文件名回调） */
  onFileClick?: (fileName: string, lineRange?: string) => void;
}

/**
 * Quote 组件 - 引用组件
 *
 * 该组件用于显示代码引用或文档引用，支持显示文件名、行号范围、引用描述等信息。
 * 提供悬停显示详细内容的功能，支持关闭按钮和点击交互。
 *
 * @component
 * @description 引用组件，用于显示代码或文档引用信息
 * @param {QuoteProps} props - 组件属性
 * @param {string} [props.fileName] - 文件名
 * @param {string} [props.lineRange] - 行号范围
 * @param {string} props.quoteDescription - 引用描述
 * @param {string} [props.popupDetail] - 详细内容（悬停显示）
 * @param {boolean} [props.closable=false] - 是否显示关闭按钮
 * @param {() => void} [props.onClose] - 关闭回调
 * @param {string} [props.className] - 自定义CSS类名（已废弃，请使用 classNames.root）
 * @param {React.CSSProperties} [props.style] - 自定义样式
 * @param {Object} [props.classNames] - 自定义样式类名
 * @param {Object} [props.styles] - 自定义内联样式
 * @param {(fileName: string, lineRange?: string) => void} [props.onFileClick] - 点击文件名回调
 *
 * @example
 * ```tsx
 * <Quote
 *   fileName="example.js"
 *   lineRange="10-15"
 *   quoteDescription="函数定义"
 *   popupDetail="function example() { return 'hello'; }"
 *   closable
 *   onClose={() => console.log('关闭引用')}
 *   onFileClick={(fileName, lineRange) => {
 *     console.log('点击文件:', fileName, '行号:', lineRange);
 *   }}
 * />
 * ```
 *
 * @returns {React.ReactElement} 渲染的引用组件
 */
const QuoteComponent: React.FC<QuoteProps> = ({
  fileName,
  lineRange,
  quoteDescription,
  popupDetail,
  popupDirection = 'left',
  closable = false,
  onClose,
  className,
  style,
  classNames: customClassNames,
  styles: customStyles,
  onFileClick,
}) => {
  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const prefixCls = getPrefixCls('agentic-quote');
  const { hashId } = useStyle(prefixCls);

  const handleFileClick = useRefFunction(() => {
    if (onFileClick && fileName) {
      onFileClick(fileName, lineRange);
    }
  });

  const cls = useMemo(
    () => ({
      container: classNames(
        `${prefixCls}-container`,
        hashId,
        customClassNames?.root,
        className,
      ),
      description: classNames(
        `${prefixCls}-quoteDescription`,
        hashId,
        customClassNames?.description,
      ),
      closeButton: classNames(
        `${prefixCls}-close-button`,
        hashId,
        customClassNames?.closeButton,
      ),
      icon: classNames(
        `${prefixCls}-quote-icon`,
        hashId,
        customClassNames?.icon,
      ),
      popup: classNames(`${prefixCls}-popup`, hashId, customClassNames?.popup),
      popupHeader: classNames(
        `${prefixCls}-popup-header`,
        hashId,
        customClassNames?.popupHeader,
      ),
      popupTitle: classNames(`${prefixCls}-popup-title`, hashId),
      popupRange: classNames(`${prefixCls}-popup-range`, hashId),
      popupContent: classNames(
        `${prefixCls}-popup-content`,
        hashId,
        customClassNames?.popupContent,
      ),
    }),
    [prefixCls, hashId, customClassNames, className],
  );

  const popupStyle = useMemo(
    (): React.CSSProperties => ({
      [popupDirection]: 0,
      ...customStyles?.popup,
    }),
    [popupDirection, customStyles?.popup],
  );

  return (
    <div
      className={cls.container}
      style={{ ...style, ...customStyles?.root }}
      data-testid="quote-container"
    >
      <div
        className={cls.icon}
        style={customStyles?.icon}
        data-testid="quote-icon"
      >
        <QuoteBefore />
      </div>
      <span
        className={cls.description}
        style={customStyles?.description}
        data-testid="quote-description"
      >
        {quoteDescription}
      </span>
      {closable && (
        <div
          onClick={onClose}
          className={cls.closeButton}
          style={customStyles?.closeButton}
          data-testid="quote-close-button"
        >
          <CloseCircleFill />
        </div>
      )}

      {popupDetail && (
        <div className={cls.popup} data-testid="quote-popup" style={popupStyle}>
          {(fileName || lineRange) && (
            <div
              className={cls.popupHeader}
              style={customStyles?.popupHeader}
              onClick={handleFileClick}
              data-testid="quote-popup-header"
            >
              <div style={POPUP_ICON_STYLE} data-testid="quote-popup-icon">
                <CornerLeftUp />
              </div>
              {fileName && (
                <span
                  className={cls.popupTitle}
                  data-testid="quote-popup-title"
                >
                  {fileName}
                </span>
              )}
              {lineRange && (
                <span
                  className={cls.popupRange}
                  data-testid="quote-popup-range"
                >
                  ({lineRange})
                </span>
              )}
            </div>
          )}
          <div
            className={cls.popupContent}
            style={customStyles?.popupContent}
            data-testid="quote-popup-content"
          >
            {popupDetail}
          </div>
        </div>
      )}
    </div>
  );
};

QuoteComponent.displayName = 'Quote';

export const Quote = React.memo(QuoteComponent);
