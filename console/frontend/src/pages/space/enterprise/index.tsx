import { Suspense, useCallback, useEffect } from 'react';
import {
  Routes,
  Route,
  Navigate,
  useParams,
  useNavigate,
} from 'react-router-dom';
import { Spin, message } from 'antd';
import classNames from 'classnames';
import styles from './index.module.scss';

import EnterpriseSpaceLayout from './base-layout';
import SpaceManage from './page-components/space-manage';
import MemberManage from './page-components/member-manage';
import TeamSettings from './page-components/team-settings';

import { getEnterpriseDetail } from '@/services/enterprise';

import useUserStore from '@/store/user-store';
import useSpaceStore from '@/store/space-store';
import useEnterpriseStore from '@/store/enterprise-store';
import { useSpaceType } from '@/hooks/use-space-type';

import { defaultEnterpriseAvatar, roleToRoleType } from '@/pages/space/config';
import { useSpaceI18n } from '@/pages/space/hooks/use-space-i18n';
import { RoleType, SpaceType } from '@/types/permission';

export default function Index() {
  const navigate = useNavigate();
  const { enterpriseId } = useParams();
  const { setUserRole } = useUserStore();
  const { setEnterpriseId, setSpaceStore } = useSpaceStore();
  const { certificationType, setEnterpriseInfo } = useEnterpriseStore();
  const { switchToPersonal, isTeamSpace, handleTeamSwitch } =
    useSpaceType(navigate);
  const { roleTextMap } = useSpaceI18n();
  // 初始化获取团队信息
  const getEnterpriseDetailFn = useCallback(async () => {
    if (certificationType) {
      return;
    }
    if (!enterpriseId) {
      switchToPersonal();
    }

    if (!isTeamSpace()) {
      setSpaceStore({
        spaceType: 'team',
        enterpriseId,
      });

      handleTeamSwitch(enterpriseId, { isJump: false });
    }

    try {
      const res: any = await getEnterpriseDetail();
      console.log(res, '=========== getEnterpriseDetail ============');

      if (res?.detail?.flag === false) {
        message.error(res?.detail?.desc);
        // todo

        return;
      }

      setUserRole(
        SpaceType.ENTERPRISE,
        roleToRoleType(res?.role, true) as RoleType
      );
      console.log(
        roleToRoleType(res?.role, true),
        '=========== roleToRoleType ============'
      );

      const enterpriseDetail = {
        ...res,
        avatarUrl: res?.avatarUrl || defaultEnterpriseAvatar,
        roleTypeText:
          roleTextMap[
            roleToRoleType(res?.role, true) as keyof typeof roleTextMap
          ],
      };
      setEnterpriseInfo(enterpriseDetail);
    } catch (err: any) {
      message.error(err?.msg || err?.desc);
    }
  }, [setEnterpriseId, setEnterpriseInfo]);

  useEffect(() => {
    getEnterpriseDetailFn();
  }, [getEnterpriseDetailFn]);

  return (
    <div
      className={classNames('h-full overflow-hidden', styles.enterpriseSpace)}
    >
      <Suspense
        fallback={
          <div className="w-full h-full flex items-center justify-center">
            <Spin />
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<EnterpriseSpaceLayout />}>
            <Route index element={<Navigate to="space" replace />} />
            <Route path="space" element={<SpaceManage />} />
            <Route path="member" element={<MemberManage />} />
            <Route path="team" element={<TeamSettings />} />
          </Route>
        </Routes>
      </Suspense>
    </div>
  );
}
