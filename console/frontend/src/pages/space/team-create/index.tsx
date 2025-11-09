import React, { useState, useMemo } from 'react';
import { Button, Input, message } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './index.module.scss';
import { checkEnterpriseName, createEnterprise } from '@/services/enterprise';
import UploadImage from '@/pages/space/enterprise/page-components/team-settings/components/upload-image';
import useUserStore from '@/store/user-store';
import { useSpaceI18n } from '@/pages/space/hooks/use-space-i18n';
import { useSpaceType } from '@/hooks/use-space-type';
import { useEnterprise } from '@/hooks/use-enterprise';
import { defaultEnterpriseAvatar } from '@/constants/config';
import agentLogoText from '@/assets/imgs/sidebar/agentLogoText.svg';
import creatorImg from '@/assets/imgs/space/creator.svg';
import defaultUploadIcon from '@/assets/imgs/space/upload.png';

const TeamCreate: React.FC = () => {
  const user = useUserStore((state: any) => state.user);
  const { roleTextMap } = useSpaceI18n();
  const navigate = useNavigate();
  const { handleTeamSwitch } = useSpaceType(navigate);
  const { getJoinedEnterpriseList } = useEnterprise();
  const [teamName, setTeamName] = useState('');
  const [teamDescription, setTeamDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [logoUrl, setLogoUrl] = useState(defaultEnterpriseAvatar);
  const [reUploadImg, setReUploadImg] = useState(false);
  const [triggerChild, setTriggerChild] = useState(false);
  const { type } = useParams();

  const roleText = useMemo(() => {
    const key = user?.roleType as keyof typeof roleTextMap | undefined;
    return key && key in roleTextMap ? roleTextMap[key] : '-';
  }, [user?.roleType, roleTextMap]);

  const enterpriseType = useMemo(() => {
    return type === '2' ? '企业' : '团队';
  }, [type]);

  const textConfig = useMemo(
    () => ({
      emptyTip: `请输入${enterpriseType}名称`,
      existTip: `${enterpriseType}名称已存在`,
      createSuccessTip: `${enterpriseType}创建成功`,
      createFailedTip: `${enterpriseType}创建失败`,
    }),
    [enterpriseType]
  );

  // 触发上传
  const triggerFileSelectPopup = (callback: () => void) => {
    setTriggerChild(false);
    callback();
  };

  const handleCreateTeam = async () => {
    const name = teamName.trim();
    if (!name) {
      message.error(textConfig.emptyTip);
      return;
    }

    setLoading(true);
    try {
      const checkRes = await checkEnterpriseName({ name });

      if (checkRes) {
        throw new Error(textConfig.existTip);
      }

      console.log('创建团队:', { name, teamDescription, logoUrl });
      const res: any = await createEnterprise({
        name,
        avatarUrl: logoUrl,
      });

      console.log(
        res,
        '============= TeamCreate => handleCreateTeam ==========='
      );

      message.success(textConfig.createSuccessTip);
      await getJoinedEnterpriseList();
      handleTeamSwitch(res);
    } catch (error: any) {
      message.error(error?.message || error?.msg || textConfig.createFailedTip);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.teamCreateContainer}>
      {/* Logo */}
      <div className={styles.logo}>
        <img src={agentLogoText} alt="Logo" className={styles.logoImage} />
      </div>

      {/* 主要内容 */}
      <div className={styles.content}>
        {/* 标题 */}
        <div className={styles.title}>{enterpriseType}版已生效</div>

        {/* 用户信息 */}
        <div className={styles.userInfo}>
          <img
            src={user?.avatarUrl || creatorImg}
            alt="管理员头像"
            className={styles.avatar}
          />
          <div className={styles.userDetails}>
            <span className={styles.userName}>{user?.nickname}</span>
            <span className={styles.userRole}>{roleText}</span>
          </div>
        </div>

        {/* 团队信息设置卡片 */}
        <div className={styles.formCard}>
          <div className={styles.formTitle}>请完成{enterpriseType}信息设置</div>

          {/* 团队图标 */}
          <div className={styles.teamIcon}>
            <div className={styles.iconPlaceholder}>
              {reUploadImg && (
                <div
                  className={styles.upHoverBtn}
                  onMouseLeave={() => setReUploadImg(false)}
                  onClick={() => setTriggerChild(true)}
                >
                  <img
                    className={styles.upHoverIcon}
                    src={defaultUploadIcon}
                    alt="上传"
                  />
                </div>
              )}
              <img
                src={logoUrl}
                alt="头像"
                className={styles.avatarImg}
                onMouseEnter={() => setReUploadImg(true)}
              />
            </div>
          </div>

          {/* 表单字段 */}
          <div className={styles.formFields}>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>{enterpriseType}名称</label>
              <Input
                value={teamName}
                onChange={e => setTeamName(e.target.value)}
                placeholder={textConfig.emptyTip}
                variant="borderless"
                className={styles.fieldInput}
                maxLength={20}
                showCount
              />
            </div>
          </div>

          {/* 创建按钮 */}
          <Button
            type="primary"
            size="large"
            loading={loading}
            onClick={handleCreateTeam}
            className={styles.createButton}
            block
          >
            创建{enterpriseType}
          </Button>
        </div>
      </div>
      <UploadImage
        onSuccess={res => {
          setTriggerChild(false);
          setLogoUrl(res);
          message.success('头像已上传!');
        }}
        onClose={() => {
          setTriggerChild(false);
        }}
        onAction={triggerChild ? triggerFileSelectPopup : null}
      />
    </div>
  );
};

export default TeamCreate;
