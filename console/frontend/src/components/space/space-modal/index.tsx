import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, message } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import createSpaceBg from '@/assets/imgs/space/createSpaceBg.png';
import styles from './index.module.scss';
import UploadAvatar from './upload-avatar';
import ButtonGroup from '@/components/button-group';
import type { ButtonConfig } from '@/components/button-group';
import { useSpaceType } from '@/hooks/use-space-type';
import useSpaceStore from '@/store/space-store';
import ComboModal from '@/components/combo-modal';
import { getMyCreateSpace, visitSpace } from '@/services/space';
import { getUserMeta } from '@/services/order';
import { patterns } from '@/utils/pattern';

const { TextArea } = Input;

interface SpaceModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: (values: any) => void;
  onSuccess?: () => void;
  mode?: 'create' | 'edit';
  initialData?: {
    name?: string;
    description?: string;
    avatarUrl?: string;
    [key: string]: any;
  };
}

interface FormValues {
  name: string;
  description: string;
  avatarUrl: string;
}
const defaultAvatar =
  'https://openres.xfyun.cn/xfyundoc/2025-07-28/1b05a0cf-e3b5-424c-8fd7-7a527488ab70/1753700397686/spaceAvatar.png';

const SpaceModal: React.FC<SpaceModalProps> = ({
  open,
  onClose,
  onSubmit,
  onSuccess,
  mode = 'create',
  initialData,
}) => {
  const { checkName, createSpace, editSpace } = useSpaceType();
  const [form] = Form.useForm();
  const [avatarUrl, setAvatarUrl] = useState<string>(
    initialData?.avatarUrl || defaultAvatar
  );
  const [name, setName] = useState<string>(initialData?.name || '');
  const [description, setDescription] = useState<string>(
    initialData?.description || ''
  );
  const { spaceType, setSpaceName, setSpaceAvatar, setSpaceId } =
    useSpaceStore();
  const [comboModalVisible, setComboModalVisible] = useState<boolean>(false); //套餐弹窗
  const [isNeedUpgrade, setIsNeedUpgrade] = useState<boolean>(false); //是否需要升级

  useEffect(() => {
    if (open && initialData) {
      setAvatarUrl(initialData.avatarUrl || defaultAvatar);
      setName(initialData.name || '');
      setDescription(initialData.description || '');
    }
    // if (open) {
    //   getIsNeedUpgrade();
    // }
  }, [open, initialData]);

  // 🎯 策略模式：将不同模式的处理逻辑抽取为独立的处理器
  const modeHandlers = {
    create: {
      handler: createSpace,
      postProcess: async (res: any) => {
        setSpaceId(res);
        await visitSpace(res);
      },
    },
    edit: {
      handler: editSpace,
      postProcess: async () => {
        // 编辑模式无需额外处理
      },
    },
  };

  const defaultSubmitHandle = async (data: Record<string, any>) => {
    const checkParams = {
      name,
      id: mode === 'create' ? '' : initialData?.id,
    };
    const checkRes = await checkName(checkParams);

    if (checkRes) {
      console.log('空间名已存在');
      throw new Error('空间名已存在');
    }

    // 🎯 使用策略模式统一处理
    const currentHandler = modeHandlers[mode as keyof typeof modeHandlers];
    const res: any = await currentHandler.handler({
      ...initialData,
      ...data,
    });
    await currentHandler.postProcess(res);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      // 将头像地址添加到提交数据中
      const submitData = {
        ...values,
        avatarUrl,
      };

      if (onSubmit) {
        onSubmit(submitData);
      } else {
        await defaultSubmitHandle(submitData);
        message.success(
          mode === 'create' ? '空间创建成功！' : '空间更新成功！'
        );
        handleCancel();
        onSuccess?.();
        setSpaceAvatar(avatarUrl);
        setSpaceName(name);
      }
    } catch (error: any) {
      message.error(error?.msg || error?.message || '创建空间失败');
      console.error('表单验证失败:', error);
    }
  };

  //判断用户是否需要升级
  // const getIsNeedUpgrade = async () => {
  //   try {
  //     const spaceList: any = await getMyCreateSpace();
  //     // const userCombo: any = await getUserMeta();

  //     // // 检查 userCombo 是否为数组，并包含 FREE_EDITION
  //     // const hasFreeEdition = Array.isArray(userCombo)
  //     //   ? userCombo.some(item => item.menu === 'FREE_EDITION')
  //     //   : userCombo.menu === 'FREE_EDITION';
  //     // TODO: 测试环境，暂时设置为true
  //     const hasFreeEdition = true;
  //     // // 检查 userCombo 是否为数组，并包含 PERSONAL_EDITION
  //     // const hasPersonalEdition = Array.isArray(userCombo)
  //     //   ? userCombo.some(item => item.menu === 'PERSONAL_EDITION')
  //     //   : userCombo.menu === 'PERSONAL_EDITION';
  //     // TODO: 测试环境，暂时设置为true
  //     const hasPersonalEdition = true;
  //     if (
  //       hasFreeEdition &&
  //       spaceList?.length >= 1 &&
  //       spaceType === 'personal' &&
  //       mode === 'create'
  //     ) {
  //       // 免费版：拥有1个及以上owner空间就需要升级
  //       setIsNeedUpgrade(true);
  //     } else if (
  //       hasPersonalEdition &&
  //       spaceType === 'personal' &&
  //       spaceList?.length >= 10 &&
  //       mode === 'create'
  //     ) {
  //       // 个人版：拥有10个及以上owner空间且spaceType为personal才需要升级
  //       setIsNeedUpgrade(true);
  //     }
  //   } catch (error: any) {
  //     console.log(error, 'error');
  //     message.error(error?.msg || error?.desc);
  //   }
  // };

  const handleCancel = () => {
    form.resetFields();
    setName('');
    setDescription('');
    setAvatarUrl(defaultAvatar);
    onClose();
  };

  const buttons: ButtonConfig[] = [
    {
      key: 'cancel',
      text: '取消',
      type: 'default',
      onClick: () => handleCancel(),
    },
    {
      key: 'submit',
      text:
        isNeedUpgrade && mode === 'create'
          ? '创建次数已达上限'
          : mode === 'create'
            ? '确定'
            : '保存',
      type: isNeedUpgrade && mode === 'create' ? 'default' : 'primary',
      disabled: isNeedUpgrade && mode === 'create',
      onClick: () => {
        if (isNeedUpgrade && mode === 'create') {
          return;
        }
        handleSubmit();
      },
    },
  ];

  return (
    <>
      <Modal
        title={mode === 'create' ? '创建新空间' : '编辑空间'}
        open={open}
        onCancel={handleCancel}
        footer={null}
        width={648}
        className={styles.spaceModal}
        destroyOnClose
        maskClosable={false}
        keyboard={false}
      >
        {/* 信息横幅 */}
        <div
          className={styles.infoBanner}
          style={{ backgroundImage: `url(${createSpaceBg})` }}
        >
          <div className={styles.bannerIcon}>
            <UploadAvatar
              name={name}
              botDesc={description}
              coverUrl={avatarUrl}
              setCoverUrl={setAvatarUrl}
            />
          </div>
          <div className={styles.bannerText}>
            通过创建空间,将支持项目、智能体、插件、工作流和知识库在空间内进行协作和共享
          </div>
        </div>

        <Form
          form={form}
          layout="vertical"
          className={styles.form}
          initialValues={initialData}
          onValuesChange={changedValues => {
            if (changedValues.name !== undefined) {
              setName(changedValues.name || '');
            }
            if (changedValues.description !== undefined) {
              setDescription(changedValues.description || '');
            }
          }}
        >
          <Form.Item
            label="空间名称"
            name="name"
            rules={[
              { required: true, message: '请输入空间名称' },
              { max: 50, message: '空间名称不能超过50个字符' },
              {
                pattern: patterns.spaceName?.pattern,
                message: patterns.spaceName?.message,
              },
            ]}
          >
            <Input placeholder="请输入空间名称" maxLength={50} showCount />
          </Form.Item>

          <Form.Item
            label="描述"
            name="description"
            rules={[{ max: 2000, message: '描述不能超过2000个字符' }]}
          >
            <TextArea
              className="xingchen-textarea xingchen-space-textarea"
              autoSize={{ minRows: 3, maxRows: 3 }}
              placeholder="描述空间"
              maxLength={2000}
              showCount
            />
          </Form.Item>

          <Form.Item className={styles.footerItem}>
            <div className={styles.buttonGroup}>
              {isNeedUpgrade && (
                <div
                  className={styles.upgradeButton}
                  onClick={() => {
                    setComboModalVisible(true);
                    onClose();
                  }}
                >
                  去升级
                </div>
              )}
              <ButtonGroup buttons={buttons} size="large" />
            </div>
          </Form.Item>
        </Form>
      </Modal>
      <ComboModal
        visible={comboModalVisible}
        onCancel={() => setComboModalVisible(false)}
      />
    </>
  );
};

export default SpaceModal;
