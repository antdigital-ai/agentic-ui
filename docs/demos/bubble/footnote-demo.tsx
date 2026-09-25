import {
  Bubble,
  BubbleProps,
  MessageBubbleData,
  useRefFunction,
  VisualList,
  VisualListItem,
} from '@ant-design/agentic-ui';
import { LinkOutlined } from '@ant-design/icons';
import { ArrowUpRight } from '@sofa-design/icons';
import { Popover } from 'antd';
import React, { useMemo } from 'react';

function isValidUrl(input: string) {
  try {
    new URL(input);
    return true;
  } catch (_) {
    return false;
  }
}

const FootnotePopverContent: React.FC<{
  href?: string;
  titleText: string;
  hostText: string;
  faviconLetter: string;
}> = ({ href, titleText, hostText, faviconLetter }) => {
  const [hovered, setHovered] = React.useState(false);
  const [arrowHovered, setArrowHovered] = React.useState(false);
  const isTitlePureLink = isValidUrl(titleText?.trim());
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 284,
        background: 'var(--color-gray-bg-card-white)',
        position: 'relative',
        padding: '8px 12px',
        cursor: 'pointer',
      }}
      onClick={() => {
        window.open(href, '_blank', 'noopener noreferrer');
      }}
    >
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          onMouseEnter={() => setArrowHovered(true)}
          onMouseLeave={() => setArrowHovered(false)}
          style={{
            position: 'absolute',
            right: 12,
            top: 12,
            width: 32,
            height: 32,
            fontSize: 16,
            borderRadius: 'var(--radius-control-base)',
            background: 'var(--color-gray-control-fill-secondary)',
            backdropFilter: 'blur(40px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: hovered ? 1 : 0,
            transition: 'opacity 120ms ease',
            ...(arrowHovered && {
              background: 'var(--color-gray-control-fill-secondary-hover)',
            }),
          }}
        >
          <ArrowUpRight style={{ color: 'var(--color-gray-text-secondary)' }} />
        </a>
      ) : null}
      <div
        style={{
          font: 'var(--font-text-body-base)',
          letterSpacing: 'var(--letter-spacing-body-base, normal)',
          fontSize: 13,
          color: 'var(--color-gray-text-default)',
          lineHeight: '20px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
        title={titleText}
      >
        {titleText}
      </div>
      <div
        style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}
      >
        <div
          style={{
            width: 16,
            height: 16,
            borderRadius: 'var(--radius-control-sm)',
            background: isTitlePureLink
              ? 'var(--color-primary-control-fill-primary)'
              : '#000',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            lineHeight: '20px',
          }}
        >
          {isTitlePureLink ? <LinkOutlined /> : faviconLetter}
        </div>
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            style={{
              color: 'var(--color-gray-text-light)',
              font: 'var(--font-text-paragraph-sm)',
              fontSize: 12,
              lineHeight: '20px',
            }}
          >
            {hostText}
          </a>
        ) : (
          <span
            style={{
              color: 'var(--color-gray-text-light)',
              font: 'var(--font-text-paragraph-sm)',
              fontSize: 12,
            }}
          >
            {hostText}
          </span>
        )}
      </div>
    </div>
  );
};

const message1 = `# 脚注（Footnote）示例

下面展示如何在对话中引用脚注：当你需要补充来源、解释术语或延迟给出细节时，可在正文中添加引用标记，如这里的“脚注定义”[^1]、框架官网[^2] 与 MDN 文档[^3]。脚注能保持叙述流畅，同时不打断阅读节奏。常见用法包括：给统计数据附上来源，给缩写提供扩展释义，或在回答末尾统一列出外部链接与说明。

要点：
- 在正文中使用 \`[^标识]\` 引用；
- 在文末用 \`[^标识]: 进行说明\`，可以是文本或链接；
- 多个脚注可重复引用，顺序自动编号。
- 可新增/删除/编辑/引用脚注。

*** Reference Notes ***

[^1]: 脚注用于承载补充信息与出处说明，避免正文冗长。
[^2]: [Ant Design 官网](https://ant.design)
[^3]: [](https://developer.mozilla.org/zh-CN/)
`;

