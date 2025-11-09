import React from 'react';
import { message, Modal } from 'antd';
import ButtonGroup from '@/components/button-group/button-group';
import type { ButtonConfig } from '@/components/button-group/types';

import styles from './index.module.scss';

import warningImg from '@/assets/imgs/space/warning.png';
import { useNavigate } from 'react-router-dom';
import { leaveSpace } from '@/services/space';
import { useSpaceType } from '@/hooks/use-space-type';
interface LeaveSpaceModalProps {
  open: boolean;
  onClose: () => void;
  spaceInfo: any;
}

const LeaveSpaceModal: React.FC<LeaveSpaceModalProps> = ({
  open,
  onClose,
  spaceInfo,
}) => {
  const navigate = useNavigate();
  const { deleteSpaceCb } = useSpaceType(navigate);
  const handleClose = () => {
    onClose();
  };

  const handleLeaveSpace = () => {
    leaveSpace()
      .then(() => {
        message.success('离开空间成功');
        deleteSpaceCb();
        onClose();
      })
      .catch((err: any) => {
        message.error(err?.msg || err?.desc);
      });
  };

  const buttons: ButtonConfig[] = [
    {
      key: 'cancel',
      text: '取消',
      type: 'default',
      onClick: () => handleClose(),
    },
    {
      key: 'submit',
      text: '确认',
      type: 'primary',
      onClick: () => handleLeaveSpace(),
    },
  ];

  return (
    <Modal
      title="离开空间"
      open={open}
      onCancel={handleClose}
      footer={null}
      width={500}
      className={styles.leave_modal}
      destroyOnClose
      centered
      maskClosable={false}
      keyboard={false}
    >
      <div className={styles.modalContent}>
        <div className={styles.warningIcon}>
          <img src={warningImg} alt="warning" />
        </div>
        <div className={styles.warningText}>确认离开 {spaceInfo?.name} 吗?</div>
      </div>

      <div className={styles.modalFooter}>
        <ButtonGroup buttons={buttons} size="large" />
      </div>
    </Modal>
  );
};

export default LeaveSpaceModal;
