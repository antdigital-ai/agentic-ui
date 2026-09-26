import type { OfficeFileType } from './types';

/** 与当前集成版本对齐的 CDN 资产基址（仅作默认；生产可经 wasmUrl 覆盖） */
export const OOXML_CDN_VERSION = '0.88.0';

export const OOXML_CDN_BASE = `https://cdn.jsdelivr.net/npm/@silurus/ooxml@${OOXML_CDN_VERSION}/dist`;

export const OOXML_WASM_FILE: Record<OfficeFileType, string> = {
  docx: 'docx_parser_bg.wasm',
  xlsx: 'xlsx_parser_bg.wasm',
  pptx: 'pptx_parser_bg.wasm',
};

export const DEFAULT_HEIGHT = 480;

export const OFFICE_EXTENSIONS: Record<OfficeFileType, string[]> = {
  docx: ['.docx'],
  xlsx: ['.xlsx'],
  pptx: ['.pptx'],
};

export function getDefaultWasmUrl(fileType: OfficeFileType): string {
  return `${OOXML_CDN_BASE}/${OOXML_WASM_FILE[fileType]}`;
}

/**
 * 从文件名 / URL 路径推断 OOXML 格式；无法识别时返回 null
 */
export function inferOfficeFileType(nameOrUrl?: string): OfficeFileType | null {
  if (!nameOrUrl) return null;
  const normalized = nameOrUrl.split('?')[0].split('#')[0].toLowerCase();
  if (normalized.endsWith('.docx')) return 'docx';
  if (normalized.endsWith('.xlsx')) return 'xlsx';
  if (normalized.endsWith('.pptx')) return 'pptx';
  return null;
}

export function resolveSourceLabel(
  file: File | Blob | string | ArrayBuffer | undefined,
  fileName?: string,
): string | undefined {
  if (fileName) return fileName;
  if (typeof file === 'string') return file;
  if (typeof File !== 'undefined' && file instanceof File) return file.name;
  return undefined;
}
