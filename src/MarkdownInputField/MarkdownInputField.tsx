import { ConfigProvider } from 'antd';
import classNames from 'clsx';
import React, { memo, useContext, useState } from 'react';
import { TextLoading } from '../Components/lotties/TextLoading';
import { useLocale } from '../I18n';
import { BaseMarkdownEditor } from '../MarkdownEditor';
import {
  DEFAULT_BORDER_RADIUS_PX,
  ENLARGED_DEFAULT_HEIGHT_PX,
  FALLBACK_BORDER_RADIUS_PX,
  ROOT_TAB_INDEX,
} from './constants';
import { useFileUploadManager } from './FileUploadManager';
import { useEditorValueSync } from './hooks/useEditorValueSync';
import { useEnlargeAndContainerHandler } from './hooks/useEnlargeAndContainerHandler';
import { useExposeInputRef } from './hooks/useExposeInputRef';
import { useInputFieldGeometry } from './hooks/useInputFieldGeometry';
import { useInputFieldRefContainer } from './hooks/useInputFieldRefContainer';
import { useKeyboardHandler } from './hooks/useKeyboardHandler';
import { useMarkdownInputFieldState } from './hooks/useMarkdownInputFieldState';
import { usePasteHandler } from './hooks/usePasteHandler';
import { useSendHandler } from './hooks/useSendHandler';
import { QuickActions } from './QuickActions';
import { SendActions } from './SendActions';
import { resolveSendDisabled } from './SendButton';
import { SkillModeBar } from './SkillModeBar';
import { useStyle } from './style';
import { Suggestion } from './Suggestion';
import { MARKDOWN_INPUT_FIELD_TEST_IDS } from './testIds';
import TopOperatingArea from './TopOperatingArea';
import type {
  ActionsSlotState,
  MarkdownInputFieldProps,
  SlotRenderState,
} from './types/MarkdownInputFieldProps';
import { useAttachmentList, useBeforeTools } from './utils/renderHelpers';
import { useVoiceInputManager } from './VoiceInputManager';

export type { ActionsSlotState, MarkdownInputFieldProps, SlotRenderState };

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
 * @param {boolean} [props.typing] - AI 回复中等场景下为 true，输入区只读并显示提示
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
const DEFAULT_ATTACHMENT = { enable: false } as const;

