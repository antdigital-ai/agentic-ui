import { MarkdownEditor } from '@ant-design/agentic-ui';
import React from 'react';

const defaultValue = `## 优先级矩阵（艾森豪威尔）

<!-- {"chartType": "quadrant", "title": "艾森豪威尔矩阵"} -->

| 象限           | 内容                                           |
| :------------- | :--------------------------------------------- |
| 重要且紧急     | 线上故障，客户投诉，合规截止                   |
| 重要不紧急     | 架构演进；人才培养；文档与规范                 |
| 不重要但紧急   | 部分会议，临时报表                             |
| 不重要不紧急   | 无效邮件，过度社交                             |

---

## 技术采纳曲线（自定义列名）

只要前两列在表头与数据里一致即可；条目支持英文逗号、中文顿号、分号等分隔。

<!-- {"chartType": "quadrant", "title": "技术采纳阶段"} -->

| 阶段     | Items                                               |
| :------- | :-------------------------------------------------- |
| 创新者   | 早期尝鲜团队，快速试错                             |
| 早期采用 | 内部 champion，落地试点                           |
| 早期多数 | 配套工具链完善，模板化推广                         |
| 晚期多数 | 平台默认路径，培训与审计                           |

---

## 竞品对比（单条跨多分隔符）

<!-- {"chartType": "quadrant", "title": "能力象限（示意）"} -->

| 维度     | 要点                                          |
| :------- | :-------------------------------------------- |
| 领先象限 | 差异化能力 A；差异化能力 B；专利或生态壁垒   |
| 追赶象限 | 功能补齐中；需加大研发投入                   |
| 维持象限 | 成熟能力，控制成本                           |
| 观察象限 | 低优先级跟进；或依赖第三方                   |
`;

export default () => {
  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        flexDirection: 'column',
        gap: '16px',
        overflow: 'auto',
      }}
    >
      <MarkdownEditor
        readonly
        style={{ border: '1px solid #eee' }}
        toc={false}
        width={'calc(99vw - 16px)'}
        initValue={defaultValue}
      />
    </div>
  );
};
