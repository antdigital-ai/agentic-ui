/**
 * 官网首页文案多语言词典
 *
 * 仅服务于 home/ 营销首页（Dumi 文档站内嵌的 HomePage），
 * 与组件库自身的 src/I18n 体系相互独立，避免打包进产物。
 */

export type SiteLocale = 'zh-CN' | 'en-US';

export const siteZhCN = {
  common: {
    designStrategy: '设计策略',
    designPattern: '设计模式',
    designPrinciples: '设计原则',
    evaluationMetrics: '评估指标',
    introDescription:
      '用 AI 智能加速工作流程，同时保障过程准确、透明、可干预。',
    learnMore: '了解更多',
  },
  gallery: {
    caseReplay: '案例回放 CaseReplay',
    welcomeMessage: '欢迎语 WelcomeMessage',
    skillModeEntry: '技能入口 SkillModeEntry',
    promptTemplate: '提示词模版 PromptTemplate',
    promptCenter: '指令中心 PromptCenter',
    suggestedPrompts: '推荐指令 Suggested Prompts',
    audioInput: '语音输入',
    capabilityToggle: '能力开关 CapabilityToggle',
    contentBlockCitation: '内容块引用 Content Block Citation',
    imageAttachment: '图片附件',
    slotInput: '槽位输入',
    modelOptions: '模型选项',
    regenerate: '重新生成',
    openTextInput: '开放式文本输入',
    dataOwnership: '数据所有权告知',
    basicChart: '基础图表',
    codeBlock: '代码块',
    footer: '脚注 Footer',
    isUseful: '是否有用',
    markdownLayout: 'Markdown文档排版',
    multipleResults: '呈现多项结果',
    video: '视频',
    aiAbilityButton: 'AI 功能入口 AI AbilityButton',
    aiAssistant: 'AI 助理入口 AI Assistant',
    inlineAction: '内联菜单 InlineAction',
    aiCapabilityCard: 'AI 能力展示卡片 AI Capability Card',
  },
  hero: {
    badge: '蚂蚁数科一站式企业 Agent 应用',
    title: '让模糊，变精准',
    startButton: '开始使用',
  },
  nav: {
    home: '首页',
    pcComponents: 'PC 组件',
    showroom: '样板间',
    searchPlaceholder: '搜索内容',
    switchLanguage: '切换语言',
  },
  menu: {
    pcSectionTitle: 'PC 组件',
    components: '组件 Components',
    componentsDesc: '提供组件和开发接入指南',
    demo: '演示 Demo',
    demoDesc: '通过演示 demo 更快构建智能体产品',
    changelog: '更新日志 Changelog',
    designResources: '设计资源',
    visualManualTitle: '视觉风格手册',
    visualManualDesc: '提供 chatbot 、插图等视觉资源',
    componentLibTitle: '组件库设计资源',
    componentLibDesc: '提供设计组件库和 Agent 设计指南',
    iconLibrary: '图标库 Icon library',
    iconLibraryDesc: '图标库引用',
    iconDesignTitle: '图标设计资源',
    iconDesignDesc: '图标设计规范和资源',
    mobileComponents: 'Mobile 组件库设计资源',
    mobileComponentsDesc: '提供设计组件库和设计指南',
  },
  support: {
    sectionTitle: '支持你的设计',
    subtitlePrefix: '75个基础',
    subtitleSuffix: '设计范式',
    welcome: {
      title: '欢迎语',
      description: '通过简短友好的欢迎语引入使用场景',
      messageTitlePrefix: '我是',
      messageDescription: 'Agent 一站式设计与搭建解决方案',
    },
    suggestion: {
      title: '追问',
      description:
        '系统根据当前的对话上下文和用户的潜在意图，主动推荐后续问题。',
      exploreMore: '探索更多',
      items: [
        '关税对消费类基金的影响',
        '恒生科技指数基金相关新闻',
        '数据分析与可视化',
      ],
    },
    superInput: {
      title: '超级输入框',
      description:
        '用户与 AI 交互的核心入口，集成了文本、语音、图像等多种输入方式和拓展能力，通过实时解析和反馈，实现自然、高效的人机对话。',
      placeholder: '请输入问题...',
      voiceSegment: '语音片段',
      skills: {
        translate: '翻译',
        read: '阅读',
        chart: '图表',
        write: '写作',
        other: '其他',
      },
      deepThink: '深度思考',
      webSearch: '联网搜索',
      promptLibrary: '提示词库',
    },
    workspace: {
      title: '工作空间',
      description:
        '作为对话的辅助功能，工作空间用于预览和编辑 AI 进程或产出的内容，例如文档、代码、图表等详情。',
    },
    dialogFlow: {
      title: '对话流',
      description: '组织和展示完整对话历史，管理整个对话流的布局和滚动。',
    },
    manualCards: {
      oneTokenTitle: '未来设计系统 OneToken',
      oneTokenDesc: '设计语言跨组件库支持方案',
    },
    workspaceDemo: {
      title: '开发工作空间',
      realtimeTab: '实时跟随',
      taskListTab: '任务列表',
      deepThinkTitle: '深度思考',
      taskStopped: '任务已停止',
      tasks: [
        '创建全面的 Tesla 股票分析任务列表',
        '下载指定的Bilibili视频分集并确保唯一文件名',
        '提取下载的视频帧',
        '对提取的视频帧进行文字识别',
        '筛选掉OCR识别结果为乱码的图片',
        '报告结果并将Word文档发送给用户',
      ],
      browserTab: '浏览器',
      suggestions: [
        '搜索2025年稳定币市场规模数据',
        '搜索USDT USDC BUSD 最新发行量',
        '搜索全球主要司法管辖区稳定币监管政策动态 2025',
        '搜索最近3个月稳定币市场波动性数据',
      ],
      results: {
        r11: '2025年稳定币市场规模预测报告',
        r12: '全球稳定币市场分析',
        r13: '稳定币发展趋势',
        r21: 'USDT 和USDC 的总量达到了2050 亿美元— 2025 年稳定币发生了什么',
        r22: '全球usdt的总量有多少？ 2025年最新数据别被FUD带偏了-多特软件站',
        r23: '全球USDT目前发行的总量:2025年最新数据解析',
        r31: '2025年全球稳定币监管政策概览',
        r32: '主要司法管辖区稳定币法规',
        r33: '监管动态更新',
        r41: '近3个月稳定币波动性分析',
        r42: '市场数据报告',
        r43: '稳定币价格走势',
      },
      files: {
        projectPlan: '项目计划.txt',
        dataAnalysis: '数据分析.xlsx',
        techDoc: '技术文档.pdf',
        architecture: '系统架构图.png',
        apiDoc: '接口文档.md',
        configNote: '配置说明.html',
      },
      mdContent: `# 深度思考

## 问题分析

当前需要分析稳定币市场的发展趋势，主要关注以下几个方面：

1. **市场规模**：2025年稳定币市场的整体规模
2. **主要币种**：USDT、USDC、BUSD 等主流稳定币的发行量
3. **监管政策**：全球主要司法管辖区的监管动态
4. **市场波动**：最近3个月的市场波动性数据

## 执行策略

### 第一步：数据收集
- 搜索权威报告和数据分析
- 收集官方发行量数据
- 整理监管政策文件

### 第二步：数据分析
- 对比不同稳定币的发行趋势
- 分析监管政策对市场的影响
- 评估市场波动性指标

### 第三步：结论输出
- 生成综合分析报告
- 提供数据可视化图表
- 给出市场趋势预测`,
    },
    dialogFlowDemo: {
      userName: '用户',
      followUp: '这是第1条消息',
      assistantGreeting: `### 我是 Ant Design 聊天助手
可以帮你：

- **回答问题** - 解答技术相关疑问
- **代码示例** - 提供组件使用示例
- **设计建议** - 给出设计方案建议
- **文档说明** - 解释 API 和功能

你想了解什么呢？`,
      userRouteRequest: '帮我规划一条从长沙到重庆的高速路线',
      routeResponse: `这个任务会比较复杂，我会尽力完成。在开发过程中，我可能会向您请教一些具体细节或偏好。

让我为您规划从长沙到重庆的高速路线：

**推荐路线：**
1. **长沙 → 常德** (长张高速 G5513)
2. **常德 → 张家界** (长张高速 G5513)
3. **张家界 → 恩施** (张南高速 G5515)
4. **恩施 → 重庆** (沪渝高速 G50)

**总里程：** 约 650 公里
**预计时间：** 7-8 小时（不含休息）

**注意事项：**
- 山区路段较多，注意安全驾驶
- 建议在服务区适当休息
- 关注实时路况信息`,
      bubbleDoc: `## Bubble 组件功能文档

Bubble 组件是一个功能丰富的聊天气泡组件，支持：

- 多种消息类型（文本、文件、图片等）
- 自定义渲染配置
- 左右布局切换
- 文件附件展示

以下是相关的设计文档和示例图片：`,
    },
  },
  enhance: {
    sectionTitle: '提升你的设计',
    subtitlePrefix: '多模态输出',
    subtitleSuffix: '渲染方案',
    markdownExample: `# Markdown 富文本示例

## 支持的功能

- **粗体文本**
- *斜体文本*
- \`代码块\`
- [链接](https://example.com)

\`\`\`javascript
const example = "Markdown 富文本";
\`\`\`

## 更多功能

支持 XX 种 Markdown 标准语法标签，包括：

1. **标题**：支持 1-6 级标题
2. **列表**：有序列表和无序列表
3. **代码**：行内代码和代码块
4. **链接**：文本链接和图片链接
5. **表格**：支持表格渲染
6. **引用**：支持引用块

\`\`\`python
# Python 示例
def quick_sort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quick_sort(left) + middle + quick_sort(right)

print(quick_sort([3, 6, 8, 10, 1, 2, 1]))
\`\`\`

| 作品名称        | 在线地址   |  上线日期  |
| :--------  | :-----  | :----:  |
| 逍遥自在轩 | [https://niceshare.site](https://niceshare.site/?ref=markdown.lovejade.cn) |2024-04-26|
| 玉桃文飨轩 | [https://share.lovejade.cn](https://share.lovejade.cn/?ref=markdown.lovejade.cn) |2022-08-26|
| 缘知随心庭 | [https://fine.niceshare.site](https://fine.niceshare.site/?ref=markdown.lovejade.cn) |2022-02-26|
| 静轩之别苑 | [http://quickapp.lovejade.cn](http://quickapp.lovejade.cn/?ref=markdown.lovejade.cn) |2019-01-12|
| 晚晴幽草轩 | [https://www.jeffjade.com](https://www.jeffjade.com/?ref=markdown.lovejade.cn) |2014-09-20|
`,
    schemaExampleTitle: '动态柱状图使用示例',
    schemaData: `[
    { "category": "访客数据", "type": "本周访客", "x": 1, "y": 120, "xtitle": "日期", "ytitle": "访客数", "filterLabel": "全球" },
    { "category": "访客数据", "type": "本周访客", "x": 2, "y": 132, "xtitle": "日期", "ytitle": "访客数", "filterLabel": "全球" },
    { "category": "访客数据", "type": "本周访客", "x": 3, "y": 101, "xtitle": "日期", "ytitle": "访客数", "filterLabel": "全球" },
    { "category": "访客数据", "type": "本周访客", "x": 4, "y": 134, "xtitle": "日期", "ytitle": "访客数", "filterLabel": "全球" },
    { "category": "访客数据", "type": "本周访客", "x": 5, "y": 90, "xtitle": "日期", "ytitle": "访客数", "filterLabel": "全球" },
    { "category": "访客数据", "type": "本周访客", "x": 6, "y": 230, "xtitle": "日期", "ytitle": "访客数", "filterLabel": "全球" },
    { "category": "访客数据", "type": "本周访客", "x": 7, "y": 210, "xtitle": "日期", "ytitle": "访客数", "filterLabel": "全球" },
    { "category": "访客数据", "type": "上周访客", "x": 1, "y": 220, "xtitle": "日期", "ytitle": "访客数", "filterLabel": "全球" },
    { "category": "访客数据", "type": "上周访客", "x": 2, "y": 182, "xtitle": "日期", "ytitle": "访客数", "filterLabel": "全球" },
    { "category": "访客数据", "type": "上周访客", "x": 3, "y": 191, "xtitle": "日期", "ytitle": "访客数", "filterLabel": "全球" },
    { "category": "访客数据", "type": "上周访客", "x": 4, "y": 234, "xtitle": "日期", "ytitle": "访客数", "filterLabel": "全球" },
    { "category": "访客数据", "type": "上周访客", "x": 5, "y": 290, "xtitle": "日期", "ytitle": "访客数", "filterLabel": "全球" },
    { "category": "访客数据", "type": "上周访客", "x": 6, "y": 330, "xtitle": "日期", "ytitle": "访客数", "filterLabel": "全球" },
    { "category": "访客数据", "type": "上周访客", "x": 7, "y": 310, "xtitle": "日期", "ytitle": "访客数", "filterLabel": "全球" },
    { "category": "销售数据", "type": "本年销售额", "x": 1, "y": 85000, "xtitle": "季度", "ytitle": "销售额", "filterLabel": "全球" },
    { "category": "销售数据", "type": "本年销售额", "x": 2, "y": 92000, "xtitle": "季度", "ytitle": "销售额", "filterLabel": "全球" },
    { "category": "销售数据", "type": "本年销售额", "x": 3, "y": 88000, "xtitle": "季度", "ytitle": "销售额", "filterLabel": "全球" },
    { "category": "销售数据", "type": "本年销售额", "x": 4, "y": 105000, "xtitle": "季度", "ytitle": "销售额", "filterLabel": "全球" },
    { "category": "销售数据", "type": "去年销售额", "x": 1, "y": 72000, "xtitle": "季度", "ytitle": "销售额", "filterLabel": "全球" },
    { "category": "销售数据", "type": "去年销售额", "x": 2, "y": 78000, "xtitle": "季度", "ytitle": "销售额", "filterLabel": "全球" },
    { "category": "销售数据", "type": "去年销售额", "x": 3, "y": 81000, "xtitle": "季度", "ytitle": "销售额", "filterLabel": "全球" },
    { "category": "销售数据", "type": "去年销售额", "x": 4, "y": 89000, "xtitle": "季度", "ytitle": "销售额", "filterLabel": "全球" },
    { "category": "访客数据", "type": "本周访客", "x": 1, "y": 180, "xtitle": "日期", "ytitle": "访客数", "filterLabel": "美国" },
    { "category": "访客数据", "type": "本周访客", "x": 2, "y": 195, "xtitle": "日期", "ytitle": "访客数", "filterLabel": "美国" },
    { "category": "访客数据", "type": "本周访客", "x": 3, "y": 160, "xtitle": "日期", "ytitle": "访客数", "filterLabel": "美国" },
    { "category": "访客数据", "type": "本周访客", "x": 4, "y": 210, "xtitle": "日期", "ytitle": "访客数", "filterLabel": "美国" },
    { "category": "访客数据", "type": "本周访客", "x": 5, "y": 140, "xtitle": "日期", "ytitle": "访客数", "filterLabel": "美国" },
    { "category": "访客数据", "type": "本周访客", "x": 6, "y": 280, "xtitle": "日期", "ytitle": "访客数", "filterLabel": "美国" },
    { "category": "访客数据", "type": "本周访客", "x": 7, "y": 260, "xtitle": "日期", "ytitle": "访客数", "filterLabel": "美国" },
    { "category": "访客数据", "type": "上周访客", "x": 1, "y": 280, "xtitle": "日期", "ytitle": "访客数", "filterLabel": "美国" },
    { "category": "访客数据", "type": "上周访客", "x": 2, "y": 240, "xtitle": "日期", "ytitle": "访客数", "filterLabel": "美国" },
    { "category": "访客数据", "type": "上周访客", "x": 3, "y": 220, "xtitle": "日期", "ytitle": "访客数", "filterLabel": "美国" },
    { "category": "访客数据", "type": "上周访客", "x": 4, "y": 290, "xtitle": "日期", "ytitle": "访客数", "filterLabel": "美国" },
    { "category": "访客数据", "type": "上周访客", "x": 5, "y": 350, "xtitle": "日期", "ytitle": "访客数", "filterLabel": "美国" },
    { "category": "访客数据", "type": "上周访客", "x": 6, "y": 390, "xtitle": "日期", "ytitle": "访客数", "filterLabel": "美国" },
    { "category": "访客数据", "type": "上周访客", "x": 7, "y": 370, "xtitle": "日期", "ytitle": "访客数", "filterLabel": "美国" },
    { "category": "销售数据", "type": "本年销售额", "x": 1, "y": 95000, "xtitle": "季度", "ytitle": "销售额", "filterLabel": "美国" },
    { "category": "销售数据", "type": "本年销售额", "x": 2, "y": 102000, "xtitle": "季度", "ytitle": "销售额", "filterLabel": "美国" },
    { "category": "销售数据", "type": "本年销售额", "x": 3, "y": 98000, "xtitle": "季度", "ytitle": "销售额", "filterLabel": "美国" },
    { "category": "销售数据", "type": "本年销售额", "x": 4, "y": 115000, "xtitle": "季度", "ytitle": "销售额", "filterLabel": "美国" },
    { "category": "销售数据", "type": "去年销售额", "x": 1, "y": 82000, "xtitle": "季度", "ytitle": "销售额", "filterLabel": "美国" },
    { "category": "销售数据", "type": "去年销售额", "x": 2, "y": 88000, "xtitle": "季度", "ytitle": "销售额", "filterLabel": "美国" },
    { "category": "销售数据", "type": "去年销售额", "x": 3, "y": 91000, "xtitle": "季度", "ytitle": "销售额", "filterLabel": "美国" },
    { "category": "销售数据", "type": "去年销售额", "x": 4, "y": 99000, "xtitle": "季度", "ytitle": "销售额", "filterLabel": "美国" }
]`,
    tabs: {
      markdown: {
        label: 'Markdown 渲染规范',
        description: '支持标准 Markdown 和 GFM 全部语法，公式图脚注完美渲染',
      },
      schema: {
        label: 'SchemaJson 图表渲染',
        description: 'JSON 配置生成可视化图表',
      },
      canvas: {
        label: 'MultiCanvas 扩展画布',
        description: 'AI 生成内容的多模态协同与预览空间',
        workspaceTitle: '流程画布',
        flowTab: '流程图',
        renderError: '渲染失败',
        mermaidContent: `flowchart TD
    A[开始] --> B[知识查询]
    B -->|有结果| C[回答]
    B -->|无结果| D[回答]
    C --> E[结束]`,
      },
      card: {
        label: 'Card 行业卡片',
        description: '行业标准卡片快速验证方案',
      },
    },
    cardDemo: {
      btnText: '查看详细对比',
      modalTitle: '详细对比',
      modalHeading: '产品对比详情',
      mockData: {
        cardId: 'compare-card-001',
        productInfos: [
          {
            productName: '嘉裕稳进14月持有',
            tags: ['银保监会批准', '私募牌照'],
          },
          {
            productName: '兴动智享1年5号',
            tags: ['基金销售牌照'],
          },
        ],
        mainCompareIndicatorList: [
          {
            indicatorName: '产品类型',
            leftValue: '中低风险封闭式理财',
            rightValue: '长期储蓄+保障功能',
          },
          {
            indicatorName: '发行机构',
            leftValue: '商业银行',
            rightValue: '商业银行',
          },
          {
            indicatorName: '起购金额',
            leftValue: '10,000 元',
            rightValue: '5,000 元',
          },
          {
            indicatorName: '投资期限',
            leftValue: '3-6 个月',
            rightValue: '12 个月',
          },
          {
            indicatorName: '预期年化收益',
            leftValue: '0.3-0.6 %',
            rightValue: '0.3-0.65 %',
          },
          {
            indicatorName: '风险等级',
            leftValue: 'R2 (中低风险)',
            rightValue: 'R3 (中风险)',
          },
        ],
        totalCompareIndicatorList: [
          {
            indicatorName: '产品类型',
            leftValue: '中低风险封闭式理财',
            rightValue: '长期储蓄+保障功能',
          },
          {
            indicatorName: '发行机构',
            leftValue: '商业银行',
            rightValue: '商业银行',
          },
          {
            indicatorName: '起购金额',
            leftValue: '10,000 元',
            rightValue: '5,000 元',
          },
          {
            indicatorName: '投资期限',
            leftValue: '3-6 个月',
            rightValue: '12 个月',
          },
          {
            indicatorName: '预期年化收益',
            leftValue: '0.3-0.6 %',
            rightValue: '0.3-0.65 %',
          },
          {
            indicatorName: '风险等级',
            leftValue: 'R2 (中低风险)',
            rightValue: 'R3 (中风险)',
          },
        ],
      },
    },
  },
  showroom: {
    subtitle: '快速开始你的设计',
    titlePrefix: '行业设计',
    titleHighlight: '样板间',
    comingSoonTitle: '敬请期待',
    comingSoonText: '即将到来',
  },
  chatbot: {
    subtitle: '自定义你的 AI 形象',
    dressingLabel: '个性装扮',
    dressingLabelEn: 'Dressing',
    skinLabel: '肤色',
    skinLabelEn: 'Skin',
  },
  features: {
    intro: {
      label: 'intro.设计原则',
      title: ['intro.', '智能增效，精准可控'],
      description: 'Tob Agent 体验核心设计策略',
      subFeatures: [
        '主动预判，精准预期',
        '高效互动，透明可控',
        '信息精准，专业表达',
        '读懂环境，无缝融入',
        '智能可感，精准赋能',
      ],
    },
    f01: {
      label: '01.精准预期',
      title: ['01.', '主动预判，精准预期'],
      description: '对话启动与意图确立，边界的精准是信任的基石',
      subFeatures: [
        '可理解性',
        '引导有效性',
        '开始前-能力边界透明度',
        '使用后-期望符合度',
      ],
    },
    f02: {
      label: '02.精准理解和控制',
      title: ['02.', '高效互动，透明可控'],
      description: '意图表达与澄清阶段，意图与执行的精准对齐',
      subFeatures: [
        '交互轮次',
        '决策成本',
        '输入便捷度',
        '过程透明度',
        '过程修正便捷度',
        '结果修正便捷度',
      ],
    },
    f03: {
      label: '03.精准交付',
      title: ['03.', '信息精准，专业表达'],
      description: 'AI生成结果的精确性与易读性',
      subFeatures: ['准确性', '专业度', '视觉层级清晰度', '行文易读性'],
    },
    f04: {
      label: '04.精准协同',
      title: ['04.', '读懂环境，无缝融入'],
      description: '集成的精准是流程的保障',
      subFeatures: ['唤醒便捷度与场景化', '结果的可操作性'],
    },
    f05: {
      label: '05.精准赋能',
      title: ['05.', '智能可感，精准赋能'],
      description: 'AI 能力是否有效解决场景痛点',
      subFeatures: ['任务提效感知度', '行业特性/产品特色显著度', '视觉智能感'],
    },
  },
};

