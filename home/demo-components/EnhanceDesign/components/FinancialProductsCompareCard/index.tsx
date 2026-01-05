import { Modal } from 'antd';
import React, { useState } from 'react';
import ButtonBg from './assets/button-bg.svg';
import {
  CompanyHeader,
  CompareButton,
  CompareButtonContent,
  CompareCards,
  CompareContent,
  CompareRow,
  Footer,
  HeaderWrappers,
  Label,
  LeftValue,
  RightValue,
} from './style';
import type { CommonCompareCardProps } from './types';

const FinancialProductsCompareCard: React.FC<CommonCompareCardProps> = ({
  data,
  btnText = '查看详细对比',
  onDetailClick,
}) => {
  // 更多
  const [moreVisible, setMoreVisible] = useState<boolean>(false);
  // 从 data 中取出公司信息和对比指标
  const {
    productInfos = [],
    companyInfos = [],
    mainCompareIndicatorList = [],
  }: any = data || {};

  // 获取左右两个标题信息
  const leftCompany =
    companyInfos.length !== 0 ? companyInfos[0] : productInfos[0];
  const rightCompany =
    companyInfos.length !== 0 ? companyInfos[1] : productInfos[1];

  const handleButtonClick = () => {
    if (onDetailClick) {
      onDetailClick();
    } else {
      setMoreVisible(true);
    }
  };

  return (
    <>
      <CompareCards>
        {/* 标题区域 */}
        <HeaderWrappers>
          {/* 左侧标题 */}
          <CompanyHeader>
            <div className="companyName">
              {companyInfos.length !== 0
                ? leftCompany?.comapnyName
                : leftCompany?.productName}
            </div>
            <div className="tags">
              {leftCompany?.tags?.map((tag: any, index: any) => (
                <span key={index} className="tag">
                  {tag}
                </span>
              ))}
            </div>
          </CompanyHeader>

          {/* 右侧标题 */}
          <CompanyHeader $isRight>
            <div className="companyName">
              {companyInfos.length !== 0
                ? rightCompany?.comapnyName
                : rightCompany?.productName}
            </div>
            <div className="tags">
              {rightCompany?.tags?.map((tag: any, index: any) => (
                <span key={index} className="tag">
                  {tag}
                </span>
              ))}
            </div>
          </CompanyHeader>
        </HeaderWrappers>

        {/* 对比数据区域 */}
        <CompareContent>
          {mainCompareIndicatorList.map((item: any, index: any) => {
            return (
              <CompareRow key={index}>
                {/* 左侧值 */}
                <LeftValue>{item.leftValue}</LeftValue>

                {/* 中间标签 */}
                <Label>{item.indicatorName}</Label>

                {/* 右侧值 */}
                <RightValue>{item.rightValue}</RightValue>
              </CompareRow>
            );
          })}
        </CompareContent>

        {/* 底部按钮 */}
        <Footer>
          <CompareButton type="button" onClick={handleButtonClick}>
            <img
              src={ButtonBg}
              alt=""
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'fill',
                zIndex: 0,
              }}
            />
            <CompareButtonContent>{btnText}</CompareButtonContent>
          </CompareButton>
        </Footer>
      </CompareCards>

      {/* 详细对比弹窗 */}
      <Modal
        title="详细对比"
        open={moreVisible}
        onCancel={() => setMoreVisible(false)}
        footer={null}
        width={800}
      >
        <div style={{ padding: '16px' }}>
          <div style={{ marginBottom: '16px' }}>
            <h3>产品对比详情</h3>
          </div>
          <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
            {data?.totalCompareIndicatorList?.map(
              (item: any, index: number) => (
                <div
                  key={index}
                  style={{
                    padding: '12px',
                    borderBottom: '1px solid #f0f0f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ fontWeight: 500, color: '#666' }}>
                    {item.indicatorName}:
                  </span>
                  <div style={{ display: 'flex', gap: '24px' }}>
                    <span>{item.leftValue}</span>
                    <span>{item.rightValue}</span>
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      </Modal>
    </>
  );
};

export default FinancialProductsCompareCard;
