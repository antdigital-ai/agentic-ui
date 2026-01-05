import { styled } from 'styled-components';
import leftHeaderBg from './assets/left-header-bg.svg';
import rightHeaderBg from './assets/right-header-bg.svg';

export const CompareCards = styled.div`
  width: 100%;
  background: #fff;
  position: relative;
  border-radius: 16px;
  box-sizing: border-box;
  padding-bottom: 0;
  min-height: 400px;
`;

// 标题区域容器
export const HeaderWrappers = styled.div`
  position: relative;
  border-radius: 15px 15px 0 0;
  margin-bottom: 4px;
  overflow: hidden;
  height: auto;
  min-height: 64px;
`;

// 公司标题样式
export const CompanyHeader = styled.div<{ $isRight?: boolean }>`
  position: absolute;
  top: 0;
  height: 100%;
  padding: 12px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 4px;
  background-image: url(${(props) =>
    props.$isRight ? rightHeaderBg : leftHeaderBg});
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;

  /* 让左右两侧向中间延伸，形成重叠 */
  ${(props) =>
    !props.$isRight
      ? `
    left: 0;
    width: 52%;
    z-index: 1;
  `
      : `
    right: 0;
    width: 52%;
    z-index: 2;
  `}

  .companyName {
    font-family: 'PingFang SC', sans-serif;
    font-size: 16px;
    font-weight: 500;
    line-height: 24px;
    color: #343a45;
    text-align: ${(props) => (props.$isRight ? 'right' : 'left')};
    position: relative;
    z-index: 1;
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 2px;
    justify-content: ${(props) => (props.$isRight ? 'flex-end' : 'flex-start')};
    position: relative;
    z-index: 1;

    .tag {
      padding: 1px 4px;
      border-radius: 4px;
      box-sizing: border-box;
      border: 0.5px solid #d9d9d9;
      font-family: 'PingFang SC', sans-serif;
      font-size: 12px;
      line-height: 16px;
      color: #666;
    }
  }
`;

// 对比内容区域
export const CompareContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  box-sizing: border-box;
  padding-bottom: 0;
  margin-bottom: 0;
`;

// 对比行
export const CompareRow = styled.div`
  box-sizing: border-box;
  display: flex;
  align-items: stretch;
`;

export const LeftValue = styled.div`
  box-sizing: border-box;
  flex: 1;
  word-break: break-all;
  min-width: 0;
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  background: linear-gradient(90deg, #eaf3ff 0%, #fff 100%);
  border-radius: 3px 0 0 3px;
  font-family: 'PingFang SC', sans-serif;
  font-size: 13px;
  font-weight: normal;
  color: #343a45;
  line-height: 24px;
`;

export const RightValue = styled.div`
  box-sizing: border-box;
  flex: 1;
  word-break: break-all;
  min-width: 0;
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  text-align: right;
  background: linear-gradient(270deg, #feebe9 0%, #fff 100%);
  border-radius: 0 3px 3px 0;
  font-family: 'PingFang SC', sans-serif;
  font-size: 13px;
  font-weight: normal;
  color: #343a45;
  line-height: 24px;
`;

export const Label = styled.div`
  box-sizing: border-box;
  padding: 12px 10px;
  flex: 0 1 auto;
  width: 92px;
  font-family: 'PingFang SC', sans-serif;
  font-size: 14px;
  line-height: 18px;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  background: linear-gradient(
    270deg,
    rgba(255, 255, 255, 0%) 1%,
    rgba(255, 255, 255, 79.5%) 9%,
    #fff 85%,
    rgba(255, 255, 255, 0%) 100%
  );
`;

// 底部按钮区域
export const Footer = styled.div`
  width: calc(100% - 16px);
  position: relative;
  margin: -10px auto 0;
  z-index: 10;
`;

export const CompareButton = styled.button`
  width: 100%;
  height: 40px;
  padding: 0;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  background: transparent;
  overflow: hidden;

  &:hover {
    opacity: 0.9;
  }

  &:active {
    transform: scale(0.98);
  }
`;

export const CompareButtonContent = styled.span`
  position: relative;
  z-index: 1;
  font-family: 'PingFang SC', sans-serif;
  font-size: 16px;
  font-weight: 500;
  color: #fff;
  line-height: 22px;
  white-space: nowrap;
`;
