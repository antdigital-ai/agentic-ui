/* eslint-disable @typescript-eslint/no-loop-func */
import {
  MarkdownEditor,
  MarkdownEditorInstance,
  parserMarkdownToSlateNode,
} from '@ant-design/agentic-ui';
import React, { useEffect, useRef } from 'react';

const defaultValue =
  '\'\n\n在 Python 中遍历数组（通常指列表 `list`）有以下常用方法：\n\n---\n\n### 一、基础遍历方法\n1. **直接遍历元素**  \n   使用 `for-in` 循环直接访问每个元素：\n   ```python\n   arr = [1, 2, 3, 4]\n   for num in arr:\n       print(num)  # 输出每个元素的值\n   ```  \n   这是最简洁直观的方式 [^DOC_1] [^DOC_2] [^DOC_7]。\n\n2. **通过索引遍历**  \n   结合 `range(len())` 获取索引：\n   ```python\n   for i in range(len(arr)):\n       print(arr[i])  # 通过索引访问元素\n   ```  \n   适用于需要修改元素或根据索引操作的情况 [^DOC_1] [^DOC_8]。\n\n3. **同时获取索引和值（`enumerate`）**  \n   ```python\n   for index, value in enumerate(arr):\n       print(f"索引 {index} 的值是 {value}")\n   ```  \n   适合需要索引和元素的场景 [^DOC_5] [^DOC_8]。\n\n---\n\n### 二、其他遍历方式\n4. **使用 `while` 循环**  \n   通过计数器手动控制遍历：\n   ```python\n   i = 0\n   while i < len(arr):\n       print(arr[i])\n       i += 1  # 必须手动递增\n   ```  \n   灵活性高但需注意避免无限循环 [^DOC_1] [^DOC_9] [^DOC_10]。\n\n5. **列表推导式**  \n   快速生成新列表的同时遍历：\n   ```python\n   squared = [x**2 for x in arr]  # 遍历并计算平方\n   ```  \n   适用于需要转换元素的场景 [^DOC_4] [^DOC_7] [^DOC_9]。\n\n---\n\n### 三、特殊场景方法\n6. **递归遍历**（不常用）  \n   ```python\n   def traverse(arr, i=0):\n       if i < len(arr):\n           print(arr[i])\n\';';

export default () => {
  const instance = useRef<MarkdownEditorInstance>();
  useEffect(() => {
    let md = '';
    const list = defaultValue.split('');
    const html = document.getElementById('container');
    const run = async () => {
      if (process.env.NODE_ENV === 'test') {
        instance.current?.store.updateNodeList(
          parserMarkdownToSlateNode(defaultValue).schema,
        );
        return;
      }
      for await (const item of list) {
        md += item;
        await new Promise((resolve) => {
          setTimeout(() => {
            instance.current?.store.updateNodeList(
              parserMarkdownToSlateNode(md).schema,
            );
            resolve(true);
            html?.scrollTo?.({
              top: 99999999999999,
              behavior: 'smooth',
            });
          }, 160);
        });
      }
    };
    run();
  }, []);
  return (
    <>
      <MarkdownEditor
        id="test-1"
        editorRef={instance}
        style={{
          width: '100vw',
        }}
        readonly
      />

      <MarkdownEditor
        style={{
          width: '100vw',
        }}
        initValue={`
在 Python 中循环遍历列表的 5 种常用方法如下：

### 一、基础 for 循环（推荐）
直接遍历列表元素：
\`\`\`python
fruits = ["Apple", "Mango", "Banana"]
for fruit in fruits:
    print(fruit)
\`\`\`
这是最简洁直观的方式，适用于不需要索引的场景                               [^DOC_1]                               [^DOC_3]                               [^DOC_5]                               [^DOC_8]。

---

### 二、带索引的循环
使用 \`enumerate()\` 获取索引和元素：
\`\`\`python
for index, fruit in enumerate(fruits):
    print(f"第{index}个元素：{fruit}")
\`\`\`
适合需要同时访问索引和元素的场景                               [^DOC_4]                               [^DOC_8]。

---

### 三、while 循环
通过索引控制遍历：
\`\`\`python
i = 0
while i < len(fruits):
    print(fruits[i])
    i += 1
\`\`\`
适用于需要动态控制循环条件的场景（如遍历时修改列表）                               [^DOC_2]                               [^DOC_7]                               [^DOC_9]。

---

### 四、列表推导式
快速生成新列表：
\`\`\`python
uppercase_fruits = [fruit.upper() for fruit in fruits]
\`\`\`
适用于需要将遍历结果转换为新列表的场景                               [^DOC_1]                               [^DOC_5]。

---

### 五、range() + len() 组合
通过索引范围遍历：
\`\`\`python
for i in range(len(fruits)):
    print(fruits[i])
\`\`\`
效果类似 while 循环，但更简洁                               [^DOC_6]                               [^DOC_10]。

---

### 修改列表时的注意事项
当需要在循环中增删元素时：
1. 使用 \`while\` 循环动态控制索引                               [^DOC_9]
2. 遍历副本避免逻辑错误：
\`\`\`python
for fruit in fruits.copy():  # 创建副本
    if "n" in fruit:
        fruits.remove(fruit)
\`\`\`

每种方法都有特定适用场景，根据是否需要索引、是否修改列表等需求选择最佳方案。`}
        readonly
      />
      <div>
        <h4>Props 说明</h4>
        <ul>
          <li>
            <code>id</code> - 编辑器 ID，用于标识第一个编辑器实例
          </li>
          <li>
            <code>editorRef</code> - 编辑器引用，用于访问编辑器实例和方法
          </li>
          <li>
            <code>style</code> - 样式配置，设置宽度为 100vw
          </li>
          <li>
            <code>readonly</code> - 只读模式，用户无法编辑内容
          </li>
          <li>
            <code>initValue</code> - 初始化的 Markdown 内容，包含 Python
            代码示例
          </li>
          <li>
            <code>instance</code> - useRef 创建的编辑器实例引用
          </li>
          <li>
            <code>defaultValue</code> - 默认值，包含 Python 遍历数组的示例代码
          </li>
          <li>
            <code>parserMarkdownToSlateNode</code> - Markdown 解析函数，将
            Markdown 转换为 Slate 节点
          </li>
          <li>
            <code>store.updateNodeList</code> - 更新节点列表的方法
          </li>
          <li>
            <code>useEffect</code> - 副作用钩子，用于实现打字机效果
          </li>
        </ul>
      </div>
    </>
  );
};
