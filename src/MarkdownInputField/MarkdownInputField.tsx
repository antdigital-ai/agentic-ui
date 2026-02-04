import { ConfigProvider } from 'antd';
import classNames from 'classnames';
import React, { memo, useContext, useState } from 'react';
import { BaseMarkdownEditor } from '../MarkdownEditor';
import { BorderBeamAnimation } from './BorderBeamAnimation';
import { useFileUploadManager } from './FileUploadManager';
import { useMarkdownInputFieldActions } from './hooks/useMarkdownInputFieldActions';
import { useMarkdownInputFieldHandlers } from './hooks/useMarkdownInputFieldHandlers';
import { useMarkdownInputFieldLayout } from './hooks/useMarkdownInputFieldLayout';
import { useMarkdownInputFieldRefs } from './hooks/useMarkdownInputFieldRefs';
import { useMarkdownInputFieldState } from './hooks/useMarkdownInputFieldState';
import { useMarkdownInputFieldStyles } from './hooks/useMarkdownInputFieldStyles';
import { QuickActions } from './QuickActions';
import { SkillModeBar } from './SkillModeBar';
import { useStyle } from './style';
import { Suggestion } from './Suggestion';
import TopOperatingArea from './TopOperatingArea';
import type { MarkdownInputFieldProps } from './types/MarkdownInputFieldProps';
import {
  useAttachmentList,
  useBeforeTools,
  useSendActionsNode,
} from './utils/renderHelpers';
import { useVoiceInputManager } from './VoiceInputManager';

export type { MarkdownInputFieldProps };

/**
 * MarkdownInputField 组件 - Markdown输入字段组件
 *
 * 该组件提供一个功能完整的Markdown输入框，支持实时预览、文件附件、
 * 快捷键发送、自动完成等功能。是聊天应用中的核心输入组件。
 *
 * @component
 * @description Markdown输入字段组件，支持实时预览和文件附件
 * @param {MarkdownInputFieldProps} props - 组件属性
 * @param {string} [props.value] - 输入框的值
 * @param {(value: string) => void} [props.onChange] - 值变化时的回调
 * @param {(value: string) => Promise<void>} [props.onSend] - 发送消息的回调
 * @param {string} [props.placeholder] - 占位符文本
 * @param {string} [props.triggerSendKey='Enter'] - 触发发送的快捷键（Enter 发送，Shift+Enter 换行）
 * @param {boolean} [props.disabled] - 是否禁用
 * @param {boolean} [props.typing] - 是否正在输入
 * @param {AttachmentProps} [props.attachment] - 附件配置
 * @param {string[]} [props.bgColorList] - 背景颜色列表，推荐使用3-4种颜色
 * @param {React.RefObject} [props.inputRef] - 输入框引用
 * @param {MarkdownRenderConfig} [props.markdownRenderConfig] - Markdown渲染配置
 * @param {SuggestionProps} [props.suggestion] - 自动完成配置
 *
 * @example
 * ```tsx
 * <MarkdownInputField
 *   value="# 标题"
 *   onChange={(value) => console.log(value)}
 *   onSend={(value) => Promise.resolve()}
 *   placeholder="请输入Markdown文本..."
 *   triggerSendKey="Enter"
 * />
 * ```
 *
 * @returns {React.ReactElement} 渲染的Markdown输入字段组件
 *
 * @remarks
 * - 支持实时Markdown预览
 * - 支持文件附件上传
 * - 支持快捷键发送消息
 * - 支持自动完成功能
 * - 支持自定义渲染配置
 */
