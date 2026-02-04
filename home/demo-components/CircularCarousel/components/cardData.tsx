import audio from '../../../assets/backsidecard/02/audio.png';
import capabilityToggle from '../../../assets/backsidecard/02/capability-toggle.png';
import contentBlock from '../../../assets/backsidecard/02/content-block.png';
import imageFile from '../../../assets/backsidecard/02/image-file.png';
import input from '../../../assets/backsidecard/02/input.png';
import model from '../../../assets/backsidecard/02/model.png';
import regenerate from '../../../assets/backsidecard/02/regenerate.png';
import textInput from '../../../assets/backsidecard/02/text-input.png';
import authority from '../../../assets/backsidecard/03/authority.png';
import chart from '../../../assets/backsidecard/03/chart.png';
import code from '../../../assets/backsidecard/03/code.png';
import footer from '../../../assets/backsidecard/03/footer.png';
import isuseful from '../../../assets/backsidecard/03/isuseful.png';
import markdown from '../../../assets/backsidecard/03/markdown.png';
import mutiresult from '../../../assets/backsidecard/03/mutiresult.png';
import video from '../../../assets/backsidecard/03/video.png';
import aiCapability from '../../../assets/backsidecard/04/ai-capability.png';
import aiAbility from '../../../assets/backsidecard/04/ai_ability.png';
import aiAssistant from '../../../assets/backsidecard/04/ai_assistant.png';
import inlineAction from '../../../assets/backsidecard/04/inline-action.png';
import caseReplayCard from '../../../assets/backsidecard/case-replay-card.png';
import caseReplay from '../../../assets/backsidecard/case-replay.png';
import promptCenter from '../../../assets/backsidecard/prompt-center.png';
import skillModeEntryCard from '../../../assets/backsidecard/skill-mode-entry-card.png';
import suggestionPrompts from '../../../assets/backsidecard/suggestion-prompts.png';
import welcomeMessageCard from '../../../assets/backsidecard/welcome-message-card.png';
import React from 'react';
import { BacksideCard } from './BacksideCards';

export interface CardItem {
  id: number;
  component: React.ReactElement;
}

// Feature 01: 精准预期 - 对话启动与意图确立
export const baseCards: CardItem[] = [
  {
    id: 1,
    component: (
      <BacksideCard title="案例回放 CaseReplay" src={caseReplayCard} />
    ),
  },
  {
    id: 2,
    component: (
      <BacksideCard
        title="欢迎语 WelcomeMessage"
        src={welcomeMessageCard}
        height="147px"
      />
    ),
  },
  {
    id: 3,
    component: (
      <BacksideCard
        title="技能入口 SkillModeEntry"
        src={skillModeEntryCard}
        height="187px"
      />
    ),
  },
  {
    id: 4,
    component: (
      <BacksideCard title="提示词模版 PromptTemplate" src={caseReplay} />
    ),
  },
  {
    id: 5,
    component: (
      <BacksideCard title="指令中心 PromptCenter" src={promptCenter} />
    ),
  },
  {
    id: 6,
    component: (
      <BacksideCard
        title="推荐指令 Suggested Prompts"
        src={suggestionPrompts}
      />
    ),
  },
];

// Feature 02: 精准理解和控制 - 意图表达与澄清阶段
export const baseCards02: CardItem[] = [
  {
    id: 11,
    component: <BacksideCard title="语音输入" src={audio} />,
  },
  {
    id: 12,
    component: (
      <BacksideCard title="能力开关 CapabilityToggle" src={capabilityToggle} />
    ),
  },
  {
    id: 13,
    component: (
      <BacksideCard
        title="内容块引用 Content Block Citation "
        src={contentBlock}
      />
    ),
  },
  {
    id: 14,
    component: <BacksideCard title="图片附件" src={imageFile} />,
  },
  {
    id: 15,
    component: <BacksideCard title="槽位输入" src={input} />,
  },
  {
    id: 16,
    component: <BacksideCard title="模型选项" src={model} />,
  },
  {
    id: 17,
    component: <BacksideCard title="重新生成" src={regenerate} />,
  },
  {
    id: 18,
    component: <BacksideCard title="开放式文本输入" src={textInput} />,
  },
];

// Feature 03: 精准交付 - AI生成结果的精确性与易读性
export const basecard03: CardItem[] = [
  {
    id: 19,
    component: <BacksideCard title="数据所有权告知" src={authority} />,
  },
  {
    id: 20,
    component: <BacksideCard title="基础图表" src={chart} />,
  },
  {
    id: 21,
    component: <BacksideCard title="代码块" src={code} />,
  },
  {
    id: 22,
    component: <BacksideCard title="脚注 Footer" src={footer} />,
  },
  {
    id: 23,
    component: <BacksideCard title="是否有用" src={isuseful} />,
  },
  {
    id: 24,
    component: <BacksideCard title="Markdown文档排版" src={markdown} />,
  },
  {
    id: 25,
    component: <BacksideCard title="呈现多项结果" src={mutiresult} />,
  },
  {
    id: 26,
    component: <BacksideCard title="视频" src={video} />,
  },
];

// Feature 04: 精准协同 - 集成的精准是流程的保障
export const baseCards04: CardItem[] = [
  {
    id: 7,
    component: (
      <BacksideCard title="AI 功能入口 AI AbilityButton" src={aiAbility} />
    ),
  },
  {
    id: 8,
    component: (
      <BacksideCard title="AI 助理入口 AI Assistant" src={aiAssistant} />
    ),
  },
  {
    id: 9,
    component: (
      <BacksideCard title="内联菜单 InlineAction" src={inlineAction} />
    ),
  },
  {
    id: 10,
    component: (
      <BacksideCard
        title="AI 能力展示卡片 AI Capability Card"
        src={aiCapability}
      />
    ),
  },
];

/**
 * 根据 feature.id 获取对应的卡片数组
 * @param featureId - Feature ID ('01', '02', '03', '04', '05')
 * @returns 对应的卡片数组
 */
export function getCardsByFeatureId(featureId?: string): CardItem[] {
  switch (featureId) {
    case '02':
      return baseCards02;
    case '03':
      return basecard03;
    case '04':
      return baseCards04;
    case '01':
    case '05':
    default:
      // '01' 和 '05' 都使用 baseCards，其他情况也回退到 baseCards
      return baseCards;
  }
}
