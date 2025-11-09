// Advanced Configuration 模块的类型定义

// VCN语音配置类型定义
export interface VcnItem {
  id: string;
  name: string;
  vcn: string;
}

// 聊天背景信息类型定义
export interface ChatBackgroundInfo {
  name: string;
  type: string;
  total: string;
  url: string;
}

// 高级配置结构类型定义
export interface AdvancedConfigType {
  needGuide?: boolean;
  prologue: {
    enabled: boolean;
    prologueText: string;
    inputExample: string[];
  };
  feedback: {
    enabled: boolean;
  };
  textToSpeech: {
    enabled: boolean;
    vcn?: string;
  };
  speechToText: {
    enabled: boolean;
  };
  suggestedQuestionsAfterAnswer: {
    enabled: boolean;
  };
  chatBackground: {
    enabled: boolean;
    info: ChatBackgroundInfo | null;
  };
}

// 上传响应类型定义
export interface UploadResponse {
  code: number;
  message: string;
  data: {
    downloadLink: string;
  };
}

export interface UploadProps {
  name: string;
  action: string;
  showUploadList: boolean;
  accept: string;
  beforeUpload: (file: unknown) => boolean;
  onChange: (info: unknown) => void;
}

// 抽屉样式类型定义
export interface DrawerStyleType {
  height: number;
  top: number;
  right: number;
  zIndex: number;
}

// VoiceBroadcast 类型定义（基于使用方式推断）
export interface VoiceBroadcastInstance {
  closeWebsocketConnect(): void;
  establishConnect(content: string, param2: boolean, vcn?: string): void;
}

// 深度 Partial 类型定义
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// 配置更新类型
export type AdvancedConfigUpdate = DeepPartial<AdvancedConfigType>;

export interface useAdvancedConfigurationProps {
  advancedConfig: AdvancedConfigType;
  handleAdvancedConfigChange: (callback: () => void) => void;
  updateAdvancedConfigParams: (updateParams: AdvancedConfigUpdate) => void;
  updateAdvancedConfigParamsDebounce: (
    updateParams: AdvancedConfigUpdate
  ) => void;
  handlePresetQuestionChange: (index: number, value: string) => void;
  openingRemarksModal: boolean;
  setOpeningRemarksModal: (value: boolean) => void;
  chatBackgroundInfo: ChatBackgroundInfo | null;
  setChatBackgroundInfo: (value: ChatBackgroundInfo | null) => void;
  uploadProps: UploadProps;
}
