import { ReactElement, useState } from 'react';
import addIcon from '@/assets/imgs/sidebar/btn_create_add.png';
import { useTranslation } from 'react-i18next';
import CreateApplicationModal from '@/components/create-application-modal';

interface CreateButtonProps {
  isCollapsed: boolean;
  isLogin?: boolean;
  onClick?: (() => void) | undefined;
  onAnalytics?: (() => void) | undefined;
  onNotLogin?: (() => void) | undefined;
}

const CreateButton = ({
  isCollapsed,
  isLogin = false,
  onClick,
  onAnalytics,
  onNotLogin,
}: CreateButtonProps): ReactElement => {
  const { t, i18n } = useTranslation();
  const [ApplicationModalVisible, setCreateModalVisible] =
    useState<boolean>(false); //创建应用

  const handleClick = (): void => {
    setCreateModalVisible(true); // TODO: 之后看需不需要判断登录
    // 统计事件
    if (onAnalytics) {
      onAnalytics();
    }

    // 检查登录状态
    if (!isLogin) {
      if (onNotLogin) {
        onNotLogin();
      }
      return;
    }

    // 处理 bd_vid 参数
    const bdVid = sessionStorage.getItem('bd_vid');
    const currentUrl = new URL(window.location.href);

    if (bdVid) {
      currentUrl.searchParams.set('bd_vid', bdVid);
      window.history.pushState({}, '', currentUrl.toString());
    }

    // 执行点击回调
    if (onClick) {
      onClick();
    }
  };

  return (
    <div className="w-full mt-4">
      <div
        className={`
          h-9 rounded-[10px] bg-[#275EFF] flex items-center justify-center cursor-pointer
          transition-opacity duration-200 hover:opacity-80
          ${isCollapsed ? 'w-9 mx-auto' : 'w-full'}
        `}
        onClick={handleClick}
      >
        <img src={addIcon} className="w-[14px] h-[14px]" alt="" />
        {!isCollapsed && (
          <span className="ml-2 text-sm font-medium leading-6 tracking-[-0.2px] text-white">
            {t('sidebar.create')}
          </span>
        )}
      </div>
      <CreateApplicationModal
        visible={ApplicationModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
        }}
      />
    </div>
  );
};

export default CreateButton;
