import { memo, FC, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { useNavigate } from 'react-router-dom';
import RetractableInput from '@/components/ui/global/retract-table-input';
import { jumpToLogin } from '@/utils/http';
import { useRpaPage } from './hooks/use-rpa-page';
import { Dropdown, message, Modal } from 'antd';
import { EllipsisOutlined } from '@ant-design/icons';

import useUserStore, { User } from '@/store/user-store';
import { ModalForm } from './components/modal-form';
import { RpaDetailFormInfo, RpaInfo } from '@/types/rpa';
import { deleteRpa, getRpaDetail } from '@/services/rpa';
const RpaPage: FC = () => {
  const { t } = useTranslation();
  const modalFormRef = useRef<{
    showModal: (values?: RpaDetailFormInfo) => void;
  }>(null);
  const { rpas, isHovered, setIsHovered, handleSearchRpas, refresh } =
    useRpaPage();
  const user = useUserStore(state => state.user);

  return (
    <div className="w-full h-full flex flex-col overflow-hidden py-8">
      <div
        className="flex justify-between mx-auto max-w-[1425px]"
        style={{
          width: 'calc(0.85 * (100% - 8px))',
        }}
      >
        <div className="font-medium"></div>
        <RetractableInput
          restrictFirstChar={true}
          onChange={handleSearchRpas}
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
              className={`rpa-card-add-container relative ${
                isHovered === null
                  ? ''
                  : isHovered
                    ? 'rpa-no-hover'
                    : 'rpa-hover'
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
                modalFormRef.current?.showModal();
              }}
            >
              <div className="color-mask"></div>
              <div className="rpa-card-add flex flex-col">
                <div className="flex justify-between w-full">
                  <span className="logo"></span>
                  <span className="add-icon"></span>
                </div>
                <div
                  className="mt-4 font-semibold add-name"
                  style={{ fontSize: 22 }}
                >
                  {t('rpa.createRpa')}
                </div>
              </div>
            </div>
            {rpas.map(rpa => (
              <RpaCard
                rpa={rpa}
                key={rpa.id}
                user={user}
                refresh={refresh}
                showModal={values => modalFormRef.current?.showModal(values)}
              />
            ))}
          </div>
        </div>
      </div>
      <ModalForm ref={modalFormRef} refresh={refresh} />
    </div>
  );
};

export const RpaCard = ({
  rpa,
  user,
  refresh,
  showModal,
}: {
  rpa: RpaInfo;
  user: User;
  refresh: () => void;
  showModal: (values?: RpaDetailFormInfo) => void;
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const actions = new Map([
    [
      'edit',
      async (record: RpaInfo) => {
        const result = await getRpaDetail(record.id);
        const formData = {
          id: result.id,
          platformId: result.platformId,
          assistantName: result.assistantName,
          icon: result.icon,
          ...(result.fields || {}),
        } as RpaDetailFormInfo;
        showModal(formData);
      },
    ],
    [
      'delete',
      (record: RpaInfo) => {
        Modal.confirm({
          title: t('rpa.deleteRpa'),
          content: t('rpa.deleteRpaConfirm'),
          onOk: () =>
            deleteRpa(record.id).then(() => {
              refresh?.();
            }),
        });
      },
    ],
  ]);
  return (
    <div
      className="common-card-item rpa-card-item group"
      key={rpa.id}
      onClick={() => {
        if (rpa.status == 0) {
          if (!user?.login && !user?.uid) {
            return jumpToLogin();
          }
          showModal?.();
        } else {
          navigate(`/resource/rpa/detail/${rpa.id}`);
        }
      }}
    >
      <div className="px-6">
        <div className="flex items-start gap-4">
          <span className="w-12 h-12 flex items-center justify-center rounded-lg">
            {rpa.icon && (
              <img src={rpa?.icon} className="w-[28px] h-[28px]" alt="" />
            )}
          </span>
          <div className="flex flex-col gap-2 flex-1 overflow-hidden">
            <div className="flex-1 flex items-center justify-between overflow-hidden">
              <span
                className="flex-1 text-overflow font-medium text-xl title-color title-size"
                title={rpa.assistantName}
              >
                {rpa.assistantName}
              </span>
            </div>
            <div
              className="text-desc text-overflow h-5 text-sm"
              title={rpa.userName || ''}
            >
              {rpa.userName}
            </div>
          </div>
        </div>
      </div>
      <div className="text-sm px-6 pt-[6px] text-desc  text-overflow-more text-overflow-2">
        {rpa.remarks}
      </div>
      <div
        className="flex justify-between items-center  overflow-hidden overflow-x-auto overflow-y-hidden py-[8px] px-6"
        style={{
          borderTop: '1px dashed #e2e8ff',
          scrollbarWidth: 'none', // 隐藏滚动条
          msOverflowStyle: 'none', // IE/Edge隐藏滚动条
        }}
      >
        <div className="text-desc">
          {t('rpa.robotResource')}: {rpa.robotCount || 0}个
        </div>
        <Dropdown
          menu={{
            onClick: ({ key, domEvent }) => {
              domEvent.stopPropagation();
              actions.get(key)?.(rpa);
            },
            items: [
              {
                label: <span className="text-[#275EFF]">{t('rpa.edit')}</span>,
                key: 'edit',
              },
              {
                label: <span className="text-red-500">{t('rpa.delete')}</span>,
                key: 'delete',
              },
            ],
          }}
        >
          <EllipsisOutlined
            style={{ color: '#7F7F7F' }}
            onClick={e => e.stopPropagation()}
          />
        </Dropdown>
      </div>
    </div>
  );
};

export default memo(RpaPage);
