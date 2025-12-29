import {
  parserMdToSchema,
  parserSlateNodeToMarkdown,
} from '@ant-design/agentic-ui';
import { expect, it } from 'vitest';

const input = `<!-- {"MarkdownType": "report", "id": "8", "section_ids": " [15, 16, 17] "} -->
# Umi 研究报告

<!-- {"MarkdownType": "section", "id": "15" } -->
## html

<font color="red">Umi 科技（深圳）有限公司</font>


<font color=#FE0300>哈哈哈</font>



<sup>1</sup>


<sub>Umi 科技（深圳）有限公司</sub>


#  <font color=#FE0300>*我是一个正经人*</font>

##  <font color=#70AD48>*我是一个正经人*</font>

###  <font color=#F6CCAC>*我是一个正经人*</font>

[知乎](https://www.zhihu.com/favicon.ico?x-oss-process=image%2Fquality%2Cq_10)

[<font color="red">知乎</font>](https://www.zhihu.com/favicon.ico?x-oss-process=image%2Fquality%2Cq_10)


Description: <strong>Full-Year 2024 Diluted EPS Up 24% to 15.88 and Adjusted Diluted EPS Up 9% to 13.17</strong> Expects 2025 To Be Another Year of Positive Revenue Growth for Crocs, Inc., Led by the Crocs Brand Upsizes Share Repurchase Authorization by 1 Billion Resulting in Total Authorization Outstanding of Approximately ...

<html><table><tbody><tr><td>序号</td><td>问题</td><td>答案</td></tr><tr><td>0.0</td><td>世界上最小的鸟是什么?</td><td>蜂鸟（Hummingbird）。蜂鸟是世界上最小的鸟类，其中最小的种类是蜂鸟科中的蜂鸟属（Melli</td></tr><tr><td>1.0</td><td>地球上最高的山峰是哪座?</td><td>珠穆朗玛峰（Mount Everest）。珠穆朗玛峰位于喜马拉雅山脉，海拔8848.86米，是地球上最</td></tr><tr><td>2.0</td><td>哪种动物的睡眠时间最长?</td><td>考拉（Koala）。考拉每天大约睡18-22小时，是已知睡眠时间最长的动物之一。</td></tr></tbody></table></html>



# 现代代码编辑器技术解析与实现示例

## 1. 编辑器核心功能架构
### 1.1 基础功能模块
- 文本处理系统
  - 行缓冲区管理
  - 字符编码转换
  - 撤销/重做堆栈
- 用户界面组件
  - 多标签页管理
  - 分屏视图
  - 状态栏集成

### 1.2 高级功能实现
- 智能代码补全
- 实时语法检查
- 版本控制集成
- 插件扩展系统

---

## 2. 关键技术方案对比

| 技术方向       | 实现方案                | 优点                 | 缺点                  |
|----------------|-------------------------|----------------------|-----------------------|
| 语法高亮       | 正则表达式匹配          | 实现简单             | 性能较差              |
|                | 语法树分析              | 高准确性             | 实现复杂              |
| 文件管理       | 内存映射文件            | 大文件处理优势       | 内存消耗较大          |
|                | 分块加载机制            | 内存效率高           | 需要复杂索引          |
| 渲染引擎       | Canvas 绘制             | 高性能渲染           | 兼容性要求高          |
|                | DOM 元素渲染            | 天然支持文字样式     | 大数据量性能瓶颈      |

---

## 3. 语法高亮实现示例

\`\`\`javascript
// 使用有限状态机实现基础语法高亮
class SyntaxHighlighter {
  constructor(rules) {
    this.states = [];
    this.rules = rules;
  }

  parse(text) {
    let currentState = 'initial';
    const tokens = [];
    
    while (text.length > 0) {
      let matched = false;
      for (const rule of this.rules[currentState]) {
        const match = text.match(rule.regex);
        if (match) {
          tokens.push({
            type: rule.tokenType,
            value: match[0]
          });
          text = text.substr(match[0].length);
          currentState = rule.nextState || currentState;
          matched = true;
          break;
        }
      }
      if (!matched) {
        text = text.substr(1);
      }
    }
    return tokens;
  }
}
\`\`\`

---

## 4. 性能优化策略
### 4.1 渲染优化技巧
1. 视窗区域计算
   - 动态加载可见区域内容
   - 使用图层化渲染策略
2. 增量更新机制
   - 差异对比算法
   - 局部重绘技术

### 4.2 内存管理方案
\`\`\`python
# 文件分块加载示例
class FileBuffer:
    BLOCK_SIZE = 4096
    
    def __init__(self, filename):
        self.blocks = []
        with open(filename, 'r') as f:
            while True:
                block = f.read(self.BLOCK_SIZE)
                if not block:
                    break
                self.blocks.append(block)
                
    def get_line(self, line_num):
        cumulative = 0
        for block in self.blocks:
            lines = block.split('\n')
            if line_num < cumulative + len(lines):
                return lines[line_num - cumulative]
            cumulative += len(lines)
        return None
\`\`\`

---SW

## 5. 扩展功能开发指南
### 5.1 插件系统架构

\`\`\`mermaid
graph TD
    A[开始] --> B[处理]
    B --> C[完成]
    C --> D[结束]
\`\`\`


### 5.2 API接口设计
\`\`\`typescript
interface EditorPlugin {
  name: string;
  activate(editor: EditorCore): void;
  deactivate?(): void;
}

class EditorCore {
  registerPlugin(plugin: EditorPlugin): boolean {
    // 实现插件注册逻辑
  }
  
  // 其他核心方法...
}
\`\`\`

---

## 结语
本文展示了现代代码编辑器的核心技术实现方案，涵盖从基础架构到高级功能的完整技术栈。实际开发中需要根据具体需求在性能、扩展性和易用性之间进行权衡。建议通过开源项目（如VS Code、Atom）研究更多实现细节，持续优化编辑器的人机交互体验。
## 链接

<!-- {"type": "card","icon":"https://www.zhihu.com/favicon.ico?x-oss-process=image%2Fquality%2Cq_10","title":"《影之刃零》发售销量会破五百万吗？ - 知乎","description":"这游戏的名字就直接扣2分，什么日系玩意。这游戏又是古龙风格的，作为金庸粉，不减分就不错了。看了下预…" } -->
[Umi 官网](https://www.zhihu.com/question/665438199/answer/3625311124 "Umi 官网")


[Umi 官网](https://www.zhihu.com/question/665438199/answer/3625311124 "Umi 官网")


## Description


| 业务          | 2021Q1  | 2021Q2  | 2021Q3  | 2021Q4  | 2022Q1  | 2022Q2  | 2022Q3  | 2022Q4  | 2023Q1  | 2023Q2  | 2023Q3  | 2023Q4  |
| ------------- | ------- | ------- | ------- | ------- | ------- | ------- | ------- | ------- | ------- | ------- | ------- | ------- |
| 收入          | 135,303 | 138,259 | 142,368 | 144,188 | 135,471 | 134,034 | 140,093 | 144,954 | 149,986 | 149,208 | 154,625 | 155,200 |


## 图表

<!-- {"chartType": "bar", "x":"业务", "y":"2021Q1"} -->

| 业务          | 2021Q1  | 2021Q2  | 2021Q3  | 2021Q4  | 2022Q1  | 
| ------------- | ------- | ------- | ------- | ------- | ------- |
| 收入          | 135,303 | 138,259 | 142,368 | 144,188 | 135,471 |
| 增值服务      | 72,443  | 72,013  | 75,203  | 71,913  | 72,738  | 
| 网络游戏     | 43,600  | 43,000  | 44,900  | 42,800  | 43,600  | 
| 社交网络收入 | 28,800  | 29,000  | 30,300  | 29,100  | 29,100  |
| 网络广告      | 21,820  | 22,833  | 22,495  | 21,518  | 17,988  | 
| 其他          | 41,040  | 43,413  | 44,670  | 50,757  | 44,745  |
| 金融科技     | 39,028  | 41,892  | 43,317  | 47,958  | 42,768  | 
| 云           | 162,012   | 111,521   | 111,353   | 112,799   | 111,977   | 

## 图片

![](https://mdn.alipayobjects.com/huamei_gcee1x/afts/img/A*9F0qRYV8EjUAAAAAAAAAAAAADml6AQ/original)
![](https://mdn.alipayobjects.com/huamei_gcee1x/afts/img/A*9F0qRYV8EjUAAAAAAAAAAAAADml6AQ/original)

## 视频

![video:视频名](https://gw.alipayobjects.com/v/huamei_gcee1x/afts/video/A*NudQQry0ERwAAAAAAAAAAAAADtN3AQ)


## 附件

![attachment:测试附件.pdf](https://gw.alipayobjects.com/v/huamei_gcee1x/afts/video/A*NudQQry0ERwAAAAAAAAAAAAADtN3AQ)



在 Python 中遍历数组（通常指列表 \`list\`）有以下常用方法：

---

### 一、基础遍历方法
1. **直接遍历元素**  
   使用 \`for-in\` 循环直接访问每个元素：
   \`\`\`python
   arr = [1, 2, 3, 4]
   for num in arr:
       print(num)  # 输出每个元素的值
   \`\`\`  
   这是最简洁直观的方式 [^DOC_1] [^DOC_2] [^DOC_7]。

2. **通过索引遍历**  
   结合 \`range(len())\` 获取索引：
   \`\`\`python
   for i in range(len(arr)):
       print(arr[i])  # 通过索引访问元素
   \`\`\`  
   适用于需要修改元素或根据索引操作的情况 [^DOC_1] [^DOC_8]。

3. **同时获取索引和值（\`enumerate\`）**  
   \`\`\`python
   for index, value in enumerate(arr):
       print(f"索引 {index} 的值是 {value}")
   \`\`\`  
   适合需要索引和元素的场景 [^DOC_5] [^DOC_8]。

---

### 二、其他遍历方式
4. **使用 \`while\` 循环**  
   通过计数器手动控制遍历：
   \`\`\`python
   i = 0
   while i < len(arr):
       print(arr[i])
       i += 1  # 必须手动递增
   \`\`\`  
   灵活性高但需注意避免无限循环 [^DOC_1] [^DOC_9] [^DOC_10]。

5. **列表推导式**  
   快速生成新列表的同时遍历：
   \`\`\`python
   squared = [x**2 for x in arr]  # 遍历并计算平方
   \`\`\`  
   适用于需要转换元素的场景 [^DOC_4] [^DOC_7] [^DOC_9]。

---

### 三、特殊场景方法
6. **递归遍历**（不常用）  
\`\`\`python
   def traverse(arr, i=0):
       if i < len(arr):
           print(arr[i])
 \`\`\`

## 引用

上上任的武汉大学校长是李晓红。[^DOC_1][^DOC_2]

| 业务          | 2021Q1  | 2021Q2  | 2021Q3  | 2021Q4  | 2022Q1  | 
| ------------- | ------- | ------- | ------- | ------- | ------- |
| 收入          | 135,303 [^DOC_1] | 138,259 | 142,368 | 144,188 | 135,471 |
| 增值服务      | 72,443  | 72,013  | 75,203  | 71,913  | 72,738  | 
| 网络游戏     | 43,600  | 43,000  | 44,900  | 42,800  | 43,600  | 
| 社交网络收入 | 28,800  | 29,000  | 30,300  | 29,100  | 29,100  |
| 网络广告      | 21,820  | 22,833  | 22,495  | 21,518  | 17,988  | 
| 其他          | 41,040  | 43,413  | 44,670  | 50,757  | 44,745  |
| 金融科技     | 39,028  | 41,892  | 43,317  | 47,958  | 42,768  | 
| 云           | 162,012   | 111,521   | 111,353   | 112,799   | 111,977   |
> 数据来自 [^3]


[^1]:remarkjs.md
[^2]:remarkjs.md


## 思维图

\`\`\`mermaid
mindmap
  root((mindmap))
    Origins
      Long history
      ::icon(fa fa-book)
      Popularisation
        British popular psychology author Tony Buzan
    Research
      On effectiveness<br/>and features
      On Automatic creation
        Uses
            Creative techniques
            Strategic planning
            Argument mapping
    Tools
      Pen and paper
      Mermaid
\`\`\`

## 表单

\`\`\`schema
[
  {
    "title": "标题",
    "dataIndex": "title",
    "formItemProps": {
      "rules": [{ "required": true, "message": "此项为必填项" }]
    },
    "width": "md"
  }
]
\`\`\`

## 删除线
~~插件系统架构~~

`;

