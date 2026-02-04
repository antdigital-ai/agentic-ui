---
nav:
  order: 1
atomId: ThoughtChainList
group:
  title: 对话流
  order: 3
---

# ThoughtChainList 思维链

一个用于可视化 AI 思考过程和推理链的 React 组件，具有可折叠、交互式格式。

## 功能特点

- 📝 以结构化格式展示 AI 推理步骤
- 🔄 自动滚动到最新内容
- ⏱️ 显示任务进度和执行时间
- 📑 提供文档预览功能
- 🔍 可视化思维链项目状态（加载中、已完成、错误）
- 📊 支持可折叠/可展开视图
- 🏷️ 支持多种 category 类型（表查询、工具调用、文档检索、深度思考、联网搜索）

## 使用方法

```tsx
import { ThoughtChainList } from '@ant-design/agentic-ui'; // 从你的包中导入

// 示例思维链数据
const thoughtChainData = [
  {
    category: 'TableSql',
    info: '查询用户表数据',
    costMillis: 1200,
    input: {
      sql: "SELECT * FROM users WHERE status = 'active'",
    },
    output: {
      type: 'TABLE',
      tableData: {
        id: [1, 2, 3],
        name: ['张三', '李四', '王五'],
        status: ['active', 'active', 'active'],
      },
      columns: ['id', 'name', 'status'],
    },
  },
  {
    category: 'DeepThink',
    info: '分析用户活动模式',
    isLoading: false,
    output: {
      type: 'TOKEN',
      data: '用户活动显示工作日有规律的登录高峰。',
    },
  },
];

function App() {
  return (
    <>
      <ThoughtChainList
        thoughtChainList={thoughtChainData}
        isLoading={false}
        style={{ marginBottom: 16 }}
      />
      <div>
        <h4>Props 说明</h4>
        <ul>
          <li>
            <code>thoughtChainList</code> - 思维链项目数组，包含 AI 推理步骤数据
          </li>
          <li>
            <code>isLoading</code> - 表示组件是否处于加载状态
          </li>
          <li>
            <code>style</code> - 自定义 CSS 样式
          </li>
        </ul>
      </div>
    </>
  );
}
export default App;
```

## 属性

| 属性                     | 类型                               | 必需 | 描述                           |
| ------------------------ | ---------------------------------- | ---- | ------------------------------ |
| `thoughtChainList`       | `WhiteBoxProcessInterface[]`       | 是   | 思维链项目数组                 |
| `isLoading`              | `boolean`                          | 否   | 表示组件是否处于加载状态       |
| `loading`                | `boolean`                          | 否   | **已废弃**，请使用 `isLoading` |
| `bubble`                 | `object`                           | 否   | 聊天状态信息                   |
| `bubble.isFinished`      | `boolean`                          | 否   | 聊天/任务是否已完成            |
| `bubble.endTime`         | `number`                           | 否   | 聊天结束的时间戳               |
| `bubble.createAt`        | `number`                           | 否   | 聊天创建的时间戳               |
| `bubble.isAborted`       | `boolean`                          | 否   | 聊天/任务是否被中止            |
| `style`                  | `React.CSSProperties`              | 否   | 自定义 CSS 样式                |
| `compact`                | `boolean`                          | 否   | 启用紧凑显示模式               |
| `markdownRenderProps`    | `MarkdownEditorProps`              | 否   | Markdown 渲染属性              |
| `finishAutoCollapse`     | `boolean`                          | 否   | 完成时自动折叠（默认为 true）  |
| `locale`                 | `object`                           | 否   | 本地化字符串                   |
| `titleRender`            | `(props, defaultDom) => ReactNode` | 否   | 自定义标题渲染                 |
| `titleExtraRender`       | `(props, defaultDom) => ReactNode` | 否   | 自定义标题右侧额外内容渲染     |
| `thoughtChainItemRender` | `object`                           | 否   | 自定义思维链项目的渲染         |
| `onDocMetaClick`         | `(docMeta: DocMeta) => void`       | 否   | 文档元数据点击回调             |

## 类型定义

### WhiteBoxProcessInterface

思维链项目接口，定义了单个推理步骤的数据结构。

| 属性         | 类型      | 说明                                                                                            |
| ------------ | --------- | ----------------------------------------------------------------------------------------------- |
| `category`   | `string`  | 分类类型：`'TableSql' \| 'ToolCall' \| 'RagRetrieval' \| 'DeepThink' \| 'WebSearch' \| 'other'` |
| `isLoading`  | `boolean` | 是否正在加载                                                                                    |
| `info`       | `string`  | 信息描述                                                                                        |
| `costMillis` | `number`  | 执行耗时（毫秒）                                                                                |
| `input`      | `object`  | 输入参数，包含 `sql`, `inputArgs`, `searchQueries` 等                                           |
| `meta`       | `object`  | 元数据，包含工具名称、HTTP方法、路径等                                                          |
| `runId`      | `string`  | 任务 ID                                                                                         |
| `output`     | `object`  | 输出结果                                                                                        |

### Output

输出结果对象结构。

| 属性        | 类型       | 说明                                                                       |
| ----------- | ---------- | -------------------------------------------------------------------------- |
| `type`      | `string`   | 输出类型：`'TOKEN' \| 'TABLE' \| 'CHUNK' \| 'ERROR' \| 'END' \| 'RUNNING'` |
| `data`      | `string`   | 文本数据                                                                   |
| `errorMsg`  | `string`   | 错误信息                                                                   |
| `response`  | `object`   | API 响应数据                                                               |
| `chunks`    | `Chunk[]`  | 文档块数组                                                                 |
| `tableData` | `object`   | 表格数据                                                                   |
| `columns`   | `string[]` | 表格列名                                                                   |

### Chunk & DocMeta

文档块和元数据结构。

```typescript
interface Chunk {
  docMeta: DocMeta;
  content: string;
  originUrl: string;
}

interface DocMeta {
  type?: string;
  doc_id?: string;
  upload_time?: string;
  doc_name?: string;
  origin_text?: string;
  answer?: string;
}
```

## 示例

### 基础示例

```tsx
import { ThoughtChainList } from '@ant-design/agentic-ui';

const basicThoughtChain = [
  {
    category: 'RagRetrieval',
    info: '搜索文档',
    output: {
      type: 'CHUNK',
      chunks: [
        {
          content: '用户管理的 API 文档',
          docMeta: {
            doc_name: '用户 API 指南',
            doc_id: 'doc123',
            upload_time: '2023-05-10T12:00:00Z',
          },
          originUrl: 'https://example.com/docs/api',
        },
      ],
    },
  },
];

const chatState = {
  isFinished: true,
  endTime: Date.now(),
  createAt: Date.now() - 3000,
};

export default function BasicDemo() {
  return (
    <ThoughtChainList thoughtChainList={basicThoughtChain} bubble={chatState} />
  );
}
```

