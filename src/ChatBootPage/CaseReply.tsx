import { ArrowRight } from '@sofa-design/icons';
import { ConfigProvider } from 'antd';
import classNames from 'classnames';
import React, { memo, useCallback, useContext, useState } from 'react';
import { useStyle } from './CaseReplyStyle';

export interface CaseReplyProps {
  /**
   * cover 区域背景色（使用 rgba 格式，如 'rgba(132, 220, 24, 0.15)'）
   */
  coverBackground?: string;
  /**
   * 引号图标的颜色（使用 rgb 格式，如 'rgb(132, 220, 24)'）
   */
  quoteIconColor?: string;
  /**
   * 引用文字内容（coverContent 内容）
   */
  quote?: React.ReactNode;
  /**
   * 卡片标题（底部标题）
   */
  title?: React.ReactNode;
  /**
   * 描述文字（底部描述，单行显示）
   */
  description?: React.ReactNode;
  /**
   * 按钮文本（悬停时显示的按钮文字）
   */
  buttonText?: string;

  buttonBar?: React.ReactNode;
  /**
   * 按钮点击事件（子组件事件）
   */
  onButtonClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  /**
   * 点击卡片事件
   */
  onClick?: () => void;
  /**
   * 自定义样式
   */
  style?: React.CSSProperties;
  /**
   * 自定义类名
   */
  className?: string;
  /**
   * 类名前缀
   */
  prefixCls?: string;
}

const CaseReplyComponent: React.FC<CaseReplyProps> = ({
  coverBackground = 'rgba(132, 220, 24, 0.15)',
  quoteIconColor = 'rgb(132, 220, 24)',
  quote,
  title,
  description,
  buttonText = '查看回放',
  buttonBar,
  onButtonClick,
  onClick,
  style,
  className,
  prefixCls: customPrefixCls,
}) => {
  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const prefixCls = getPrefixCls(
    'agentic-chatboot-case-reply',
    customPrefixCls,
  );
  const { wrapSSR, hashId } = useStyle(prefixCls);

  const [isHovered, setIsHovered] = useState(false);

  const containerCls = classNames(prefixCls, hashId, className);
  const coverCls = classNames(`${prefixCls}-cover`, hashId);
  const coverContentCls = classNames(
    `${prefixCls}-cover-content`,
    hashId,
    isHovered && `${prefixCls}-cover-content-hovered`,
  );
  const quoteIconCls = classNames(`${prefixCls}-quote-icon`, hashId);
  const quoteTextCls = classNames(`${prefixCls}-quote-text`, hashId);
  const bottomCls = classNames(`${prefixCls}-bottom`, hashId);
  const titleCls = classNames(`${prefixCls}-title`, hashId);
  const descriptionCls = classNames(`${prefixCls}-description`, hashId);
  const buttonBarCls = classNames(
    `${prefixCls}-button-bar`,
    hashId,
    isHovered && `${prefixCls}-button-bar-visible`,
  );
  const arrowIconCls = classNames(`${prefixCls}-arrow-icon`, hashId);

  // 使用 useCallback 优化事件处理函数
  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  return wrapSSR(
    <div
      className={containerCls}
      style={style}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* cover 区域 */}
      <div
        className={coverCls}
        style={{
          background: coverBackground,
        }}
      >
        {/* coverContent 白色子卡片 */}
        <div className={coverContentCls}>
          <div className={quoteIconCls}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 25.22317126393318 25.22317126393318"
              fill="none"
            >
              <defs>
                <clipPath id="master_svg0_1118_33390">
                  <rect
                    x="23.967108249664307"
                    y="25.22317126393318"
                    width="24"
                    height="24"
                    rx="0"
                  />
                </clipPath>
              </defs>
              <g
                transform="matrix(-0.9986295104026794,-0.0523359589278698,0.0523359589278698,-0.9986295104026794,46.58129097149476,51.66611602701195)"
                clipPath="url(#master_svg0_1118_33390)"
              >
                <g>
                  <path
                    d="M29.779783327789307,38.963964076433186C28.651713327789306,40.719154076433185,27.054323327789305,42.204154076433184,25.489813327789307,43.26605407643318L27.250773327789307,45.12705407643318C31.293283327789307,43.54175407643318,35.144133327789305,39.44085407643318,35.144133327789305,34.61674407643318L35.11302332778931,34.61674407643318C35.126363327789306,34.47068407643318,35.13353332778931,34.32282407643318,35.13353332778931,34.173284076433184C35.13353332778931,31.51111407643318,32.97547332778931,29.35305407643318,30.313303327789306,29.35305407643318C27.651223327789307,29.35305407643318,25.493075247789307,31.51111407643318,25.493075247789307,34.173284076433184C25.493051107789306,36.65507407643318,27.368793327789305,38.69843407643318,29.779783327789307,38.963964076433186ZM36.8831133277893,43.26605407643318L38.64401332778931,45.12705407643318C42.68651332778931,43.54175407643318,46.53741332778931,39.44085407643318,46.53741332778931,34.61674407643318L46.50631332778931,34.61674407643318C46.51961332778931,34.47068407643318,46.526813327789306,34.32282407643318,46.526813327789306,34.173284076433184C46.526813327789306,31.51111407643318,44.36871332778931,29.35305407643318,41.706613327789306,29.35305407643318C39.04441332778931,29.35305407643318,36.88631332778931,31.51111407643318,36.88631332778931,34.173284076433184C36.88631332778931,36.65509407643318,38.762013327789305,38.69848407643318,41.17311332778931,38.96398407643318C40.045013327789306,40.719154076433185,38.447613327789306,42.204154076433184,36.8831133277893,43.26605407643318Z"
                    fill={quoteIconColor}
                    fillOpacity="1"
                  />
                </g>
              </g>
            </svg>
          </div>
          {quote && <div className={quoteTextCls}>{quote}</div>}
        </div>
      </div>

      {/* 底部内容区域 */}
      <div className={bottomCls}>
        {title && <h3 className={titleCls}>{title}</h3>}
        {description && <p className={descriptionCls}>{description}</p>}
        {/* buttonBar */}
        {(buttonBar || buttonText) && (
          <div className={buttonBarCls}>
            {buttonBar || (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onButtonClick?.(e);
                }}
              >
                {buttonText}
                <span className={arrowIconCls}>
                  <ArrowRight />
                </span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>,
  );
};

CaseReplyComponent.displayName = 'CaseReply';

// 使用 React.memo 优化性能，避免不必要的重新渲染
const CaseReply = memo(CaseReplyComponent);

export default CaseReply;
