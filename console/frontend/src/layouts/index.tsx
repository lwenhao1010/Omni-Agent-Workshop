import React, { FC } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Outlet, useLocation } from 'react-router-dom';
import CrashErrorComponent from '@/components/crash-error-component';
import Sidebar from '@/components/sidebar';
import Header from '@/components/header';

const hasHeaderList = ['knowledge', 'plugin', 'database', 'rpa'];

interface BasicLayoutProps {
  showHeader?: boolean;
}

const BasicLayout: FC<BasicLayoutProps> = ({ showHeader }) => {
  const location = useLocation();

  // 如果没有显式传入 showHeader，则使用原来的逻辑判断
  const shouldShowHeader =
    showHeader !== undefined
      ? showHeader
      : hasHeaderList.includes(location?.pathname?.split('/')?.pop() as string);

  return (
    <ErrorBoundary
      onReset={() => {
        window.location.href = '/';
      }}
      FallbackComponent={CrashErrorComponent}
    >
      <div className="flex h-full w-full overflow-hidden global-background">
        <Sidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          {shouldShowHeader && <Header />}
          <Outlet />
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default BasicLayout;