### 多步骤示例

```tsx
import { ThoughtChainList } from '@ant-design/agentic-ui';
import { useState, useEffect } from 'react';

export default function ProgressDemo() {
  const [thoughtChain, setThoughtChain] = useState([]);
  const [chatState, setChatState] = useState({
    isFinished: false,
    createAt: Date.now(),
  });

  useEffect(() => {
    // 模拟随时间添加思维链步骤
    const steps = [
      {
        runId: '1',
        category: 'WebSearch',
        info: '搜索最新市场趋势',
        input: {
          searchQueries: ['2023年市场趋势', '行业预测'],
        },
        output: {
          data: '2023年市场趋势：科技行业增长15%，行业预测：未来5年行业将保持20%增长',
        },
      },
      {
        category: 'RagRetrieval',
        info: '检索相关文档',
        output: {
          type: 'CHUNK',
          chunks: [
            {
              content: '2023年市场分析报告',
              docMeta: { doc_name: '市场报告' },
            },
          ],
        },
      },
      {
        category: 'DeepThink',
        info: '分析市场数据',
        runId: '2',
        output: {
          type: 'TOKEN',
          data: '分析显示科技行业增长15%',
        },
      },
    ];

    const timers = [];

    // 立即添加第一步
    setThoughtChain([steps[0]]);

    // 2秒后添加第二步
    timers.push(
      setTimeout(() => {
        setThoughtChain([steps[0], steps[1]]);
      }, 2000),
    );

    // 4秒后添加第三步
    timers.push(
      setTimeout(() => {
        setThoughtChain([steps[0], steps[1], steps[2]]);
      }, 4000),
    );

    // 6秒后标记为已完成
    timers.push(
      setTimeout(() => {
        setChatState({
          isFinished: true,
          endTime: Date.now(),
          createAt: chatState.createAt,
        });
      }, 6000),
    );

    return () => timers.forEach((timer) => clearTimeout(timer));
  }, []);

  return (
    <ThoughtChainList
      thoughtChainList={thoughtChain}
      bubble={chatState}
      isLoading={!chatState.isFinished}
    />
  );
}
```

### 错误状态示例

```tsx
import { ThoughtChainList } from '@ant-design/agentic-ui';

const errorThoughtChain = [
  {
    category: 'ToolCall',
    info: '调用外部 API',
    meta: {
      name: 'getUserData',
      method: 'GET',
      path: '/api/users/123',
    },
    output: {
      type: 'ERROR',
      errorMsg: 'API 请求失败：404 未找到',
    },
  },
];

export default function ErrorDemo() {
  return (
    <ThoughtChainList
      thoughtChainList={errorThoughtChain}
      bubble={{
        isFinished: true,
        isAborted: false,
        endTime: Date.now(),
        createAt: Date.now() - 1500,
      }}
    />
  );
}
```

## Category 类型详解

ThoughtChainList 支持多种不同的 category 类型，每种类型都有其特定的用途和数据结构。以下是所有支持的 category 类型的详细说明：

### 快速参考

| Category       | 中文名称 | 主要用途          | 输出类型      | 图标 |
| -------------- | -------- | ----------------- | ------------- | ---- |
| `TableSql`     | 表查询   | 数据库查询操作    | TABLE         | 🗄️   |
| `ToolCall`     | 工具调用 | 外部 API/工具调用 | END/ERROR     | 🔧   |
| `RagRetrieval` | 文档检索 | 知识库文档搜索    | CHUNK         | 📚   |
| `DeepThink`    | 深度思考 | AI 推理分析       | TOKEN/RUNNING | 🧠   |
| `WebSearch`    | 联网搜索 | 网络信息搜索      | END           | 🌐   |

### TableSql - 表查询

用于展示数据库查询操作的思维链项目。

**特点：**

- 🗄️ 显示 SQL 查询语句
- 📊 展示查询结果表格
- ⏱️ 显示查询耗时
- 🔍 支持查询参数展示

**数据结构：**

```tsx | pure
{
  category: 'TableSql',
  info: '查询用户表数据',
  costMillis: 1200,
  input: {
    sql: "SELECT * FROM users WHERE status = 'active'"
  },
  output: {
    type: 'TABLE',
    tableData: {
      id: [1, 2, 3],
      name: ['张三', '李四', '王五'],
      status: ['active', 'active', 'active']
    },
    columns: ['id', 'name', 'status']
  }
}
```

**使用示例：**

```tsx | pure
const sqlThoughtChain = [
  {
    category: 'TableSql',
    info: '查询订单数据',
    costMillis: 850,
    input: {
      sql: "SELECT order_id, customer_name, total_amount FROM orders WHERE created_at >= '2023-01-01'",
    },
    output: {
      type: 'TABLE',
      tableData: {
        order_id: ['ORD001', 'ORD002', 'ORD003'],
        customer_name: ['张三', '李四', '王五'],
        total_amount: [299.99, 199.5, 399.0],
      },
      columns: ['order_id', 'customer_name', 'total_amount'],
    },
  },
];
```

### ToolCall - 工具调用

用于展示外部工具或 API 调用的思维链项目。

**特点：**

- 🔧 显示工具名称和描述
- 📡 展示 HTTP 请求详情
- 📥 显示请求参数和响应数据
- ⚠️ 支持错误状态展示

**数据结构：**

```tsx | pure
{
  category: 'ToolCall',
  info: '调用用户信息接口',
  input: {
    inputArgs: {
      requestBody: { userId: 123 },
      parameters: { id: '123' },
      params: { include: 'profile' }
    }
  },
  meta: {
    name: 'getUserInfo',
    method: 'GET',
    path: '/api/users/123',
    description: '获取用户详细信息'
  },
  output: {
    type: 'END',
    response: {
      error: false,
      data: { id: 123, name: '张三', email: 'zhangsan@example.com' }
    }
  }
}
```

**使用示例：**

```tsx | pure
const toolCallThoughtChain = [
  {
    category: 'ToolCall',
    info: '调用天气查询接口',
    input: {
      inputArgs: {
        params: { city: '北京', lang: 'zh' },
      },
    },
    meta: {
      name: 'getWeather',
      method: 'GET',
      path: '/api/weather',
      description: '获取指定城市的天气信息',
    },
    output: {
      type: 'END',
      response: {
        error: false,
        data: {
          city: '北京',
          temperature: 25,
          weather: '晴朗',
          humidity: 60,
        },
      },
    },
  },
];
```

### RagRetrieval - 文档检索

用于展示知识库或文档检索操作的思维链项目。

**特点：**

- 📚 显示检索的文档片段
- 🔗 提供文档来源链接
- 📄 支持文档元数据展示
- 🔍 显示搜索关键词

