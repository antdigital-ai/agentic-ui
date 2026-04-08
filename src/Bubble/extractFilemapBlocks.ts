const FILEMAP_FENCE_RE =
  /^```agentic-ui-filemap[ \t]*\r?\n([\s\S]*?)^```[ \t]*$/gm;

export interface FilemapBlock {
  raw: string;
  body: string;
}

/**
 * 从 markdown 字符串中提取所有 ```agentic-ui-filemap 代码块。
 *
 * 返回：
 * - `blocks`：提取到的代码块列表，每项包含原始文本和内部 JSON body
 * - `stripped`：移除了所有 filemap 块之后的干净 markdown 字符串
 *
 * 当消息内容中只含 filemap 块、没有其他文字时 `stripped` 为空字符串。
 */
export const extractFilemapBlocks = (
  content: string,
): { blocks: FilemapBlock[]; stripped: string } => {
  const blocks: FilemapBlock[] = [];
  const stripped = content.replace(
    FILEMAP_FENCE_RE,
    (raw: string, body: string) => {
      blocks.push({ raw, body: body.trim() });
      return '';
    },
  );
  return { blocks, stripped: stripped.trim() };
};
