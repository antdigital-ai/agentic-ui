import { MarkdownEditorProps } from '../MarkdownEditor';
import { BaseStyleProps } from '../Types';

export interface WhiteBoxProcessInterface {
  /** 分类类型
   * @example "TableSql"
   */
  category?:
    | 'TableSql'
    | 'ToolCall'
    | 'RagRetrieval'
    | 'DeepThink'
    | 'WebSearch'
    | 'other';
  isLoading?: boolean;
  /** 信息描述
   * @example "正在查询用户表数据"
   */
  info?: string;
  /** 执行耗时（毫秒）
   * @example 1500
   */
  costMillis?: number;
  input?: {
    /** SQL 查询语句
     * @example "SELECT * FROM users WHERE id = 1"
     */
    sql?: string;
    inputArgs?: {
      /** 请求体数据
       * @example { "name": "张三", "age": 25 }
       */
      requestBody?: Record<string, any>;
      /** URL 路径参数
       * @example { "id": "123", "type": "user" }
       */
      parameters?: Record<string, any>;
      /** URL 查询参数
       * @example { "page": 1, "size": 10 }
       */
      params?: Record<string, any>;
    };
    /** 搜索关键词列表
     * @example ["用户管理", "账户信息"]
     */
    searchQueries?: string[];
  };
  meta?: {
    /** 工具描述
     * @example "查询用户信息的接口"
     */
    description?: string;
    /** HTTP 请求方法
     * @example "GET"
     */
    method?: string;
    /** 工具名称
     * @example "getUserInfo"
     */
    name?: string;
    /** 接口路径
     * @example "/api/user/info"
     */
    path?: string;
    /** 请求数据
     * @example { "userId": 123 }
     */
    data?: Record<string, any>;
    /** 请求参数字符串
     * @example "userId=123&type=full"
     */
    requestParams?: string;
    /** 响应体
     * @example "{'code': 200, 'data': {...}}"
     */
    responseBody?: string;
    /** 响应状态
     * @example "success"
     */
    status?: string;
    /** 工具集唯一标识
     * @example "tool-set-001"
     */
    toolSetUuid?: string;
    /** 工具集版本号
     * @example 1
     */
    toolSetVersion?: number;
    /** 工具实例唯一标识
     * @example "tool-instance-001"
     */
    uuid?: string;
  };
  /**
   * 任务的 id，用于标识任务
   */
  runId?: string;
  output?: {
    type?: 'TOKEN' | 'TABLE' | 'CHUNK' | 'ERROR' | 'END' | 'RUNNING';
    data?: string;
    /** 错误信息
     * @example "查询失败：数据库连接超时"
     */
    errorMsg?: string;
    /** API 响应数据
     * @example { "status": "success", "data": { "id": 1, "name": "张三" } }
     */
    response?: Record<string, any>;
    /** 文档块数组
     * @example [{ "content": "产品介绍", "docMeta": { "doc_name": "产品手册" } }]
     */
    chunks?: Chunk[];
    /** 表格数据
     * @example { name: ['Tom', 'Jim', 'Lucy'],age: ['18', '20', '22'], address: ['Shanghai', 'Beijing', 'Hangzhou'] }
     */
    tableData?: Record<string, any>;
    /** 表格列名
     * @example ["id", "name", "age"]
     */
    columns?: string[];
  };
}

export interface Chunk {
  docMeta: DocMeta;
  content: string;
  originUrl: string;
}

export interface DocMeta {
  type?: string;
  doc_id?: string;
  upload_time?: string;
  doc_name?: string;
  origin_text?: string;
  answer?: string;
}

export interface ThoughtChainListProps extends BaseStyleProps {
  titleRender?: (
    props: ThoughtChainListProps,
    defaultDom: React.ReactNode,
  ) => React.ReactNode;
  thoughtChainList: WhiteBoxProcessInterface[];
  /**
   * @deprecated @since 2.29.0 请使用 isLoading 代替
   * @description 已废弃，将在未来版本移除
   */
  loading?: boolean;
  /** 加载状态 */
  isLoading?: boolean;
  bubble?: {
    isFinished?: boolean;
    endTime?: number;
    createAt?: number;
    isAborted?: boolean;
  };
  /**
   * @deprecated @since 2.30.0 请使用 bubble 代替
   * @description 旧版本兼容属性，将在未来版本移除
   */
  chatItem?: {
    isFinished?: boolean;
    endTime?: number;
    createAt?: number;
    isAborted?: boolean;
  };
  compact?: boolean;
  markdownRenderProps?: MarkdownEditorProps;
  finishAutoCollapse?: boolean;
  locale?: {
    thinking?: string;
    taskFinished?: string;
    taskCost?: string;
    taskAborted?: string;
    totalTimeUsed?: string;
    taskComplete?: string;
  };
  titleExtraRender?: (
    props: ThoughtChainListProps,
    defaultDom: React.ReactNode,
  ) => React.ReactNode;
  thoughtChainItemRender?: {
    titleExtraRender?: (
      item: WhiteBoxProcessInterface,
      defaultDom: React.ReactNode,
    ) => React.ReactNode;
    titleRender?: (
      item: WhiteBoxProcessInterface,
      defaultDom: React.ReactNode,
    ) => React.ReactNode;
    contentRender?: (
      item: WhiteBoxProcessInterface,
      defaultDom: React.ReactNode,
    ) => React.ReactNode;
  };
  onDocMetaClick?: (docMeta: DocMeta | null) => void;
}
