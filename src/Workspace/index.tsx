import { ApartmentOutlined, BarsOutlined } from '@ant-design/icons';
import { Language, ListTodo, MousePointerClick, X } from '@sofa-design/icons';
import type { SegmentedProps } from 'antd';
import { ConfigProvider, Segmented } from 'antd';
import classNames from 'clsx';
import React, {
  FC,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ActionIconBox } from '../Components/ActionIconBox';
import { I18nContext } from '../I18n';
import Browser from './Browser';
import { File, FileTree } from './File';
import { RealtimeFollowList } from './RealtimeFollow';
import { useWorkspaceStyle } from './style';
import { TaskList } from './Task';
import type {
  BaseChildProps,
  BrowserProps,
  CustomProps,
  FileProps,
  FileTreeProps,
  RealtimeProps,
  TabConfiguration,
  TabItem,
  TaskProps,
  WorkspacePanelType,
  WorkspaceProps,
} from './types';
import { WorkspaceTabCountDigits } from './WorkspaceTabCountDigits';
import {
  isFileWorkspacePanel,
  isWorkspacePanelType,
  isWorkspaceSegmentedDividerKey,
  markWorkspacePanel,
  normalizeTabKey,
  resolveWorkspacePanelType,
  WORKSPACE_SEGMENTED_DIVIDER_KEY,
} from './workspacePanel';

export {
  markWorkspacePanel,
  WORKSPACE_PANEL_TYPE,
  WORKSPACE_SEGMENTED_DIVIDER_KEY,
} from './workspacePanel';

export type { FileActionRef } from './types';

type PanelType = WorkspacePanelType;

const PANEL_TYPES = {
  REALTIME: 'realtime',
  BROWSER: 'browser',
  TASK: 'task',
  FILE: 'file',
  FILE_TREE: 'fileTree',
  CUSTOM: 'custom',
} as const satisfies Record<string, PanelType>;

const DEFAULT_CONFIG = (locale: any): Record<PanelType, TabItem> => ({
  [PANEL_TYPES.REALTIME]: {
    key: PANEL_TYPES.REALTIME,
    icon: <MousePointerClick />,
    title: locale?.['workspace.realtimeFollow'] || '实时跟随',
    label: locale?.['workspace.realtimeFollow'] || '实时跟随',
  },
  [PANEL_TYPES.BROWSER]: {
    key: PANEL_TYPES.BROWSER,
    icon: <Language />,
    title: locale?.['workspace.browser'] || '浏览器',
    label: locale?.['workspace.browser'] || '浏览器',
  },
  [PANEL_TYPES.TASK]: {
    key: PANEL_TYPES.TASK,
    icon: <ListTodo />,
    title: locale?.['workspace.task'] || '任务',
    label: locale?.['workspace.task'] || '任务',
  },
  [PANEL_TYPES.FILE]: {
    key: PANEL_TYPES.FILE,
    icon: <BarsOutlined />,
    title: locale?.['workspace.file'] || '文件',
    label: locale?.['workspace.file'] || '文件',
  },
  [PANEL_TYPES.FILE_TREE]: {
    key: PANEL_TYPES.FILE_TREE,
    icon: <ApartmentOutlined />,
    title: locale?.['workspace.fileTree'] || '文件树',
    label: locale?.['workspace.fileTree'] || '文件树',
  },
  [PANEL_TYPES.CUSTOM]: {
    key: PANEL_TYPES.CUSTOM,
    icon: null,
    title: locale?.['workspace.custom'] || '自定义',
    label: locale?.['workspace.custom'] || '自定义',
  },
});

const resolveTabConfig = (
  tab: TabConfiguration | undefined,
  defaultConfig: TabItem,
  index?: number,
) => {
  const customKey = normalizeTabKey(tab?.key);
  const baseKey =
    customKey && !isWorkspaceSegmentedDividerKey(customKey)
      ? customKey
      : defaultConfig.key + (index !== undefined ? `-${index}` : '');
  return {
    key: baseKey,
    icon: tab?.icon ?? defaultConfig.icon,
    title: tab?.title || defaultConfig.label,
    count: typeof tab?.count === 'number' && Number.isFinite(tab.count)
      ? tab.count
      : undefined,
  };
};

