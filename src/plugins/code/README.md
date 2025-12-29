# Code Plugin 文件结构

这是重构后的代码插件文件结构，将原本的大文件拆分成多个模块化的文件。

## 文件结构

```
src/Plugins/code/
├── index.tsx                    # 主文件，包含 CodeElement 组件
├── components/                  # 组件目录
│   ├── index.ts                # 组件统一导出
│   ├── LoadImage.tsx           # 图片加载组件
│   ├── LanguageSelector.tsx    # 语言选择器组件
│   └── CodeToolbar.tsx         # 代码工具栏组件
├── utils/                      # 工具目录
│   ├── index.ts               # 工具统一导出
│   └── langOptions.tsx        # 语言选项配置
├── CodeUI/                    # 原有的代码UI组件
└── langIconMap.ts             # 语言图标映射
```

## 组件说明

### LoadImage

处理图片加载状态的组件，在图片成功加载前隐藏，加载失败时也隐藏。

### LanguageSelector

语言选择器组件，提供搜索和选择编程语言的功能。包含：

- 搜索框用于过滤语言
- 语言图标显示
- Popover 弹出层界面

### CodeToolbar

代码编辑器的工具栏组件，包含：

- 语言选择器
- 复制按钮
- 全屏按钮
- HTML运行按钮（仅HTML语言）
- 关闭按钮（仅公式和mermaid）

### CodeElement

主要的代码元素组件，负责：

- Ace编辑器的初始化和管理
- 键盘事件处理
- 与Slate编辑器的集成
- 代码块的渲染和交互

## 优势

1. **模块化**: 每个组件都有明确的职责
2. **可维护性**: 代码更容易理解和修改
3. **可重用性**: 组件可以独立测试和重用
4. **类型安全**: 每个组件都有明确的TypeScript类型定义
