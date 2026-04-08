import {
  BorderOutlined,
  ExpandOutlined,
  FullscreenExitOutlined,
  FullscreenOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
} from '@ant-design/icons';
import { ConfigProvider, theme } from 'antd';
import classNames from 'clsx';
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ActionIconBox } from '../../Components/ActionIconBox';
import { useIntersectionOnce } from '../../Hooks/useIntersectionOnce';
import { CodeNode } from '../../MarkdownEditor/el';
import { useStyle } from './style';
import { useMermaidRender } from './useMermaidRender';
import { createMermaidThemeConfig } from './utils';

const PRE_STYLE: React.CSSProperties = {
  margin: 0,
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
};

const MIN_ZOOM_SCALE = 0.2;
const MAX_ZOOM_SCALE = 12;
const ZOOM_STEP_RATIO = 1.2;
const FIT_PADDING = 24;

const clamp = (value: number, min: number, max: number) => {
  return Math.max(min, Math.min(max, value));
};

const getSvgNaturalSize = (
  svgElement: SVGSVGElement,
): { width: number; height: number } | null => {
  const viewBox = svgElement.viewBox?.baseVal;
  if (viewBox && viewBox.width > 0 && viewBox.height > 0) {
    return {
      width: viewBox.width,
      height: viewBox.height,
    };
  }

  const widthAttr = Number.parseFloat(svgElement.getAttribute('width') || '');
  const heightAttr = Number.parseFloat(svgElement.getAttribute('height') || '');
  if (Number.isFinite(widthAttr) && Number.isFinite(heightAttr) && widthAttr > 0 && heightAttr > 0) {
    return {
      width: widthAttr,
      height: heightAttr,
    };
  }

  try {
    const bbox = svgElement.getBBox();
    if (bbox.width > 0 && bbox.height > 0) {
      return {
        width: bbox.width,
        height: bbox.height,
      };
    }
  } catch (e) {
    // Ignore getBBox errors in hidden/unsupported SVG contexts.
  }

  const rect = svgElement.getBoundingClientRect();
  if (rect.width > 0 && rect.height > 0) {
    return {
      width: rect.width,
      height: rect.height,
    };
  }

  return null;
};

