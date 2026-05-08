import { ArrowRight } from '@sofa-design/icons';
import { ConfigProvider } from 'antd';
import classNames from 'clsx';
import React, { memo, useContext } from 'react';
import { useRefFunction } from '../Hooks/useRefFunction';
import { useLocale } from '../I18n';
import { useStyle } from './CaseReplyStyle';

/**
 * P1-2：抽出 QuoteIcon 子组件并用 React.memo 包裹。
 *
 * 收益：
 * 1. 可读性 —— 主组件不再嵌一段 30+ 行的硬编码 SVG。
 * 2. 性能   —— CaseReply 因 props/state 变化 rerender 时，只要 quoteIconColor 不变，
 *              这棵 SVG 子树就跳过 reconciliation（memo 默认浅比较即可，单 prop 字符串）。
 *
 * 备注：原 SVG 中的 <defs><clipPath id="..."> 已在 div-in-p 修复中一并移除。
 *       原 clipPath 的 rect 起点为 (23.96, 25.22)，超出 viewBox `0 0 25.22 25.22`，
 *       事实上不会裁剪任何东西，纯属冗余；移除后视觉无差异，同时避免多实例并存时
 *       全局 id 冲突的隐患。
 */
interface QuoteIconProps {
  color: string;
}

const QuoteIconComponent: React.FC<QuoteIconProps> = ({ color }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 25.22317126393318 25.22317126393318"
    fill="none"
    aria-hidden="true"
  >
    <g transform="matrix(-0.9986295104026794,-0.0523359589278698,0.0523359589278698,-0.9986295104026794,46.58129097149476,51.66611602701195)">
      <path
        d="M29.779783327789307,38.963964076433186C28.651713327789306,40.719154076433185,27.054323327789305,42.204154076433184,25.489813327789307,43.26605407643318L27.250773327789307,45.12705407643318C31.293283327789307,43.54175407643318,35.144133327789305,39.44085407643318,35.144133327789305,34.61674407643318L35.11302332778931,34.61674407643318C35.126363327789306,34.47068407643318,35.13353332778931,34.32282407643318,35.13353332778931,34.173284076433184C35.13353332778931,31.51111407643318,32.97547332778931,29.35305407643318,30.313303327789306,29.35305407643318C27.651223327789307,29.35305407643318,25.493075247789307,31.51111407643318,25.493075247789307,34.173284076433184C25.493051107789306,36.65507407643318,27.368793327789305,38.69843407643318,29.779783327789307,38.963964076433186ZM36.8831133277893,43.26605407643318L38.64401332778931,45.12705407643318C42.68651332778931,43.54175407643318,46.53741332778931,39.44085407643318,46.53741332778931,34.61674407643318L46.50631332778931,34.61674407643318C46.51961332778931,34.47068407643318,46.526813327789306,34.32282407643318,46.526813327789306,34.173284076433184C46.526813327789306,31.51111407643318,44.36871332778931,29.35305407643318,41.706613327789306,29.35305407643318C39.04441332778931,29.35305407643318,36.88631332778931,31.51111407643318,36.88631332778931,34.173284076433184C36.88631332778931,36.65509407643318,38.762013327789305,38.69848407643318,41.17311332778931,38.96398407643318C40.045013327789306,40.719154076433185,38.447613327789306,42.204154076433184,36.8831133277893,43.26605407643318Z"
        fill={color}
        fillOpacity="1"
      />
    </g>
  </svg>
);

QuoteIconComponent.displayName = 'CaseReplyQuoteIcon';
const QuoteIcon = memo(QuoteIconComponent);

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
  buttonText,
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
  const locale = useLocale();

  // P1-1：hover 状态从 React state 改为 CSS :hover 直驱（见 CaseReplyStyle.ts），
  // 这里不再需要 isHovered / mouseEnter / mouseLeave，避免列表场景下的 N 次 rerender。
  const containerCls = classNames(prefixCls, hashId, className);
  const coverCls = classNames(`${prefixCls}-cover`, hashId);
  const coverContentCls = classNames(`${prefixCls}-cover-content`, hashId);
  const quoteIconCls = classNames(`${prefixCls}-quote-icon`, hashId);
  const quoteTextCls = classNames(`${prefixCls}-quote-text`, hashId);
  const bottomCls = classNames(`${prefixCls}-bottom`, hashId);
  const titleCls = classNames(`${prefixCls}-title`, hashId);
  const descriptionCls = classNames(`${prefixCls}-description`, hashId);
  const buttonBarCls = classNames(`${prefixCls}-button-bar`, hashId);
  const arrowIconCls = classNames(`${prefixCls}-arrow-icon`, hashId);

  // P1-6：仅当 onClick 存在时，才把外层 div 升级为可聚焦的 button 角色，
  // 避免没有点击意图的卡片污染 tab 流。
  const handleKeyDown = useRefFunction(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (!onClick) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick();
      }
    },
  );

  // P1-9：testid 与 prefixCls 解耦，避免外层 ConfigProvider 改 prefix 时测试失效。
  const testId = 'agentic-chatboot-case-reply';

  return wrapSSR(
    <div
      className={containerCls}
      data-testid={testId}
      data-clickable={onClick ? 'true' : undefined}
      style={style}
      onClick={onClick}
      onKeyDown={onClick ? handleKeyDown : undefined}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
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
            <QuoteIcon color={quoteIconColor} />
          </div>
          {quote && <div className={quoteTextCls}>{quote}</div>}
        </div>
      </div>

      {/* 底部内容区域 */}
      <div className={bottomCls}>
        {title && <h3 className={titleCls}>{title}</h3>}
        {/* description 改用 div 而非 p：description?: ReactNode 允许传入块级元素，
            放在 <p> 里会触发 React 的 validateDOMNesting 警告（<div> in <p>）。 */}
        {description && <div className={descriptionCls}>{description}</div>}
        {/* buttonBar */}
        {(buttonBar || buttonText || onButtonClick) && (
          <div className={buttonBarCls}>
            {buttonBar || (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onButtonClick?.(e);
                }}
              >
                {buttonText ?? locale['chatBootPage.caseReply.viewReplay']}
                <span className={arrowIconCls} aria-hidden="true">
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
