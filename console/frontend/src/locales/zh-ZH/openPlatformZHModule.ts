import home from './openPlatform-ZH/home';
import agentPage from './openPlatform-ZH/agentPage';
import prompt from './openPlatform-ZH/prompt';
import promption from './openPlatform-ZH/promption';
import shareModal from './openPlatform-ZH/shareModal';
import chatPage from './openPlatform-ZH/chatPage';
import commonModal from './openPlatform-ZH/commonModal';
// 导入其他模块
import releaseManagement from './openPlatform-ZH/releaseManagement';
import global from './openPlatform-ZH/global';
import botApi from './openPlatform-ZH/botApi';
import feedback1 from './openPlatform-ZH/feedback';
import orderManagement from './openPlatform-ZH/orderManagement';
import comboContrastModal from './openPlatform-ZH/comboContrastModal';
import systemMessage from './openPlatform-ZH/systemMessage';
import createAgent1 from './openPlatform-ZH/createAgent';
import configBase from './openPlatform-ZH/configBase';
import loginModal from './openPlatform-ZH/loginModal';

/** ## 开放平台的翻译配置 -- zh
 * @description 注意模块名称不要跟星辰的重复
 */
export default {
  home,
  agentPage,
  ...releaseManagement,
  global,
  botApi,
  feedback1,
  orderManagement,
  comboContrastModal,
  systemMessage,
  createAgent1,
  configBase,
  // 添加其他模块
  ...prompt,
  promption,
  shareModal,
  chatPage,
  commonModal,
  loginModal,
};
