import json5 from 'json5';
import partialParse from '../../../MarkdownEditor/editor/parser/json-parse';

/**
 * 解析 agentic-ui 内嵌代码块（task / toolusebar / filemap 等）的 JSON 内容。
 * 优先 json5（容忍裸键、注释、尾逗号），失败回退 partialParse（容忍流式截断）。
 *
 * @param code 原始字符串；空字符串视为 `{}`
 * @returns 解析失败返回 `null`
 */
export const parseJsonBody = (code: string): unknown => {
  try {
    return json5.parse(code || '{}');
  } catch {
    try {
      return partialParse(code || '{}');
    } catch {
      return null;
    }
  }
};

/**
 * Schema / Apaasify 等场景：先 JSON.parse，失败再 partialParse。
 * 与 parseJsonBody 区别：不强制 json5 容忍语法。
 */
export const parseSchemaJson = (code: string): unknown => {
  try {
    return JSON.parse(code);
  } catch {
    try {
      return partialParse(code || '[]');
    } catch {
      return null;
    }
  }
};
