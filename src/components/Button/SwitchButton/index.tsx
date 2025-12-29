import { ChevronDown, ChevronUp } from '@sofa-design/icons';
import { Button, ConfigProvider } from 'antd';
import classNames from 'classnames';
import React, { useContext, useEffect, useState } from 'react';
import { useStyle } from './style';

export interface SwitchButtonProps {
  key?: React.Key;
  icon?: React.ReactNode;
  triggerIcon?: React.ReactNode;
  disabled?: boolean;
  active?: boolean;
  defaultActive?: boolean;
  onChange?: (active: boolean) => void;
  onClick?: () => void | Promise<void>;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export const SwitchButton: React.FC<SwitchButtonProps> = ({
  className,
  style,
  icon,
  triggerIcon,
  disabled,
  active,
  defaultActive,
  onChange,
  onClick,
  children,
}) => {
  const context = useContext(ConfigProvider.ConfigContext);
  const prefixCls = context?.getPrefixCls('switch-button');

  const { wrapSSR, hashId } = useStyle(prefixCls);

  const isControlled = typeof active === 'boolean';
  const [innerActive, setInnerActive] = useState<boolean>(
    active ?? defaultActive ?? false,
  );

  useEffect(() => {
    if (isControlled) {
      setInnerActive(!!active);
    }
  }, [active, isControlled]);

  const effectiveActive = isControlled ? !!active : innerActive;

  const rootCls = classNames(
    `${prefixCls}-button`,
    prefixCls,
    className,
    hashId,
    {
      [`${prefixCls}-active`]: effectiveActive,
      [`${prefixCls}-disabled`]: disabled,
    },
  );

  const handleClick = async () => {
    if (disabled) return;
    const next = !effectiveActive;
    if (!isControlled) setInnerActive(next);
    onChange?.(next);
    await onClick?.();
  };

  const renderTriggerIcon = () => {
    if (triggerIcon) return triggerIcon;
    return effectiveActive ? <ChevronUp /> : <ChevronDown />;
  };

  return wrapSSR(
    <Button
      disabled={disabled}
      onClick={handleClick}
      className={rootCls}
      style={style}
      role="button"
      aria-pressed={effectiveActive}
    >
      {icon && <span className={`${prefixCls}-icon`}>{icon}</span>}
      {children && <span className={`${prefixCls}-text`}>{children}</span>}
      <span className={`${prefixCls}-trigger-icon`}>{renderTriggerIcon()}</span>
    </Button>,
  );
};

export default SwitchButton;
