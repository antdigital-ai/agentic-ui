import { ChevronDown } from '@sofa-design/icons';
import { Button, ConfigProvider, Dropdown, Segmented } from 'antd';
import classNames from 'classnames';
import React, { useContext } from 'react';
import { I18nContext } from '../../../../I18n';
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
  theme?: 'light' | 'dark';
  variant?: 'default' | 'compact';
}

const ChartFilter: React.FC<ChartFilterProps> = ({
  filterOptions,
  selectedFilter,
  onFilterChange,
  customOptions,
  selectedCustomSelection,
  onSelectionChange,
  className = '',
  theme = 'light',
  variant = 'default',
}) => {
  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const i18n = useContext(I18nContext);
  const prefixCls = getPrefixCls('chart-filter');
  const { wrapSSR, hashId } = useStyle(prefixCls);

  const handleRegionChange = (region: string) => {
    if (onSelectionChange) {
      onSelectionChange(region);
    }
  };

  const hasMain = Array.isArray(filterOptions) && filterOptions.length > 1;
  const hasSecondary = Array.isArray(customOptions) && customOptions.length > 1;

  if (!hasMain && !hasSecondary) {
    return null;
  }
  if (!filterOptions || filterOptions.length < 2) {
    return null;
  }

  return wrapSSR(
    <div
      className={classNames(
        prefixCls,
        `${prefixCls}-${theme}`,
        `${prefixCls}-${variant}`,
        hashId,
        className,
      )}
    >
      {/* 地区筛选器，统一逻辑，只有可选时才显示 */}
      {customOptions && customOptions.length > 1 && (
        <div className={classNames(`${prefixCls}-region-filter`, hashId)}>
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
              className={classNames(`${prefixCls}-region-dropdown-btn`, hashId)}
            >
              <span>
                {customOptions.find((r) => r.key === selectedCustomSelection)
                  ?.label ||
                  i18n?.locale?.all ||
                  '全部'}
              </span>
              <ChevronDown
                className={classNames(`${prefixCls}-dropdown-icon`, hashId)}
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
          className={classNames(
            `${prefixCls}-segmented-filter`,
            'custom-segmented',
            hashId,
          )}
          onChange={(value) => onFilterChange?.(value as string)}
        />
      )}
    </div>,
  );
};

export default ChartFilter;
