import {
  MARKDOWN_EDITOR_EVENTS,
  MarkdownEditor,
  MarkdownEditorInstance,
  useRefFunction,
} from '@ant-design/agentic-ui';
import { ChartElement } from '@ant-design/agentic-ui/Plugins/chart';
import { CodeElement } from '@ant-design/agentic-ui/Plugins/code';
import { MermaidElement } from '@ant-design/agentic-ui/Plugins/mermaid';
import { ExportOutlined } from '@ant-design/icons';
import { Popover } from 'antd';
import React, { useEffect } from 'react';

const defaultValue = `根据提供的上下文数据，微软最近的股票并没有大涨，反而表现不佳。以下是相关信息的总结：

1. **股价表现不佳**：微软的股价自2024年7月触及峰值以来，已累计下跌约17%，并且在2024年11月6日收于2024年1月以来的最低水平[^1]。
2. **财报表现**：微软的财报显示，其Azure云计算业务的增长不尽如人意，尽管部分原因是公司数据中心数量不足，无法满足市场需求。虽然其人工智能服务有所增长，但将这些产品货币化的进程比许多投资者预期的要慢[^1]。
3. **人工智能投入**：微软在人工智能领域的投入持续增加，资本支出大幅膨胀。该公司预计本财年将在人工智能数据中心上投入800亿美元，但这些投入尚未显著转化为盈利增长[^1]。
4. **竞争压力**：微软在人工智能领域的竞争对手，如DeepSeek，宣称找到了一种更高效的人工智能模型创建方法，这对微软及其合作伙伴OpenAI构成了挑战[^1]。
6. **竞争压力**：微软在人工智能领域的竞争对手，如DeepSeek，宣称找到了一种更高效的人工智能模型创建方法，这对微软及其合作伙伴OpenAI构成了挑战[^1]。
7. **竞争压力**：微软在人工智能领域的竞争对手，如DeepSeek，宣称找到了一种更高效的人工智能模型创建方法，这对微软及其合作伙伴OpenAI构成了挑战[^1]。
8. **竞争压力**：微软在人工智能领域的竞争对手，如DeepSeek，宣称找到了一种更高效的人工智能模型创建方法，这对微软及其合作伙伴OpenAI构成了挑战[^1]。
9. **竞争压力**：微软在人工智能领域的竞争对手，如DeepSeek，宣称找到了一种更高效的人工智能模型创建方法，这对微软及其合作伙伴OpenAI构成了挑战[^1]。
10. **竞争压力**：微软在人工智能领域的竞争对手，如DeepSeek，宣称找到了一种更高效的人工智能模型创建方法，这对微软及其合作伙伴OpenAI构成了挑战[^1]。
11. **竞争压力**：微软在人工智能领域的竞争对手，如DeepSeek，宣称找到了一种更高效的人工智能模型创建方法，这对微软及其合作伙伴OpenAI构成了挑战[^1]。


综上所述，微软最近的股票并没有大涨，反而因为财报表现不佳、人工智能投入尚未显著转化为盈利增长以及竞争压力等因素，股价表现疲软。

*** Reference Sources ***

[^1]: [微软(MSFT)股价陷低谷，AI投入何时兑现增加承诺？ - 美股投资网](https://www.tradesmax.com/component/k2/item/22075-microsoft)
`;

