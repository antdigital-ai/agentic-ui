// 公司信息
export interface CompanyInfo {
  comapnyName: string; // 名称
  tags: string[]; // 标签列表
}

export interface ProductInfo {
  productName: string; // 名称
  tags: string[]; // 标签列表
}

// 对比指标
export interface CompareIndicator {
  indicatorName: string; // 指标名称
  leftValue: string | number; // 左侧值
  rightValue: string | number; // 右侧值
}

export interface CommonCompareCardProps {
  data: {
    cardId: string; // 卡片ID
    cardTag?: string; // 卡片标签
    companyInfos?: CompanyInfo[]; // 标题和标签
    productInfos?: ProductInfo[]; // 标题和标签
    IntrinsicAttributes?: any;
    mainCompareIndicatorList: CompareIndicator[]; // 外层固定数据
    totalCompareIndicatorList?: CompareIndicator[]; //总数据
    detailCompareIndicatorList?: CompareIndicator[]; // 详情数据
    detailCompareIndicatorListTitle?: string; // 详情数据标题
    detailCompareIndicatorListDesc?: string; // 详情数据描述
    detailCompareIndicatorListDescLink?: string; // 详情数据描述链接
    detailCompareIndicatorListDescLinkText?: string; // 详情数据描述链接文本
  };
  btnText?: string; // 按钮文本
  onDetailClick?: () => void; // 点击"查看详细对比"按钮的回调函数
}