**数据结构：**

```tsx | pure
{
  category: 'RagRetrieval',
  info: '检索产品文档',
  input: {
    searchQueries: ['产品功能', '使用指南']
  },
  output: {
    type: 'CHUNK',
    chunks: [
      {
        content: '产品主要功能包括用户管理、数据分析和报表生成...',
        originUrl: 'https://docs.example.com/features',
        docMeta: {
          doc_name: '产品功能说明',
          doc_id: 'doc_001',
          type: 'documentation'
        }
      }
    ]
  }
}
```

**使用示例：**

```tsx | pure
const ragThoughtChain = [
  {
    category: 'RagRetrieval',
    info: '搜索相关技术文档',
    input: {
      searchQueries: ['React Hooks', '状态管理'],
    },
    output: {
      type: 'CHUNK',
      chunks: [
        {
          content:
            'React Hooks 是 React 16.8 引入的新特性，允许在函数组件中使用状态和其他 React 特性...',
          originUrl: 'https://react.dev/reference/react',
          docMeta: {
            doc_name: 'React 官方文档',
            doc_id: 'react_hooks_001',
            type: 'documentation',
            upload_time: '2023-05-15T10:30:00Z',
          },
        },
        {
          content:
            '状态管理是现代前端应用的核心概念，常用的解决方案包括 Redux、Zustand 等...',
          originUrl: 'https://redux.js.org/introduction/getting-started',
          docMeta: {
            doc_name: 'Redux 入门指南',
            doc_id: 'redux_guide_001',
            type: 'tutorial',
          },
        },
      ],
    },
  },
];
```

### DeepThink - 深度思考

用于展示 AI 推理和思考过程的思维链项目。

**特点：**

- 🧠 显示 AI 推理过程
- 💭 支持流式输出展示
- 📝 展示思考结果
- ⚡ 支持实时更新

**数据结构：**

```tsx | pure
{
  category: 'DeepThink',
  info: '分析市场趋势',
  output: {
    type: 'TOKEN',
    data: '根据最新的市场数据分析，科技股在本季度表现强劲，主要驱动因素包括...'
  }
}
```

**使用示例：**

```tsx | pure
const deepThinkChain = [
  {
    category: 'DeepThink',
    info: '分析用户行为模式',
    output: {
      type: 'TOKEN',
      data: `通过对用户数据的深入分析，我发现以下几个关键模式：

1. **活跃时间分布**：用户主要在工作日的上午 9-11 点和下午 2-4 点最为活跃
2. **功能使用偏好**：数据分析功能使用率最高，占总使用时长的 45%
3. **用户留存**：新用户在第一周的留存率为 78%，第一个月降至 52%

基于这些发现，建议优化产品的引导流程和功能布局。`,
    },
  },
  {
    category: 'DeepThink',
    info: '正在推理中...',
    isLoading: true,
    output: {
      type: 'RUNNING',
    },
  },
];
```

### WebSearch - 联网搜索

用于展示网络搜索操作的思维链项目。

**特点：**

- 🌐 显示搜索关键词
- 📋 展示搜索结果列表
- 🔗 提供结果链接
- 📊 显示搜索统计信息

**数据结构：**

```tsx | pure
{
  category: 'WebSearch',
  info: '搜索最新技术资讯',
  input: {
    searchQueries: ['AI 发展趋势', '机器学习应用']
  },
  output: {
    type: 'END',
    data: `搜索结果：

1. **AI 技术发展报告 2024** - tech.example.com
   人工智能技术在 2024 年呈现出快速发展的趋势...

2. **机器学习在金融领域的应用** - finance.example.com
   机器学习技术正在革命性地改变金融行业...

3. **深度学习最新突破** - research.example.com
   最新的深度学习研究取得了重大突破...`
  }
}
```

**使用示例：**

```tsx | pure
const webSearchChain = [
  {
    category: 'WebSearch',
    info: '搜索竞品分析信息',
    input: {
      searchQueries: ['SaaS 产品对比', '项目管理工具评测'],
    },
    output: {
      type: 'END',
      data: `找到 15 个相关结果：

**热门 SaaS 产品对比分析**
- Notion vs Obsidian：功能特性对比
- Slack vs Teams：企业协作工具选择指南
- Figma vs Sketch：设计工具深度评测

**项目管理工具评测**
- Jira vs Linear：敏捷开发工具对比
- Asana vs Monday：团队协作平台分析
- Trello vs ClickUp：轻量级项目管理方案`,
    },
  },
];
```

### 错误处理

所有 category 类型都支持错误状态的展示：

```tsx | pure
{
  category: 'ToolCall',
  info: '调用支付接口',
  output: {
    type: 'ERROR',
    errorMsg: 'API 请求失败：网络连接超时'
  }
}
```

### 加载状态

支持显示正在执行的状态：

```tsx | pure
{
  category: 'DeepThink',
  info: '正在分析数据...',
  isLoading: true,
  output: {
    type: 'RUNNING'
  }
 }
```

### 最佳实践

**1. 选择合适的 Category**

- 数据库操作使用 `TableSql`
- API 调用使用 `ToolCall`
- 文档搜索使用 `RagRetrieval`
- AI 推理使用 `DeepThink`
- 网络搜索使用 `WebSearch`

**2. 提供清晰的信息描述**

```tsx | pure
// ✅ 好的做法
info: '查询用户订单数据';

// ❌ 避免的做法
info: '查询数据';
```

**3. 合理使用加载状态**

```tsx | pure
// 正在执行的任务
{
  category: 'ToolCall',
  info: '正在调用支付接口...',
  isLoading: true
}

// 已完成的任务
{
  category: 'ToolCall',
  info: '调用支付接口',
  costMillis: 1200,
  output: { type: 'END', response: {...} }
}
```

**4. 错误处理**

```tsx | pure
{
  category: 'ToolCall',
  info: '调用支付接口失败',
  output: {
    type: 'ERROR',
    errorMsg: '网络连接超时，请稍后重试'
  }
}
```

## 自定义

### 使用自定义本地化

