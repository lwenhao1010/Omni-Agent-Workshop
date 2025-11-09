import { useTranslation } from 'react-i18next';
import ModelParamsTable from '../../components/model-params-table';
import {
  ModelInfo,
  ModelConfigParam,
  LLMSource,
  ModelCreateType,
} from '@/types/model';
import React from 'react';

interface ModelConfigSectionProps {
  modelDetail: ModelInfo | null;
  llmSource: string | null;
  modelParams: ModelConfigParam[];
  setModelParams: (params: ModelConfigParam[]) => void;
  checkNameConventions: (string: string) => boolean;
  maskKey: (key?: string) => string;
}

const ModelConfigSection: React.FC<ModelConfigSectionProps> = ({
  modelDetail,
  llmSource,
  modelParams,
  setModelParams,
  checkNameConventions,
  maskKey,
}) => {
  const { t } = useTranslation();

  return (
    <>
      {modelDetail?.llmSource === LLMSource.CUSTOM && (
        <div className="mt-10 p-4 rounded-[10px] border border-[#F2F5FE] box-border">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div>
                <p>
                  <span className="font-['PingFang_SC'] text-sm font-normal text-[#7F7F7F]">
                    Model：
                  </span>
                  <span className="font-['PingFang_SC'] text-sm font-normal text-[#333333]">
                    {modelDetail?.domain}
                  </span>
                </p>
                {modelDetail.type === ModelCreateType.THIRD_PARTY && (
                  <>
                    <p>
                      <span className="font-['PingFang_SC'] text-sm font-normal text-[#7F7F7F]">
                        {t('model.interfaceAddress')}：
                      </span>
                      <span className="font-['PingFang_SC'] text-sm font-normal text-[#333333]">
                        {modelDetail?.url}
                      </span>
                    </p>
                    <p>
                      <span className="font-['PingFang_SC'] text-sm font-normal text-[#7F7F7F]">
                        {t('model.apiKey')}：
                      </span>
                      <span className="font-['PingFang_SC'] text-sm font-normal text-[#333333]">
                        {maskKey(modelDetail?.apiKey || '')}
                      </span>
                    </p>
                  </>
                )}
                {modelDetail.type === ModelCreateType.LOCAL && (
                  <p>
                    <span className="font-['PingFang_SC'] text-sm font-normal text-[#7F7F7F]">
                      {t('model.acceleratorCount')}：
                    </span>
                    <span className="font-['PingFang_SC'] text-sm font-normal text-[#333333]">
                      {modelDetail?.acceleratorCount}
                    </span>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {modelDetail?.llmSource === LLMSource.CUSTOM && (
        <div className="flex flex-col gap-2 mt-5">
          <div className="w-full flex items-center justify-between">
            <div className="font-bold">{t('model.modelParameters')}：</div>
          </div>
          <div>
            <ModelParamsTable
              modelParams={modelParams}
              setModelParams={setModelParams}
              checkNameConventions={checkNameConventions}
              detail={true}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default ModelConfigSection;
