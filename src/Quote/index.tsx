import { CloseCircleFill, CornerLeftUp, QuoteBefore } from '@sofa-design/icons';
import { ConfigProvider } from 'antd';
import classNames from 'classnames';
import React, { useContext } from 'react';
import { useStyle } from './style';

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
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
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
 * @param {string} [props.lineRange] - 行号范围（可选）
 * @param {string} props.quoteDescriptionription - 引用描述
 * @param {string} [props.popupDetail] - 详细内容（悬停显示）
 * @param {boolean} [props.closable=false] - 是否显示关闭按钮
 * @param {() => void} [props.onClose] - 关闭回调
 * @param {string} [props.className] - 自定义CSS类名
 * @param {React.CSSProperties} [props.style] - 自定义样式
 * @param {(fileName: string, lineRange?: string) => void} [props.onFileClick] - 点击文件名回调
 *
 * @example
 * ```tsx
 * <Quote
 *   fileName="example.js"
 *   lineRange="10-15"
 *   quoteDescriptionription="函数定义"
 *   popupDetail="function example() { return 'hello'; }"
 *   closable={true}
 *   onClose={() => console.log('关闭引用')}
 *   onFileClick={(fileName, lineRange) => {
 *     console.log('点击文件:', fileName, '行号:', lineRange);
 *   }}
 * />
 * ```
 *
 * @returns {React.ReactElement} 渲染的引用组件
 *
 * @remarks
 * - 支持文件名和行号范围显示
 * - 提供悬停显示详细内容功能
 * - 支持关闭按钮和点击交互
 * - 提供自定义样式和类名
 * - 集成图标和动画效果
 * - 支持响应式布局
 */
export const Quote: React.FC<QuoteProps> = ({
  fileName,
  lineRange,
  quoteDescription,
  popupDetail,
  popupDirection = 'left',
  closable = false,
  onClose,
  className,
  style,
  onFileClick,
}) => {
  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const prefixCls = getPrefixCls('agentic-quote');
  const { wrapSSR, hashId } = useStyle(prefixCls);

  // 处理文件名点击
  const handleFileClick = () => {
    if (onFileClick && fileName) {
      onFileClick(fileName, lineRange);
    }
  };

  // 样式类名
  const containerCls = classNames(`${prefixCls}-container`, hashId, className);
  const quoteDescriptionCls = classNames(
    `${prefixCls}-quoteDescription`,
    hashId,
  );
  const closeCls = classNames(`${prefixCls}-close-button`, hashId);
  const quoteIconCls = classNames(`${prefixCls}-quote-icon`, hashId);

  // 弹出层样式类名
  const popupCls = classNames(`${prefixCls}-popup`, hashId);
  const popupHeaderCls = classNames(`${prefixCls}-popup-header`, hashId);
  const popupTitleCls = classNames(`${prefixCls}-popup-title`, hashId);
  const popupRangeCls = classNames(`${prefixCls}-popup-range`, hashId);
  const popupContentCls = classNames(`${prefixCls}-popup-content`, hashId);

  return wrapSSR(
    <div className={containerCls} style={style} data-testid="quote-container">
      <div className={quoteIconCls} data-testid="quote-icon">
        <QuoteBefore />
      </div>
      <span className={quoteDescriptionCls} data-testid="quote-description">
        {quoteDescription}
      </span>
      {closable && onClose && (
        <div
          onClick={onClose}
          className={closeCls}
          data-testid="quote-close-button"
        >
          <CloseCircleFill />
        </div>
      )}

      {/* 弹出层 - 通过CSS hover控制显示 */}
      {popupDetail && (
        <div
          className={popupCls}
          data-testid="quote-popup"
          style={{ [popupDirection]: 0 }}
        >
          {(fileName || lineRange) && (
            <div
              className={popupHeaderCls}
              onClick={handleFileClick}
              data-testid="quote-popup-header"
            >
              <div
                style={{
                  fontSize: 14,
                  display: 'flex',
                  alignItems: 'center',
                }}
                data-testid="quote-popup-icon"
              >
                <CornerLeftUp />
              </div>
              {fileName && (
                <span className={popupTitleCls} data-testid="quote-popup-title">
                  {fileName}
                </span>
              )}
              {lineRange && (
                <span className={popupRangeCls} data-testid="quote-popup-range">
                  ({lineRange})
                </span>
              )}
            </div>
          )}
          <div className={popupContentCls} data-testid="quote-popup-content">
            {popupDetail}
          </div>
        </div>
      )}
    </div>,
  );
};

export default Quote;
