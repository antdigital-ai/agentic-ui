import { useEffect, useState } from 'react';
import type { FileNode } from '../../types';
import {
  fileTypeProcessor,
  type FileProcessResult,
} from '../FileTypeProcessor';
import type { ContentState } from './types';
import { buildMarkdownContent } from './utils';

const INITIAL_STATE: ContentState = {
  status: 'idle',
  mdContent: '',
  rawContent: '',
};

export interface UsePreviewContentResult {
  /** 文件类型 + 数据源处理结果，未就绪时为 null */
  processResult: FileProcessResult | null;
  /** 文本/代码内容加载状态机 */
  contentState: ContentState;
}

/**
 * 预览内容加载 hook
 *
 * 串联以下副作用，集中管理生命周期：
 * 1. `file` 变化时跑 `fileTypeProcessor.processFile` 得到类型 + 数据源
 * 2. 仅文本/代码类需要拉取原文，按 dataSource 优先 content -> previewUrl 加载
 * 3. 卸载或文件变化时回收 Blob URL（`cleanupResult`）
 *
 * 当 `customContent` 存在时短路所有逻辑，由调用方直接渲染外部内容。
 */
export const usePreviewContent = (
  file: FileNode,
  customContent: React.ReactNode | undefined,
  locale?: Record<string, any>,
): UsePreviewContentResult => {
  const [processResult, setProcessResult] = useState<FileProcessResult | null>(
    null,
  );
  const [contentState, setContentState] = useState<ContentState>(INITIAL_STATE);

  // 1) 跑类型 + 数据源处理
  useEffect(() => {
    if (customContent) return;
    try {
      const result = fileTypeProcessor.processFile(file);
      setProcessResult(result);
    } catch (err) {
      setContentState({
        status: 'error',
        error:
          err instanceof Error
            ? err.message
            : locale?.['workspace.file.processFailed'] || '文件处理失败',
      });
    }
  }, [file, customContent]);

  // 2) 文本/代码加载（其他类型仅重置状态）
  useEffect(() => {
    if (customContent || !processResult) return;

    const { typeInference, dataSource } = processResult;
    const isTextOrCode =
      typeInference.category === 'text' || typeInference.category === 'code';

    if (!isTextOrCode) {
      setContentState(INITIAL_STATE);
      return;
    }

    const setReadyContent = (raw: string) => {
      setContentState({
        status: 'ready',
        mdContent: buildMarkdownContent(raw, typeInference.category, file.name),
        rawContent: raw,
      });
    };

    if (dataSource.content) {
      setReadyContent(dataSource.content);
      return;
    }

    if (dataSource.previewUrl) {
      setContentState({ status: 'loading', mdContent: '', rawContent: '' });

      fetch(dataSource.previewUrl)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          return response.text();
        })
        .then(setReadyContent)
        .catch((err) => {
          const errorMessage =
            err instanceof Error
              ? err.message
              : locale?.['common.loadTextFailed'] || '加载文本内容失败';
          setContentState({ status: 'error', error: errorMessage });
          console.error('加载文本内容失败:', err);
        });
      return;
    }

    // 无数据源时回到 idle，避免显示旧内容
    setContentState(INITIAL_STATE);
  }, [processResult, file.name, customContent, locale]);

  // 3) 卸载/重新处理时清理 Blob URL
  useEffect(() => {
    return () => {
      if (processResult) {
        fileTypeProcessor.cleanupResult(processResult);
      }
    };
  }, [processResult]);

  return { processResult, contentState };
};
