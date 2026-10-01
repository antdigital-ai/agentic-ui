import { MarkdownEditor, MarkdownEditorInstance } from '@ant-design/agentic-ui';
import React, { useRef } from 'react';

const defaultValue = `要使用 HTML 和 CSS 实现一个“跳舞”的效果，我们可以结合 CSS 动画来让某个元素产生“跳舞”的动画。下面是一个简单的例子，展示如何使一个“人”图标形象地“跳舞”。

### HTML 部分
我们需要一个 HTML 文件来放置我们的“跳舞”的元素。我们将使用一个简单的 \`div\` 元素，并对其应用样式。

\`\`\`html
<!DOCTYPE html>
<html lang="zh">
<head>
<meta charset="UTF-8">
<title>跳舞效果</title>
<link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="dancer">
        ♥
    </div>
</body>
</html>
\`\`\`

### CSS 部分
CSS 部分负责设计和动画。我们使用transform和keyframes来创建一个类似于跳舞的动作。

\`\`\`css
/* styles.css */
body {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: #282c34;
    margin: 0;
}

.dancer {
    font-size: 3em;
    color: #61dafb;
    text-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 20px #4c5089, 0 0 30px #4c5089, 0 0 50px #4c5089, 0 0 60px #4c5089;
    animation: dance 2s ease-in-out infinite;
}

@keyframes dance {
    0% { transform: rotate(0) translateX(0) scale(1); }
    25% { transform: rotate(-5deg) translateX(30px) scale(1.1); }
    50% { transform: rotate(5deg) translateX(-30px) scale(1.2); }
    75% { transform: rotate(-2deg) translateX(15px) scale(1.1); }
    100% { transform: rotate(0) translateX(0) scale(1); }
}
\`\`\`

这个示例中，使用了一个简单的 \`♥\` 图标来代表跳舞的“人”。通过调整 CSS 动画的关键帧，我们模拟了人物的位置移动、旋转和大小变化，从而实现了上述的“跳舞”效果。

要更丰富地展示这个效果，你可以尝试改变跳舞的关键帧，调整动画的持续时间，或者改变图像的形状和大小等。`;

export default () => {
  const editorRef = useRef<MarkdownEditorInstance | null>(null);

  return (
    <>
      <MarkdownEditor
        editorRef={editorRef}
        width={'100vw'}
        height={'100vh'}
        reportMode
        initValue={defaultValue}
      />
    </>
  );
};
