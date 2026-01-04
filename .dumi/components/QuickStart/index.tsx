import React from 'react';
import {
  Footer,
  FooterColumn,
  FooterColumnIcon,
  FooterColumnTitle,
  FooterColumns,
  FooterContainer,
  FooterDivider,
  FooterLink,
  FooterLinkIcon,
  FooterLinkList,
  FooterLinkText,
  FooterText,
} from './style';

const QuickStart: React.FC = () => {
  return (
    <>
      {/* Footer */}
      <Footer>
        <FooterContainer>
          <FooterColumns>
            {/* 相关资源 */}
            <FooterColumn>
              <FooterColumnTitle>相关资源</FooterColumnTitle>
              <FooterLinkList>
                <FooterLink>
                  <FooterLinkText
                    href="https://ant.design"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Ant Design
                  </FooterLinkText>
                </FooterLink>
                <FooterLink>
                  <FooterLinkText
                    href="https://pro.ant.design"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Ant Design Pro
                  </FooterLinkText>
                </FooterLink>
                <FooterLink>
                  <FooterLinkText
                    href="https://procomponents.ant.design"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Ant Design Pro Components
                  </FooterLinkText>
                </FooterLink>
                <FooterLink>
                  <FooterLinkText
                    href="https://umijs.org"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Umi - React 应用开发框架
                  </FooterLinkText>
                </FooterLink>
                <FooterLink>
                  <FooterLinkText
                    href="https://d.umijs.org"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Dumi - 组件/文档研发工具
                  </FooterLinkText>
                </FooterLink>
                <FooterLink>
                  <FooterLinkText
                    href="https://qiankun.umijs.org"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    qiankun - 微前端框架
                  </FooterLinkText>
                </FooterLink>
              </FooterLinkList>
            </FooterColumn>

            {/* 社区 */}
            <FooterColumn>
              <FooterColumnTitle>社区</FooterColumnTitle>
              <FooterLinkList>
                <FooterLink>
                  <FooterLinkIcon style={{ color: 'rgba(42, 46, 54, 0.45)' }}>
                    <svg
                      viewBox="64 64 896 896"
                      focusable="false"
                      data-icon="medium"
                      width="1em"
                      height="1em"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M834.7 279.8l61.3-58.9V208H683.7L532.4 586.4 360.3 208H137.7v12.9l71.6 86.6c7 6.4 10.6 15.8 9.7 25.2V673c2.2 12.3-1.7 24.8-10.3 33.7L128 805v12.7h228.6v-12.9l-80.6-98a39.99 39.99 0 01-11.1-33.7V378.7l200.7 439.2h23.3l172.6-439.2v349.9c0 9.2 0 11.1-6 17.2l-62.1 60.3V819h301.2v-12.9l-59.9-58.9c-5.2-4-7.9-10.7-6.8-17.2V297a18.1 18.1 0 016.8-17.2z"></path>
                    </svg>
                  </FooterLinkIcon>
                  <FooterLinkText
                    href="http://medium.com/ant-design/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Medium
                  </FooterLinkText>
                </FooterLink>
                <FooterLink>
                  <FooterLinkIcon>
                    <svg
                      viewBox="64 64 896 896"
                      focusable="false"
                      data-icon="twitter"
                      width="1em"
                      height="1em"
                      fill="rgb(29, 161, 242)"
                      aria-hidden="true"
                    >
                      <path d="M928 254.3c-30.6 13.2-63.9 22.7-98.2 26.4a170.1 170.1 0 0075-94 336.64 336.64 0 01-108.2 41.2A170.1 170.1 0 00672 174c-94.5 0-170.5 76.6-170.5 170.6 0 13.2 1.6 26.4 4.2 39.1-141.5-7.4-267.7-75-351.6-178.5a169.32 169.32 0 00-23.2 86.1c0 59.2 30.1 111.4 76 142.1a172 172 0 01-77.1-21.7v2.1c0 82.9 58.6 151.6 136.7 167.4a180.6 180.6 0 01-44.9 5.8c-11.1 0-21.6-1.1-32.2-2.6C211 652 273.9 701.1 348.8 702.7c-58.6 45.9-132 72.9-211.7 72.9-14.3 0-27.5-.5-41.2-2.1C171.5 822 261.2 850 357.8 850 671.4 850 843 590.2 843 364.7c0-7.4 0-14.8-.5-22.2 33.2-24.3 62.3-54.4 85.5-88.2z"></path>
                    </svg>
                  </FooterLinkIcon>
                  <FooterLinkText
                    href="http://twitter.com/antdesignui"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Twitter
                  </FooterLinkText>
                </FooterLink>
                <FooterLink>
                  <FooterLinkIcon>
                    <img
                      src="https://gw.alipayobjects.com/zos/rmsportal/XuVpGqBFxXplzvLjJBZB.svg"
                      alt="yuque"
                    />
                  </FooterLinkIcon>
                  <FooterLinkText
                    href="https://yuque.com/ant-design/ant-design"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Ant Design 语雀专栏
                  </FooterLinkText>
                </FooterLink>
                <FooterLink>
                  <FooterLinkIcon>
                    <svg
                      viewBox="64 64 896 896"
                      focusable="false"
                      data-icon="zhihu"
                      width="1em"
                      height="1em"
                      fill="rgb(5, 109, 232)"
                      aria-hidden="true"
                    >
                      <path d="M564.7 230.1V803h60l25.2 71.4L756.3 803h131.5V230.1H564.7zm247.7 497h-59.9l-75.1 50.4-17.8-50.4h-18V308.3h170.7v418.8zM526.1 486.9H393.3c2.1-44.9 4.3-104.3 6.6-172.9h130.9l-.1-8.1c0-.6-.2-14.7-2.3-29.1-2.1-15-6.6-34.9-21-34.9H287.8c4.4-20.6 15.7-69.7 29.4-93.8l6.4-11.2-12.9-.7c-.8 0-19.6-.9-41.4 10.6-35.7 19-51.7 56.4-58.7 84.4-18.4 73.1-44.6 123.9-55.7 145.6-3.3 6.4-5.3 10.2-6.2 12.8-1.8 4.9-.8 9.8 2.8 13 10.5 9.5 38.2-2.9 38.5-3 .6-.3 1.3-.6 2.2-1 13.9-6.3 55.1-25 69.8-84.5h56.7c.7 32.2 3.1 138.4 2.9 172.9h-141l-2.1 1.5c-23.1 16.9-30.5 63.2-30.8 65.2l-1.4 9.2h167c-12.3 78.3-26.5 113.4-34 127.4-3.7 7-7.3 14-10.7 20.8-21.3 42.2-43.4 85.8-126.3 153.6-3.6 2.8-7 8-4.8 13.7 2.4 6.3 9.3 9.1 24.6 9.1 5.4 0 11.8-.3 19.4-1 49.9-4.4 100.8-18 135.1-87.6 17-35.1 31.7-71.7 43.9-108.9L497 850l5-12c.8-1.9 19-46.3 5.1-95.9l-.5-1.8-108.1-123-22 16.6c6.4-26.1 10.6-49.9 12.5-71.1h158.7v-8c0-40.1-18.5-63.9-19.2-64.9l-2.4-3z"></path>
                    </svg>
                  </FooterLinkIcon>
                  <FooterLinkText
                    href="https://www.zhihu.com/column/c_1564262000561106944"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Ant Design 知乎专栏
                  </FooterLinkText>
                </FooterLink>
                <FooterLink>
                  <FooterLinkIcon>
                    <svg
                      viewBox="64 64 896 896"
                      focusable="false"
                      data-icon="zhihu"
                      width="1em"
                      height="1em"
                      fill="rgb(5, 109, 232)"
                      aria-hidden="true"
                    >
                      <path d="M564.7 230.1V803h60l25.2 71.4L756.3 803h131.5V230.1H564.7zm247.7 497h-59.9l-75.1 50.4-17.8-50.4h-18V308.3h170.7v418.8zM526.1 486.9H393.3c2.1-44.9 4.3-104.3 6.6-172.9h130.9l-.1-8.1c0-.6-.2-14.7-2.3-29.1-2.1-15-6.6-34.9-21-34.9H287.8c4.4-20.6 15.7-69.7 29.4-93.8l6.4-11.2-12.9-.7c-.8 0-19.6-.9-41.4 10.6-35.7 19-51.7 56.4-58.7 84.4-18.4 73.1-44.6 123.9-55.7 145.6-3.3 6.4-5.3 10.2-6.2 12.8-1.8 4.9-.8 9.8 2.8 13 10.5 9.5 38.2-2.9 38.5-3 .6-.3 1.3-.6 2.2-1 13.9-6.3 55.1-25 69.8-84.5h56.7c.7 32.2 3.1 138.4 2.9 172.9h-141l-2.1 1.5c-23.1 16.9-30.5 63.2-30.8 65.2l-1.4 9.2h167c-12.3 78.3-26.5 113.4-34 127.4-3.7 7-7.3 14-10.7 20.8-21.3 42.2-43.4 85.8-126.3 153.6-3.6 2.8-7 8-4.8 13.7 2.4 6.3 9.3 9.1 24.6 9.1 5.4 0 11.8-.3 19.4-1 49.9-4.4 100.8-18 135.1-87.6 17-35.1 31.7-71.7 43.9-108.9L497 850l5-12c.8-1.9 19-46.3 5.1-95.9l-.5-1.8-108.1-123-22 16.6c6.4-26.1 10.6-49.9 12.5-71.1h158.7v-8c0-40.1-18.5-63.9-19.2-64.9l-2.4-3z"></path>
                    </svg>
                  </FooterLinkIcon>
                  <FooterLinkText
                    href="http://zhuanlan.zhihu.com/xtech"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    体验科技专栏
                  </FooterLinkText>
                </FooterLink>
                <FooterLink>
                  <FooterLinkIcon>
                    <img
                      src="https://gw.alipayobjects.com/zos/rmsportal/mZBWtboYbnMkTBaRIuWQ.png"
                      alt="seeconf"
                    />
                  </FooterLinkIcon>
                  <FooterLinkText
                    href="https://seeconf.antfin.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    SEE Conf 蚂蚁体验科技大会
                  </FooterLinkText>
                </FooterLink>
              </FooterLinkList>
            </FooterColumn>

            {/* 帮助 */}
            {/* <FooterColumn>
              <FooterColumnTitle>帮助</FooterColumnTitle>
              <FooterLinkList>
                <FooterLink>
                  <FooterLinkIcon>
                    <img src="" alt="history" />
                  </FooterLinkIcon>
                  <FooterLinkText href="/changelog">更新日志</FooterLinkText>
                </FooterLink>
              </FooterLinkList>
            </FooterColumn> */}

            {/* 更多产品 */}
            <FooterColumn>
              <FooterColumnTitle>
                <FooterColumnIcon
                  src="https://gw.alipayobjects.com/zos/rmsportal/nBVXkrFdWHxbZlmMbsaH.svg"
                  alt="more products"
                />
                更多产品
              </FooterColumnTitle>
              <FooterLinkList>
                <FooterLink>
                  <FooterLinkIcon>
                    <img
                      src="https://gw.alipayobjects.com/zos/rmsportal/XuVpGqBFxXplzvLjJBZB.svg"
                      alt="yuque"
                    />
                  </FooterLinkIcon>
                  <FooterLinkText
                    href="https://yuque.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    语雀 - 知识创作与分享工具
                  </FooterLinkText>
                </FooterLink>
                <FooterLink>
                  <FooterLinkIcon>
                    <img
                      src="https://gw.alipayobjects.com/zos/antfincdn/nc7Fc0XBg5/8a6844f5-a6ed-4630-9177-4fa5d0b7dd47.png"
                      alt="AntV"
                    />
                  </FooterLinkIcon>
                  <FooterLinkText
                    href="https://antv.vision"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    AntV - 数据可视化解决方案
                  </FooterLinkText>
                </FooterLink>
                <FooterLink>
                  <FooterLinkIcon>
                    <img src="https://www.eggjs.org/logo.svg" alt="Egg" />
                  </FooterLinkIcon>
                  <FooterLinkText
                    href="https://eggjs.org"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Egg - 企业级 Node.js 框架
                  </FooterLinkText>
                </FooterLink>
                <FooterLink>
                  <FooterLinkIcon>
                    <img
                      src="https://gw.alipayobjects.com/zos/rmsportal/DMDOlAUhmktLyEODCMBR.ico"
                      alt="kitchen"
                    />
                  </FooterLinkIcon>
                  <FooterLinkText
                    href="https://kitchen.alipay.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Kitchen - Sketch 工具集
                  </FooterLinkText>
                </FooterLink>
                <FooterLink>
                  <FooterLinkIcon>
                    <img
                      src="https://gw.alipayobjects.com/zos/rmsportal/nBVXkrFdWHxbZlmMbsaH.svg"
                      alt="xtech"
                    />
                  </FooterLinkIcon>
                  <FooterLinkText
                    href="https://xtech.antfin.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    蚂蚁体验科技
                  </FooterLinkText>
                </FooterLink>
              </FooterLinkList>
            </FooterColumn>
          </FooterColumns>

          <FooterDivider />

          <FooterText>Copyright © 2022-2025 | Powered by dumi</FooterText>
        </FooterContainer>
      </Footer>
    </>
  );
};

export default QuickStart;
