import type { CommonCompareCardProps } from './types';

export const mockCompareData: CommonCompareCardProps['data'] = {
  cardId: 'compare-card-001',
  productInfos: [
    {
      productName: '嘉裕稳进14月持有',
      tags: ['银保监会批准', '私募牌照'],
    },
    {
      productName: '兴动智享1年5号',
      tags: ['基金销售牌照'],
    },
  ],
  mainCompareIndicatorList: [
    {
      indicatorName: '产品类型',
      leftValue: '中低风险封闭式理财',
      rightValue: '长期储蓄+保障功能',
    },
    {
      indicatorName: '发行机构',
      leftValue: '商业银行',
      rightValue: '商业银行',
    },
    {
      indicatorName: '起购金额',
      leftValue: '10,000 元',
      rightValue: '5,000 元',
    },
    {
      indicatorName: '投资期限',
      leftValue: '3-6 个月',
      rightValue: '12 个月',
    },
    {
      indicatorName: '预期年化收益',
      leftValue: '0.3-0.6 %',
      rightValue: '0.3-0.65 %',
    },
    {
      indicatorName: '风险等级',
      leftValue: 'R2 (中低风险)',
      rightValue: 'R3 (中风险)',
    },
  ],
  totalCompareIndicatorList: [
    {
      indicatorName: '产品类型',
      leftValue: '中低风险封闭式理财',
      rightValue: '长期储蓄+保障功能',
    },
    {
      indicatorName: '发行机构',
      leftValue: '商业银行',
      rightValue: '商业银行',
    },
    {
      indicatorName: '起购金额',
      leftValue: '10,000 元',
      rightValue: '5,000 元',
    },
    {
      indicatorName: '投资期限',
      leftValue: '3-6 个月',
      rightValue: '12 个月',
    },
    {
      indicatorName: '预期年化收益',
      leftValue: '0.3-0.6 %',
      rightValue: '0.3-0.65 %',
    },
    {
      indicatorName: '风险等级',
      leftValue: 'R2 (中低风险)',
      rightValue: 'R3 (中风险)',
    },
  ],
};
