import { useState, useEffect, useMemo, JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { message } from 'antd';
import ModelCard from './model-card';
import { CreateModal } from './modal-component';
import { getCategoryTree } from '@/services/model';
import { ModelInfo, CategoryNode } from '@/types/model';

interface Props {
  models: ModelInfo[];
  /* 是否展示「新建模型」卡片，默认 false */
  showCreate?: boolean;
  keyword: string;
  filterType?: number;
  setModels?: (value: ModelInfo[]) => void;
  refreshModels: () => void;
  showShelfOnly: boolean;
}

function ModelCardList({
  models,
  showCreate = false,
  keyword,
  filterType,
  setModels,
  refreshModels,
  showShelfOnly,
}: Props): JSX.Element {
  const { t } = useTranslation();
  const [isHovered, setIsHovered] = useState<boolean | null>(null);
  const [createModal, setCreateModal] = useState(false);
  const [modelId, setModelId] = useState<number | undefined>();
  const [categoryTree, setCategoryTree] = useState<CategoryNode[]>([]); // 个人模型新建时，需要展示的分类标签

  useEffect(() => {
    getCategoryTree()
      .then(data => {
        // 全部模型
        setCategoryTree(data);
      })
      .catch(error => {
        const errorMessage =
          error instanceof Error
            ? error.message
            : t('model.getCategoryTreeFailed');
        message.error(errorMessage);
      });
  }, []);

  const renderList = useMemo(() => {
    const list = [...models];
    if (!keyword) return list;
    if (keyword.trim()) {
      const lower = keyword.toLowerCase();
      return list.filter(m => m.name.toLowerCase().includes(lower));
    }
    return list;
  }, [keyword, models]);

  return (
    <div className={`${showCreate ? '' : 'lg:pl-[1%]'} pr-[7%]`}>
      {/* 卡片网格 */}
      <div className={`grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3`}>
        {/* 新建模型卡片 */}
        {showCreate && (
          <div
            className={`plugin-card-add-container relative ${
              isHovered === null
                ? ''
                : isHovered
                  ? 'plugin-no-hover'
                  : ' plugin-hover'
            } min-w-[220px]`}
            onMouseLeave={() => {
              setIsHovered(true);
            }}
            onMouseEnter={() => {
              setIsHovered(false);
            }}
            onClick={() => {
              setCreateModal(true);
              setModelId(undefined);
            }}
          >
            <div className="color-mask"></div>
            <div className="plugin-card-add flex flex-col">
              <div className="flex justify-between w-full">
                <span className="model-icon"></span>
                <span className="add-icon"></span>
              </div>
              <div
                className="mt-3 font-semibold add-name"
                style={{ fontSize: 22 }}
              >
                {t('model.createModel')}
              </div>
            </div>
          </div>
        )}

        {/* 普通模型卡片 */}
        {renderList.map(model => (
          <ModelCard
            key={model.id}
            model={model}
            filterType={filterType}
            categoryTree={categoryTree}
            getModels={refreshModels}
            showShelfOnly={showShelfOnly}
          />
        ))}
      </div>

      {createModal && (
        <CreateModal
          setCreateModal={setCreateModal}
          getModels={refreshModels}
          modelId={modelId?.toString() || ''}
          categoryTree={categoryTree}
          setModels={setModels}
          filterType={filterType}
        />
      )}
    </div>
  );
}

export default ModelCardList;
