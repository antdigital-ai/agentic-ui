import { ConfigProvider } from 'antd';
import classNames from 'classnames';
import { isString } from 'lodash';
import React, { useContext } from 'react';
import { TextLoading } from '../lotties';
import { LoadingLottieProps } from '../lotties/LoadingLottie';
import Indicator from './Indicator';
import { prefixCls, useStyle } from './style';

/**
 * 语义化样式名称
 * @description 用于标识 Loading 组件内部不同元素的样式配置键名
 */
type SemanticName = 'root' | 'wrapper' | 'indicator' | 'tip';

/**
 * Loading 组件样式配置类型
 * @description 支持为 Loading 组件的不同部分（根元素、包装器、指示器、提示文本）分别设置样式
 * @example
 * ```tsx
 * <Loading
 *   styles={{
 *     root: { fontSize: '20px' },
 *     tip: { color: '#1890ff' },
 *   }}
 * />
 * ```
 */
export type LoadingStylesType = Partial<
  Record<SemanticName, React.CSSProperties>
>;

/**
 * Loading 组件属性
 * @description 加载动画组件的配置属性，支持自定义指示器、提示文本、进度百分比等
 */
interface LoadingProps extends Pick<LoadingLottieProps, 'size'> {
  /**
   * 自定义 CSS 类名
   * @description 应用于 Loading 组件根元素的类名
   */
  className?: string;

  /**
   * 最外层容器的自定义类名
   * @description 应用于组件最外层容器的类名，与 className 的区别在于作用域不同
   */
  wrapperClassName?: string;

  /**
   * 自定义 CSS 样式
   * @description 应用于 Loading 组件根元素的内联样式
   */
  style?: React.CSSProperties;

  /**
   * 多层级样式配置
   * @description 支持为组件的不同部分（root、wrapper、indicator、tip）分别设置样式
   * @example
   * ```tsx
   * <Loading
   *   styles={{
   *     root: { fontSize: '20px' },
   *     tip: { color: '#1890ff', marginTop: '8px' },
   *   }}
   * />
   * ```
   */
  styles?: LoadingStylesType;

  /**
   * 加载提示文本
   * @description 显示在加载指示器下方的提示文字，支持 ReactNode 类型
   * @example
   * ```tsx
   * <Loading tip="加载中..." />
   * <Loading tip={<span>正在处理</span>} />
   * ```
   */
  tip?: React.ReactNode;

  /**
   * 是否显示加载状态
   * @description 控制是否显示加载动画，当为 false 时隐藏加载指示器
   * @default true
   */
  spinning?: boolean;

  /**
   * 自定义加载指示器
   * @description 自定义加载动画的显示内容，可以是 ReactNode 或自定义组件
   * @example
   * ```tsx
   * <Loading indicator={<CustomSpinner />} />
   * ```
   */
  indicator?: React.ReactNode;

  /**
   * 加载进度百分比
   * @description 显示加载进度（0-100），当提供此值时，会显示进度圆环而不是默认的动画
   * @example
   * ```tsx
   * <Loading percent={75} />
   * ```
   */
  percent?: number;

  /**
   * 子元素内容
   * @description 当提供子元素时，Loading 会以嵌套模式显示，子内容会被遮罩层覆盖
   * @example
   * ```tsx
   * <Loading>
   *   <div>被加载遮罩覆盖的内容</div>
   * </Loading>
   * ```
   */
  children?: React.ReactNode;
}

/**
 * Loading 组件 - 加载动画组件
 *
 * 该组件提供加载动画效果，支持多种显示模式：
 * - 基础模式：仅显示加载动画和可选的提示文本
 * - 嵌套模式：当提供 children 时，会在内容上方显示加载遮罩
 * - 进度模式：当提供 percent 时，显示进度圆环
 *
 * @component
 * @description 加载动画组件，支持自定义指示器、提示文本、进度显示和嵌套模式
 * @example
 * ```tsx
 * import { Loading } from './Components/Loading';
 *
 * function App() {
 *   return (
 *     <div>
 *       <Loading {...props} />
 *     </div>
 *   );
 * }
 * ```
 *
 * @returns {React.ReactElement} 渲染的加载动画组件
 */
export const Loading = ({
  className,
  wrapperClassName,
  style,
  indicator,
  tip,
  spinning = true,
  children,
  styles,
  size,
  percent,
}: LoadingProps) => {
  const context = useContext(ConfigProvider.ConfigContext);
  const baseCls = context?.getPrefixCls(prefixCls);
  const { wrapSSR, hashId } = useStyle(baseCls);

  const isNestedPattern = React.useMemo<boolean>(() => !!children, [children]);

  const mergedSize = size ?? (isNestedPattern ? 32 : '1em');

  const showPercent = percent !== undefined && percent !== null;
  const showTip =
    tip !== false && tip !== null && (showPercent || tip !== undefined);

  const text = tip ?? (showPercent ? `${percent}%` : undefined);

  const tipElement =
    isNestedPattern && isString(text) ? (
      <TextLoading
        text={text}
        className={classNames(`${baseCls}-tip`, hashId)}
        style={styles?.tip}
      />
    ) : (
      <div className={classNames(`${baseCls}-tip`, hashId)} style={styles?.tip}>
        {text}
      </div>
    );

  const loadingElement = (
    <div
      className={classNames(baseCls, hashId, className, {
        [`${baseCls}-with-tip`]: !!tip,
        [`${baseCls}-with-children`]: isNestedPattern,
      })}
      style={{
        fontSize: mergedSize,
        ...styles?.root,
        ...style,
      }}
    >
      <Indicator
        size={mergedSize}
        indicator={indicator}
        percent={percent}
        style={styles?.indicator}
      />
      {showTip ? tipElement : null}
    </div>
  );

  if (isNestedPattern) {
    return wrapSSR(
      <div
        className={classNames(
          `${baseCls}-nested-pattern`,
          hashId,
          wrapperClassName,
          spinning && `${baseCls}-spinning`,
        )}
        style={styles?.wrapper}
      >
        {spinning ? loadingElement : null}
        <div className={classNames(`${baseCls}-container`, hashId)}>
          {children}
        </div>
      </div>,
    );
  }

  return wrapSSR(loadingElement);
};