const flattenWorkspaceChildren = (
  nodes: React.ReactNode,
): React.ReactElement<BaseChildProps>[] => {
  const result: React.ReactElement<BaseChildProps>[] = [];
  React.Children.forEach(nodes, (child) => {
    if (!React.isValidElement(child)) {
      return;
    }
    if (child.type === React.Fragment) {
      flattenWorkspaceChildren(
        (child.props as { children?: React.ReactNode }).children,
      ).forEach((nested) => result.push(nested));
      return;
    }
    result.push(child as React.ReactElement<BaseChildProps>);
  });
  return result;
};

const ensureUniqueTabKey = (
  key: string,
  usedKeys: Set<string>,
  fallbackSeed: string,
): string => {
  if (!usedKeys.has(key)) {
    usedKeys.add(key);
    return key;
  }
  let candidate = `${key}-${fallbackSeed}`;
  let suffix = 1;
  while (usedKeys.has(candidate)) {
    candidate = `${key}-${fallbackSeed}-${suffix}`;
    suffix += 1;
  }
  usedKeys.add(candidate);
  return candidate;
};

const RealtimeComponent: FC<RealtimeProps> = ({ data }) =>
  data ? <RealtimeFollowList data={data} /> : null;

const BrowserComponent: FC<BrowserProps> = (props) => <Browser {...props} />;

const TaskComponent: FC<TaskProps> = ({ data, onItemClick }) =>
  data ? <TaskList data={data} onItemClick={onItemClick} /> : null;
const FileComponent: FC<FileProps> = (props) => <File {...props} />;
const FileTreeComponent: FC<FileTreeProps> = (props) => <FileTree {...props} />;
const CustomComponent: FC<CustomProps> = ({ children }) => children || null;

const resolveChildPanelType = (
  child: React.ReactElement<BaseChildProps>,
): PanelType | undefined => {
  const fromProps = child.props.panelType;
  if (fromProps !== null && fromProps !== undefined) {
    return isWorkspacePanelType(fromProps)
      ? fromProps
      : resolveWorkspacePanelType(child.type);
  }
  return resolveWorkspacePanelType(child.type);
};

const isValidReactPanelType = (type: unknown): boolean =>
  typeof type === 'function' || typeof type === 'object';

const pickFallbackTabKey = (
  tabs: TabItem[],
  preferredKey?: string,
): string => {
  const normalizedPreferred = normalizeTabKey(preferredKey);
  if (
    normalizedPreferred &&
    tabs.some((tab) => tab.key === normalizedPreferred)
  ) {
    return normalizedPreferred;
  }
  return tabs[0]?.key ?? '';
};

const shouldResetFilePreview = (
  fromKey: string,
  toKey: string,
  tabs: TabItem[],
): boolean => {
  if (!fromKey || fromKey === toKey) {
    return false;
  }
  const fromTab = tabs.find((tab) => tab.key === fromKey);
  if (!fromTab || !isFileWorkspacePanel(fromTab.componentType)) {
    return false;
  }
  const toTab = tabs.find((tab) => tab.key === toKey);
  if (!toTab) {
    return true;
  }
  if (!isFileWorkspacePanel(toTab.componentType)) {
    return true;
  }
  return fromTab.key !== toTab.key;
};

/**
 * 工作空间组件
 * 提供多标签页界面，支持实时跟随、浏览器、任务、文件等功能模块
 */
