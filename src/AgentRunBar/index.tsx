import { PlusOutlined } from '@ant-design/icons';
import { Button, ConfigProvider, Tooltip, Typography } from 'antd';
import classNames from 'classnames';
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
export * from './Robot';

/**
 * 任务状态枚举
 * @enum {string}
 */
export enum TASK_STATUS {
  /** 任务正在运行中 */
  RUNNING = 'running',
  /** 任务已成功完成 */
  SUCCESS = 'success',
  /** 任务执行出错 */
  ERROR = 'error',
  /** 任务已暂停 */
  PAUSE = 'pause',
  /** 任务已停止 */
  STOPPED = 'stopped',
  /** 任务已取消 */
  CANCELLED = 'cancelled',
}

/**
 * 任务运行状态枚举
 * @enum {string}
 */
export enum TASK_RUNNING_STATUS {
  /** 正在运行中 */
  RUNNING = 'running',
  /** 已完成 */
  COMPLETE = 'complete',
  /** 已暂停 */
  PAUSE = 'pause',
}

/**
 * 主题样式变体
 */
export type TaskRunningVariant = 'simple' | 'default';

/**
 * 任务操作按钮渲染函数
 */
export type TaskRunningActionsRender = (props: {
  status?: TASK_STATUS;
  runningStatus?: TASK_RUNNING_STATUS;
}) => React.ReactNode;

/**
 * TaskRunning组件的属性接口
 * @interface TaskRunningProps
 */
export interface TaskRunningProps {
  /** 任务状态 */
  taskStatus: TASK_STATUS;
  /** 任务运行状态 */
  taskRunningStatus: TASK_RUNNING_STATUS;
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
  /** 自定义操作按钮 */
  actionsRender?: TaskRunningActionsRender | false;
  /** 主题样式变体 */
  variant?: TaskRunningVariant;
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
 * 渲染按钮组的函数
 * 使用提前返回优化代码可读性
 *
 * @param status 任务状态
 * @param runningStatus 运行状态
 * @param callbacks 回调函数对象
 * @param baseCls 基础类名
 * @param hashId 哈希ID
 * @param locale 国际化配置
 * @returns 按钮组JSX
 */
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
  TaskRunningProps,
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
}) => {
  // 任务运行中状态
  const isRunning =
    taskStatus === TASK_STATUS.RUNNING &&
    taskRunningStatus === TASK_RUNNING_STATUS.RUNNING;

  // 任务已暂停状态
  const isPause =
    taskStatus === TASK_STATUS.PAUSE ||
    (taskStatus === TASK_STATUS.RUNNING &&
      taskRunningStatus === TASK_RUNNING_STATUS.PAUSE);

  // 处理自定义操作按钮（提前返回）
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
        {/* 控制按钮（停止、暂停、继续） */}
        {(isRunning || isPause) && onStop && (
          <Tooltip mouseEnterDelay={0.3} title={locale?.agentRunBar?.stop}>
            <div
              className={classNames(`${baseCls}-pause`, hashId)}
              role="button"
              tabIndex={0}
              aria-label={locale?.agentRunBar?.stop}
              onClick={onStop}
            >
              {variant === 'simple' ? <SimpleStopIcon /> : <StopIcon />}
            </div>
          </Tooltip>
        )}
        {isRunning && onPause && (
          <Tooltip title={locale?.agentRunBar?.pause} mouseEnterDelay={0.3}>
            <div
              className={classNames(`${baseCls}-pause`, hashId)}
              role="button"
              tabIndex={0}
              aria-label={locale?.agentRunBar?.pause}
              onClick={onPause}
            >
              {variant === 'simple' ? <SimplePauseIcon /> : <PauseIcon />}
            </div>
          </Tooltip>
        )}
        {isPause && onResume && (
          <Tooltip title={locale?.agentRunBar?.play} mouseEnterDelay={0.3}>
            <div
              className={classNames(`${baseCls}-play`, hashId)}
              role="button"
              tabIndex={0}
              aria-label={locale?.agentRunBar?.play}
              onClick={onResume}
            >
              {variant === 'simple' ? <SimplePlayIcon /> : <PlayIcon />}
            </div>
          </Tooltip>
        )}
      </div>
    );
  }

  // 根据任务状态渲染不同的操作按钮
  let actionNode: React.ReactNode = null;

  // 任务已暂停状态
  if (isPause) {
    if (onCreateNewTask) {
      actionNode = (
        <Button
          onClick={onCreateNewTask}
          icon={<PlusOutlined />}
          color="default"
          variant="solid"
        >
          {locale?.agentRunBar?.newTask}
        </Button>
      );
    }
  }
  // 任务已停止状态
  else if (
    taskStatus === TASK_STATUS.STOPPED ||
    taskStatus === TASK_STATUS.CANCELLED
  ) {
    if (onCreateNewTask) {
      actionNode = (
        <Button
          type="primary"
          onClick={onCreateNewTask}
          icon={<PlusOutlined />}
          color="default"
          variant="solid"
        >
          {locale?.agentRunBar?.createNewTask}
        </Button>
      );
    }
  }
  // 任务已完成状态
  else if (
    taskStatus === TASK_STATUS.SUCCESS &&
    taskRunningStatus === TASK_RUNNING_STATUS.COMPLETE
  ) {
    actionNode = (
      <>
        {onReplay && (
          <Button onClick={onReplay} variant="solid" autoInsertSpace={false}>
            {locale?.agentRunBar?.replayTask}
          </Button>
        )}
        {onViewResult && (
          <Button
            onClick={onViewResult}
            color="default"
            variant="solid"
            autoInsertSpace={false}
          >
            {locale?.agentRunBar?.submitTask}
          </Button>
        )}
        {onCreateNewTask && (
          <Button
            onClick={onCreateNewTask}
            icon={<PlusOutlined />}
            color="default"
            variant="solid"
          >
            {locale?.agentRunBar?.newTask}
          </Button>
        )}
      </>
    );
  }
  // 任务出错状态
  else if (taskStatus === TASK_STATUS.ERROR) {
    actionNode = (
      <>
        {onReplay && (
          <Button onClick={onReplay} variant="solid" autoInsertSpace={false}>
            {locale?.agentRunBar?.replayTask}
          </Button>
        )}
        {onCreateNewTask && (
          <Button
            onClick={onCreateNewTask}
            icon={<PlusOutlined />}
            color="default"
            variant="solid"
          >
            {locale?.agentRunBar?.newTask}
          </Button>
        )}
      </>
    );
  }
  // 默认状态（非运行中且非暂停）
  else if (!isRunning && !isPause) {
    if (onCreateNewTask) {
      actionNode = (
        <Button
          onClick={onCreateNewTask}
          icon={<PlusOutlined />}
          color="default"
          variant="solid"
        >
          {locale?.agentRunBar?.createNewTask}
        </Button>
      );
    }
  }

  const stopTitle = locale?.agentRunBar?.stop;
  const pauseTitle = locale?.agentRunBar?.pause;
  const playTitle = locale?.agentRunBar?.play;

  return (
    <div className={classNames(`${baseCls}-button-wrapper`, hashId)}>
      {actionNode}

      {/* 停止按钮 */}
      {(isRunning || isPause) && onStop && (
        <Tooltip mouseEnterDelay={0.3} title={stopTitle}>
          <div
            className={classNames(`${baseCls}-pause`, hashId)}
            role="button"
            tabIndex={0}
            aria-label={stopTitle}
            onClick={onStop}
          >
            {variant === 'simple' ? <SimpleStopIcon /> : <StopIcon />}
          </div>
        </Tooltip>
      )}
      {/* 暂停按钮 */}
      {isRunning && onPause && (
        <Tooltip title={pauseTitle} mouseEnterDelay={0.3}>
          <div
            className={classNames(`${baseCls}-pause`, hashId)}
            role="button"
            tabIndex={0}
            aria-label={pauseTitle}
            onClick={onPause}
          >
            {variant === 'simple' ? <SimplePauseIcon /> : <PauseIcon />}
          </div>
        </Tooltip>
      )}
      {/* 继续按钮 */}
      {isPause && onResume && (
        <Tooltip title={playTitle} mouseEnterDelay={0.3}>
          <div
            className={classNames(`${baseCls}-play`, hashId)}
            role="button"
            tabIndex={0}
            aria-label={playTitle}
            onClick={onResume}
          >
            {variant === 'simple' ? <SimplePlayIcon /> : <PlayIcon />}
          </div>
        </Tooltip>
      )}
    </div>
  );
};

