import {
  FILE_TYPES,
  FileCategory,
  FileNode,
  FileType,
  getFileCategory as getTypeCategoryFromType,
} from '../types';
import {
  DataSourceManager,
  DataSourceResult,
  PreviewCapability,
  dataSourceManager,
} from './DataSourceStrategy';

/**
 * 文件类型推断结果
 */
export interface FileTypeInference {
  /** 用户自定义的、显示在页面上的类型 */
  displayType?: string;
  /** 推断出的文件类型 */
  fileType: FileType;
  /** 文件分类 */
  category: FileCategory;
}

/**
 * 完整的文件处理结果
 */
export interface FileProcessResult {
  /** 类型推断结果 */
  typeInference: FileTypeInference;
  /** 数据源处理结果 */
  dataSource: DataSourceResult;
  /** 是否可以预览 */
  canPreview: boolean;
  /** 预览推荐方式 */
  previewMode: 'inline' | 'modal' | 'external' | 'none';
}

/**
 * 文件类型处理器
 */
export class FileTypeProcessor {
  constructor(private dataSourceManager: DataSourceManager) {}

  /**
   * 推断文件类型
   */
  inferFileType(file: FileNode): FileTypeInference {
    // 1. 优先使用明确指定的类型
    if (file.type && file.type in FILE_TYPES) {
      return {
        displayType: file.displayType,
        fileType: file.type,
        category: getTypeCategoryFromType(file.type),
      };
    }

    // 2. 如果有File对象，使用MIME类型推断
    if (file.file?.type) {
      const typeFromMime = this.getTypeFromMimeType(file.file.type);
      if (typeFromMime) {
        return {
          displayType: file.displayType,
          fileType: typeFromMime,
          category: getTypeCategoryFromType(typeFromMime),
        };
      }
    }

    // 3. 根据文件名扩展名推断
    if (file.name) {
      const typeFromExtension = this.getTypeFromFileName(file.name);
      if (typeFromExtension) {
        return {
          displayType: file.displayType,
          fileType: typeFromExtension,
          category: getTypeCategoryFromType(typeFromExtension),
        };
      }
    }

    // 4. 根据URL扩展名推断
    if (file.url) {
      const typeFromUrlExtension = this.getTypeFromUrl(file.url);
      if (typeFromUrlExtension) {
        return {
          displayType: file.displayType,
          fileType: typeFromUrlExtension,
          category: getTypeCategoryFromType(typeFromUrlExtension),
        };
      }
    }

    // 5. 默认类型
    return {
      displayType: file.displayType,
      fileType: 'plainText',
      category: FileCategory.Text,
    };
  }

  /**
   * 处理文件的完整流程
   */
  processFile(file: FileNode): FileProcessResult {
    const typeInference = this.inferFileType(file);
    const dataSource = this.dataSourceManager.processFile(file);

    const canPreview = this.determinePreviewCapability(
      typeInference,
      dataSource,
    );
    const previewMode = this.determinePreviewMode(typeInference, dataSource);

    return {
      typeInference,
      dataSource,
      canPreview,
      previewMode,
    };
  }

  /**
   * 清理处理结果
   */
  cleanupResult(result: FileProcessResult): void {
    this.dataSourceManager.cleanupResult(result.dataSource);
  }

  /**
   * 从MIME类型推断文件类型
   */
  private getTypeFromMimeType(mimeType: string): FileType | null {
    for (const [type, definition] of Object.entries(FILE_TYPES)) {
      if (definition.mimeTypes.includes(mimeType)) {
        return type as FileType;
      }
    }
    return null;
  }

  /**
   * 从文件名推断文件类型
   */
  private getTypeFromFileName(fileName: string): FileType | null {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (!extension) return null;

    for (const [type, definition] of Object.entries(FILE_TYPES)) {
      if (definition.extensions.includes(extension)) {
        return type as FileType;
      }
    }
    return null;
  }

  /**
   * 从URL推断文件类型
   */
  private getTypeFromUrl(url: string): FileType | null {
    const urlExtension = url.split('.').pop()?.split('?')[0]?.toLowerCase();
    if (!urlExtension) return null;

    for (const [type, definition] of Object.entries(FILE_TYPES)) {
      if (definition.extensions.includes(urlExtension)) {
        return type as FileType;
      }
    }
    return null;
  }

  /**
   * 确定预览能力
   */
  private determinePreviewCapability(
    typeInference: FileTypeInference,
    dataSource: DataSourceResult,
  ): boolean {
    // 如果数据源不支持预览，则无法预览
    if (dataSource.previewCapability === PreviewCapability.NONE) {
      return false;
    }

    // 对于基础预览能力，只支持特定类型
    if (dataSource.previewCapability === PreviewCapability.BASIC) {
      return typeInference.category === FileCategory.Image;
    }

    // 完全预览能力支持更多类型
    return [
      FileCategory.Text,
      FileCategory.Code,
      FileCategory.Image,
      FileCategory.Video,
      FileCategory.Audio,
      FileCategory.PDF,
    ].includes(typeInference.category);
  }

  /**
   * 确定预览模式
   */
  private determinePreviewMode(
    typeInference: FileTypeInference,
    dataSource: DataSourceResult,
  ): 'inline' | 'modal' | 'external' | 'none' {
    if (!this.determinePreviewCapability(typeInference, dataSource)) {
      return 'none';
    }

    switch (typeInference.category) {
      case FileCategory.Text:
      case FileCategory.Code:
        return 'inline';
      case FileCategory.Image:
        return 'modal';
      case FileCategory.Video:
        return 'inline';
      case FileCategory.Audio:
        return 'inline';
      case FileCategory.PDF:
        return 'inline';
      default:
        return 'external';
    }
  }
}

/**
 * 全局文件类型处理器实例
 */
export const fileTypeProcessor = new FileTypeProcessor(dataSourceManager);

const DEFAULT_MIME_TYPE = 'application/octet-stream';

const isFileCategory = (file: FileNode, category: FileCategory): boolean => {
  return fileTypeProcessor.inferFileType(file).category === category;
};

/**
 * 文件类型判断便捷函数
 */
export const isImageFile = (file: FileNode): boolean =>
  isFileCategory(file, FileCategory.Image);

export const isVideoFile = (file: FileNode): boolean =>
  isFileCategory(file, FileCategory.Video);

export const isPdfFile = (file: FileNode): boolean =>
  isFileCategory(file, FileCategory.PDF);

export const isTextFile = (file: FileNode): boolean =>
  isFileCategory(file, FileCategory.Text);

export const isArchiveFile = (file: FileNode): boolean =>
  isFileCategory(file, FileCategory.Archive);

export const isAudioFile = (file: FileNode): boolean =>
  isFileCategory(file, FileCategory.Audio);

export const getMimeType = (file: FileNode): string => {
  const result = fileTypeProcessor.processFile(file);
  return result.dataSource.mimeType || DEFAULT_MIME_TYPE;
};
