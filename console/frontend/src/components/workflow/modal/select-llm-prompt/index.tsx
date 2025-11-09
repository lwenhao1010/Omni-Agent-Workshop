import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import useFlowsManager from '@/components/workflow/store/use-flows-manager';
import { Input, Spin, Tooltip } from 'antd';
import { useDebounce, useMemoizedFn } from 'ahooks';
import { cloneDeep } from 'lodash';
import { v4 as uuid } from 'uuid';
import dayjs from 'dayjs';
import { getOfficialPromptList } from '@/services/prompt';
import { PromptItem } from '@/components/workflow/types';
import { Icons } from '@/components/workflow/icons';

const SelectPromptHeader = (): React.ReactElement => {
  const { t } = useTranslation();
  const setSelectPromptModalInfo = useFlowsManager(
    state => state.setSelectPromptModalInfo
  );
  return (
    <div className="flex items-center justify-between font-medium pr-6">
      <span className="font-semibold text-base">
        {t('workflow.nodes.selectPrompt.title')}
      </span>
      <img
        src={Icons.selectLlmPrompt.close}
        className="w-3 h-3 cursor-pointer"
        alt=""
        onClick={() =>
          setSelectPromptModalInfo({
            open: false,
            nodeId: '',
          })
        }
      />
    </div>
  );
};

const SelectPromptToolbar = ({
  value,
  setValue,
}: {
  value: string;
  setValue: (value: string) => void;
}): React.ReactElement => {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-end mt-6">
      <div className="flex items-center gap-6 pr-6">
        <div className="relative">
          <img
            src={Icons.selectLlmPrompt.search}
            className="w-4 h-4 absolute left-[14px] top-[13px] z-10"
            alt=""
          />
          <Input
            value={value}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setValue(e.target.value)
            }
            className="w-[250px] pl-10 h-10"
            placeholder={t('workflow.nodes.selectPrompt.searchPlaceholder')}
          />
        </div>
      </div>
    </div>
  );
};

const SelectPromptList = ({
  loading,
  dataSource,
  handleAddTemplateDataToNode,
}): React.ReactElement => {
  const { t } = useTranslation();
  if (loading) return <Spin spinning={loading} />;
  if (dataSource?.length === 0) {
    return (
      <div className="mt-3 flex flex-col justify-center items-center gap-[30px] text-desc h-full">
        <img
          src={Icons.selectLlmPrompt.knowledgeListEmpty}
          className="w-[124px] h-[122px]"
          alt=""
        />
        <p>{t('workflow.nodes.selectPrompt.noTemplates')}</p>
      </div>
    );
  }
  return dataSource?.map(item => (
    <div
      key={item?.id}
      className="w-full rounded-lg border border-[#E4EAFF] p-[14px] pr-6 flex items-center justify-between gap-6 overflow-hidden flex-shrink-0"
    >
      <div className="flex flex-col gap-3 flex-1 overflow-hidden">
        <div
          className="text-[#333] font-medium text-overflow"
          title={item?.name}
        >
          {item?.name}
        </div>
        <p className="text-[#979797] text-overflow" title={item?.promptKey}>
          {item?.promptKey}
        </p>
      </div>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <img
            src={Icons.selectLlmPrompt.publishIcon}
            className="w-3 h-3"
            alt=""
          />
          <p className="text-[#666666]">
            {t('workflow.nodes.selectPrompt.publishedAt')} {item?.publishTime}
          </p>
        </div>
        {item?.inputs && (
          <Tooltip
            placement="right"
            title={item?.inputs}
            overlayClassName="white-tooltip tool-params-tooltip"
          >
            <div className="flex items-center cursor-pointer gap-1.5 text-[#275EFF] text-sm font-medium">
              <span>{t('workflow.nodes.selectPrompt.parameters')}</span>
            </div>
          </Tooltip>
        )}
        <div
          className="border border-[#275EFF] rounded-lg text-[#275EFF] font-medium px-6 py-1.5 cursor-pointer"
          onClick={() => handleAddTemplateDataToNode(item)}
        >
          {t('workflow.nodes.selectPrompt.add')}
        </div>
      </div>
    </div>
  ));
};

