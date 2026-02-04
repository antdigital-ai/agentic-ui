import React, { useState } from 'react';
import LinkIcon from '../../icons/link.svg';
import BoltIconSelected from './icons/bolt.png';
import BoltIcon from './icons/bolt.svg';
import ChartIconSelected from './icons/chart.png';
import ChartIcon from './icons/chart.svg';
import FlameIconSelected from './icons/flame.png';
import FlameIcon from './icons/flame.svg';
import GlassesIconSelected from './icons/glasses.png';
import GlassesIcon from './icons/glasses.svg';
import LightBlueIconSelected from './icons/light-blue.png';
import LightBlueIcon from './icons/light-blue.svg';
import LightPurpleIconSelected from './icons/light-purple.png';
import LightPurpleIcon from './icons/lightPurpleIcon.png';
import LightningIconSelected from './icons/lightning.png'; // 临时使用 SVG
import LightningIcon from './icons/lightning.svg';
import MagnifierIconSelected from './icons/magnifier.png'; // 临时使用 SVG 代替 PNG
import MagnifierIcon from './icons/magnifierIcon.png';
import RobotBottom from './icons/robot-bottom.png';
// Part1 - 机器人皮肤（根据 selectedSkin 选择）
import { AI_CHATBOT_URL } from '../../constants';
import GridIconSelected from './icons/grid.png';
import GridIcon from './icons/gridIcon.png';
import StripeIconSelected from './icons/stripe.png';
import StripeIcon from './icons/stripe.svg';
import SwirlIconSelected from './icons/swirl.png';
import SwirlIcon from './icons/swirl.svg';
import WaveIconSelected from './icons/wave.png';
import WaveIcon from './icons/wave.svg';
import {
  AvatarCard,
  AvatarCardContent,
  CategoryContainer,
  CategoryLabel,
  CategoryLabelEn,
  CentralAvatar,
  Container,
  ExpandIcon,
  LabelCard,
  RobotBottomContainer,
  RobotTopContainer,
  SectionSubtitle,
  SectionTitle,
  SectionWrapper,
} from './style';