````tsx
import { ThoughtChainList } from '@ant-design/agentic-ui';
const myThoughtChainData = [
  {
    category: 'DeepThink',
    info: '正在执行: brave_web_search',
    runId: '0',
    output: {
      data: '```json\n{"query": "研究员提到拼多多风险点 知乎 CFRA", "count": 5}\n```\n\n\n `table` \n',
      type: 'END',
    },
  },
  {
    category: 'DeepThink',
    info: '正在推理',
    runId: '1',
    output: {
      data: '\nTitle: 知乎热榜 - 知乎\nDescription: <strong>知乎</strong>，中文互联网高质量的问答社区和创作者聚集的原创内容平台，于 2011 年 1 月正式上线，以「让人们更好的分享知识、经验和见解，找到自己的解答」为品牌使命。知乎凭借认真、专业、友善的社区氛围、独特的产品...\nURL: https://www.zhihu.com/billboard\n\nTitle: 发现 - 知乎\nDescription: <strong>知乎</strong>，中文互联网高质量的问答社区和创作者聚集的原创内容平台，于 2011 年 1 月正式上线，以「让人们更好的分享知识、经验和见解，找到自己的解答」为品牌使命。知乎凭借认真、专业、友善的社区氛围、独特的产品...\nURL: https://www.zhihu.com/explore\n\nTitle: 美国国债：特朗普关税战贸易战开启后的动荡到底是怎么回事？ - BBC News 中文\nDescription: 图像来源，Getty Images · 全球股市在经历了一段由美国贸易关税引发的混乱时期之后，本周已显得相对平稳。\nURL: https://www.bbc.com/zhongwen/articles/cx2vdp1vl7ro/simp\n\nTitle: Stocks tumble and dollar hits three-year low as Trump bashes Powell again - ABC17NEWS\nDescription: By John Towfighi, CNN New York (CNN) — US stocks ended the day sharply lower Monday and the dollar tumbled as investors assessed continued tariff uncertainty and the implications of President Donald Trump’s ongoing mission to try and oust Federal Reserve Chair Jerome Powell.\nURL: https://abc17news.com/money/cnn-business-consumer/2025/04/21/us-stocks-tumble-and-dollar-hits-three-year-low-as-trump-continues-to-bash-fed-chair-powell/\n\nTitle: US stocks tumble and dollar hits three-year low as Trump continues to bash Fed Chair Powell | KRDO\nDescription: By John Towfighi, CNN New York (CNN) — US stocks and the dollar tumbled Monday as investors assessed continued tariff uncertainty and the\nURL: https://krdo.com/news/2025/04/21/us-stocks-tumble-and-dollar-hits-three-year-low-as-trump-continues-to-bash-fed-chair-powell/\n\n\n\n',
      type: 'END',
    },
  },
  {
    category: 'DeepThink',
    info: '正在执行: get_company_profile',
    runId: '2',
    output: {
      data: '```json\n{"symbol": "0700.HK"}\n```\n\n\n\x3C!-- {"type": "card","icon":"https://know2.co/api/spaces/images/84caf516-230e-460b-a9f1-bc2955f642e1.svg","title":"腾讯","description":"Internet Content & Information/Communication Services" } -->\n[腾讯](https://know2.co/company/10 "公司信息")\n\n\n\n',
      type: 'END',
    },
  },
  {
    category: 'DeepThink',
    info: '正在执行: get_company_profile',
    runId: '3',
    output: {
      data: '```json\n{"symbol": "NTES"}\n```\n\n\n\x3C!-- {"type": "card","icon":"https://know2.co/api/spaces/images/156cec9a-6f55-45d6-bda6-ec37d388d8e0.svg","title":"网易","description":"Electronic Gaming & Multimedia/Communication Services" } -->\n[网易](https://know2.co/company/49 "公司信息")\n\n\n\n',
      type: 'END',
    },
  },
  {
    category: 'DeepThink',
    info: '正在执行: brave_web_search',
    runId: '4',
    output: {
      data: '```json\n{"query": "拼多多风险点 研究员报告 中金 华创 国泰君安", "count": 10}\n```\n\nTitle: 国泰君安-拉普拉斯-688726-IPO专题：新股精要—高效光伏电池片核心工艺设备领先提供商拉普拉斯-241014_坚果研报下载\nDescription: 2024-10-14王政之,施怡昀,王思琪924K8页其他报告国泰君安 · 上一篇：紫金天风-动力煤周报：煤价进入淡季模式-241011\nURL: https://www.52jg.com/report/other/2621255.html\n\nTitle: 万得 - 金融终端\nDescription: 全方位洞察财经资讯 · Wind金融终端 · 覆盖全球金融市场的数据与信息 · 内容包括股票、债券、期货、外汇、基金、指数、权证、宏观行业等多项品种，7×24×365不间断地为金融机构、政府组织、企业、媒体提供准确、及时...\nURL: https://www.wind.com.cn/mobile/WFT/zh.html\n\nTitle: Zhihu\nDescription: 知乎，让每一次点击都充满意义 —— 欢迎来到知乎，发现问题背后的世界。\nURL: https://www.zhihu.com/question/38008546\n\nTitle: 永辉超市的最新研报、机构研究报告_SH601933_乌龟量化\nDescription: 永辉超市的最新研报、机构研究报告 SH601933.主板 可融资 沪股通 · 04月29日： 财报发布 · 切换自选 · + 自 选 · 价： 3.20 (+0.95%) · 估值日期： 今天 · PE/扣非PE： 亏损/亏损 · 市净率PB： 3.65 · 股息率： 0.63% · ROE： -\nURL: https://wglh.com/stock/report/sh601933/\n\nTitle: 财联社深度：重大政策事件及时分析解读_供给侧改革\nDescription: 关于我们网站声明联系方式用户反馈网站地图帮助 · 首页 · 电报 · 话题 · 盯盘 · 投研 · 下载 · 头条 · 港股 · 环球\nURL: https://www.cls.cn/depth/825182\n\nTitle: 2023-2029年富锂锰基正极材料市场竞争战略研究及投资前景可行性评估预测报告 2023-2029年富锂锰基正极材料市场竞争战略研究及投资前景可行性评估预测报告1） 中金 企信国际咨询（全称：中金企信... - 雪球\nDescription: 来源：雪球App，作者： 善行的金条小耳环，（https://xueqiu.com/1234692718/260196787） · 2023-2029年富锂锰基正极材料市场竞争战略研究及投资前景可行性评估预测报告\nURL: https://xueqiu.com/1234692718/260196787\n\nTitle: 资管圈风向又变！雪球结构产品再迎强监管 信托公司雪球发行被叫停 影响多大？ _ 东方财富网\nDescription: 【资管圈风向又变！雪球结构产品再迎强监管 信托公司雪球发行被叫停 影响多大？】券商中国获悉，1月5日，部分涉及衍生品业务的信托公司(主要是雪球类)收到监管窗口指导，暂停涉及雪球类券商收益凭证产品的发行。...\nURL: https://finance.eastmoney.com/a/202201072239307540.html\n\nTitle: PDD Holdings Inc DRC Stock Price Today | NASDAQ: PDD Live - Investing.com\nDescription: View today&#x27;s PDD Holdings Inc DRC stock price and latest PDD news and analysis. Create real-time notifications to follow any changes in the live stock price.\nURL: https://www.investing.com/equities/pinduoduo\n\nTitle: 404 - 知乎\nDescription: 知乎，中文互联网高质量的问答社区和创作者聚集的原创内容平台，于 2011 年 1 月正式上线，以「让人们更好的分享知识、经验和见解，找到自己的解答」为品牌使命。知乎凭借认真、专业、友善的社区氛围、独特的产品...\nURL: https://zhuanlan.zhihu.com/p/692760179\n\nTitle: 华尔街见闻\nDescription: We cannot provide a description for this page right now\nURL: https://wallstreetcn.com/articles/3726042\n\n\n\n让我收集更多关于这两家公司的财务和业务信息，以便进行更全面的对比分析。',
      type: 'END',
    },
  },
  {
    category: 'DeepThink',
    info: '正在执行: rag_local_search',
    runId: '5',
    output: {
      data: '```json\n{"query": "腾讯 网易 对比 业务模式 收入结构", "limit": 5}\n```\n\n\n\n\n\n',
      type: 'END',
    },
  },
  {
    category: 'DeepThink',
    info: '正在执行: brave_web_search',
    runId: '6',
    output: {
      data: '```json\n{"query": "拼多多 风险点 招股书 SWOT", "count": 5}\n```\n\nTitle: 一文看懂拼多多招股书：急于上市的它还需跨三道坎|拼多多|黄峥|招股书_新浪科技_新浪网\nDescription: 截至2017年12月31日和2018年3月31日，拼多多的应收账款余额分别为4.427亿元和5.515亿元，腾讯的应付余额分别是5600万元和1.227亿元。 ... 招股书披露，2018年第一季度，拼多多平均月活跃用户达到1.66亿，而在2017年第四季度平均...\nURL: https://tech.sina.com.cn/roll/2018-07-01/doc-ihespqrx8709596.shtml\n\nTitle: 拼多多公布招股书：三年亏损13亿 收入靠广告和佣金|拼多多_新浪财经_新浪网\nDescription: 定位为一家高速增长的“新电商”平台。众所周知，拼多多的快速增长受益于中国社交网络的红利，同时，“拼单”模式也是由拼多多首创。 · 招股书中进一步解释其平台定位是为买家提供“物美价廉的商品和充满乐趣的...\nURL: https://finance.sina.com.cn/stock/usstock/gsyj/2018-07-01/doc-ihespqrx7981348.shtml\n\nTitle: 拼多多更新了招股书，估值可能超过 200 亿美元 | 爱范儿\nDescription: 6 月 30 日向美国证交会递交了招股书后，拼多多于 7 月 16 日更新了招股书，披露了不少 IPO 的具体信息。 · 招股书显示，拼多多计划在纳斯达克挂牌，股票代码为 PDD，计划发行 8560 万股美国存托股票（ADS），招股区间为 ...\nURL: https://www.ifanr.com/1067669\n\nTitle: 提示信息 - 中国会计视野论坛 -\nDescription: 微信扫一扫，快速登录 · 如果您的浏览器没有自动跳转，请点击此链接\nURL: https://bbs.esnai.com/thread-5351732-1-1.html\n\nTitle: 一文看懂拼多多招股书：腾讯18.5% 为何急于上市|拼多多|腾讯|招股书_新浪科技_新浪网\nDescription: 另外，拼多多主要股东在IPO申请文件提交之前的持股情况如下：黄峥附属实体实益持有约21亿股普通股，持股比例为50.7%；腾讯附属实体实益持有约7.5亿股普通股，持股比例为18.5%；Banyan Partners Funds实益持有约4.1亿股普通股，持股比例为10.1%；红杉资本旗下基金实益持有约3亿股普通股，持股比例为7.4%。 ... 招股书披露...\nURL: http://tech.sina.com.cn/i/2018-06-30/doc-iheqpwqz3565374.shtml\n\n\n\n让我重试另一种搜索方式：',
      type: 'END',
    },
  },
  {
    category: 'DeepThink',
    info: '正在执行: rag_local_search',
    runId: '7',
    output: {
      data: '```json\n{"query": "腾讯业务模式", "company_id": 10, "limit": 5}\n```\n\n\n\n\n\n看来我们遇到了连接问题。我将使用网络搜索获取更多资料：',
      type: 'END',
    },
  },
  {
    category: 'DeepThink',
    info: '正在执行: brave_web_search',
    runId: '8',
    output: {
      data: '```json\n{"query": "腾讯与网易业务模式收入结构对比分析", "count": 10}\n```\n\nTitle: 被腾讯围堵，20年涨138倍，“慢”网易凭什么？\nDescription: 网易2000年登陆纳斯达克，20年后回归港股。创始人丁磊2003年就成为中国首富，那一年，现中国最富两人马云、马化腾还在蛰伏。 · 电商和搜索，网易和阿里、百度短兵相接过。在多个赛道，网易和腾讯都狭路相逢。网易游...\nURL: https://www.stcn.com/article/detail/221655.html\n\nTitle: 腾讯VS网易：一场不见终局的游戏未来之战 - 21经济网\nDescription: 国内游戏霸主腾讯最近赚足了眼球。 · 总体上看，腾讯手握“游戏+社交”两大王牌，最近发布的财报十分亮眼，其2023年总营收和净利润分别同比增长10%和36%，展现了互联网巨头的强劲活力。\nURL: https://www.21jingji.com/article/20240327/herald/a1e32b3c044c144ccfa60fa205c46ea1.html\n\nTitle: 都是靠产品起家，腾讯和网易有什么不同？ - 数英\nDescription: 扫描,分享朋友圈 · 原标题：腾讯“赛马机制”，网易“一厂两制” 本文为数英用户原创，转载请联系作者 编辑对内容有所改动\nURL: https://www.digitaling.com/articles/43538.html\n\nTitle: 八张图看懂搜狐、新浪、网易的变与不变-36氪\nDescription: 科技大厂掀起医疗界的AI革命，谁更有胜算？ · 在《黑镜》的衍生游戏里，我已经分不清谁在戏弄谁\nURL: https://www.36kr.com/p/1721264652289\n\nTitle: 腾讯游戏VS网易游戏 腾讯游戏遥遥领先_行业研究报告 - 前瞻网\nDescription: 报告服务热线400-068-7188 · 据游戏工委数据，2019年中国游戏市场实际销售收入2308.8亿元，同比增长7.7%。其中移动游戏营销收入1581.1亿元，同比增长18.0%，成为拉动游戏市场整体增长的主要因素。其用户规模6.2亿人，增速明显...\nURL: https://www.qianzhan.com/analyst/detail/220/200327-c52da0ad.html\n\nTitle: 腾讯网易业绩全面PK，万亿巨头集火4个赛道，整套打法变了？|界面新闻 · JMedia\nDescription: 腾讯网易业绩全面PK，万亿巨头集火4个赛道，整套打法变了？ · 扫一扫下载界面新闻APP\nURL: https://www.jiemian.com/article/7177594.html\n\nTitle: 干货！2021年中国游戏行业企业对比：腾讯游戏VS网易游戏 谁是“游戏之王”？_行业研究报告 - 前瞻网\nDescription: 报告服务热线400-068-7188 · 近年来，随着我国经济的发展，人们的生活水平逐步提升开始注重文化层面的追求，游戏产业也随之发展起来，目前除了传统游戏公司外，腾讯和网易两大互联网巨头也加入到了游戏行业当中，并...\nURL: https://www.qianzhan.com/analyst/detail/220/210705-d3b870ae.html\n\nTitle: 网易是如何在这场战争中败给腾讯的？_新浪财经_新浪网\nDescription: 股市瞬息万变，投资难以决策？来#A股参谋部#超话聊一聊，[点击进入超话] · 来源|互联网怪盗团（ID：TMTphantom）\nURL: https://finance.sina.com.cn/chanjing/gsnews/2021-06-11/doc-ikqciyzi9109539.shtml\n\nTitle: 腾讯网易业绩全面PK，万亿巨头集火4个赛道，整套打法变了？-蓝鲸财经\nDescription: 文|DataEye研究院 Ellie · 最新财报季已来临，腾讯、网易两大头部玩家表现如何？\nURL: https://m.lanjinger.com/d/178286\n\nTitle: 干货！2022年中国移动游戏行业龙头企业对比：腾讯VS网易 谁是中国“移动游戏之王”？_新浪财经_新浪网\nDescription: 转自：前瞻产业研究院 · 移动游戏行业主要上市公司：腾讯控股(00700.HK);网易(09999.HK);哔哩哔哩(09626.HK);友谊时光(06820.HK);中手游(00302.HK);ST天润(002113.SZ);惠程科技(002168.SZ);游族网络(002174.SZ);天娱数科(002354.SZ);凯撒文化(002425...\nURL: https://finance.sina.com.cn/roll/2022-09-15/doc-imqqsmrn9194115.shtml\n\n\n\n让我查看一些有价值的文章内容：',
      type: 'END',
    },
  },
  {
    category: 'DeepThink',
    info: '正在执行: fetch',
    runId: '9',
    output: {
      data: '```json\n{"url": "https://www.21jingji.com/article/20240327/herald/a1e32b3c044c144ccfa60fa205c46ea1.html"}\n```\n\n\n\n\n',
      type: 'END',
    },
  },
  { category: 'DeepThink', info: '推理完成', runId: '10' },
  {
    category: 'DeepThink',
    info: '正在推理',
    runId: '11',
    output: {
      data: '\nError: Tool execution timed out after 30 seconds: fetch\n\n\n\n',
      type: 'END',
    },
  },
];
export default function LocalizedDemo() {
  return (
    <ThoughtChainList
      thoughtChainList={myThoughtChainData}
      locale={{
        thinking: '思考中...',
        taskFinished: '任务已完成',
        taskCost: '用时',
      }}
    />
  );
}
````

