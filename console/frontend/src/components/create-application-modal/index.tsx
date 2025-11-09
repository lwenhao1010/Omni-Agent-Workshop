import React, { useEffect, useState } from 'react';
import { Modal, Form } from 'antd';
import { useNavigate } from 'react-router-dom';
import { getLanguageCode } from '@/utils/http';
import AgentCreationModal from '@/components/agent-creation';
import MakeCreateModal from '@/components/make-creation';
import { useTranslation } from 'react-i18next';

import styles from './index.module.scss';
import classNames from 'classnames';

interface HeaderFeedbackModalProps {
  visible: boolean;
  onCancel: () => void;
}

const HeaderFeedbackModal: React.FC<HeaderFeedbackModalProps> = ({
  visible,
  onCancel,
}) => {
  const { t } = useTranslation();
  const languageCode = getLanguageCode();
  const navigate = useNavigate();
  const [makeModalVisible, setMakeModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [selectedBox, setSelectedBox] = useState('');
  const [AgentCreationModalVisible, IntelligentModalVisible] =
    useState<boolean>(false); //智能体创建
  const handleBoxClick = (boxName: string): void => {
    setSelectedBox(boxName);
    if (boxName === 'cueWord') {
      IntelligentModalVisible(true);
    } else {
      setMakeModalVisible(true);
    }
  };

  const handleCancel = (): void => {
    setSelectedBox('');
    onCancel();
  };

  useEffect(() => {
    if (visible) {
      //
    }
  }, [visible]);

  return (
    <Modal
      wrapClassName={styles.open_source_modal}
      width={820}
      open={visible}
      centered
      onCancel={handleCancel}
      destroyOnClose
      maskClosable={false}
      footer={null}
    >
      <div className={styles.modal_content}>
        <div className={styles.title}>
          <span>{t('createAgent1.create')}</span>
        </div>
        <div className={styles.intelligentAgents}>
          <div
            className={`${styles.cueWord} ${
              selectedBox === 'cueWord' ? styles.selected : ''
            }`}
            onClick={() => handleBoxClick('cueWord')}
          >
            <div className={styles.cueWord_img}>
              <div className={styles.cueWord_left_top}>
                {t('createAgent1.gettingStarted')}
              </div>
            </div>
            <p>{t('createAgent1.promptCreation')}</p>
            <span>{t('createAgent1.promptSetup')}</span>
          </div>
          <div
            className={`${styles.Workflow} ${
              selectedBox === 'workflow' ? styles.selected : ''
            }`}
            onClick={() => handleBoxClick('workflow')}
          >
            <div
              className={classNames(styles.cueWord_img, styles.Workflow_img)}
            >
              <div className={styles.cueWord_left_top}>
                {t('createAgent1.advanced')}
              </div>
            </div>
            <p>{t('createAgent1.workflowCreation')}</p>
            <span>{t('createAgent1.workflowDesign')}</span>
          </div>
        </div>
      </div>
      {makeModalVisible && (
        <MakeCreateModal
          visible={makeModalVisible}
          onCancel={() => {
            setMakeModalVisible(false);
          }}
        />
      )}

      <AgentCreationModal
        visible={AgentCreationModalVisible}
        onCancel={() => {
          IntelligentModalVisible(false);
        }}
      />
    </Modal>
  );
};
// }
export default HeaderFeedbackModal;
