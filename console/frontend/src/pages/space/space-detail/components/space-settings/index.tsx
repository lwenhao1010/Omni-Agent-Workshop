import React, { useState, useCallback, useMemo } from 'react';
import { Button, Card, message } from 'antd';

import TransferOwnershipModal from '@/components/space/transfer-ownership-modal';
import DeleteSpaceModal from '@/components/space/delete-space-modal';
import styles from './index.module.scss';
import useSpaceStore from '@/store/space-store';
import LeaveSpaceModal from '@/components/space/leave-space-modal';
import { usePermissions } from '@/hooks/use-permissions';
import { ModuleType, OperationType } from '@/types/permission';

interface SpaceInfo {
  id: string;
  name: string;
  userRole: number;
}

const SpaceSettings: React.FC<{
  spaceInfo: SpaceInfo;
  onRefresh?: () => void;
}> = ({ spaceInfo, onRefresh }) => {
  const { spaceType } = useSpaceStore();
  const permissionsUtils = usePermissions();

  // 根据 userRole 动态设置文案
  const getTextConfig = (userRole: number) => {
    const isOwner = userRole === 1;
    return {
      deleteSpace: isOwner ? '删除空间' : '离开空间',
      deleteDescription: isOwner
        ? '空间删除后所有资产将无法恢复，请谨慎操作'
        : '退出空间后将无法访问空间内容，需要重新邀请才能加入',
      deleteButtonText: isOwner ? '删除空间' : '离开空间',
    };
  };

  const textConfig = getTextConfig(spaceInfo.userRole);

  // 弹窗状态管理
  const [showTransferModal, setShowTransferModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [showLeaveSpaceModal, setShowLeaveSpaceModal] =
    useState<boolean>(false);

  // 转让所有权
  const handleTransferOwnership = useCallback(() => {
    setShowTransferModal(true);
  }, []);

  const handleTransferModalClose = useCallback(() => {
    setShowTransferModal(false);
  }, []);

  const handleTransferModalSubmit = useCallback((values: any) => {
    try {
      console.log('转让所有权:', values);
      message.success('转让所有权成功');
      setShowTransferModal(false);
    } catch (error) {
      message.error('转让所有权失败');
      console.error('转让所有权失败', error);
    }
  }, []);

  // 删除空间
  const handleDeleteSpace = useCallback(() => {
    if (spaceInfo.userRole === 1) {
      setShowDeleteModal(true);
    } else {
      setShowLeaveSpaceModal(true);
    }
  }, []);

  const handleDeleteModalClose = useCallback(() => {
    setShowDeleteModal(false);
  }, []);

  //关闭离开弹窗
  const handleLeaveSpaceModalClose = useCallback(() => {
    setShowLeaveSpaceModal(false);
  }, []);

  const handleDeleteModalSubmit = useCallback((values: any) => {
    console.log(values, '------------ handleDeleteModalSubmit -----------');
  }, []);

  const showTransferBtn = useMemo(() => {
    return (
      spaceType === 'team' &&
      permissionsUtils?.checks.hasModulePermission(
        ModuleType.SPACE,
        OperationType.SPACE_TRANSFER
      )
    );
  }, [spaceType, permissionsUtils]);

  const showDeleteBtn = useMemo(() => {
    return permissionsUtils?.checks.hasModulePermission(
      ModuleType.SPACE,
      OperationType.SPACE_DELETE
    );
  }, [spaceType, permissionsUtils]);

  return (
    <div className={styles.spaceSettings}>
      <div className={styles.settingsList}>
        {/* 转让空间所有权 只有团队版才有*/}
        {showTransferBtn && (
          <Card className={styles.settingCard}>
            <div className={styles.settingContent}>
              <div className={styles.settingInfo}>
                <h3 className={styles.settingTitle}>转让空间所有权</h3>
                <p className={styles.settingDescription}>
                  将空间所有权转移给其他成员
                </p>
              </div>
              <Button
                type="primary"
                onClick={handleTransferOwnership}
                className={styles.transferBtn}
              >
                转让空间
              </Button>
            </div>
          </Card>
        )}

        {/* 删除空间 */}
        {showDeleteBtn && (
          <Card className={styles.settingCard}>
            <div className={styles.settingContent}>
              <div className={styles.settingInfo}>
                <h3 className={styles.settingTitle}>
                  {textConfig.deleteSpace}
                </h3>
                <p className={styles.settingDescription}>
                  {textConfig.deleteDescription}
                </p>
              </div>
              <Button
                danger
                type="primary"
                onClick={handleDeleteSpace}
                className={styles.deleteBtn}
              >
                {textConfig.deleteButtonText}
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* 弹窗组件 */}
      <TransferOwnershipModal
        open={showTransferModal}
        onClose={handleTransferModalClose}
        onSubmit={handleTransferModalSubmit}
        onSuccess={onRefresh}
      />

      <DeleteSpaceModal
        open={showDeleteModal}
        onClose={handleDeleteModalClose}
        onSubmit={handleDeleteModalSubmit}
      />
      <LeaveSpaceModal
        open={showLeaveSpaceModal}
        onClose={handleLeaveSpaceModalClose}
        spaceInfo={spaceInfo}
      />
    </div>
  );
};

export default SpaceSettings;
