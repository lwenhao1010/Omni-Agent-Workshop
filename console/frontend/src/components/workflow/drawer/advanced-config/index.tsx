import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Drawer, Switch, Input, Upload, message } from 'antd';
import type { UploadProps, UploadFile } from 'antd';
import useFlowsManager from '@/components/workflow/store/use-flows-manager';
import { saveFlowAPI } from '@/services/flow';
import { debounce, cloneDeep } from 'lodash';
import { isJSON } from '@/utils';
import { getFixedUrl, getAuthorization } from '@/components/workflow/utils';
import OpeningRemarks from './opening-remarks';
import { useTranslation } from 'react-i18next';
import {
  FlowType,
  ChatBackgroundInfo,
  AdvancedConfigType,
  UploadResponse,
  DrawerStyleType,
  AdvancedConfigUpdate,
  useAdvancedConfigurationProps,
} from '@/components/workflow/types';

// 从统一的图标管理中导入
import { Icons } from '@/components/workflow/icons';

// 获取 Advanced Config 模块的图标
const icons = Icons.advancedConfig;

const { Dragger } = Upload;

const ConversationStarter = ({
  advancedConfig,
  handleAdvancedConfigChange,
  updateAdvancedConfigParams,
  setOpeningRemarksModal,
  updateAdvancedConfigParamsDebounce,
  handlePresetQuestionChange,
  t,
}): React.ReactElement => {
  return (
    <div
      className="bg-[#F7F7FA] rounded-lg"
      style={{
        padding: '10px 17px 16px 17px',
      }}
    >
      <div className="w-full flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <img
            src={icons.conversationStarter}
            className="w-[22px] h-[22px]"
            alt=""
          />
          <div className="font-medium">
            {t('workflow.advancedConfiguration.conversationStarter')}
          </div>
        </div>
        <Switch
          className="list-switch config-switch"
          checked={advancedConfig?.prologue?.enabled}
          onChange={value => {
            handleAdvancedConfigChange(
              () => (advancedConfig.prologue.enabled = value)
            );
            updateAdvancedConfigParams({
              prologue: {
                enabled: value,
              },
            });
          }}
        />
      </div>
      <div className="text-xs font-medium text-[#666] mt-1">
        {t('workflow.advancedConfiguration.conversationStarterDescription')}
      </div>
      {advancedConfig?.prologue?.enabled && (
        <>
          <div className="relative">
            <div
              className="absolute bottom-2 right-2.5 inline-flex items-center rounded-md gap-1 cursor-pointer  py-1 px-2.5 text-[#275EFF] text-sm bg-[#ececfb] z-20"
              onClick={() => setOpeningRemarksModal(true)}
            >
              <img src={icons.promptOptimization} className="w-4 h-4" alt="" />
              <span>{t('workflow.advancedConfiguration.aiGenerate')}</span>
            </div>
            <Input.TextArea
              className="mt-2.5 global-textarea pr-6 flow-advanced-configuration-textarea"
              placeholder={t(
                'workflow.advancedConfiguration.openingRemarksPlaceholder'
              )}
              style={{ height: 96, resize: 'none' }}
              value={advancedConfig?.prologue?.prologueText}
              onChange={e => {
                handleAdvancedConfigChange(
                  () =>
                    (advancedConfig.prologue.prologueText = e?.target?.value)
                );
                updateAdvancedConfigParamsDebounce({
                  prologue: {
                    prologueText: e?.target?.value,
                  },
                });
              }}
              maxLength={300}
            />
          </div>
          <div className="w-full flex items-center justify-between mt-4">
            <div className="font-medium">
              {t(
                'workflow.advancedConfiguration.openingRemarksPresetQuestions'
              )}
            </div>
            {advancedConfig?.prologue?.inputExample?.length < 3 && (
              <div
                className="flex items-center gap-2 text-[#275EFF] text-xs font-medium cursor-pointer"
                onClick={() => {
                  handleAdvancedConfigChange(
                    () =>
                      (advancedConfig.prologue.inputExample = [
                        ...advancedConfig.prologue.inputExample,
                        '',
                      ])
                  );
                  updateAdvancedConfigParams({
                    prologue: {
                      inputExample: advancedConfig?.prologue?.inputExample,
                    },
                  });
                }}
              >
                <img
                  src={icons.inputAdd}
                  className="w-[10px] h-[10px]"
                  alt=""
                />
                <span>{t('workflow.advancedConfiguration.add')}</span>
              </div>
            )}
          </div>
          {advancedConfig?.prologue?.inputExample?.map((question, index) => (
            <div key={index} className="w-full relative">
              <Input
                style={{
                  height: 40,
                }}
                value={question}
                onChange={e =>
                  handlePresetQuestionChange(index, e.target.value?.trim())
                }
                placeholder={t(
                  'workflow.advancedConfiguration.presetQuestionPlaceholder'
                )}
                className="global-input flex-1 shrink-0 mt-1.5 flow-advanced-configuration-input pr-8"
              />
              {advancedConfig?.prologue?.inputExample?.length > 1 ? (
                <img
                  src={icons.remove}
                  className="w-5 h-5 cursor-pointer absolute right-2 top-4"
                  alt=""
                  onClick={() => {
                    handleAdvancedConfigChange(() =>
                      advancedConfig?.prologue?.inputExample?.splice(index, 1)
                    );
                    updateAdvancedConfigParams({
                      prologue: {
                        inputExample: advancedConfig?.prologue?.inputExample,
                      },
                    });
                  }}
                />
              ) : null}
            </div>
          ))}
        </>
      )}
    </div>
  );
};

