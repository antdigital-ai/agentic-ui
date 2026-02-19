export const defaultValue = `<!-- {"MarkdownType": "report", "id": "demo-doc", "section_ids": "[1, 2, 3, 4, 5]"} -->
# Markdown 全功能技术文档优化版

## 1. 基础文本格式增强

### 1.1 文本样式扩展
\`\`\`markdown
普通文本  
**粗体文本**  
*斜体文本*  
~~删除线文本~~  
==高亮文本==  
\`行内代码\`  
H~2~O 下标  
x^2^ 上标  
> 引用文本  
[超链接](https://example.com)  
👉 特殊符号支持
\`\`\`

### 1.2 段落与列表优化
\`\`\`markdown
首行缩进可通过CSS实现，或使用特殊空格：  缩进文本

有序列表：
1. 一级项目
   1. 二级项目
   2. 二级项目
2. 一级项目

任务列表：
- [x] 已完成任务
- [ ] 待完成任务
\`\`\`

### 1.3 表情符号与图标
\`\`\`markdown
原生支持emoji：🚀 ✅ ❤️  
Font Awesome图标：:fa-solid fa-rocket:  
自定义图标：:custom-icon:
\`\`\`

## 2. 技术文档增强实现

### 2.1 复杂表格（合并单元格）

| 模块          | 功能                 | 版本支持   |
|---------------|----------------------|------------|
| 核心引擎      | 语法解析             | v1.0+      |
|               | 实时渲染             | v2.1+      |
| 扩展系统      | 插件管理             | v1.5+      |
|               | API网关             | v3.0+      |
| 协作功能      | 实时协同编辑         | v2.8+      |
|               | 版本历史             | v3.2+      |

### 2.2 数学公式支持

行内公式：$$E = mc^2$$

块级公式：
$$
\begin{bmatrix}
a & b \\
c & d
end{bmatrix}
\times
\begin{bmatrix}
x \\
y
end{bmatrix}
=
\begin{bmatrix}
ax + by \\
cx + dy
end{bmatrix}
$$

### 2.3 高级图表支持

\`\`\`mermaid
sequenceDiagram
    participant 用户
    participant 编辑器核心
    participant 语法分析器
    
    用户->>编辑器核心: 输入代码
    编辑器核心->>语法分析器: 请求语法解析
    语法分析器-->>编辑器核心: 返回Token流
    编辑器核心->>用户: 实时高亮显示
\`\`\`

### 2.4 交互式组件

\`\`\`react
// 可交互代码组件
function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>当前计数: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        增加
      </button>
    </div>
  );
}
\`\`\`

## 3. 文档结构化增强

### 3.1 多级目录生成

\`\`\`toc
[生成目录]
maxLevel: 3
\`\`\`

### 3.2 章节折叠

<details>
<summary>高级配置选项</summary>

\`\`\`yaml
# 编辑器配置示例
render:
  strategy: incremental
  maxLines: 10000
performance:
  workerCount: 4
  memoryLimit: 2GB
extensions:
  - name: lsp-client
    version: 2.3.1
  - name: git-integration
    version: 1.8.2
\`\`\`
</details>

### 3.3 注释与批注

这是主要内容[^comment]

[^comment]: 此处需要进一步验证性能数据

## 4. 多媒体集成增强

### 4.1 视频嵌入优化

![video:视频名](https://gw.alipayobjects.com/v/huamei_gcee1x/afts/video/A*NudQQry0ERwAAAAAAAAAAAAADtN3AQ)

![video:示例视频](https://gw.alipayobjects.com/v/huamei_gcee1x/afts/video/90LVRoQeGdkAAAAAAAAAAAAAK4eUAQBr)

### 4.1.1 附件展示
<!-- {"updateTime":"2014-07-29","collaborators":[{"Chen Shuai":33},{"Chen Shuai":33},{"Chen Shuai":33},{"Rui Ma":39},{"Rui Ma":39},{"Rui Ma":39},{"Chen Shuai":33},{"Rui Ma":39},{"ivan.cseeing":32},{"InvRet Sales Team":34},{"Chen Shuai":33},{"Rui Ma":39},{"Rui Ma":39},{"Chen Shuai":33},{"Rui Ma":39},{"Rui Ma":39},{"Chen Shuai":33}]} -->
![attachment:测试附件.pdf](https://gw.alipayobjects.com/v/huamei_gcee1x/afts/video/A*NudQQry0ERwAAAAAAAAAAAAADtN3AQ)


### 4.2 3D模型展示
\`\`\`model
format: glb
source: https://example.com/3d/editor.glb
camera:
  position: [0, 2, 5]
  target: [0, 0, 0]
\`\`\`

### 4.3 音频注释
\`\`\`audio
source: https://example.com/audio/note.mp3
title: 功能说明
\`\`\`

## 5. 文档协作与管理

### 5.1 版本对比
\`\`\`diff
// 代码变更示例
function calculate(a, b) {
-   return a + b;
+   return a * b;
}
\`\`\`

### 5.2 审阅流程

\`\`\`review
status: in-progress
reviewers:
  - name: 张三
    role: 技术主管
  - name: 李四
    role: 产品经理
deadline: 2023-12-31
\`\`\`

### 5.3 文档状态标记

| 文档章节     | 状态       | 负责人   |
|--------------|------------|----------|
| 核心架构     | ✅ 已完成   | 王工     |
| 扩展系统     | 🔄 进行中   | 张工     |
| 性能优化     | ⚠️ 待审核   | 李工     |
| 用户手册     | ❌ 未开始   | 待分配   |

## 6. 自动化文档工具

### 6.1 API文档生成
\`\`\`endpoint
method: GET
path: /api/v1/document/{id}
description: 获取文档内容
parameters:
  - name: id
    in: path
    required: true
    type: string
response:
  type: object
  properties:
    title: 
      type: string
    content:
      type: string
\`\`\`

### 6.2 数据可视化

<!-- [{"chartType": "bar","title":"样本数据", "x": "sens_type", "y": "count"},{"chartType": "column", "x": "sens_type", "y": "count"}, {"chartType": "pie", "x": "sens_type", "y": "percentage"}, {"chartType": "line", "x": "sens_type", "y": "percentage"},{"chartType": "area", "x": "sens_type", "y": "percentage"}] -->
|    | sens_type        |   count |   percentage |
|---:|:-----------------|--------:|-------------:|
|  0 | 12312322         |       4 |       2.439  |
|  1 | 邮箱             |      28 |      17.0732 |
|  2 | 身份证号2级      |       5 |       3.0488 |
|  3 | 姓名             |      26 |      15.8537 |
|  4 | 自定义-手机号01  |      41 |      25      |
|  5 | 性别             |       4 |       2.439  |
|  6 | 公司名           |       4 |       2.439  |
|  7 | 样本中英文       |       7 |       4.2683 |
|  8 | 正则中文         |       2 |       1.2195 |




## 7. 文档安全与权限

### 7.1 权限控制标记
\`\`\`permission
levels:
  - PUBLIC: 所有用户可见
  - INTERNAL: 仅内部成员可见
  - CONFIDENTIAL: 仅核心团队可见
\`\`\`

### 7.2 敏感数据标记
\`\`\`sensitive
creditCard: **** **** **** 1234
apiKey: sk_live_••••••••••••••••••••••••••••••
\`\`\`

## 8. 响应式设计支持

### 8.1 移动端适配
\`\`\`responsive
breakpoints:
  - viewport: < 768px
    components:
      - hide: sidebar
      - resize: text(90%)
  - viewport: < 480px
    components:
      - hide: footer
      - resize: images(80%)
\`\`\`

### 8.2 深色模式支持
\`\`\`theme
light:
  background: #ffffff
  text: #333333
dark:
  background: #1e1e1e
  text: #f0f0f0
\`\`\`

## 9. 文档分析工具

### 9.1 文档健康度
\`\`\`analysis
metrics:
  completeness: 85%
  freshness: 92% 
  brokenLinks: 2
  readability: Grade 10
\`\`\`

### 9.2 文档依赖图
\`\`\`dependencies
[核心架构] --> [扩展系统]
[扩展系统] --> [插件API]
[性能优化] --> [核心架构]
[用户手册] --> [所有模块]
\`\`\`

---

通过以上增强，现代技术文档可实现：
1. **动态交互** - 可执行代码、3D模型等
2. **智能分析** - 文档健康度评估
3. **多终端适配** - 响应式设计
4. **协作管理** - 版本控制与审阅流程
5. **安全管控** - 细粒度权限控制

> 最终文档应保持内容与技术深度的平衡，既展示完整功能，又不失专业性和可读性

`;
