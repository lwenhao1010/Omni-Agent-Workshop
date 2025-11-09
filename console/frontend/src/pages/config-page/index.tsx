import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Overview from '@/components/config-page-component/config-overview';
import BaseConfig from '@/components/config-page-component/config-base';

import styles from './index.module.scss';

const index = () => {
  const [currentRobot, setCurrentRobot] = useState<any>({});
  const [currentTab, setCurrentTab] = useState('overview');

  return (
    <div className={styles.config_page_container}>
      <Routes>
        <Route
          path="/overview"
          element={
            <Overview
              currentRobot={currentRobot}
              setCurrentTab={(activeKey: string) => setCurrentTab(activeKey)}
              currentTab={currentTab}
            />
          }
        />
        <Route
          path="/base"
          element={
            <BaseConfig
              currentRobot={currentRobot}
              setCurrentRobot={setCurrentRobot}
              currentTab={currentTab}
              setCurrentTab={(activeKey: string) => setCurrentTab(activeKey)}
            />
          }
        />
      </Routes>
    </div>
  );
};

export default index;
