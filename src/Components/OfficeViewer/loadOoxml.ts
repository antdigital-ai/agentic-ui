/**
 * 将 File / Blob / URL / ArrayBuffer 统一为 viewer.load 可接受的源
 *
 * @param file - 文件源
 * @returns URL 字符串或 ArrayBuffer（Blob 会被读入内存）
 * @throws Error 不支持的文件源类型
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

/** 未安装 optional peer 依赖 `@silurus/ooxml` 时抛出（组件据此展示降级提示） */
export class OfficeViewerMissingDependencyError extends Error {
  constructor() {
    super(
      'Optional peer dependency "@silurus/ooxml" is not installed. Run: pnpm add @silurus/ooxml',
    );
    this.name = 'OfficeViewerMissingDependencyError';
  }
}

/** 文件格式无法识别或不在 docx / xlsx / pptx 支持范围内时抛出 */
export class OfficeViewerUnsupportedTypeError extends Error {
  constructor(detail?: string) {
    super(
      detail ||
        'Unsupported office format. Only .docx / .xlsx / .pptx are supported.',
    );
    this.name = 'OfficeViewerUnsupportedTypeError';
  }
}

/**
 * 动态加载格式对应的 `@silurus/ooxml` 子模块
 *
 * 模块解析失败（未安装 / 加载失败）时统一转换为
 * {@link OfficeViewerMissingDependencyError}，其余错误原样抛出
 *
 * @param fileType - Office 格式
 * @returns 对合格式的 ooxml 模块命名空间
 * @throws OfficeViewerMissingDependencyError 依赖未安装或资产加载失败
 */
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
