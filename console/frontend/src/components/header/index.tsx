import { useState, useEffect, JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';

const tabs = [
  {
    key: 'plugin',
    path: '/resource/plugin',
    iconClass: 'plugin-icon',
    title: 'common.header.plugin',
  },
  {
    key: 'knowledge',
    path: '/resource/knowledge',
    iconClass: 'knowledge-icon',
    title: 'common.header.knowledge',
  },
  {
    key: 'database',
    path: '/resource/database',
    iconClass: 'database-icon',
    title: 'common.header.database',
  },
  {
    key: 'rpa',
    path: '/resource/rpa',
    iconClass: 'rpa-icon',
    title: 'common.header.rpa',
  },
];

function index(): JSX.Element {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentTab, setCurrentTab] = useState<string>('');

  useEffect(() => {
    setCurrentTab(location?.pathname?.split('/')?.pop() as string);
  }, [location]);

  return (
    <div
      className="mx-auto max-w-[1425px]"
      style={{
        width: '85%',
      }}
    >
      <div
        className="flex items-center gap-[40px] relative"
        style={{
          padding: '24px 0px 16px 0px',
        }}
      >
        {tabs.map((item, index) => (
          <div
            key={index}
            className={`flex relative items-center gap-2 font-medium cursor-pointer  ${currentTab === item?.key ? 'header-tabs-active' : 'header-tabs-normal'}`}
            onClick={() => {
              navigate(item?.path);
            }}
          >
            <span className={item?.iconClass}></span>
            <span>{t(item?.title)}</span>
            {currentTab === item?.key && (
              <div className="absolute bottom-[-16px] left-0 w-full h-[2px] bg-[#275EFF]"></div>
            )}
          </div>
        ))}
      </div>
      <div className="w-full h-[1px] bg-[#D3DBF8]"></div>
    </div>
  );
}

export default index;
