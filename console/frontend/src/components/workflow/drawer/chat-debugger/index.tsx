import React, { useMemo, useRef, useState, useEffect, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Drawer, Button, message } from 'antd';
import { cloneDeep } from 'lodash';
import useFlowsManager from '@/components/workflow/store/use-flows-manager';
import useFlowStore from '@/components/workflow/store/use-flow-store';
import { isJSON } from '@/utils';
import {
  validateInputJSON,
  generateDefaultInput,
  generateValidationSchema,
} from '@/components/workflow/utils/reactflowUtils';
import DeleteChatHistory from '@/components/workflow/modal/delete-chat-history';
import ChatContent from './components/chat-content';
import ChatInput from './components/chat-input';
import { getPublicResult } from '@/services/common';
import useChatStore from '@/components/workflow/store/use-chat-store';
import { UseChatDebuggerContentProps } from '@/components/workflow/types';
import useChat from '@/hooks/use-chat';

// 类型导入
import {
  InterruptChatType,
  ChatDebuggerContentProps,
  ReactFlowNode,
} from '@/components/workflow/types';

// 从统一的图标管理中导入
import { Icons } from '@/components/workflow/icons';

// 获取 Chat Debugger 模块的图标
const icons = Icons.chatDebugger;

const initInterruptChat: InterruptChatType = {
  eventId: '',
  interrupt: false,
  nodeId: '',
  type: '',
  option: null,
  needReply: true,
};

const ChatFooter = ({
  trialRun,
  debuggering,
  setDeleteAllModal,
  t,
  clearData,
  handleResumeChat,
  resetNodesAndEdges,
  handleRunDebugger,
  startNodeParams,
  interruptChat,
  userInput,
}: {
  trialRun: boolean;
}): React.ReactElement | null => {
  const canRunDebugger = useChatStore(state => state.canRunDebugger);
  const canRunChat = useMemo(
    () => canRunDebugger(),
    [debuggering, startNodeParams]
  );
  if (!trialRun) return null;
  return (
    <div className="flex items-center justify-between mt-4 px-5">
      {!debuggering ? (
        <Button
          type="text"
          className="origin-btn px-[26px]"
          onClick={() => setDeleteAllModal(true)}
        >
          {t('workflow.nodes.chatDebugger.clearDialogue')}
        </Button>
      ) : (
        <div className="h-1"></div>
      )}
      <div className="flex items-center gap-2.5">
        <Button
          type="text"
          className="origin-btn px-[24px]"
          onClick={() => clearData()}
        >
          {t('common.cancel')}
        </Button>
        <Button
          type="primary"
          className="px-[24px] flex items-center gap-2"
          onClick={() => {
            if (startNodeParams?.length === 1 || interruptChat?.interrupt) {
              if (interruptChat?.interrupt) {
                handleResumeChat(userInput);
              } else {
                const { nodes, edges } = resetNodesAndEdges();
                handleRunDebugger(nodes, edges, [
                  {
                    name: 'AGENT_USER_INPUT',
                    type: 'string',
                    default: userInput,
                    description: t(
                      'workflow.nodes.chatDebugger.userCurrentRoundInput'
                    ),
                    required: true,
                    validationSchema: null,
                    errorMsg: '',
                    originErrorMsg: '',
                  },
                ]);
              }
            } else {
              const { nodes, edges } = resetNodesAndEdges();
              handleRunDebugger(nodes, edges);
            }
          }}
          disabled={!canRunChat}
        >
          <img src={icons.trialRun} className="w-3 h-3" alt="" />
          <span>{t('workflow.nodes.chatDebugger.send')}</span>
        </Button>
      </div>
    </div>
  );
};

