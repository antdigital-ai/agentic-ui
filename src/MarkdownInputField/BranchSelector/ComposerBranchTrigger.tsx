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

/** 当前分支未提交变更概览（对齐 ComposerBranchMenuOverview） */
export interface ComposerBranchOverview {
  /** 未提交文件数 */
  fileCount: number;
  /** 新增行数 */
  insertions: number;
  /** 删除行数 */
  deletions: number;
}

export interface ComposerBranchTriggerProps {
  /** 当前分支名（空 / undefined 时组件不渲染） */
  branchName?: string | null;
  /** tooltip 前缀文案，默认取 i18n */
  tooltipTitle?: string;
  /** 可切换的分支列表（不传则仅展示当前分支，不可下拉） */
  branches?: ComposerBranchOption[];
  /** 当前分支未提交概览（菜单内当前分支行下展示） */
  currentBranchOverview?: ComposerBranchOverview | null;
  /** 切换中（展示 loading，禁止操作；也可传具体分支名仅对该分支 spinner） */
  switching?: boolean | string;
  /** 禁用（已有会话锁定切换，对齐 isComposerBranchSwitchLocked） */
  disabled?: boolean;
  /** 选择分支回调 */
  onSelectBranch?: (branchName: string) => void;
  /** 搜索过滤回调（不传用本地过滤） */
  onSearch?: (query: string) => void;
  /** 新建分支回调（不传不显示入口） */
  onCreateBranch?: () => void;
  /** 加载中 */
  loading?: boolean;
  /** 文案（对齐 ComposerBranchMenuLabels） */
  labels?: {
    searchPlaceholder?: string;
    switchHeading?: string;
    loading?: string;
    empty?: string;
    noMatch?: string;
    remote?: string;
    create?: string;
    uncommittedFiles?: (count: number) => string;
  };
  prefixCls?: string;
  className?: string;
  testId?: string;
}

const DEFAULT_LABELS = {
  searchPlaceholder: 'Search branches...',
  switchHeading: 'Switch branch',
  loading: 'Loading…',
  empty: 'No branches',
  noMatch: 'No match',
  remote: 'remote',
  create: 'Create branch',
  uncommittedFiles: (count: number) => `${count} uncommitted files`,
};

/**
 * ComposerBranchTrigger — 输入框工具栏的分支选择触发器。
 *
 * 对齐 dtcoder-ide ComposerBranchTrigger + ComposerBranchMenuView 的组合形态：
 * - 触发器：分支图标 + 当前分支名 + 下拉箭头；切换中显示 loading 并禁用。
 * - 菜单：搜索框 + 分支列表（remote 标记 + 当前分支高亮 + 未提交概览
 *   + 逐分支切换 spinner）+ 新建分支入口。
 * - disabled（会话锁定）时仅展示不可点。
 */
export const ComposerBranchTrigger: React.FC<ComposerBranchTriggerProps> = ({
  branchName,
  tooltipTitle,
  branches,
  currentBranchOverview,
  switching = false,
  disabled = false,
  onSelectBranch,
  onSearch,
  onCreateBranch,
  loading = false,
  labels,
  prefixCls,
  className,
  testId,
}) => {
  const antdContext = useContext(ConfigProvider.ConfigContext);
  const baseCls =
    prefixCls ?? antdContext?.getPrefixCls('agentic-branch-trigger');
  const [searchQuery, setSearchQuery] = useState('');
  const [open, setOpen] = useState(false);

  const mergedLabels = { ...DEFAULT_LABELS, ...labels };
  const switchingBranchName = typeof switching === 'string' ? switching : null;
  const isSwitchingAny = switching === true || !!switchingBranchName;

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
          placeholder={mergedLabels.searchPlaceholder}
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
    {
      key: '__heading__',
      label: (
        <span className={`${baseCls}-heading`}>
          {mergedLabels.switchHeading}
        </span>
      ),
      disabled: true,
    },
    ...(loading
      ? [
          {
            key: '__loading__',
            label: mergedLabels.loading,
            disabled: true,
          },
        ]
      : filtered.length === 0
        ? [
            {
              key: '__empty__',
              label: branches?.length
                ? mergedLabels.noMatch
                : mergedLabels.empty,
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
                <span className={`${baseCls}-option-icon`} aria-hidden>
                  ⑂
                </span>
                <span className={`${baseCls}-option-main`}>
                  <span className={`${baseCls}-option-title`}>
                    <span className={`${baseCls}-option-name`} title={b.name}>
                      {b.displayName}
                    </span>
                    {b.isRemote ? (
                      <span className={`${baseCls}-option-remote`}>
                        {mergedLabels.remote}
                      </span>
                    ) : null}
                  </span>
                  {b.isCurrent &&
                  currentBranchOverview &&
                  currentBranchOverview.fileCount > 0 ? (
                    <span className={`${baseCls}-option-overview`}>
                      {mergedLabels.uncommittedFiles(
                        currentBranchOverview.fileCount,
                      )}{' '}
                      <span className={`${baseCls}-option-overview-add`}>
                        +{currentBranchOverview.insertions}
                      </span>{' '}
                      <span className={`${baseCls}-option-overview-del`}>
                        -{currentBranchOverview.deletions}
                      </span>
                    </span>
                  ) : null}
                </span>
                {switchingBranchName === b.name ? (
                  <span
                    className={`${baseCls}-option-spinner`}
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
                ) : b.isCurrent ? (
                  <span className={`${baseCls}-option-check`}>✓</span>
                ) : null}
              </span>
            ),
          }))),
    ...(onCreateBranch
      ? [
          { type: 'divider' as const },
          {
            key: '__create__',
            label: (
              <span className={`${baseCls}-create`}>
                <span aria-hidden>＋</span> {mergedLabels.create}
              </span>
            ),
          },
        ]
      : []),
  ];

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    if (e.key === '__create__') {
      onCreateBranch?.();
      setOpen(false);
      return;
    }
    if (e.key.startsWith('__')) return;
    onSelectBranch?.(e.key);
    setOpen(false);
  };

  const canDropdown = !!branches && !disabled && !isSwitchingAny;

  const triggerDom = (
    <button
      type="button"
      className={classNames(baseCls, className)}
      data-testid={testId ?? 'composer-branch-trigger'}
      data-branch-mode={canDropdown ? 'switch' : 'view'}
      disabled={disabled || isSwitchingAny}
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
      {isSwitchingAny ? (
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