export const MermaidRendererImpl = (props: { element: CodeNode }) => {
  const context = useContext(ConfigProvider.ConfigContext);
  const { token } = theme.useToken();
  const baseCls =
    context?.getPrefixCls('agentic-plugin-mermaid') || 'plugin-mermaid';
  const { wrapSSR, hashId } = useStyle(baseCls);
  const containerRef = useRef<HTMLDivElement>(null);
  const divRef = useRef<HTMLDivElement>(null);
  const panSessionRef = useRef<{
    startClientX: number;
    startClientY: number;
    startPanX: number;
    startPanY: number;
  } | null>(null);
  const id = useMemo(
    () => 'm' + (Date.now() + Math.ceil(Math.random() * 1000)),
    [],
  );
  const [scale, setScale] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [showGrid, setShowGrid] = useState(true);
  const [isPanning, setIsPanning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const mermaidTheme = useMemo(
    () =>
      createMermaidThemeConfig({
        colorBgContainer: token.colorBgContainer,
        colorBgElevated: token.colorBgElevated,
        colorText: token.colorText,
        colorTextSecondary: token.colorTextSecondary,
        colorBorder: token.colorBorder,
        colorPrimary: token.colorPrimary,
        fontFamily: token.fontFamily,
      }),
    [
      token.colorBgContainer,
      token.colorBgElevated,
      token.colorText,
      token.colorTextSecondary,
      token.colorBorder,
      token.colorPrimary,
      token.fontFamily,
    ],
  );
  const isVisible = useIntersectionOnce(containerRef);
  const { error, renderedCode } = useMermaidRender(
    props.element.value || '',
    divRef,
    id,
    isVisible,
    {
        colorBgContainer: token.colorBgContainer,
        colorBgElevated: token.colorBgElevated,
        colorText: token.colorText,
        colorTextSecondary: token.colorTextSecondary,
        colorBorder: token.colorBorder,
        colorPrimary: token.colorPrimary,
        fontFamily: token.fontFamily,
    },
  );

  const isError = useMemo(() => !!error && !!error.trim(), [error]);
  const isRendered = useMemo(
    () => renderedCode && !isError,
    [renderedCode, isError],
  );
  const containerStyle = useMemo(
    () =>
      ({
        opacity: isRendered ? 1 : 0,
        pointerEvents: isRendered ? 'auto' : 'none',
        width: '100%',
        height: isRendered ? '100%' : '0',
        overflow: isRendered ? 'auto' : 'hidden',
        maxHeight: isRendered ? '100%' : '0',
        minHeight: isRendered ? '200px' : '0',
      }) as React.CSSProperties,
    [isRendered],
  );
  const transformedContainerStyle = useMemo(
    () =>
      ({
        ...containerStyle,
        '--mermaid-pan-x': `${panX}px`,
        '--mermaid-pan-y': `${panY}px`,
        '--mermaid-scale': scale,
      }) as React.CSSProperties,
    [containerStyle, panX, panY, scale],
  );
  const viewportStyle = useMemo(
    () =>
      ({
        backgroundImage: showGrid
          ? mermaidTheme.darkMode
            ? 'radial-gradient(circle, rgba(255, 255, 255, 0.14) 1.2px, transparent 1.2px)'
            : 'radial-gradient(circle, rgba(0, 0, 0, 0.08) 1.2px, transparent 1.2px)'
          : 'none',
      }) as React.CSSProperties,
    [mermaidTheme.darkMode, showGrid],
  );

  const getDiagramAndViewportSize = useCallback(() => {
    const viewportElement = divRef.current;
    if (!viewportElement) {
      return null;
    }

    const svgElement = viewportElement.querySelector(
      '[data-mermaid-svg="true"]',
    ) as SVGSVGElement | null;
    if (!svgElement) {
      return null;
    }

    const svgSize = getSvgNaturalSize(svgElement);
    if (!svgSize) {
      return null;
    }

    const viewportWidth = viewportElement.clientWidth;
    const viewportHeight = viewportElement.clientHeight;
    if (viewportWidth <= 0 || viewportHeight <= 0) {
      return null;
    }

    return {
      viewportWidth,
      viewportHeight,
      diagramWidth: svgSize.width,
      diagramHeight: svgSize.height,
    };
  }, []);

  const handleFitToScreen = useCallback(() => {
    const size = getDiagramAndViewportSize();
    if (!size) {
      return;
    }

    const usableWidth = Math.max(size.viewportWidth - FIT_PADDING * 2, 1);
    const usableHeight = Math.max(size.viewportHeight - FIT_PADDING * 2, 1);
    const fittedScale = clamp(
      Math.min(usableWidth / size.diagramWidth, usableHeight / size.diagramHeight),
      MIN_ZOOM_SCALE,
      MAX_ZOOM_SCALE,
    );

    const centeredPanX = (size.viewportWidth - size.diagramWidth * fittedScale) / 2;
    const centeredPanY = (size.viewportHeight - size.diagramHeight * fittedScale) / 2;

    setScale(fittedScale);
    setPanX(centeredPanX);
    setPanY(centeredPanY);
  }, [getDiagramAndViewportSize]);

  const applyScaleAtPoint = useCallback(
    (nextScale: number, clientX?: number, clientY?: number) => {
      const viewportElement = divRef.current;
      if (!viewportElement) {
        return;
      }

      const clampedScale = clamp(nextScale, MIN_ZOOM_SCALE, MAX_ZOOM_SCALE);
      if (clampedScale === scale) {
        return;
      }

      const viewportRect = viewportElement.getBoundingClientRect();
      const targetClientX = clientX ?? viewportRect.left + viewportRect.width / 2;
      const targetClientY = clientY ?? viewportRect.top + viewportRect.height / 2;
      const relativeX = targetClientX - viewportRect.left;
      const relativeY = targetClientY - viewportRect.top;

      const nextPanX = relativeX - ((relativeX - panX) / scale) * clampedScale;
      const nextPanY = relativeY - ((relativeY - panY) / scale) * clampedScale;

      setScale(clampedScale);
      setPanX(nextPanX);
      setPanY(nextPanY);
    },
    [panX, panY, scale],
  );

  const handleZoomIn = useCallback(() => {
    applyScaleAtPoint(scale * ZOOM_STEP_RATIO);
  }, [applyScaleAtPoint, scale]);

  const handleZoomOut = useCallback(() => {
    applyScaleAtPoint(scale / ZOOM_STEP_RATIO);
  }, [applyScaleAtPoint, scale]);

  const handleToggleFullscreen = useCallback(() => {
    if (!containerRef.current) {
      return;
    }

    if (document.fullscreenElement === containerRef.current) {
      document.exitFullscreen?.();
      return;
    }

    containerRef.current.requestFullscreen?.();
  }, []);

  const handleWheel = useCallback(
    (event: React.WheelEvent<HTMLDivElement>) => {
      if (!isRendered) {
        return;
      }

      const target = event.target as HTMLElement | null;
      if (target?.closest?.('[data-mermaid-toolbar]')) {
        return;
      }

      event.preventDefault();
      const scaleMultiplier = event.deltaY < 0 ? ZOOM_STEP_RATIO : 1 / ZOOM_STEP_RATIO;
      applyScaleAtPoint(scale * scaleMultiplier, event.clientX, event.clientY);
    },
    [applyScaleAtPoint, isRendered, scale],
  );

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!isRendered || event.button !== 0) {
        return;
      }

      const target = event.target as HTMLElement | null;
      if (target?.closest?.('[data-mermaid-toolbar]')) {
        return;
      }

      panSessionRef.current = {
        startClientX: event.clientX,
        startClientY: event.clientY,
        startPanX: panX,
        startPanY: panY,
      };
      setIsPanning(true);
      event.currentTarget.setPointerCapture?.(event.pointerId);
    },
    [isRendered, panX, panY],
  );

  const handlePointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const panSession = panSessionRef.current;
    if (!panSession) {
      return;
    }

    setPanX(panSession.startPanX + event.clientX - panSession.startClientX);
    setPanY(panSession.startPanY + event.clientY - panSession.startClientY);
  }, []);

  const finishPointerSession = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (!panSessionRef.current) {
      return;
    }

    panSessionRef.current = null;
    setIsPanning(false);
    event.currentTarget.releasePointerCapture?.(event.pointerId);
  }, []);

  useEffect(() => {
    const syncFullscreenState = () => {
      setIsFullscreen(document.fullscreenElement === containerRef.current);
    };
    syncFullscreenState();

    document.addEventListener('fullscreenchange', syncFullscreenState);
    return () => {
      document.removeEventListener('fullscreenchange', syncFullscreenState);
    };
  }, []);

  useEffect(() => {
    if (!isRendered) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      handleFitToScreen();
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [isRendered, renderedCode, handleFitToScreen]);

  useEffect(() => {
    if (!isRendered || !divRef.current) {
      return;
    }

    if (typeof ResizeObserver === 'undefined') {
      return;
    }

    const resizeObserver = new ResizeObserver(() => {
      handleFitToScreen();
    });
    resizeObserver.observe(divRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [handleFitToScreen, isRendered]);

  useEffect(() => {
    if (!isRendered) {
      return;
    }
    handleFitToScreen();
  }, [handleFitToScreen, isFullscreen, isRendered]);

  const code = props.element.value || '';

  return wrapSSR(
    <div
      ref={containerRef}
      className={classNames(baseCls, hashId, {
        [`${baseCls}-fullscreen`]: isFullscreen,
      })}
      contentEditable={false}
      data-mermaid-theme={mermaidTheme.darkMode ? 'dark' : 'light'}
    >
      <div
        contentEditable={false}
        className={classNames(`${baseCls}-viewport`, hashId)}
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishPointerSession}
        onPointerCancel={finishPointerSession}
        data-mermaid-grid={showGrid}
        data-mermaid-panning={isPanning}
        data-mermaid-viewport="true"
        style={viewportStyle}
      >
        <div
          contentEditable={false}
          ref={divRef}
          className={classNames(hashId)}
          style={transformedContainerStyle}
          data-mermaid-container="true"
        />
        {isRendered && (
          <div
            className={classNames(`${baseCls}-toolbar-float`, hashId)}
            role="toolbar"
            aria-label="Mermaid diagram controls"
            data-mermaid-toolbar
            onPointerDown={(e) => {
              e.stopPropagation();
            }}
          >
            <span data-mermaid-action="fit">
              <ActionIconBox
                title="适配画布"
                borderLess
                noPadding
                onClick={handleFitToScreen}
                iconStyle={{ color: token.colorTextSecondary }}
              >
                <ExpandOutlined />
              </ActionIconBox>
            </span>
            <span data-mermaid-action="zoom-out">
              <ActionIconBox
                title="缩小"
                borderLess
                noPadding
                onClick={handleZoomOut}
                iconStyle={{ color: token.colorTextSecondary }}
              >
                <ZoomOutOutlined />
              </ActionIconBox>
            </span>
            <span data-mermaid-action="zoom-in">
              <ActionIconBox
                title="放大"
                borderLess
                noPadding
                onClick={handleZoomIn}
                iconStyle={{ color: token.colorTextSecondary }}
              >
                <ZoomInOutlined />
              </ActionIconBox>
            </span>
            <span data-mermaid-action="grid">
              <ActionIconBox
                title={showGrid ? '隐藏背景网格' : '显示背景网格'}
                borderLess
                noPadding
                active={showGrid}
                onClick={() => {
                  setShowGrid((prev) => !prev);
                }}
                iconStyle={{ color: token.colorTextSecondary }}
              >
                <BorderOutlined />
              </ActionIconBox>
            </span>
            <span data-mermaid-action="fullscreen">
              <ActionIconBox
                title={isFullscreen ? '退出全屏' : '全屏'}
                borderLess
                noPadding
                onClick={handleToggleFullscreen}
                iconStyle={{ color: token.colorTextSecondary }}
              >
                {isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
              </ActionIconBox>
            </span>
          </div>
        )}
      </div>
      {error && (
        <div className={classNames(`${baseCls}-error`, hashId)}>
          <pre style={PRE_STYLE}>{code}</pre>
        </div>
      )}
      {!renderedCode && !error && (
        <div className={classNames(`${baseCls}-empty`, hashId)}>
          <pre style={PRE_STYLE}>{code}</pre>
        </div>
      )}
    </div>,
  );
};