const MarkdownInputFieldComponent: React.FC<MarkdownInputFieldProps> = ({
  tagInputProps,
  markdownProps,
  borderRadius = DEFAULT_BORDER_RADIUS_PX,
  onBlur,
  onFocus,
  isShowTopOperatingArea = false,
  testId,
  ...props
}) => {
  const {
    contentStyle: markdownContentStyle,
    markdown: markdownConfig,
    ...markdownPropsRest
  } = markdownProps ?? {};

  // 默认关闭文件上传，需显式传入 attachment.enable: true 开启
  const attachment = { ...DEFAULT_ATTACHMENT, ...props.attachment };
  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const baseCls = getPrefixCls('agentic-md-input-field');
  const { hashId } = useStyle(baseCls, props.disableHoverAnimation);
  const locale = useLocale();

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
    attachment,
  });

  const [isFocused, setIsFocused] = useState(false);

  // 各类按钮存在性 & 计数：纯布尔运算，原 useMarkdownInputFieldActions hook
  // 已被内联到此处，避免为 5 行计算单开 hook + 在主组件做胶水。
  const hasEnlargeAction = !!props.enlargeable?.enable;
  const hasRefineAction = !!props.refinePrompt?.enable;
  const hasCustomQuickAction = !!props.quickActionRender;
  const hasActionsRender = !!props.actionsRender;
  const hasToolsRender = !!props.toolsRender;
  const totalActionCount =
    Number(hasEnlargeAction) +
    Number(hasRefineAction) +
    Number(hasCustomQuickAction) +
    Number(hasActionsRender) +
    Number(hasToolsRender);
  const isMultiRowLayout = totalActionCount > 0;

  // 几何信息：合并自原 useMarkdownInputFieldLayout + useMarkdownInputFieldStyles。
  // SendActions / QuickActions 的尺寸回调直接交回 hook 内部消化，
  // 主组件不再充当 setter 胶水。
  const {
    inputRef,
    collapseSendActions,
    onSendActionsResize,
    onQuickActionsResize,
    computedRightPadding,
    collapsedHeightPx,
    computedMinHeight,
    enlargedStyle,
  } = useInputFieldGeometry({
    isEnlarged,
    hasTools: hasToolsRender || hasActionsRender,
    hasEnlargeAction,
    hasRefineAction,
    totalActionCount,
    isMultiRowLayout,
    maxHeight: props.maxHeight,
    style: props.style,
    attachment,
  });

  // Refs 管理 — 拆分为三个单一职责 hook：
  // 1) 持有 ref 容器  2) 同步外部 value → 编辑器  3) 透出 inputRef 给调用方
  const { markdownEditorRef, quickActionsRef, actionsRef, isSendingRef } =
    useInputFieldRefContainer();

  const { onEditorChange } = useEditorValueSync({
    value: props.value,
    markdownEditorRef,
  });

  useExposeInputRef({
    inputRef: props.inputRef,
    markdownEditorRef,
    setValue,
  });

  // 文件上传管理
  const {
    fileUploadDone,
    fileUploadStatus,
    fileUploadSummary,
    supportedFormat,
    uploadImage,
    updateAttachmentFiles,
    handleFileRemoval,
    handleFileRetry,
  } = useFileUploadManager({
    attachment,
    fileMap,
    onFileMapChange: setFileMap,
  });

  // 语音输入管理
  const { recording, startRecording, stopRecording } = useVoiceInputManager({
    voiceRecognizer: props.voiceRecognizer,
    editorRef: markdownEditorRef,
    onValueChange: setValue,
  });

  // 事件处理（按职责拆分自原 useMarkdownInputFieldHandlers）
  // useKeyboardHandler 依赖 useSendHandler.sendMessage，必须串行调用
  const { sendMessage } = useSendHandler({
    props: {
      disabled: props.disabled,
      typing: props.typing,
      onChange: props.onChange,
      onSend: props.onSend,
      allowEmptySubmit: props.allowEmptySubmit,
    },
    sendDisabled: resolveSendDisabled(props.sendButtonProps, fileUploadStatus),
    markdownEditorRef,
    isSendingRef,
    isLoading,
    setIsLoading,
    value,
    setValue,
    setFileMap,
    recording,
    stopRecording,
  });

  const { handlePaste } = usePasteHandler({
    props: { attachment, markdownProps },
    fileMap,
    setFileMap,
  });

  const { handleKeyDown } = useKeyboardHandler({
    props: { triggerSendKey: props.triggerSendKey, onSend: props.onSend },
    markdownEditorRef,
    sendMessage,
  });

  const { handleEnlargeClick, handleContainerClick, activeInput } =
    useEnlargeAndContainerHandler({
      props: { disabled: props.disabled, typing: props.typing },
      markdownEditorRef,
      inputRef,
      isEnlarged,
      setIsEnlarged,
    });

  // 渲染辅助
  const attachmentList = useAttachmentList({
    attachment,
    fileMap,
    handleFileRemoval,
    handleFileRetry,
    updateAttachmentFiles,
  });

  const beforeTools = useBeforeTools({
    beforeToolsRender: props.beforeToolsRender,
    attachment,
    value,
    fileMap,
    onFileMapChange: setFileMap,
    fileUploadStatus,
    fileUploadSummary,
    disabled: props.disabled,
    typing: props.typing,
    isHover,
    isLoading,
  });

  const editorReadonly = isLoading || !!props.typing;

  // SendActions 节点。原本封装在 useSendActionsNode 中，但其 useMemo
  // 依赖列表包含 27 项（含 attachment / sendProps 等每次渲染都会变的引用），
  // 缓存命中率几乎为零，因此直接内联到 JSX 渲染，去除虚假的"性能优化"。
  const sendActionsNode = (
    <SendActions
      attachment={{
        ...attachment,
        supportedFormat,
        fileMap,
        onFileMapChange: setFileMap,
        upload: attachment?.upload
          ? (file) => attachment.upload!(file, 0)
          : undefined,
      }}
      voiceRecognizer={props.voiceRecognizer}
      value={value}
      disabled={props.disabled}
      typing={props.typing}
      isLoading={isLoading}
      fileUploadDone={fileUploadDone}
      fileUploadStatus={fileUploadStatus}
      fileUploadSummary={fileUploadSummary}
      recording={recording}
      collapseSendActions={collapseSendActions}
      allowEmptySubmit={props.allowEmptySubmit}
      uploadImage={uploadImage}
      onStartRecording={startRecording}
      onStopRecording={stopRecording}
      onSend={sendMessage}
      onStop={() => {
        setIsLoading(false);
        props.onStop?.();
      }}
      actionsRender={props.actionsRender}
      prefixCls={baseCls}
      hashId={hashId}
      hasTools={!!props.toolsRender}
      onResize={onSendActionsResize}
      sendButtonProps={props.sendButtonProps}
      triggerSendKey={props.triggerSendKey}
    />
  );

  return (
    <>
      {isShowTopOperatingArea && (
        <div
          className={classNames(`${baseCls}-top-area`, hashId)}
          data-testid={MARKDOWN_INPUT_FIELD_TEST_IDS.TOP_AREA}
        >
          <TopOperatingArea
            targetRef={props.targetRef}
            operationBtnRender={props.operationBtnRender}
            isShowBackTo={props.isShowBackTo}
          />
        </div>
      )}
      {beforeTools ? (
        <div
          className={classNames(`${baseCls}-before-tools`, hashId)}
          data-testid={MARKDOWN_INPUT_FIELD_TEST_IDS.BEFORE_TOOLS}
        >
          {beforeTools}
        </div>
      ) : null}
      <div
        ref={inputRef}
        data-testid={testId ?? MARKDOWN_INPUT_FIELD_TEST_IDS.ROOT}
        className={classNames(baseCls, hashId, props.className, {
          [`${baseCls}-disabled`]: props.disabled,
          [`${baseCls}-skill-mode`]: props.skillMode?.open,
          [`${baseCls}-typing`]: !!props.typing,
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
            ? `${props.enlargeable?.height ?? ENLARGED_DEFAULT_HEIGHT_PX}px`
            : `min(${collapsedHeightPx}px,100%)`,
          borderRadius: borderRadius || FALLBACK_BORDER_RADIUS_PX,
          minHeight: computedMinHeight,
          maxHeight: isEnlarged
            ? 'none'
            : props.maxHeight !== undefined
              ? typeof props.maxHeight === 'number'
                ? `${props.maxHeight}px`
                : props.maxHeight
              : `min(${collapsedHeightPx}px,100%)`,
        }}
        tabIndex={ROOT_TAB_INDEX}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onClick={handleContainerClick}
        onKeyDown={handleKeyDown}
      >
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
          data-testid={MARKDOWN_INPUT_FIELD_TEST_IDS.EDITOR}
        >
          {/* 技能模式部分 */}
          <SkillModeBar
            skillMode={props.skillMode}
            onSkillModeOpenChange={props.onSkillModeOpenChange}
          />

          <div
            className={classNames(`${baseCls}-editor-content`, hashId)}
            data-testid={MARKDOWN_INPUT_FIELD_TEST_IDS.EDITOR_CONTENT}
          >
            {attachmentList}

            {(props.typing || isLoading) && !value && (
              <div
                className={classNames(`${baseCls}-typing-hint`, hashId)}
                aria-live="polite"
                aria-label={locale['input.typing.hint']}
              >
                <TextLoading text={locale['input.typing.hint']} fontSize={13} />
              </div>
            )}

            <Suggestion
              tagInputProps={{
                enable: true,
                type: 'dropdown',
                ...tagInputProps,
              }}
            >
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
                readonly={editorReadonly}
                contentStyle={{
                  alignItems: 'flex-start',
                  padding: 'var(--padding-3x)',
                  paddingRight: computedRightPadding || 'var(--padding-3x)',
                  ...markdownContentStyle,
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
                      onEditorChange(truncatedValue);
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
                  // Record the value the editor just produced so the external
                  // props.value sync effect skips the redundant setMDContent call
                  // that would disrupt the live Slate selection while typing.
                  onEditorChange(value);
                  setValue(value);
                  props.onChange?.(value);
                }}
                onFocus={(value, schema, e) => {
                  onFocus?.(value, schema, e);
                  activeInput(true);
                  setIsFocused(true);
                }}
                onBlur={(value, schema, e) => {
                  onBlur?.(value, schema, e);
                  activeInput(false);
                  setIsFocused(false);
                }}
                onPaste={(e) => {
                  handlePaste(e);
                }}
                titlePlaceholderContent={props.placeholder}
                toc={false}
                pasteConfig={{
                  allowedTypes: ['text/plain'],
                  plainTextOnly: true,
                  ...props.pasteConfig,
                }}
                markdown={{
                  enableInsertCompletion: false,
                  ...markdownConfig,
                }}
                {...markdownPropsRest}
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
                    disabled={props.disabled || !!props.typing}
                    fileUploadStatus={fileUploadStatus}
                    refinePrompt={props.refinePrompt}
                    editorRef={markdownEditorRef}
                    onValueChange={(text) => {
                      setValue(text);
                      props.onChange?.(text);
                    }}
                    quickActionRender={props.quickActionRender}
                    prefixCls={baseCls}
                    hashId={hashId}
                    enlargeable={!!props.enlargeable?.enable}
                    isEnlarged={isEnlarged}
                    onEnlargeClick={handleEnlargeClick}
                    onResize={onQuickActionsResize}
                  />
                ) : null}
              </BaseMarkdownEditor>
            </Suggestion>
          </div>
        </div>
        {props.toolsRender || props.actionsRender ? (
          <div
            className={classNames(`${baseCls}-tools-wrapper`, hashId)}
            data-testid={MARKDOWN_INPUT_FIELD_TEST_IDS.TOOLS_WRAPPER}
          >
            <div
              ref={actionsRef}
              contentEditable={false}
              className={classNames(`${baseCls}-send-tools`, hashId)}
              data-testid={MARKDOWN_INPUT_FIELD_TEST_IDS.SEND_TOOLS}
            >
              {props?.toolsRender?.({
                value,
                fileMap,
                onFileMapChange: setFileMap,
                attachment,
                disabled: props.disabled,
                typing: props.typing,
                isHover,
                isLoading,
                fileUploadStatus,
                fileUploadSummary,
              })}
            </div>
            {sendActionsNode}
          </div>
        ) : (
          sendActionsNode
        )}
      </div>
    </>
  );
};

MarkdownInputFieldComponent.displayName = 'MarkdownInputField';

// 使用 React.memo 优化性能，避免不必要的重新渲染
export const MarkdownInputField = memo(MarkdownInputFieldComponent);
