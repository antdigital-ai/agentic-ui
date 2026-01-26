import React, { useMemo } from 'react';
import type { AttachmentButtonProps } from '../AttachmentButton';
import { AttachmentFileList } from '../AttachmentButton/AttachmentFileList';
import type { AttachmentFile } from '../AttachmentButton/types';
import { SendActions } from '../SendActions';
import type { MarkdownInputFieldProps } from '../types/MarkdownInputFieldProps';

interface UseAttachmentListParams {
  attachment?: MarkdownInputFieldProps['attachment'];
  fileMap?: Map<string, AttachmentFile>;
  handleFileRemoval: (file: AttachmentFile) => Promise<void>;
  handleFileRetry: (file: AttachmentFile) => Promise<void>;
  updateAttachmentFiles: (fileMap?: Map<string, AttachmentFile>) => void;
}

/**
 * 附件列表渲染 Hook
 */
export const useAttachmentList = ({
  attachment,
  fileMap,
  handleFileRemoval,
  handleFileRetry,
  updateAttachmentFiles,
}: UseAttachmentListParams): React.ReactNode => {
  return useMemo(() => {
    if (!attachment?.enable) return null;
    return React.createElement(AttachmentFileList, {
      fileMap,
      onDelete: handleFileRemoval,
      onRetry: handleFileRetry,
      onClearFileMap: () => {
        updateAttachmentFiles(undefined);
      },
    });
  }, [
    attachment?.enable,
    fileMap,
    handleFileRemoval,
    handleFileRetry,
    updateAttachmentFiles,
  ]);
};

interface UseBeforeToolsParams {
  beforeToolsRender?: MarkdownInputFieldProps['beforeToolsRender'];
  props: MarkdownInputFieldProps;
  isHover: boolean;
  isLoading: boolean;
}

/**
 * BeforeTools 渲染 Hook
 */
export const useBeforeTools = ({
  beforeToolsRender,
  props,
  isHover,
  isLoading,
}: UseBeforeToolsParams): React.ReactNode => {
  return useMemo(() => {
    if (beforeToolsRender) {
      return beforeToolsRender({
        ...props,
        isHover,
        isLoading,
      });
    }
    return null;
  }, [beforeToolsRender, props, isHover, isLoading]);
};

interface UseSendActionsNodeParams {
  props: Pick<
    MarkdownInputFieldProps,
    | 'attachment'
    | 'voiceRecognizer'
    | 'value'
    | 'disabled'
    | 'typing'
    | 'allowEmptySubmit'
    | 'actionsRender'
    | 'toolsRender'
    | 'sendButtonProps'
    | 'triggerSendKey'
  >;
  fileMap?: Map<string, AttachmentFile>;
  setFileMap?: (fileMap?: Map<string, AttachmentFile>) => void;
  supportedFormat: AttachmentButtonProps['supportedFormat'];
  fileUploadDone: boolean;
  recording: boolean;
  isLoading: boolean;
  collapseSendActions: boolean;
  uploadImage: (forGallery?: boolean) => Promise<void>;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  sendMessage: () => Promise<void>;
  setIsLoading: (loading: boolean) => void;
  onStop?: () => void;
  setRightPadding: (padding: number) => void;
  baseCls: string;
  hashId: string;
}

/**
 * SendActions 节点渲染 Hook
 */
export const useSendActionsNode = ({
  props: sendProps,
  fileMap,
  setFileMap,
  supportedFormat,
  fileUploadDone,
  recording,
  isLoading,
  collapseSendActions,
  uploadImage,
  startRecording,
  stopRecording,
  sendMessage,
  setIsLoading,
  onStop,
  setRightPadding,
  baseCls,
  hashId,
}: UseSendActionsNodeParams): React.ReactElement => {
  return useMemo(
    () =>
      React.createElement(SendActions, {
        attachment: {
          ...sendProps.attachment,
          supportedFormat,
          fileMap,
          onFileMapChange: setFileMap,
          upload: sendProps.attachment?.upload
            ? (file: any) => sendProps.attachment!.upload!(file, 0)
            : undefined,
        },
        voiceRecognizer: sendProps.voiceRecognizer,
        value: sendProps.value,
        disabled: sendProps.disabled,
        typing: sendProps.typing,
        isLoading,
        fileUploadDone,
        recording,
        collapseSendActions,
        allowEmptySubmit: sendProps.allowEmptySubmit,
        uploadImage,
        onStartRecording: startRecording,
        onStopRecording: stopRecording,
        onSend: sendMessage,
        onStop: () => {
          setIsLoading(false);
          onStop?.();
        },
        actionsRender: sendProps.actionsRender,
        prefixCls: baseCls,
        hashId,
        hasTools: !!sendProps.toolsRender,
        onResize: setRightPadding,
        sendButtonProps: sendProps.sendButtonProps,
        triggerSendKey: sendProps.triggerSendKey,
      }),
    [
      sendProps.attachment,
      sendProps.voiceRecognizer,
      sendProps.value,
      sendProps.disabled,
      sendProps.typing,
      sendProps.allowEmptySubmit,
      sendProps.actionsRender,
      sendProps.toolsRender,
      sendProps.sendButtonProps,
      sendProps.triggerSendKey,
      fileMap,
      setFileMap,
      supportedFormat,
      fileUploadDone,
      recording,
      isLoading,
      collapseSendActions,
      uploadImage,
      startRecording,
      stopRecording,
      sendMessage,
      setIsLoading,
      onStop,
      setRightPadding,
      baseCls,
      hashId,
    ],
  );
};
