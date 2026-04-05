/**
 * 与 `newEnergyFundContent` 配套的批注列表示例，供 preview / readonly / footnoteReference 复用，
 * 避免三处复制粘贴漂移。
 */
export const energyFundDemoCommentList = [
  {
    selection: {
      anchor: { path: [2, 0], offset: 283 },
      focus: { path: [2, 0], offset: 292 },
    },
    path: [2, 0],
    time: 1735924079099,
    id: 1735924079099,
    content:
      '导语建议说明：正文为行业与指数层面的演示素材，脚注与表格均为占位，非投资建议。',
    anchorOffset: 283,
    focusOffset: 292,
    refContent: '# 新能源基金现状及投资',
    commentType: 'comment',
  },
  {
    id: 1,
    selection: {
      anchor: { path: [2, 0], offset: 283 },
      focus: { path: [2, 0], offset: 292 },
    },
    path: [2, 0],
    anchorOffset: 283,
    focusOffset: 292,
    user: {
      name: '审阅人A',
    },
    time: 1629340800000,
    content: '开篇外链为 example.com 占位，若面向真实读者需替换为可核验来源。',
    refContent:
      '[受产业链价格战影响，部分产品出现降价，产能过剩问题凸显](https://example.com/report)',
    commentType: 'comment',
  },
  {
    id: 2,
    selection: {
      anchor: { path: [2, 0], offset: 283 },
      focus: { path: [2, 0], offset: 292 },
    },
    path: [2, 0],
    anchorOffset: 283,
    focusOffset: 292,
    user: {
      name: '审阅人B',
    },
    time: 1629340800000,
    content: '议题演进表列数较多，窄屏阅读压力大，是否考虑固定首列或附摘要？',
    refContent: '| 议题 | 2023 Q4 | 2024 Q2 | 2024 Q3 | 2024 Q4 | 2025 Q1 |',
    commentType: 'comment',
  },
];

export const energyFundDemoMentionUsers = () => [
  {
    name: '审阅人A',
    id: '1',
    avatar: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png',
  },
  {
    name: '审阅人B',
    id: '2',
    avatar: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png',
  },
];
