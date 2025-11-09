import { ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import agentLog from '@/assets/imgs/sidebar/agentLog.svg';
import agentLogoText from '@/assets/imgs/sidebar/agentLogoText.svg';
import agentLogoTextEn from '@/assets/imgs/sidebar/agentLogoTextEn.svg';
import textLogo from '@/assets/imgs/sidebar/logoText.png';

interface SidebarLogoProps {
  isCollapsed: boolean;
  isEnterprise?: boolean;
  enterpriseLogo?: string | undefined;
  languageCode?: string;
}

const SidebarLogo = ({
  isCollapsed,
  isEnterprise = false,
  enterpriseLogo,
  languageCode = 'zh',
}: SidebarLogoProps): ReactElement => {
  const navigate = useNavigate();

  const handleLogoClick = (): void => {
    navigate('/home');
  };

  if (isEnterprise && enterpriseLogo) {
    return isCollapsed ? (
      <img
        src={enterpriseLogo}
        className="rounded-[6px] cursor-pointer transition-all duration-300 ease-in-out mx-auto"
        alt=""
        style={{
          width: '34px',
          height: '34px',
          opacity: 1,
        }}
        onClick={handleLogoClick}
      />
    ) : (
      <div
        className="flex justify-center h-[25px] w-[190px] cursor-pointer items-center transition-all duration-300 ease-in-out"
        onClick={handleLogoClick}
      >
        <img
          src={enterpriseLogo}
          height={25}
          width={25}
          className="mr-[8px] rounded-[4px] transition-all duration-300 ease-in-out"
          alt=""
        />
        <img
          src={textLogo}
          height={25}
          width={90}
          className="transition-all duration-300 ease-in-out"
          alt=""
        />
      </div>
    );
  }

  return (
    <img
      src={
        isCollapsed
          ? agentLog
          : languageCode === 'zh'
            ? agentLogoText
            : agentLogoTextEn
      }
      className="w-[190px] cursor-pointer mx-auto"
      alt="讯飞星辰Agent"
      style={{ height: isCollapsed ? '34px' : 'auto' }}
      onClick={handleLogoClick}
    />
  );
};

export default SidebarLogo;
