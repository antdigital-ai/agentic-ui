import { DownloadOutlined } from '@ant-design/icons';
import { ConfigProvider, Tooltip } from 'antd';
import classNames from 'classnames';
import React, { useContext } from 'react';
import { Loading } from '../../../../Components/Loading';
import { I18nContext } from '../../../../I18n';
import TimeIcon from '../icons/TimeIcon';
import { useStyle } from './style';

/**
 * @fileoverview 图表工具栏组件文件
 *
 * 该文件提供了图表工具栏组件的实现，用于显示图表标题、数据时间、下载按钮等。
 *
 * @author md-editor
 * @version 1.0.0
 * @since 2024
 */

/**
 * 图表工具栏属性接口
 *
 * 定义了图表工具栏组件的所有属性。
 *
 * @interface ChartToolBarProps
 * @since 1.0.0
 *
 * @example
 * ```typescript
 * const props: ChartToolBarProps = {
 *   title: '销售数据',
 *   dataTime: '2024-01-01 00:00:00',
 *   theme: 'light',
 *   onDownload: () => console.log('下载图表'),
 *   extra: <Button>自定义按钮</Button>
 * };
 * ```
 */
export interface ChartToolBarProps {
  /** 图表标题 */
  title?: string;
  /** 数据时间 */
  dataTime?: string;
  /** 自定义CSS类名 */
  className?: string;
  /** 图表主题 */
  theme?: 'light' | 'dark';
  /** 下载回调函数 */
  onDownload?: () => void;
  /** 额外内容 */
  extra?: React.ReactNode;
  /** 过滤器内容 */
  filter?: React.ReactNode;
  /** 是否显示加载状态（当图表未闭合时显示） */
  loading?: boolean;
}

/**
 * 图表工具栏组件
 *
 * 用于显示图表标题、数据时间、下载按钮等工具栏内容。
 * 支持主题切换、自定义内容、下载功能等。
 *
 * @component
 * @param {ChartToolBarProps} props - 组件属性
 * @returns {React.ReactElement | null} 图表工具栏组件，当没有标题和额外内容时返回 null
 *
 * @example
 * ```tsx
 * <ChartToolBar
 *   title="销售数据"
 *   dataTime="2024-01-01 00:00:00"
 *   theme="light"
 *   onDownload={() => console.log('下载图表')}
 *   extra={<Button>自定义按钮</Button>}
 * />
 * ```
 *
 * @since 1.0.0
 */
const ChartToolBar: React.FC<ChartToolBarProps> = ({
  title,
  dataTime,
  className = '',
  theme = 'light',
  onDownload,
  extra,
  filter,
  loading = false,
}) => {
  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const i18n = useContext(I18nContext);
  const prefixCls = getPrefixCls('chart-toolbar');
  const { wrapSSR, hashId } = useStyle(prefixCls);

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    }
  };

  if (!title && !extra) {
    return null;
  }

  return wrapSSR(
    <div
      className={classNames(
        prefixCls,
        `${prefixCls}-${theme}`,
        hashId,
        className,
      )}
    >
      {/* 左侧标题 */}
      <div className={classNames(`${prefixCls}-header-title`, hashId)}>
        {title}
        {loading && (
          <Loading
            style={{
              fontSize: '14px',
              marginLeft: '8px',
              flexShrink: 0,
            }}
          />
        )}
      </div>

      {/* 右侧时间+下载按钮 */}
      <div className={classNames(`${prefixCls}-header-actions`, hashId)}>
        {dataTime ? (
          <>
            <TimeIcon
              className={classNames(`${prefixCls}-time-icon`, hashId)}
            />
            <span className={classNames(`${prefixCls}-data-time`, hashId)}>
              {i18n?.locale?.dataTime || '数据时间'}: {dataTime}
            </span>
          </>
        ) : null}
        {filter}
        {extra}
        {handleDownload ? (
          <Tooltip
            mouseEnterDelay={0.3}
            title={i18n?.locale?.download || '下载'}
          >
            <DownloadOutlined
              className={classNames(`${prefixCls}-download-btn`, hashId)}
              onClick={handleDownload}
            />
          </Tooltip>
        ) : null}
      </div>
    </div>,
  );
};

export default ChartToolBar;
