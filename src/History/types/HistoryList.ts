import { FormatTimeLocale } from '../utils';
import { HistoryDataType } from './HistoryData';

/**
 * 历史记录列表配置接口
 */
export interface HistoryListConfig {
  /** 过滤后的历史记录列表 */
  filteredList: HistoryDataType[];
  /** 选中的记录ID列表 */
  selectedIds: string[];
  /** 选择状态变化回调 */
  onSelectionChange: (sessionId: string, checked: boolean) => void;
  /** 选择记录回调 */
  onClick: (sessionId: string, item: HistoryDataType) => void;
  /** 删除记录回调 */
  onDeleteItem?: (sessionId: string) => Promise<void>;
  /** 收藏记录回调 */
  onFavorite?: (sessionId: string, isFavorite: boolean) => void;
  /** Agent配置 */
  agent?: {
    /** 是否启用agent模式 */
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
  };
  /** 分组标签渲染函数 */
  groupLabelRender?: (
    groupKey: string,
    items: HistoryDataType[],
    // 其他参数
    label: string,
  ) => React.ReactNode;
  /** 自定义日期格式化函数 */
  customDateFormatter?: (date: number | string | Date) => string;
  /** 格式化Item右下角日期函数 */
  itemDateFormatter?: (date: number | string | Date) => string;
  /** 分组函数 */
  groupBy?: (item: HistoryDataType) => string;
  /** 会话排序函数 */
  sessionSort?:
    | ((pre: HistoryDataType, current: HistoryDataType) => number | boolean)
    | false;
  /** 额外的渲染内容，接收历史记录项作为参数 */
  extra?: (item: HistoryDataType) => React.ReactElement;
  /** 历史记录类型：聊天记录或任务记录 */
  type?: 'chat' | 'task';
  /** 正在运行的记录ID列表，这些记录将显示运行图标 */
  runningId?: string[];
  /** 自定义操作区域 */
  customOperationExtra?: React.ReactNode;
  /**
   * 用于覆盖默认 formatTime 输出（"今日/昨日/一周内"）的 i18n 文案。
   * 一般由外层 History 组件从 I18nContext 组装后传入，generateHistoryItems 自身不读 React Context。
   */
  formatTimeLocale?: FormatTimeLocale;
}