const SuggestedQuestions = ({
  advancedConfig,
  handleAdvancedConfigChange,
  updateAdvancedConfigParams,
  t,
}): React.ReactElement => {
  return (
    <div
      className="bg-[#F7F7FA] rounded-lg"
      style={{
        padding: '10px 17px 16px 17px',
      }}
    >
      <div className="w-full flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <img
            src={icons.problemSuggestion}
            className="w-[22px] h-[22px]"
            alt=""
          />
          <div className="font-medium">
            {t('workflow.advancedConfiguration.nextQuestionSuggestion')}
          </div>
        </div>
        <Switch
          className="list-switch config-switch"
          checked={advancedConfig?.suggestedQuestionsAfterAnswer?.enabled}
          onChange={value => {
            handleAdvancedConfigChange(
              () =>
                (advancedConfig.suggestedQuestionsAfterAnswer.enabled = value)
            );
            updateAdvancedConfigParams({
              suggestedQuestionsAfterAnswer: {
                enabled: value,
              },
            });
          }}
        />
      </div>
      <div className="text-xs font-medium text-[#666] mt-1 max-w-[274px] whitespace-pre-wrap">
        {t('workflow.advancedConfiguration.nextQuestionSuggestionDescription')}
      </div>
    </div>
  );
};

const ChatBackground = ({
  advancedConfig,
  handleAdvancedConfigChange,
  updateAdvancedConfigParams,
  t,
  uploadProps,
  chatBackgroundInfo,
  setChatBackgroundInfo,
}): React.ReactElement => {
  return (
    <div
      className="bg-[#F7F7FA] rounded-lg"
      style={{
        padding: '10px 17px 16px 17px',
      }}
    >
      <div className="w-full flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <img
            src={icons.settingBackground}
            className="w-[22px] h-[22px]"
            alt=""
          />
          <div className="font-medium">
            {t('workflow.advancedConfiguration.setBackground')}
          </div>
        </div>
        <Switch
          className="list-switch config-switch"
          checked={advancedConfig?.chatBackground?.enabled}
          onChange={value => {
            handleAdvancedConfigChange(
              () => (advancedConfig.chatBackground.enabled = value)
            );
            updateAdvancedConfigParams({
              chatBackground: {
                enabled: value,
              },
            });
          }}
        />
      </div>
      <div className="text-xs font-medium text-[#666] mt-1 max-w-[274px] whitespace-pre-wrap">
        {t('workflow.advancedConfiguration.setBackgroundDescription')}
      </div>
      {advancedConfig?.chatBackground?.enabled && (
        <div className="w-full pt-4">
          <Dragger {...uploadProps} className="icon-upload">
            <img src={icons.uploadAct} className="w-8 h-8" alt="" />
            <div className="font-medium mt-6">
              {t('workflow.advancedConfiguration.dragFileHere')}
              <span className="text-[#275EFF]">
                {t('workflow.advancedConfiguration.selectFile')}
              </span>
            </div>
            <p className="text-desc mt-2">
              {t('workflow.advancedConfiguration.fileFormatTip')}
            </p>
          </Dragger>
          {chatBackgroundInfo && (
            <div className="w-full flex items-center gap-2.5 justify-between mt-2.5 rounded-xl p-2.5 bg-[#fff]">
              <div className="flex items-center gap-2.5 flex-1">
                <img
                  src={icons.advancedConfigurationUpload}
                  className="w-[20px] h-[20px]"
                  alt=""
                />
                <div
                  className="max-w-[250px] text-overflow"
                  title={chatBackgroundInfo?.name}
                >
                  {chatBackgroundInfo?.name}
                </div>
                <div>{chatBackgroundInfo?.total}</div>
              </div>
              <img
                src={icons.backgroundClose}
                className="w-[10px] h-[10px] cursor-pointer"
                onClick={() => {
                  setChatBackgroundInfo(null);
                  handleAdvancedConfigChange(
                    () => (advancedConfig.chatBackground.info = null)
                  );
                  updateAdvancedConfigParams({
                    chatBackground: {
                      info: null,
                    },
                  });
                }}
                alt=""
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const useAdvancedConfiguration = (): useAdvancedConfigurationProps => {
  const { t } = useTranslation();
  const currentFlow = useFlowsManager(state => state.currentFlow) as
    | FlowType
    | undefined;
  const setCurrentFlow = useFlowsManager(state => state.setCurrentFlow);
  const [openingRemarksModal, setOpeningRemarksModal] =
    useState<boolean>(false);
  const [chatBackgroundInfo, setChatBackgroundInfo] =
    useState<ChatBackgroundInfo | null>(null);

  const advancedConfig = useMemo<AdvancedConfigType>(() => {
    if (currentFlow?.advancedConfig && isJSON(currentFlow.advancedConfig)) {
      const parsedConfig = JSON.parse(currentFlow.advancedConfig);
      if (parsedConfig?.chatBackground?.info) {
        setChatBackgroundInfo(parsedConfig.chatBackground.info);
      }
      return {
        needGuide: parsedConfig?.needGuide,
        prologue: {
          enabled: parsedConfig?.prologue?.enabled ?? true,
          prologueText: parsedConfig?.prologue?.prologueText || '',
          inputExample: parsedConfig?.prologue?.inputExample || [''],
        },
        feedback: {
          enabled: parsedConfig?.feedback?.enabled ?? true,
        },
        suggestedQuestionsAfterAnswer: {
          enabled: parsedConfig?.suggestedQuestionsAfterAnswer?.enabled ?? true,
        },
        chatBackground: {
          enabled: parsedConfig?.chatBackground?.enabled ?? true,
          info: parsedConfig?.chatBackground?.info || null,
        },
      };
    } else {
      return {
        prologue: {
          enabled: true,
          prologueText: '',
          inputExample: [''],
        },
        feedback: {
          enabled: true,
        },
        suggestedQuestionsAfterAnswer: {
          enabled: true,
        },
        chatBackground: {
          enabled: true,
          info: null,
        },
      };
    }
  }, [currentFlow?.advancedConfig]);

  const handlePresetQuestionChange = useCallback(
    (index: number, value: string) => {
      handleAdvancedConfigChange(
        () => (advancedConfig.prologue.inputExample[index] = value)
      );
      updateAdvancedConfigParamsDebounce({
        prologue: {
          inputExample: advancedConfig.prologue.inputExample,
        },
      });
    },
    [advancedConfig]
  );

  const updateAdvancedConfigParams = useCallback(
    (updateParams: AdvancedConfigUpdate) => {
      const params = {
        id: currentFlow?.id,
        flowId: currentFlow?.flowId,
        advancedConfig: updateParams,
      };
      saveFlowAPI(params);
    },
    [currentFlow?.id, currentFlow?.flowId]
  );

  const updateAdvancedConfigParamsDebounce = useCallback(
    debounce((updateParams: AdvancedConfigUpdate) => {
      const params = {
        id: currentFlow?.id,
        flowId: currentFlow?.flowId,
        advancedConfig: updateParams,
      };
      saveFlowAPI(params);
    }, 500),
    [currentFlow?.id, currentFlow?.flowId]
  );

  const handleAdvancedConfigChange = useCallback(
    (callback: () => void) => {
      callback && callback();
      setCurrentFlow((currentFlow: FlowType | undefined) => {
        if (currentFlow) {
          currentFlow.advancedConfig = JSON.stringify(advancedConfig);
        }
        return cloneDeep(currentFlow);
      });
    },
    [advancedConfig]
  );

  function beforeUpload(file: UploadFile): boolean {
    const maxSize = 5 * 1024 * 1024;
    if (file.size && file.size > maxSize) {
      message.error(t('workflow.advancedConfiguration.uploadFileSizeError'));
      return false;
    }
    const fileExtension = file?.name?.split('.')?.pop()?.toLowerCase();
    const isValidFormat =
      fileExtension && ['png', 'jpg', 'jpeg'].includes(fileExtension);
    if (!isValidFormat) {
      message.error(t('workflow.advancedConfiguration.uploadFileFormatError'));
      return false;
    } else {
      return true;
    }
  }

  const formatFileSize = (sizeInBytes: number): string => {
    if (sizeInBytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(sizeInBytes) / Math.log(k));

    return (
      parseFloat((sizeInBytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    );
  };

  const uploadProps: UploadProps = {
    name: 'file',
    action: getFixedUrl('/image/upload'),
    showUploadList: false,
    accept: '.png,.jpg,.jpeg',
    headers: {
      Authorization: getAuthorization(),
    },
    beforeUpload,
    onChange: info => {
      const file = info.file;
      if (info.file.status === 'done') {
        const response = info.file.response as UploadResponse;
        if (response && response.data && response.code === 0) {
          const data = response.data;
          const type = file.name?.split('.')?.pop()?.toLowerCase();
          const chatBackgroundInfo: ChatBackgroundInfo = {
            name: file.name || '',
            type: type || '',
            total: formatFileSize(file.size || 0),
            url: data.downloadLink,
          };
          setChatBackgroundInfo(chatBackgroundInfo);
          handleAdvancedConfigChange(
            () => (advancedConfig.chatBackground.info = chatBackgroundInfo)
          );
          updateAdvancedConfigParams({
            chatBackground: {
              info: chatBackgroundInfo,
            },
          });
        } else {
          message.error(response?.message || '上传失败');
        }
      }
    },
  };
  return {
    advancedConfig,
    handleAdvancedConfigChange,
    updateAdvancedConfigParams,
    updateAdvancedConfigParamsDebounce,
    handlePresetQuestionChange,
    openingRemarksModal,
    setOpeningRemarksModal,
    chatBackgroundInfo,
    setChatBackgroundInfo,
    uploadProps,
  };
};

function AdvancedConfiguration(): React.ReactElement {
  const { t } = useTranslation();
  const [drawerStyle, setDrawerStyle] = useState<DrawerStyleType>({
    height: window?.innerHeight - 80,
    top: 80,
    right: 0,
    zIndex: 998,
  });
  const open = useFlowsManager(state => state.advancedConfiguration);
  const setOpen = useFlowsManager(state => state.setAdvancedConfiguration);
  const currentFlow = useFlowsManager(state => state.currentFlow);
  const {
    advancedConfig,
    handleAdvancedConfigChange,
    updateAdvancedConfigParams,
    updateAdvancedConfigParamsDebounce,
    handlePresetQuestionChange,
    openingRemarksModal,
    setOpeningRemarksModal,
    chatBackgroundInfo,
    setChatBackgroundInfo,
    uploadProps,
  } = useAdvancedConfiguration();
  useEffect(() => {
    const handleAdjustmentDrawerStyle = (): void => {
      setDrawerStyle({
        ...drawerStyle,
        height: window?.innerHeight - 80,
      });
    };
    window.addEventListener('resize', handleAdjustmentDrawerStyle);
    return (): void =>
      window.removeEventListener('resize', handleAdjustmentDrawerStyle);
  }, [drawerStyle]);
  return (
    <Drawer
      rootClassName="advanced-configuration-container"
      rootStyle={drawerStyle}
      placement="right"
      open={open}
      mask={false}
      getContainer={() =>
        document.getElementById('flow-container') || document.body
      }
    >
      {openingRemarksModal && (
        <OpeningRemarks
          setOpeningRemarksModal={setOpeningRemarksModal}
          setConversationStarter={(value: string) => {
            handleAdvancedConfigChange(
              () => (advancedConfig.prologue.prologueText = value)
            );
            updateAdvancedConfigParams({
              prologue: {
                prologueText: value,
              },
            });
          }}
          currentRobot={currentFlow}
          isFlow={true}
        />
      )}
      <div
        className="w-full h-full py-4 flex flex-col overflow-hidden"
        onKeyDown={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5">
          <div className="font-semibold text-lg">
            {t('workflow.advancedConfiguration.title')}
          </div>
          <img
            src={icons.close}
            className="w-3 h-3 cursor-pointer"
            alt=""
            onClick={() => setOpen(false)}
          />
        </div>
        <div className="text-[#999] text-sm font-medium mt-[14px] px-5">
          {t('workflow.advancedConfiguration.subtitle')}
        </div>
        <div className="flex-1 overflow-auto flex flex-col mt-8 gap-2.5 px-5">
          <ConversationStarter
            advancedConfig={advancedConfig}
            handleAdvancedConfigChange={handleAdvancedConfigChange}
            updateAdvancedConfigParams={updateAdvancedConfigParams}
            setOpeningRemarksModal={setOpeningRemarksModal}
            updateAdvancedConfigParamsDebounce={
              updateAdvancedConfigParamsDebounce
            }
            handlePresetQuestionChange={handlePresetQuestionChange}
            t={t}
          />
          <SuggestedQuestions
            advancedConfig={advancedConfig}
            handleAdvancedConfigChange={handleAdvancedConfigChange}
            updateAdvancedConfigParams={updateAdvancedConfigParams}
            t={t}
          />
          <ChatBackground
            advancedConfig={advancedConfig}
            handleAdvancedConfigChange={handleAdvancedConfigChange}
            updateAdvancedConfigParams={updateAdvancedConfigParams}
            t={t}
            uploadProps={uploadProps}
            chatBackgroundInfo={chatBackgroundInfo}
            setChatBackgroundInfo={setChatBackgroundInfo}
          />
        </div>
      </div>
    </Drawer>
  );
}

export default AdvancedConfiguration;
