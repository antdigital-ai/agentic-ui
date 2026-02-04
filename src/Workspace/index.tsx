import {
  FileStack,
  Language,
  ListTodo,
  MousePointerClick,
  X,
} from '@sofa-design/icons';
import { ConfigProvider, Segmented } from 'antd';
import classNames from 'classnames';
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
import { File } from './File';
import { RealtimeFollowList } from './RealtimeFollow';
import { useWorkspaceStyle } from './style';
import { TaskList } from './Task';
import type {
  BrowserProps,
  CustomProps,
  FileProps,
  RealtimeProps,
  TabConfiguration,
  TabItem,
  TaskProps,
  WorkspaceProps,
} from './types';

export type { FileActionRef } from './types';

enum ComponentType {
  REALTIME = 'realtime',
  BROWSER = 'browser',
  TASK = 'task',
  FILE = 'file',
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
const CustomComponent: FC<CustomProps> = ({ children }) => children || null;

type WorkspaceChildComponent =
  | typeof RealtimeComponent
  | typeof BrowserComponent
  | typeof TaskComponent
  | typeof FileComponent
  | typeof CustomComponent;

const COMPONENT_MAP = new Map<WorkspaceChildComponent, ComponentType>([
  [RealtimeComponent, ComponentType.REALTIME],
  [BrowserComponent, ComponentType.BROWSER],
  [TaskComponent, ComponentType.TASK],
  [FileComponent, ComponentType.FILE],
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
  const defaultConfig = DEFAULT_CONFIG(locale);
  const [internalActiveTab, setInternalActiveTab] = useState('');
  const availableTabs = useMemo((): TabItem[] => {
    const tabs: TabItem[] = [];
    React.Children.forEach(children, (child, index) => {
      if (!React.isValidElement(child)) return;
      const componentType = COMPONENT_MAP.get(
        child.type as WorkspaceChildComponent,
      );
      if (!componentType) return;

      const tabConfig = resolveTabConfig(
        child.props.tab,
        defaultConfig[componentType],
        componentType === ComponentType.CUSTOM ? index : undefined,
      );
      tabs.push({
        key: tabConfig.key,
        icon: tabConfig.icon,
        componentType,
        label: (
          <div className={classNames(`${prefixCls}-tab-item`, hashId)}>
            <span className={classNames(`${prefixCls}-tab-title`, hashId)}>
              {tabConfig.title}
            </span>
            {tabConfig.count !== undefined && (
              <span className={classNames(`${prefixCls}-tab-count`, hashId)}>
                {tabConfig.count}
              </span>
            )}
          </div>
        ),
        content: React.createElement(child.type, {
          ...child.props,
          ...(componentType === ComponentType.FILE && { resetKey }),
        }),
      });
    });
    return tabs;
  }, [children, defaultConfig, hashId, prefixCls]);

  useEffect(() => {
    if (!availableTabs.length) return;
    const isControlled = activeTabKey !== undefined;
    const currentKey = isControlled ? activeTabKey : internalActiveTab;

    if (!availableTabs.some((tab) => tab.key === currentKey)) {
      const firstKey = availableTabs[0].key;
      if (!isControlled) setInternalActiveTab(firstKey);
      onTabChange?.(firstKey);
    } else if (isControlled) {
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
            options={availableTabs.reduce(
              (acc, { label, key, icon, componentType }, index) => {
                acc.push({ label, value: key, icon });
                // 只在第一个"实时跟随"组件后插入分割线
                const isFirstRealtime =
                  componentType === ComponentType.REALTIME &&
                  availableTabs.findIndex(
                    (tab) => tab.componentType === ComponentType.REALTIME,
                  ) === index;
                if (isFirstRealtime && availableTabs.length > 1) {
                  acc.push({
                    label: '',
                    value: '__divider__',
                    disabled: true,
                  });
                }
                return acc;
              },
              [] as any[],
            )}
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
Workspace.Custom = CustomComponent;

export * from './File';
export type { HtmlPreviewProps } from './HtmlPreview';
export type {
  BrowserProps,
  CustomProps,
  FileProps,
  RealtimeProps,
  TabConfiguration,
  TabItem,
  TaskProps,
  WorkspaceProps,
} from './types';
export default Workspace;
