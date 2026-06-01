import {
  getLanguageFromFilename,
  wrapContentInCodeBlock,
} from '../../utils/codeLanguageUtils';
import type { ContentState } from './types';

const HTML_MIME_TYPE = 'text/html';
const HTML_EXTENSIONS = ['.html', '.htm'];

/**
 * 判断是否为 HTML 文件：扩展名或 MIME 任一命中
 */
export const isHtmlFile = (fileName: string, mimeType?: string): boolean => {
  const name = fileName?.toLowerCase() || '';
  const byExtension = HTML_EXTENSIONS.some((ext) => name.endsWith(ext));
  const byMimeType = mimeType === HTML_MIME_TYPE;
  return byExtension || byMimeType;
};

/**
 * 将 ContentState 收敛到三态展示标识
 */
export const getContentStatus = (
  state: ContentState,
): 'loading' | 'error' | 'done' => {
  if ('error' in state) return 'error';
  return state.status === 'loading' ? 'loading' : 'done';
};

/**
 * 将原始文本按文件类别构造为 MarkdownEditor 可接收的内容
 *
 * - 代码类（category === 'code'）：用 ``` 围栏 + 推断语言包裹
 * - 其他类型：原文返回
 */
export const buildMarkdownContent = (
  raw: string,
  category: string,
  fileName: string,
): string => {
  if (category === 'code') {
    const language = getLanguageFromFilename(fileName);
    return wrapContentInCodeBlock(raw, language);
  }
  return raw;
};
