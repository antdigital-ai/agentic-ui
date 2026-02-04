import { ExportOutlined } from '@ant-design/icons';
import { ConfigProvider, Popover, Tooltip, Typography } from 'antd';
import classNames from 'classnames';
import React, { useContext, useMemo } from 'react';
import { ActionIconBox } from '../../Components/ActionIconBox';
import { I18nContext } from '../../I18n';
import { MarkdownEditor, useRefFunction } from '../../index';
import { Chunk, WhiteBoxProcessInterface } from '../../ThoughtChainList/types';
import { BubbleConfigContext } from '../BubbleConfigProvide';
import { BubbleProps, MessageBubbleData } from '../type';
import { BubbleExtra } from './BubbleExtra';
import { DocInfoList } from './DocInfo';
import { EXCEPTION } from './EXCEPTION';
import { MarkdownPreview } from './MarkdownPreview';
import { useMessagesContentStyle } from './style';

export const LOADING_FLAT = '...';

/**
 * BubbleMessageDisplay 组件 - 聊天气泡消息显示组件
 *
 * 该组件负责渲染聊天气泡中的消息内容，支持多种内容类型的显示，
 * 包括Markdown、异常消息、加载状态等。提供完整的交互功能。
 *
 * @component
 * @description 聊天气泡消息显示组件，处理各种消息内容的渲染
 * @param {BubbleProps & {content: MessageBubbleData['content'], bubbleListItemExtraStyle?: React.CSSProperties}} props - 组件属性
 * @param {string} props.content - 消息内容
 * @param {React.CSSProperties} [props.bubbleListItemExtraStyle] - 额外样式
 * @param {MutableRefObject} [props.bubbleRef] - 气泡引用
 * @param {boolean} [props.readonly] - 是否只读模式
 * @param {BubbleRenderConfig} [props.bubbleRenderConfig] - 渲染配置
 * @param {BubbleMetaData} [props.avatar] - 头像元数据
 *
 * @example
 * ```tsx
 * <BubbleMessageDisplay
 *   content="这是一条消息内容"
 *   readonly={false}
 *   bubbleRef={bubbleRef}
 * />
 * ```
 *
 * @returns {React.ReactElement} 渲染的消息显示组件
 *
 * @remarks
 * - 组件会自动处理 Markdown 内容的渲染
 * - 支持异常消息的特殊展示
 * - 提供完整的交互操作（点赞、点踩、复制等）
 * - 可以通过 extraRender 完全自定义额外操作区域
 *
 * @see {@link BubbleProps} 了解更多关于聊天项属性的信息
 * @see {@link BaseChatProps} 了解更多关于基础聊天属性的信息
 */
export const BubbleMessageDisplay: React.FC<
  BubbleProps & {
    content: MessageBubbleData['content'];
    bubbleListItemExtraStyle?: React.CSSProperties;
    contentAfterDom?: React.ReactNode;
  }
