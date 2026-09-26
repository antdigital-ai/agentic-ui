import { ConfigProvider, Spin } from 'antd';
import classNames from 'clsx';
import React, { memo, useContext, useRef } from 'react';
import { useOfficeViewerStyle } from './style';
import type { OfficeViewerProps } from './types';
import { useOfficeViewer } from './useOfficeViewer';
import { DEFAULT_HEIGHT } from './utils';

/**
 * OfficeViewer —— 基于 `@silurus/ooxml`（optional peer）的 docx/xlsx/pptx 预览
 *
 * - 运行时动态 `import('@silurus/ooxml/{docx|xlsx|pptx}')`，未安装时展示降级提示
 * - DOCX/PPTX 使用 ScrollViewer；XLSX 使用带 Sheet 页签的 XlsxViewer
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
}) => {
  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const prefixCls = getPrefixCls('office-viewer');
  const { hashId } = useOfficeViewerStyle(prefixCls);
  const hostRef = useRef<HTMLDivElement>(null);

  const { status, error } = useOfficeViewer({
    file,
    fileType,
    fileName,
    wasmUrl,
    hostRef,
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
export {
  getDefaultWasmUrl,
  inferOfficeFileType,
  OOXML_CDN_BASE,
  OOXML_CDN_VERSION,
} from './utils';
