import { CloseCircleFilled } from '@ant-design/icons';
import {
  ChevronsDownUp,
  ChevronsUpDown,
  CircleCheckBig,
  Loader,
  Sparkles,
} from '@sofa-design/icons';
import { ConfigProvider, Descriptions, Drawer, Typography } from 'antd';
import classNames from 'classnames';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { motion } from 'framer-motion';
import { merge } from 'lodash-es';
import React, { useContext, useEffect, useMemo } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { ActionIconBox } from '../Components/ActionIconBox';
import { useAutoScroll } from '../Hooks/useAutoScroll';
import { I18nContext } from '../I18n';
import { MarkdownEditorProps } from '../MarkdownEditor/types';
import { DotLoading } from './DotAni';
import { FlipText } from './FlipText';
import { useStyle } from './style';
import { ThoughtChainListItem } from './ThoughtChainListItem';
import { TitleInfo } from './TitleInfo';
import {
  DocMeta,
  ThoughtChainListProps,
  WhiteBoxProcessInterface,
} from './types';

// Initialize dayjs plugins
try {
  dayjs.extend(duration);
} catch (error) {
  console.warn('Failed to extend dayjs with duration plugin:', error);
}

export type {
  Chunk,
  DocMeta,
  ThoughtChainListProps,
  WhiteBoxProcessInterface,
} from './types';

// 思维链标题组件 - 独立 memo
const ThoughtChainTitle = React.memo<{
  prefixCls: string;
  hashId: string;
  collapse: boolean;
  compact?: boolean;
  endStatusDisplay: React.ReactNode;
  onCollapseToggle: () => void;
  locale: any;
  titleRender?: (defaultDom: React.ReactNode) => React.ReactNode;
  titleExtraRender?: (defaultDom: React.ReactNode) => React.ReactNode;
}>(
  ({
    prefixCls,
    hashId,
    collapse,
    compact,
    endStatusDisplay,
    onCollapseToggle,
    locale,
    ...props
  }) => {
    const extra = (
      <ActionIconBox
        title={collapse ? locale?.expand || '展开' : locale?.collapse || '收起'}
        onClick={onCollapseToggle}
      >
        {!collapse ? <ChevronsDownUp /> : <ChevronsUpDown />}
      </ActionIconBox>
    );

    const dom = (
      <motion.div
        className={classNames(`${prefixCls}-title`, hashId, {
          [`${prefixCls}-title-collapse`]: collapse,
          [`${prefixCls}-title-compact`]: compact,
        })}
      >
        <div className={classNames(`${prefixCls}-title-content`, hashId)}>
          <Sparkles
            data-testid="magic-icon"
            style={{
              width: 15,
              height: 15,
              color: '#0CE0AD',
            }}
          />
          <span
            className={classNames(`${prefixCls}-title-progress`, hashId)}
            style={{
              fontSize: '1em',
            }}
          >
            {endStatusDisplay}
          </span>
        </div>
        <span className={classNames(`${prefixCls}-title-extra`, hashId)}>
          {props.titleExtraRender ? props.titleExtraRender(extra) : extra}
        </span>
      </motion.div>
    );
    if (props.titleRender) {
      return props.titleRender(dom);
    }
    return dom;
  },
);

// 文档预览抽屉组件 - 独立 memo
const DocumentDrawer = React.memo<{
  docMeta: Partial<DocMeta> | null;
  onClose: () => void;
  locale: any;
}>(({ docMeta, onClose, locale }) => {
  return (
    <Drawer
      title={locale?.preview + ' ' + docMeta?.doc_name}
      open={!!docMeta}
      onClose={onClose}
      width={'40vw'}
    >
      <Descriptions
        column={1}
        items={
          [
            {
              label: locale?.['common.name'] || '名称',
              span: 1,
              children: docMeta?.doc_name || docMeta?.answer,
            },
            {
              label: locale?.['common.updateTime'] || '更新时间',
              span: 1,
              children: dayjs(docMeta?.upload_time).format(
                'YYYY-MM-DD HH:mm:ss',
              ),
            },
            {
              label: locale?.['common.type'] || '类型',
              span: 1,
              children: docMeta?.type,
            },
            docMeta?.origin_text
              ? {
                  label: locale?.['common.content'] || '内容',
                  span: 1,
                  children: docMeta?.origin_text,
                }
              : null,
          ].filter(Boolean) as any[]
        }
      />
    </Drawer>
  );
});

