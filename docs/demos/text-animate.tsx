import { TextAnimate } from '@ant-design/agentic-ui';
import React from 'react';

const SAMPLE = '智能体正在为你介绍这个组件，每个字 / 词都会依次淡入。';

export default () => (
  <div
    style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: 24 }}
  >
    <section>
      <h4 style={{ margin: '0 0 8px' }}>按词淡入（默认）</h4>
      <TextAnimate as="p" style={{ fontSize: 18, margin: 0 }}>
        {SAMPLE}
      </TextAnimate>
    </section>

    <section>
      <h4 style={{ margin: '0 0 8px' }}>按字符模糊上滑</h4>
      <TextAnimate
        as="p"
        by="character"
        animation="blurInUp"
        duration={0.4}
        style={{ fontSize: 18, margin: 0 }}
      >
        {SAMPLE}
      </TextAnimate>
    </section>

    <section>
      <h4 style={{ margin: '0 0 8px' }}>按词左滑入场</h4>
      <TextAnimate
        as="p"
        by="word"
        animation="slideLeft"
        duration={0.5}
        style={{ fontSize: 18, margin: 0 }}
      >
        {SAMPLE}
      </TextAnimate>
    </section>

    <section>
      <h4 style={{ margin: '0 0 8px' }}>按行渐显</h4>
      <TextAnimate
        as="p"
        by="line"
        animation="fadeIn"
        style={{ fontSize: 16, margin: 0, whiteSpace: 'pre-line' }}
      >
        {`第一行：用户提出问题。
第二行：智能体开始思考。
第三行：智能体给出答案。`}
      </TextAnimate>
    </section>
  </div>
);