input
  ?.split('\n\n')
  .filter(Boolean)
  .forEach((char) => {
    it(`should convert schema to markdown in ${char.slice(
      0,
      10,
    )} chunk`, () => {
      const schema = parserMdToSchema(' ' + char).schema;
      const markdown = parserSlateNodeToMarkdown(schema);
      expect(markdown).toMatchSnapshot();
    });
    it(`should convert markdown to schema in ${char.slice(
      0,
      10,
    )} chunk`, () => {
      const schema = parserMdToSchema(' ' + char).schema;
      expect(schema).toMatchSnapshot();
    });
  });

it(`忽略card，并且只生成一次`, () => {
  const schema = parserMdToSchema(`
| 业务          | 2021Q1  | 2021Q2  | 2021Q3  | 2021Q4  |
| ------------- | ------- | ------- | ------- | ------- |
| 收入          | 135,303 | 138,259 | 142,368 | 144,188 | 
| 增值服务      | 72,443  | 72,013  | 75,203  | 71,913  |
| 网络游戏     | 43,600  | 43,000  | 44,900  | 42,800  |
| 社交网络收入 | 28,800  | 29,000  | 30,300  | 29,100  | 
| 网络广告      | 21,820  | 22,833  | 22,495  | 21,518  | 
| 其他          | 41,040  | 43,413  | 44,670  | 50,757  | 
| 金融科技     | 39,028  | 41,892  | 43,317  | 47,958  | 
| 云           | 162,012   | 111,521   | 111,353   | 112,799   | `).schema;
  expect(schema).toMatchSnapshot();
  const markdown = parserSlateNodeToMarkdown(schema);
  expect(markdown).toMatchSnapshot();
});