const MarkdownInputFieldComponent: React.FC<MarkdownInputFieldProps> = ({
  tagInputProps,
  markdownProps,
  borderRadius = 16,
  onBlur,
  onFocus,
  isShowTopOperatingArea = false,
  ...props
}) => {
  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const baseCls = getPrefixCls('agentic-md-input-field');
  const { wrapSSR, hashId } = useStyle(baseCls, props.disableHoverAnimation);

  // 状态管理
  const {
    isHover,
    setHover,
    isLoading,
    setIsLoading,
    isEnlarged,
    setIsEnlarged,
    value,
    setValue,
    fileMap,
    setFileMap,
  } = useMarkdownInputFieldState({
    value: props.value,
    onChange: props.onChange,
    attachment: props.attachment,
  });

  // 边框光束动画状态
  const [isFocused, setIsFocused] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);

  // 布局管理
  const {
    collapseSendActions,
    rightPadding,
    setRightPadding,
    topRightPadding,
    setTopRightPadding,
    quickRightOffset,
    setQuickRightOffset,
    inputRef,
  } = useMarkdownInputFieldLayout();

  // 动作计算
  const {
    hasEnlargeAction,
    hasRefineAction,
    isMultiRowLayout,
    totalActionCount,
  } = useMarkdownInputFieldActions({
    enlargeable: props.enlargeable,
    refinePrompt: props.refinePrompt,
    quickActionRender: props.quickActionRender,
    actionsRender: props.actionsRender,
    toolsRender: props.toolsRender,
  });

  // 样式计算
  const {
    computedRightPadding,
    collapsedHeightPx,
    computedMinHeight,
    enlargedStyle,
  } = useMarkdownInputFieldStyles({
    toolsRender: props.toolsRender,
    maxHeight: props.maxHeight,
    style: props.style,
    attachment: props.attachment,
    isEnlarged,
    rightPadding,
    topRightPadding,
    quickRightOffset,
    hasEnlargeAction,
    hasRefineAction,
    totalActionCount,
    isMultiRowLayout,
  });

  // Refs 管理
  const { markdownEditorRef, quickActionsRef, actionsRef, isSendingRef } =
    useMarkdownInputFieldRefs(
      {
        inputRef: props.inputRef,
        value: props.value,
      },
      value,
    );

  // 文件上传管理
  const {
    fileUploadDone,
    supportedFormat,
    uploadImage,
    updateAttachmentFiles,
    handleFileRemoval,
    handleFileRetry,
  } = useFileUploadManager({
    attachment: props.attachment,
    fileMap,
    onFileMapChange: setFileMap,
  });

  // 语音输入管理
  const { recording, startRecording, stopRecording } = useVoiceInputManager({
    voiceRecognizer: props.voiceRecognizer,
    editorRef: markdownEditorRef,
    onValueChange: setValue,
  });

  // 事件处理
  const {
    handleEnlargeClick,
    sendMessage,
    handlePaste,
    handleKeyDown,
    activeInput,
  } = useMarkdownInputFieldHandlers({
    props: {
      disabled: props.disabled,
      typing: props.typing,
      onChange: props.onChange,
      onSend: props.onSend,
      allowEmptySubmit: props.allowEmptySubmit,
      markdownProps,
      attachment: props.attachment,
      triggerSendKey: props.triggerSendKey,
    },
    markdownEditorRef,
    inputRef,
    isSendingRef,
    isLoading,
    setIsLoading,
    value,
    setValue,
    fileMap,
    setFileMap,
    recording,
    stopRecording,
    isEnlarged,
    setIsEnlarged,
  });

  // 渲染辅助
  const attachmentList = useAttachmentList({
    attachment: props.attachment,
    fileMap,
    handleFileRemoval,
    handleFileRetry,
    updateAttachmentFiles,
  });

  const beforeTools = useBeforeTools({
    beforeToolsRender: props.beforeToolsRender,
    props,
    isHover,
    isLoading,
  });

  const sendActionsNode = useSendActionsNode({
    props: {
      attachment: props.attachment,
      voiceRecognizer: props.voiceRecognizer,
      value,
      disabled: props.disabled,
      typing: props.typing,
      allowEmptySubmit: props.allowEmptySubmit,
      actionsRender: props.actionsRender,
      toolsRender: props.toolsRender,
      sendButtonProps: props.sendButtonProps,
      triggerSendKey: props.triggerSendKey,
    },
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
    onStop: props.onStop,
    setRightPadding,
    baseCls,
    hashId,
  });

  return wrapSSR(
    <>
      {isShowTopOperatingArea && (
        <div className={classNames(`${baseCls}-top-area`, hashId)}>
          <TopOperatingArea
            targetRef={props.targetRef}
            operationBtnRender={props.operationBtnRender}
            isShowBackTo={props.isShowBackTo}
          />
        </div>
      )}
      {beforeTools ? (
        <div className={classNames(`${baseCls}-before-tools`, hashId)}>
          {beforeTools}
        </div>
      ) : null}
      <Suggestion
        tagInputProps={{
          enable: true,
          type: 'dropdown',
          ...tagInputProps,
        }}
      >
        <div
          ref={inputRef}
          className={classNames(baseCls, hashId, props.className, {
            [`${baseCls}-disabled`]: props.disabled,
            [`${baseCls}-skill-mode`]: props.skillMode?.open,
            [`${baseCls}-typing`]: false,
            [`${baseCls}-loading`]: isLoading,
            [`${baseCls}-is-multi-row`]: isMultiRowLayout,
            [`${baseCls}-enlarged`]: isEnlarged,
            [`${baseCls}-focused`]: isFocused,
            [`${baseCls}-has-tools-wrapper`]: !!props.toolsRender,
          })}
          style={{
            ...props.style,
            ...enlargedStyle,
            height: isEnlarged
              ? `${props.enlargeable?.height ?? 980}px`
              : `min(${collapsedHeightPx}px,100%)`,
            borderRadius: borderRadius || 12,
            minHeight: computedMinHeight,
            maxHeight: isEnlarged
              ? 'none'
              : props.maxHeight !== undefined
                ? typeof props.maxHeight === 'number'
                  ? `${props.maxHeight}px`
                  : props.maxHeight
                : `min(${collapsedHeightPx}px,100%)`,
          }}
          tabIndex={1}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          onKeyDown={handleKeyDown}
        >
          <BorderBeamAnimation
            isVisible={isFocused && !animationComplete}
            borderRadius={borderRadius || 16}
            onAnimationComplete={() => setAnimationComplete(true)}
          />
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              borderRadius: !!props.toolsRender ? 0 : 'inherit',
              borderTopLeftRadius: 'inherit',
              borderTopRightRadius: 'inherit',
              height: isEnlarged ? '100%' : 'auto',
              flex: 1,
              minHeight: 0,
            }}
            className={classNames(`${baseCls}-editor`, hashId, {
              [`${baseCls}-editor-hover`]: isHover,
              [`${baseCls}-editor-disabled`]: props.disabled,
            })}
          >
            {/* 技能模式部分 */}
            <SkillModeBar
              skillMode={props.skillMode}
              onSkillModeOpenChange={props.onSkillModeOpenChange}
            />

            <div className={classNames(`${baseCls}-editor-content`, hashId)}>
              {attachmentList}

              <BaseMarkdownEditor
                editorRef={markdownEditorRef}
                leafRender={props.leafRender}
                style={{
                  width: '100%',
                  minHeight: 0,
                  flex: 1,
                  padding: 0,
                }}
                toolBar={{
                  enable: false,
                }}
                floatBar={{
                  enable: false,
                }}
                readonly={isLoading}
                contentStyle={{
                  alignItems: 'flex-start',
                  padding: 'var(--padding-3x)',
                  paddingRight: computedRightPadding || 'var(--padding-3x)',
                }}
                textAreaProps={{
                  enable: true,
                  placeholder: props.placeholder,
                }}
                tagInputProps={{
                  enable: true,
                  type: 'dropdown',
                  ...tagInputProps,
                }}
                initValue={props.value}
                onChange={(value) => {
                  // 检查并限制字符数
                  if (props.maxLength !== undefined) {
                    if (value.length > props.maxLength) {
                      const truncatedValue = value.slice(0, props.maxLength);
                      setValue(truncatedValue);
                      props.onChange?.(truncatedValue);
                      props.onMaxLengthExceeded?.(value);
                      // 更新编辑器内容以反映截断后的值
                      markdownEditorRef.current?.store?.setMDContent(
                        truncatedValue,
                      );
                      return;
                    }
                  }
                  setValue(value);
                  props.onChange?.(value);
                }}
                onFocus={(value, schema, e) => {
                  onFocus?.(value, schema, e);
                  activeInput(true);
                  setIsFocused(true);
                  setAnimationComplete(false);
                }}
                onBlur={(value, schema, e) => {
                  onBlur?.(value, schema, e);
                  activeInput(false);
                  setIsFocused(false);
                  setAnimationComplete(false);
                }}
                onPaste={(e) => {
                  handlePaste(e);
                }}
                titlePlaceholderContent={props.placeholder}
                toc={false}
                pasteConfig={props.pasteConfig}
                {...markdownProps}
              >
                {props?.quickActionRender ||
                props.refinePrompt?.enable ||
                props.enlargeable?.enable ? (
                  <QuickActions
                    ref={quickActionsRef}
                    value={value}
                    fileMap={fileMap}
                    onFileMapChange={setFileMap}
                    isHover={isHover}
                    isLoading={isLoading}
                    disabled={props.disabled}
                    fileUploadStatus={fileUploadDone ? 'done' : 'uploading'}
                    refinePrompt={props.refinePrompt}
                    editorRef={markdownEditorRef}
                    onValueChange={(text) => {
                      setValue(text);
                      props.onChange?.(text);
                    }}
                    quickActionRender={props.quickActionRender as any}
                    prefixCls={baseCls}
                    hashId={hashId}
                    enlargeable={!!props.enlargeable?.enable}
                    isEnlarged={isEnlarged}
                    onEnlargeClick={handleEnlargeClick}
                    onResize={(width, rightOffset) => {
                      setTopRightPadding(width);
                      setQuickRightOffset(rightOffset);
                    }}
                  />
                ) : null}
              </BaseMarkdownEditor>
            </div>
          </div>
          {props.toolsRender ? (
            <div className={classNames(`${baseCls}-tools-wrapper`, hashId)}>
              <div
                ref={actionsRef}
                contentEditable={false}
                className={classNames(`${baseCls}-send-tools`, hashId)}
              >
                {props.toolsRender({
                  value,
                  fileMap,
                  onFileMapChange: setFileMap,
                  ...props,
                  isHover,
                  isLoading,
                  fileUploadStatus: fileUploadDone ? 'done' : 'uploading',
                })}
              </div>
              {sendActionsNode}
            </div>
          ) : (
            sendActionsNode
          )}
        </div>
      </Suggestion>
    </>,
  );
};

MarkdownInputFieldComponent.displayName = 'MarkdownInputField';

// 使用 React.memo 优化性能，避免不必要的重新渲染
export const MarkdownInputField = memo(MarkdownInputFieldComponent);
