import ChartIcon from '../../../icons/chart.svg';
import ColorPencilIcon from '../../../icons/color-pencil.svg';
import OtherIcon from '../../../icons/other.svg';
import ReadIcon from '../../../icons/read.svg';
import TranslateIcon from '../../../icons/translate.svg';
import WriteIcon from '../../../icons/write.svg';
import React from 'react';
import {
  ActionIconBox,
  ActionItemBox,
  ActionItemContainer,
  CreateRecognizer,
  MarkdownInputField,
  ToggleButton,
} from '@ant-design/agentic-ui';
import { AimOutlined, GlobalOutlined } from '@ant-design/icons';
import { CardDescription, CardTitle, DesignCard } from '../style';

const createRecognizer: CreateRecognizer = async ({ onPartial }) => {
  let timer: ReturnType<typeof setInterval>;
  return {
    start: async () => {
      // 真实场景应启动麦克风与ASR服务，这里仅用计时器模拟持续的转写片段
      let i = 0;
      timer = setInterval(() => {
        onPartial(`语音片段${i} `);
        i += 1;
      }, 500);
    },
    stop: async () => {
      clearInterval(timer);
    },
  };
};

const SuperInputCard: React.FC = () => {
  const [value, setValue] = React.useState('');

  return (
    <DesignCard>
      <CardTitle>超级输入框</CardTitle>
      <CardDescription>
        用户与 AI
        交互的核心入口，集成了文本、语音、图像等多种输入方式和拓展能力，通过实时解析和反馈，实现自然、高效的人机对话。
      </CardDescription>
      <div style={{ margin: '24px 0' }}>
        <MarkdownInputField
          voiceRecognizer={createRecognizer}
          value={value}
          onChange={(newValue) => {
            setValue(newValue);
          }}
          placeholder="请输入问题..."
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
                name: '翻译',
                icon: (
                  <img
                    src={TranslateIcon}
                    alt="翻译"
                    style={{ width: 20, height: 20 }}
                  />
                ),
              },
              {
                name: '阅读',
                icon: (
                  <img
                    src={ReadIcon}
                    alt="阅读"
                    style={{ width: 20, height: 20 }}
                  />
                ),
              },
              {
                name: '图表',
                icon: (
                  <img
                    src={ChartIcon}
                    alt="图表"
                    style={{ width: 20, height: 20 }}
                  />
                ),
              },
              {
                name: '写作',
                icon: (
                  <img
                    src={WriteIcon}
                    alt="写作"
                    style={{ width: 20, height: 20 }}
                  />
                ),
              },
              {
                name: '其他',
                icon: (
                  <img
                    src={OtherIcon}
                    alt="其他"
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
              深度思考
            </ToggleButton>,
            <ToggleButton
              key="internetSearch"
              icon={<GlobalOutlined />}
              onClick={() => console.log('联网搜索 clicked')}
            >
              联网搜索
            </ToggleButton>,
          ]}
          actionsRender={(props, defaultActions) => {
            return [
              <ActionIconBox
                showTitle={props.collapseSendActions}
                title="提示词库"
                key="prompt"
                style={{
                  padding: 8,
                  fontSize: 16,
                }}
              >
                <img
                  src={ColorPencilIcon}
                  alt="提示词库"
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
