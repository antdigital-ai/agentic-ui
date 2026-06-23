import {
  MarkdownEditor,
  MarkdownEditorInstance,
  parserMdToSchema,
} from '@ant-design/agentic-ui';
import React, { useEffect } from 'react';
import { newEnergyFundContent } from './shared/newEnergyFundContent';

const defaultValue =
  newEnergyFundContent +
  `

## 现代代码编辑器技术解析与实现示例

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
本文展示了现代代码编辑器的核心技术实现方案，涵盖从基础架构到高级功能的完整技术栈。实际开发中需要根据具体需求在性能、扩展性和易用性之间进行权衡。建议通过开源项目（如VS Code、Atom）研究更多实现细节，持续优化编辑器的人机交互体验。`;
export default () => {
  const markdownRef = React.useRef<MarkdownEditorInstance>();

  useEffect(() => {
    setInterval(() => {
      markdownRef.current?.store?.updateNodeList(
        parserMdToSchema(defaultValue).schema,
      );
    }, 1000);
  }, []);
  return (
    <>
      <MarkdownEditor
        width={'100vw'}
        height={'100vh'}
        initValue={defaultValue}
        editorRef={markdownRef}
      />

      <div style={{ marginTop: '20px', padding: '20px' }}>
        <h4>Props 说明：</h4>
        <ul>
          <li>
            <strong>width</strong>: 编辑器宽度
          </li>
          <li>
            <strong>height</strong>: 编辑器高度
          </li>
          <li>
            <strong>initValue</strong>: 编辑器的初始内容值
          </li>
          <li>
            <strong>editorRef</strong>: 编辑器实例引用，用于调用编辑器方法
          </li>
          <li>
            <strong>store.updateNodeList</strong>: 更新节点列表的方法
          </li>
          <li>
            <strong>parserMdToSchema</strong>: 将 Markdown 解析为 schema
            的工具函数
          </li>
        </ul>
      </div>
    </>
  );
};