const useSelectLLMPrompt = (): {
  handleAddTemplateDataToNode: (res: PromptItem) => void;
} => {
  const { t } = useTranslation();
  const selectPromptModalInfo = useFlowsManager(
    state => state.selectPromptModalInfo
  );
  const setSelectPromptModalInfo = useFlowsManager(
    state => state.setSelectPromptModalInfo
  );
  const setUpdateNodeInputData = useFlowsManager(
    state => state.setUpdateNodeInputData
  );
  const sparkLlmModels = useFlowsManager(state => state.sparkLlmModels);
  const currentStore = useFlowsManager(state => state.getCurrentStore());
  const setNode = currentStore(state => state.setNode);
  const updateNodeRef = currentStore(state => state.updateNodeRef);
  const htmlToTextWithNewlines = useMemoizedFn((node: unknown) => {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent;
    }

    let text = '';
    const isBlock = [
      'DIV',
      'P',
      'BR',
      'H1',
      'H2',
      'H3',
      'H4',
      'H5',
      'H6',
    ].includes(node.tagName);

    if (node.tagName === 'BR') {
      return '\n';
    }

    for (const child of node.childNodes) {
      text += htmlToTextWithNewlines(child);
    }

    if (isBlock && node.tagName !== 'BR') {
      return text + '\n';
    }

    return text;
  });

  const extractTextWithBraces = useMemoizedFn((html: string) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const result = htmlToTextWithNewlines(doc.body)
      .replace(/\n{3,}/g, '\n\n')
      .trim();
    return result;
  });

  const handleAddTemplateDataToNode = useMemoizedFn((res: PromptItem) => {
    const systemTemplate = extractTextWithBraces(
      res?.promptText?.messageList?.[0]?.content || ''
    );
    const template = extractTextWithBraces(
      res?.promptText?.messageList?.[1]?.content || ''
    );
    const inputs = res?.promptInput?.variableList?.map(item => ({
      schema: {
        type: 'string',
        value: {
          type: 'ref',
          content: {},
        },
      },
      name: item?.name,
      id: uuid(),
    }));
    setNode(selectPromptModalInfo?.nodeId, old => {
      const data = old?.data;
      const value = sparkLlmModels.find(
        model => model.serviceId === res?.modelConfig?.llmVersion
      );
      if (
        data.nodeParam.serviceId === 'xdeepseekr1' ||
        data?.nodeParam?.isThink
      ) {
        data.outputs = [
          {
            id: uuid(),
            name: 'output',
            nameErrMsg: '',
            schema: {
              default: '',
              type: 'string',
            },
          },
        ];
      }
      if (value.serviceId === 'xdeepseekr1' || value?.isThink) {
        data.outputs = [
          {
            id: uuid(),
            customParameterType: 'deepseekr1',
            name: 'REASONING_CONTENT',
            nameErrMsg: '',
            schema: {
              default: t('workflow.nodes.selectPrompt.modelThinkingProcess'),
              type: 'string',
            },
          },
          {
            id: uuid(),
            name: 'output',
            nameErrMsg: '',
            schema: {
              default: '',
              type: 'string',
            },
          },
        ];
      }
      if (value.serviceId === 'image_understanding' || value?.multiMode) {
        data.inputs.unshift({
          id: uuid(),
          customParameterType: 'image_understanding',
          name: 'SYSTEM_IMAGE',
          schema: {
            type: 'string',
            value: {
              content: {},
              type: 'ref',
            },
          },
        });
      }
      if (
        data.nodeParam.serviceId === 'image_understanding' ||
        data?.nodeParam?.multiMode
      ) {
        data.inputs.shift();
      }
      data.nodeParam.template = template;
      data.nodeParam.systemTemplate = systemTemplate;
      data.inputs = [...old.data.inputs, ...(inputs || [])];
      data.nodeParam.llmId = value?.llmId;
      data.nodeParam.domain = value?.domain;
      data.nodeParam.serviceId = value?.serviceId;
      data.nodeParam.patchId = value?.patchId;
      data.nodeParam.url = value?.url;
      data.nodeParam.modelId = value?.id;
      data.nodeParam.isThink = value?.isThink;
      data.nodeParam.multiMode = value.multiMode;
      data.nodeParam.maxTokens = res?.modelConfig?.maxTokens;
      data.nodeParam.temperature = res?.modelConfig?.temperature;
      data.nodeParam.topK = res?.modelConfig?.topK;
      if (value.llmSource === 0) {
        data.nodeParam.source = 'openai';
      } else {
        delete data.nodeParam.source;
      }
      return {
        ...cloneDeep(old),
      };
    });
    updateNodeRef(selectPromptModalInfo?.nodeId);
    setSelectPromptModalInfo({
      open: false,
      nodeId: '',
    });
    setTimeout(() => {
      setUpdateNodeInputData(updateNodeInputData => !updateNodeInputData);
    });
  });
  return {
    handleAddTemplateDataToNode,
  };
};

function SelectPrompt(): React.ReactElement {
  const { handleAddTemplateDataToNode } = useSelectLLMPrompt();
  const selectPromptModal = useFlowsManager(
    state => state.selectPromptModalInfo?.open
  );
  const [dataSource, setDataSource] = useState<PromptItem[]>([]);
  const [value, setValue] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const debouncedValue = useDebounce(value, { wait: 500 });

  useEffect(() => {
    setLoading(true);
    getOfficialPromptList()
      .then((res: unknown) => {
        setDataSource(
          res?.map((item: unknown) => ({
            ...item,
            publishTime: dayjs(item?.commitTime).format('YYYY-MM-DD HH:mm:ss'),
            inputs: item?.variableList
              ?.map((item: unknown) => item?.name)
              .join(','),
          }))
        );
      })
      .finally(() => setLoading(false));
  }, [debouncedValue]);

  return (
    <>
      {selectPromptModal
        ? createPortal(
            <div
              className="mask"
              style={{
                zIndex: 1002,
              }}
            >
              <div className="modal-container w-[880px] pr-0 text-sm h-[570px]">
                <SelectPromptHeader />
                <SelectPromptToolbar value={value} setValue={setValue} />
                <SelectPromptList
                  loading={loading}
                  dataSource={dataSource}
                  handleAddTemplateDataToNode={handleAddTemplateDataToNode}
                />
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  );
}

export default SelectPrompt;
