import { MarkdownEditor } from '@ant-design/agentic-ui';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

// 创建 markdown 内容
const getMarkdownContent = () => {
  return `# HTML 元素 Markdown Demo

## 1. 字体样式 (font 标签)

<font color="red">这是红色文字</font>

<font color="blue" size="5">这是蓝色大号文字</font>

<font color="green" size="3">这是绿色中等文字</font>

<font color="purple" size="1">这是紫色小号文字</font>

## 2. 粗体文字 (b 标签)

<b>这是粗体文字</b>

<b style="color: orange;">这是橙色粗体文字</b>

## 3. 斜体文字 (i 标签)

<i>这是斜体文字</i>

<i style="color: teal;">这是青色斜体文字</i>

## 4. 行内元素 (span 标签)

<span>这是普通的 span 文字</span>

<span style="color: red; font-weight: bold;">这是红色粗体 span 文字</span>

<span style="background-color: yellow;">这是黄色背景的 span 文字</span>

<span style="color: blue; font-style: italic;">这是蓝色斜体 span 文字</span>

## 5. 组合使用

<font color="red"><b>红色粗体文字</b></font>

<font color="blue"><i>蓝色斜体文字</i></font>

<span style="color: green;"><b><i>绿色粗斜体文字</i></b></span>

<font color="purple" size="4"><span style="background-color: lightgray;">紫色大号带背景的文字</span></font>

## 6. 复杂样式组合

<div style="border: 2px solid black; padding: 10px; margin: 10px;">
  <font color="darkblue" size="5">
    <b>标题文字</b>
  </font>
  <br>
  <span style="color: gray; font-style: italic;">
    这是副标题文字
  </span>
  <br>
  <font color="black" size="3">
    这是正文内容，包含 <b>重要信息</b> 和 <i>补充说明</i>。
  </font>
</div>

## 7. 列表中的 HTML 元素

- <font color="red">红色列表项</font>
- <b>粗体列表项</b>
- <i>斜体列表项</i>
- <span style="color: green; font-weight: bold;">绿色粗体列表项</span>

## 8. 表格中的 HTML 元素

| 列1 | 列2 | 列3 |
|-----|-----|-----|
| <font color="red">红色</font> | <b>粗体</b> | <i>斜体</i> |
| <span style="background-color: yellow;">黄色背景</span> | <font color="blue">蓝色</font> | <b><i>粗斜体</i></b> |

## 9. 引用中的 HTML 元素

> <font color="darkgreen">这是绿色引用文字</font>
> 
> <b>这是粗体引用文字</b>
> 
> <span style="color: purple; font-style: italic;">这是紫色斜体引用文字</span>

## 10. 代码块中的说明

\`\`\`html
<!-- 这是 HTML 注释 -->
<font color="red">红色文字</font>
<b>粗体文字</b>
<i>斜体文字</i>
<span style="color: blue;">蓝色 span 文字</span>
\`\`\`

## 注意事项

1. **font 标签**：用于设置字体颜色和大小
   - \`color\` 属性：设置文字颜色
   - \`size\` 属性：设置字体大小（1-7）

2. **b 标签**：用于粗体文字
   - 可以结合 style 属性使用

3. **i 标签**：用于斜体文字
   - 可以结合 style 属性使用

4. **span 标签**：行内元素，用于样式控制
   - 非常灵活，可以设置各种 CSS 样式

5. **组合使用**：可以嵌套使用这些标签来创建复杂的文字效果

## 兼容性说明

- 这些 HTML 标签在大多数 Markdown 渲染器中都支持
- \`font\` 标签虽然已被 HTML5 废弃，但在 Markdown 中仍可使用
- 建议优先使用 \`span\` 标签配合 CSS 样式来实现更灵活的样式控制`;
};

