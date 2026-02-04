import { CloseCircleFilled, EditOutlined } from '@ant-design/icons';
import { Copy } from '@sofa-design/icons';
import { Button, Typography } from 'antd';
import copy from 'copy-to-clipboard';
import React, { useContext, useMemo } from 'react';
import { WhiteBoxProcessInterface } from '.';
import { I18nContext } from '../I18n';
import { ActionIconBox } from '../index';
import {
  MarkdownEditor,
  MarkdownEditorInstance,
  MarkdownEditorProps,
  parserSlateNodeToMarkdown,
} from '../MarkdownEditor';
import { CostMillis } from './CostMillis';
import { DotLoading } from './DotAni';

/**
 * ToolCall 组件 - 工具调用组件
 *
 * 该组件用于显示AI工具调用的详细信息，包括输入参数、输出结果、错误信息等。
 * 支持编辑模式、反馈功能、状态显示等，提供完整的工具调用可视化。
 *
 * @component
 * @description 工具调用组件，显示AI工具调用的详细信息
 * @param {Object} props - 组件属性
 * @param {string} [props['data-testid']] - 测试ID
 * @param {boolean} [props.isFinished] - 是否已完成
 * @param {Function} [props.onItemChange] - 项目变更回调（Item 子组件事件）
 * @param {MarkdownEditorProps} [props.markdownRenderProps] - Markdown渲染配置
 * @param {Object} props.input - 输入参数
 * @param {Object} props.input.inputArgs - 输入参数对象
 * @param {Object} props.output - 输出结果
 * @param {Object} props.output.response - 响应数据
 * @param {string} [props.output.errorMsg] - 错误消息
 * @param {number} [props.costMillis] - 调用耗时（毫秒）
 * @param {string} props.info - 工具调用信息
 * @param {string} props.category - 工具类别
 *
 * @example
 * ```tsx
 * <ToolCall
 *   input={{ inputArgs: { query: "SELECT * FROM users" } }}
 *   output={{ response: { data: [] } }}
 *   info="执行SQL查询"
 *   category="sql"
 *   costMillis={150}
 *   isFinished={true}
 * />
 * ```
 *
 * @returns {React.ReactElement} 渲染的工具调用组件
 *
 * @remarks
 * - 显示工具调用输入和输出
 * - 支持编辑模式
 * - 提供错误信息显示
 * - 支持反馈功能
 * - 显示调用耗时
 * - 支持Markdown渲染
 * - 提供状态指示
 * - 支持自定义配置
 */
