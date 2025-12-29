import { Button, ConfigProvider, Tooltip } from 'antd';
import classNames from 'classnames';
import React, { useContext } from 'react';
import { useStyle } from './style';

export interface IconButtonProps {
  key?: React.Key;
  icon?: React.ReactNode;
  tooltip?: string;
  disabled?: boolean;
  active?: boolean;
  elevated?: boolean;
  size?: 'base' | 'sm' | 'xs';
  /**
   * @deprecated 请使用 isLoading 代替
   * @description 已废弃，将在未来版本移除
   */
  loading?: boolean;
  /** 加载状态 */
  isLoading?: boolean;
  onClick?: () => void | Promise<void>;
  className?: string;
  style?: React.CSSProperties;
}

export const IconButton: React.FC<IconButtonProps> = ({
  className,
  style,
  icon,
  tooltip,
  disabled,
  active,
  elevated,
  size = 'base',
  loading: legacyLoading,
  isLoading,
  onClick,
}) => {
  // 兼容旧属性
  const loading = isLoading ?? legacyLoading;
  const context = useContext(ConfigProvider.ConfigContext);
  const prefixCls = context?.getPrefixCls('icon-button');

  const { wrapSSR, hashId } = useStyle(prefixCls);

  const rootCls = classNames(prefixCls, className, hashId);

  return wrapSSR(
    <div className={rootCls} style={style}>
      <Tooltip title={tooltip}>
        <Button
          icon={icon}
          disabled={disabled}
          loading={loading}
          onClick={onClick}
          className={classNames(`${prefixCls}-button`, hashId, {
            [`${prefixCls}-button-active`]: active,
            [`${prefixCls}-button-loading`]: loading,
            [`${prefixCls}-button-disabled`]: disabled,
            [`${prefixCls}-button-elevated`]: elevated,
            [`${prefixCls}-button-sm`]: size === 'sm',
            [`${prefixCls}-button-xs`]: size === 'xs',
          })}
        />
      </Tooltip>
    </div>,
  );
};

export default IconButton;