const AIChatbot: React.FC = () => {
  const [selectedDressing, setSelectedDressing] = useState(7); // 放大镜选项
  const [selectedSkin, setSelectedSkin] = useState(1); // 紫色皮肤选项

  // 个性装扮选项（10个）
  const dressingOptions = [
    {
      id: 0,
      icon: ChartIcon,
      name: 'Chart',
      iconSelected: ChartIconSelected,
      iconPosition: 'back',
    },
    {
      id: 1,
      icon: WaveIcon,
      name: 'Wave',
      iconSelected: WaveIconSelected,
      iconPosition: 'back',
    },
    {
      id: 2,
      icon: StripeIcon,
      name: 'Stripe',
      iconSelected: StripeIconSelected,
      iconPosition: 'back',
    },
    {
      id: 3,
      icon: LightningIcon,
      name: 'Lightning',
      iconSelected: LightningIconSelected,
    },
    {
      id: 4,
      icon: SwirlIcon,
      name: 'Swirl',
      iconSelected: SwirlIconSelected,
      iconPosition: 'back',
    },
    {
      id: 5,
      icon: BoltIcon,
      name: 'Bolt',
      iconSelected: BoltIconSelected,
      iconPosition: 'back',
    },
    { id: 6, icon: FlameIcon, name: 'Flame', iconSelected: FlameIconSelected },
    {
      id: 7,
      icon: MagnifierIcon,
      name: 'Magnifier',
      iconSelected: MagnifierIconSelected,
    },
    {
      id: 8,
      icon: GlassesIcon,
      name: 'Glasses',
      iconSelected: GlassesIconSelected,
    },
    { id: 9, icon: GridIcon, name: 'Grid', iconSelected: GridIconSelected },
  ];

  // 肤色选项（2个）
  const skinOptions = [
    {
      id: 0,
      icon: LightBlueIcon,
      name: 'Light Blue',
      iconSelected: LightBlueIconSelected,
    },
    {
      id: 1,
      icon: LightPurpleIcon,
      name: 'Light Purple',
      iconSelected: LightPurpleIconSelected,
    },
  ];

  // 处理点击事件，暂停自动播放
  const handleDressingClick = (id: number) => {
    setSelectedDressing(id);
  };

  const handleSkinClick = (id: number) => {
    setSelectedSkin(id);
  };

  return (
    <div
      style={{
        padding: '0 16px',
        minWidth: '1088px',
        maxWidth: '1472px',
        margin: '0 auto',
        width: '100%',
      }}
    >
      <SectionWrapper>
        <Container>
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
              }}
            >
              <div>
                <SectionTitle style={{ marginRight: '8px' }}>AI</SectionTitle>
                <SectionTitle>Chatbot</SectionTitle>
                <SectionSubtitle>自定义你的 AI 形象</SectionSubtitle>
              </div>
              <ExpandIcon
                onClick={() => {
                  window.open(AI_CHATBOT_URL);
                }}
              >
                <img
                  src={LinkIcon}
                  alt=""
                  style={{ width: '8px', height: '8px' }}
                />
              </ExpandIcon>
            </div>
          </div>

          {/* 中央 AI 头像 */}
          <CentralAvatar>
            <div
              style={{
                position: 'relative',
                width: '167.45px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <RobotTopContainer>
                {/* Part1 + Part2 组合显示 */}
                <div
                  style={{
                    position: 'relative',
                    width: '228px',
                    height: '228px',
                  }}
                >
                  {/* Part2 - Dress 装饰（如果是 back 则在底层） */}
                  {dressingOptions[selectedDressing]?.iconPosition ===
                    'back' && (
                    <img
                      src={
                        dressingOptions[selectedDressing]?.iconSelected ||
                        dressingOptions[selectedDressing]?.icon
                      }
                      alt="Robot Dress"
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        width: '228px',
                        height: '228px',
                        display: 'block',
                        objectFit: 'contain',
                        zIndex: 1,
                      }}
                    />
                  )}

                  {/* Part1 - Skin 机器人身体 */}
                  <img
                    src={
                      skinOptions[selectedSkin]?.iconSelected ||
                      skinOptions[selectedSkin]?.icon
                    }
                    alt="Robot Skin"
                    style={{
                      position: 'absolute',
                      left: '30px',
                      top: '40px',
                      width: '148px',
                      height: '148px',
                      display: 'block',
                      zIndex: 2,
                    }}
                  />

                  {/* Part2 - Dress 装饰（如果不是 back 则在顶层） */}
                  {dressingOptions[selectedDressing]?.iconPosition !==
                    'back' && (
                    <img
                      src={
                        dressingOptions[selectedDressing]?.iconSelected ||
                        dressingOptions[selectedDressing]?.icon
                      }
                      alt="Robot Dress"
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        width: '228px',
                        height: '228px',
                        display: 'block',
                        objectFit: 'contain',
                        zIndex: 3,
                      }}
                    />
                  )}
                </div>
              </RobotTopContainer>
              <RobotBottomContainer>
                <img
                  src={RobotBottom}
                  alt="Robot Bottom"
                  style={{
                    width: '82px',
                    height: 'auto',
                    display: 'block',
                    marginTop: '-20px', // 让两张图片无缝连接
                  }}
                />
              </RobotBottomContainer>
            </div>
          </CentralAvatar>

          {/* 分类选项区域 */}
          <CategoryContainer>
            {/* 个性装扮标签卡片 */}
            <LabelCard>
              <AvatarCardContent>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    height: '100%',
                    background: 'rgba(0, 28, 57, 0.03)',
                    borderRadius: '12px',
                  }}
                >
                  <CategoryLabel>个性装扮</CategoryLabel>
                  <CategoryLabelEn>Dressing</CategoryLabelEn>
                </div>
              </AvatarCardContent>
            </LabelCard>

            {/* 个性装扮选项 */}
            {dressingOptions.map((option, index) => (
              <AvatarCard
                key={option.id}
                $selected={selectedDressing === option.id}
                onClick={() => handleDressingClick(option.id)}
                style={
                  index === dressingOptions.length - 1
                    ? { marginRight: 'clamp(12px, 4vw, 48px)' }
                    : undefined
                }
              >
                <AvatarCardContent>
                  <img
                    src={option.icon}
                    alt={option.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      // ...(option.name === 'Magnifier' || option.name === 'Grid'
                      //   ? {
                      //       background: 'rgba(0, 28, 57, 0.03)',
                      //       borderRadius: '8px',
                      //     }
                      //   : {}),
                    }}
                  />
                </AvatarCardContent>
              </AvatarCard>
            ))}

            {/* 肤色标签卡片 */}
            <LabelCard>
              <AvatarCardContent>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    height: '100%',
                    background: 'rgba(0, 28, 57, 0.03)',
                    borderRadius: '8px',
                  }}
                >
                  <CategoryLabel>肤色</CategoryLabel>
                  <CategoryLabelEn>Skin</CategoryLabelEn>
                </div>
              </AvatarCardContent>
            </LabelCard>

            {/* 肤色选项 */}
            {skinOptions.map((option) => (
              <AvatarCard
                key={option.id}
                $selected={selectedSkin === option.id}
                onClick={() => handleSkinClick(option.id)}
              >
                <AvatarCardContent>
                  <img
                    src={option.icon}
                    alt={option.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      // ...(option.name === 'Light Purple'
                      //   ? {
                      //       background: 'rgba(0, 28, 57, 0.03)',
                      //       borderRadius: '8px',
                      //     }
                      //   : {}),
                    }}
                  />
                </AvatarCardContent>
              </AvatarCard>
            ))}
          </CategoryContainer>
        </Container>
      </SectionWrapper>
    </div>
  );
};

export default AIChatbot;
