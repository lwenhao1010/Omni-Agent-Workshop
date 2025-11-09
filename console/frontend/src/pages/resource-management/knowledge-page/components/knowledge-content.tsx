import React, { FC } from 'react';
import { RepoItem } from '../../../../types/resource';
import RetractableInput from '@/components/ui/global/retract-table-input';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import useUserStore from '@/store/user-store';
import { jumpToLogin } from '@/utils/http';

export const KnowledgeContent: FC<{
  knowledgeRef: React.RefObject<HTMLDivElement>;
  isHovered: boolean | null;
  setIsHovered: React.Dispatch<React.SetStateAction<boolean | null>>;
  knowledges: RepoItem[];
  getRobotsDebounce: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setCreateModal: React.Dispatch<React.SetStateAction<boolean>>;
  setDeleteModal: React.Dispatch<React.SetStateAction<boolean>>;
  setCurrentKnowledge: React.Dispatch<React.SetStateAction<RepoItem>>;
  folderIcon: string;
}> = ({
  knowledgeRef,
  isHovered,
  setIsHovered,
  knowledges,
  getRobotsDebounce,
  setCreateModal,
  setDeleteModal,
  setCurrentKnowledge,
  folderIcon,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useUserStore(state => state.user);
  return (
    <div className="pt-8 h-full flex flex-col overflow-hidden gap-6">
      <div
        className="flex justify-between mx-auto max-w-[1425px]"
        style={{
          width: 'calc(0.85 * (100% - 8px))',
        }}
      >
        <div className="flex items-center gap-6"></div>
        <RetractableInput
          restrictFirstChar={true}
          onChange={getRobotsDebounce}
        />
      </div>
      <div
        className="w-full flex-1 overflow-scroll"
        ref={knowledgeRef as React.RefObject<HTMLDivElement>}
      >
        <div
          className="w-full h-full mx-auto max-w-[1425px]"
          style={{
            width: '85%',
          }}
        >
          <div className="grid lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 3xl:grid-cols-3 gap-6">
            <div
              className={`common-card-add-container relative ${
                isHovered === null
                  ? ''
                  : isHovered
                    ? 'knowledge-no-hover'
                    : ' knowledge-hover'
              }`}
              onMouseLeave={e => {
                setIsHovered(true);
              }}
              onMouseEnter={e => {
                setIsHovered(false);
              }}
              onClick={() => {
                if (!user?.login && !user?.uid) {
                  return jumpToLogin();
                }
                setCreateModal(true);
              }}
            >
              <div className="color-mask"></div>
              <div className="w-full knowledge-card-add flex flex-col">
                <div className="flex justify-between">
                  <span className="logo"></span>
                  <span className="add-icon"></span>
                </div>
                <div
                  className="mt-4 font-semibold add-name"
                  style={{ fontSize: 22 }}
                >
                  {t('knowledge.createNewKnowledge')}
                </div>
              </div>
            </div>
            {knowledges.map(k => (
              <div
                className="common-card-item group flex flex-col"
                key={k.id}
                onClick={() => {
                  navigate(
                    `/resource/knowledge/detail/${k.id}/document?tag=${k.tag}`,
                    {
                      state: {
                        parentId: -1,
                      },
                    }
                  );
                }}
              >
                <img
                  src={k?.corner}
                  className="h-[28px] absolute right-[1px] top-[1px]"
                  alt=""
                />
                <div className="flex-1 flex flex-col">
                  <div className="px-6">
                    <div className="flex items-center gap-4">
                      <img src={folderIcon} className="w-8 h-8" alt="" />
                      <span
                        className="flex-1 text-overflow title-color title-size font-medium"
                        title={k.name}
                      >
                        {k.name}
                      </span>
                    </div>
                    <div
                      className="mt-1.5 text-desc text-overflow h-5 text-sm"
                      title={k.description}
                    >
                      {k.description}
                    </div>
                  </div>
                  <div className="px-6">
                    <div className="flex items-center justify-between px-3 bg-[#F2F5FE] rounded-xl mt-3 text-sm h-[38px]">
                      <div className="flex items-center gap-1 text-center justify-center">
                        <div className="text-[#333]">
                          {t('knowledge.documentCount')}
                        </div>
                        <div className="text-[#275EFF] text-xl DINPROMedium">
                          {k.fileCount}
                        </div>
                      </div>
                      <div className="w-[1px] h-[20px] my-[9px] bg-[#E1E8FF]"></div>
                      <div className="flex items-center gap-1 text-center justify-center">
                        <div className="text-[#333]">
                          {t('knowledge.totalCharacters')}
                        </div>
                        <div className="text-[#275EFF] text-xl DINPROMedium">
                          {Math.round(k.charCount / 1000)}
                        </div>
                      </div>
                      <div className="w-[1px] h-[20px] my-[9px] bg-[#E1E8FF]"></div>
                      <div className="flex items-center gap-1 text-center justify-center">
                        <div className="text-[#333]">
                          {t('knowledge.relatedAgents')}
                        </div>
                        <div className="text-[#275EFF] text-xl DINPROMedium">
                          {k?.bots?.length}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    className="mt-3 flex justify-between items-center overflow-hidden overflow-x-auto overflow-y-hidden"
                    style={{
                      padding: '12px 24px 0 24px',
                      borderTop: '1px dashed #e2e8ff',
                      scrollbarWidth: 'none', // Hide scrollbar
                      msOverflowStyle: 'none', // Hide scrollbar for IE/Edge
                    }}
                  >
                    <span className="text-[#7F7F7F] text-xs go-setting flex items-center">
                      <span className="whitespace-nowrap">
                        {t('common.edit')}
                      </span>
                      <span className="setting-icon setting-act"></span>
                    </span>
                    <div className="flex items-center">
                      <div className="flex items-center text-desc gap-5">
                        <div
                          className="card-delete cursor-pointer flex items-center"
                          onClick={e => {
                            e.stopPropagation();
                            setCurrentKnowledge(k);
                            setDeleteModal(true);
                          }}
                        >
                          <span className="delete-icon"></span>
                          <span className="ml-1 whitespace-nowrap">
                            {t('common.delete')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
