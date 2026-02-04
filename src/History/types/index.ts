import { HistoryDataType } from './HistoryData';
import { HistoryListConfig } from './HistoryList';

export interface HistoryProps {
  agentId: string;
  standalone?: boolean;
  sessionId: string;
  /** 历史记录类型：'chat' | 'task' */
  type?: 'chat' | 'task';
  onInit?: () => void;
  onShow?: () => void;
  request: (params: { agentId: string }) => Promise<HistoryDataType[]>;
  /** @deprecated 请使用 onClick 替代 */
  onSelected?: (item: HistoryDataType) => void;
  onClick?: (sessionId: string, item: HistoryDataType) => void;
  /**
   * 删除历史记录项时的回调函数
   * @deprecated 建议使用 onDelete 替代（符合命名规范），但为保持兼容性暂时保留
   */
  onDeleteItem?: (sessionId: string) => void;
  customDateFormatter?: (date: number | string | Date) => string;
  itemDateFormatter?: (date: number | string | Date) => string;
  groupBy?: (item: HistoryDataType) => string;
  groupLabelRender?: HistoryListConfig['groupLabelRender'];
  extra?: (item: HistoryDataType) => React.ReactElement;
  customOperationExtra?: React.ReactNode;
  sessionSort?:
    | ((pre: HistoryDataType, current: HistoryDataType) => number | boolean)
    | false;
  /** 外部操作引用，用于触发 reload 等功能 */
  actionRef?: React.MutableRefObject<{
    reload: () => void;
  } | null>;
  /** Agent 模式配置 */
  agent?: {
    /** 是否启用 agent 模式 */
    enabled?: boolean;
    /** 搜索回调 */
    onSearch?: (keyword: string) => void;
    /** 收藏回调 */
    onFavorite?: (sessionId: string, isFavorite: boolean) => void;
    /** 多选回调 */
    onSelectionChange?: (selectedIds: string[]) => void;
    /** 查看更多回调 */
    onLoadMore?: () => void;
    /** 是否正在加载更多 */
    loadingMore?: boolean;
    /** 新对话回调 */
    onNewChat?: () => void;
    /** 正在运行的记录ID列表，这些记录将显示运行图标 */
    runningId?: string[];
    /** 搜索框配置 */
    searchOptions?: {
      /** 搜索输入框 placeholder 文案 */
      placeholder?: string;
      /** 未展开时的默认文本 */
      text?: string;
      /** 搜索触发方式: 'change' - 实时搜索(默认), 'enter' - 回车触发 */
      trigger?: 'change' | 'enter';
    };
  };
  /** 插槽 */
  slots?: {
    beforeHistoryList?: (list: HistoryDataType[]) => React.ReactNode;
  };
  /** 空状态渲染函数，当历史记录为空时显示 */
  emptyRender?: () => React.ReactNode;
  /**
   * @deprecated 请使用 isLoading 代替
   * @description 已废弃，将在未来版本移除
   */
  loading?: boolean;
  /** 加载状态，显示在 GroupMenu 区域 */
  isLoading?: boolean;
  /** 加载更多渲染函数, 用于自定义加载更多按钮的显示内容 */
  loadMoreRender?: () => React.ReactNode;
}

export interface HistoryActionsBoxProps {
  /** 子组件，通常是时间显示或其他内容 */
  children: React.ReactNode;
  /** 删除操作回调函数 */
  onDeleteItem?: () => void;
  /** 收藏操作回调函数 */
  /** Agent模式配置 */
  agent?: {
    /** 是否启用 agent 模式 */
    enabled?: boolean;
    /** 搜索回调 */
    onSearch?: (keyword: string) => void;
    /** 收藏回调 */
    onFavorite?: (sessionId: string, isFavorite: boolean) => void;
    /** 多选回调 */
    onSelectionChange?: (selectedIds: string[]) => void;
    /** 查看更多回调 */
    onLoadMore?: () => void;
    /** 是否正在加载更多 */
    loadingMore?: boolean;
  };
  /** 历史数据项 */
  item?: HistoryDataType;
  /** 收藏操作回调函数 */
  onFavorite?: (sessionId: string, isFavorite: boolean) => void;
}

/**
 * @deprecated 请使用 HistoryActionsBoxProps 替代
 */
export interface ActionsBoxProps extends HistoryActionsBoxProps {
  /** @deprecated 请使用 onClick 替代 */
  onSelected?: (item: HistoryDataType) => void;
}