describe('Markdown HTML Demo 测试', () => {
  const markdownContent = getMarkdownContent();

  it('应该正确渲染 font 标签', () => {
    render(
      <MarkdownEditor
        initValue="<font color='red'>这是红色文字</font>"
        readonly
        reportMode
      />,
    );

    // 检查红色文字是否存在
    const redText = screen.getByText('这是红色文字');
    expect(redText).toBeInTheDocument();
  });

  it('应该正确渲染 b 标签', () => {
    render(
      <MarkdownEditor initValue="<b>这是粗体文字</b>" readonly reportMode />,
    );

    // 检查粗体文字是否存在
    const boldText = screen.getByText('这是粗体文字');
    expect(boldText).toBeInTheDocument();
  });

  it('应该正确渲染 i 标签', () => {
    render(
      <MarkdownEditor initValue="<i>这是斜体文字</i>" readonly reportMode />,
    );

    // 检查斜体文字是否存在
    const italicText = screen.getByText('这是斜体文字');
    expect(italicText).toBeInTheDocument();
  });

  it('应该正确渲染 span 标签', () => {
    render(
      <MarkdownEditor
        initValue="<span style='color: blue;'>这是蓝色 span 文字</span>"
        readonly
        reportMode
      />,
    );

    // 检查 span 文字是否存在
    const spanText = screen.getByText('这是蓝色 span 文字');
    expect(spanText).toBeInTheDocument();
  });

  it('应该正确渲染组合标签', () => {
    render(
      <MarkdownEditor
        initValue="<font color='red'><b>红色粗体文字</b></font>"
        readonly
        reportMode
      />,
    );

    // 检查组合标签文字是否存在
    const combinedText = screen.getByText('红色粗体文字');
    expect(combinedText).toBeInTheDocument();
  });

  it('应该正确渲染复杂样式组合', () => {
    const complexHtml = `
<div style="border: 2px solid black; padding: 10px; margin: 10px;">
  <font color="darkblue" size="5">
    <b>标题文字</b>
  </font>
  <br>
  <span style="color: gray; font-style: italic;">
    这是副标题文字
  </span>
</div>
    `;

    render(<MarkdownEditor initValue={complexHtml} readonly reportMode />);

    // 检查复杂样式中的文字是否存在
    const titleText = screen.getByText('标题文字');
    const subtitleText = screen.getByText('这是副标题文字');

    expect(titleText).toBeInTheDocument();
    expect(subtitleText).toBeInTheDocument();
  });

  it('应该正确渲染列表中的 HTML 元素', () => {
    const listWithHtml = `
- <font color="red">红色列表项</font>
- <b>粗体列表项</b>
- <i>斜体列表项</i>
- <span style="color: green; font-weight: bold;">绿色粗体列表项</span>
    `;

    render(<MarkdownEditor initValue={listWithHtml} readonly reportMode />);

    // 检查列表项是否存在
    expect(screen.getByText('红色列表项')).toBeInTheDocument();
    expect(screen.getByText('粗体列表项')).toBeInTheDocument();
    expect(screen.getByText('斜体列表项')).toBeInTheDocument();
    expect(screen.getByText('绿色粗体列表项')).toBeInTheDocument();
  });

  it('应该正确渲染表格中的 HTML 元素', () => {
    const tableWithHtml = `
| 列1 | 列2 | 列3 |
|-----|-----|-----|
| <font color="red">红色</font> | <b>粗体</b> | <i>斜体</i> |
| <span style="background-color: yellow;">黄色背景</span> | <font color="blue">蓝色</font> | <b><i>粗斜体</i></b> |
    `;

    render(<MarkdownEditor initValue={tableWithHtml} readonly reportMode />);

    // 检查表格中的文字是否存在
    expect(screen.getByText('红色')).toBeInTheDocument();
    expect(screen.getByText('粗体')).toBeInTheDocument();
    expect(screen.getByText('斜体')).toBeInTheDocument();
    expect(screen.getByText('黄色背景')).toBeInTheDocument();
    expect(screen.getByText('蓝色')).toBeInTheDocument();
    expect(screen.getByText('粗斜体')).toBeInTheDocument();
  });

  it('应该正确渲染引用中的 HTML 元素', () => {
    const quoteWithHtml = `
> <font color="darkgreen">这是绿色引用文字</font>
> 
> <b>这是粗体引用文字</b>
> 
> <span style="color: purple; font-style: italic;">这是紫色斜体引用文字</span>
    `;

    render(<MarkdownEditor initValue={quoteWithHtml} readonly reportMode />);

    // 检查引用中的文字是否存在
    expect(screen.getByText('这是绿色引用文字')).toBeInTheDocument();
    expect(screen.getByText('这是粗体引用文字')).toBeInTheDocument();
    expect(screen.getByText('这是紫色斜体引用文字')).toBeInTheDocument();
  });

  it('应该正确渲染完整的 demo 文件', () => {
    render(<MarkdownEditor initValue={markdownContent} readonly reportMode />);

    // 检查一些关键元素是否存在
    expect(
      screen.getAllByText('HTML 元素 Markdown Demo')[0],
    ).toBeInTheDocument();
    expect(screen.getByText('这是红色文字')).toBeInTheDocument();
    expect(screen.getByText('这是粗体文字')).toBeInTheDocument();
    expect(screen.getByText('这是斜体文字')).toBeInTheDocument();
    expect(screen.getByText('这是普通的 span 文字')).toBeInTheDocument();
  });

  it('应该正确处理不同字体大小的 font 标签', () => {
    const differentSizes = `
<font color="blue" size="5">这是蓝色大号文字</font>
<font color="green" size="3">这是绿色中等文字</font>
<font color="purple" size="1">这是紫色小号文字</font>
    `;

    render(<MarkdownEditor initValue={differentSizes} readonly reportMode />);

    // 检查不同大小的文字是否存在
    expect(screen.getByText('这是蓝色大号文字')).toBeInTheDocument();
    expect(screen.getByText('这是绿色中等文字')).toBeInTheDocument();
    expect(screen.getByText('这是紫色小号文字')).toBeInTheDocument();
  });

  it('应该正确处理带样式的 span 标签', () => {
    const styledSpans = `
<span style="color: red; font-weight: bold;">这是红色粗体 span 文字</span>
<span style="background-color: yellow;">这是黄色背景的 span 文字</span>
<span style="color: blue; font-style: italic;">这是蓝色斜体 span 文字</span>
    `;

    render(<MarkdownEditor initValue={styledSpans} readonly reportMode />);

    // 检查带样式的 span 文字是否存在
    expect(screen.getByText('这是红色粗体 span 文字')).toBeInTheDocument();
    expect(screen.getByText('这是黄色背景的 span 文字')).toBeInTheDocument();
    expect(screen.getByText('这是蓝色斜体 span 文字')).toBeInTheDocument();
  });

  it('应该正确处理嵌套的 HTML 标签', () => {
    const nestedTags = `
<span style="color: green;"><b><i>绿色粗斜体文字</i></b></span>
<font color="purple" size="4"><span style="background-color: lightgray;">紫色大号带背景的文字</span></font>
    `;

    render(<MarkdownEditor initValue={nestedTags} readonly reportMode />);

    // 检查嵌套标签的文字是否存在
    expect(screen.getByText('绿色粗斜体文字')).toBeInTheDocument();
    expect(screen.getByText('紫色大号带背景的文字')).toBeInTheDocument();
  });
});