/**
 * TaskRunning 组件 - 任务运行状态组件
 *
 * 该组件显示AI任务运行的状态信息，包括运行时间、状态指示、操作按钮等。
 * 支持多种任务状态：运行中、暂停、完成、重播等，提供完整的任务管理功能。
 *
 * @component
 * @description 任务运行状态组件，显示AI任务运行信息和操作按钮
 * @param {TaskRunningProps} props - 组件属性
 * @param {string} [props.className] - 自定义CSS类名
 * @param {React.CSSProperties} [props.style] - 自定义样式
 * @param {TASK_RUNNING_STATUS} [props.taskRunningStatus] - 任务运行状态
 * @param {TASK_STATUS} [props.taskStatus] - 任务状态
 * @param {() => void} [props.onPause] - 暂停任务回调
 * @param {() => void} [props.onResume] - 继续任务回调
 * @param {() => void} [props.onStop] - 停止任务回调
 * @param {() => void} [props.onCreateNewTask] - 创建新任务回调
 * @param {() => void} [props.onViewResult] - 查看结果回调
 * @param {() => void} [props.onReplay] - 重播任务回调
 * @param {string} [props.title] - 标题文案
 * @param {string} [props.description] - 描述文案
 * @param {React.ReactNode} [props.icon] - 自定义图标
 * @param {string} [props.iconTooltip] - 图标提示文案
 * @param {TaskRunningActionsRender | false} [props.actionsRender] - 自定义操作按钮
 * @param {TaskRunningVariant} [props.variant] - 样式变体
 *
 * @example
 * ```tsx
 * <TaskRunning
 *   title="正在运行中"
 *   description="任务执行中..."
 *   taskStatus={TASK_STATUS.RUNNING}
 *   taskRunningStatus={TASK_RUNNING_STATUS.RUNNING}
 *   onCreateNewTask={() => {}}
 *   onPause={() => {}}
 *   onResume={() => {}}
 *   onStop={() => {}}
 *   onReplay={() => {}}
 *   onViewResult={() => {}}
 *   icon="https://example.com/icon.png"
 *   iconTooltip="AI助手图标"
 * />
 * ```
 *
 * @returns {React.ReactElement} 渲染的任务运行状态组件
 *
 * @remarks
 * - 支持多种任务状态显示
 * - 提供任务操作按钮（暂停、继续、停止、重播、查看结果等）
 * - 支持自定义标题和描述文案
 * - 支持自定义图标和图标提示
 * - 提供机器人状态动画
 */
const TaskRunningComponent: React.FC<TaskRunningProps> = (rest) => {
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
  const baseCls = context?.getPrefixCls('task-running');
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

// 使用 React.memo 优化性能，避免不必要的重新渲染
export const TaskRunning = memo(TaskRunningComponent);