### 紧凑模式

````tsx
import { ThoughtChainList } from '@ant-design/agentic-ui';
const myThoughtChainData = [
  {
    category: 'DeepThink',
    info: '正在执行: brave_web_search',
    runId: '0',
    output: {
      data: '```json\n{"query": "研究员提到拼多多风险点 知乎 CFRA", "count": 5}\n```\n\n\n `table` \n',
      type: 'END',
    },
  },
  {
    category: 'DeepThink',
    info: '正在推理',
    runId: '1',
    output: {
      data: '\nTitle: 知乎热榜 - 知乎\nDescription: <strong>知乎</strong>，中文互联网高质量的问答社区和创作者聚集的原创内容平台，于 2011 年 1 月正式上线，以「让人们更好的分享知识、经验和见解，找到自己的解答」为品牌使命。知乎凭借认真、专业、友善的社区氛围、独特的产品...\nURL: https://www.zhihu.com/billboard\n\nTitle: 发现 - 知乎\nDescription: <strong>知乎</strong>，中文互联网高质量的问答社区和创作者聚集的原创内容平台，于 2011 年 1 月正式上线，以「让人们更好的分享知识、经验和见解，找到自己的解答」为品牌使命。知乎凭借认真、专业、友善的社区氛围、独特的产品...\nURL: https://www.zhihu.com/explore\n\nTitle: 美国国债：特朗普关税战贸易战开启后的动荡到底是怎么回事？ - BBC News 中文\nDescription: 图像来源，Getty Images · 全球股市在经历了一段由美国贸易关税引发的混乱时期之后，本周已显得相对平稳。\nURL: https://www.bbc.com/zhongwen/articles/cx2vdp1vl7ro/simp\n\nTitle: Stocks tumble and dollar hits three-year low as Trump bashes Powell again - ABC17NEWS\nDescription: By John Towfighi, CNN New York (CNN) — US stocks ended the day sharply lower Monday and the dollar tumbled as investors assessed continued tariff uncertainty and the implications of President Donald Trump’s ongoing mission to try and oust Federal Reserve Chair Jerome Powell.\nURL: https://abc17news.com/money/cnn-business-consumer/2025/04/21/us-stocks-tumble-and-dollar-hits-three-year-low-as-trump-continues-to-bash-fed-chair-powell/\n\nTitle: US stocks tumble and dollar hits three-year low as Trump continues to bash Fed Chair Powell | KRDO\nDescription: By John Towfighi, CNN New York (CNN) — US stocks and the dollar tumbled Monday as investors assessed continued tariff uncertainty and the\nURL: https://krdo.com/news/2025/04/21/us-stocks-tumble-and-dollar-hits-three-year-low-as-trump-continues-to-bash-fed-chair-powell/\n\n\n\n',
      type: 'END',
    },
  },
  {
    category: 'DeepThink',
    info: '正在执行: get_company_profile',
    runId: '2',
    output: {
      data: '```json\n{"symbol": "0700.HK"}\n```\n\n\n\x3C!-- {"type": "card","icon":"https://know2.co/api/spaces/images/84caf516-230e-460b-a9f1-bc2955f642e1.svg","title":"腾讯","description":"Internet Content & Information/Communication Services" } -->\n[腾讯](https://know2.co/company/10 "公司信息")\n\n\n\n',
      type: 'END',
    },
  },
  {
    category: 'DeepThink',
    info: '正在执行: get_company_profile',
    runId: '3',
    output: {
      data: '```json\n{"symbol": "NTES"}\n```\n\n\n\x3C!-- {"type": "card","icon":"https://know2.co/api/spaces/images/156cec9a-6f55-45d6-bda6-ec37d388d8e0.svg","title":"网易","description":"Electronic Gaming & Multimedia/Communication Services" } -->\n[网易](https://know2.co/company/49 "公司信息")\n\n\n\n',
      type: 'END',
    },
  },
  {
    category: 'DeepThink',
    info: '正在执行: brave_web_search',
    runId: '4',
    output: {
      data: '```json\n{"query": "拼多多风险点 研究员报告 中金 华创 国泰君安", "count": 10}\n```\n\nTitle: 国泰君安-拉普拉斯-688726-IPO专题：新股精要—高效光伏电池片核心工艺设备领先提供商拉普拉斯-241014_坚果研报下载\nDescription: 2024-10-14王政之,施怡昀,王思琪924K8页其他报告国泰君安 · 上一篇：紫金天风-动力煤周报：煤价进入淡季模式-241011\nURL: https://www.52jg.com/report/other/2621255.html\n\nTitle: 万得 - 金融终端\nDescription: 全方位洞察财经资讯 · Wind金融终端 · 覆盖全球金融市场的数据与信息 · 内容包括股票、债券、期货、外汇、基金、指数、权证、宏观行业等多项品种，7×24×365不间断地为金融机构、政府组织、企业、媒体提供准确、及时...\nURL: https://www.wind.com.cn/mobile/WFT/zh.html\n\nTitle: Zhihu\nDescription: 知乎，让每一次点击都充满意义 —— 欢迎来到知乎，发现问题背后的世界。\nURL: https://www.zhihu.com/question/38008546\n\nTitle: 永辉超市的最新研报、机构研究报告_SH601933_乌龟量化\nDescription: 永辉超市的最新研报、机构研究报告 SH601933.主板 可融资 沪股通 · 04月29日： 财报发布 · 切换自选 · + 自 选 · 价： 3.20 (+0.95%) · 估值日期： 今天 · PE/扣非PE： 亏损/亏损 · 市净率PB： 3.65 · 股息率： 0.63% · ROE： -\nURL: https://wglh.com/stock/report/sh601933/\n\nTitle: 财联社深度：重大政策事件及时分析解读_供给侧改革\nDescription: 关于我们网站声明联系方式用户反馈网站地图帮助 · 首页 · 电报 · 话题 · 盯盘 · 投研 · 下载 · 头条 · 港股 · 环球\nURL: https://www.cls.cn/depth/825182\n\nTitle: 2023-2029年富锂锰基正极材料市场竞争战略研究及投资前景可行性评估预测报告 2023-2029年富锂锰基正极材料市场竞争战略研究及投资前景可行性评估预测报告1） 中金 企信国际咨询（全称：中金企信... - 雪球\nDescription: 来源：雪球App，作者： 善行的金条小耳环，（https://xueqiu.com/1234692718/260196787） · 2023-2029年富锂锰基正极材料市场竞争战略研究及投资前景可行性评估预测报告\nURL: https://xueqiu.com/1234692718/260196787\n\nTitle: 资管圈风向又变！雪球结构产品再迎强监管 信托公司雪球发行被叫停 影响多大？ _ 东方财富网\nDescription: 【资管圈风向又变！雪球结构产品再迎强监管 信托公司雪球发行被叫停 影响多大？】券商中国获悉，1月5日，部分涉及衍生品业务的信托公司(主要是雪球类)收到监管窗口指导，暂停涉及雪球类券商收益凭证产品的发行。...\nURL: https://finance.eastmoney.com/a/202201072239307540.html\n\nTitle: PDD Holdings Inc DRC Stock Price Today | NASDAQ: PDD Live - Investing.com\nDescription: View today&#x27;s PDD Holdings Inc DRC stock price and latest PDD news and analysis. Create real-time notifications to follow any changes in the live stock price.\nURL: https://www.investing.com/equities/pinduoduo\n\nTitle: 404 - 知乎\nDescription: 知乎，中文互联网高质量的问答社区和创作者聚集的原创内容平台，于 2011 年 1 月正式上线，以「让人们更好的分享知识、经验和见解，找到自己的解答」为品牌使命。知乎凭借认真、专业、友善的社区氛围、独特的产品...\nURL: https://zhuanlan.zhihu.com/p/692760179\n\nTitle: 华尔街见闻\nDescription: We cannot provide a description for this page right now\nURL: https://wallstreetcn.com/articles/3726042\n\n\n\n让我收集更多关于这两家公司的财务和业务信息，以便进行更全面的对比分析。',
      type: 'END',
    },
  },
  {
    category: 'DeepThink',
    info: '正在执行: rag_local_search',
    runId: '5',
    output: {
      data: '```json\n{"query": "腾讯 网易 对比 业务模式 收入结构", "limit": 5}\n```\n\n\n\n\n\n',
      type: 'END',
    },
  },
  {
    category: 'DeepThink',
    info: '正在执行: brave_web_search',
    runId: '6',
    output: {
      data: '```json\n{"query": "拼多多 风险点 招股书 SWOT", "count": 5}\n```\n\nTitle: 一文看懂拼多多招股书：急于上市的它还需跨三道坎|拼多多|黄峥|招股书_新浪科技_新浪网\nDescription: 截至2017年12月31日和2018年3月31日，拼多多的应收账款余额分别为4.427亿元和5.515亿元，腾讯的应付余额分别是5600万元和1.227亿元。 ... 招股书披露，2018年第一季度，拼多多平均月活跃用户达到1.66亿，而在2017年第四季度平均...\nURL: https://tech.sina.com.cn/roll/2018-07-01/doc-ihespqrx8709596.shtml\n\nTitle: 拼多多公布招股书：三年亏损13亿 收入靠广告和佣金|拼多多_新浪财经_新浪网\nDescription: 定位为一家高速增长的“新电商”平台。众所周知，拼多多的快速增长受益于中国社交网络的红利，同时，“拼单”模式也是由拼多多首创。 · 招股书中进一步解释其平台定位是为买家提供“物美价廉的商品和充满乐趣的...\nURL: https://finance.sina.com.cn/stock/usstock/gsyj/2018-07-01/doc-ihespqrx7981348.shtml\n\nTitle: 拼多多更新了招股书，估值可能超过 200 亿美元 | 爱范儿\nDescription: 6 月 30 日向美国证交会递交了招股书后，拼多多于 7 月 16 日更新了招股书，披露了不少 IPO 的具体信息。 · 招股书显示，拼多多计划在纳斯达克挂牌，股票代码为 PDD，计划发行 8560 万股美国存托股票（ADS），招股区间为 ...\nURL: https://www.ifanr.com/1067669\n\nTitle: 提示信息 - 中国会计视野论坛 -\nDescription: 微信扫一扫，快速登录 · 如果您的浏览器没有自动跳转，请点击此链接\nURL: https://bbs.esnai.com/thread-5351732-1-1.html\n\nTitle: 一文看懂拼多多招股书：腾讯18.5% 为何急于上市|拼多多|腾讯|招股书_新浪科技_新浪网\nDescription: 另外，拼多多主要股东在IPO申请文件提交之前的持股情况如下：黄峥附属实体实益持有约21亿股普通股，持股比例为50.7%；腾讯附属实体实益持有约7.5亿股普通股，持股比例为18.5%；Banyan Partners Funds实益持有约4.1亿股普通股，持股比例为10.1%；红杉资本旗下基金实益持有约3亿股普通股，持股比例为7.4%。 ... 招股书披露...\nURL: http://tech.sina.com.cn/i/2018-06-30/doc-iheqpwqz3565374.shtml\n\n\n\n让我重试另一种搜索方式：',
      type: 'END',
    },
  },
  {
    category: 'DeepThink',
    info: '正在执行: rag_local_search',
    runId: '7',
    output: {
      data: '```json\n{"query": "腾讯业务模式", "company_id": 10, "limit": 5}\n```\n\n\n\n\n\n看来我们遇到了连接问题。我将使用网络搜索获取更多资料：',
      type: 'END',
    },
  },
  {
    category: 'DeepThink',
    info: '正在执行: brave_web_search',
    runId: '8',
    output: {
      data: '```json\n{"query": "腾讯与网易业务模式收入结构对比分析", "count": 10}\n```\n\nTitle: 被腾讯围堵，20年涨138倍，“慢”网易凭什么？\nDescription: 网易2000年登陆纳斯达克，20年后回归港股。创始人丁磊2003年就成为中国首富，那一年，现中国最富两人马云、马化腾还在蛰伏。 · 电商和搜索，网易和阿里、百度短兵相接过。在多个赛道，网易和腾讯都狭路相逢。网易游...\nURL: https://www.stcn.com/article/detail/221655.html\n\nTitle: 腾讯VS网易：一场不见终局的游戏未来之战 - 21经济网\nDescription: 国内游戏霸主腾讯最近赚足了眼球。 · 总体上看，腾讯手握“游戏+社交”两大王牌，最近发布的财报十分亮眼，其2023年总营收和净利润分别同比增长10%和36%，展现了互联网巨头的强劲活力。\nURL: https://www.21jingji.com/article/20240327/herald/a1e32b3c044c144ccfa60fa205c46ea1.html\n\nTitle: 都是靠产品起家，腾讯和网易有什么不同？ - 数英\nDescription: 扫描,分享朋友圈 · 原标题：腾讯“赛马机制”，网易“一厂两制” 本文为数英用户原创，转载请联系作者 编辑对内容有所改动\nURL: https://www.digitaling.com/articles/43538.html\n\nTitle: 八张图看懂搜狐、新浪、网易的变与不变-36氪\nDescription: 科技大厂掀起医疗界的AI革命，谁更有胜算？ · 在《黑镜》的衍生游戏里，我已经分不清谁在戏弄谁\nURL: https://www.36kr.com/p/1721264652289\n\nTitle: 腾讯游戏VS网易游戏 腾讯游戏遥遥领先_行业研究报告 - 前瞻网\nDescription: 报告服务热线400-068-7188 · 据游戏工委数据，2019年中国游戏市场实际销售收入2308.8亿元，同比增长7.7%。其中移动游戏营销收入1581.1亿元，同比增长18.0%，成为拉动游戏市场整体增长的主要因素。其用户规模6.2亿人，增速明显...\nURL: https://www.qianzhan.com/analyst/detail/220/200327-c52da0ad.html\n\nTitle: 腾讯网易业绩全面PK，万亿巨头集火4个赛道，整套打法变了？|界面新闻 · JMedia\nDescription: 腾讯网易业绩全面PK，万亿巨头集火4个赛道，整套打法变了？ · 扫一扫下载界面新闻APP\nURL: https://www.jiemian.com/article/7177594.html\n\nTitle: 干货！2021年中国游戏行业企业对比：腾讯游戏VS网易游戏 谁是“游戏之王”？_行业研究报告 - 前瞻网\nDescription: 报告服务热线400-068-7188 · 近年来，随着我国经济的发展，人们的生活水平逐步提升开始注重文化层面的追求，游戏产业也随之发展起来，目前除了传统游戏公司外，腾讯和网易两大互联网巨头也加入到了游戏行业当中，并...\nURL: https://www.qianzhan.com/analyst/detail/220/210705-d3b870ae.html\n\nTitle: 网易是如何在这场战争中败给腾讯的？_新浪财经_新浪网\nDescription: 股市瞬息万变，投资难以决策？来#A股参谋部#超话聊一聊，[点击进入超话] · 来源|互联网怪盗团（ID：TMTphantom）\nURL: https://finance.sina.com.cn/chanjing/gsnews/2021-06-11/doc-ikqciyzi9109539.shtml\n\nTitle: 腾讯网易业绩全面PK，万亿巨头集火4个赛道，整套打法变了？-蓝鲸财经\nDescription: 文|DataEye研究院 Ellie · 最新财报季已来临，腾讯、网易两大头部玩家表现如何？\nURL: https://m.lanjinger.com/d/178286\n\nTitle: 干货！2022年中国移动游戏行业龙头企业对比：腾讯VS网易 谁是中国“移动游戏之王”？_新浪财经_新浪网\nDescription: 转自：前瞻产业研究院 · 移动游戏行业主要上市公司：腾讯控股(00700.HK);网易(09999.HK);哔哩哔哩(09626.HK);友谊时光(06820.HK);中手游(00302.HK);ST天润(002113.SZ);惠程科技(002168.SZ);游族网络(002174.SZ);天娱数科(002354.SZ);凯撒文化(002425...\nURL: https://finance.sina.com.cn/roll/2022-09-15/doc-imqqsmrn9194115.shtml\n\n\n\n让我查看一些有价值的文章内容：',
      type: 'END',
    },
  },
  {
    category: 'DeepThink',
    info: '正在执行: fetch',
    runId: '9',
    output: {
      data: '```json\n{"url": "https://www.21jingji.com/article/20240327/herald/a1e32b3c044c144ccfa60fa205c46ea1.html"}\n```\n\n\n\n\n',
      type: 'END',
    },
  },
  { category: 'DeepThink', info: '推理完成', runId: '10' },
  {
    category: 'DeepThink',
    info: '正在推理',
    runId: '11',
    output: {
      data: '\nError: Tool execution timed out after 30 seconds: fetch\n\n\n\n',
      type: 'END',
    },
  },
];
export default function CompactDemo() {
  return (
    <ThoughtChainList
      thoughtChainList={myThoughtChainData}
      compact={true}
      style={{ maxWidth: '500px' }}
    />
  );
}
````

### 复杂demo

<code src="./thought-chain-list/big.tsx" background="var(--main-bg-color)"  iframe="540"></code>
