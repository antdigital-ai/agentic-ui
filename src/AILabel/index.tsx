import { ConfigProvider, Tooltip, TooltipProps } from 'antd';
import classNames from 'clsx';
import React, { memo, useContext, useMemo, useState } from 'react';
import { useRefFunction } from '../Hooks/useRefFunction';
import { AIGraphic } from './AIGraphic';
import { AIGraphicDisabled } from './AIGraphicDisabled';
import { prefixCls, useStyle } from './style';

/**
 * AI 标签所有可选状态值的列表（运行时可枚举）。
 *
 * 使用 `as const` 元组而非 `enum`，与项目 TypeScript 规范一致：
 * - 没有 enum 带来的双向映射、运行时常量对象等额外产物
 * - 可直接 `.includes()` 校验输入合法性
 * - 类型 {@link AILabelStatus} 由该数组派生，新增状态只需在此一处维护
 */
export const AI_LABEL_STATUSES = ['default', 'watermark', 'emphasis'] as const;

/**
 * AI 标签状态类型
 * @typedef AILabelStatus
 * @description 定义 AI 标签的显示状态。由 {@link AI_LABEL_STATUSES} 派生。
 *
 * - `default`: 默认状态，标准 AI 标签样式
 * - `watermark`: 水印状态，半透明样式，用于合规性标识
 * - `emphasis`: 强调状态，突出显示 AI 标签，带有渐变背景
 */
export type AILabelStatus = (typeof AI_LABEL_STATUSES)[number];

/**
 * AI 标签组件的属性接口
 * @interface AILabelProps
 * @extends React.HTMLAttributes<HTMLSpanElement>
 */
export interface AILabelProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** 自动化测试用根节点标识，未设置时默认与主题前缀一致 */
  'data-testid'?: string;
  /**
   * 标签状态
   * @description 控制标签的视觉样式，支持默认、水印和强调三种状态
   * @default 'default'
   */
  status?: AILabelStatus;
  /**
   * 标签偏移量
   * @description 控制标签的位置偏移，格式为 [水平偏移, 垂直偏移]
   * - 第一个值：水平偏移量（单位：px），负值表示向左偏移
   * - 第二个值：垂直偏移量（单位：px），负值表示向上偏移
   * @example [0, -8] 表示不水平偏移，向上偏移 8px
   */
  offset?: [number, number];
  /**
   * 提示框配置
   * @description 配置 Tooltip 提示框的属性，当鼠标悬停在标签上时显示提示信息
   * @see https://ant.design/components/tooltip-cn#api
   */
  tooltip?: TooltipProps;
  /**
   * 自定义类名
   * @description 自定义根元素的 CSS 类名
   */
  className?: string;
  /**
   * 自定义样式
   * @description 自定义标签点（dot）的样式，会与 offset 计算的样式合并
   */
  style?: React.CSSProperties;
  /**
   * 根元素样式
   * @description 自定义根容器元素的样式
   */
  rootStyle?: React.CSSProperties;
  /**
   * 子元素
   * @description 当存在子元素时，标签会以绝对定位的方式显示在子元素的右上角
   */
  children?: React.ReactNode;
}

