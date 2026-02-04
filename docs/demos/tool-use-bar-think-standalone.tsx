import { ToolUseBarThink } from '@ant-design/agentic-ui';
import React, { useEffect, useState } from 'react';

const fullThinkContent = `好的，我现在需要帮用户汇总谷歌I/O 2025大会的重要信息。首先，我得仔细看看用户提供的搜索结果，找出相关的信息点。
      用户给了19个网页的结果，我需要逐一浏览，提取关键内容。
      首先，大会的时间和地点。网页1、2、5、10、12、16都提到了时间，大部分说是在5月20日至21日举行，地点是加州山景城的Shoreline Amphitheatre。网页3和12提到具体日程，主题演讲在凌晨1点开始，开发者主题演讲在4：30 am。不过要注意时区转换，比如网页5提到北京时间是5月21日凌晨，这可能对国内用户来说需要换算时间。
      接下来是大会的主要内容和亮点。AI肯定是重点，多个网页提到Gemini的更新，比如网页3、9、10、11、13、18. Gemini 2 5 Pro模型会被详细介绍，可能还有订阅服务的变化。网页18还提到250美元的UItra会员，这可能和Gemini Advanced有关。
      此外，Project Astra作为下一代AI助手，网页3、10、13都有提到，可能涉及移动和可穿戴设备。
      需要整合这些信息，分时间地点、核心内容、硬件动态、其他产品、合作与竞争几个部分。注意引用多个网页，避免重复引用同一个网页。比如AI部分可以引用网页3、9、10、11、13、18，智能眼镜引用4、6、7、8、19等。确保每个点都有对应的引用，并且正确标注。需要整合这些信息，分时间地点、核心内容、硬件动态、其他产品、合作与竞争几个部分。注意引用多个网页，避免重复引用同一个网页。比如AI部分可以引用网页3、9、10、11、13、18，智能眼镜引用4、6、7、8、19等。确保每个点都有对应的引用，并且正确标注。需要整合这些信息，分时间地点、核心内容、硬件动态、其他产品、合作与竞争几个部分。注意引用多个网页，避免重复引用同一个网页。比如AI部分可以引用网页3、9、10、11、13、18，智能眼镜引用4、6、7、8、19等。确保每个点都有对应的引用，并且正确标注。需要整合这些信息，分时间地点、核心内容、硬件动态、其他产品、合作与竞争几个部分。注意引用多个网页，避免重复引用同一个网页。比如AI部分可以引用网页3、9、10、11、13、18，智能眼镜引用4、6、7、8、19等。确保每个点都有对应的引用，并且正确标注。`;

const ToolUseBarThinkDemo = () => {
  const [expanded, setExpanded] = useState(false);
  const [floatingExpanded, setFloatingExpanded] = useState(false);
  const [thinkContent, setThinkContent] = useState(
    `好的，我现在需要帮用户汇总谷歌I/O 2025大会的重要信息。`,
  );
  const [currentIndex, setCurrentIndex] = useState(100);

  useEffect(() => {
    if (currentIndex < fullThinkContent.length) {
      const timer = setTimeout(() => {
        // 每次添加一定数量的字符，模拟思考流
        const chunkSize = Math.floor(Math.random() * 10) + 5; // 每次添加5-15个字符
        setThinkContent(fullThinkContent.slice(0, currentIndex + chunkSize));
        setCurrentIndex(currentIndex + chunkSize);
      }, 100); // 每100ms添加一次

      return () => clearTimeout(timer);
    }
  }, [currentIndex]);

  const isLoading = currentIndex < fullThinkContent.length;
  return (
    <div style={{ padding: '12px' }}>
      <h3>ToolUseBarThink 不同状态对比</h3>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          width: '100vw',
        }}
      >
        {/* Loading 状态 */}
        <div style={{ flex: 1, maxWidth: '500px' }}>
          <h4>Loading 状态 </h4>
          <ToolUseBarThink
            toolName="思考中..."
            toolTarget="分析需求"
            time="2.3s"
            status={isLoading ? 'loading' : 'success'}
            expanded={expanded}
            onExpandedChange={setExpanded}
            floatingExpanded={floatingExpanded}
            onFloatingExpandedChange={setFloatingExpanded}
            thinkContent={thinkContent}
          />
        </div>

        {/* Success 状态 */}
        <div style={{ flex: 1, maxWidth: '500px' }}>
          <h4>Success 状态 </h4>

          <ToolUseBarThink
            toolName="思考完成"
            toolTarget="分析需求"
            time="2.3s"
            status="success"
            thinkContent={thinkContent}
          />
        </div>

        {/* Error 状态 */}
        <div style={{ flex: 1, maxWidth: '500px' }}>
          <h4>轻量思考 状态 </h4>

          <ToolUseBarThink
            light
            toolName="轻量思考"
            thinkContent={thinkContent}
          />
        </div>
      </div>
    </div>
  );
};

export default ToolUseBarThinkDemo;
