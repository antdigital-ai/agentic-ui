import { ChevronDown } from '@sofa-design/icons';
import { Button, ConfigProvider, Dropdown, Segmented } from 'antd';
import React, { useContext, useMemo, useRef } from 'react';
import { I18nContext } from '../../../../I18n';
import { debounce } from '../../utils';
import { useStyle } from './style';

export interface FilterOption {
  label: string;
  value: string;
}

export interface RegionOption {
  key: string;
  label: string;
}

export interface ChartFilterProps {
  filterOptions?: FilterOption[];
  selectedFilter?: string;
  onFilterChange?: (value: string) => void;
  customOptions?: RegionOption[];
  selectedCustomSelection?: string;
  onSelectionChange?: (region: string) => void;
  className?: string;
  /** 自定义CSS类名（支持多个类名） */
  classNames?: string | string[] | Record<string, boolean | undefined>;
  style?: React.CSSProperties;
  theme?: 'light' | 'dark';
  variant?: 'default' | 'compact';
  /** 自定义样式对象（支持多个样式对象） */
  styles?: React.CSSProperties | React.CSSProperties[];
}

const ChartFilterComponent: React.FC<ChartFilterProps> = ({
  filterOptions,
  selectedFilter,
  onFilterChange,
  customOptions,
  selectedCustomSelection,
  onSelectionChange,
  className = '',
  classNames: classNamesProp,
  style,
  styles,
  theme = 'light',
  variant = 'default',
}) => {
  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const i18n = useContext(I18nContext);
  const prefixCls = getPrefixCls('chart-filter');
  const { wrapSSR, hashId } = useStyle(prefixCls);

  // 使用 useRef 保存最新的回调函数，避免防抖函数闭包问题
  const onFilterChangeRef = useRef(onFilterChange);
  const onSelectionChangeRef = useRef(onSelectionChange);

  // 更新 ref，确保总是使用最新的回调
  React.useEffect(() => {
    onFilterChangeRef.current = onFilterChange;
    onSelectionChangeRef.current = onSelectionChange;
  }, [onFilterChange, onSelectionChange]);

  // 创建防抖的回调函数，1秒更新一次
  const debouncedFilterChange = useMemo(
    () =>
      debounce(
        function (value: string) {
          if (onFilterChangeRef.current) {
            onFilterChangeRef.current(value);
          }
        } as any,
        1000,
      ),
    [],
  );

  const debouncedSelectionChange = useMemo(
    () =>
      debounce(
        function (region: string) {
          if (onSelectionChangeRef.current) {
            onSelectionChangeRef.current(region);
          }
        } as any,
        1000,
      ),
    [],
  );

  // 组件卸载时清理防抖函数
  React.useEffect(() => {
    return () => {
      (debouncedFilterChange as any)?.cancel?.();
      (debouncedSelectionChange as any)?.cancel?.();
    };
  }, [debouncedFilterChange, debouncedSelectionChange]);

  const handleRegionChange = (region: string) => {
    (debouncedSelectionChange as any)(region);
  };

  const handleFilterChange = (value: string) => {
    (debouncedFilterChange as any)(value);
  };

  const hasMain = Array.isArray(filterOptions) && filterOptions.length > 1;
  const hasSecondary = Array.isArray(customOptions) && customOptions.length > 1;

  if (!hasMain && !hasSecondary) {
    return null;
  }
  if (!filterOptions || filterOptions.length < 2) {
    return null;
  }

  const mergedClassName = [
    prefixCls,
    `${prefixCls}-${theme}`,
    `${prefixCls}-${variant}`,
    hashId,
    className,
    classNamesProp,
  ]
    .filter(Boolean)
    .join(' ');
  const mergedStyle = {
    ...style,
    ...(Array.isArray(styles) ? Object.assign({}, ...styles) : styles || {}),
  };

  return wrapSSR(
    <div className={mergedClassName} style={mergedStyle}>
      {/* 地区筛选器，统一逻辑，只有可选时才显示 */}
      {customOptions && customOptions.length > 1 && (
        <div
          className={[`${prefixCls}-region-filter`, hashId]
            .filter(Boolean)
            .join(' ')}
        >
          <Dropdown
            menu={{
              items: customOptions.map((item) => {
                return {
                  key: item.key,
                  label: item.label,
                  disabled: item.key === selectedCustomSelection,
                };
              }),
              onClick: ({ key }) => handleRegionChange(key),
            }}
            trigger={['click']}
            getPopupContainer={() => document.body}
          >
            <Button
              type="default"
              size="small"
              className={[`${prefixCls}-region-dropdown-btn`, hashId]
                .filter(Boolean)
                .join(' ')}
            >
              <span>
                {customOptions.find((r) => r.key === selectedCustomSelection)
                  ?.label ||
                  i18n?.locale?.all ||
                  '全部'}
              </span>
              <ChevronDown
                className={[`${prefixCls}-dropdown-icon`, hashId]
                  .filter(Boolean)
                  .join(' ')}
              />
            </Button>
          </Dropdown>
        </div>
      )}

      {filterOptions && filterOptions.length > 1 && (
        <Segmented
          options={filterOptions || []}
          value={selectedFilter}
          size="small"
          className={[
            `${prefixCls}-segmented-filter`,
            'custom-segmented',
            hashId,
          ]
            .filter(Boolean)
            .join(' ')}
          onChange={(value) => handleFilterChange(value as string)}
        />
      )}
    </div>,
  );
};

const ChartFilter = ChartFilterComponent;

export default ChartFilter;
