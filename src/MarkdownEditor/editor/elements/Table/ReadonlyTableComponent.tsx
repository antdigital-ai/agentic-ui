import { FullscreenOutlined } from '@ant-design/icons';
import { Copy } from '@sofa-design/icons';
import { ConfigProvider, Modal } from 'antd';
import classNames from 'clsx';
import copy from 'copy-to-clipboard';
import React, {
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ActionIconBox } from '../../../../Components/ActionIconBox';
import {
  TABLE_COL_WIDTH_MIN_COLUMNS,
  TABLE_DEFAULT_COL_WIDTH,
  TABLE_LAST_COL_MIN_WIDTH,
} from '../../../../Constants/mobile';
import { I18nContext } from '../../../../I18n';
import { useEditorStore } from '../../store';
import { TableNode } from '../../types/Table';
import { parserSlateNodeToMarkdown } from '../../utils';

interface ReadonlyTableComponentProps {
  children: React.ReactNode;
  element: TableNode;
  baseCls: string;
}

/**
 * 专门针对 readonly 模式优化的表格组件
 * 移除了不必要的滚动监听和复杂的宽度计算
 */
export const ReadonlyTableComponent: React.FC<ReadonlyTableComponentProps> =
  React.memo(({ children, element, baseCls }) => {
    const { editorProps } = useEditorStore();
    const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
    const {
      actions = {
        download: 'csv',
        fullScreen: 'modal',
        copy: 'md',
      },
    } = editorProps?.tableConfig || {};

    const tableTargetRef = useRef<HTMLTableElement>(null);
    const modelTargetRef = useRef<HTMLDivElement>(null);
    const [previewOpen, setPreviewOpen] = useState(false);
    const i18n = useContext(I18nContext);

    // 简化的列宽计算 - 只为 readonly 模式设计，少于 3 列不设置 col
    const colWidths = useMemo(() => {
      const columnCount = element?.children?.[0]?.children?.length || 0;
      if (
        columnCount === 0 ||
        columnCount < TABLE_COL_WIDTH_MIN_COLUMNS
      )
        return [];

      const otherProps = element?.otherProps as any;
      if (otherProps?.colWidths) {
        return otherProps.colWidths;
      }

      return Array(columnCount).fill(TABLE_DEFAULT_COL_WIDTH);
    }, [element?.otherProps, element?.children?.[0]?.children?.length]);

    // 缓存复制处理函数
    const handleCopy = useCallback(() => {
      try {
        let contentToCopy = '';

        // 根据复制类型确定要复制的内容
        if (actions?.copy === 'html') {
          contentToCopy = tableTargetRef.current?.innerHTML || '';
        } else if (actions?.copy === 'csv') {
          const otherProps = element?.otherProps as any;
          if (otherProps?.columns && otherProps?.dataSource) {
            contentToCopy =
              otherProps.columns
                .map((col: Record<string, any>) => col.title)
                .join(',') +
              '\n' +
              otherProps.dataSource
                .map((row: Record<string, any>) => Object.values(row).join(','))
                .join('\n');
          }
        } else {
          // 默认复制 Markdown 格式
          contentToCopy = parserSlateNodeToMarkdown([element]);
        }

        // 使用 copy-to-clipboard 库进行复制
        copy(contentToCopy);
      } catch (error) {
        console.error('Copy failed:', error);
      }
    }, [element, actions?.copy]);

    // 缓存全屏处理函数
    const handleFullScreen = useCallback((e: React.MouseEvent) => {
      e.stopPropagation();
      setPreviewOpen(true);
    }, []);

    // 缓存模态框关闭函数
    const handleModalClose = useCallback(() => {
      setPreviewOpen(false);
    }, []);

    // 缓存表格DOM
    const tableDom = useMemo(
      () => (
        <table
          ref={tableTargetRef}
          className={classNames(
            `${baseCls}-editor-table`,
            'readonly',
            `${baseCls}-readonly-table`,
            {
              [`${baseCls}-readonly-pure`]: editorProps?.tableConfig?.pure,
            },
          )}
        >
          {colWidths.length > 0 && (
            <colgroup>
              {colWidths.map((colWidth: number, index: number) => {
                    const isLastCol = index === colWidths.length - 1;
                return (
                  <col
                    key={index}
                    style={
                      isLastCol
                        ? { minWidth: TABLE_LAST_COL_MIN_WIDTH }
                        : {
                            width: colWidth,
                            minWidth: colWidth,
                            maxWidth: colWidth,
                          }
                    }
                  />
                );
              })}
            </colgroup>
          )}
          <tbody>{children}</tbody>
        </table>
      ),
      [colWidths, children, baseCls],
    );

    // 缓存操作按钮内容
    const popoverContent = useMemo(
      () => (
        <div className={classNames(`${baseCls}-readonly-table-actions`)}>
          {actions?.fullScreen && (
            <ActionIconBox
              title={i18n?.locale?.fullScreen || '全屏'}
              onClick={handleFullScreen}
            >
              <FullscreenOutlined />
            </ActionIconBox>
          )}
          {actions?.copy && (
            <ActionIconBox
              title={i18n?.locale?.copy || '复制'}
              onClick={handleCopy}
            >
              <Copy />
            </ActionIconBox>
          )}
        </div>
      ),
      [
        actions?.fullScreen,
        actions?.copy,
        i18n?.locale,
        handleFullScreen,
        handleCopy,
      ],
    );

    return (
      <>
        <div className={classNames(baseCls)}>{tableDom}</div>
        {popoverContent}
        {previewOpen && (
          <Modal
            title={
              editorProps?.tableConfig?.previewTitle ||
              i18n?.locale?.previewTable ||
              '预览表格'
            }
            open={previewOpen}
            closable
            footer={null}
            afterClose={handleModalClose}
            width="80vw"
            onCancel={handleModalClose}
          >
            <div
              className={getPrefixCls('agentic-md-editor')}
              style={{ flex: 1, minWidth: 0 }}
            >
              <div
                className={classNames(
                  baseCls,
                  getPrefixCls('agentic-md-editor-content'),
                )}
                style={{
                  flex: 1,
                  minWidth: 0,
                  overflow: 'auto',
                  width: 'calc(80vw - 64px)',
                }}
                ref={modelTargetRef}
                onMouseDown={(e) => {
                  e.preventDefault();
                }}
                onDragStart={(e) => {
                  e.preventDefault();
                }}
                onDoubleClick={(e) => {
                  e.preventDefault();
                }}
              >
                <ConfigProvider
                  getPopupContainer={() =>
                    modelTargetRef.current || document.body
                  }
                  getTargetContainer={() =>
                    modelTargetRef.current || document.body
                  }
                >
                  {tableDom}
                </ConfigProvider>
              </div>
            </div>
          </Modal>
        )}
      </>
    );
  });

ReadonlyTableComponent.displayName = 'ReadonlyTableComponent';
