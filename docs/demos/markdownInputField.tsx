import {
  MarkdownEditorInstance,
  MarkdownInputField,
} from '@ant-design/agentic-ui';
import { ChevronDown } from '@sofa-design/icons';
import { Dropdown, Slider } from 'antd';
import React, { useEffect, useState } from 'react';

const TEMPLATE_VALUE =
  '帮我查询`${placeholder:目标企业}` `${placeholder:近3年;initialValue:近6年}`的`${placeholder:资产总额}`。';

const TAG_ITEMS = ['tag1', 'tag2', 'tag3'].map((item) => ({
  key: item,
  label: item,
}));

const TAG_STYLE = {
  background: '#EEF1FF',
  color: '#4C4BDF',
  lineHeight: '22px',
  borderWidth: 0,
};

const tagTextRender = (_props: any, text: string) => text.replaceAll('$', '');

const TagRender: React.FC<{
  onSelect: (value: string) => void;
  defaultDom: React.ReactNode;
  placeholder: string;
  readonly?: boolean;
  style?: React.CSSProperties;
}> = ({ onSelect, defaultDom, readonly }) => {
  const [items] = useState([
    { key: '1', label: '选项1' },
    { key: '2', label: '选项2' },
    { key: '3', label: '选项3' },
  ]);

  return (
    <Dropdown
      disabled={readonly}
      menu={{
        items,
        onClick: (e) => {
          const item = items.find((i) => i.key === e.key);
          if (item) onSelect?.(item.label);
        },
      }}
      trigger={['click']}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {defaultDom}
        <ChevronDown style={{ color: '#999', fontSize: 12 }} />
      </div>
    </Dropdown>
  );
};

export default () => {
  const markdownRef = React.useRef<MarkdownEditorInstance>();
  const markdownRefTwo = React.useRef<MarkdownEditorInstance>();
  const [list, setList] = useState<Set<string>>(() => new Set());
  const [borderRadius, setBorderRadius] = useState(0);

  const handleSend = async (value: string) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setList((prev) => {
      const next = new Set(prev);
      next.add(value);
      return next;
    });
  };

  useEffect(() => {
    markdownRefTwo.current?.store?.setMDContent(TEMPLATE_VALUE);
  }, []);

  return (
    <div style={{ padding: 20, margin: 'auto', maxWidth: 800, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        圆角：
        <Slider value={borderRadius} onChange={setBorderRadius} />
      </div>

      <ul>
        {[...list].map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>

      <h2>基本</h2>
      <MarkdownInputField
        style={{ minHeight: 66 }}
        value={TEMPLATE_VALUE}
        inputRef={markdownRefTwo}
        borderRadius={borderRadius}
        tagInputProps={{
          enable: true,
          items: async (props) =>
            ['tag1', 'tag2', 'tag3'].map((item) => ({
              key: item,
              label: props?.placeholder + item,
            })),
        }}
        onSend={handleSend}
        onStop={() => console.log('stop...')}
        placeholder="请输入内容"
      />

      <h2>dropdownRender</h2>
      <MarkdownInputField
        style={{ minHeight: 66 }}
        value={TEMPLATE_VALUE}
        inputRef={markdownRefTwo}
        borderRadius={borderRadius}
        tagInputProps={{
          dropdownRender: (defaultDom, props) => (
            <div>
              placeholder: {props.placeholder} text: {props.text}
              {defaultDom}
            </div>
          ),
          tagTextStyle: TAG_STYLE,
          tagTextRender,
          enable: true,
          items: async (props) =>
            ['tag1', 'tag2', 'tag3'].map((item) => ({
              key: item,
              label: props?.placeholder + item,
            })),
        }}
        onSend={handleSend}
        onStop={() => console.log('stop...')}
        placeholder="请输入内容"
      />

      <h2>自定义的 Tag</h2>
      <MarkdownInputField
        inputRef={markdownRef}
        value={TEMPLATE_VALUE}
        tagInputProps={{
          dropdownRender: () => null,
          tagTextStyle: TAG_STYLE,
          tagTextRender,
          enable: true,
          items: TAG_ITEMS,
          tagRender: (props, defaultDom: React.ReactNode) => (
            <TagRender
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              defaultDom={defaultDom}
              placeholder={props.placeholder || ''}
              onSelect={(value: string) => props.onSelect?.(value, { value: '123' })}
            />
          ),
        }}
        onSend={handleSend}
        onStop={() => console.log('stop...')}
        placeholder="请输入内容"
      />

      <h2>文件上传</h2>
      <MarkdownInputField
        borderRadius={borderRadius}
        attachment={{
          enable: true,
          upload: async (file) => {
            return new Promise((resolve) => {
              setTimeout(() => resolve(URL.createObjectURL(file)), 1000);
            });
          },
          onDelete: async (file) => URL.revokeObjectURL(file.previewUrl!),
        }}
        value={TEMPLATE_VALUE}
        tagInputProps={{ enable: true, items: TAG_ITEMS }}
        onSend={handleSend}
        onStop={() => console.log('stop...')}
        placeholder="请输入内容"
      />

      <h2>滚动条</h2>
      <MarkdownInputField
        borderRadius={borderRadius}
        tagInputProps={{ enable: true, items: TAG_ITEMS }}
        onSend={handleSend}
        value={'《原神》克洛琳德将于6月正式上线，官方也放出了克洛琳德的突破材料，那么克洛琳德的突破材料都是什么，又要在哪里采集呢？下面请看由\u201C关蝎\u201D为大家分享的《原神》克洛琳德突破材料一览，希望可以帮助到大家。《原神》克洛琳德将于6月正式上线，官方也放出了克洛琳德的突破材料，那么克洛琳德的突破材料都是什么，又要在哪里采集呢？下面请看由\u201C关蝎\u201D为大家分享的《原神》克洛琳德突破材料一览，希望可以帮助到大家。《原神》克洛琳德将于6月正式上线，官方也放出了克洛琳德的突破材料，那么克洛琳德的突破材料都是什么，又要在哪里采集呢？下面请看由\u201C关蝎\u201D为大家分享的《原神》克洛琳德突破材料一览，希望可以帮助到大家。《原神》克洛琳德将于6月正式上线，官方也放出了克洛琳德的突破材料，那么克洛琳德的突破材料都是什么，又要在哪里采集呢？下面请看由\u201C关蝎\u201D为大家分享的《原神》克洛琳德突破材料一览，希望可以帮助到大家。'}
        onStop={() => console.log('stop...')}
        placeholder="请输入内容"
      />

      <h2>disable</h2>
      <MarkdownInputField
        borderRadius={borderRadius}
        onSend={handleSend}
        disabled
        value={TEMPLATE_VALUE}
        placeholder="请输入内容"
      />
    </div>
  );
};
