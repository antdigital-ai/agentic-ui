import { PlusOutlined } from '@ant-design/icons';
import { Button, ConfigProvider, Tooltip, Typography } from 'antd';
import classNames from 'clsx';
import { motion } from 'framer-motion';
import React, { memo, useContext, useMemo } from 'react';
import { I18nContext } from '../I18n';
import {
  PauseIcon,
  PlayIcon,
  SimplePauseIcon,
  SimplePlayIcon,
  SimpleStopIcon,
  StopIcon,
} from './icons';
import Robot from './Robot';
import { useStyle } from './style';
import { AGENT_RUN_BAR_TEST_ID } from './testIds';
export * from './Robot';
export { AGENT_RUN_BAR_TEST_ID } from './testIds';

/**
 * 控制按钮 Tooltip 的展示延迟（秒）。
 * 抽出为模块级常量，避免在多处复用 magic number；如需全局调整悬浮提示
 * 灵敏度，仅修改此常量即可。
 */
const TOOLTIP_DELAY_SECONDS = 0.3;

/**
 * 任务状态可选值列表
 *
 * @remarks
 * - `running`：任务正在运行中
 * - `success`：任务已成功完成
 * - `error`：任务执行出错
 * - `pause`：任务已暂停
 * - `stopped`：任务已停止
 * - `cancelled`：任务已取消
 */
export const TaskStatusList = [
  'running',
  'success',
  'error',
  'pause',
  'stopped',
  'cancelled',
] as const;

/**
 * 任务状态联合类型
 *
 * 表示一个任务的"宏观状态"（终态或主流程态）。
 * 与 {@link TaskRunningStatus} 的区别：
 * - `TaskStatus` 偏"宏观结果"（成功/失败/取消/已停止/暂停/运行中）
 * - `TaskRunningStatus` 偏"运行过程态"（运行中/已完成/已暂停）
 *
 * 在判断 UI 状态时通常需要两者组合，例如 `taskStatus='running' && taskRunningStatus='pause'`
 * 表示"任务整体在运行中、当前被用户暂停"。
 */
export type TaskStatus = (typeof TaskStatusList)[number];

/**
 * 任务运行状态可选值列表
 *
 * @remarks
 * - `running`：正在运行中
 * - `complete`：已完成
 * - `pause`：已暂停
 */
export const TaskRunningStatusList = ['running', 'complete', 'pause'] as const;

/**
 * 任务运行状态联合类型
 *
 * 表示任务运行过程中的"过程态"，详见 {@link TaskStatus} 的对比说明。
 */
export type TaskRunningStatus = (typeof TaskRunningStatusList)[number];

/**
 * 任务状态常量对象（向后兼容）
 *
 * 推荐直接使用字符串字面量（如 `'running'`），可获得更好的 tree-shaking 与类型推导。
 * 该对象保留以兼容旧代码 `TASK_STATUS.RUNNING` 的写法。
 */
export const TASK_STATUS = {
  RUNNING: 'running',
  SUCCESS: 'success',
  ERROR: 'error',
  PAUSE: 'pause',
  STOPPED: 'stopped',
  CANCELLED: 'cancelled',
} as const satisfies Record<string, TaskStatus>;

/**
 * 任务状态常量对象的类型（向后兼容）
 *
 * @deprecated 请直接使用 {@link TaskStatus} 联合类型
 *
 * 此处与同名常量 `TASK_STATUS` 共享名称，依赖 TypeScript 的"值/类型命名空间合并"
 * 语义；ESLint 的 `no-redeclare` 不识别该模式，故在此显式禁用。
 */
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type TASK_STATUS = TaskStatus;

/**
 * 任务运行状态常量对象（向后兼容）
 *
 * 推荐直接使用字符串字面量（如 `'running'`），可获得更好的 tree-shaking 与类型推导。
 * 该对象保留以兼容旧代码 `TASK_RUNNING_STATUS.RUNNING` 的写法。
 */
export const TASK_RUNNING_STATUS = {
  RUNNING: 'running',
  COMPLETE: 'complete',
  PAUSE: 'pause',
} as const satisfies Record<string, TaskRunningStatus>;

/**
 * 任务运行状态常量对象的类型（向后兼容）
 *
 * @deprecated 请直接使用 {@link TaskRunningStatus} 联合类型
 *
 * 此处与同名常量 `TASK_RUNNING_STATUS` 共享名称，依赖 TypeScript 的"值/类型命名空间合并"
 * 语义；ESLint 的 `no-redeclare` 不识别该模式，故在此显式禁用。
 */
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type TASK_RUNNING_STATUS = TaskRunningStatus;

