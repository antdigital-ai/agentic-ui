import { ChevronDown, ChevronUp } from '@sofa-design/icons';
import { Button, ConfigProvider } from 'antd';
import classNames from 'clsx';
import React, { forwardRef, useContext, useState } from 'react';
import { useStyle } from './style';

export interface SwitchButtonProps {
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

export const SwitchButton = forwardRef<HTMLButtonElement, SwitchButtonProps>(
  (
    {
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
    },
    ref,
  ) => {
    const context = useContext(ConfigProvider.ConfigContext);
    const prefixCls = context?.getPrefixCls('switch-button');

    const { hashId } = useStyle(prefixCls);

    const isControlled = typeof active === 'boolean';
    const [innerActive, setInnerActive] = useState<boolean>(
      active ?? defaultActive ?? false,
    );

    // 受控时直接读 props.active，无需把外部值塞回 innerActive，避免冗余 state 同步
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

    return (
      <Button
        ref={ref}
        disabled={disabled}
        data-testid={prefixCls}
        onClick={handleClick}
        className={rootCls}
        style={style}
        role="button"
        aria-pressed={effectiveActive}
      >
        {icon && <span className={`${prefixCls}-icon`}>{icon}</span>}
        {children && <span className={`${prefixCls}-text`}>{children}</span>}
        <span className={`${prefixCls}-trigger-icon`}>
          {renderTriggerIcon()}
        </span>
      </Button>
    );
  },
);

SwitchButton.displayName = 'SwitchButton';

export default SwitchButton;
