import { ConfigProvider, Dropdown, Input, MenuProps, Tooltip } from 'antd';
import classNames from 'clsx';
import React, { useContext, useMemo, useState } from 'react';

export interface ComposerBranchOption {
  /** 分支全名（git branch 名） */
  name: string;
  /** 展示名（去 remote 前缀） */
  displayName: string;
  /** 是否远程分支 */
  isRemote: boolean;
  /** 是否当前分支 */
  isCurrent: boolean;
}

export interface ComposerBranchTriggerProps {
  /** 当前分支名（空 / undefined 时组件不渲染） */
  branchName?: string | null;
  /** tooltip 前缀文案，默认取 i18n */
  tooltipTitle?: string;
  /** 可切换的分支列表（不传则仅展示当前分支，不可下拉） */
  branches?: ComposerBranchOption[];
  /** 切换中（展示 loading，禁止操作） */
  switching?: boolean;
  /** 禁用（已有会话锁定切换，对齐 isComposerBranchSwitchLocked） */
  disabled?: boolean;
  /** 选择分支回调 */
  onSelectBranch?: (branchName: string) => void;
  /** 搜索过滤回调（不传用本地过滤） */
  onSearch?: (query: string) => void;
  /** 加载中 */
  loading?: boolean;
  prefixCls?: string;
  className?: string;
  testId?: string;
}

/**
 * ComposerBranchTrigger — 输入框工具栏的分支选择触发器。
 *
 * 对齐 dtcoder-ide ComposerBranchTrigger + ComposerBranchMenuView 的组合形态：
 * - 触发器：分支图标 + 当前分支名（长名 middle-ellipsis 由宿主 label 控制）+ 下拉箭头。
 * - 菜单：搜索框 + 分支列表（remote 标记 + 当前分支高亮）+ 新建分支入口。
 * - switching 时显示 loading 并禁用；disabled（会话锁定）时仅展示不可点。
 */
export const ComposerBranchTrigger: React.FC<ComposerBranchTriggerProps> = ({
  branchName,
  tooltipTitle,
  branches,
  switching = false,
  disabled = false,
  onSelectBranch,
  onSearch,
  loading = false,
  prefixCls,
  className,
  testId,
}) => {
  const antdContext = useContext(ConfigProvider.ConfigContext);
  const baseCls =
    prefixCls ?? antdContext?.getPrefixCls('agentic-branch-trigger');
  const [searchQuery, setSearchQuery] = useState('');
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    if (!branches) return [];
    const query = searchQuery.trim().toLowerCase();
    if (!query) return branches;
    return branches.filter(
      (b) =>
        b.name.toLowerCase().includes(query) ||
        b.displayName.toLowerCase().includes(query),
    );
  }, [branches, searchQuery]);

  if (!branchName?.trim()) return null;

  const menuItems: MenuProps['items'] = [
    {
      key: '__search__',
      label: (
        <Input
          size="small"
          value={searchQuery}
          placeholder="Search branches..."
          onChange={(e) => {
            setSearchQuery(e.target.value);
            onSearch?.(e.target.value);
          }}
          onMouseDown={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        />
      ),
      disabled: true,
    },
    { type: 'divider' },
    ...(loading
      ? [
          {
            key: '__loading__',
            label: 'Loading…',
            disabled: true,
          },
        ]
      : filtered.length === 0
        ? [
            {
              key: '__empty__',
              label: branches?.length ? 'No match' : 'No branches',
              disabled: true,
            },
          ]
        : filtered.map((b) => ({
            key: b.name,
            label: (
              <span
                className={classNames(`${baseCls}-option`, {
                  [`${baseCls}-option-current`]: b.isCurrent,
                })}
              >
                <span className={`${baseCls}-option-icon`}>⑂</span>
                <span className={`${baseCls}-option-name`} title={b.name}>
                  {b.displayName}
                </span>
                {b.isRemote ? (
                  <span className={`${baseCls}-option-remote`}>remote</span>
                ) : null}
                {b.isCurrent ? (
                  <span className={`${baseCls}-option-check`}>✓</span>
                ) : null}
              </span>
            ),
          }))),
  ];

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    if (e.key.startsWith('__')) return;
    onSelectBranch?.(e.key);
    setOpen(false);
  };

  const canDropdown = !!branches && !disabled && !switching;

  const triggerDom = (
    <button
      type="button"
      className={classNames(baseCls, className)}
      data-testid={testId ?? 'composer-branch-trigger'}
      data-branch-mode={canDropdown ? 'switch' : 'view'}
      disabled={disabled || switching}
      aria-label={`branch: ${branchName}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        height: 24,
        padding: '0 8px',
        borderRadius: 6,
        fontSize: 12,
        maxWidth: 200,
        border: 'none',
        background: 'transparent',
        color: disabled ? 'var(--ant-color-text-disabled, #999)' : 'inherit',
        cursor: canDropdown ? 'pointer' : 'default',
      }}
    >
      <span className={`${baseCls}-icon`} aria-hidden>
        ⑂
      </span>
      <span
        className={`${baseCls}-label`}
        style={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {branchName}
      </span>
      {switching ? (
        <span
          className={`${baseCls}-spinner`}
          aria-label="switching"
          style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            border: '2px solid currentColor',
            borderTopColor: 'transparent',
            animation: 'spin 0.8s linear infinite',
          }}
        />
      ) : canDropdown ? (
        <span
          className={`${baseCls}-chevron`}
          aria-hidden
          style={{ fontSize: 10 }}
        >
          ▾
        </span>
      ) : null}
    </button>
  );

  const wrapped = (
    <Tooltip title={tooltipTitle ?? branchName}>{triggerDom}</Tooltip>
  );

  if (!canDropdown) {
    return wrapped;
  }

  return (
    <Dropdown
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setSearchQuery('');
      }}
      menu={{ items: menuItems, onClick: handleMenuClick }}
      trigger={['click']}
    >
      {wrapped}
    </Dropdown>
  );
};
