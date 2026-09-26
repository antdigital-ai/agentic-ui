import { ConfigProvider, Spin } from 'antd';
import classNames from 'clsx';
import React, { memo, useContext, useMemo, useRef } from 'react';
import { useOfficeViewerStyle } from './style';
import type { OfficeViewerProps } from './types';
import { useOfficeViewer } from './useOfficeViewer';
import { DEFAULT_HEIGHT } from './utils';

/**
 * OfficeViewer —— 基于 `@silurus/ooxml`（optional peer）的 docx/xlsx/pptx 预览
 *
 * - 运行时动态 `import('@silurus/ooxml/{docx|xlsx|pptx}')`，未安装时展示降级提示
 * - DOCX 连续滚动；XLSX 带 Sheet 页签；PPTX 单页 + 左侧缩略图侧栏
 * - WASM 默认从 jsDelivr CDN 加载，可通过 `wasmUrl` 覆盖
 *
 * @component
 */
const OfficeViewerComponent: React.FC<OfficeViewerProps> = ({
  file,
  fileType,
  fileName,
  wasmUrl,
  className,
  style,
  height = DEFAULT_HEIGHT,
  loadingRender,
  onLoad,
  onError,
  missingDependencyRender,
  enableSlideRail = true,
}) => {
  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const prefixCls = getPrefixCls('office-viewer');
  const { hashId } = useOfficeViewerStyle(prefixCls);
  const hostRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);

  // 仅 PPTX 且未显式关闭侧栏时，把 rail 宿主传给 hook
  const isPptx = useMemo(
    () =>
      fileType === 'pptx' ||
      (!!fileName && fileName.toLowerCase().endsWith('.pptx')) ||
      (typeof file === 'string' && file.toLowerCase().endsWith('.pptx')),
    [fileType, fileName, file],
  );

  const { status, error, slides } = useOfficeViewer({
    file,
    fileType,
    fileName,
    wasmUrl,
    hostRef,
    railRef: isPptx && enableSlideRail ? railRef : undefined,
    onLoad,
    onError,
  });

  return (
    <div
      className={classNames(prefixCls, hashId, className)}
      style={{ ...style, height }}
      data-testid={prefixCls}
    >
      <div ref={hostRef} className={`${prefixCls}-host`} />

      {status === 'loading' && (
        <div className={`${prefixCls}-status`}>
          {loadingRender ?? <Spin tip="正在加载 Office 文档…" />}
        </div>
      )}

      {status === 'missing-dependency' && (
        <div className={`${prefixCls}-status`}>
          {missingDependencyRender ?? (
            <>
              <div>未安装 Office 预览依赖</div>
              <p className={`${prefixCls}-hint`}>
                请在业务项目中安装 optional peer 依赖后即可启用 docx / xlsx /
                pptx 预览：
              </p>
              <code className={`${prefixCls}-code`}>
                pnpm add @silurus/ooxml
              </code>
            </>
          )}
        </div>
      )}

      {status === 'error' && (
        <div className={`${prefixCls}-status`}>
          <span className={`${prefixCls}-error`}>
            {error?.message || 'Office 文档预览失败'}
          </span>
        </div>
      )}

      {/* 缩略图 canvas 由 hook 直接绘制在 rail 内 */}
      {isPptx && enableSlideRail && (
        <div
          ref={railRef}
          className={`${prefixCls}-rail`}
          data-slide-count={slides.length}
        />
      )}
    </div>
  );
};

OfficeViewerComponent.displayName = 'OfficeViewer';

export const OfficeViewer = memo(OfficeViewerComponent);
export type {
  OfficeFileType,
  OfficeViewerProps,
  OfficeViewerStatus,
} from './types';
export type { SlideThumbnail } from './useOfficeViewer';
export {
  getDefaultWasmUrl,
  inferOfficeFileType,
  OOXML_CDN_BASE,
  OOXML_CDN_VERSION,
} from './utils';
