import { QuestionCircleOutlined } from '@ant-design/icons';
import { ConfigProvider, Tooltip } from 'antd';
import clsx from 'clsx';
import React, { useContext } from 'react';
import { useStyle } from './style';
import { formatNumber, NumberFormatOptions } from './utils';

/** 各子区域类名，用于 Semantic 样式定制 */
export interface ChartStatisticClassNames {
  root?: string;
  header?: string;
  headerLeft?: string;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  questionIcon?: string;
  value?: string;
  valuePrefix?: string;
  valueSuffix?: string;
  extra?: string;
}

/** 各子区域内联样式，用于 Semantic 样式定制 */
export interface ChartStatisticStyles {
  root?: React.CSSProperties;
  header?: React.CSSProperties;
  headerLeft?: React.CSSProperties;
  title?: React.CSSProperties;
  subtitle?: React.CSSProperties;
  questionIcon?: React.CSSProperties;
  value?: React.CSSProperties;
  valuePrefix?: React.CSSProperties;
  valueSuffix?: React.CSSProperties;
  extra?: React.CSSProperties;
}

export interface ChartStatisticProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  tooltip?: string;
  value?: number | string | null | undefined;
  precision?: number;
  groupSeparator?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  formatter?: (value: number | string | null | undefined) => React.ReactNode;
  className?: string;
  /** 各子区域类名（Semantic 样式） */
  classNames?: ChartStatisticClassNames;
  style?: React.CSSProperties;
  /** 各子区域内联样式（Semantic 样式） */
  styles?: ChartStatisticStyles;
  theme?: 'light' | 'dark';
  size?: 'small' | 'default' | 'large';
  block?: boolean;
  extra?: React.ReactNode;
}

const ChartStatistic: React.FC<ChartStatisticProps> = ({
  title,
  subtitle,
  tooltip,
  value,
  precision,
  groupSeparator = ',',
  prefix = '',
  suffix = '',
  formatter,
  className = '',
  classNames,
  style,
  styles,
  theme = 'light',
  size = 'default',
  block = false,
  extra,
}) => {
  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const prefixCls = getPrefixCls('chart-statistic');
  const { wrapSSR, hashId } = useStyle(prefixCls);

  // 渲染数值
  const renderValue = () => {
    // 如果提供了自定义格式化函数，优先使用
    if (formatter) {
      return formatter(value);
    }

    // 使用内置格式化逻辑
    const formatOptions: NumberFormatOptions = {
      precision,
      groupSeparator,
    };

    return formatNumber(value, formatOptions);
  };

  // 渲染标题、副标题和问号图标
  const renderHeader = () => {
    if (!title && !subtitle && !extra) return null;

    const titleElement = title ? (
      <span
        className={clsx(`${prefixCls}-title`, hashId, classNames?.title)}
        style={styles?.title}
      >
        {title}
      </span>
    ) : null;

    const subtitleElement = subtitle ? (
      <span
        className={clsx(`${prefixCls}-subtitle`, hashId, classNames?.subtitle)}
        style={styles?.subtitle}
      >
        {subtitle}
      </span>
    ) : null;

    const questionIcon = tooltip ? (
      <Tooltip mouseEnterDelay={0.3} title={tooltip} placement="top">
        <QuestionCircleOutlined
          className={clsx(
            `${prefixCls}-question-icon`,
            hashId,
            classNames?.questionIcon,
          )}
          style={styles?.questionIcon}
        />
      </Tooltip>
    ) : null;

    const extraElement = extra ? (
      <div className={classNames?.extra} style={styles?.extra}>
        {extra}
      </div>
    ) : null;

    const hasHeaderLeft = titleElement || subtitleElement || questionIcon;

    return (
      <div
        className={clsx(`${prefixCls}-header`, hashId, classNames?.header)}
        style={styles?.header}
      >
        {hasHeaderLeft && (
          <div
            className={clsx(
              `${prefixCls}-header-left`,
              hashId,
              classNames?.headerLeft,
            )}
            style={styles?.headerLeft}
          >
            {(titleElement || questionIcon) && (
              <div className={clsx(`${prefixCls}-header-row`, hashId)}>
                {titleElement}
                {questionIcon}
              </div>
            )}
            {subtitleElement}
          </div>
        )}
        {extraElement}
      </div>
    );
  };

  const rootClassName = clsx(
    prefixCls,
    `${prefixCls}-${theme}`,
    size !== 'default' && `${prefixCls}-${size}`,
    block && `${prefixCls}-block`,
    hashId,
    className,
    classNames?.root,
  );
  const rootStyle = { ...style, ...styles?.root };

  return wrapSSR(
    <div className={rootClassName} style={rootStyle}>
      {renderHeader()}
      <div
        className={clsx(`${prefixCls}-value`, hashId, classNames?.value)}
        style={styles?.value}
      >
        {prefix && (
          <span
            className={clsx(
              `${prefixCls}-value-prefix`,
              hashId,
              classNames?.valuePrefix,
            )}
            style={styles?.valuePrefix}
          >
            {prefix}
          </span>
        )}
        {renderValue()}
        {suffix && (
          <span
            className={clsx(
              `${prefixCls}-value-suffix`,
              hashId,
              classNames?.valueSuffix,
            )}
            style={styles?.valueSuffix}
          >
            {suffix}
          </span>
        )}
      </div>
    </div>,
  );
};

export default ChartStatistic;
