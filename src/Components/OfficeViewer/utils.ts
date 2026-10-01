import type { OfficeFileType } from './types';

/** 与当前集成版本对齐的 CDN 资产基址（仅作默认；生产可经 wasmUrl 覆盖） */
export const OOXML_CDN_VERSION = '0.88.0';

/** WASM 资产 CDN 基址（jsDelivr）；生产环境建议经 `wasmUrl` 切换为自有 CDN */
export const OOXML_CDN_BASE = `https://cdn.jsdelivr.net/npm/@silurus/ooxml@${OOXML_CDN_VERSION}/dist`;

/** 各格式对应的 WASM 解析器文件名 */
export const OOXML_WASM_FILE: Record<OfficeFileType, string> = {
  docx: 'docx_parser_bg.wasm',
  xlsx: 'xlsx_parser_bg.wasm',
  pptx: 'pptx_parser_bg.wasm',
};

/** 预览容器默认高度（px） */
export const DEFAULT_HEIGHT = 480;

/** 各格式可识别的文件扩展名 */
export const OFFICE_EXTENSIONS: Record<OfficeFileType, string[]> = {
  docx: ['.docx'],
  xlsx: ['.xlsx'],
  pptx: ['.pptx'],
};

/**
 * 获取指定格式的默认 WASM 解析器地址（jsDelivr CDN）
 *
 * @param fileType - Office 格式
 * @returns 完整 WASM 文件 URL
 */
export function getDefaultWasmUrl(fileType: OfficeFileType): string {
  return `${OOXML_CDN_BASE}/${OOXML_WASM_FILE[fileType]}`;
}

/**
 * 从文件名 / URL 路径推断 OOXML 格式
 *
 * 自动剥离查询串与 hash 后按扩展名匹配；无法识别时返回 null
 *
 * @param nameOrUrl - 文件名或 URL
 * @returns 匹配的格式，无法识别时返回 null
 */
export function inferOfficeFileType(nameOrUrl?: string): OfficeFileType | null {
  if (!nameOrUrl) return null;
  const normalized = nameOrUrl.split('?')[0].split('#')[0].toLowerCase();
  if (normalized.endsWith('.docx')) return 'docx';
  if (normalized.endsWith('.xlsx')) return 'xlsx';
  if (normalized.endsWith('.pptx')) return 'pptx';
  return null;
}

/**
 * 解析用于错误提示与扩展名推断的源标识
 *
 * 优先级：fileName → URL 字符串 → File.name；Blob / ArrayBuffer 无可展示标识
 *
 * @param file - 文件源
 * @param fileName - 显式传入的文件名
 * @returns 可读的源标识，无法获取时返回 undefined
 */
export function resolveSourceLabel(
  file: File | Blob | string | ArrayBuffer | undefined,
  fileName?: string,
): string | undefined {
  if (fileName) return fileName;
  if (typeof file === 'string') return file;
  if (typeof File !== 'undefined' && file instanceof File) return file.name;
  return undefined;
}
