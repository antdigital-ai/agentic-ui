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

export interface SlideThumbnail {
  index: number;
  /** 缩略图是否已渲染到 rail canvas；失败时为 false（显示占位） */
  rendered: boolean;
}

interface UseOfficeViewerOptions {
  file?: File | Blob | string | ArrayBuffer;
  fileType?: OfficeFileType;
  fileName?: string;
  wasmUrl?: string | URL;
  hostRef: React.RefObject<HTMLDivElement | null>;
  /** PPTX：缩略图侧栏渲染宿主（缺省则退化为连续滚动视图） */
  railRef?: React.RefObject<HTMLDivElement | null>;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

interface UseOfficeViewerResult {
  status: OfficeViewerStatus;
  error: Error | null;
  /** 仅 PPTX 且启用侧栏时返回 */
  slides: SlideThumbnail[];
  currentSlide: number;
  goToSlide: (index: number) => void;
}

interface DestroyableViewer {
  destroy: () => void;
}

interface PptxViewerLike extends DestroyableViewer {
  goToSlide: (index: number) => Promise<void> | void;
}

const THUMBNAIL_WIDTH = 120;
const THUMBNAIL_DPR = 2;

/**
 * 在 host 容器内挂载 Viewer：
 * - DOCX：DocxScrollViewer 连续滚动
 * - XLSX：XlsxViewer（自带 Sheet 页签）
 * - PPTX：PptxViewer 单页 + 侧栏缩略图（railRef 缺省时退化为 PptxScrollViewer）
 */
export function useOfficeViewer({
  file,
  fileType,
  fileName,
  wasmUrl,
  hostRef,
  railRef,
  onLoad,
  onError,
}: UseOfficeViewerOptions): UseOfficeViewerResult {
  const [status, setStatus] = useState<OfficeViewerStatus>('idle');
  const [error, setError] = useState<Error | null>(null);
  const [slides, setSlides] = useState<SlideThumbnail[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const callbacksRef = useRef({ onLoad, onError });
  callbacksRef.current = { onLoad, onError };
  const viewerRef = useRef<DestroyableViewer | null>(null);

  useEffect(() => {
    let cancelled = false;
    let viewer: DestroyableViewer | null = null;

    const goToSlide = (index: number) => {
      setCurrentSlide(index);
      (viewerRef.current as PptxViewerLike | null)?.goToSlide?.(index);
    };

    const run = async () => {
      const host = hostRef.current;
      if (!host || file === undefined) {
        setStatus('idle');
        return;
      }

      host.innerHTML = '';
      setSlides([]);
      setCurrentSlide(0);
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
        } else if (railRef?.current) {
          const { PptxPresentation, PptxViewer } =
            mod as typeof import('@silurus/ooxml/pptx');

          const presentation = await PptxPresentation.load(source, loadOpts);
          if (cancelled) {
            presentation.destroy();
            return;
          }

          const rail = railRef.current;
          const total = presentation.slideCount;
          setSlides(
            Array.from({ length: total }, (_, index) => ({
              index,
              rendered: false,
            })),
          );

          // 缩略图 rail：每页一张「卡片」（canvas + 页码），点击跳转主画布
          rail.innerHTML = '';
          const itemWidth = THUMBNAIL_WIDTH;
          const itemHeight = Math.round(
            itemWidth *
              (presentation.slideHeight / Math.max(1, presentation.slideWidth)),
          );
          const railCanvases: HTMLCanvasElement[] = [];
          for (let index = 0; index < total; index++) {
            const card = document.createElement('div');
            card.className = `${rail.className.replace('-rail', '')}-rail-card`;
            card.addEventListener('click', () => goToSlide(index));

            const canvas = document.createElement('canvas');
            canvas.width = itemWidth * THUMBNAIL_DPR;
            canvas.height = itemHeight * THUMBNAIL_DPR;
            canvas.className = `${rail.className.replace('-rail', '')}-rail-canvas`;
            card.appendChild(canvas);

            const pageNo = document.createElement('span');
            pageNo.className = `${rail.className.replace('-rail', '')}-rail-page`;
            pageNo.textContent = String(index + 1);
            card.appendChild(pageNo);

            rail.appendChild(card);
            railCanvases.push(canvas);
          }

          const syncActiveCard = (index: number) => {
            Array.from(rail.children).forEach((card, i) => {
              card.classList.toggle(
                `${rail.className.replace('-rail', '')}-rail-card-active`,
                i === index,
              );
            });
          };
          syncActiveCard(0);

          // 主区：完整 PptxViewer 单页浏览（自带翻页/缩放/文本层）
          const mainCanvas = document.createElement('canvas');
          mainCanvas.style.width = '100%';
          mainCanvas.style.height = '100%';
          mainCanvas.style.display = 'block';
          host.appendChild(mainCanvas);
          const instance = new PptxViewer(mainCanvas, {
            ...loadOpts,
            onSlideChange: (index: number) => {
              setCurrentSlide(index);
              syncActiveCard(index);
            },
          });
          await instance.load(source);
          viewer = instance;
          viewerRef.current = instance;

          // 逐页渲染缩略图
          for (let index = 0; index < total; index++) {
            if (cancelled) return;
            try {
              await presentation.renderSlide(railCanvases[index], index, {
                width: itemWidth * THUMBNAIL_DPR,
              });
              if (!cancelled) {
                setSlides((prev) => {
                  const next = [...prev];
                  next[index] = { index, rendered: true };
                  return next;
                });
              }
            } catch {
              // 单页渲染失败保留占位
            }
          }
          // 缩略图已直接绘制在 rail canvas 上，释放共享解析副本
          presentation.destroy();
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
      viewerRef.current = null;
      if (hostRef.current) {
        hostRef.current.innerHTML = '';
      }
    };
  }, [file, fileType, fileName, wasmUrl, hostRef, railRef]);

  const goToSlideExternal = (index: number) => {
    setCurrentSlide(index);
    (viewerRef.current as PptxViewerLike | null)?.goToSlide?.(index);
  };

  return { status, error, slides, currentSlide, goToSlide: goToSlideExternal };
}
