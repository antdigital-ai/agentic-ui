import { CloseCircleFilled, EditOutlined } from '@ant-design/icons';
import { Copy } from '@sofa-design/icons';
import { Button, Table, Typography } from 'antd';
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

/**
 * ToolCall 组件用于显示 SQL 查询的执行状态和结果。
 *
 * @param props - 组件的属性。
 * @param props.isFinished - 表示 SQL 查询是否已完成。
 * @param props.input - 包含 SQL 查询的输入数据。
 * @param props.output - 包含 SQL 查询的输出数据。
 * @param props.costMillis - SQL 查询执行的耗时。
 *
 * @returns 返回一个包含 SQL 查询状态和结果的 JSX 元素。
 *
 * 组件功能：
 * - 显示 SQL 查询语句，并提供复制功能。
 * - 在 SQL 查询执行中时，显示执行中的提示。
 * - 显示 SQL 查询结果，并提供复制功能。
 * - 如果 SQL 查询出错，显示错误信息，并提供复制功能。
 */
export const TableSql = (
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
  const { locale } = useContext(I18nContext);
  const [editor, setEditor] = React.useState<boolean>(false);
  const editorRef = React.useRef<MarkdownEditorInstance | undefined>(undefined);

  return useMemo(() => {
    if (editor) {
      return (
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
              {locale?.executeSQL}
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
                style={{
                  padding: 0,
                  width: '100%',
                }}
                {...props.markdownRenderProps}
                toc={false}
                editorRef={editorRef}
                contentStyle={{
                  padding: 0,
                  width: '100%',
                }}
                initValue={`\`\`\`sql\n${props.input?.sql?.trim()}\n\`\`\``.trim()}
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
                  `\`\`\`sql\n${props.input?.sql?.trim()}\n\`\`\``,
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
                const schema = editorRef?.current?.store.editor?.children;
                const value = parserSlateNodeToMarkdown(schema || [])
                  ?.replaceAll('```sql\n', '')
                  .replaceAll('\n```', '')
                  .replaceAll('<!--{}-->\n', '');
                // 优先使用新的事件名，保持向后兼容
                if (props.onItemChange) {
                  props.onItemChange(props, {
                    feedbackContent: value || '',
                    feedbackType: 'sql',
                    feedbackRunId: props.runId || '',
                  });
                } else if (props.onChangeItem) {
                  props.onChangeItem(props, {
                    feedbackContent: value || '',
                    feedbackType: 'sql',
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

    const sourceData = props.output?.tableData as any;
    const keys = Object.keys(sourceData || {});
    let fistKey = keys[0];

    const dataSource = (sourceData?.[fistKey] as any)?.map(
      (_: any, index: number) => {
        return keys?.reduce((prev, key) => {
          return {
            ...prev,
            [key]: sourceData[key][index],
          };
        }, {});
      },
    );

    const columns = ((props.output?.columns as any) ||
      Object.keys(dataSource?.at(0) || {})) as string[];

    const errorMsg = props.output?.errorMsg || props.output?.response?.errorMsg;

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
              {locale?.executeSQL}
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
                      copy(props.input?.sql || '');
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
                style={{
                  padding: 0,
                  width: '100%',
                }}
                {...props.markdownRenderProps}
                toc={false}
                readonly
                contentStyle={{
                  padding: 0,
                  width: '100%',
                }}
                initValue={`\`\`\`sql\n${props.input?.sql?.trim()}\n\`\`\``.trim()}
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
              {locale?.executing}
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
                {locale?.queryResults}
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
                          JSON.stringify(
                            props.output?.tableData || {},
                            null,
                            2,
                          ),
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
                <Table
                  style={{
                    width: '100%',
                  }}
                  size="small"
                  pagination={false}
                  rowKey={(row) => Object.values(row || {}).join('-')}
                  dataSource={dataSource}
                  columns={columns?.map((item) => ({
                    title: item,
                    dataIndex: item,
                    key: item,
                  }))}
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
                  {locale?.queryFailed}
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
    props.input?.sql,
    props.output,
    props.isFinished,
    props.costMillis,
  ]);
};
