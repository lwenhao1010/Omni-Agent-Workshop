// Agent Node 相关类型定义
import React from 'react';
export interface AgentProps {
  data: AgentNodeData;
}

export interface AgentDetailProps {
  id: string;
  data: AgentNodeData;
  nodeParam: AgentNodeParam;
}

export interface AgentNodeData {
  nodeParam: AgentNodeParam;
}

export interface AgentNodeParam {
  modelConfig?: {
    agentStrategy?: string;
  };
  plugin?: {
    toolsList?: ToolItem[];
    mcpServerUrls?: string[];
    mcpServerIds?: string[];
    tools?: ToolConfig[];
    knowledge?: KnowledgeConfig[];
  };
  enableChatHistoryV2?: {
    isEnabled: boolean;
  };
  instruction?: {
    answer?: string;
    reasoning?: string;
    query?: string;
    queryErrMsg?: string;
  };
  maxLoopCount?: number;
}

export interface ToolItem {
  id?: string;
  toolId: string;
  name: string;
  type: 'tool' | 'knowledge' | 'mcp';
  icon?: string;
  tag?: string;
  isLatest?: boolean;
  pluginName?: string;
  description?: string;
  match?: {
    repoIds?: string[];
  };
}

export interface ToolConfig {
  tool_id: string;
  version: string;
}

export interface KnowledgeConfig {
  name: string;
  description: string;
  topK: number;
  match: {
    repoIds: string[];
  };
  repoType: number;
}

export interface AgentStrategy {
  code: string;
  name: string;
  description: string;
}

export interface AddressItem {
  id: string;
  value: string;
}

export interface UseAgentReturn {
  toolsList: ToolItem[];
  orderToolsList: ToolItem[];
  handleChangeNodeParam: (key: string, value: unknown) => void;
  handleToolChange: (tool: ToolItem) => void;
  handleUpdateTool: (tool: ToolItem) => void;
  handleChangeAddress: (id: string, value: string) => void;
  handleRemoveAddress: (id: string) => void;
}

export interface useAddAgentPluginType {
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  renderParamsTooltip: (params: string) => React.ReactNode;
  handleCheckTool: (tool: ToolItem) => void;
}
