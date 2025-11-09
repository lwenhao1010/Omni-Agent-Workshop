import React, { memo, FC } from 'react';
import { DeleteModal, CreateModal } from './components/modal-component';
import folderIcon from '@/assets/imgs/knowledge/folder_icon.svg';
import { useKnowledgePage } from './hooks/use-knowledge-page';
import { KnowledgeContent } from './components/knowledge-content';

const KnowledgePage: FC = () => {
  const {
    knowledgeRef,
    deleteModal,
    setDeleteModal,
    createModal,
    setCreateModal,
    currentKnowledge,
    setCurrentKnowledge,
    isHovered,
    setIsHovered,
    knowledges,
    searchValue,
    setSearchValue,
    getRobotsDebounce,
    getKnowledges,
  } = useKnowledgePage();
  return (
    <div className="w-full h-full overflow-hidden pb-6">
      {deleteModal && (
        <DeleteModal
          setDeleteModal={setDeleteModal}
          currentKnowledge={currentKnowledge}
          getKnowledges={() => {
            if (searchValue) {
              setSearchValue('');
            } else {
              getKnowledges();
            }
          }}
        />
      )}
      {createModal && <CreateModal setCreateModal={setCreateModal} />}
      <KnowledgeContent
        knowledgeRef={knowledgeRef as React.RefObject<HTMLDivElement>}
        isHovered={isHovered}
        setIsHovered={setIsHovered}
        knowledges={knowledges}
        getRobotsDebounce={getRobotsDebounce}
        setCreateModal={setCreateModal}
        setDeleteModal={setDeleteModal}
        setCurrentKnowledge={setCurrentKnowledge}
        folderIcon={folderIcon}
      />
    </div>
  );
};

export default memo(KnowledgePage);
