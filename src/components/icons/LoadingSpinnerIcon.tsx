import React from 'react';

interface LoadingSpinnerIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

/**
 * LoadingSpinnerIcon 组件 - 加载旋转图标组件
 *
 * 该组件显示一个旋转的加载图标，支持自定义大小和 SVG 属性。
 * 主要用于表示加载状态或处理中的 UI 元素。
 *
 * @component
 * @description 加载旋转图标组件，支持自定义大小和 SVG 属性
 * @param {LoadingSpinnerIconProps} props - 组件属性
 * @param {number} [props.size=24] - 图标大小（像素）
 * @param {React.SVGProps<SVGSVGElement>} props - 其他 SVG 属性
 *
 * @example
 * ```tsx
 * import { LoadingSpinnerIcon } from './components/icons/LoadingSpinnerIcon';
 *
 * // 基本用法
 * <LoadingSpinnerIcon size={24} />
 *
 * // 自定义样式
 * <LoadingSpinnerIcon size={32} className="custom-spinner" />
 * ```
 *
 * @returns {React.ReactElement} 渲染的加载旋转图标组件
 *
 * @remarks
 * - 默认大小为 24px
 * - 支持所有标准的 SVG 属性
 * - 内置 CSS 动画，自动旋转
 * - 使用 24x24 的 viewBox
 * - 包含背景圆环和前景进度条
 */
export const LoadingSpinnerIcon: React.FC<LoadingSpinnerIconProps> = ({
  size = 24,
  ...props
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      {...props}
      style={{
        animation: 'spin 1s linear infinite',
        ...props.style,
      }}
    >
      <style>
        {`
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
      <path
        d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM12 4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4Z"
        fill="#4E5969"
        fillOpacity="0.2"
      />
      <path
        d="M12 2C6.47715 2 2 6.47715 2 12C2 12.6522 2.06545 13.2886 2.19175 13.9025L4.03341 13.3089C3.94757 12.8865 3.90196 12.4492 3.90196 12C3.90196 7.52684 7.52684 3.90196 12 3.90196C16.4732 3.90196 20.098 7.52684 20.098 12C20.098 16.4732 16.4732 20.098 12 20.098C11.5508 20.098 11.1135 20.0524 10.6911 19.9666L10.0975 21.8082C10.7114 21.9346 11.3478 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z"
        fill="#4E5969"
      />
    </svg>
  );
};
