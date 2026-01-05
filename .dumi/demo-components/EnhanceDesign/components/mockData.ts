export const mockData = {
  records: [
    {
      id: 2,
      title: '内置七日天气卡片',
      attachmentUrl:
        'https://dtaiagtmng.antgroup-inc.cn/file/download/agent/icon/default/e6ef8f71430542b7b724eaf34fd5b1c5?fileKey=screenshot-4a89518b-c5fb-4de6-86ae-ad429f821dea.png',
      description: '七日预报卡片，展示天气和 最高 最低',
      creatorId: 27,
      creatorName: '期贤',
      modifierName: '期贤',
      schemaConfig: {
        component: {
          schema:
            '<div style="font-family: \'Segoe UI\', system-ui, sans-serif; min-width: 300px;max-width: 800px; margin: 1.5rem auto; background: linear-gradient(to bottom, #ffffff, #f0f5ff); border-radius: 20px;  padding: 1.5rem; position: relative; overflow: hidden;"><div style="position: absolute; top: 0; right: 0; width: 120px; height: 120px; background: radial-gradient(circle, rgba(100, 180, 255, 0.1) 0%, transparent 70%); border-radius: 50%; transform: translate(40%, -40%);"></div><h2 style="margin-top: 0; margin-bottom: 1.5rem; color: #2c3e50; font-weight: 600; display: flex; align-items: center;"><span style=" color: #1abc9c; margin-right: 10px;">七日天气预报</span></h2><div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(90px, 1fr)); gap: 1rem; position: relative; z-index: 1;">{{#forecastData}}<div style="background: rgba(255, 255, 255, 0.7); border-radius: 16px; padding: 1rem; text-align: center; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); transition: all 0.3s ease; border: 1px solid rgba(200, 220, 255, 0.5); backdrop-filter: blur(4px);"><div style="font-weight: 600; color: #3498db; margin-bottom: 0.5rem;">{{date}}</div><div style="font-size: 2.2rem; margin: 0.7rem 0; animation: float 4s ease-in-out infinite;">{{weather}}</div><div style="display: flex; justify-content: center; gap: 0.8rem; margin-top: 0.5rem;"><div><div style="font-size: 0.85rem; color: #e74c3c;">最高</div><div style="font-weight: 700; color: #e74c3c;">{{highTemp}}°</div></div><div><div style="font-size: 0.85rem; color: #3498db;">最低</div><div style="font-weight: 700; color: #3498db;">{{lowTemp}}°</div></div></div></div>{{/forecastData}}</div><style>@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}</style></div>',
          type: 'mustache',
          properties: {
            forecastData: {
              default: [
                {
                  date: '周一',
                  lowTemp: 18,
                  weather: '☀️',
                  highTemp: 28,
                },
                {
                  date: '周二',
                  lowTemp: 17,
                  weather: '⛅',
                  highTemp: 26,
                },
                {
                  date: '周三',
                  lowTemp: 16,
                  weather: '☁️',
                  highTemp: 24,
                },
                {
                  date: '周四',
                  lowTemp: 15,
                  weather: '🌧️',
                  highTemp: 22,
                },
                {
                  date: '周五',
                  lowTemp: 16,
                  weather: '⛈️',
                  highTemp: 23,
                },
                {
                  date: '周六',
                  lowTemp: 17,
                  weather: '⛅',
                  highTemp: 25,
                },
                {
                  date: '周日',
                  lowTemp: 19,
                  weather: '☀️',
                  highTemp: 27,
                },
              ],
              title: '七日预报数据',
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  date: {
                    description: '格式：MM/DD 或 星期X',
                    title: '日期',
                    type: 'string',
                  },
                  lowTemp: {
                    title: '最低温度',
                    type: 'number',
                  },
                  weather: {
                    title: '天气',
                    type: 'string',
                    enum: ['☀️', '⛅', '☁️', '🌧️', '⛈️', '❄️', '🌫️'],
                  },
                  highTemp: {
                    title: '最高温度',
                    type: 'number',
                  },
                },
              },
              required: true,
            },
          },
        },
        version: '1.0.3',
        createTime: '2024-03-24T09:00:00Z',
        updateTime: '2024-03-24T09:00:00Z',
        author: 'Weather Design Team',
        name: '7-Day Weather Forecast',
        description: '七日天气预报组件，响应式设计',
      },
      examples: [],
      labels: ['天气'],
      official: 'Y',
      publishStatus: 2,
      status: 1,
      createdAt: 1748940557000,
      modifiedAt: 1762938739000,
      userId: 27,
      creatorUsername: 'qixian.cs',
      creatorNickname: '期贤',
      creatorEmployeeNumber: '159252',
      tags: [
        {
          id: 6,
          name: 'React',
          description: 'React框架',
          userId: 159252,
          createdAt: 1754564221000,
          modifiedAt: 1754966948000,
        },
        {
          id: 5,
          name: '前端',
          description: '前端开发技术',
          userId: 159252,
          createdAt: 1754564221000,
          modifiedAt: 1754966948000,
        },
      ],
    },
  ],
  total: 1,
  pageNum: 1,
  pageSize: 12,
  totalPages: 1,
};
