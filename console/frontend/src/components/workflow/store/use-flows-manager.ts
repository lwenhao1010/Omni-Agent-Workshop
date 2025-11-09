import { create } from 'zustand';
import { FlowType } from '@/components/workflow/types';
import { FlowsManagerStoreType } from '@/components/workflow/types/zustand/flowsManager';
import {
  initialStatus,
  addModelParamsToNode,
  addTextNodeConfig,
  removeTextNodeConfig,
  getFlowDetail,
  initFlowData,
  autoSaveCurrentFlow,
  checkFlow,
  canPublishSetNot,
  setModels,
  setCurrentStore,
  getCurrentStore,
  setFlowResult,
  setTextNodeConfigList,
  setAgentStrategy,
  setKnowledgeProStrategy,
  setHistorys,
} from './flow-manager-function';
import useFlowStore from './use-flow-store';
import useIteratorFlowStore from './use-iterator-flow-store';

const useFlowsManagerStore = create<FlowsManagerStoreType>((set, get) => ({
  ...initialStatus,
  setWillAddNode: (willAddNode: unknown): void => set({ willAddNode }),
  setBeforeNode: (beforeNode: unknown): void => set({ beforeNode }),
  setControlMode: (controlMode: string): void => set({ controlMode }),
  setHistoryVersion: (historyVersion: boolean): void => set({ historyVersion }),
  setHistoryVersionData: (historyVersionData: unknown): void =>
    set({ historyVersionData }),
  setDecisionNodeTransformationModal: (
    decisionNodeTransformationModal: boolean
  ): void => set({ decisionNodeTransformationModal }),
  setChatHistoryTransformationModal: (
    chatHistoryTransformationModal: boolean
  ): void => set({ chatHistoryTransformationModal }),
  setAutonomousMode: (autonomousMode: boolean): void => set({ autonomousMode }),
  setShowAiuiTips: (showAiuiTips: boolean): void => set({ showAiuiTips }),
  setCurrentStore: (type): void => setCurrentStore(type, set),
  setSingleNodeDebuggingInfo: (singleNodeDebuggingInfo: {
    nodeId: string;
    controller: unknown;
  }): void => set({ singleNodeDebuggingInfo }),
  getCurrentStore: (): typeof useFlowStore | typeof useIteratorFlowStore =>
    getCurrentStore(get),
  setFlowResult: (flowResult): void => setFlowResult(flowResult, set),
  setCodeIDEADrawerlInfo: (codeIDEADrawerlInfo: {
    open: boolean;
    nodeId: string;
  }): void => set({ codeIDEADrawerlInfo }),
  setVersionManagement: (versionManagement: boolean): void =>
    set({ versionManagement }),
  setChatDebuggerResult: (chatDebuggerResult: boolean): void =>
    set({ chatDebuggerResult }),
  setAdvancedConfiguration: (advancedConfiguration: boolean): void =>
    set({ advancedConfiguration }),
  setKnowledgeModalInfo: (knowledgeModalInfo: {
    open: boolean;
    nodeId: string;
  }): void => set({ knowledgeModalInfo }),
  setToolModalInfo: (toolModalInfo: { open: boolean }): void =>
    set({ toolModalInfo }),
  setFlowModalInfo: (flowModalInfo: { open: boolean }): void =>
    set({ flowModalInfo }),
  setRpaModalInfo: (rpaModalInfo: { open: boolean }): void =>
    set({ rpaModalInfo }),
  setKnowledgeDetailModalInfo: (knowledgeDetailModalInfo: {
    open: boolean;
    nodeId: string;
    repoId: string;
  }): void => set({ knowledgeDetailModalInfo }),
  setKnowledgeParameterModalInfo: (knowledgeParameterModalInfo: {
    open: boolean;
    nodeId: string;
  }): void => set({ knowledgeParameterModalInfo }),
  setKnowledgeProParameterModalInfo: (knowledgeProParameterModalInfo: {
    open: boolean;
    nodeId: string;
  }): void => set({ knowledgeProParameterModalInfo }),
  setClearFlowCanvasModalInfo: (clearFlowCanvasModalInfo: {
    open: boolean;
  }): void => set({ clearFlowCanvasModalInfo }),
  setCycleEdges: (change): void => {
    const cycleEdges =
      typeof change === 'function' ? change(get().cycleEdges) : change;
    set({
      cycleEdges,
    });
  },
  setTextNodeConfigList: (change): void =>
    setTextNodeConfigList(change, get, set),
  setAgentStrategy: (change): void => setAgentStrategy(change, get, set),
  setKnowledgeProStrategy: (change): void =>
    setKnowledgeProStrategy(change, get, set),
  setNodeList: (change): void => {
    const nodeList =
      typeof change === 'function' ? change(get().nodeList) : change;
    set({
      nodeList,
    });
  },
  addModelParamsToNode: (currentModel): void =>
    addModelParamsToNode(currentModel, get),
  addTextNodeConfig: (params): Promise<void> => addTextNodeConfig(params, get),
  removeTextNodeConfig: (id): Promise<unknown> => removeTextNodeConfig(id, get),
  setHistorys: (change): void => setHistorys(change, get, set),
  setModels: (appId): void => setModels(appId, set),
  setFlows: (flows: FlowType[]): void => {
    set({
      flows,
      currentFlow: flows.find(flow => flow.id == get().currentFlowId),
    });
  },
  setErrNodes: (errNodes: unknown): void => {
    set({
      errNodes,
    });
  },
  setCurrentFlow: (change): void => {
    const newChange =
      typeof change === 'function'
        ? change(get().currentFlow as FlowType)
        : change;
    set({
      currentFlow: newChange,
    });
  },
  setNodeTemplate: (nodeTemplate): void => {
    set({
      nodeTemplate,
    });
  },
  setChatId: (chatId: string): void => set({ chatId }),
  setIteratorId: (iteratorId: string): void => set({ iteratorId }),
  setShowIterativeModal: (showIterativeModal: boolean): void =>
    set({ showIterativeModal }),
  setSelectPromptModalInfo: (selectPromptModalInfo: {
    open: boolean;
    nodeId: string;
  }): void => set({ selectPromptModalInfo }),
  setSelectAgentPromptModalInfo: (selectAgentPromptModalInfo: {
    open: boolean;
    nodeId: string;
  }): void => set({ selectAgentPromptModalInfo }),
  setDefaultValueModalInfo: (change): void => {
    const defaultValueModalInfo =
      typeof change === 'function'
        ? change(get().defaultValueModalInfo)
        : change;
    set({
      defaultValueModalInfo,
    });
  },
  setNodeInfoEditDrawerlInfo: (change): void => {
    const nodeInfoEditDrawerlInfo =
      typeof change === 'function'
        ? change(get().nodeInfoEditDrawerlInfo)
        : change;
    set({
      nodeInfoEditDrawerlInfo,
    });
  },
  setPromptOptimizeModalInfo: (change): void => {
    const promptOptimizeModalInfo =
      typeof change === 'function'
        ? change(get().promptOptimizeModalInfo)
        : change;
    set({
      promptOptimizeModalInfo,
    });
  },
  setUpdateNodeInputData: (change): void => {
    const updateNodeInputData =
      typeof change === 'function' ? change(get().updateNodeInputData) : change;
    set({
      updateNodeInputData,
    });
  },
  setOpenOperationResult: (change): void => {
    const openOperationResult =
      typeof change === 'function' ? change(get().openOperationResult) : change;
    set({
      openOperationResult,
    });
  },
  setIsMounted: (isMounted: boolean): void => set({ isMounted }),
  setCanPublish: (canPublish: boolean): void => set({ canPublish }),
  setIsChanged: (isChanged: boolean): void => set({ isChanged }),
  setCanvasesDisabled: (canvasesDisabled: boolean): void =>
    set({ canvasesDisabled }),
  setShowMultipleCanvasesTip: (showMultipleCanvasesTip: boolean): void =>
    set({ showMultipleCanvasesTip }),
  setShowNodeList: (showNodeList: boolean): void => set({ showNodeList }),
  setIsLoading: (isLoading: boolean): void => set({ isLoading }),
  setLoadingNodesData: (loadingNodesData: boolean): void =>
    set({ loadingNodesData }),
  setLoadingModels: (loadingModels: boolean): void => set({ loadingModels }),
  setLoadingNodesLayout: (loadingNodesLayout: boolean): void =>
    set({ loadingNodesLayout }),
  setEdgeType: (edgeType: string): void => set({ edgeType }),
  setFlowChatResultOpen: (flowChatResultOpen: boolean): void =>
    set({ flowChatResultOpen }),
  getFlowDetail: (): void => getFlowDetail(get),
  initFlowData: (id): Promise<void> => initFlowData(id, set),
  autoSaveCurrentFlow: (): void => autoSaveCurrentFlow(get),
  checkFlow: (): boolean => checkFlow(get),
  resetFlowsManager: (): void => {
    set({
      ...initialStatus,
    });
  },
  canPublishSetNot: (): void => canPublishSetNot(get),
}));

export default useFlowsManagerStore;
