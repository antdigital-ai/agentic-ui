import { CloseCircleFilled } from '@ant-design/icons';
import { Typography } from 'antd';
import React, { useContext, useMemo } from 'react';
import { WhiteBoxProcessInterface } from '.';
import { LoadingSpinnerIcon } from '../Components/icons/LoadingSpinnerIcon';
import { I18nContext } from '../I18n';
import { MarkdownEditorProps } from '../MarkdownEditor';
import { DotLoading } from './DotAni';
import { MarkdownEditorUpdate } from './MarkdownEditor';

/**
 * WebSearch 组件 - 网络搜索组件
 *
 * 该组件用于显示网络搜索过程，包括搜索状态、搜索结果、错误信息等。
 * 提供加载动画、打字机效果、错误处理等功能，展示网络搜索的完整过程。
 *
 * @component
 * @description 网络搜索组件，显示网络搜索过程和结果
 * @param {Object} props - 组件属性
 * @param {boolean} [props.isFinished] - 是否已完成
 * @param {Function} [props.onItemChange] - 项目变更回调（Item 子组件事件）
 * @param {MarkdownEditorProps} [props.markdownRenderProps] - Markdown渲染配置
 * @param {Object} [props.output] - 输出结果
 * @param {Object} [props.output.response] - 响应数据
 * @param {string} [props.output.errorMsg] - 错误消息
 * @param {string} props.info - 搜索信息
 * @param {string} props.category - 搜索类别
 *
 * @example
 * ```tsx
 * <WebSearch
 *   info="搜索最新信息"
 *   category="web_search"
 *   output={{ response: { content: "搜索结果..." } }}
 *   isFinished={true}
 * />
 * ```
 *
 * @returns {React.ReactElement} 渲染的网络搜索组件
 *
 * @remarks
 * - 显示网络搜索过程
 * - 提供加载动画
 * - 支持打字机效果
 * - 处理错误信息
 * - 支持Markdown渲染
 * - 提供状态指示
 * - 支持国际化
 * - 美观的UI设计
 */
export const WebSearch = (
  props: {
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
  const errorMsg =
    props.output?.errorMsg ||
    props.output?.response?.error ||
    props.output?.response?.errorMsg;
  const i18n = useContext(I18nContext);
  return useMemo(() => {
    return (
      <>
        <div
          style={{
            display: 'flex',
            gap: '10px',
            flexDirection: 'column',
          }}
        >
          {!props.output && !props?.isFinished ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                height: '38px',
                borderRadius: '12px',
                opacity: 1,
                wordBreak: 'break-all',
                wordWrap: 'break-word',
                flexDirection: 'row',
                padding: '8px',
                gap: '10px',
                alignSelf: 'stretch',
                background: '#FBFCFD',
                zIndex: 2,
              }}
            >
              <LoadingSpinnerIcon size={24} />
              {i18n?.locale?.networkQuerying}
              <DotLoading />
            </div>
          ) : null}
          {!errorMsg && props.output ? (
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                wordBreak: 'break-all',
                wordWrap: 'break-word',
                padding: '8px 12px',
                gap: '10px',
                alignSelf: 'stretch',
                background: '#FBFCFD',
                zIndex: 1,
                borderRadius: '12px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  gap: '10px',
                  borderRadius: '12px',
                  opacity: 1,
                  wordBreak: 'break-all',
                  wordWrap: 'break-word',
                  flexDirection: 'column',
                  alignSelf: 'stretch',
                }}
                className="code-view"
              >
                {props.output?.data ? (
                  <MarkdownEditorUpdate
                    {...props.markdownRenderProps}
                    isFinished={props.isFinished}
                    typewriter={
                      !props.output?.response?.error &&
                      !props.isFinished &&
                      props.output?.type === 'TOKEN'
                    }
                    initValue={props.output.data.replace(/^>/, '')}
                  />
                ) : (
                  <div
                    style={{
                      padding: '16px',
                      textAlign: 'center',
                      color: '#999',
                      fontSize: '14px',
                    }}
                  >
                    {i18n?.locale?.['webSearch.noResults'] || '无搜索结果'}
                  </div>
                )}
              </div>
            </div>
          ) : null}
          {errorMsg ? (
            <div
              style={{
                borderRadius: '12px',
                opacity: 1,
                display: 'flex',
                padding: '12px 12px',
                alignSelf: 'stretch',
                background: '#FFEDEC',
                wordBreak: 'break-all',
                minHeight: 18,
                wordWrap: 'break-word',
                zIndex: 2,
                backgroundColor: '#FFEDEC',
                border: '1px solid rgba(244, 244, 247, 0.7473)',
                gap: 8,
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}
              >
                <div>
                  <CloseCircleFilled
                    style={{
                      color: '#FF4141',
                      marginRight: 8,
                    }}
                  />
                  <Typography.Text>
                    {i18n?.locale?.['webSearch.searchFailed'] ||
                      i18n?.locale?.taskExecutionFailed ||
                      '搜索失败，需要修改'}
                  </Typography.Text>
                </div>
                <Typography
                  style={{
                    color: '#FF4141',
                    wordBreak: 'break-all',
                    wordWrap: 'break-word',
                  }}
                >
                  {JSON.stringify(errorMsg)}
                </Typography>
              </div>
            </div>
          ) : null}
        </div>
      </>
    );
  }, [props.category, JSON.stringify(props.output?.data), props.costMillis]);
};
