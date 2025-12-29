import { Button, ConfigProvider } from 'antd';
import classNames from 'classnames';
import React, { useContext } from 'react';
import { useStyle } from './style';

export interface ToggleButtonProps {
  key?: React.Key;
  icon?: React.ReactNode;
  triggerIcon?: React.ReactNode;
  disabled?: boolean;
  active?: boolean;
  onClick?: () => void | Promise<void>;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export const ToggleButton: React.FC<ToggleButtonProps> = ({
  className,
  style,
  icon,
  triggerIcon,
  disabled,
  active,
  onClick,
  children,
}) => {
  const context = useContext(ConfigProvider.ConfigContext);
  const prefixCls = context?.getPrefixCls('toggle-button');

  const { wrapSSR, hashId } = useStyle(prefixCls);

  const rootCls = classNames(prefixCls, className, hashId);

  return wrapSSR(
    <div
      className={classNames(rootCls, {
        [`${prefixCls}-active`]: active,
        [`${prefixCls}-disabled`]: disabled,
      })}
      style={style}
    >
      <ConfigProvider
        wave={{
          disabled: true,
        }}
      >
        <Button
          disabled={disabled}
          onClick={onClick}
          className={classNames(`${prefixCls}-button`, hashId)}
          style={{
            border: 'none',
            background: 'transparent',
            padding: 0,
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            boxShadow: 'none',
          }}
        >
          {icon && (
            <span className={classNames(`${prefixCls}-icon`, hashId)}>
              {icon}
            </span>
          )}
          {children && (
            <span className={classNames(`${prefixCls}-text`, hashId)}>
              {children}
            </span>
          )}
          {triggerIcon && (
            <span className={classNames(`${prefixCls}-trigger-icon`, hashId)}>
              {triggerIcon}
            </span>
          )}
        </Button>
      </ConfigProvider>
    </div>,
  );
};
