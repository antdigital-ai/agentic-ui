/**
 * 将 File / Blob / URL / ArrayBuffer 统一为 viewer.load 可接受的源
 */
export async function resolveOfficeSource(
  file: File | Blob | string | ArrayBuffer,
): Promise<string | ArrayBuffer> {
  if (typeof file === 'string' || file instanceof ArrayBuffer) {
    return file;
  }
  if (typeof Blob !== 'undefined' && file instanceof Blob) {
    return file.arrayBuffer();
  }
  throw new Error('Unsupported office file source');
}

export class OfficeViewerMissingDependencyError extends Error {
  constructor() {
    super(
      'Optional peer dependency "@silurus/ooxml" is not installed. Run: pnpm add @silurus/ooxml',
    );
    this.name = 'OfficeViewerMissingDependencyError';
  }
}

export class OfficeViewerUnsupportedTypeError extends Error {
  constructor(detail?: string) {
    super(
      detail ||
        'Unsupported office format. Only .docx / .xlsx / .pptx are supported.',
    );
    this.name = 'OfficeViewerUnsupportedTypeError';
  }
}

/** 动态加载格式对应的 @silurus/ooxml 子路径；未安装时抛出 MissingDependencyError */
export async function importOoxmlModule(fileType: 'docx' | 'xlsx' | 'pptx') {
  try {
    if (fileType === 'docx') {
      return await import('@silurus/ooxml/docx');
    }
    if (fileType === 'xlsx') {
      return await import('@silurus/ooxml/xlsx');
    }
    return await import('@silurus/ooxml/pptx');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (
      /Cannot find module|Failed to fetch|Failed to resolve|MODULE_NOT_FOUND/i.test(
        message,
      )
    ) {
      throw new OfficeViewerMissingDependencyError();
    }
    throw error;
  }
}