/**
 * AI Label 组件 - AI 标签标识组件
 *
 * 该组件用于明确标识 AI 生成内容，在非 AI 对话界面中，通过视觉标记、水印或标签，
 * 清晰区分人工创建与 AI 生成的内容，增强透明度并帮助用户识别内容来源，确保合规性。
 *
 * @component
 * @description AI 标签标识组件，用于标识 AI 生成的内容
 * @param {AILabelProps} props - 组件属性
 * @param {AILabelStatus} [props.status='default'] - 标签状态，控制标签的视觉样式
 * @param {[number, number]} [props.offset] - 标签偏移量，格式为 [水平偏移, 垂直偏移]
 * @param {TooltipProps} [props.tooltip] - 提示框配置，鼠标悬停时显示提示信息
 * @param {string} [props.className] - 自定义根元素的 CSS 类名
 * @param {React.CSSProperties} [props.style] - 自定义标签点的样式
 * @param {React.CSSProperties} [props.rootStyle] - 自定义根容器元素的样式
 * @param {React.ReactNode} [props.children] - 子元素，当存在时标签会显示在子元素右上角
 *
 * @example
 * ```tsx
 * // 基础用法 - 水印状态
 * <AILabel status="watermark" offset={[0, -8]} />
 *
 * // 强调状态带提示
 * <AILabel
 *   status="emphasis"
 *   offset={[0, -8]}
 *   tooltip={{
 *     title: '此内容由AI辅助生成，仅供参考。',
 *   }}
 * />
 *
 * // 带子元素
 * <AILabel status="emphasis">
 *   <span>这是一段文本内容</span>
 * </AILabel>
 * ```
 *
 * @returns {React.ReactElement} 渲染的 AI 标签组件
 *
 * @remarks
 * - 支持三种状态：默认（default）、强调（emphasis）、水印（watermark）
 * - 提供位置偏移功能，可精确控制标签位置
 * - 支持 Tooltip 提示，可自定义提示内容
 * - 当存在子元素时，标签会自动定位到子元素右上角
 * - 切换状态时使用 CSS transition 提供平滑过渡（详见 `style.ts`）
 * - 水印状态下，当 Tooltip 未打开时显示禁用图标
 *
 * @important children 应为 inline 级元素或文本，避免传入 `<div>` 等 block 级元素
 *   （根节点是 `<span>`，块级元素嵌入会构成无效 HTML，被浏览器宽容修正后可能影响布局）
 */
const AILabelComponent = React.forwardRef<HTMLSpanElement, AILabelProps>(
  (props, ref) => {
    const {
      status,
      offset,
      tooltip,
      className,
      style,
      rootStyle,
      children,
      'data-testid': dataTestId,
      ...restProps
    } = props;

    const context = useContext(ConfigProvider.ConfigContext);
    const baseCls = context?.getPrefixCls(prefixCls);
    const { hashId } = useStyle(baseCls);

    // 合并样式，处理偏移量
    // - 水平方向：通过 `insetInlineEnd: -offsetX` 实现 RTL 友好的右侧偏移
    //   （offsetX 为正 → 标签向左，offsetX 为负 → 标签向右）
    // - 垂直方向：直接通过 `marginTop` 推/拉
    // 直接使用 number，避免 `String(...) + parseInt` 带来的精度丢失与冗余转换
    const mergedStyle = useMemo<React.CSSProperties>(() => {
      if (!offset) {
        return { ...style };
      }

      const [offsetX, offsetY] = offset;
      const offsetStyle: React.CSSProperties = {
        marginTop: offsetY,
        insetInlineEnd: -offsetX,
      };

      return { ...offsetStyle, ...style };
    }, [offset, style]);

    // Tooltip 显示状态
    const [tooltipOpen, setTooltipOpen] = useState(false);

    // 处理 Tooltip 状态变化
    const handleTooltipOpenChange = useRefFunction((open: boolean) => {
      setTooltipOpen(open);
      tooltip?.onOpenChange?.(open);
    });

    // 计算类名
    const badgeClassName = classNames(
      baseCls,
      {
        [`${baseCls}-status-${status}`]: !!status,
        [`${baseCls}-with-children`]: !!children,
        [`${baseCls}-tooltip-visible`]: tooltipOpen,
      },
      className,
      hashId,
    );

    // 缓存图标节点，避免每次渲染创建新元素：
    // - watermark 且 Tooltip 关闭：灰色置灰图标
    // - 其他情况：彩色图标
    const iconNode = useMemo(() => {
      if (status === 'watermark' && !tooltipOpen) {
        return <AIGraphicDisabled />;
      }
      return <AIGraphic />;
    }, [status, tooltipOpen]);

    return (
      <span
        ref={ref}
        {...restProps}
        className={badgeClassName}
        data-testid={dataTestId ?? baseCls}
        style={rootStyle}
      >
        {children}
        <Tooltip {...tooltip} onOpenChange={handleTooltipOpenChange}>
          <sup
            className={classNames(`${baseCls}-dot`, hashId)}
            style={mergedStyle}
          >
            {iconNode}
          </sup>
        </Tooltip>
      </span>
    );
  },
);

AILabelComponent.displayName = 'AILabel';

// 使用 React.memo 优化性能，避免不必要的重新渲染
export const AILabel = memo(AILabelComponent);

// memo 包装会丢失内部 forwardRef 的 displayName，这里显式补回，
// 便于 React DevTools / 测试 snapshot 识别。
(AILabel as unknown as { displayName?: string }).displayName = 'AILabel';
