import React, { memo, FC } from 'react';
import { useTranslation } from 'react-i18next';
import { DeleteModal } from './components/modal-component';
import { useNavigate } from 'react-router-dom';
import RetractableInput from '@/components/ui/global/retract-table-input';
import { jumpToLogin } from '@/utils/http';
import { usePluginPage } from './hooks/use-plugin-page';

const PluginPage: FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    user,
    tools,
    getTools,
    getToolsDebounce,
    isHovered,
    setIsHovered,
    deleteModal,
    setDeleteModal,
    currentTool,
    setCurrentTool,
    searchValue,
    setSearchValue,
  } = usePluginPage();

  return (
    <div className="w-full h-full flex flex-col overflow-hidden py-8">
      {deleteModal && (
        <DeleteModal
          currentTool={currentTool}
          setDeleteModal={setDeleteModal}
          getTools={() => {
            if (searchValue) {
              setSearchValue('');
            } else {
              getTools();
            }
          }}
        />
      )}
      <div
        className="flex justify-between mx-auto max-w-[1425px]"
        style={{
          width: 'calc(0.85 * (100% - 8px))',
        }}
      >
        <div className="font-medium"></div>
        <RetractableInput
          restrictFirstChar={true}
          onChange={getToolsDebounce}
        />
      </div>
      <div className="w-full flex-1 overflow-scroll pt-6">
        <div
          className="h-full mx-auto max-w-[1425px]"
          style={{
            width: '85%',
          }}
        >
          <div className="grid lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 3xl:grid-cols-3 gap-6">
            <div
              className={`plugin-card-add-container relative ${
                isHovered === null
                  ? ''
                  : isHovered
                    ? 'plugin-no-hover'
                    : ' plugin-hover'
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

                navigate('/resource/plugin/create');
              }}
            >
              <div className="color-mask"></div>
              <div className="plugin-card-add flex flex-col">
                <div className="flex justify-between w-full">
                  <span className="logo"></span>
                  <span className="add-icon"></span>
                </div>
                <div
                  className="mt-4 font-semibold add-name"
                  style={{ fontSize: 22 }}
                >
                  {t('plugin.createPlugin')}
                </div>
              </div>
            </div>
            {tools.map(k => (
              <div
                className="common-card-item plugin-card-item group"
                key={k.id}
                onClick={() => {
                  if (k.status == 0) {
                    if (!user?.login && !user?.uid) {
                      return jumpToLogin();
                    }
                    navigate(`/resource/plugin/create?id=${k.id}`);
                  } else {
                    navigate(`/resource/plugin/detail/${k.id}/parameter`);
                  }
                }}
              >
                <div
                  className="px-1.5 py-0.5 rounded-md font-medium text-xs absolute right-[1px] top-[1px]"
                  style={{
                    background: k.status == 0 ? '#f2f2f2' : '#275eff',
                    color: k.status == 0 ? '#7F7F7F' : '#FFFFFF',
                    borderRadius: '0px 18px 0px 8px',
                  }}
                >
                  {k.status == 0 ? t('plugin.draft') : t('plugin.available')}
                </div>
                <div className="px-6">
                  <div className="flex items-start gap-4">
                    <span
                      className="w-12 h-12 flex items-center justify-center rounded-lg"
                      style={{
                        background: k.avatarColor
                          ? k.avatarColor
                          : `url(${k.icon}) no-repeat center / cover`,
                      }}
                    >
                      {k.avatarColor && (
                        <img
                          src={k.icon || ''}
                          className="w-[28px] h-[28px]"
                          alt=""
                        />
                      )}
                    </span>
                    <div className="flex flex-col gap-2 flex-1 overflow-hidden">
                      <div className="flex-1 flex items-center justify-between overflow-hidden">
                        <span
                          className="flex-1 text-overflow font-medium text-xl title-color title-size"
                          title={k.name}
                        >
                          {k.name}
                        </span>
                      </div>
                      <div
                        className="text-desc text-overflow h-5 text-sm"
                        title={k.description}
                      >
                        {k.description}
                      </div>
                      <div className="text-sm">
                        <span className="rounded bg-[#ebeeff] px-2 py-1 inline-block">
                          {t('plugin.relatedApplications')}：{k?.botUsedCount}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  className="flex justify-between items-center mt-6 overflow-hidden overflow-x-auto overflow-y-hidden"
                  style={{
                    padding: '16px 24px',
                    borderTop: '1px dashed #e2e8ff',
                    scrollbarWidth: 'none', // 隐藏滚动条
                    msOverflowStyle: 'none', // IE/Edge隐藏滚动条
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
                          setCurrentTool(k);
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
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(PluginPage);
