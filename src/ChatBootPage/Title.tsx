import { ConfigProvider } from 'antd';
import classNames from 'classnames';
import React, { memo, useContext } from 'react';
import { useStyle } from './style';

export interface TitleProps {
  /**
   * 主标题内容
   */
  title?: React.ReactNode;
  /**
   * 副标题内容
   */
  subtitle?: React.ReactNode;
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

const TitleComponent: React.FC<TitleProps> = ({
  title,
  subtitle,
  style,
  className,
  prefixCls: customPrefixCls,
}) => {
  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const prefixCls = getPrefixCls('agentic-chatboot-title', customPrefixCls);
  const { wrapSSR, hashId } = useStyle(prefixCls);

  // 使用提前返回优化
  if (!title && !subtitle) {
    return null;
  }

  const mainCls = classNames(`${prefixCls}-main`, hashId);
  const subtitleCls = classNames(`${prefixCls}-subtitle`, hashId);

  return wrapSSR(
    <div className={classNames(prefixCls, hashId, className)} style={style}>
      {title && <div className={mainCls}>{title}</div>}
      {subtitle && <div className={subtitleCls}>{subtitle}</div>}
    </div>,
  );
};

TitleComponent.displayName = 'Title';

// 使用 React.memo 优化性能，避免不必要的重新渲染
const Title = memo(TitleComponent);

export default Title;