// 思维链列表内容组件 - 独立 memo
const ThoughtChainContent = React.memo<
  {
    prefixCls: string;
    hashId: string;
    collapse: boolean;
    compact?: boolean;
    thoughtChainList: WhiteBoxProcessInterface[];
    bubble?: {
      isFinished?: boolean;
      endTime?: number;
      createAt?: number;
      isAborted?: boolean;
    };
    loading?: boolean;
    markdownRenderProps?: MarkdownEditorProps;
    onDocMetaClick: (docMeta: DocMeta) => void;
    instanceId: string;
  } & ThoughtChainListProps['thoughtChainItemRender']
>(
  ({
    prefixCls,
    hashId,
    collapse,
    compact,
    thoughtChainList,
    bubble,
    loading,
    markdownRenderProps,
    onDocMetaClick,
    instanceId,
    ...props
  }) => {
    const { containerRef } = useAutoScroll({
      SCROLL_TOLERANCE: 30,
    });

    const processedItems = useMemo(() => {
      if (collapse) return [];

      return thoughtChainList.map((item, index) => {
        let info = item.info;
        let icon = <Loader />;
        let isFinished = false;

        if (
          (item.output || bubble?.isFinished) &&
          item.output?.type !== 'TOKEN' &&
          item.output?.type !== 'RUNNING'
        ) {
          isFinished = true;
          icon = <CircleCheckBig />;
        }

        if (item.output?.errorMsg) {
          icon = (
            <CloseCircleFilled
              style={{
                color: 'red',
              }}
            />
          );
        }

        return {
          key: index.toString(),
          ...item,
          info,
          isFinished,
          status:
            !item.output ||
            item.output?.type === 'RUNNING' ||
            item.output?.type === 'TOKEN'
              ? 'loading'
              : 'success',
          icon: icon,
        } as WhiteBoxProcessInterface & {
          icon: React.ReactNode;
          isFinished?: boolean;
        };
      });
    }, [thoughtChainList, bubble?.isFinished, collapse]);

    return (
      <motion.div
        className={classNames(
          `${prefixCls}-content`,
          {
            [`${prefixCls}-content-collapse`]: collapse,
            [`${prefixCls}-content-compact`]: compact,
          },
          hashId,
        )}
        ref={containerRef}
      >
        <motion.div
          role="list"
          className={classNames(`${prefixCls}-content-list`, hashId)}
          variants={{
            hidden: {
              opacity: 0,
              transition: {
                when: 'afterChildren',
              },
            },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.3,
                when: 'beforeChildren',
              },
            },
          }}
          whileInView="visible"
          initial="hidden"
          animate="visible"
        >
          {processedItems.map((item, index) => {
            const info = item.info?.split(/(\$\{\w+\})/);
            if (!info) return null;

            return (
              <ErrorBoundary
                fallback={
                  <Typography.Paragraph code>
                    <pre>
                      <code>
                        {JSON.stringify(
                          thoughtChainList.at(index) || {
                            message: 'error',
                          },
                          null,
                          2,
                        )}
                      </code>
                    </pre>
                  </Typography.Paragraph>
                }
                key={`${instanceId}-${item.runId || 'no-runid'}-${index}`}
              >
                <ThoughtChainListItem
                  index={index}
                  markdownRenderProps={merge(markdownRenderProps, {
                    codeProps: {
                      showLineNumbers: false,
                      showGutter: false,
                      fontSize: 12,
                    },
                  })}
                  bubble={bubble}
                  thoughtChainListItem={item}
                  hashId={hashId}
                  isFinished={
                    item.isFinished || (!loading && !!bubble?.endTime)
                  }
                  setDocMeta={onDocMetaClick}
                  prefixCls={prefixCls}
                  titleRender={props.titleRender}
                  titleExtraRender={props.titleExtraRender}
                  contentRender={props.contentRender}
                />
              </ErrorBoundary>
            );
          })}
        </motion.div>
      </motion.div>
    );
  },
);

