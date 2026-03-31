import json5 from 'json5';
import { normalizeFileMapPropsFromJson } from '../../MarkdownEditor/editor/elements/AgenticUiBlocks/agenticUiEmbedUtils';
import partialParse from '../../MarkdownEditor/editor/parser/json-parse';
import type { AttachmentFile } from '../../MarkdownInputField/AttachmentButton/types';

const FILE_MAP_BLOCK_RE =
  /```agentic-ui-filemap\s*([\s\S]*?)```/gi;

/**
 * 从 markdown 正文中移除所有 agentic-ui-filemap 代码块，返回净化后的内容。
 */
export const removeFileMapBlocks = (content: string): string =>
  content.replace(FILE_MAP_BLOCK_RE, '').replace(/\n{3,}/g, '\n\n').trim();

const parseBody = (body: string): unknown => {
  const trimmed = body.trim();
  if (!trimmed) return null;
  try {
    return json5.parse(trimmed);
  } catch {
    try {
      return partialParse(trimmed);
    } catch {
      return null;
    }
  }
};

/**
 * 从 markdown 正文中提取所有 agentic-ui-filemap 代码块，合并文件列表。
 * 返回 null 表示正文中没有该代码块。
 */
export const extractFileMapFromContent = (
  content: string | undefined | null,
): Map<string, AttachmentFile> | null => {
  if (!content) return null;

  const allFiles: AttachmentFile[] = [];

  let match: RegExpExecArray | null;
  FILE_MAP_BLOCK_RE.lastIndex = 0;
  // eslint-disable-next-line no-cond-assign
  while ((match = FILE_MAP_BLOCK_RE.exec(content)) !== null) {
    const parsed = parseBody(match[1]);
    if (parsed === null) continue;
    const { fileList } = normalizeFileMapPropsFromJson(parsed);
    allFiles.push(...fileList);
  }

  if (allFiles.length === 0) return null;

  const map = new Map<string, AttachmentFile>();
  allFiles.forEach((f) => map.set(f.uuid || f.name, f));
  return map;
};
