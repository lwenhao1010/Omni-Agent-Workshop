import { memo, useCallback, JSX } from 'react';
import type React from 'react';
import { useTranslation } from 'react-i18next';
import { DatabaseItem } from '@/types/database';
import databaseIcon from '@/assets/imgs/database/database-page-icon.svg';

interface DatabaseCardProps {
  database: DatabaseItem;
  onCardClick: (database: DatabaseItem) => void;
  onDeleteClick: (database: DatabaseItem, e: React.MouseEvent) => void;
}

const DatabaseCard = ({
  database,
  onCardClick,
  onDeleteClick,
}: DatabaseCardProps): JSX.Element => {
  const { t } = useTranslation();

  const handleCardClick = useCallback(() => {
    onCardClick(database);
  }, [database, onCardClick]);

  const handleDeleteClick = useCallback(
    (e: React.MouseEvent) => {
      onDeleteClick(database, e);
    },
    [database, onDeleteClick]
  );

  return (
    <div className="common-card-item group h-[192px]" onClick={handleCardClick}>
      <div className="px-6">
        <div className="flex items-center gap-4">
          <img src={databaseIcon} className="w-8 h-8" alt="database icon" />
          <span
            className="flex-1 font-medium text-overflow title-color title-size"
            title={database.name}
          >
            {database.name}
          </span>
        </div>
        <div
          className="h-8 mt-5 text-sm text-desc text-overflow"
          title={database.description}
        >
          {database.description}
        </div>
      </div>
      <div
        className="flex items-center justify-between mt-3 overflow-hidden overflow-x-auto overflow-y-hidden py-4 px-6 border-t border-dashed border-[#e2e8ff]"
        style={{
          scrollbarWidth: 'none', // Hide scrollbar
          msOverflowStyle: 'none', // IE/Edge hide scrollbar
        }}
      >
        <span className="text-[#7F7F7F] text-xs go-setting flex items-center">
          <span className="whitespace-nowrap">{t('database.goToEdit')}</span>
          <span className="setting-icon setting-act"></span>
        </span>
        <div className="flex items-center">
          <div className="flex items-center gap-5 text-desc">
            <div
              className="flex items-center cursor-pointer card-delete"
              onClick={handleDeleteClick}
            >
              <span className="delete-icon"></span>
              <span className="ml-1 whitespace-nowrap">
                {t('database.delete')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(DatabaseCard);