export const ToolCall = (
  props: {
    'data-testid'?: string;
    isFinished?: boolean;
    /**
     * Item 子组件变更事件
     * @deprecated 请使用 onItemChange 替代（符合命名规范）
     */
    onChangeItem?: (
      item: WhiteBoxProcessInterface,
      changeProps: {
        feedbackContent: string;
        feedbackType: 'sql' | 'toolArg';
        feedbackRunId: string;
      },
    ) => void;
    /** Item 子组件变更事件 */
    onItemChange?: (
      item: WhiteBoxProcessInterface,
      changeProps: {
        feedbackContent: string;
        feedbackType: 'sql' | 'toolArg';
        feedbackRunId: string;
      },
    ) => void;
    markdownRenderProps?: MarkdownEditorProps;
  } & WhiteBoxProcessInterface,
) => {
  const [editor, setEditor] = React.useState<boolean>(false);
  const editorRef = React.useRef<MarkdownEditorInstance | undefined>(undefined);
  const { locale } = useContext(I18nContext);

  const errorMsg =
    props.output?.errorMsg ||
    props.output?.response?.error ||
    props.output?.response?.errorMsg;

  return useMemo(() => {
    if (editor) {
      return (
        <div
          style={{
            display: 'flex',
            gap: '10px',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              padding: '8px 12px',
              gap: '10px',
              alignSelf: 'stretch',
              wordBreak: 'break-all',
              wordWrap: 'break-word',
              background: '#FBFCFD',
              zIndex: 1,
              borderRadius: '12px',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                gap: '10px',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              {locale?.executionParameters}
            </div>
            <div
              style={{
                display: 'flex',
                gap: '10px',
                borderRadius: '12px',
                opacity: 1,
                flexDirection: 'column',
                alignSelf: 'stretch',
              }}
              className="code-view"
            >
              <MarkdownEditor
                editorRef={editorRef}
                {...props.markdownRenderProps}
                style={{
                  padding: 0,
                  width: '100%',
                  background: '#FFF',
                }}
                toc={false}
                readonly={false}
                contentStyle={{
                  padding: 0,
                  width: '100%',
                }}
                initValue={`\`\`\`json\n${JSON.stringify(
                  props.input?.inputArgs || {},
                  null,
                  2,
                ).trim()}\n\`\`\``.trim()}
              />
            </div>
          </div>
          <div
            style={{
              gap: 12,
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'flex-end',
              width: '100%',
            }}
          >
            <Button
              style={{
                border: '1px solid #F0F2F5',
                background: '#FFFFFF',
                padding: '4px 24px',
                borderRadius: '12px 12px 12px 12px',
              }}
              onClick={() => {
                setEditor(false);
                editorRef.current?.store?.setMDContent(
                  `\`\`\`json\n${JSON.stringify(
                    props.input?.inputArgs || {},
                    null,
                    2,
                  ).trim()}\n\`\`\``.trim(),
                );
              }}
            >
              {locale?.cancel}
            </Button>
            <Button
              style={{
                border: '1px solid #F0F2F5',
                padding: '4px 24px',
                borderRadius: '12px 12px 12px 12px',
              }}
              type="primary"
              onClick={() => {
                setEditor(false);
                const schema = editorRef?.current?.store?.editor.children;
                const value = parserSlateNodeToMarkdown(schema || [])
                  ?.replaceAll('```json\n', '')
                  .replaceAll('\n```', '')
                  .replaceAll('<!--{}-->\n', '');
                // 优先使用新的事件名，保持向后兼容
                if (props.onItemChange) {
                  props.onItemChange(props, {
                    feedbackContent: value || '',
                    feedbackType: 'toolArg',
                    feedbackRunId: props.runId || '',
                  });
                } else if (props.onChangeItem) {
                  props.onChangeItem(props, {
                    feedbackContent: value || '',
                    feedbackType: 'toolArg',
                    feedbackRunId: props.runId || '',
                  });
                }
              }}
            >
              {locale?.retry}
            </Button>
          </div>
        </div>
      );
    }

    return (
      <>
        <div
          data-testid={props['data-testid']}
          style={{
            display: 'flex',
            gap: '10px',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              padding: '8px 12px',
              gap: '10px',
              alignSelf: 'stretch',
              wordBreak: 'break-all',
              wordWrap: 'break-word',
              background: '#FBFCFD',
              zIndex: 1,
              borderRadius: '12px',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                gap: '10px',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              {locale?.executionParameters}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  gap: '10px',
                  alignItems: 'center',
                }}
              >
                {props.costMillis ? (
                  <CostMillis costMillis={props.costMillis} />
                ) : null}
                <ActionIconBox
                  title={locale?.copy}
                  onClick={() => {
                    try {
                      copy(
                        JSON.stringify(props.input?.inputArgs || {}, null, 2),
                      );
                    } catch (error) {
                      console.error('复制失败:', error);
                    }
                  }}
                >
                  <Copy />
                </ActionIconBox>
                {props.onItemChange || props.onChangeItem ? (
                  <ActionIconBox
                    title={locale?.edit}
                    onClick={() => {
                      setEditor(true);
                    }}
                  >
                    <EditOutlined />
                  </ActionIconBox>
                ) : null}
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                borderRadius: '12px',
                alignSelf: 'stretch',
                background: '#FFFFFF',
              }}
              className="code-view"
            >
              <MarkdownEditor
                {...props.markdownRenderProps}
                style={{
                  padding: 0,
                  width: '100%',
                }}
                toc={false}
                readonly
                contentStyle={{
                  padding: 0,
                  width: '100%',
                }}
                initValue={`\`\`\`json\n${JSON.stringify(
                  props.input?.inputArgs || {},
                  null,
                  2,
                ).trim()}\n\`\`\``.trim()}
              />
            </div>
          </div>
          {!props.isFinished ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                gap: '10px',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px 12px',
                alignSelf: 'stretch',
                wordBreak: 'break-all',
                wordWrap: 'break-word',
                background: '#FBFCFD',
                zIndex: 1,
                borderRadius: '12px',
              }}
            >
              {locale?.apiCalling}
              <DotLoading />
            </div>
          ) : null}
          {props.isFinished && !errorMsg ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                padding: '8px 12px',
                alignSelf: 'stretch',
                wordBreak: 'break-all',
                wordWrap: 'break-word',
                background: '#FBFCFD',
                zIndex: 1,
                borderRadius: '12px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  gap: '10px',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                {locale?.executionResult}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: '10px',
                    alignItems: 'center',
                  }}
                >
                  <ActionIconBox
                    title={locale?.copy}
                    onClick={() => {
                      try {
                        copy(
                          JSON.stringify(props.output?.response || {}, null, 2),
                        );
                      } catch (error) {
                        console.error('复制失败:', error);
                      }
                    }}
                  >
                    <Copy />
                  </ActionIconBox>
                </div>
              </div>
              <div
                style={{
                  display: 'flex',
                  borderRadius: '12px',
                  alignSelf: 'stretch',
                  background: '#FFFFFF',
                }}
              >
                <MarkdownEditor
                  {...props.markdownRenderProps}
                  style={{
                    padding: 0,
                    width: '100%',
                  }}
                  toc={false}
                  readonly
                  contentStyle={{
                    padding: 0,
                    width: '100%',
                  }}
                  initValue={`\`\`\`json\n${JSON.stringify(
                    props.output?.response || {},
                    null,
                    2,
                  ).trim()}\n\`\`\``.trim()}
                />
              </div>
            </div>
          ) : null}
          {props.isFinished && errorMsg ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                padding: '8px 12px',
                alignSelf: 'stretch',
                wordBreak: 'break-all',
                wordWrap: 'break-word',
                background: '#FBFCFD',
                zIndex: 1,
                borderRadius: '12px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  gap: '10px',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: '10px',
                    alignItems: 'center',
                  }}
                >
                  <CloseCircleFilled style={{ color: '#ff4d4f' }} />
                  {locale?.taskExecutionFailed}
                </div>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: '10px',
                    alignItems: 'center',
                  }}
                >
                  <ActionIconBox
                    title={locale?.copy}
                    onClick={() => {
                      try {
                        copy(errorMsg);
                      } catch (error) {
                        console.error('复制失败:', error);
                      }
                    }}
                  >
                    <Copy />
                  </ActionIconBox>
                </div>
              </div>
              <div
                style={{
                  display: 'flex',
                  borderRadius: '12px',
                  alignSelf: 'stretch',
                  background: '#FFFFFF',
                }}
              >
                <Typography.Text type="danger">{errorMsg}</Typography.Text>
              </div>
            </div>
          ) : null}
        </div>
      </>
    );
  }, [
    editor,
    props.input?.inputArgs,
    props.output,
    props.isFinished,
    props.costMillis,
  ]);
};