const useChatDebuggerEffect = (
  currentFlow,
  open,
  startNode,
  setShowChatDebuggerPage,
  setStartNodeParams
): void => {
  const isMounted = useRef<boolean>(false);
  const historyVersion = useFlowsManager(state => state.historyVersion);
  const flowResult = useFlowsManager(state => state.flowResult);
  const historyVersionData = useFlowsManager(state => state.historyVersionData);
  const setInterruptChat = useChatStore(state => state.setInterruptChat);
  const clearNodeStatus = useChatStore(state => state.clearNodeStatus);
  const handleSaveDialogue = useChatStore(state => state.handleSaveDialogue);
  const handleWorkflowDeleteComparisons = useChatStore(
    state => state.handleWorkflowDeleteComparisons
  );
  const debuggering = useChatStore(state => state.debuggering);
  const buildPassRef = useChatStore(state => state.buildPassRef);
  const getTextQueueContent = useChatStore(state => state.getTextQueueContent);
  const getChatKey = useChatStore(state => state.getChatKey);
  const isChatEnd = useChatStore(state => state.isChatEnd);
  const setDebuggering = useChatStore(state => state.setDebuggering);
  const getDialogues = useChatStore(state => state.getDialogues);
  const setChatList = useChatStore(state => state.setChatList);
  const chatInfoRef = useChatStore(state => state.chatInfoRef);
  const interruptChat = useChatStore(state => state.interruptChat);
  const controllerRef = useChatStore(state => state.controllerRef);
  const setWsMessageStatus = useChatStore(state => state.setWsMessageStatus);
  const setQueue = useChatStore(state => state.setQueue);
  const chatList = useChatStore(state => state.chatList);
  const setNodes = useFlowStore(state => state.setNodes);
  const setEdges = useFlowStore(state => state.setEdges);
  useEffect(() => {
    if (!flowResult?.status) {
      controllerRef?.abort();
      handleWorkflowDeleteComparisons();
      setWsMessageStatus('end');
      setInterruptChat({ ...initInterruptChat });
      setNodes(old => {
        old.forEach(node => (node.data.status = ''));
        return cloneDeep(old);
      });
      setEdges(edges =>
        edges?.map(edge => ({
          ...edge,
          animated: false,
          style: {
            stroke: '#275EFF',
            strokeWidth: 2,
          },
        }))
      );
    }
  }, [flowResult?.status, currentFlow?.flowId]);
  useEffect(() => {
    currentFlow?.id && getDialogues(currentFlow?.id, true);
  }, [currentFlow?.id]);
  useEffect(() => {
    const handleBeforeUnload = (): void => {
      controllerRef?.current?.abort();
      handleWorkflowDeleteComparisons();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return (): void => {
      clearNodeStatus();
      window.removeEventListener('beforeunload', handleBeforeUnload);
      handleWorkflowDeleteComparisons();
      controllerRef?.current?.abort();
    };
  }, [currentFlow?.flowId]);
  useEffect(() => {
    open &&
      !isMounted.current &&
      setStartNodeParams(
        startNode?.data?.outputs?.map(input => {
          const errorMsg =
            input?.schema?.type === 'object'
              ? validateInputJSON('{}', generateValidationSchema(input))
              : '';
          const allowedFileType = input?.allowedFileType?.[0];
          return {
            name: input.name,
            type: input?.schema?.type,
            fileType: allowedFileType,
            default: allowedFileType
              ? []
              : input?.schema?.type === 'object'
                ? '{}'
                : input?.schema?.type.includes('array')
                  ? '[]'
                  : generateDefaultInput(input?.schema?.type),
            description: input?.schema?.default,
            required: input?.required,
            validationSchema:
              input?.schema?.type === 'object' ||
              (input?.schema?.type.includes('array') && !input?.fileType)
                ? generateValidationSchema(input)
                : null,
            errorMsg: errorMsg,
            originErrorMsg: errorMsg,
          };
        }) || []
      );
  }, [startNode, open]);
  useEffect(() => {
    if (isMounted.current) {
      !debuggering && buildPassRef && handleSaveDialogue();
    } else {
      isMounted.current = true;
    }
  }, [debuggering]);
  useEffect(() => {
    if (historyVersion && historyVersionData?.name) {
      const params = {
        flowId: currentFlow?.flowId,
        name: historyVersionData?.name,
      };
      getPublicResult(params)
        .then(data => {
          setShowChatDebuggerPage(
            data?.some(item => item?.publishResult === '成功')
          );
        })
        .catch(error => {
          message.error('获取发布结果详情失败:', error);
        });
    }
  }, [historyVersion, historyVersionData, currentFlow?.flowId]);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    if (debuggering) {
      timer = setInterval((): void => {
        const content = getTextQueueContent();
        const chatKey = getChatKey();
        const value = content.slice(0, 10);
        if (value) {
          setQueue(10);
          setChatList(chatList => {
            chatInfoRef.answer[chatKey] = chatInfoRef.answer[chatKey] + value;
            chatList[chatList.length - 1][chatKey] =
              chatList[chatList.length - 1][chatKey] + value;
            return [...chatList];
          });
        }
        if (isChatEnd()) {
          setDebuggering(false);
          setChatList(chatList => {
            if (chatList[chatList.length - 1]) {
              chatList[chatList.length - 1].showResponse = true;
              if (interruptChat?.type === 'option') {
                chatList[chatList.length - 1].option = interruptChat?.option;
              }
            }
            return [...chatList];
          });
        }
      }, 10);
    } else {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    return (): void => clearInterval(timer);
  }, [debuggering, chatList, interruptChat]);
};

