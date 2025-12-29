export interface LowCodeSchema {
  version: string;
  name: string;
  description: string;
  author: string;
  type: string;
  properties: {
    [key: string]: {
      type: string;
      title: string;
    };
  };
  required: string[];
  uiSchema: Record<string, any>;
}
