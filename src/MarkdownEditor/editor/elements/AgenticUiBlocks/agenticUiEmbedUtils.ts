import type { CSSProperties } from 'react';
import type { AttachmentFile } from '../../../../MarkdownInputField/AttachmentButton/types';
import type {
  TaskItem,
  TaskListProps,
  TaskStatus,
} from '../../../../TaskList/types';
import type { ToolCall } from '../../../../ToolUseBar/BarItem';

const TASK_STATUSES: TaskStatus[] = ['success', 'pending', 'loading', 'error'];

const isTaskStatus = (v: unknown): v is TaskStatus =>
  typeof v === 'string' && (TASK_STATUSES as readonly string[]).includes(v);

/**
 * 将 ```agentic-ui-task JSON 规范化为 TaskListProps（与 parseCode 解析结果一致）
 */
export function normalizeTaskListPropsFromJson(parsed: unknown): TaskListProps {
  const root =
    parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? parsed
      : null;
  const rawItems =
    root && Array.isArray((root as { items?: unknown }).items)
      ? (root as { items: unknown[] }).items
      : Array.isArray(parsed)
        ? parsed
        : [];

  const items: TaskItem[] = rawItems
    .filter((x): x is Record<string, unknown> => !!x && typeof x === 'object')
    .map((x) => {
      const status: TaskStatus = isTaskStatus(x.status) ? x.status : 'pending';
      const key = x.key !== undefined && x.key !== null ? String(x.key) : '';
      const title =
        x.title === undefined || x.title === null ? undefined : String(x.title);
      let content: TaskItem['content'] = '';
      if (x.content !== undefined && x.content !== null) {
        if (Array.isArray(x.content)) {
          content = x.content.map((line) => String(line)).join('\n');
        } else {
          content = String(x.content);
        }
      }
      return { key, title, content, status };
    })
    .filter((item) => item.key.length > 0);

  const variantRaw = root ? (root as { variant?: string }).variant : undefined;
  /** 嵌入块默认紧凑摘要条；需完整任务链样式时设 `variant: "default"` */
  const variant: TaskListProps['variant'] =
    variantRaw === 'default' ? 'default' : 'simple';

  const className =
    root && typeof (root as { className?: unknown }).className === 'string'
      ? (root as { className: string }).className
      : undefined;

  return { items, variant, className };
}

const TOOL_STATUSES = ['idle', 'loading', 'success', 'error'] as const;

const isToolCallStatus = (v: unknown): v is NonNullable<ToolCall['status']> =>
  typeof v === 'string' && (TOOL_STATUSES as readonly string[]).includes(v);

const toolFromRecord = (x: Record<string, unknown>): ToolCall | null => {
  const id =
    x.id !== undefined && x.id !== null
      ? String(x.id)
      : x.key !== undefined && x.key !== null
        ? String(x.key)
        : '';
  if (!id) return null;

  const status = isToolCallStatus(x.status) ? x.status : 'idle';

  return {
    id,
    toolName:
      x.toolName !== undefined && x.toolName !== null ? String(x.toolName) : '',
    toolTarget:
      x.toolTarget !== undefined && x.toolTarget !== null
        ? String(x.toolTarget)
        : '',
    time: x.time !== undefined && x.time !== null ? String(x.time) : undefined,
    errorMessage:
      typeof x.errorMessage === 'string' ? x.errorMessage : undefined,
    type:
      x.type === 'summary' || x.type === 'normal' || typeof x.type === 'string'
        ? x.type
        : undefined,
    content:
      x.content !== undefined && x.content !== null
        ? String(x.content)
        : undefined,
    status,
    testId: typeof x.testId === 'string' ? x.testId : undefined,
  };
};

/**
 * 将 ```agentic-ui-toolusebar JSON 规范化为 ToolUseBar 所需 props
 *
 * 支持 `tools` 数组；旧版 `items`（text/key，原为 SuggestionList）会映射为最小 ToolCall
 */
export interface NormalizedToolUseBarEmbedProps {
  tools: ToolCall[];
  className?: string;
  style?: CSSProperties;
  light?: boolean;
  disableAnimation?: boolean;
}

