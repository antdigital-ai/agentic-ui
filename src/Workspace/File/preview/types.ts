/**
 * 预览组件加载的内容状态机
 *
 * - idle：尚未尝试加载
 * - loading：正在拉取远程内容
 * - ready：内容已准备好，`mdContent` 可直接喂给 MarkdownEditor
 * - error：加载或解析失败，包含错误信息
 */
export type ContentState =
  | {
      status: 'idle' | 'loading' | 'ready';
      mdContent: string;
      rawContent?: string;
    }
  | { status: 'error'; error: string };
