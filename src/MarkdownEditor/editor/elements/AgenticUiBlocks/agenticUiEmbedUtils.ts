import type { Key } from 'react';
import type {
  SuggestionItem,
  SuggestionListProps,
} from '../../../../Components/SuggestionList';
import type {
  TaskItem,
  TaskListProps,
  TaskStatus,
} from '../../../../TaskList/types';

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
      const key =
        x.key !== undefined && x.key !== null ? String(x.key) : '';
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

  const variant =
    root && (root as { variant?: string }).variant === 'simple'
      ? 'simple'
      : 'default';

  const className =
    root && typeof (root as { className?: unknown }).className === 'string'
      ? (root as { className: string }).className
      : undefined;

  return { items, variant, className };
}

/**
 * 将 ```agentic-ui-usertoolbar JSON 规范化为 SuggestionListProps
 */
export function normalizeUserToolbarPropsFromJson(
  parsed: unknown,
): SuggestionListProps {
  const root =
    parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? parsed
      : null;
  const rawItems =
    root && Array.isArray((root as { items?: unknown }).items)
      ? (root as { items: unknown[] }).items
      : [];

  const items: SuggestionItem[] = rawItems
    .filter((x): x is Record<string, unknown> => !!x && typeof x === 'object')
    .filter((x) => typeof x.text === 'string')
    .map((x, i) => {
      const key: Key | undefined =
        typeof x.key === 'string' || typeof x.key === 'number'
          ? x.key
          : x.key !== undefined && x.key !== null
            ? String(x.key)
            : String(i);
      return {
        key,
        text: x.text as string,
        disabled: Boolean(x.disabled),
        tooltip: typeof x.tooltip === 'string' ? x.tooltip : undefined,
      };
    });

  const layout =
    root && (root as { layout?: string }).layout === 'vertical'
      ? 'vertical'
      : 'horizontal';

  const typeRaw = root ? (root as { type?: string }).type : undefined;
  const type =
    typeRaw === 'transparent' || typeRaw === 'white' || typeRaw === 'basic'
      ? typeRaw
      : 'basic';

  const className =
    root && typeof (root as { className?: unknown }).className === 'string'
      ? (root as { className: string }).className
      : undefined;

  return { items, layout, type, className };
}
