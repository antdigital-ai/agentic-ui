import { ConfigProvider } from 'antd';
import classNames from 'classnames';
import Lottie, { LottieRef } from 'lottie-react';
import React, { useContext, useEffect, useRef } from 'react';
import { useStyle } from './style';

export interface AbstractLottieProps {
  /**
   * 动画数据
   */
  animationData: any;
  /**
   * 是否激活动画
   * @default false
   */
  active?: boolean;
  /**
   * 是否自动播放动画
   * @default true
   */
  autoplay?: boolean;
  /**
   * 是否循环播放动画
   * @default true
   */
  loop?: boolean;
  /**
   * 动画容器类名
   */
  className?: string;
  /**
   * 动画容器样式
   */
  style?: React.CSSProperties;
  /**
   * 动画尺寸（宽度和高度）
   * @example size={64}
   */
  size?: number | string;
}

/**
 * Lottie 动画基础组件
 *
 * 提供 Lottie 动画渲染的基础功能，支持自定义尺寸、样式和播放行为。
 * 该组件作为其他具体操作动画组件的抽象基类使用。
 *
 * @component
 * @example
 * // 基础用法
 * <AbstractLottie animationData={animationData} />
 *
 * @example
 * // 自定义尺寸
 * <AbstractLottie animationData={animationData} size={64} />
 *
 * @example
 * // 自定义样式
 * <AbstractLottie
 *   animationData={animationData}
 *   size={80}
 *   style={{ margin: '20px' }}
 *   className="custom-lottie"
 * />
 *
 * @example
 * // 控制播放行为
 * <AbstractLottie
 *   animationData={animationData}
 *   active={true}
 *   autoplay={true}
 *   loop={true}
 * />
 *
 * @param props - 组件属性
 * @param props.animationData - Lottie 动画数据对象
 * @param props.active - 是否激活动画，默认为 false
 * @param props.autoplay - 是否自动播放动画，默认为 false
 * @param props.loop - 是否循环播放动画，默认为 false
 * @param props.className - 动画容器类名
 * @param props.style - 动画容器自定义样式
 * @param props.size - 动画尺寸（宽度和高度），默认为 '1em'
 * @returns 渲染的 Lottie 动画组件
 */
export const AbstractLottie: React.FC<AbstractLottieProps> = ({
  animationData,
  active = false,
  autoplay = false,
  loop = false,
  className,
  style,
  size = '1em',
}) => {
  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const prefixCls = getPrefixCls('bubble-actions-lottie');
  const { wrapSSR, hashId } = useStyle(prefixCls);

  const lottieRef = useRef(null) as LottieRef;

  const containerStyle: React.CSSProperties = {
    width: size,
    height: size,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    ...style,
  };

  useEffect(() => {
    if (active) {
      lottieRef.current?.play();
    } else {
      lottieRef.current?.stop();
    }
  }, [active]);

  return wrapSSR(
    <Lottie
      style={containerStyle}
      lottieRef={lottieRef}
      className={classNames(prefixCls, hashId, className)}
      data-testid="lottie-animation"
      aria-hidden="true"
      animationData={animationData}
      loop={loop}
      autoplay={autoplay}
    />,
  );
};

export default AbstractLottie;
