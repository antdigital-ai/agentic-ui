import {
  ActionIconBox,
  ActionItemBox,
  ActionItemContainer,
  CreateRecognizer,
  MarkdownInputField,
  ToggleButton,
} from '@ant-design/agentic-ui';
import { AimOutlined, GlobalOutlined } from '@ant-design/icons';
import React from 'react';
import { useSiteI18n } from '../../../i18n';
import ChartIcon from '../../../icons/chart.svg';
import ColorPencilIcon from '../../../icons/color-pencil.svg';
import OtherIcon from '../../../icons/other.svg';
import ReadIcon from '../../../icons/read.svg';
import TranslateIcon from '../../../icons/translate.svg';
import WriteIcon from '../../../icons/write.svg';
import { CardDescription, CardTitle, DesignCard } from '../style';

const createVoiceRecognizer = (segmentLabel: string): CreateRecognizer => {
  return async ({ onPartial }) => {
    let timer: ReturnType<typeof setInterval>;
    return {
      start: async () => {
        // 真实场景应启动麦克风与ASR服务，这里仅用计时器模拟持续的转写片段
        let i = 0;
        timer = setInterval(() => {
          onPartial(`${segmentLabel}${i} `);
          i += 1;
        }, 500);
      },
      stop: async () => {
        clearInterval(timer);
      },
    };
  };
};

const SuperInputCard: React.FC = () => {
  const [value, setValue] = React.useState('');
  const { messages } = useSiteI18n();
  const skillMessages = messages.support.superInput.skills;

  return (
    <DesignCard>
      <CardTitle>{messages.support.superInput.title}</CardTitle>
      <CardDescription>
        {messages.support.superInput.description}
      </CardDescription>
      <div style={{ margin: '24px 0' }}>
        <MarkdownInputField
          voiceRecognizer={createVoiceRecognizer(
            messages.support.superInput.voiceSegment,
          )}
          value={value}
          onChange={(newValue) => {
            setValue(newValue);
          }}
          placeholder={messages.support.superInput.placeholder}
          attachment={{
            enable: true,
            maxFileSize: 10 * 1024 * 1024, // 10MB
            upload: async (file) => {
              // 模拟上传文件
              // eslint-disable-next-line no-promise-executor-return
              await new Promise<void>((resolve) => setTimeout(resolve, 1000));
              return URL.createObjectURL(file);
            },
            onDelete: async (file) => {
              console.log('删除文件:', file);
              // eslint-disable-next-line no-promise-executor-return
              await new Promise<void>((resolve) => setTimeout(resolve, 500));
            },
          }}
          tagInputProps={{
            type: 'dropdown',
            enable: true,
            items: async (props) => {
              return ['tag1', 'tag2', 'tag3'].map((item) => ({
                key: item,
                label: (props?.placeholder || '') + item,
              }));
            },
          }}
          beforeToolsRender={() => {
            const skills: Array<{ name: string; icon: React.ReactElement }> = [
              {
                name: skillMessages.translate,
                icon: (
                  <img
                    src={TranslateIcon}
                    alt={skillMessages.translate}
                    style={{ width: 20, height: 20 }}
                  />
                ),
              },
              {
                name: skillMessages.read,
                icon: (
                  <img
                    src={ReadIcon}
                    alt={skillMessages.read}
                    style={{ width: 20, height: 20 }}
                  />
                ),
              },
              {
                name: skillMessages.chart,
                icon: (
                  <img
                    src={ChartIcon}
                    alt={skillMessages.chart}
                    style={{ width: 20, height: 20 }}
                  />
                ),
              },
              {
                name: skillMessages.write,
                icon: (
                  <img
                    src={WriteIcon}
                    alt={skillMessages.write}
                    style={{ width: 20, height: 20 }}
                  />
                ),
              },
              {
                name: skillMessages.other,
                icon: (
                  <img
                    src={OtherIcon}
                    alt={skillMessages.other}
                    style={{ width: 20, height: 20 }}
                  />
                ),
              },
            ];

            return (
              <ActionItemContainer showMenu={true}>
                {/* @ts-ignore - ActionItemContainer children type issue */}
                {skills.map((skill) => (
                  <ActionItemBox
                    onClick={() => console.log('快捷技能:', skill.name)}
                    size="small"
                    title={
                      <span
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                        }}
                      >
                        {skill.icon}
                        {skill.name}
                      </span>
                    }
                    key={skill.name}
                  />
                ))}
              </ActionItemContainer>
            );
          }}
          toolsRender={() => [
            <ToggleButton
              key="deepThink"
              icon={<AimOutlined />}
              onClick={() => console.log('深度思考 clicked')}
            >
              {messages.support.superInput.deepThink}
            </ToggleButton>,
            <ToggleButton
              key="internetSearch"
              icon={<GlobalOutlined />}
              onClick={() => console.log('联网搜索 clicked')}
            >
              {messages.support.superInput.webSearch}
            </ToggleButton>,
          ]}
          actionsRender={(state, defaultActions) => {
            return [
              <ActionIconBox
                showTitle={state.collapseSendActions}
                title={messages.support.superInput.promptLibrary}
                key="prompt"
                style={{
                  padding: 8,
                  fontSize: 16,
                }}
              >
                <img
                  src={ColorPencilIcon}
                  alt={messages.support.superInput.promptLibrary}
                  style={{ width: 15, height: 15 }}
                />
              </ActionIconBox>,
              ...defaultActions,
            ];
          }}
          onSend={async (text) => {
            console.log('发送内容:', text);
            // eslint-disable-next-line no-promise-executor-return
            await new Promise<void>((resolve) => setTimeout(resolve, 1000));
          }}
        />
      </div>
    </DesignCard>
  );
};

export default SuperInputCard;
