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
  const fitRafCleanupRef = useRef<(() => void) | null>(null);
  const xlsxCopyCleanupRef = useRef<(() => void) | null>(null);

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
          // enableTextSelection：渲染透明文本层，支持划选 + Ctrl/Cmd+C 复制
          const instance = new DocxScrollViewer(host, {
            ...loadOpts,
            enableTextSelection: true,
          });
          await instance.load(source);
          viewer = instance;
        } else if (resolvedType === 'xlsx') {
          const { XlsxViewer } = mod as typeof import('@silurus/ooxml/xlsx');
          const instance = new XlsxViewer(host, loadOpts);
          await instance.load(source);
          viewer = instance;
          // XLSX 无文本层；选中单元格后 Ctrl/Cmd+C 由库内 copySelection 处理，
          // 这里补挂全局 keydown，避免焦点不在视口时复制失效
          const handleCopyKey = (event: KeyboardEvent) => {
            if (
              (event.ctrlKey || event.metaKey) &&
              event.key.toLowerCase() === 'c' &&
              !event.defaultPrevented &&
              !event.isComposing &&
              host.contains(event.target as Node)
            ) {
              const target = event.target as HTMLElement;
              const isFormField =
                target?.isContentEditable ||
                ['INPUT', 'TEXTAREA', 'SELECT'].includes(target?.tagName);
              if (isFormField) return;
              event.preventDefault();
              void instance.copySelection();
            }
          };
          host.addEventListener('keydown', handleCopyKey);
          xlsxCopyCleanupRef.current = () =>
            host.removeEventListener('keydown', handleCopyKey);
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
          // rail 可能带 collapsed 等附加类，取首个类名剥离 -rail 得到组件前缀
          const railBaseCls = rail.className.split(' ')[0].replace('-rail', '');
          const itemWidth = THUMBNAIL_WIDTH;
          const itemHeight = Math.round(
            itemWidth *
              (presentation.slideHeight / Math.max(1, presentation.slideWidth)),
          );
          const railCanvases: HTMLCanvasElement[] = [];
          for (let index = 0; index < total; index++) {
            const card = document.createElement('div');
            card.className = `${railBaseCls}-rail-card`;
            card.addEventListener('click', () => goToSlide(index));

            const canvas = document.createElement('canvas');
            canvas.width = itemWidth * THUMBNAIL_DPR;
            canvas.height = itemHeight * THUMBNAIL_DPR;
            canvas.className = `${railBaseCls}-rail-canvas`;
            card.appendChild(canvas);

            rail.appendChild(card);
            railCanvases.push(canvas);
          }

          const syncActiveCard = (index: number) => {
            Array.from(rail.children).forEach((card, i) => {
              card.classList.toggle(
                `${railBaseCls}-rail-card-active`,
                i === index,
              );
            });
          };
          syncActiveCard(0);

          // 主区：完整 PptxViewer 单页浏览（自带翻页/缩放/文本层）
          const mainCanvas = document.createElement('canvas');
          // host 可能带 host-center 等附加类，取首个类名剥离 -host 得到组件前缀
          const baseCls = host.className.split(' ')[0].replace('-host', '');
          mainCanvas.className = `${baseCls}-main-canvas`;
          mainCanvas.style.width = '100%';
          mainCanvas.style.height = '100%';
          mainCanvas.style.display = 'block';
          host.appendChild(mainCanvas);
          const instance = PptxViewer.fromPresentation(
            mainCanvas,
            presentation,
            {
              ...loadOpts,
              // enableTextSelection：文本层覆盖在画布上，可划选复制文字
              enableTextSelection: true,
              onSlideChange: (index: number) => {
                setCurrentSlide(index);
                syncActiveCard(index);
              },
            },
          );
          // 主区尽量铺满：按可用宽高自适应到整页（免 load，presentation 已就绪）
          await instance.fitPage();
          viewer = instance;
          viewerRef.current = instance;

          // 容器尺寸变化时重新铺满（去抖）
          let fitRaf = 0;
          const resizeObserver = new ResizeObserver(() => {
            cancelAnimationFrame(fitRaf);
            fitRaf = requestAnimationFrame(() => {
              instance.fitPage();
            });
          });
          resizeObserver.observe(host);
          fitRafCleanupRef.current = () => {
            cancelAnimationFrame(fitRaf);
            resizeObserver.disconnect();
          };

          // 逐页渲染缩略图（后台异步，不阻塞主视图 ready）
          (async () => {
            for (let index = 0; index < total; index++) {
              if (cancelled) return;
              try {
                await presentation.renderSlide(railCanvases[index], index, {
                  width: itemWidth * THUMBNAIL_DPR,
                });
                // renderSlide 会写入内联宽高（按传入 width 定宽），
                // 清掉后交由 rail-card 的 width:100% 自适应，避免缩略图溢出被裁切
                railCanvases[index].style.width = '100%';
                railCanvases[index].style.height = 'auto';
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
            // 缩略图已全部绘制在 rail canvas 上，释放共享解析副本
            presentation.destroy();
          })();
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
      // ResizeObserver / XLSX 复制快捷键随 viewer destroy 失效，此处仅做引用清理
      fitRafCleanupRef.current?.();
      fitRafCleanupRef.current = null;
      xlsxCopyCleanupRef.current?.();
      xlsxCopyCleanupRef.current = null;
    };
  }, [file, fileType, fileName, wasmUrl, hostRef, railRef]);

  const goToSlideExternal = (index: number) => {
    setCurrentSlide(index);
    (viewerRef.current as PptxViewerLike | null)?.goToSlide?.(index);
  };

  return { status, error, slides, currentSlide, goToSlide: goToSlideExternal };
}
