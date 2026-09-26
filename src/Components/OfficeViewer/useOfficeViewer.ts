import { useEffect, useRef, useState } from 'react';
import {
  importOoxmlModule,
  OfficeViewerMissingDependencyError,
  OfficeViewerUnsupportedTypeError,
  resolveOfficeSource,
} from './loadOoxml';
import type { OfficeFileType, OfficeViewerStatus } from './types';
import {
  getDefaultWasmUrl,
  inferOfficeFileType,
  resolveSourceLabel,
} from './utils';

interface UseOfficeViewerOptions {
  file?: File | Blob | string | ArrayBuffer;
  fileType?: OfficeFileType;
  fileName?: string;
  wasmUrl?: string | URL;
  hostRef: React.RefObject<HTMLDivElement | null>;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

interface UseOfficeViewerResult {
  status: OfficeViewerStatus;
  error: Error | null;
}

interface DestroyableViewer {
  destroy: () => void;
}

/**
 * 在 host 容器内挂载滚动/表格 Viewer。
 * DOCX/PPTX 使用 ScrollViewer（容器需有明确高度）；XLSX 使用带 Sheet 页签的 XlsxViewer。
 */
export function useOfficeViewer({
  file,
  fileType,
  fileName,
  wasmUrl,
  hostRef,
  onLoad,
  onError,
}: UseOfficeViewerOptions): UseOfficeViewerResult {
  const [status, setStatus] = useState<OfficeViewerStatus>('idle');
  const [error, setError] = useState<Error | null>(null);
  const callbacksRef = useRef({ onLoad, onError });
  callbacksRef.current = { onLoad, onError };

  useEffect(() => {
    let cancelled = false;
    let viewer: DestroyableViewer | null = null;

    const run = async () => {
      const host = hostRef.current;
      if (!host || file === undefined) {
        setStatus('idle');
        return;
      }

      host.innerHTML = '';
      setStatus('loading');
      setError(null);

      const label = resolveSourceLabel(file, fileName);
      const resolvedType = fileType || inferOfficeFileType(label);
      if (!resolvedType) {
        const err = new OfficeViewerUnsupportedTypeError(
          label ? `Cannot infer office type from "${label}"` : undefined,
        );
        if (cancelled) return;
        setStatus('error');
        setError(err);
        callbacksRef.current.onError?.(err);
        return;
      }

      try {
        const mod = await importOoxmlModule(resolvedType);
        if (cancelled) return;

        const source = await resolveOfficeSource(file);
        if (cancelled) return;

        const loadOpts = {
          wasmUrl: wasmUrl ?? getDefaultWasmUrl(resolvedType),
        };

        if (resolvedType === 'docx') {
          const { DocxScrollViewer } =
            mod as typeof import('@silurus/ooxml/docx');
          const instance = new DocxScrollViewer(host, loadOpts);
          await instance.load(source);
          viewer = instance;
        } else if (resolvedType === 'xlsx') {
          const { XlsxViewer } = mod as typeof import('@silurus/ooxml/xlsx');
          const instance = new XlsxViewer(host, loadOpts);
          await instance.load(source);
          viewer = instance;
        } else {
          const { PptxScrollViewer } =
            mod as typeof import('@silurus/ooxml/pptx');
          const instance = new PptxScrollViewer(host, loadOpts);
          await instance.load(source);
          viewer = instance;
        }

        if (cancelled) {
          viewer.destroy();
          return;
        }
        setStatus('ready');
        callbacksRef.current.onLoad?.();
      } catch (err) {
        if (cancelled) return;
        const errorObj = err instanceof Error ? err : new Error(String(err));
        if (errorObj instanceof OfficeViewerMissingDependencyError) {
          setStatus('missing-dependency');
        } else {
          setStatus('error');
        }
        setError(errorObj);
        callbacksRef.current.onError?.(errorObj);
      }
    };

    run();

    return () => {
      cancelled = true;
      try {
        viewer?.destroy();
      } catch {
        /* ignore destroy errors on unmount */
      }
      if (hostRef.current) {
        hostRef.current.innerHTML = '';
      }
    };
  }, [file, fileType, fileName, wasmUrl, hostRef]);

  return { status, error };
}
