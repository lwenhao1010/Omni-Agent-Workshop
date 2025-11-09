import React from 'react';
import { Modal, message } from 'antd';
import ButtonGroup from '@/components/button-group/button-group';
import type { ButtonConfig } from '@/components/button-group/types';

import styles from './index.module.scss';

import warningImg from '@/assets/imgs/space/warning.png';
import { useSpaceType } from '@/hooks/use-space-type';
import { useNavigate } from 'react-router-dom';
interface DeleteSpaceModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

const DeleteSpaceModal: React.FC<DeleteSpaceModalProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  const navigate = useNavigate();
  const { deleteSpace, spaceId, deleteSpaceCb } = useSpaceType(navigate);

  const handleSubmit = async () => {
    try {
      // Since we removed captcha, pass dummy values for mobile and verifyCode
      // This assumes the backend will be updated to not require these fields
      await deleteSpace({
        spaceId,
        mobile: '',
        verifyCode: '',
      });
      message.success('删除空间成功');
      deleteSpaceCb();
      onSubmit();
    } catch (error: any) {
      message.error(error?.msg || error?.desc);
    }
  };

  const handleClose = () => {
    onClose();
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
      onClick: () => handleSubmit(),
      disabled: false,
    },
  ];

  return (
    <Modal
      title="删除空间"
      open={open}
      onCancel={handleClose}
      footer={null}
      width={500}
      className={styles.deleteModal}
      destroyOnClose
      centered
      maskClosable={false}
      keyboard={false}
    >
      <div className={styles.modalContent}>
        <div className={styles.warningSection}>
          <div className={styles.warningIcon}>
            <img src={warningImg} alt="warning" />
          </div>
          <div className={styles.warningText}>
            请谨慎删除！删除后，空间内的所有数据都将丢失，已分配的权益量将被扣除。
          </div>
        </div>

        <div className={styles.formSection}>
          <div className={styles.confirmText}>
            确认删除空间？此操作不可撤销，空间内的所有数据都将永久丢失。
          </div>
        </div>
      </div>

      <div className={styles.modalFooter}>
        <ButtonGroup buttons={buttons} size="large" />
      </div>
    </Modal>
  );
};

export default DeleteSpaceModal;