const useChatDebuggerContent = ({
  currentFlow,
}): UseChatDebuggerContentProps => {
  const nodes = useFlowStore(state => state.nodes);
  const errNodes = useFlowsManager(state => state.errNodes);
  const startNode = useMemo(() => {
    return nodes?.find((node: ReactFlowNode) => node.nodeType === 'node-start');
  }, [nodes]);
  const trialRun = useMemo(() => {
    return errNodes?.length === 0;
  }, [errNodes]);
  const xfYunBot = useMemo(() => {
    return isJSON(currentFlow?.ext) ? JSON.parse(currentFlow?.ext) : {};
  }, [currentFlow]);
  const multiParams = useMemo((): boolean => {
    const startNode = nodes?.find(node => node?.nodeType === 'node-start');
    const outputs = startNode?.data?.outputs;
    let multiParams = true;
    if (outputs?.length === 1) {
      multiParams = false;
    }
    if (
      outputs?.length === 2 &&
      outputs?.[1]?.fileType &&
      outputs?.[1]?.schema?.type === 'string'
    ) {
      multiParams = false;
    }
    return multiParams;
  }, [nodes]);
  return {
    startNode,
    trialRun,
    multiParams,
    xfYunBot,
  };
};

export function ChatDebuggerContent({
  open,
  setOpen,
}: ChatDebuggerContentProps): React.ReactElement {
  const { handleFlowToChat } = useChat();
  const { t } = useTranslation();
  const currentFlow = useFlowsManager(state => state.currentFlow);
  const userInput = useChatStore(state => state.userInput);
  const setUserInput = useChatStore(state => state.setUserInput);
  const historyVersion = useFlowsManager(state => state.historyVersion);
  const historyVersionData = useFlowsManager(state => state.historyVersionData);
  const startNodeParams = useChatStore(state => state.startNodeParams);
  const setStartNodeParams = useChatStore(state => state.setStartNodeParams);
  const chatList = useChatStore(state => state.chatList);
  const setChatList = useChatStore(state => state.setChatList);
  const debuggering = useChatStore(state => state.debuggering);
  const userWheel = useChatStore(state => state.userWheel);
  const setUserWheel = useChatStore(state => state.setUserWheel);
  const deleteAllModal = useChatStore(state => state.deleteAllModal);
  const setDeleteAllModal = useChatStore(state => state.setDeleteAllModal);
  const suggestLoading = useChatStore(state => state.suggestLoading);
  const suggestProblem = useChatStore(state => state.suggestProblem);
  const interruptChat = useChatStore(state => state.interruptChat);
  const deleteAllChat = useChatStore(state => state.deleteAllChat);
  const clearData = useChatStore(state => state.clearData);
  const handleResumeChat = useChatStore(state => state.handleResumeChat);
  const resetNodesAndEdges = useChatStore(state => state.resetNodesAndEdges);
  const handleRunDebugger = useChatStore(state => state.handleRunDebugger);
  const handleEnterKey = useChatStore(state => state.handleEnterKey);
  const handleStopConversation = useChatStore(
    state => state.handleStopConversation
  );
  const [showChatDebuggerPage, setShowChatDebuggerPage] =
    useState<boolean>(true);
  const { startNode, trialRun, multiParams, xfYunBot } = useChatDebuggerContent(
    {
      currentFlow,
    }
  );
  useChatDebuggerEffect(
    currentFlow,
    open,
    startNode,
    setShowChatDebuggerPage,
    setStartNodeParams
  );
  return (
    <div
      className="w-full h-full py-4 flex flex-col overflow-hidden"
      tabIndex={0}
      onKeyDown={e => e.stopPropagation()}
    >
      {deleteAllModal && (
        <DeleteChatHistory
          setDeleteModal={setDeleteAllModal}
          deleteChat={deleteAllChat}
        />
      )}
      <div className="flex items-center justify-between px-5">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-lg">
            {trialRun
              ? t('workflow.nodes.chatDebugger.dialogue')
              : t('workflow.nodes.chatDebugger.runResult')}
          </span>
        </div>
        <img
          src={icons.close}
          className="w-3 h-3 cursor-pointer"
          alt=""
          onClick={() => clearData(setOpen)}
        />
      </div>
      <div className="flex-1 flex flex-col overflow-hidden mt-1">
        <div className="w-full flex items-center justify-between px-5">
          <div className="flex items-center gap-2 text-desc">
            <img src={icons.chatListTip} className="w-3 h-3 mt-0.5" alt="" />
            <span>
              {t('workflow.nodes.chatDebugger.keepOnly10DialogueRecords')}
            </span>
          </div>
          {multiParams ? (
            <div className="text-[#ff9a27] text-sm">
              {t(
                'workflow.nodes.chatDebugger.multiParamWorkflowOnlySupportDebugAndPublishAsAPI'
              )}
            </div>
          ) : !showChatDebuggerPage ? (
            <div className="text-[#ff9a27] text-sm">
              当前版本未发布成功，无用户对话页
            </div>
          ) : (
            <div
              className="flex items-center gap-2 font-medium cursor-pointer"
              onClick={() => {
                const params = {
                  chatId: xfYunBot?.chatId,
                  botId: xfYunBot?.botId,
                };
                if (historyVersion) {
                  params.version = historyVersionData?.name;
                } else {
                  params.version = 'debugger';
                }
                handleFlowToChat(params);
              }}
            >
              <img
                src={icons.switchUserChatPageActive}
                className="w-[18px] h-[18px]"
                alt=""
              />
              <span className="text-[#275EFF]">
                {t('workflow.nodes.chatDebugger.switchToUserDialoguePage')}
              </span>
            </div>
          )}
        </div>
        <ChatContent
          open={open}
          userWheel={userWheel}
          setUserWheel={setUserWheel}
          chatList={chatList}
          setChatList={setChatList}
          startNodeParams={startNodeParams}
          resetNodesAndEdges={resetNodesAndEdges}
          handleRunDebugger={handleRunDebugger}
          debuggering={debuggering}
          suggestProblem={suggestProblem}
          suggestLoading={suggestLoading}
          needReply={interruptChat?.needReply}
          handleResumeChat={handleResumeChat}
          handleStopConversation={handleStopConversation}
        />
        <ChatInput
          interruptChat={interruptChat}
          startNodeParams={startNodeParams}
          setStartNodeParams={setStartNodeParams}
          userInput={userInput}
          setUserInput={setUserInput}
          handleEnterKey={handleEnterKey}
        />
        <ChatFooter
          trialRun={trialRun}
          debuggering={debuggering}
          setDeleteAllModal={setDeleteAllModal}
          t={t}
          clearData={() => clearData(setOpen)}
          handleResumeChat={handleResumeChat}
          resetNodesAndEdges={resetNodesAndEdges}
          handleRunDebugger={handleRunDebugger}
          startNodeParams={startNodeParams}
          interruptChat={interruptChat}
          userInput={userInput}
        />
      </div>
    </div>
  );
}

function ChatDebuggerResult(): React.ReactElement {
  const open = useFlowsManager(state => state.chatDebuggerResult);
  const setOpen = useFlowsManager(state => state.setChatDebuggerResult);

  return (
    <Drawer
      rootClassName="operation-result-container"
      placement="right"
      open={open}
      mask={false}
      destroyOnClose
    >
      <ChatDebuggerContent open={open} setOpen={setOpen} />
    </Drawer>
  );
}

export default memo(ChatDebuggerResult);