export function normalizeToolUseBarPropsFromJson(
  parsed: unknown,
): NormalizedToolUseBarEmbedProps {
  const root =
    parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? parsed
      : null;

  let tools: ToolCall[] = [];

  if (root && Array.isArray((root as { tools?: unknown }).tools)) {
    const raw = (root as { tools: unknown[] }).tools;
    tools = raw
      .filter((x): x is Record<string, unknown> => !!x && typeof x === 'object')
      .map((x) => toolFromRecord(x))
      .filter((t): t is ToolCall => t !== null);
  } else if (root && Array.isArray((root as { items?: unknown }).items)) {
    const rawItems = (root as { items: unknown[] }).items;
    tools = rawItems
      .filter((x): x is Record<string, unknown> => !!x && typeof x === 'object')
      .filter((x) => typeof x.text === 'string')
      .map((x, i) => {
        const id =
          x.key !== undefined && x.key !== null ? String(x.key) : String(i);
        return toolFromRecord({
          ...x,
          id,
          toolName: x.text,
          toolTarget: '',
          status: 'idle',
        });
      })
      .filter((t): t is ToolCall => t !== null);
  }

  const className =
    root && typeof (root as { className?: unknown }).className === 'string'
      ? (root as { className: string }).className
      : undefined;

  const light =
    root && (root as { light?: unknown }).light === true ? true : undefined;

  const disableAnimation =
    root && (root as { disableAnimation?: unknown }).disableAnimation === true
      ? true
      : undefined;

  return { tools, className, light, disableAnimation };
}

export interface NormalizedFileMapEmbedProps {
  fileList: AttachmentFile[];
  className?: string;
  style?: CSSProperties;
}

const fileItemFromRecord = (
  x: Record<string, unknown>,
  index: number,
): AttachmentFile => {
  const name =
    x.name !== undefined && x.name !== null ? String(x.name) : `file-${index}`;
  const url =
    x.url !== undefined && x.url !== null ? String(x.url) : undefined;
  const previewUrl =
    x.previewUrl !== undefined && x.previewUrl !== null
      ? String(x.previewUrl)
      : undefined;
  const type =
    x.type !== undefined && x.type !== null ? String(x.type) : 'application/octet-stream';
  const size =
    typeof x.size === 'number' ? x.size : undefined;
  const uuid =
    x.uuid !== undefined && x.uuid !== null
      ? String(x.uuid)
      : x.id !== undefined && x.id !== null
        ? String(x.id)
        : `file-${index}`;

  const rawStatus = x.status;
  const status =
    rawStatus === 'error' ||
    rawStatus === 'uploading' ||
    rawStatus === 'pending' ||
    rawStatus === 'done'
      ? rawStatus
      : undefined;

  const errorMessage =
    typeof x.errorMessage === 'string' ? x.errorMessage : undefined;

  return {
    name,
    type,
    url,
    previewUrl,
    uuid,
    size,
    status,
    errorMessage,
  } as AttachmentFile;
};

/**
 * 将 ```agentic-ui-filemap JSON 规范化为 FileMapView 所需 props
 */
export function normalizeFileMapPropsFromJson(
  parsed: unknown,
): NormalizedFileMapEmbedProps {
  const root =
    parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? parsed
      : null;

  let rawItems: unknown[] = [];
  if (root && Array.isArray((root as { fileList?: unknown }).fileList)) {
    rawItems = (root as { fileList: unknown[] }).fileList;
  } else if (root && Array.isArray((root as { files?: unknown }).files)) {
    rawItems = (root as { files: unknown[] }).files;
  } else if (Array.isArray(parsed)) {
    rawItems = parsed;
  }

  const fileList: AttachmentFile[] = rawItems
    .filter((x): x is Record<string, unknown> => !!x && typeof x === 'object')
    .map((x, i) => fileItemFromRecord(x, i));

  const className =
    root && typeof (root as { className?: unknown }).className === 'string'
      ? (root as { className: string }).className
      : undefined;

  return { fileList, className };
}