/**
 * ThoughtChainList 组件 - 思维链列表组件
 *
 * 该组件用于显示AI的思维链过程，包括思考步骤、工具调用、任务执行等。
 * 提供完整的思维链可视化功能，支持折叠/展开、状态显示、文档元数据等。
 *
 * @component
 * @description 思维链列表组件，显示AI思维过程
 * @param {ThoughtChainListProps} props - 组件属性
 * @param {WhiteBoxProcessInterface[]} props.thoughtChainList - 思维链列表数据
 * @param {boolean} [props.loading] - 是否显示加载状态
 * @param {BubbleProps} [props.bubble] - 气泡数据
 * @param {React.CSSProperties} [props.style] - 自定义样式
 * @param {boolean} [props.compact] - 是否使用紧凑模式
 * @param {MarkdownRenderConfig} [props.markdownRenderProps] - Markdown渲染配置
 * @param {boolean} [props.finishAutoCollapse=true] - 完成后是否自动折叠
 * @param {(meta: DocMeta | null) => void} [props.onDocMetaClick] - 文档元数据点击回调
 * @param {string} [props.className] - 自定义CSS类名
 * @param {Function} [props.titleRender] - 标题渲染函数
 * @param {Function} [props.extraRender] - 额外内容渲染函数
 *
 * @example
 * ```tsx
 * <ThoughtChainList
 *   thoughtChainList={chainData}
 *   bubble={currentBubble}
 *   loading={isLoading}
 *   style={{ marginBottom: 16 }}
 *   finishAutoCollapse={true}
 *   onDocMetaClick={(meta) => console.log('文档元数据:', meta)}
 * />
 * ```
 *
 * @returns {React.ReactElement} 渲染的思维链列表组件
 *
 * @remarks
 * - 显示AI思维链过程
 * - 支持思维链折叠/展开
 * - 提供状态显示（思考中、完成、中止等）
 * - 支持文档元数据显示
 * - 提供时间统计
 * - 支持自定义渲染
 * - 提供动画效果
 * - 支持国际化
 */
