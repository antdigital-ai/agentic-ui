import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { ConfigProvider, Spin } from 'antd';
import classNames from 'clsx';
import React, { memo, useContext, useMemo, useRef, useState } from 'react';
import { useOfficeViewerStyle } from './style';
import type { OfficeViewerProps } from './types';
import { useOfficeViewer } from './useOfficeViewer';
import { DEFAULT_HEIGHT } from './utils';

/**
 * OfficeViewer —— 基于 `@silurus/ooxml`（optional peer）的 Office 三件套预览组件
 *
 * @component
 * @description 在浏览器 Canvas 中预览 docx / xlsx / pptx。运行时动态 `import` 对合格式子模块，
 * 未安装 `@silurus/ooxml` 时展示降级提示，不影响主包体积。DOCX 连续滚动；XLSX 自带 Sheet
 * 页签；PPTX 单页浏览 + 左侧缩略图侧栏（可展开/收起）。三种格式均支持划选复制。
 * WASM 解析器默认从 jsDelivr CDN 加载，生产环境可经 `wasmUrl` 切换为自有 CDN。
 *
 * @param {OfficeViewerProps} props - 组件属性
 * @param {File | Blob | string | ArrayBuffer} [props.file] - 文件源：远程 URL、本地 File/Blob 或 ArrayBuffer
 * @param {OfficeFileType} [props.fileType] - 显式指定格式；缺省按 `fileName` / URL / File.name 扩展名推断
 * @param {string | URL} [props.wasmUrl] - WASM 解析器地址，覆盖默认 CDN
 * @param {number | string} [props.height=480] - 容器高度
 * @param {boolean} [props.enableSlideRail=true] - PPTX 是否启用左侧缩略图侧栏
 * @param {() => void} [props.onLoad] - 文档加载完成回调
 * @param {(error: Error) => void} [props.onError] - 加载或渲染失败回调
 *
 * @example
 * ```tsx
 * <OfficeViewer file="/files/deck.pptx" height={480} />
 * ```
 *
 * @returns {React.ReactElement} Office 预览容器
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
  const [railCollapsed, setRailCollapsed] = useState(false);

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
      {/* 缩略图 canvas 由 hook 直接绘制在 rail 内 */}
      {isPptx && enableSlideRail && (
        <>
          <div
            ref={railRef}
            className={classNames(`${prefixCls}-rail`, {
              [`${prefixCls}-rail-collapsed`]: railCollapsed,
            })}
            data-slide-count={slides.length}
          />
          <button
            type="button"
            className={`${prefixCls}-rail-toggle`}
            aria-expanded={!railCollapsed}
            aria-label={railCollapsed ? '展开缩略图侧栏' : '收起缩略图侧栏'}
            title={railCollapsed ? '展开侧栏' : '收起侧栏'}
            onClick={() => setRailCollapsed((prev) => !prev)}
          >
            {railCollapsed ? <RightOutlined /> : <LeftOutlined />}
          </button>
        </>
      )}
      <div
        ref={hostRef}
        className={classNames(`${prefixCls}-host`, {
          [`${prefixCls}-host-center`]: isPptx && enableSlideRail,
        })}
        data-testid={`${prefixCls}-host`}
      />

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
export type { SlideThumbnail } from './useOfficeViewer';
export {
  getDefaultWasmUrl,
  inferOfficeFileType,
  OOXML_CDN_BASE,
  OOXML_CDN_VERSION,
} from './utils';
