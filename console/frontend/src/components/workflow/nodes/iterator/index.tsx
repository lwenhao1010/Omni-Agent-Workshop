import React, { memo } from 'react';
import Inputs from '@/components/workflow/nodes/components/inputs';
import Outputs from '@/components/workflow/nodes/components/outputs';
import FLowContainer from './components/flow-container';
import { useTranslation } from 'react-i18next';

export const IteratorDetail = memo(props => {
  const { id, data } = props;

  const { t } = useTranslation();

  return (
    <div>
      <div className="p-[14px] pb-[6px]">
        <div className="bg-[#fff] py-4 rounded-lg flex flex-col gap-2.5">
          <Inputs id={id} allowAdd={false} data={data}>
            <div className="text-base font-medium">
              {t('workflow.nodes.iteratorNode.input')}
            </div>
          </Inputs>
          <Outputs id={id} data={data}>
            <div className="text-base font-medium">
              {t('workflow.nodes.iteratorNode.output')}
            </div>
          </Outputs>
        </div>
      </div>
    </div>
  );
});

export const Iterator = memo(({ id }) => {
  return (
    <>
      <span className="text-xs text-[#333]">子节点</span>
      <FLowContainer id={id} />
    </>
  );
});