export type SiteMessages = typeof siteZhCN;

export const siteEnUS: SiteMessages = {
  common: {
    designStrategy: 'Design Strategy',
    designPattern: 'Design Patterns',
    designPrinciples: 'Design Principles',
    evaluationMetrics: 'Evaluation Metrics',
    introDescription:
      'Accelerate workflows with AI while keeping the process accurate, transparent and controllable.',
    learnMore: 'Learn More',
  },
  gallery: {
    caseReplay: 'CaseReplay',
    welcomeMessage: 'WelcomeMessage',
    skillModeEntry: 'SkillModeEntry',
    promptTemplate: 'PromptTemplate',
    promptCenter: 'PromptCenter',
    suggestedPrompts: 'Suggested Prompts',
    audioInput: 'Voice Input',
    capabilityToggle: 'CapabilityToggle',
    contentBlockCitation: 'Content Block Citation',
    imageAttachment: 'Image Attachment',
    slotInput: 'Slot Input',
    modelOptions: 'Model Options',
    regenerate: 'Regenerate',
    openTextInput: 'Open Text Input',
    dataOwnership: 'Data Ownership Notice',
    basicChart: 'Basic Chart',
    codeBlock: 'Code Block',
    footer: 'Footer',
    isUseful: 'Helpful?',
    markdownLayout: 'Markdown Layout',
    multipleResults: 'Multiple Results',
    video: 'Video',
    aiAbilityButton: 'AI AbilityButton',
    aiAssistant: 'AI Assistant',
    inlineAction: 'InlineAction',
    aiCapabilityCard: 'AI Capability Card',
  },
  hero: {
    badge: 'One-stop Enterprise Agent Applications by Ant Digital',
    title: 'From Ambiguity to Precision',
    startButton: 'Get Started',
  },
  nav: {
    home: 'Home',
    pcComponents: 'Components',
    showroom: 'Showroom',
    searchPlaceholder: 'Search',
    switchLanguage: 'Switch language',
  },
  menu: {
    pcSectionTitle: 'PC Components',
    components: 'Components',
    componentsDesc: 'Component library and integration guide',
    demo: 'Demos',
    demoDesc: 'Build agent products faster with live demos',
    changelog: 'Changelog',
    designResources: 'Design Resources',
    visualManualTitle: 'Visual Style Manual',
    visualManualDesc: 'Chatbot, illustration and visual assets',
    componentLibTitle: 'Component Library Resources',
    componentLibDesc: 'Design components and Agent design guide',
    iconLibrary: 'Icon Library',
    iconLibraryDesc: 'Icon library reference',
    iconDesignTitle: 'Icon Design Resources',
    iconDesignDesc: 'Icon design guidelines and assets',
    mobileComponents: 'Mobile Component Resources',
    mobileComponentsDesc: 'Design components and guidelines',
  },
  support: {
    sectionTitle: 'Support Your Design',
    subtitlePrefix: '75 Basic',
    subtitleSuffix: 'Design Paradigms',
    welcome: {
      title: 'Welcome Message',
      description: 'Introduce use scenarios with short, friendly greetings',
      messageTitlePrefix: 'I am',
      messageDescription: 'One-stop Agent design and building solution',
    },
    suggestion: {
      title: 'Follow-up Suggestions',
      description:
        'The system proactively recommends follow-up questions based on the conversation context and user intent.',
      exploreMore: 'Explore more',
      items: [
        'Impact of tariffs on consumer funds',
        'Hang Seng Tech Index fund news',
        'Data analysis and visualization',
      ],
    },
    superInput: {
      title: 'Super Input',
      description:
        'The core entry for user-AI interaction, integrating text, voice, image and other input capabilities with real-time parsing and feedback for natural, efficient conversations.',
      placeholder: 'Ask a question...',
      voiceSegment: 'Voice segment',
      skills: {
        translate: 'Translate',
        read: 'Read',
        chart: 'Chart',
        write: 'Write',
        other: 'More',
      },
      deepThink: 'Deep Think',
      webSearch: 'Web Search',
      promptLibrary: 'Prompt Library',
    },
    workspace: {
      title: 'Workspace',
      description:
        'As an auxiliary panel of the conversation, the workspace previews and edits content produced or processed by AI, such as documents, code and charts.',
    },
    dialogFlow: {
      title: 'Dialog Flow',
      description:
        'Organize and present the full conversation history, managing layout and scrolling of the whole flow.',
    },
    manualCards: {
      oneTokenTitle: 'Future Design System OneToken',
      oneTokenDesc: 'Cross-library design language support',
    },
    workspaceDemo: {
      title: 'Dev Workspace',
      realtimeTab: 'Realtime',
      taskListTab: 'Task List',
      deepThinkTitle: 'Deep Thinking',
      taskStopped: 'Task stopped',
      tasks: [
        'Create a comprehensive Tesla stock analysis task list',
        'Download specific Bilibili video episodes with unique file names',
        'Extract frames from downloaded videos',
        'Run text recognition on extracted video frames',
        'Filter out images with garbled OCR results',
        'Report results and send the Word document to the user',
      ],
      browserTab: 'Browser',
      suggestions: [
        'Search 2025 stablecoin market size data',
        'Search latest USDT USDC BUSD circulation',
        'Search stablecoin regulatory updates 2025 by jurisdiction',
        'Search stablecoin market volatility data of the last 3 months',
      ],
      results: {
        r11: '2025 Stablecoin Market Size Forecast Report',
        r12: 'Global Stablecoin Market Analysis',
        r13: 'Stablecoin Development Trends',
        r21: 'USDT and USDC total supply reached 205 billion USD — what happened to stablecoins in 2025',
        r22: 'What is the total global USDT supply? Latest 2025 data, do not be misled by FUD',
        r23: 'Current global USDT circulation: 2025 latest data analysis',
        r31: '2025 Global Stablecoin Regulatory Policy Overview',
        r32: 'Stablecoin Regulations in Major Jurisdictions',
        r33: 'Regulatory Updates',
        r41: 'Stablecoin Volatility Analysis of the Last 3 Months',
        r42: 'Market Data Report',
        r43: 'Stablecoin Price Trends',
      },
      files: {
        projectPlan: 'Project Plan.txt',
        dataAnalysis: 'Data Analysis.xlsx',
        techDoc: 'Technical Doc.pdf',
        architecture: 'Architecture.png',
        apiDoc: 'API Doc.md',
        configNote: 'Config Notes.html',
      },
      mdContent: `# Deep Thinking

## Problem Analysis

Analyzing the development trends of the stablecoin market, focusing on:

1. **Market size**: overall scale of the 2025 stablecoin market
2. **Major tokens**: circulation of USDT, USDC, BUSD and other leading stablecoins
3. **Regulation**: regulatory updates across major jurisdictions
4. **Volatility**: market volatility data of the last 3 months

## Execution Strategy

### Step 1: Data Collection
- Search authoritative reports and data analysis
- Collect official circulation data
- Compile regulatory policy documents

### Step 2: Data Analysis
- Compare issuance trends of different stablecoins
- Analyze the impact of regulation on the market
- Evaluate market volatility indicators

### Step 3: Conclusion
- Generate a comprehensive analysis report
- Provide data visualization charts
- Deliver market trend forecasts`,
    },
    dialogFlowDemo: {
      userName: 'User',
      followUp: 'This is the first message',
      assistantGreeting: `### I am the Ant Design Chat Assistant
I can help you with:

- **Answering questions** - resolving technical questions
- **Code examples** - component usage samples
- **Design advice** - design solution suggestions
- **Documentation** - explaining APIs and features

What would you like to know?`,
      userRouteRequest:
        'Help me plan a highway route from Changsha to Chongqing',
      routeResponse: `This task is fairly complex, but I will do my best. Along the way I may ask you for specific details or preferences.

Here is the planned highway route from Changsha to Chongqing:

**Recommended route:**
1. **Changsha → Changde** (Chang-Zhang Expressway G5513)
2. **Changde → Zhangjiajie** (Chang-Zhang Expressway G5513)
3. **Zhangjiajie → Enshi** (Zhang-Nan Expressway G5515)
4. **Enshi → Chongqing** (Hu-Yu Expressway G50)

**Total distance:** about 650 km
**Estimated time:** 7-8 hours (excluding breaks)

**Notes:**
- Many mountain road sections, drive safely
- Take proper rests at service areas
- Watch for real-time traffic updates`,
      bubbleDoc: `## Bubble Component Documentation

The Bubble component is a feature-rich chat bubble component that supports:

- Multiple message types (text, files, images and more)
- Custom rendering configuration
- Left/right layout switching
- File attachment display

Below are the related design documents and sample images:`,
    },
  },
  enhance: {
    sectionTitle: 'Enhance Your Design',
    markdownExample: `# Markdown Rich Text Example

## Supported Features

- **Bold text**
- *Italic text*
- \`Code blocks\`
- [Links](https://example.com)

\`\`\`javascript
const example = "Markdown rich text";
\`\`\`

## More Features

Supports XX standard Markdown syntax tags, including:

1. **Headings**: levels 1-6
2. **Lists**: ordered and unordered lists
3. **Code**: inline code and code blocks
4. **Links**: text links and image links
5. **Tables**: table rendering
6. **Quotes**: blockquotes

\`\`\`python
# Python example
def quick_sort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quick_sort(left) + middle + quick_sort(right)

print(quick_sort([3, 6, 8, 10, 1, 2, 1]))
\`\`\`

| Title        | Online Address   |  Launch Date  |
| :--------  | :-----  | :----:  |
| 逍遥自在轩 | [https://niceshare.site](https://niceshare.site/?ref=markdown.lovejade.cn) |2024-04-26|
| 玉桃文飨轩 | [https://share.lovejade.cn](https://share.lovejade.cn/?ref=markdown.lovejade.cn) |2022-08-26|
| 缘知随心庭 | [https://fine.niceshare.site](https://fine.niceshare.site/?ref=markdown.lovejade.cn) |2022-02-26|
| 静轩之别苑 | [http://quickapp.lovejade.cn](http://quickapp.lovejade.cn/?ref=markdown.lovejade.cn) |2019-01-12|
| 晚晴幽草轩 | [https://www.jeffjade.com](https://www.jeffjade.com/?ref=markdown.lovejade.cn) |2014-09-20|
`,
    schemaExampleTitle: 'Dynamic Bar Chart Example',
    schemaData: `[
    { "category": "Visitors", "type": "This week", "x": 1, "y": 120, "xtitle": "Date", "ytitle": "Visitors", "filterLabel": "Global" },
    { "category": "Visitors", "type": "This week", "x": 2, "y": 132, "xtitle": "Date", "ytitle": "Visitors", "filterLabel": "Global" },
    { "category": "Visitors", "type": "This week", "x": 3, "y": 101, "xtitle": "Date", "ytitle": "Visitors", "filterLabel": "Global" },
    { "category": "Visitors", "type": "This week", "x": 4, "y": 134, "xtitle": "Date", "ytitle": "Visitors", "filterLabel": "Global" },
    { "category": "Visitors", "type": "This week", "x": 5, "y": 90, "xtitle": "Date", "ytitle": "Visitors", "filterLabel": "Global" },
    { "category": "Visitors", "type": "This week", "x": 6, "y": 230, "xtitle": "Date", "ytitle": "Visitors", "filterLabel": "Global" },
    { "category": "Visitors", "type": "This week", "x": 7, "y": 210, "xtitle": "Date", "ytitle": "Visitors", "filterLabel": "Global" },
    { "category": "Visitors", "type": "Last week", "x": 1, "y": 220, "xtitle": "Date", "ytitle": "Visitors", "filterLabel": "Global" },
    { "category": "Visitors", "type": "Last week", "x": 2, "y": 182, "xtitle": "Date", "ytitle": "Visitors", "filterLabel": "Global" },
    { "category": "Visitors", "type": "Last week", "x": 3, "y": 191, "xtitle": "Date", "ytitle": "Visitors", "filterLabel": "Global" },
    { "category": "Visitors", "type": "Last week", "x": 4, "y": 234, "xtitle": "Date", "ytitle": "Visitors", "filterLabel": "Global" },
    { "category": "Visitors", "type": "Last week", "x": 5, "y": 290, "xtitle": "Date", "ytitle": "Visitors", "filterLabel": "Global" },
    { "category": "Visitors", "type": "Last week", "x": 6, "y": 330, "xtitle": "Date", "ytitle": "Visitors", "filterLabel": "Global" },
    { "category": "Visitors", "type": "Last week", "x": 7, "y": 310, "xtitle": "Date", "ytitle": "Visitors", "filterLabel": "Global" },
    { "category": "Sales", "type": "This year", "x": 1, "y": 85000, "xtitle": "Quarter", "ytitle": "Sales", "filterLabel": "Global" },
    { "category": "Sales", "type": "This year", "x": 2, "y": 92000, "xtitle": "Quarter", "ytitle": "Sales", "filterLabel": "Global" },
    { "category": "Sales", "type": "This year", "x": 3, "y": 88000, "xtitle": "Quarter", "ytitle": "Sales", "filterLabel": "Global" },
    { "category": "Sales", "type": "This year", "x": 4, "y": 105000, "xtitle": "Quarter", "ytitle": "Sales", "filterLabel": "Global" },
    { "category": "Sales", "type": "Last year", "x": 1, "y": 72000, "xtitle": "Quarter", "ytitle": "Sales", "filterLabel": "Global" },
    { "category": "Sales", "type": "Last year", "x": 2, "y": 78000, "xtitle": "Quarter", "ytitle": "Sales", "filterLabel": "Global" },
    { "category": "Sales", "type": "Last year", "x": 3, "y": 81000, "xtitle": "Quarter", "ytitle": "Sales", "filterLabel": "Global" },
    { "category": "Sales", "type": "Last year", "x": 4, "y": 89000, "xtitle": "Quarter", "ytitle": "Sales", "filterLabel": "Global" },
    { "category": "Visitors", "type": "This week", "x": 1, "y": 180, "xtitle": "Date", "ytitle": "Visitors", "filterLabel": "US" },
    { "category": "Visitors", "type": "This week", "x": 2, "y": 195, "xtitle": "Date", "ytitle": "Visitors", "filterLabel": "US" },
    { "category": "Visitors", "type": "This week", "x": 3, "y": 160, "xtitle": "Date", "ytitle": "Visitors", "filterLabel": "US" },
    { "category": "Visitors", "type": "This week", "x": 4, "y": 210, "xtitle": "Date", "ytitle": "Visitors", "filterLabel": "US" },
    { "category": "Visitors", "type": "This week", "x": 5, "y": 140, "xtitle": "Date", "ytitle": "Visitors", "filterLabel": "US" },
    { "category": "Visitors", "type": "This week", "x": 6, "y": 280, "xtitle": "Date", "ytitle": "Visitors", "filterLabel": "US" },
    { "category": "Visitors", "type": "This week", "x": 7, "y": 260, "xtitle": "Date", "ytitle": "Visitors", "filterLabel": "US" },
    { "category": "Visitors", "type": "Last week", "x": 1, "y": 280, "xtitle": "Date", "ytitle": "Visitors", "filterLabel": "US" },
    { "category": "Visitors", "type": "Last week", "x": 2, "y": 240, "xtitle": "Date", "ytitle": "Visitors", "filterLabel": "US" },
    { "category": "Visitors", "type": "Last week", "x": 3, "y": 220, "xtitle": "Date", "ytitle": "Visitors", "filterLabel": "US" },
    { "category": "Visitors", "type": "Last week", "x": 4, "y": 290, "xtitle": "Date", "ytitle": "Visitors", "filterLabel": "US" },
    { "category": "Visitors", "type": "Last week", "x": 5, "y": 350, "xtitle": "Date", "ytitle": "Visitors", "filterLabel": "US" },
    { "category": "Visitors", "type": "Last week", "x": 6, "y": 390, "xtitle": "Date", "ytitle": "Visitors", "filterLabel": "US" },
    { "category": "Visitors", "type": "Last week", "x": 7, "y": 370, "xtitle": "Date", "ytitle": "Visitors", "filterLabel": "US" },
    { "category": "Sales", "type": "This year", "x": 1, "y": 95000, "xtitle": "Quarter", "ytitle": "Sales", "filterLabel": "US" },
    { "category": "Sales", "type": "This year", "x": 2, "y": 102000, "xtitle": "Quarter", "ytitle": "Sales", "filterLabel": "US" },
    { "category": "Sales", "type": "This year", "x": 3, "y": 98000, "xtitle": "Quarter", "ytitle": "Sales", "filterLabel": "US" },
    { "category": "Sales", "type": "This year", "x": 4, "y": 115000, "xtitle": "Quarter", "ytitle": "Sales", "filterLabel": "US" },
    { "category": "Sales", "type": "Last year", "x": 1, "y": 82000, "xtitle": "Quarter", "ytitle": "Sales", "filterLabel": "US" },
    { "category": "Sales", "type": "Last year", "x": 2, "y": 88000, "xtitle": "Quarter", "ytitle": "Sales", "filterLabel": "US" },
    { "category": "Sales", "type": "Last year", "x": 3, "y": 91000, "xtitle": "Quarter", "ytitle": "Sales", "filterLabel": "US" },
    { "category": "Sales", "type": "Last year", "x": 4, "y": 99000, "xtitle": "Quarter", "ytitle": "Sales", "filterLabel": "US" }
]`,
    subtitlePrefix: 'Multimodal Output',
    subtitleSuffix: 'Rendering',
    tabs: {
      markdown: {
        label: 'Markdown Rendering',
        description:
          'Full support for standard Markdown and GFM, with formulas, charts and footnotes',
      },
      schema: {
        label: 'SchemaJson Charts',
        description: 'Generate visual charts from JSON configuration',
      },
      canvas: {
        label: 'MultiCanvas',
        description:
          'Multimodal collaboration and preview space for AI content',
        workspaceTitle: 'Flow Canvas',
        flowTab: 'Flowchart',
        renderError: 'Rendering failed',
        mermaidContent: `flowchart TD
    A[Start] --> B[Knowledge Query]
    B -->|With results| C[Answer]
    B -->|Without results| D[Answer]
    C --> E[End]`,
      },
      card: {
        label: 'Industry Cards',
        description: 'Ready-to-use industry card templates',
      },
    },
    cardDemo: {
      btnText: 'View Detailed Comparison',
      modalTitle: 'Detailed Comparison',
      modalHeading: 'Product Comparison Details',
      mockData: {
        cardId: 'compare-card-001',
        productInfos: [
          {
            productName: 'Jiayu Steady 14-Month Holding',
            tags: ['CBIRC Approved', 'Private Fund License'],
          },
          {
            productName: 'Xingdong Zhixiang 1-Year No.5',
            tags: ['Fund Sales License'],
          },
        ],
        mainCompareIndicatorList: [
          {
            indicatorName: 'Product Type',
            leftValue: 'Low-medium risk closed-end wealth management',
            rightValue: 'Long-term savings + protection',
          },
          {
            indicatorName: 'Issuer',
            leftValue: 'Commercial Bank',
            rightValue: 'Commercial Bank',
          },
          {
            indicatorName: 'Minimum Investment',
            leftValue: '10,000 CNY',
            rightValue: '5,000 CNY',
          },
          {
            indicatorName: 'Investment Term',
            leftValue: '3-6 months',
            rightValue: '12 months',
          },
          {
            indicatorName: 'Expected Annual Return',
            leftValue: '0.3-0.6 %',
            rightValue: '0.3-0.65 %',
          },
          {
            indicatorName: 'Risk Level',
            leftValue: 'R2 (Low-medium risk)',
            rightValue: 'R3 (Medium risk)',
          },
        ],
        totalCompareIndicatorList: [
          {
            indicatorName: 'Product Type',
            leftValue: 'Low-medium risk closed-end wealth management',
            rightValue: 'Long-term savings + protection',
          },
          {
            indicatorName: 'Issuer',
            leftValue: 'Commercial Bank',
            rightValue: 'Commercial Bank',
          },
          {
            indicatorName: 'Minimum Investment',
            leftValue: '10,000 CNY',
            rightValue: '5,000 CNY',
          },
          {
            indicatorName: 'Investment Term',
            leftValue: '3-6 months',
            rightValue: '12 months',
          },
          {
            indicatorName: 'Expected Annual Return',
            leftValue: '0.3-0.6 %',
            rightValue: '0.3-0.65 %',
          },
          {
            indicatorName: 'Risk Level',
            leftValue: 'R2 (Low-medium risk)',
            rightValue: 'R3 (Medium risk)',
          },
        ],
      },
    },
  },
  showroom: {
    subtitle: 'Start Your Design Quickly',
    titlePrefix: 'Industry Design',
    titleHighlight: 'Showroom',
    comingSoonTitle: 'Coming Soon',
    comingSoonText: 'Stay Tuned',
  },
  chatbot: {
    subtitle: 'Customize Your AI Avatar',
    dressingLabel: 'Dressing',
    dressingLabelEn: 'Dressing',
    skinLabel: 'Skin',
    skinLabelEn: 'Skin',
  },
  features: {
    intro: {
      label: 'intro.Principles',
      title: ['intro.', 'Augmented Intelligence, Precisely Controlled'],
      description: 'Core design strategy of Tob Agent experience',
      subFeatures: [
        'Proactive anticipation, precise expectations',
        'Efficient interaction, transparent control',
        'Precise information, professional expression',
        'Context awareness, seamless integration',
        'Perceivable intelligence, precise enablement',
      ],
    },
    f01: {
      label: '01.Precise Expectation',
      title: ['01.', 'Proactive Anticipation, Precise Expectations'],
      description:
        'Conversation start and intent establishment; precise boundaries build trust',
      subFeatures: [
        'Understandability',
        'Guidance effectiveness',
        'Capability boundary transparency (before)',
        'Expectation match (after use)',
      ],
    },
    f02: {
      label: '02.Precise Understanding & Control',
      title: ['02.', 'Efficient Interaction, Transparent Control'],
      description:
        'Intent expression and clarification; aligning intent with execution',
      subFeatures: [
        'Interaction turns',
        'Decision cost',
        'Input convenience',
        'Process transparency',
        'In-process correction convenience',
        'Result correction convenience',
      ],
    },
    f03: {
      label: '03.Precise Delivery',
      title: ['03.', 'Precise Information, Professional Expression'],
      description: 'Accuracy and readability of AI-generated results',
      subFeatures: [
        'Accuracy',
        'Professionalism',
        'Visual hierarchy clarity',
        'Readability',
      ],
    },
    f04: {
      label: '04.Precise Collaboration',
      title: ['04.', 'Context Awareness, Seamless Integration'],
      description: 'Precision of integration safeguards the workflow',
      subFeatures: [
        'Wake-up convenience and context awareness',
        'Actionability of results',
      ],
    },
    f05: {
      label: '05.Precise Enablement',
      title: ['05.', 'Perceivable Intelligence, Precise Enablement'],
      description:
        'Whether AI capabilities effectively solve scenario pain points',
      subFeatures: [
        'Task efficiency perception',
        'Industry/product distinctiveness',
        'Visual sense of intelligence',
      ],
    },
  },
};

export const siteLocales: Record<SiteLocale, SiteMessages> = {
  'zh-CN': siteZhCN,
  'en-US': siteEnUS,
};