export default () => {
  const editorRef = React.useRef<MarkdownEditorInstance>();
  const [nodeList, setNodeList] = React.useState<
    {
      id: any;
      placeholder: any;
      origin_text: any;
      url: any;
      origin_url: any;
    }[]
  >([]);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    // @ts-ignore
    window.editorRef = editorRef;
    editorRef.current?.markdownContainerRef?.current?.addEventListener(
      MARKDOWN_EDITOR_EVENTS.SELECTIONCHANGE,
      (e) => {
        console.log('selectionchange', e);
      },
    );
  }, []);

  const funRender = useRefFunction(
    (props: { identifier?: any }, _: React.ReactNode) => {
      const node = nodeList.find(
        (item) => item.placeholder === props.identifier,
      );
      return (
        <Popover
          title="参考链接"
          content={
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <a
                href={node?.url}
                style={{
                  color: '#1890ff',
                }}
                target="_blank"
                rel="noreferrer"
              >
                {node?.origin_text}
              </a>

              <ExportOutlined />
            </div>
          }
        >
          {_}
        </Popover>
      );
    },
  );
  return (
    <>
      <MarkdownEditor
        editorRef={editorRef}
        width={'100vw'}
        height={'100vh'}
        reportMode
        plugins={[
          {
            elements: {
              code: CodeElement,
              chart: ChartElement,
              mermaid: MermaidElement,
            },
          },
        ]}
        fncProps={{
          onFootnoteDefinitionChange: (nodeList) => {
            setNodeList(nodeList);
          },
          render: (props, _) => {
            return funRender(props, _);
          },
        }}
        onChange={(e, value) => {
          console.log(value);
        }}
        image={{
          upload: async (fileList) => {
            return new Promise((resolve) => {
              const file = fileList[0];
              if (typeof file === 'string') {
                fetch(file)
                  .then((res) => res.blob())
                  .then((blob) => {
                    console.log(blob);
                    const url = URL.createObjectURL(blob);
                    resolve(url);
                  });
              } else {
                const url = URL.createObjectURL(file);
                resolve(url);
              }
            });
          },
        }}
        toolBar={{
          hideTools: ['H1'],
          min: true,
        }}
        insertAutocompleteProps={{
          optionsRender: (options) => {
            return options.filter((item) => {
              return item.key !== 'head1';
            });
          },
        }}
        initValue={
          process.env.NODE_ENV === 'test'
            ? defaultValue
            : defaultValue +
              `## 公式

Lift($$L$$) can be determined by Lift Coefficient ($$C_L$$) like the following
equation.

$$
L = \frac{1}{2} \rho v^2 S C_L
$$

$x^3+x^9+x^y$
`
        }
      />
      <div>
        <h4>Props 说明</h4>
        <ul>
          <li>
            <code>editorRef</code> - 编辑器引用，用于访问编辑器实例
          </li>
          <li>
            <code>width</code> - 编辑器宽度，设置为 100vw 占满视口宽度
          </li>
          <li>
            <code>height</code> - 编辑器高度，设置为 100vh 占满视口高度
          </li>
          <li>
            <code>reportMode</code> - 报告模式，优化显示效果
          </li>
          <li>
            <code>plugins</code> - 插件配置，包含代码、图表、mermaid 元素
          </li>
          <li>
            <code>plugins[].elements</code> - 自定义元素渲染配置
          </li>
          <li>
            <code>fncProps</code> - 脚注引用属性配置
          </li>
          <li>
            <code>fncProps.onFootnoteDefinitionChange</code> -
            脚注定义变化回调函数
          </li>
          <li>
            <code>fncProps.render</code> - 脚注引用渲染函数，使用 Popover 包装
          </li>
          <li>
            <code>onChange</code> - 内容变化回调函数，输出到控制台
          </li>
          <li>
            <code>image.upload</code> - 图片上传函数，支持文件和 URL 上传
          </li>
          <li>
            <code>toolBar.hideTools</code> - 隐藏工具栏中的 H1 工具
          </li>
          <li>
            <code>toolBar.min</code> - 工具栏最小化状态
          </li>
          <li>
            <code>insertAutocompleteProps</code> - 插入自动完成属性配置
          </li>
          <li>
            <code>insertAutocompleteProps.optionsRender</code> -
            选项渲染函数，过滤掉 head1 选项
          </li>
          <li>
            <code>initValue</code> - 初始化的 Markdown
            内容，包含脚注引用和数学公式
          </li>
          <li>
            <code>nodeList</code> - 节点列表状态，存储脚注定义信息
          </li>
          <li>
            <code>setNodeList</code> - 设置节点列表的函数
          </li>
          <li>
            <code>funRender</code> - 自定义渲染函数，使用 useRefFunction 优化
          </li>
        </ul>
      </div>
    </>
  );
};
