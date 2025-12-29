import { QuestionCircleOutlined } from '@ant-design/icons';
import { ConfigProvider, Tooltip } from 'antd';
import React, { useContext } from 'react';
import { useStyle } from './style';
import { formatNumber, NumberFormatOptions } from './utils';

export interface ChartStatisticProps {
  title?: string;
  tooltip?: string;
  value?: number | string | null | undefined;
  precision?: number;
  groupSeparator?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  formatter?: (value: number | string | null | undefined) => React.ReactNode;
  className?: string;
  /** 自定义CSS类名（支持多个类名） */
  classNames?: string | string[] | Record<string, boolean | undefined>;
  style?: React.CSSProperties;
  theme?: 'light' | 'dark';
  size?: 'small' | 'default' | 'large';
  block?: boolean;
  extra?: React.ReactNode;
  /** 自定义样式对象（支持多个样式对象） */
  styles?: React.CSSProperties | React.CSSProperties[];
}

const ChartStatistic: React.FC<ChartStatisticProps> = ({
  title,
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

  // 渲染标题和问号图标
  const renderHeader = () => {
    if (!title && !extra) return null;

    const titleElement = title ? (
      <span
        className={[`${prefixCls}-title`, hashId].filter(Boolean).join(' ')}
      >
        {title}
      </span>
    ) : null;

    const questionIcon = tooltip ? (
      <Tooltip mouseEnterDelay={0.3} title={tooltip} placement="top">
        <QuestionCircleOutlined
          className={[`${prefixCls}-question-icon`, hashId]
            .filter(Boolean)
            .join(' ')}
        />
      </Tooltip>
    ) : null;

    const extraElement = extra ? <div>{extra}</div> : null;

    return (
      <div
        className={[`${prefixCls}-header`, hashId].filter(Boolean).join(' ')}
      >
        <div
          className={[`${prefixCls}-header-left`, hashId]
            .filter(Boolean)
            .join(' ')}
        >
          {titleElement}
          {questionIcon}
        </div>
        {extraElement}
      </div>
    );
  };

  const mergedClassName = [
    prefixCls,
    `${prefixCls}-${theme}`,
    size !== 'default' && `${prefixCls}-${size}`,
    block && `${prefixCls}-block`,
    hashId,
    className,
    classNames,
  ]
    .filter(Boolean)
    .join(' ');
  const mergedStyle = {
    ...style,
    ...(Array.isArray(styles) ? Object.assign({}, ...styles) : styles || {}),
  };

  return wrapSSR(
    <div className={mergedClassName} style={mergedStyle}>
      {renderHeader()}
      <div className={[`${prefixCls}-value`, hashId].filter(Boolean).join(' ')}>
        {prefix && (
          <span
            className={[`${prefixCls}-value-prefix`, hashId]
              .filter(Boolean)
              .join(' ')}
          >
            {prefix}
          </span>
        )}
        {renderValue()}
        {suffix && (
          <span
            className={[`${prefixCls}-value-suffix`, hashId]
              .filter(Boolean)
              .join(' ')}
          >
            {suffix}
          </span>
        )}
      </div>
    </div>,
  );
};

export default ChartStatistic;