/**
 * 主题样式变体
 */
export type AgentRunBarVariant = 'simple' | 'default';

/**
 * @deprecated 请使用 {@link AgentRunBarVariant}
 */
export type TaskRunningVariant = AgentRunBarVariant;

/**
 * 任务操作按钮渲染函数
 */
export type AgentRunBarActionsRender = (props: {
  status?: TaskStatus;
  runningStatus?: TaskRunningStatus;
}) => React.ReactNode;

/**
 * @deprecated 请使用 {@link AgentRunBarActionsRender}
 */
export type TaskRunningActionsRender = AgentRunBarActionsRender;

/**
 * AgentRunBar 组件的属性接口
 *
 * @interface AgentRunBarProps
 */
export interface AgentRunBarProps {
  /** 任务状态（宏观/终态），详见 {@link TaskStatus} */
  taskStatus: TaskStatus;
  /** 任务运行状态（过程态），详见 {@link TaskRunningStatus} */
  taskRunningStatus: TaskRunningStatus;
  /** 创建新任务的回调函数 */
  onCreateNewTask?: () => void;
  /** 暂停任务的回调函数 */
  onPause?: () => void;
  /** 继续任务的回调函数 */
  onResume?: () => void;
  /** 停止任务的回调函数 */
  onStop?: () => void;
  /** 重新执行任务的回调函数 */
  onReplay?: () => void;
  /** 查看任务结果的回调函数 */
  onViewResult?: () => void;
  className?: string;
  style?: React.CSSProperties;
  /** 自定义图标 */
  icon?: React.ReactNode;
  /** 图标提示文案 */
  iconTooltip?: string;
  /** 标题文案 */
  title?: string;
  /** 描述文案 */
  description?: string;
  /**
   * 自定义操作按钮（actionNode 部分；不影响 stop/pause/resume 控制按钮）
   *
   * 三态语义：
   * - `undefined`：使用内置默认 actionNode（依据 `taskStatus` / `taskRunningStatus` 自动选择）
   * - `false`：不渲染任何自定义 actionNode；停止 / 暂停 / 继续控制按钮仍按状态显示
   * - 函数：调用并将其返回值作为 actionNode 渲染（返回 `false` / `null` 等同于不渲染该 actionNode）
   */
  actionsRender?: AgentRunBarActionsRender | false;
  /** 主题样式变体 */
  variant?: AgentRunBarVariant;
  /** 国际化配置 */
  locale?: {
    agentRunBar?: {
      play?: string;
      pause?: string;
      stop?: string;
      createNewTask?: string;
      replayTask?: string;
      newTask?: string;
      submitTask?: string;
    };
  };
}

/**
 * @deprecated 请使用 {@link AgentRunBarProps}
 */
export type TaskRunningProps = AgentRunBarProps;

/* -------------------------------------------------------------------------- */
/*  控制按钮（停止 / 暂停 / 继续）                                              */
/* -------------------------------------------------------------------------- */

interface ControlIconButtonProps {
  /** 按钮语义类型，决定 className 后缀（pause/play）与 aria-label 默认归属 */
  kind: 'pause' | 'play';
  /** Tooltip 与 aria-label 文案 */
  title?: string;
  /** 鼠标点击回调 */
  onClick?: () => void;
  /** 内部图标 */
  icon: React.ReactNode;
  /** 与样式系统拼接所需的 prefixCls */
  baseCls: string;
  /** cssinjs 注入产生的 hashId */
  hashId: string;
}

/**
 * 圆形控制按钮（停止 / 暂停 / 继续）。
 * 抽出以避免在「自定义 actionsRender 分支」与「默认分支」中重复 3 套 Tooltip+div 结构。
 */
const ControlIconButton: React.FC<ControlIconButtonProps> = ({
  kind,
  title,
  onClick,
  icon,
  baseCls,
  hashId,
}) => (
  <Tooltip title={title} mouseEnterDelay={TOOLTIP_DELAY_SECONDS}>
    <div
      className={classNames(`${baseCls}-${kind}`, hashId)}
      role="button"
      tabIndex={0}
      aria-label={title}
      onClick={onClick}
    >
      {icon}
    </div>
  </Tooltip>
);

