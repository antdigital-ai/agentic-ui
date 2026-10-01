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
  /** 幻灯片下标（从 0 开始） */
  index: number;
  /** 缩略图是否已渲染到 rail canvas；失败时为 false（显示占位） */
  rendered: boolean;
}

interface UseOfficeViewerOptions {
  /** 文件源：远程 URL、本地 File/Blob，或已读入的 ArrayBuffer */
  file?: File | Blob | string | ArrayBuffer;
  /** 显式指定格式；缺省时按 fileName / URL / File.name 扩展名推断 */
  fileType?: OfficeFileType;
  /** 用于扩展名推断的文件名 */
  fileName?: string;
  /** WASM 解析器地址；缺省使用 jsDelivr CDN */
  wasmUrl?: string | URL;
  /** 主视图渲染宿主 */
  hostRef: React.RefObject<HTMLDivElement | null>;
  /** PPTX：缩略图侧栏渲染宿主（缺省则退化为连续滚动视图） */
  railRef?: React.RefObject<HTMLDivElement | null>;
  /** 文档加载完成回调 */
  onLoad?: () => void;
  /** 加载或渲染失败回调 */
  onError?: (error: Error) => void;
}

interface UseOfficeViewerResult {
  /** 组件生命周期状态 */
  status: OfficeViewerStatus;
  /** 加载或渲染失败时的错误对象 */
  error: Error | null;
  /** PPTX 缩略图列表（仅 PPTX 且启用侧栏时非空） */
  slides: SlideThumbnail[];
  /** 当前页下标（仅 PPTX） */
  currentSlide: number;
  /** 跳转到指定页（仅 PPTX） */
  goToSlide: (index: number) => void;
}

interface DestroyableViewer {
  destroy: () => void;
}

interface PptxViewerLike extends DestroyableViewer {
  goToSlide: (index: number) => Promise<void> | void;
  fitPage: () => Promise<void> | void;
  getScale: () => number;
  setScale: (scale: number) => Promise<void> | void;
  canvasElement: HTMLCanvasElement;
}

const THUMBNAIL_WIDTH = 120;
const THUMBNAIL_DPR = 2;

/** PPTX 主画布四周留白（px）：为阴影预留呼吸空间 */
const MAIN_CANVAS_INSET = 8;

/**
 * 在 host 容器内挂载 Office Viewer（命令式渲染，内部直操作 DOM）
 *
 * - DOCX：DocxScrollViewer 连续滚动
 * - XLSX：XlsxViewer（自带 Sheet 页签）
 * - PPTX：PptxViewer 单页 + 侧栏缩略图（railRef 缺省时退化为 PptxScrollViewer）
 *
 * viewer 实例与 PPTX presentation 均由内部 effect 创建，卸载或依赖变化时统一销毁；
 * 回调经 ref 转发，避免 onLoad / onError 变化触发重新加载
 *
 * @param options - 见 {@link UseOfficeViewerOptions}
 * @returns 状态、缩略图列表与翻页方法，见 {@link UseOfficeViewerResult}
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
    // PPTX：presentation 是主视图引擎与缩略图渲染的共享资源，
    // 由本 effect 创建、cleanup 统一释放（提前销毁会让引擎失效，卡片点击翻页失灵）
    let ownedPresentation: { destroy: () => void } | null = null;

    const goToSlide = (index: number) => {
      setCurrentSlide(index);
      const viewer = viewerRef.current as PptxViewerLike | null;
      viewer?.goToSlide?.(index);
      // 主画布淡入动画：移除类后下一帧加回，重触发 CSS animation
      const canvas = viewer?.canvasElement;
      if (canvas) {
        canvas.classList.remove(`${canvas.className.split(' ')[0]}-fade-in`);
        void canvas.offsetWidth;
        canvas.classList.add(`${canvas.className.split(' ')[0]}-fade-in`);
      }
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
          ownedPresentation = presentation;

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
            // 用 <button> 承载卡片：天然可聚焦、Enter/Space 触发 click，
            // 对键盘与读屏用户等价于点击跳转
            const card = document.createElement('button');
            card.type = 'button';
            card.className = `${railBaseCls}-rail-card`;
            card.setAttribute('aria-label', `跳转到第 ${index + 1} 张幻灯片`);
            card.addEventListener('click', () => goToSlide(index));
            // 显式处理 Enter/Space：preventDefault 阻止原生激活重复触发 click
            card.addEventListener('keydown', (event) => {
              if (
                (event.key === 'Enter' || event.key === ' ') &&
                !event.isComposing
              ) {
                event.preventDefault();
                goToSlide(index);
              }
            });

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
          ) as PptxViewerLike;

          // fitPage 以 host clientWidth/Height 铺满画布，会顶满容器把阴影裁掉；
          // 包一层：把可用宽高各收 MAIN_CANVAS_INSET * 2 再做整页自适应
          const fitPageWithInset = async () => {
            await instance.fitPage();
            const natural = mainCanvas.getBoundingClientRect();
            const naturalW = Math.round(natural.width);
            const naturalH = Math.round(natural.height);
            const fitScale = instance.getScale();
            const scaleX =
              naturalW > 0 ? (naturalW - MAIN_CANVAS_INSET * 2) / naturalW : 1;
            const scaleY =
              naturalH > 0 ? (naturalH - MAIN_CANVAS_INSET * 2) / naturalH : 1;
            const next = fitScale * Math.min(scaleX, scaleY);
            if (next > 0 && next < fitScale) {
              await instance.setScale(next);
            }
          };
          await fitPageWithInset();
          viewer = instance;
          viewerRef.current = instance;

          // 容器尺寸变化时重新铺满（去抖）
          let fitRaf = 0;
          const resizeObserver = new ResizeObserver(() => {
            cancelAnimationFrame(fitRaf);
            fitRaf = requestAnimationFrame(() => {
              fitPageWithInset();
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
            // presentation 仍作为主视图引擎使用，随 effect cleanup 统一释放
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
        // 先销毁 viewer：其解绑完成后引擎才能安全释放
        viewer?.destroy();
      } catch {
        /* ignore destroy errors on unmount */
      }
      viewerRef.current = null;
      try {
        ownedPresentation?.destroy();
      } catch {
        /* ignore destroy errors on unmount */
      }
      ownedPresentation = null;
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