export const ThoughtChainList: React.FC<ThoughtChainListProps> = React.memo(
  (props) => {
    const { locale } = useContext(I18nContext);
    const {
      thoughtChainList,
      loading,
      //@ts-ignore
      bubble = props.chatItem,
      style: customStyle,
      compact,
      markdownRenderProps,
      finishAutoCollapse = true,
      onDocMetaClick,
    } = props;
    const context = useContext(ConfigProvider.ConfigContext);
    const [collapse, setCollapse] = React.useState<boolean>(false);
    const prefixCls = context?.getPrefixCls('thought-chain-list');
    const { wrapSSR, hashId } = useStyle(prefixCls);
    const { ...restStyle } = customStyle || {};
    const [docMeta, setDocMeta] = React.useState<Partial<DocMeta> | null>(null);

    // 为组件实例生成唯一ID，避免多个实例间的key冲突
    const instanceId = 'ThoughtChainList';

    useEffect(() => {
      if (bubble?.isFinished && finishAutoCollapse !== false) {
        setCollapse(true);
      }
    }, [bubble?.isFinished, finishAutoCollapse]);

    // memo 化的回调函数
    const handleCollapseToggle = React.useCallback(() => {
      setCollapse(!collapse);
    }, [collapse]);

    const handleDocMetaClose = React.useCallback(() => {
      setDocMeta(null);
      onDocMetaClick?.(null);
    }, [onDocMetaClick]);

    const handleDocMetaClick = React.useCallback(
      (meta: DocMeta) => {
        setDocMeta(meta);
        onDocMetaClick?.(meta);
      },
      [onDocMetaClick],
    );

    const endStatusDisplay = useMemo(() => {
      const time = ((bubble?.endTime || 0) - (bubble?.createAt || 0)) / 1000;

      if (!loading && bubble?.isAborted) {
        if (time > 0) {
          return `${locale?.taskAborted}, ${locale?.totalTimeUsed} ${time.toFixed(2)}s`;
        }
        return locale?.taskAborted;
      }

      if (!loading && bubble?.isFinished) {
        if (time > 0) {
          if (bubble?.isFinished) {
            return `${locale?.taskComplete}, ${locale?.totalTimeUsed} ${time.toFixed(2)}s`;
          }
          return (
            <FlipText
              word={`${locale?.taskComplete}, ${locale?.totalTimeUsed} ${time.toFixed(2)}s`}
            />
          );
        }
        return <FlipText word={locale?.taskComplete} />;
      }

      // 正在运行中时，无论是否收起都显示运行状态
      return (
        <div>
          {thoughtChainList.at(-1) && collapse ? (
            <>
              <TitleInfo
                title={thoughtChainList.at(-1)?.info}
                costMillis={thoughtChainList.at(-1)?.costMillis}
                category={thoughtChainList.at(-1)?.category || ''}
                prefixCls={prefixCls}
                hashId={hashId}
                isFinished={false}
                collapse={true}
                meta={thoughtChainList.at(-1)?.meta?.data || {}}
              />
              {loading && <DotLoading />}
            </>
          ) : (
            <div>
              {locale?.thinking}
              <DotLoading />
            </div>
          )}
        </div>
      );
    }, [
      loading,
      collapse,
      thoughtChainList?.at?.(-1)?.category,
      bubble?.isFinished,
      bubble?.isAborted,
      bubble?.endTime,
      bubble?.createAt,
      locale,
    ]);

    return wrapSSR(
      <>
        <DocumentDrawer
          docMeta={docMeta}
          onClose={handleDocMetaClose}
          locale={locale}
        />

        <div className={classNames(`${prefixCls}`, hashId)} style={restStyle}>
          <motion.div
            transition={{ duration: 0.3 }}
            className={classNames(`${prefixCls}-container`, hashId, {
              [`${prefixCls}-container-loading`]: !bubble?.isFinished,
            })}
          >
            <ThoughtChainTitle
              prefixCls={prefixCls}
              hashId={hashId}
              collapse={collapse}
              compact={compact}
              endStatusDisplay={endStatusDisplay}
              onCollapseToggle={handleCollapseToggle}
              locale={locale}
              titleRender={
                props.titleRender
                  ? (defaultDom) => props.titleRender?.(props, defaultDom)
                  : undefined
              }
              titleExtraRender={
                props.titleExtraRender
                  ? (defaultDom) => props.titleExtraRender?.(props, defaultDom)
                  : undefined
              }
            />
            <div
              style={{
                backgroundColor: '#FFF',
                position: 'relative',
                borderRadius: '6px 12px 12px 12px',
                zIndex: 9,
              }}
            >
              <ThoughtChainContent
                prefixCls={prefixCls}
                hashId={hashId}
                collapse={collapse}
                compact={compact}
                thoughtChainList={thoughtChainList}
                bubble={bubble}
                loading={loading}
                markdownRenderProps={markdownRenderProps}
                onDocMetaClick={handleDocMetaClick}
                instanceId={instanceId}
                {...props.thoughtChainItemRender}
              />
            </div>
          </motion.div>
        </div>
      </>,
    );
  },
);