interface ControlButtonsProps {
  isRunning: boolean;
  isPause: boolean;
  variant: AgentRunBarVariant;
  onStop?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  locale?: AgentRunBarProps['locale'];
  baseCls: string;
  hashId: string;
}

/**
 * 控制按钮组：根据当前是否运行 / 是否暂停状态以及各回调可用性，
 * 决定渲染「停止 / 暂停 / 继续」三个圆形控制按钮的子集。
 */
const ControlButtons: React.FC<ControlButtonsProps> = ({
  isRunning,
  isPause,
  variant,
  onStop,
  onPause,
  onResume,
  locale,
  baseCls,
  hashId,
}) => {
  const isSimple = variant === 'simple';
  return (
    <>
      {(isRunning || isPause) && onStop && (
        <ControlIconButton
          kind="pause"
          title={locale?.agentRunBar?.stop}
          onClick={onStop}
          icon={isSimple ? <SimpleStopIcon /> : <StopIcon />}
          baseCls={baseCls}
          hashId={hashId}
        />
      )}
      {isRunning && onPause && (
        <ControlIconButton
          kind="pause"
          title={locale?.agentRunBar?.pause}
          onClick={onPause}
          icon={isSimple ? <SimplePauseIcon /> : <PauseIcon />}
          baseCls={baseCls}
          hashId={hashId}
        />
      )}
      {isPause && onResume && (
        <ControlIconButton
          kind="play"
          title={locale?.agentRunBar?.play}
          onClick={onResume}
          icon={isSimple ? <SimplePlayIcon /> : <PlayIcon />}
          baseCls={baseCls}
          hashId={hashId}
        />
      )}
    </>
  );
};

/* -------------------------------------------------------------------------- */
/*  状态 → action 配置表                                                       */
/* -------------------------------------------------------------------------- */

/**
 * 单个 action 的配置。
 *
 * - `kind`：决定使用哪个回调与默认 button 样式
 * - `localeKey`：使用 `locale.agentRunBar` 中的哪个文案
 * - `primary?`：是否使用 antd `type="primary"`（仅 createNewTask 在 stopped/cancelled 用到）
 */
interface ActionConfig {
  kind: 'replay' | 'viewResult' | 'createNewTask';
  localeKey: 'replayTask' | 'submitTask' | 'newTask' | 'createNewTask';
  primary?: boolean;
}

/**
 * 「actionNode 部分」的状态机配置表。
 *
 * key 为状态匹配名（与下面 {@link resolveActionsKey} 中的判定保持一致），
 * value 为该状态下的按钮列表，按顺序渲染。
 *
 * 注意：本表只决定 actionNode（左侧业务按钮组），不包含 stop/pause/resume 控制按钮。
 */
const STATE_ACTION_CONFIG: Record<string, ActionConfig[]> = {
  pause: [{ kind: 'createNewTask', localeKey: 'newTask' }],
  stopped: [
    { kind: 'viewResult', localeKey: 'submitTask' },
    { kind: 'createNewTask', localeKey: 'createNewTask', primary: true },
  ],
  successComplete: [
    { kind: 'replay', localeKey: 'replayTask' },
    { kind: 'viewResult', localeKey: 'submitTask' },
    { kind: 'createNewTask', localeKey: 'newTask' },
  ],
  error: [
    { kind: 'replay', localeKey: 'replayTask' },
    { kind: 'viewResult', localeKey: 'submitTask' },
    { kind: 'createNewTask', localeKey: 'newTask' },
  ],
  default: [{ kind: 'createNewTask', localeKey: 'createNewTask' }],
};

/**
 * 把 (taskStatus, taskRunningStatus, isRunning, isPause) 映射到
 * {@link STATE_ACTION_CONFIG} 的 key。
 */
const resolveActionsKey = (
  taskStatus: TaskStatus,
  taskRunningStatus: TaskRunningStatus,
  isRunning: boolean,
  isPause: boolean,
): keyof typeof STATE_ACTION_CONFIG | null => {
  if (isPause) return 'pause';
  if (
    taskStatus === TASK_STATUS.STOPPED ||
    taskStatus === TASK_STATUS.CANCELLED
  ) {
    return 'stopped';
  }
  if (
    taskStatus === TASK_STATUS.SUCCESS &&
    taskRunningStatus === TASK_RUNNING_STATUS.COMPLETE
  ) {
    return 'successComplete';
  }
  if (taskStatus === TASK_STATUS.ERROR) return 'error';
  if (!isRunning && !isPause) return 'default';
  return null;
};

