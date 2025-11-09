import { ReactElement, useEffect, useState } from 'react';
import { message, Spin } from 'antd';
import useBotInfoStore from '@/store/bot-info-store';
import ChatHeader from './components/chat-header';
import chatBg from '@/assets/imgs/chat/chat-bg.png';
import MessageList from './components/message-list';
import useChatStore from '@/store/chat-store';
import { useParams, useSearchParams } from 'react-router-dom';
import {
  getChatHistory,
  postCreateChat,
  getBotInfoApi,
  postStopChat,
  postChatList,
  createChatByShareKey,
  getWorkflowBotInfoApi,
} from '@/services/chat';
import ChatInput from './components/chat-input';
import ChatSide from './components/chat-side';
import useChat from '@/hooks/use-chat';
import { formatHistoryToMessages } from '@/utils';
import { useTranslation } from 'react-i18next';

const ChatPage = (): ReactElement => {
  const botInfo = useBotInfoStore(state => state.botInfo); //  智能体信息
  const setBotInfo = useBotInfoStore(state => state.setBotInfo); //  设置智能体信息
  const messageList = useChatStore(state => state.messageList); //  消息列表
  const streamId = useChatStore(state => state.streamId); //  流式id
  const isLoading = useChatStore(state => state.isLoading); //  加载状态
  const setMessageList = useChatStore(state => state.setMessageList); //  设置消息列表
  const setCurrentChatId = useChatStore(state => state.setCurrentChatId); //  设置当前聊天id
  const initChatStore = useChatStore(state => state.initChatStore); //  初始化聊天store
  const setChatFileListNoReq = useChatStore(
    state => state.setChatFileListNoReq
  ); //  设置聊天文件列表
  const [isDataLoading, setIsDataLoading] = useState<boolean>(false); //  数据加载状态
  const [searchParams] = useSearchParams();
  const { botId: botIdParam, version } = useParams<{
    botId: string;
    version?: string;
  }>();
  const sharekey = searchParams.get('sharekey') || ''; //  分享key
  const botId = parseInt(botIdParam || '0', 10) || 0; //  智能体ID
  const [botNameColor, setBotNameColor] = useState<string>('#000000'); //设置字体颜色
  const { onSendMsg } = useChat();
  const { t } = useTranslation();

  useEffect(() => {
    initializeChatPage();
  }, []);

  // 初始化聊天页面
  const initializeChatPage = async (): Promise<void> => {
    try {
      setIsDataLoading(true);
      initChatStore();
      // 1. 判断是否有对话
      const chatList = await postChatList();
      const hasChat = chatList.find(item => item.botId === botId);

      // 2. 判断是否有分享key
      if (!hasChat) {
        sharekey
          ? await createChatByShareKey({ shareAgentKey: sharekey })
          : await postCreateChat(botId);
      }

      // 3. 获取智能体信息
      const botInfo = await getBotInfoApi(
        botId,
        version !== 'debugger' ? version || '' : ''
      );
      if (botInfo?.pc_background) {
        getBotNameColor(botInfo?.pc_background);
      }
      const workflowBotInfo = await getWorkflowBotInfoApi(botId);
      setBotInfo({
        ...botInfo,
        openedTool: workflowBotInfo.openedTool,
        config: workflowBotInfo.config,
      });
      setCurrentChatId(botInfo.chatId);
      // 4. 获取对话历史
      await getChatHistoryData(botInfo.chatId);
      setIsDataLoading(false);
    } catch (error) {
      console.error('初始化聊天页面失败:', error);
    } finally {
      setIsDataLoading(false);
    }
  };
  // 获取对话历史
  const getChatHistoryData = async (chatId: number): Promise<void> => {
    const res = await getChatHistory(chatId);
    setChatFileListNoReq(res?.[0]?.chatFileListNoReq || []);
    const formattedMessages = formatHistoryToMessages(res);
    setMessageList(formattedMessages);
  };

  //发送消息
  const handleRecomendClick = (params: {
    item: string;
    fileUrl?: string;
    callback?: () => void;
  }) => {
    if (streamId || isDataLoading || isLoading) {
      message.warning(t('chatPage.chatWindow.answeringInProgress'));
      return;
    }
    onSendMsg({
      msg: params.item,
      fileUrl: params.fileUrl,
      onSendCallback: params.callback,
    });
  };

  //停止生成
  const stopAnswer = () => {
    postStopChat(streamId).catch(err => {
      console.error(err);
    });
  };

  //设置颜色
  const getBotNameColor = (imgUrl: string) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous'; // 处理跨域问题
    img.src = imgUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const context: any = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      context.drawImage(img, 0, 0);

      const imageData = context.getImageData(
        0,
        0,
        canvas.width,
        canvas.height
      ).data;
      const length = imageData.length / 4;

      let r = 0,
        g = 0,
        b = 0;

      for (let i = 0; i < length; i++) {
        r += imageData[i * 4 + 0];
        g += imageData[i * 4 + 1];
        b += imageData[i * 4 + 2];
      }

      r = Math.floor(r / length);
      g = Math.floor(g / length);
      b = Math.floor(b / length);

      // 计算亮度（YIQ公式）
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      const fontColor = brightness > 144 ? '#000000' : '#FFFFFF'; // 根据亮度设置字体颜色
      setBotNameColor(fontColor);
    };
  };

  return (
    <div
      className="w-full h-screen bg-no-repeat bg-center bg-cover flex flex-col overflow-auto scrollbar-none"
      style={{ backgroundImage: `url(${botInfo.pc_background || chatBg})` }}
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <Spin spinning={isDataLoading} />
      </div>
      <ChatHeader
        botInfo={botInfo}
        setBotInfo={setBotInfo}
        isDataLoading={isDataLoading}
      />
      <div className="overflow-scroll flex flex-1 flex-col pt-20">
        <div className="w-full mx-auto flex flex-col flex-1 min-h-0 overflow-hidden">
          <MessageList
            messageList={messageList}
            botInfo={botInfo}
            isDataLoading={isDataLoading}
            botNameColor={botNameColor}
            handleSendMessage={handleRecomendClick}
          />
        </div>
      </div>
      <ChatSide botInfo={botInfo} />
      <ChatInput
        handleSendMessage={handleRecomendClick}
        botInfo={botInfo}
        stopAnswer={stopAnswer}
      />
    </div>
  );
};
export default ChatPage;