const items: VisualListItem[] = [
  {
    title: 'afc163',
    src: 'https://avatars.githubusercontent.com/u/507615?s=40&v=4',
    href: 'https://github.com/afc163',
  },
  {
    title: 'li-jia-nan',
    src: 'https://avatars.githubusercontent.com/u/49217418?s=40&v=4',
    href: 'https://github.com/li-jia-nan',
  },
  {
    title: 'MadCcc',
    src: 'https://avatars.githubusercontent.com/u/27722486?s=40&v=4',
    href: 'https://github.com/MadCcc',
  },
  {
    title: 'zombieJ',
    src: 'https://avatars.githubusercontent.com/u/5378891?s=40&v=4',
    href: 'https://github.com/zombieJ',
  },
  {
    title: 'benjycui',
    src: 'https://avatars.githubusercontent.com/u/3580607?s=40&v=4',
    href: 'https://github.com/benjycui',
  },
  {
    title: 'ycjcl868',
    src: 'https://avatars.githubusercontent.com/u/13595509?s=40&v=4',
    href: 'https://github.com/ycjcl868',
  },
  {
    title: 'coding-ice',
    src: 'https://avatars.githubusercontent.com/u/49827327?s=40&v=4',
    href: 'https://github.com/coding-ice',
  },
  {
    title: 'yesmeck',
    src: 'https://avatars.githubusercontent.com/u/465125?s=40&v=4',
    href: 'https://github.com/yesmeck',
  },
  {
    title: 'xrkffgg',
    src: 'https://avatars.githubusercontent.com/u/29775873?s=40&v=4',
    href: 'https://github.com/xrkffgg',
  },
  {
    title: 'hengkx',
    src: 'https://avatars.githubusercontent.com/u/8358236?s=40&v=4',
    href: 'https://github.com/hengkx',
  },
];

export default () => {
  const [nodeList, setNodeList] = React.useState<
    {
      id: string;
      placeholder: string;
      origin_text: string;
      url: string;
      origin_url: string;
    }[]
  >([]);

  const renderRef = useRefFunction(
    (props: { identifier?: string }, _: React.ReactNode) => {
      const node = nodeList.find(
        (item) => item.placeholder === props.identifier,
      );
      if (!node) return _;
      const href = node?.url as string | undefined;
      let host = '';
      try {
        host = href ? new URL(href).hostname : '';
      } catch (e) {
        host = '';
      }
      const hostText = (host || '').replace(/^www\./, '') || '链接';
      const faviconLetter = hostText?.charAt(0)?.toUpperCase() || 'L';
      const titleText = (node?.origin_text as string) || hostText;
      return (
        <Popover
          styles={
            {
              body: {
                padding: 0,
                borderRadius: 'var(--radius-card-base)',
                boxShadow: 'var(--shadow-control-lg)',
                overflow: 'hidden',
              },
              content: {
                padding: 0,
                borderRadius: 'var(--radius-card-base)',
                boxShadow: 'var(--shadow-control-lg)',
                overflow: 'hidden',
              },
            } as any
          }
          arrow={false}
          content={
            <FootnotePopverContent
              href={href}
              titleText={titleText}
              hostText={hostText}
              faviconLetter={faviconLetter}
            />
          }
        >
          {_}
        </Popover>
      );
    },
  );

  const bubbleRef = React.useRef<any>();
  const conversation: MessageBubbleData[] = useMemo(
    () => [
      {
        id: 'a1',
        role: 'assistant',
        content: message1,
        createAt: Date.now() - 40_000,
        updateAt: Date.now() - 40_000,
        isFinished: true,
        meta: {
          avatar:
            'https://mdn.alipayobjects.com/huamei_re70wt/afts/img/A*ed7ZTbwtgIQAAAAAQOAAAAgAemuEAQ/original',
          title: 'AI Assistant',
          description: '智能助手 v2.1',
        },
        extra: {
          showRefs: true,
        },
      },
    ],
    [],
  );

  const afterMessageRender = (props: BubbleProps) => {
    const { originData } = props;
    if (!originData?.extra?.showRefs) return null;

    return (
      <div style={{ padding: 16 }}>
        <VisualList
          data={items}
          shape="circle"
          description={`${items.length} 个网页`}
        />
      </div>
    );
  };

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {conversation.map((msg, idx) => (
          <Bubble
            key={msg.id}
            bubbleRef={bubbleRef}
            avatar={msg.meta!}
            pure
            originData={msg}
            placement={msg.role === 'user' ? 'right' : 'left'}
            bubbleRenderConfig={{ afterMessageRender }}
            markdownRenderConfig={{
              fncProps: {
                render: renderRef,
                onFootnoteDefinitionChange: (list) => {
                  setNodeList(list);
                },
              },
              tableConfig: {
                pure: true,
              },
            }}
            preMessage={conversation[idx - 1]}
            onLike={() => {}}
            onDisLike={() => {}}
          />
        ))}
      </div>
    </>
  );
};