/* -------------------------------------------------------------------------- */
/*  渲染按钮组                                                                  */
/* -------------------------------------------------------------------------- */

const renderButtonGroup = ({
  taskStatus,
  taskRunningStatus,
  actionsRender,
  baseCls,
  hashId,
  locale,
  onCreateNewTask,
  onReplay,
  onViewResult,
  onPause,
  onResume,
  onStop,
  variant,
}: Pick<
  AgentRunBarProps,
  | 'taskStatus'
  | 'taskRunningStatus'
  | 'onCreateNewTask'
  | 'onPause'
  | 'onResume'
  | 'onStop'
  | 'onReplay'
  | 'onViewResult'
  | 'actionsRender'
  | 'locale'
  | 'variant'
> & {
  baseCls: string;
  hashId: string;
}): React.ReactElement => {
  const resolvedVariant: AgentRunBarVariant = variant ?? 'default';

  // 任务运行中状态
  const isRunning =
    taskStatus === TASK_STATUS.RUNNING &&
    taskRunningStatus === TASK_RUNNING_STATUS.RUNNING;

  // 任务已暂停状态
  const isPause =
    taskStatus === TASK_STATUS.PAUSE ||
    (taskStatus === TASK_STATUS.RUNNING &&
      taskRunningStatus === TASK_RUNNING_STATUS.PAUSE);

  // 控制按钮组（停止 / 暂停 / 继续），actionsRender 与默认分支共用
  const controls = (
    <ControlButtons
      isRunning={isRunning}
      isPause={isPause}
      variant={resolvedVariant}
      onStop={onStop}
      onPause={onPause}
      onResume={onResume}
      locale={locale}
      baseCls={baseCls}
      hashId={hashId}
    />
  );

  // ── 分支 1：调用方自定义 actionsRender（含 false 显式禁用）──────────────────
  if (actionsRender !== undefined) {
    const actionNode =
      typeof actionsRender === 'function'
        ? actionsRender({
            status: taskStatus,
            runningStatus: taskRunningStatus,
          })
        : actionsRender;

    return (
      <div className={classNames(`${baseCls}-button-wrapper`, hashId)}>
        {actionNode}
        {controls}
      </div>
    );
  }

  // ── 分支 2：默认逻辑，按状态映射配置表渲染 ─────────────────────────────────
  const callbackMap: Record<ActionConfig['kind'], (() => void) | undefined> = {
    replay: onReplay,
    viewResult: onViewResult,
    createNewTask: onCreateNewTask,
  };

  const actionsKey = resolveActionsKey(
    taskStatus,
    taskRunningStatus,
    isRunning,
    isPause,
  );
  const actionConfigs = actionsKey ? STATE_ACTION_CONFIG[actionsKey] : [];

  const actionNode = actionConfigs
    .map((cfg) => {
      const callback = callbackMap[cfg.kind];
      if (!callback) return null;
      const label = locale?.agentRunBar?.[cfg.localeKey];
      const isCreateNew = cfg.kind === 'createNewTask';
      return (
        <Button
          key={cfg.kind}
          {...(cfg.primary ? { type: 'primary' as const } : null)}
          onClick={callback}
          icon={isCreateNew ? <PlusOutlined /> : undefined}
          color="default"
          variant="solid"
          autoInsertSpace={isCreateNew ? undefined : false}
        >
          {label}
        </Button>
      );
    })
    .filter(Boolean);

  return (
    <div className={classNames(`${baseCls}-button-wrapper`, hashId)}>
      {actionNode}
      {controls}
    </div>
  );
};

/**
 * AgentRunBar 组件 - 智能体任务运行状态条
 *
 * 该组件以一条横向状态条的形式展示 AI 智能体任务的执行状态，包括运行中 /
 * 已暂停 / 已完成 / 出错等多种状态，并提供对应的操作按钮（暂停、继续、停止、
 * 重试、查看结果、新建任务等）。
 *
 * @component
 * @param {AgentRunBarProps} props - 组件属性
 *
 * @example
 * ```tsx
 * <AgentRunBar
 *   title="正在运行中"
 *   description="任务执行中..."
 *   taskStatus="running"
 *   taskRunningStatus="running"
 *   onPause={() => {}}
 *   onResume={() => {}}
 *   onStop={() => {}}
 *   onReplay={() => {}}
 *   onViewResult={() => {}}
 *   onCreateNewTask={() => {}}
 * />
 * ```
 */
