import React, { useRef } from 'react';
import ModelManagementHeader from '../components/model-management-header';
import CategoryAside from '../components/category-aside';
import { CategoryAsideRef } from '@/types/model';
import ModelCardList from '../components/model-card-list';
import ModelModalComponents from '../components/model-modal-components';
import { ModelProvider, useModelContext } from '../context/model-context';
import { useModelInitializer } from '../hooks/use-model-initializer';
import { useModelOperations } from '../hooks/use-model-operations';
import { useModelFilters } from '../hooks/use-model-filters';

// 官方模型页面内容组件
const OfficialModelContent: React.FC = () => {
  const { state } = useModelContext();
  const categoryRef = useRef<CategoryAsideRef>(null);

  // 使用hooks
  useModelInitializer(1); // 1表示官方模型
  const operations = useModelOperations(1);
  const filters = useModelFilters();

  return (
    <div className="w-full h-screen flex flex-col">
      {/* 1️⃣ 头部：高度用 rem 写法，避免缩放错位 */}
      <div
        className="flex-none pt-4 pb-2 sm:pt-4 sm:pb-2 lg:pt-5 lg:pb-2 mt-1"
        style={{
          paddingLeft: '7%',
          paddingRight: '7%',
        }}
      >
        <ModelManagementHeader
          activeTab="officialModel"
          shelfOffModel={state.shelfOffModels}
          refreshModels={operations.handleQuickFilter}
          searchInput={state.searchInput}
          setSearchInput={filters.handleSearchInputChange}
          setShowShelfOnly={operations.handleCloseQuickFilter}
        />
      </div>

      {/* 2️⃣ 内容区 */}
      <div className="flex-1 overflow-hidden pl-[7%]">
        {/* 响应式容器 */}
        <div className="mx-auto h-full w-full flex gap-6 lg:gap-2">
          {/* 左侧分类 */}
          <aside className="w-full lg:w-[224px] max-w-[224px] min-w-[180px] flex-shrink-0 rounded-[18px]  bg-[#FFFFFF]  overflow-y-auto hide-scrollbar shadow-sm">
            <CategoryAside
              ref={categoryRef}
              tree={state.categoryList}
              onSelect={filters.handleCategorySelect}
              onContextLengthChange={filters.handleContextLengthChange}
              defaultCheckedNodes={state.checkedLeaves}
              defaultContextLength={state.contextLength}
              setContextMaxLength={filters.handleSetContextMaxLength}
              loading={state.loading}
            />
          </aside>

          {/* 右侧卡片 */}
          <main className="flex-1 rounded-lg overflow-y-auto [&::-webkit-scrollbar-thumb]:rounded-full">
            <ModelCardList
              models={filters.filteredModels}
              keyword={state.searchInput}
              showShelfOnly={state.showShelfOnly}
              refreshModels={operations.refreshModels}
            />
          </main>
        </div>
      </div>

      {/* 模态框 */}
      <ModelModalComponents modelType={1} />
    </div>
  );
};

// 官方模型页面主组件（带Provider）
function OfficialModel(): React.JSX.Element {
  return (
    <ModelProvider>
      <OfficialModelContent />
    </ModelProvider>
  );
}

export default OfficialModel;
