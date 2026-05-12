import {
  FileStack,
  Language,
  ListTodo,
  MousePointerClick,
  TreeDownArrow,
  X,
} from '@sofa-design/icons';
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

export type { FileActionRef } from './types';

enum ComponentType {
  REALTIME = 'realtime',
  BROWSER = 'browser',
  TASK = 'task',
  FILE = 'file',
  FILE_TREE = 'fileTree',
  CUSTOM = 'custom',
}

const DEFAULT_CONFIG = (locale: any): Record<ComponentType, TabItem> => ({
  [ComponentType.REALTIME]: {
    key: ComponentType.REALTIME,
    icon: <MousePointerClick />,
    title: locale?.['workspace.realtimeFollow'] || '实时跟随',
    label: locale?.['workspace.realtimeFollow'] || '实时跟随',
  },
  [ComponentType.BROWSER]: {
    key: ComponentType.BROWSER,
    icon: <Language />,
    title: locale?.['workspace.browser'] || '浏览器',
    label: locale?.['workspace.browser'] || '浏览器',
  },
  [ComponentType.TASK]: {
    key: ComponentType.TASK,
    icon: <ListTodo />,
    title: locale?.['workspace.task'] || '任务',
    label: locale?.['workspace.task'] || '任务',
  },
  [ComponentType.FILE]: {
    key: ComponentType.FILE,
    icon: <FileStack />,
    title: locale?.['workspace.file'] || '文件',
    label: locale?.['workspace.file'] || '文件',
  },
  [ComponentType.FILE_TREE]: {
    key: ComponentType.FILE_TREE,
    icon: <TreeDownArrow />,
    title: locale?.['workspace.fileTree'] || '文件树',
    label: locale?.['workspace.fileTree'] || '文件树',
  },
  [ComponentType.CUSTOM]: {
    key: ComponentType.CUSTOM,
    icon: null,
    title: locale?.['workspace.custom'] || '自定义',
    label: locale?.['workspace.custom'] || '自定义',
  },
});

const resolveTabConfig = (
  tab: TabConfiguration | undefined,
  defaultConfig: TabItem,
  index?: number,
) => ({
  key: tab?.key || defaultConfig.key + (index !== undefined ? `-${index}` : ''),
  icon: tab?.icon ?? defaultConfig.icon,
  title: tab?.title || defaultConfig.label,
  count: tab?.count,
});

const RealtimeComponent: FC<RealtimeProps> = ({ data }) =>
  data ? <RealtimeFollowList data={data} /> : null;

const BrowserComponent: FC<BrowserProps> = (props) => <Browser {...props} />;

const TaskComponent: FC<TaskProps> = ({ data, onItemClick }) =>
  data ? <TaskList data={data} onItemClick={onItemClick} /> : null;
const FileComponent: FC<FileProps> = (props) => <File {...props} />;
const FileTreeComponent: FC<FileTreeProps> = (props) => <FileTree {...props} />;
const CustomComponent: FC<CustomProps> = ({ children }) => children || null;

type WorkspaceChildComponent =
  | typeof RealtimeComponent
  | typeof BrowserComponent
  | typeof TaskComponent
  | typeof FileComponent
  | typeof FileTreeComponent
  | typeof CustomComponent;

const COMPONENT_MAP = new Map<WorkspaceChildComponent, ComponentType>([
  [RealtimeComponent, ComponentType.REALTIME],
  [BrowserComponent, ComponentType.BROWSER],
  [TaskComponent, ComponentType.TASK],
  [FileComponent, ComponentType.FILE],
  [FileTreeComponent, ComponentType.FILE_TREE],
  [CustomComponent, ComponentType.CUSTOM],
]);

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
  onTabChange,
  style,
  className,
  title,
  onClose,
  children,
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
  const [internalActiveTab, setInternalActiveTab] = useState('');

  const { availableTabs, segmentedOptions } = useMemo(() => {
    type PanelEntry = {
      wType: ComponentType;
      child: React.ReactElement;
      tabConfig: ReturnType<typeof resolveTabConfig>;
    };

    const panelEntries: PanelEntry[] = [];
    React.Children.forEach(children, (child, index) => {
      if (!React.isValidElement(child)) return;
      const wType = COMPONENT_MAP.get(child.type as WorkspaceChildComponent);
      if (!wType) return;
      const tabConfig = resolveTabConfig(
        child.props.tab,
        defaultConfig[wType],
        wType === ComponentType.CUSTOM ? index : undefined,
      );
      panelEntries.push({ wType, child, tabConfig });
    });

    const keys = panelEntries.map((e) => e.tabConfig.key);
    const isControlled = activeTabKey !== undefined;
    const effectiveKeyForReset =
      isControlled &&
      activeTabKey !== undefined &&
      activeTabKey !== null &&
      keys.includes(String(activeTabKey))
        ? String(activeTabKey)
        : internalActiveTab && keys.includes(internalActiveTab)
          ? internalActiveTab
          : (keys[0] ?? '');

    const firstRealtimeIndex = panelEntries.findIndex(
      (e) => e.wType === ComponentType.REALTIME,
    );

    const tabs: TabItem[] = panelEntries.map((entry) => {
      const { wType, child, tabConfig } = entry;
      const key = tabConfig.key;
      const shouldPassResetKey =
        (wType === ComponentType.FILE || wType === ComponentType.FILE_TREE) &&
        key === effectiveKeyForReset;

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
        content: React.createElement(child.type, {
          ...child.props,
          ...(shouldPassResetKey ? { resetKey } : {}),
        }),
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
        tab.componentType === ComponentType.REALTIME;
      if (isFirstRealtime && tabs.length > 1) {
        options.push({
          label: '',
          value: '__divider__',
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
    const currentKey = isControlled ? activeTabKey : internalActiveTab;

    if (!availableTabs.some((tab) => tab.key === currentKey)) {
      const firstKey = availableTabs[0].key;
      if (!isControlled) setInternalActiveTab(firstKey);
      onTabChange?.(firstKey);
    } else if (isControlled && currentKey !== internalActiveTab) {
      setInternalActiveTab(currentKey!);
    }
  }, [availableTabs, activeTabKey, internalActiveTab, onTabChange]);

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

  const currentActiveTab =
    availableTabs.find((tab) => tab.key === (activeTabKey ?? internalActiveTab))
      ?.key ??
    availableTabs[0]?.key ??
    '';

  const handleTabChange = (key: string | number) => {
    const tabKey = String(key);
    if (activeTabKey === undefined) setInternalActiveTab(tabKey);
    setResetKey((prev) => prev + 1);
    onTabChange?.(tabKey);
  };

  if (!availableTabs.length) return null;

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

Workspace.Realtime = RealtimeComponent;
Workspace.Browser = BrowserComponent;
Workspace.Task = TaskComponent;
Workspace.File = FileComponent;
Workspace.FileTree = FileTreeComponent;
Workspace.Custom = CustomComponent;

export * from './File';
export type { HtmlPreviewProps } from './HtmlPreview';
export type {
  BrowserProps,
  CustomProps,
  FileProps,
  FileTreeNode,
  FileTreeProps,
  RealtimeProps,
  TabConfiguration,
  TabItem,
  TaskProps,
  WorkspacePanelType,
  WorkspaceProps,
} from './types';
export default Workspace;