const AgentRunBarComponent: React.FC<AgentRunBarProps> = (rest) => {
  const {
    className,
    taskRunningStatus,
    taskStatus,
    onPause,
    onResume,
    onCreateNewTask,
    onViewResult,
    onReplay,
    onStop,
    title,
    description,
    icon,
    iconTooltip,
    actionsRender,
    variant = 'default',
  } = rest;

  const context = useContext(ConfigProvider.ConfigContext);
  const baseCls = context?.getPrefixCls('agent-run-bar');
  const { wrapSSR, hashId } = useStyle(baseCls);

  // 从context获取国际化配置
  const { locale } = useContext(I18nContext);

  // 获取机器人状态
  const robotStatus = useMemo(() => {
    if (taskRunningStatus === TASK_RUNNING_STATUS.COMPLETE) {
      return 'dazing';
    }
    if (
      taskRunningStatus === TASK_RUNNING_STATUS.PAUSE ||
      taskStatus === TASK_STATUS.PAUSE
    ) {
      return 'pause';
    }
    if (
      taskStatus === TASK_STATUS.SUCCESS ||
      taskStatus === TASK_STATUS.ERROR
    ) {
      return 'default';
    }
    return 'thinking';
  }, [taskRunningStatus, taskStatus]);

  // 这里使用 framer-motion 的 `motion.div` + `layout="size"` 是为了在 AgentRunBar
  // 切换状态（如运行 → 暂停 → 完成）导致按钮组个数变化、整体宽高随之改变时，提供
  // 自动测量并补间宽高的过渡动画。
  //
  // 该能力难以用纯 CSS transition 等价实现：CSS transition 不支持从 `auto` 到具体
  // 像素值之间的过渡，必须先取得元素当前尺寸再设回固定值，等价于自行实现一遍
  // `useLayoutEffect + ResizeObserver + requestAnimationFrame`。
  //
  // 因此当前版本保留 framer-motion 依赖。如未来组件库整体去 framer-motion 化，
  // 可以替换为基于 ResizeObserver 的自定义 hook，逻辑等价但实现成本更高。
  return wrapSSR(
    <motion.div
      className={classNames(
        baseCls,
        hashId,
        className,
        `${baseCls}-${variant}`,
        {
          [`${baseCls}-with-description`]: description,
          [`${baseCls}-status-${robotStatus}`]: robotStatus,
        },
      )}
      data-testid={AGENT_RUN_BAR_TEST_ID}
      layout="size"
      transition={{ duration: 0.25, ease: 'easeOut' }}
      style={rest.style}
    >
      <div className={classNames(`${baseCls}-border`, hashId)} />
      <div className={classNames(`${baseCls}-background`, hashId)} />
      <div className={classNames(`${baseCls}-left`, hashId)}>
        {icon !== false && (
          <div className={classNames(`${baseCls}-left-icon-wrapper`, hashId)}>
            <Tooltip title={iconTooltip}>
              <Robot icon={icon} status={robotStatus} size={40} />
            </Tooltip>
          </div>
        )}
        {/* 文字区 */}
        <div className={classNames(`${baseCls}-left-content`, hashId)}>
          {title && (
            <Typography.Title
              className={classNames(`${baseCls}-left-main-text`, hashId)}
              ellipsis={{ tooltip: title, rows: description ? 1 : 2 }}
            >
              {title}
            </Typography.Title>
          )}
          {variant !== 'simple' && description && (
            <Typography.Text
              className={classNames(`${baseCls}-left-text`, hashId)}
              ellipsis={{ tooltip: description }}
            >
              {description}
            </Typography.Text>
          )}
        </div>
      </div>

      {/* 按钮区 */}
      {renderButtonGroup({
        taskStatus,
        taskRunningStatus,
        onCreateNewTask,
        onPause,
        onResume,
        onStop,
        onReplay,
        onViewResult,
        actionsRender,
        baseCls,
        hashId,
        locale,
        variant,
      })}
    </motion.div>,
  );
};

/**
 * AgentRunBar - 智能体任务运行状态条
 *
 * 使用 React.memo 优化性能，避免不必要的重新渲染。
 */
export const AgentRunBar = memo(AgentRunBarComponent);

/**
 * @deprecated 请使用 {@link AgentRunBar}。该别名保留以兼容旧代码，将在未来版本移除。
 */
export const TaskRunning = AgentRunBar;
