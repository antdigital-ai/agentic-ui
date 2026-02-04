import { memo, useContext } from 'react';

import { CheckCircleFilled } from '@ant-design/icons';
import { isFunction } from 'lodash';
import React from 'react';
import {
  ActionIconBox,
  ActionIconBoxProps,
} from '../../../Components/ActionIconBox';
import { useCopied } from '../../../Hooks/useCopied';
import { BubbleConfigContext } from '../../BubbleConfigProvide';

/**
 * CopyIcon 组件 - 复制图标组件
 *
 * 该组件显示一个复制图标，支持自定义 SVG 属性。
 * 主要用于表示复制功能的 UI 元素。
 *
 * @component
 * @description 复制图标组件，支持自定义 SVG 属性
 * @param {React.JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>} props - SVG 属性
 *
 * @example
 * ```tsx
 * import { CopyIcon } from './CopyButton';
 *
 * // 基本用法
 * <CopyIcon />
 *
 * // 自定义样式
 * <CopyIcon className="custom-icon" />
 * ```
 *
 * @returns {React.ReactElement} 渲染的复制图标组件
 *
 * @remarks
 * - 使用 1em x 1em 的尺寸
 * - 支持所有标准的 SVG 属性
 * - 使用 14x14 的 viewBox
 * - 使用 currentColor 继承父元素颜色
 * - 包含 data-testid="copy-icon" 用于测试
 */
export const CopyIcon = (
  props: React.JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>,
) => {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      fill="none"
      version="1.1"
      width="1em"
      height="1em"
      viewBox="0 0 14.087890625 14.66650390625"
      data-testid="copy-icon"
    >
      <g>
        <path
          d="M10.8199,0.195262C10.6771,0.0702379,10.4834,0,10.2815,0L4.95203,0C3.69058,0,2.66797,0.895431,2.66797,2L2.66797,10C2.66797,11.1046,3.69058,12,4.95203,12L11.8042,12C13.0657,12,14.0883,11.1046,14.0883,10L14.0883,3.33333C14.0883,3.15652,14.0081,2.98695,13.8653,2.86193L10.8199,0.195262ZM10.2841,3.33333L12.0595,3.33333L9.7745,1.33252L9.52271,1.33255L9.52271,2.66667C9.52271,3.03486,9.86358,3.33333,10.2841,3.33333ZM4.76136,1.33319L8,1.33276L8,2.66667C8,3.77124,9.02261,4.66667,10.2841,4.66667L12.374,4.66667L12.3749,9.99985C12.3749,10.368,12.034,10.6665,11.6136,10.6665L4.76136,10.6665C4.34087,10.6665,4,10.368,4,9.99985L4,1.99985C4,1.63166,4.34087,1.33319,4.76136,1.33319ZM1.33333,4.40006C1.33333,4.03188,1.03486,3.7334,0.666667,3.7334C0.298477,3.7334,0,4.03188,0,4.40006L0,12.9334C0,13.8907,0.77604,14.6667,1.73333,14.6667L8.26667,14.6667C8.63486,14.6667,8.93333,14.3683,8.93333,14.0001C8.93333,13.6319,8.63486,13.3334,8.26667,13.3334L1.73333,13.3334C1.51242,13.3334,1.33333,13.1543,1.33333,12.9334L1.33333,4.40006Z"
          fillRule="evenodd"
          fill="currentColor"
          fillOpacity={1}
        />
      </g>
    </svg>
  );
};

export type CopyButtonProps = {
  className?: string;
  onClick?: (e: any) => any;
  children?: ((isHovered: boolean) => React.ReactNode) | React.ReactNode;
  'data-testid'?: string;
} & Omit<ActionIconBoxProps, 'children'>;

/**
 * CopyButton 组件 - 复制按钮组件
 *
 * 该组件提供一个可点击的复制按钮，支持复制功能和状态反馈。
 * 主要用于复制文本内容，并提供复制成功的视觉反馈。
 *
 * @component
 * @description 复制按钮组件，支持复制功能和状态反馈
 * @param {CopyButtonProps} props - 组件属性
 * @param {string} [props.className] - 自定义CSS类名
 * @param {Function} [props.onClick] - 点击事件回调
 * @param {React.ReactNode} [props.children] - 自定义子元素
 * @param {string} [props['data-testid']] - 测试标识符
 * @param {ActionIconBoxProps} props - 其他 ActionIconBox 属性
 *
 * @example
 * ```tsx
 * import { CopyButton } from './CopyButton';
 *
 * // 基本用法
 * <CopyButton onClick={() => copyText('Hello World')} />
 *
 * // 自定义图标
 * <CopyButton onClick={handleCopy}>
 *   <CustomIcon />
 * </CopyButton>
 * ```
 *
 * @returns {React.ReactElement} 渲染的复制按钮组件
 *
 * @remarks
 * - 使用 memo 进行性能优化
 * - 集成 useCopied hook 管理复制状态
 * - 点击时自动触发复制成功状态
 * - 支持自定义图标和样式
 * - 提供复制成功的视觉反馈
 */
export const CopyButton = memo<CopyButtonProps>(
  ({ className, onClick, 'data-testid': dataTestId, ...props }) => {
    const { copied, setCopied } = useCopied();
    const context = useContext(BubbleConfigContext);

    const copySuccessText =
      context?.locale?.['chat.message.copy.success'] || '复制成功';

    return (
      <ActionIconBox
        onClick={async (e) => {
          await onClick?.(e);
          setCopied();
        }}
        {...props}
        data-testid={dataTestId}
        title={
          copied ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <CheckCircleFilled style={{ color: '#52c41a' }} />
              {copySuccessText}
            </span>
          ) : (
            props.title
          )
        }
      >
        {(isHovered) =>
          props.children ? (
            isFunction(props.children) ? (
              props.children(isHovered)
            ) : (
              props.children
            )
          ) : (
            <CopyIcon className={className} />
          )
        }
      </ActionIconBox>
    );
  },
);