> = ({ content, bubbleRef, readonly, contentAfterDom, ...props }) => {
  /**
   * 获取聊天配置上下文
   * @type {ChatConfigContext}
   */
  const context = useContext(BubbleConfigContext);
  const { locale } = useContext(I18nContext);

  const [isExtraNull, setIsExtraNull] = React.useState(false);

  const [nodeList, setNodeList] = React.useState<
    {
      id: any;
      placeholder: any;
      origin_text: any;
      url: any;
      origin_url: any;
    }[]
  >([]);
  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const chatCls = getPrefixCls('agentic-ui');
  const baseChatCls = `${chatCls}-display`;
  const { hashId, wrapSSR } = useMessagesContentStyle(baseChatCls);

  const funRender = useRefFunction((props: { identifier?: any }) => {
    const node = nodeList.find((item) => item.placeholder === props.identifier);
    return node;
  });

  const typing = useMemo(() => {
    return (
      props.originData?.isAborted !== true &&
      props.originData?.isFinished === false &&
      props?.originData?.extra?.isHistory === undefined &&
      props.originData?.isFinished !== undefined
    );
  }, [
    props.originData?.isAborted,
    props.originData?.isFinished,
    props.originData?.extra?.isHistory,
  ]);

  // 处理 beforeContent 和 afterContent
  const beforeContent = useMemo(() => {
    return props.bubbleRenderConfig?.beforeMessageRender
      ? props.bubbleRenderConfig.beforeMessageRender(props, null)
      : null;
  }, [
    props.bubbleRenderConfig?.beforeMessageRender,
    typing,
    props.originData,
    props.originData?.isLast,
  ]);

  const afterContent = useMemo(() => {
    const userAfter = props.bubbleRenderConfig?.afterMessageRender
      ? props.bubbleRenderConfig.afterMessageRender(props, contentAfterDom)
      : contentAfterDom;
    return <>{userAfter}</>;
  }, [
    props.bubbleRenderConfig?.afterMessageRender,
    typing,
    props.originData,
    props.originData?.isLast,
    contentAfterDom,
  ]);

  const memo = useMemo(() => {
    if (
      content === LOADING_FLAT ||
      (!props.originData?.isFinished && !content)
    ) {
      if (context?.thoughtChain?.alwaysRender !== true) {
        return wrapSSR(
          <div
            className={classNames(
              'agent-item-default-content',
              `${baseChatCls}-messages-content-loading`,
              context?.compact
                ? `${baseChatCls}-messages-content-loading-compact`
                : `${baseChatCls}-messages-content-loading-default`,
              hashId,
            )}
            data-testid="message-content"
          >
            {locale?.['chat.message.thinking'] || '思考中...'}
          </div>,
        );
      }
      return null;
    }

    const defaultExtra =
      props?.bubbleRenderConfig?.extraRender === false ? null : (
        <BubbleExtra
          placement={props.placement}
          style={props.bubbleListItemExtraStyle}
          readonly={readonly}
          rightRender={props?.bubbleRenderConfig?.extraRightRender}
          onReply={props.onReply}
          onCancelLike={props.onCancelLike}
          onLikeCancel={props.onLikeCancel}
          shouldShowCopy={props.shouldShowCopy}
          useSpeech={props.useSpeech}
          shouldShowVoice={props.shouldShowVoice}
          onDisLike={
            props.onDisLike
              ? async () => {
                  try {
                    await props.onDisLike?.(props.originData as any);
                    bubbleRef?.current?.setMessageItem?.(props.id!, {
                      feedback: 'thumbsDown',
                    } as any);
                  } catch (error) {}
                }
              : undefined
          }
          onDislike={
            props.onDislike
              ? async () => {
                  try {
                    await props.onDislike?.(props.originData as any);
                    bubbleRef?.current?.setMessageItem?.(props.id!, {
                      feedback: 'thumbsDown',
                    } as any);
                  } catch (error) {}
                }
              : undefined
          }
          bubble={props as any}
          onRenderExtraNull={(isNull) => setIsExtraNull(isNull)}
          onLike={
            props.onLike
              ? async () => {
                  try {
                    await props.onLike?.(props.originData as any);
                    bubbleRef?.current?.setMessageItem?.(props.id!, {
                      feedback: 'thumbsUp',
                    } as any);
                  } catch (error) {}
                }
              : undefined
          }
        />
      );

    const extra =
      props?.bubbleRenderConfig?.extraRender !== false &&
      props?.bubbleRenderConfig?.extraRender
        ? props?.bubbleRenderConfig?.extraRender?.(
            props as BubbleProps,
            defaultExtra,
          )
        : defaultExtra;

    if (
      content === '...' ||
      React.isValidElement(content) ||
      props.placement !== 'left' ||
      props?.originData?.extra?.tags?.includes?.('REJECT_TO_ANSWER') ||
      props.originData?.role === 'bot'
    ) {
      return wrapSSR(
        <div
          className={classNames(
            'agent-item-default-content',
            `${baseChatCls}-messages-content-message`,
            hashId,
          )}
          data-testid="message-box-content"
          onDoubleClick={props.onDoubleClick}
        >
          <MarkdownPreview
            beforeContent={beforeContent}
            afterContent={afterContent}
            placement={props.placement}
            markdownRenderConfig={props.markdownRenderConfig}
            isFinished={true}
            style={
              props.originData?.role === 'bot' ? {} : { color: '#343A45' } // 使用类名方式需要传递className，这里保留style以兼容现有API
            }
            extra={extra}
            typing={false}
            originData={props.originData}
            content={props.originData?.content as string}
          />
        </div>,
      );
    }
    // answerStatus= 'EXCEPTION'时 一定是异常情况
    if (
      props.originData?.extra?.answerStatus === 'EXCEPTION' ||
      (props.originData?.extra?.answerStatus && !props.originData?.content)
    ) {
      return wrapSSR(
        <EXCEPTION
          content={props.originData.content as string}
          originData={props.originData}
          extra={isExtraNull ? null : extra}
        />,
      );
    }

    const docInfoList = [props?.originData?.extra?.white_box_process].flat(
      1,
    ) as WhiteBoxProcessInterface[];
    let docInfoDom = null;

    if (
      Array.isArray(docInfoList) &&
      docInfoList.length > 0 &&
      docInfoList?.some((item) => (item?.output?.chunks?.length || 0) > 0) &&
      props.docListProps?.enable !== false
    ) {
      docInfoDom = (
        <DocInfoList
          options={
            docInfoList
              .map((item) => item.output?.chunks)
              .flat(1)
              .filter((item) => item) as Chunk[]
          }
          {...props.docListProps}
          reference_url_info_list={
            props.docListProps?.reference_url_info_list ||
            props.originData?.extra?.reference_url_info_list ||
            []
          }
        />
      );
    }

    return wrapSSR(
      <MarkdownPreview
        markdownRenderConfig={props.markdownRenderConfig}
        isFinished={props.originData?.isFinished}
        beforeContent={beforeContent}
        afterContent={afterContent}
        fncProps={{
          render: (mdProps, _) => {
            const reference_url_info_list =
              props.originData?.extra?.reference_url_info_list || [];
            const item =
              reference_url_info_list.find(
                (item: { placeholder: string; docId: string }) =>
                  item.placeholder === `[${mdProps.children}]` ||
                  item.placeholder === `[^${mdProps.children}]`,
              ) || funRender(mdProps as any);

            if (!item) return;
            if (!item?.origin_text) return null;
            return (
              <Popover
                title={
                  <div
                    className={classNames(
                      `${baseChatCls}-messages-content-popover-title`,
                      hashId,
                    )}
                    style={props?.customConfig?.PopoverProps?.titleStyle}
                  >
                    <div>
                      {locale?.['chat.message.referenceDocument'] || '参考文档'}
                    </div>
                    {item?.origin_url ? (
                      <ActionIconBox
                        title={
                          locale?.['chat.message.viewOriginal'] || '查看原文'
                        }
                        tooltipProps={props?.customConfig?.TooltipProps}
                        onClick={() => {
                          if (
                            props.markdownRenderConfig?.fncProps
                              ?.onOriginUrlClick
                          ) {
                            props.markdownRenderConfig?.fncProps?.onOriginUrlClick(
                              item.origin_url,
                            );
                            return;
                          }
                          window.open(item.origin_url);
                        }}
                      >
                        <ExportOutlined />
                      </ActionIconBox>
                    ) : null}
                  </div>
                }
                content={
                  <div
                    className={classNames(
                      `${baseChatCls}-messages-content-popover-content`,
                      hashId,
                    )}
                    style={props?.customConfig?.PopoverProps?.contentStyle}
                  >
                    <MarkdownEditor
                      style={{
                        padding: 0,
                        width: '100%',
                      }}
                      tableConfig={{
                        actions: {
                          fullScreen: 'modal',
                        },
                      }}
                      readonly
                      contentStyle={{
                        padding: 0,
                        width: '100%',
                      }}
                      initValue={item?.origin_text?.trim()}
                    />
                    {item?.docId && item.doc_name ? (
                      <Tooltip
                        mouseEnterDelay={0.3}
                        title={
                          <Typography.Text copyable={{ text: item.docId }}>
                            {item.docId}
                          </Typography.Text>
                        }
                      >
                        <div
                          className={classNames(
                            `${baseChatCls}-messages-content-doc-tag`,
                            hashId,
                          )}
                        >
                          <img
                            className={classNames(
                              `${baseChatCls}-messages-content-doc-tag-icon`,
                              hashId,
                            )}
                            src={
                              'https://mdn.alipayobjects.com/huamei_ptjqan/afts/img/A*kF_GTppRbp4AAAAAAAAAAAAADkN6AQ/original'
                            }
                          />
                          <div
                            className={classNames(
                              `${baseChatCls}-messages-content-doc-name`,
                              hashId,
                            )}
                          >
                            {item?.doc_name}
                          </div>
                        </div>
                      </Tooltip>
                    ) : null}
                  </div>
                }
              >
                {_}
              </Popover>
            );
          },
          onFootnoteDefinitionChange: (nodeList) => {
            setNodeList(nodeList);
          },
          ...(props.markdownRenderConfig?.fncProps || {}),
        }}
        typing={typing}
        placement={props.placement}
        docListNode={docInfoDom}
        extra={isExtraNull ? null : extra}
        htmlRef={props.bubbleListRef}
        content={
          props.originData?.isFinished
            ? (props.originData?.content as string) ||
              locale?.['chat.message.generateFailed'] ||
              '生成回答失败，请重试'
            : (props.originData?.content as string) || ''
        }
        originData={props.originData}
      />,
    );
  }, [
    content,
    props?.originData?.feedback,
    props.originData?.isFinished,
    props.originData?.isAborted,
    props.originData?.isLast,
    isExtraNull,
    props.deps,
    props.bubbleRenderConfig?.beforeMessageRender,
    props.bubbleRenderConfig?.afterMessageRender,
  ]);

  return memo;
};
