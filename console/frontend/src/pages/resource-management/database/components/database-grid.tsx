import { RefObject, memo, JSX } from 'react';
import type React from 'react';
import RetractableInput from '@/components/ui/global/retract-table-input';
import CreateDatabaseCard from './create-database-card';
import DatabaseCard from './database-card';
import { DatabaseItem } from '@/types/database';

interface DatabaseGridProps {
  // 数据
  dataSource: DatabaseItem[];
  hasMore: boolean;
  loader: RefObject<HTMLDivElement>;

  // 搜索相关
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;

  // 创建数据库相关
  onCreateDatabaseClick: () => void;

  // 数据库操作
  onDatabaseClick: (database: DatabaseItem) => void;
  onDeleteClick: (database: DatabaseItem, e: React.MouseEvent) => void;
}

const DatabaseGrid = ({
  dataSource,
  hasMore,
  loader,
  onSearchChange,
  onCreateDatabaseClick,
  onDatabaseClick,
  onDeleteClick,
}: DatabaseGridProps): JSX.Element => {
  return (
    <div className="w-full h-full pb-6 overflow-hidden">
      <div className="flex flex-col h-full gap-6 pt-8 overflow-hidden">
        {/* 搜索框区域 */}
        <div className="flex justify-end mx-auto max-w-[1425px] w-[calc(0.85*(100%-8px))]">
          <RetractableInput
            restrictFirstChar={true}
            onChange={onSearchChange}
          />
        </div>

        {/* 网格内容区域 */}
        <div className="relative flex-1 w-full overflow-auto">
          <div className="mx-auto max-w-[1425px] w-[85%] min-h-[1000px]">
            <div className="grid items-end gap-6 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 3xl:grid-cols-3">
              {/* 创建数据库卡片 */}
              <CreateDatabaseCard onClick={onCreateDatabaseClick} />

              {/* 数据库列表卡片 */}
              {dataSource?.map((database: DatabaseItem) => (
                <DatabaseCard
                  key={database.id}
                  database={database}
                  onCardClick={onDatabaseClick}
                  onDeleteClick={onDeleteClick}
                />
              ))}
            </div>
          </div>

          {/* 无限滚动加载器 */}
          {hasMore && <div ref={loader}></div>}
        </div>
      </div>
    </div>
  );
};

export default memo(DatabaseGrid);