const Workspace: FC<WorkspaceProps> & {
  Realtime: typeof RealtimeComponent;
  Browser: typeof BrowserComponent;
  Task: typeof TaskComponent;
  File: typeof FileComponent;
  FileTree: typeof FileTreeComponent;
  Custom: typeof CustomComponent;
} = ({
  activeTabKey,
  defaultActiveTabKey,
  onTabChange,
  notifyOnInvalidActiveTabKey = true,
  preserveFilePreviewOnTabChange = false,
  style,
  className,
  title,
  onClose,
  children,
  emptyContent,
  pure = false,
  headerExtra,
}) => {
  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const { locale } = useContext(I18nContext);
  const prefixCls = getPrefixCls('workspace');
  const { wrapSSR, hashId } = useWorkspaceStyle(prefixCls);

  const containerRef = useRef<HTMLDivElement>(null);
  const [segmentedKey, setSegmentedKey] = useState(0);
  const [resetKey, setResetKey] = useState(0);

  const displayTitle = title ?? (locale?.['workspace.title'] || 'Workspace');
  const defaultConfig = useMemo(() => DEFAULT_CONFIG(locale), [locale]);
  const [internalActiveTab, setInternalActiveTab] = useState(
    () => defaultActiveTabKey ?? '',
  );

  const { availableTabs, segmentedOptions } = useMemo(() => {
    type PanelEntry = {
      wType: PanelType;
      child: React.ReactElement<BaseChildProps>;
      tabConfig: ReturnType<typeof resolveTabConfig>;
    };

    const panelEntries: PanelEntry[] = [];
    const usedTabKeys = new Set<string>();
    flattenWorkspaceChildren(children).forEach((child, index) => {
      if (!isValidReactPanelType(child.type)) {
        return;
      }
      const wType = resolveChildPanelType(child);
      if (!wType || !defaultConfig[wType]) {
        return;
      }
      const tabConfig = resolveTabConfig(
        child.props.tab,
        defaultConfig[wType],
        wType === PANEL_TYPES.CUSTOM ? index : undefined,
      );
      const uniqueKey = ensureUniqueTabKey(
        tabConfig.key,
        usedTabKeys,
        String(index),
      );
      panelEntries.push({
        wType,
        child,
        tabConfig: { ...tabConfig, key: uniqueKey },
      });
    });

    const keys = panelEntries.map((e) => e.tabConfig.key);
    const normalizedActiveTabKey = normalizeTabKey(activeTabKey);
    const normalizedInternalTab = normalizeTabKey(internalActiveTab);
    const isControlled = activeTabKey !== undefined;
    const effectiveKeyForReset =
      isControlled && keys.includes(normalizedActiveTabKey)
        ? normalizedActiveTabKey
        : normalizedInternalTab && keys.includes(normalizedInternalTab)
          ? normalizedInternalTab
          : (keys[0] ?? '');

    const firstRealtimeIndex = panelEntries.findIndex(
      (e) => e.wType === PANEL_TYPES.REALTIME,
    );

    const tabs: TabItem[] = panelEntries.map((entry) => {
      const { wType, child, tabConfig } = entry;
      const key = tabConfig.key;
      const shouldPassResetKey =
        isFileWorkspacePanel(wType) && key === effectiveKeyForReset;

      return {
        key,
        icon: tabConfig.icon,
        componentType: wType as WorkspacePanelType,
        label: (
          <div className={classNames(`${prefixCls}-tab-item`, hashId)}>
            <span className={classNames(`${prefixCls}-tab-title`, hashId)}>
              {tabConfig.title}
            </span>
            {tabConfig.count !== undefined && (
              <span
                className={classNames(`${prefixCls}-tab-count`, hashId)}
                data-testid={`workspace-tab-count--${tabConfig.key}`}
              >
                <WorkspaceTabCountDigits
                  tabKey={tabConfig.key}
                  value={tabConfig.count}
                  prefixCls={prefixCls}
                  hashId={hashId}
                />
              </span>
            )}
          </div>
        ),
        content: isValidReactPanelType(child.type)
          ? React.createElement(child.type, {
              ...child.props,
              ...(shouldPassResetKey ? { resetKey } : {}),
            })
          : null,
      };
    });

    const options: NonNullable<SegmentedProps['options']> = [];
    for (let i = 0; i < tabs.length; i += 1) {
      const tab = tabs[i];
      options.push({
        label: tab.label,
        value: tab.key,
        icon: tab.icon,
      });
      const isFirstRealtime =
        firstRealtimeIndex === i &&
        tab.componentType === PANEL_TYPES.REALTIME;
      if (isFirstRealtime && tabs.length > 1) {
        options.push({
          label: '',
          value: WORKSPACE_SEGMENTED_DIVIDER_KEY,
          disabled: true,
        });
      }
    }

    return { availableTabs: tabs, segmentedOptions: options };
  }, [
    children,
    defaultConfig,
    hashId,
    prefixCls,
    resetKey,
    activeTabKey,
    internalActiveTab,
  ]);

  useEffect(() => {
    if (!availableTabs.length) return;
    const isControlled = activeTabKey !== undefined;
    const currentKey = normalizeTabKey(
      isControlled ? activeTabKey : internalActiveTab,
    );
    const fallbackKey = pickFallbackTabKey(
      availableTabs,
      isControlled ? undefined : defaultActiveTabKey,
    );

    if (!currentKey || !availableTabs.some((tab) => tab.key === currentKey)) {
      if (!isControlled && fallbackKey) {
        setInternalActiveTab(fallbackKey);
      }
      if (
        notifyOnInvalidActiveTabKey &&
        fallbackKey &&
        fallbackKey !== currentKey
      ) {
        onTabChange?.(fallbackKey);
      }
    } else if (isControlled && currentKey !== normalizeTabKey(internalActiveTab)) {
      setInternalActiveTab(currentKey);
    }
  }, [
    availableTabs,
    activeTabKey,
    internalActiveTab,
    onTabChange,
    defaultActiveTabKey,
    notifyOnInvalidActiveTabKey,
  ]);

  // 监听容器宽度变化，强制 Segmented 重新渲染
  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    let lastWidth = el.getBoundingClientRect().width;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        if (width > 0 && lastWidth === 0) {
          setSegmentedKey((k) => k + 1);
        }
        lastWidth = width;
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const resolvedActiveKey = normalizeTabKey(activeTabKey ?? internalActiveTab);
  const currentActiveTab =
    availableTabs.find((tab) => tab.key === resolvedActiveKey)?.key ??
    pickFallbackTabKey(availableTabs, defaultActiveTabKey);

  const handleTabChange = (key: string | number) => {
    const tabKey = normalizeTabKey(key);
    if (!tabKey || isWorkspaceSegmentedDividerKey(tabKey)) {
      return;
    }
    if (!availableTabs.some((tab) => tab.key === tabKey)) {
      return;
    }
    if (tabKey === currentActiveTab) {
      return;
    }
    const previousKey = currentActiveTab;
    if (activeTabKey === undefined) {
      setInternalActiveTab(tabKey);
    }
    if (
      !preserveFilePreviewOnTabChange &&
      shouldResetFilePreview(previousKey, tabKey, availableTabs)
    ) {
      setResetKey((prev) => prev + 1);
    }
    onTabChange?.(tabKey);
  };

  if (!availableTabs.length) {
    return emptyContent ?? null;
  }

  return wrapSSR(
    <div
      ref={containerRef}
      className={classNames(
        prefixCls,
        {
          [`${prefixCls}-pure`]: pure,
        },
        className,
        hashId,
      )}
      style={style}
      data-testid="workspace"
    >
      <div
        className={classNames(`${prefixCls}-header`, hashId)}
        data-testid="workspace-header"
      >
        <div
          className={classNames(`${prefixCls}-title`, hashId)}
          data-testid="workspace-title"
        >
          {displayTitle}
        </div>
        <div className={classNames(`${prefixCls}-header-right`, hashId)}>
          {headerExtra}
          {onClose && (
            <ActionIconBox
              className={classNames(`${prefixCls}-close`, hashId)}
              onClick={onClose}
              title={locale?.['workspace.closeWorkspace'] || '关闭工作空间'}
              data-testid="workspace-close"
            >
              <X />
            </ActionIconBox>
          )}
        </div>
      </div>

      {availableTabs.length > 1 && (
        <div
          className={classNames(`${prefixCls}-tabs`, hashId)}
          data-testid="workspace-tabs"
        >
          <Segmented
            key={segmentedKey}
            className={classNames(`${prefixCls}-segmented`, hashId)}
            options={segmentedOptions}
            value={currentActiveTab}
            onChange={handleTabChange}
            block
            data-testid="workspace-segmented"
          />
        </div>
      )}

      <div
        className={classNames(`${prefixCls}-content`, hashId)}
        data-testid="workspace-content"
      >
        {availableTabs.find((tab) => tab.key === currentActiveTab)?.content}
      </div>
    </div>,
  );
};

Workspace.Realtime = markWorkspacePanel(RealtimeComponent, PANEL_TYPES.REALTIME);
Workspace.Browser = markWorkspacePanel(BrowserComponent, PANEL_TYPES.BROWSER);
Workspace.Task = markWorkspacePanel(TaskComponent, PANEL_TYPES.TASK);
Workspace.File = markWorkspacePanel(FileComponent, PANEL_TYPES.FILE);
Workspace.FileTree = markWorkspacePanel(
  FileTreeComponent,
  PANEL_TYPES.FILE_TREE,
);
Workspace.Custom = markWorkspacePanel(CustomComponent, PANEL_TYPES.CUSTOM);

export * from './File';
export type { HtmlPreviewProps } from './HtmlPreview';
export type {
  BrowserProps,
  CustomProps,
  FilePanelViewMode,
  FileProps,
  FileTreeNode,
  FileTreeProps,
  FileTreeSwitchConfig,
  RealtimeProps,
  TabConfiguration,
  TabItem,
  TaskProps,
  WorkspacePanelType,
  WorkspaceProps,
} from './types';
export default Workspace;
