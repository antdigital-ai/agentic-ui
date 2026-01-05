import React from 'react';
import { MarkdownEditor } from '@ant-design/agentic-ui';
import { CardContent } from '../style';
import TabPreview from './TabPreview';

const MarkdownTab: React.FC = () => {
  const codeExample = `# Markdown 富文本示例

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

`;

  const contentExample = (
    <div>
      <CardContent>
        <div style={{ height: '500px', overflow: 'auto' }}>
          <MarkdownEditor
            initValue={codeExample}
            readonly={true}
            toolBar={{ enable: false }}
            toc={false}
            style={{ height: '100%' }}
            contentStyle={{ height: '100%', padding: '0' }}
          />
        </div>
      </CardContent>
    </div>
  );

  return (
    <TabPreview codeExample={codeExample} contentExample={contentExample} />
  );
};

export default MarkdownTab;
