import { FullscreenOutlined } from '@ant-design/icons';
import { Drawer, Modal } from 'antd';
import classNames from 'clsx';
import React, { useContext, useState } from 'react';
import { ActionIconBox } from '../../Components/ActionIconBox';
import { I18nContext } from '../../I18n';
import type { MarkdownRendererTableConfig } from '../types';

interface MarkdownTableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  prefixCls: string;
  config: MarkdownRendererTableConfig;
}

/** Native table preview. Actions and preview contents mount on interaction. */
export const MarkdownTable = React.memo(function MarkdownTable({
  prefixCls,
  config,
  className,
  style,
  children,
  ...tableProps
}: MarkdownTableProps) {
  const tableCls = `${prefixCls}-content-table`;
  const { locale } = useContext(I18nContext);
  const [actionsMounted, setActionsMounted] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const fullScreen = config.actions?.fullScreen;
  const title = config.previewTitle || locale?.previewTable || '预览表格';
  const table = (
    <table
      {...tableProps}
      className={classNames(`${tableCls}-readonly-table`, className)}
      style={{ tableLayout: 'auto', width: '100%', ...style }}
    >
      {children}
    </table>
  );
  const preview = previewOpen ? (
    <div className={`${prefixCls}-content`} style={{ overflow: 'auto' }}>
      {table}
    </div>
  ) : null;

  return (
    <>
      <div className={tableCls} data-testid="markdown-table">
        <div
          className={`${tableCls}-container`}
          tabIndex={fullScreen ? 0 : undefined}
          onMouseEnter={() => setActionsMounted(true)}
          onFocusCapture={() => setActionsMounted(true)}
        >
          {table}
          {fullScreen && actionsMounted ? (
            <div className={`${tableCls}-readonly-table-actions`}>
              <ActionIconBox
                title={locale?.fullScreen || '全屏'}
                onClick={(event) => {
                  event.stopPropagation();
                  setPreviewOpen(true);
                }}
                data-testid="markdown-table-fullscreen"
              >
                <FullscreenOutlined />
              </ActionIconBox>
            </div>
          ) : null}
        </div>
      </div>
      {previewOpen && fullScreen === 'drawer' ? (
        <Drawer
          open
          title={title}
          size="large"
          onClose={() => setPreviewOpen(false)}
        >
          {preview}
        </Drawer>
      ) : null}
      {previewOpen && fullScreen === 'modal' ? (
        <Modal
          open
          title={title}
          footer={null}
          width="80vw"
          onCancel={() => setPreviewOpen(false)}
        >
          {preview}
        </Modal>
      ) : null}
    </>
  );
});
