import { useState, memo, JSX } from 'react';
import { useTranslation } from 'react-i18next';

interface CreateDatabaseCardProps {
  onClick: () => void;
}

const CreateDatabaseCard = ({
  onClick,
}: CreateDatabaseCardProps): JSX.Element => {
  const { t } = useTranslation();
  const [isHovered, setIsHovered] = useState<boolean>(false);

  return (
    <div
      className={`common-card-add-container relative ${
        isHovered ? ' knowledge-hover' : 'knowledge-no-hover'
      }`}
      onMouseLeave={(): void => setIsHovered(false)}
      onMouseEnter={(): void => setIsHovered(true)}
      onClick={onClick}
    >
      <div className="color-mask"></div>
      <div className="flex flex-col w-full knowledge-card-add">
        <div className="flex justify-between w-full">
          <span className="database-icon"></span>
          <span className="add-icon"></span>
        </div>
        <div className="mt-4 font-semibold add-name text-[22px]">
          {t('database.createDatabase')}
        </div>
      </div>
    </div>
  );
};

export default memo(CreateDatabaseCard);
