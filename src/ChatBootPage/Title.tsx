import { ConfigProvider } from 'antd';
import classNames from 'clsx';
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

  // wrapSSR 必须在 hooks 之后、early return 之前执行，确保 SSR 场景样式正常注入。
  // 无内容时返回空片段（仍经过 wrapSSR），避免 SSR 样式丢失。
  if (!title && !subtitle) {
    return wrapSSR(<></>);
  }

  const mainCls = classNames(`${prefixCls}-main`, hashId);
  const subtitleCls = classNames(`${prefixCls}-subtitle`, hashId);

  return wrapSSR(
    <div
      className={classNames(prefixCls, hashId, className)}
      data-testid="agentic-chatboot-title"
      style={style}
    >
      {title && <div className={mainCls}>{title}</div>}
      {subtitle && <div className={subtitleCls}>{subtitle}</div>}
    </div>,
  );
};

TitleComponent.displayName = 'Title';

// 使用 React.memo 优化性能，避免不必要的重新渲染
const Title = memo(TitleComponent);

export default Title;
