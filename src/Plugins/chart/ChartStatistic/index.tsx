import { QuestionCircleOutlined } from '@ant-design/icons';
import { ConfigProvider, Tooltip } from 'antd';
import classNames from 'classnames';
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
  theme?: 'light' | 'dark';
  size?: 'small' | 'default' | 'large';
  block?: boolean;
  extra?: React.ReactNode;
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
      <span className={classNames(`${prefixCls}-title`, hashId)}>{title}</span>
    ) : null;

    const questionIcon = tooltip ? (
      <Tooltip mouseEnterDelay={0.3} title={tooltip} placement="top">
        <QuestionCircleOutlined
          className={classNames(`${prefixCls}-question-icon`, hashId)}
        />
      </Tooltip>
    ) : null;

    const extraElement = extra ? <div>{extra}</div> : null;

    return (
      <div className={classNames(`${prefixCls}-header`, hashId)}>
        <div className={classNames(`${prefixCls}-header-left`, hashId)}>
          {titleElement}
          {questionIcon}
        </div>
        {extraElement}
      </div>
    );
  };

  return wrapSSR(
    <div
      className={classNames(
        prefixCls,
        `${prefixCls}-${theme}`,
        size !== 'default' && `${prefixCls}-${size}`,
        block && `${prefixCls}-block`,
        hashId,
        className,
      )}
    >
      {renderHeader()}
      <div className={classNames(`${prefixCls}-value`, hashId)}>
        {prefix && (
          <span className={classNames(`${prefixCls}-value-prefix`, hashId)}>
            {prefix}
          </span>
        )}
        {renderValue()}
        {suffix && (
          <span className={classNames(`${prefixCls}-value-suffix`, hashId)}>
            {suffix}
          </span>
        )}
      </div>
    </div>,
  );
};

export default ChartStatistic;