it(`多个空格转为一个`, () => {
  const md = `
根据证据，2024年12月25日上证指数的收盘情况如下：




1. 上证指数最终收于3393.35点，下跌0.01%                                                              [^DOC_1]                                                              [^DOC_2]                                                              [^DOC_7]。
2. 早盘时，上证指数曾高开0.05%，但随后震荡走弱，午盘时下跌0.31%，报3383.01点                                                              [^DOC_5]                                                              [^DOC_13]                                                              [^DOC_15]。
3. 下午交易时段，上证指数继续小幅下跌，最终以3393.35点收盘                                                              [^DOC_1]                                                              [^DOC_2]                                                              [^DOC_7]。

因此，今日（2024年12月25日）上证指数收盘报3393.35点，微跌0.01%。`;
  const schema = parserMdToSchema(md).schema;
  expect(schema).toMatchSnapshot();
  const markdown = parserSlateNodeToMarkdown(schema);
  expect(markdown).toMatchSnapshot();
});

it(`引用`, () => {
  const md = `DeepSeek，宣称找到了一种更高效的人工智能模型创建方法，这对微软及其合作伙伴OpenAI构成了挑战[^1]。
*** Reference Sources ***

[^1]: [微软(MSFT)股价陷低谷，AI投入何时兑现增加承诺？ - 美股投资网](https://www.tradesmax.com/component/k2/item/22075-microsoft)
;`;
  const schema = parserMdToSchema(md).schema;
  expect(schema).toMatchSnapshot();
  const markdown = parserSlateNodeToMarkdown(schema);
  expect(markdown).toMatchSnapshot();
});
