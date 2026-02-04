import { EllipsisVertical } from '@sofa-design/icons';
import { Popover } from 'antd';
import classNames from 'classnames';
import RcResizeObserver from 'rc-resize-observer';
import React, { useContext, useMemo } from 'react';
import { ActionIconBox } from '../../Components/ActionIconBox';
import { I18nContext } from '../../I18n';
import type { AttachmentButtonProps } from '../AttachmentButton';
import { AttachmentButton } from '../AttachmentButton';
import type { AttachmentFile } from '../AttachmentButton/types';
import type { SendButtonCustomizationProps } from '../SendButton';
import { SendButton } from '../SendButton';
import type { CreateRecognizer } from '../VoiceInput';
import { VoiceInputButton } from '../VoiceInput';

export interface SendActionsProps {
  /** 附件配置 */
  attachment?: {
    enable?: boolean;
    supportedFormat?: AttachmentButtonProps['supportedFormat'];
    fileMap?: Map<string, AttachmentFile>;
    onFileMapChange?: (fileMap?: Map<string, AttachmentFile>) => void;
    onDelete?: (file: AttachmentFile) => Promise<void>;
    upload?: (file: AttachmentFile) => Promise<string | undefined>;
  } & AttachmentButtonProps;

  /** 语音识别器 */
  voiceRecognizer?: CreateRecognizer;

  /** 当前输入值 */
  value?: string;

  /** 是否禁用 */
  disabled?: boolean;

  /** 是否正在输入 */
  typing?: boolean;

  /** 是否加载中 */
  isLoading?: boolean;

  /** 文件上传是否完成 */
  fileUploadDone?: boolean;

  /** 是否正在录音 */
  recording?: boolean;

  /** 是否折叠操作按钮 */
  collapseSendActions?: boolean;

  /** 是否允许空内容提交 */
  allowEmptySubmit?: boolean;

  /** 上传图片回调 */
  uploadImage?: (forGallery?: boolean) => Promise<void>;

  /** 开始录音回调 */
  onStartRecording?: () => Promise<void>;

  /** 停止录音回调 */
  onStopRecording?: () => Promise<void>;

  /** 发送消息回调 */
  onSend?: () => void;

  /** 停止操作回调 */
  onStop?: () => void;

  /** 自定义渲染函数 */
  actionsRender?: (
    props: any,
    defaultActions: React.ReactNode[],
  ) => React.ReactNode[];

  /** CSS 类名前缀 */
  prefixCls?: string;

  /** hash ID */
  hashId?: string;

  /** 是否有工具栏 */
  hasTools?: boolean;

  /** resize 回调 */
  onResize?: (width: number) => void;

  /** 发送按钮配置 */
  sendButtonProps?: SendButtonCustomizationProps;

  /** 触发发送的快捷键 */
  triggerSendKey?: 'Enter' | 'Mod+Enter';
}

/**
 * SendActions 组件 - 发送操作按钮区域
 *
 * @description 封装发送操作相关的按钮，包括附件上传、语音输入、发送按钮等
 */
export const SendActions: React.FC<SendActionsProps> = ({
  attachment,
  voiceRecognizer,
  value,
  disabled,
  typing,
  isLoading,
  fileUploadDone = true,
  recording = false,
  collapseSendActions = false,
  allowEmptySubmit = false,
  uploadImage,
  onStartRecording,
  onStopRecording,
  onSend,
  onStop,
  actionsRender,
  prefixCls = 'ant-agentic-md-input-field',
  hashId = '',
  hasTools = false,
  onResize,
  sendButtonProps,
  triggerSendKey,
}) => {
  const fileMap = attachment?.fileMap;

  const defaultActionsLen = [
    attachment?.enable ? '()' : null,
    voiceRecognizer ? '()' : null,
    '()',
  ].filter(Boolean).length;
  const { locale } = useContext(I18nContext);

  /**
   * 默认发送操作按钮
   */
  const defaultActions = useMemo(() => {
    return [
      attachment?.enable ? (
        <AttachmentButton
          uploadImage={uploadImage || (() => Promise.resolve())}
          key="attachment-button"
          title={
            collapseSendActions && defaultActionsLen > 2
              ? locale?.['input.fileUpload'] || '文件上传'
              : ''
          }
          {...attachment}
          fileMap={fileMap}
          onFileMapChange={(fileMap) => {
            attachment?.onFileMapChange?.(fileMap);
          }}
          disabled={!fileUploadDone || attachment?.disabled}
        />
      ) : null,
      voiceRecognizer ? (
        <VoiceInputButton
          key="voice-input-button"
          title={
            collapseSendActions && defaultActionsLen > 2
              ? locale?.['input.voiceInput'] || '语音输入'
              : ''
          }
          recording={recording}
          disabled={disabled}
          onStart={onStartRecording || (() => Promise.resolve())}
          onStop={onStopRecording || (() => Promise.resolve())}
        />
      ) : null,
      <SendButton
        key="send-button"
        typing={!!typing || !!isLoading}
        isSendable={
          allowEmptySubmit ||
          !!value?.trim() ||
          (fileMap && fileMap.size > 0) ||
          recording
        }
        disabled={disabled}
        onClick={() => {
          if (typing || isLoading) {
            onStop?.();
            return;
          }
          onSend?.();
        }}
        triggerSendKey={triggerSendKey}
        {...sendButtonProps}
      />,
    ].filter(Boolean);
  }, [
    attachment,
    fileUploadDone,
    value,
    collapseSendActions,
    isLoading,
    disabled,
    typing,
    recording,
    voiceRecognizer,
    allowEmptySubmit,
    uploadImage,
    onStartRecording,
    onStopRecording,
    onSend,
    onStop,
    fileMap,
    sendButtonProps,
    triggerSendKey,
  ]);

  const actionsList = actionsRender
    ? actionsRender(
        {
          attachment,
          voiceRecognizer,
          value,
          disabled,
          typing,
          isLoading,
          fileUploadDone,
          recording,
          collapseSendActions,
          allowEmptySubmit,
          uploadImage,
          onStartRecording,
          onStopRecording,
          onSend,
          onStop,
          fileUploadStatus: fileUploadDone ? 'done' : 'uploading',
        },
        defaultActions,
      )
    : defaultActions;

  return (
    <RcResizeObserver
      onResize={(e) => {
        onResize?.(e.offsetWidth);
      }}
    >
      <div
        contentEditable={false}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
        onKeyDown={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
        className={classNames(
          `${prefixCls}-send-actions`,
          {
            [`${prefixCls}-send-has-tools`]: hasTools,
          },
          hashId,
        )}
      >
        {collapseSendActions && actionsList.length > 2 ? (
          <>
            <Popover
              trigger="click"
              styles={{
                body: {
                  padding: 4,
                },
              }}
              arrow={false}
              content={
                <div
                  style={{
                    width: 100,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                  }}
                >
                  {actionsList?.filter((item) => {
                    if (
                      React.isValidElement(item) &&
                      item?.key === 'send-button'
                    ) {
                      return false;
                    }
                    return true;
                  })}
                </div>
              }
            >
              <ActionIconBox
                style={{
                  fontSize: 16,
                  color: 'var(--color-gray-text-secondary)',
                }}
              >
                <EllipsisVertical />
              </ActionIconBox>
            </Popover>
            {actionsList.find((item) => {
              if (React.isValidElement(item) && item?.key === 'send-button') {
                return true;
              }
              return false;
            })}
          </>
        ) : (
          actionsList
        )}
      </div>
    </RcResizeObserver>
  );
};
