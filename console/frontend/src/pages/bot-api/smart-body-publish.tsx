import React, { useState, useEffect } from 'react';
import { message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  createBot,
  getTokenLeft,
  getBotInfo,
  hasOldApi,
  searchKeys,
} from '@/services/api-key';
import useSpaceStore from '@/store/space-store';
import CreateKeyModal from '@/components/create-key-modal';
import { useTranslation } from 'react-i18next';
import BindKeyItem from './bind-key-item';

import backIcon from '@/assets/imgs/api-key/btn_zhishi_back.svg';
import publishIcon from '@/assets/imgs/api-key/publishIcon.png';
import rightArrow from '@/assets/imgs/api-key/rightArrow.png';

import styles from './smart-body-publish.module.scss';

const SmartBodyPublish: React.FC = () => {
  const navigate = useNavigate();
  const { spaceType, spaceId } = useSpaceStore();
  const { t } = useTranslation();

  const [searchParams] = useSearchParams();
  const [botId, setBotId]: any = useState('');
  const [docUrl, setDocUrl] = useState<string>(); // 文档地址
  const [tokenLeft, setTokenLeft] = useState<number>(0); // token余额
  const [infoList, setInfoList] = useState<any[]>([]);
  const [createKeyVisible, setCreateKeyVisible] = useState<boolean>(false);
  const [isOldApi, setIsOldApi] = useState<boolean>(false);
  const [keyList, setKeyList] = useState<any[]>([]);

  /**
   * 创建或更新bot绑定
   * @param botId - 智能体ID
   * @param count - 配额数量
   * @param keyId - 密钥ID
   * @param isEdit - 是否为编辑模式
   * @param item - 当前绑定项数据
   */
  const createBotFun = async (
    botId: number,
    count: number,
    keyId: number,
    isEdit?: boolean,
    item?: any
  ) => {
    const validationRules = [
      {
        condition: !keyId,
        message: t('botApi.SmartBodyPublish.pleaseSelectKey'),
      },
      {
        condition: count > tokenLeft,
        message: t('botApi.SmartBodyPublish.pleaseInputQuota') + tokenLeft,
      },
      {
        condition: count <= 0 || !Number.isInteger(count),
        message: t('botApi.SmartBodyPublish.pleaseInputNonNegativeInteger'),
      },
    ];
    const firstError = validationRules.find(rule => rule.condition);
    if (firstError) {
      message.error(firstError.message);
      return;
    }
    if (isEdit) {
      count <= item.count &&
        message.error(t('botApi.SmartBodyPublish.quotaTip'));
      return;
    }
    try {
      const res = await createBot({ botId, count, keyId });
      console.log(res);
      isEdit
        ? message.success(t('botApi.SmartBodyPublish.updateBindSuccess'))
        : message.success(t('botApi.SmartBodyPublish.bindKeySuccess'));
      getBotInfoFun();
    } catch (error) {
      console.error('绑定失败:', error);
      message.error(t('botApi.SmartBodyPublish.bindKeyFail'));
    }
  };
  /**
   * 获取剩余token数量
   */
  const getTokenLeftFun = async () => {
    try {
      const res: any = await getTokenLeft();
      setTokenLeft(res);
    } catch (error) {
      console.log(error);
    }
  };
  /**
   * 获取智能体信息列表
   */
  const getBotInfoFun = async () => {
    try {
      const res: any = await getBotInfo(botId);
      setInfoList(res);
    } catch (error) {
      console.log(error);
    }
  };

  /**
   * 检查是否存在旧版API
   */
  const getHasOldApiFun = async () => {
    try {
      const res: any = await hasOldApi(botId);
      setIsOldApi(res);
    } catch (error) {
      console.log(error);
    }
  };

  /**
   * 搜索API密钥列表
   */
  const searchKeysFun = async () => {
    try {
      const res: any = await searchKeys({
        page: 1,
        pageSize: 999,
      });
      setKeyList(res);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    if (botId) {
      getBotInfoFun();
      getTokenLeftFun();
      searchKeysFun();
      !spaceId && spaceType == 'personal' && getHasOldApiFun();
    }
  }, [botId]);

  useEffect(() => {
    if (searchParams.get('id')) {
      setBotId(searchParams.get('id'));
    }
    const url =
      searchParams.get('version') !== '1'
        ? 'https://www.xfyun.cn/doc/spark/Agent04-API%E6%8E%A5%E5%85%A5.html'
        : 'https://www.xfyun.cn/doc/spark/SparkAssistantAPI.html';
    setDocUrl(url);
  }, [searchParams]);

  return (
    <div className={styles.container}>
      <div className={styles.headerContainer}>
        <div className={styles.headerLeft}>
          <div className={styles.headerLeftContainer}>
            <img
              src={backIcon}
              className={styles.backButtonIcon}
              onClick={() => navigate(-1)}
              alt=""
            />
            <span className={styles.backButtonText}>
              {t('botApi.SmartBodyPublish.title')}
            </span>
          </div>
          <div className={styles.promptContainer}>
            <p className={styles.backBuptonDesc}>
              {t('botApi.SmartBodyPublish.titleDesc')}
            </p>
          </div>
        </div>
        <div className={styles.headerRight}>
          {!spaceId && spaceType == 'personal' && isOldApi ? (
            <div
              className={styles.historyButton}
              onClick={() => navigate('/management/bot-api/history')}
            >
              {t('botApi.SmartBodyPublish.queryAuthRecord')}
            </div>
          ) : null}
        </div>
      </div>
      <div className={styles.publishProcessTip}>
        <div className={styles.publishProcessTipLeft}>
          <img
            className={styles.publishProcessTipLeftIcon}
            src={publishIcon}
            alt=""
          />
          <div className={styles.publishProcessTipLeftTitle}>
            <div>{t('botApi.SmartBodyPublish.publishFlow')}</div>
            <span>New</span>
          </div>
        </div>
        {/* 竖线 */}
        <div className={styles.publishProcessTipLine}></div>
        <div className={styles.publishProcessTipRight}>
          <div className={styles.publishProcessTipRightNumBox}>
            <div className={styles.publishProcessTipRightNum}>
              <div className={styles.publishProcessTipRightNumTitle}>1</div>
              <div className={styles.publishProcessTipRightNumDesc}>
                {t('botApi.SmartBodyPublish.createKey')}
              </div>
            </div>
            <div className={styles.publishProcessTipRightNumLine} />
            <div className={styles.publishProcessTipRightNum}>
              <div className={styles.publishProcessTipRightNumTitle}>2</div>
              <div className={styles.publishProcessTipRightNumDesc}>
                {t('botApi.SmartBodyPublish.bindKey')}
              </div>
            </div>
            <div className={styles.publishProcessTipRightNumLine} />
            <div className={styles.publishProcessTipRightNum}>
              <div className={styles.publishProcessTipRightNumTitle}>3</div>
              <div className={styles.publishProcessTipRightNumDesc}>
                {t('botApi.SmartBodyPublish.publishAgent')}
              </div>
            </div>
          </div>
          {/* 描述内容 */}
          <div className={styles.publishProcessTipRightDesc}>
            <div className={styles.publishProcessTipRightDescItem}>
              {t('botApi.SmartBodyPublish.createKeyTip')}
              <div className={styles.publishProcessTipRightDescItemLinkBox}>
                <span
                  className={styles.publishProcessTipRightDescItemLink}
                  onClick={() => setCreateKeyVisible(true)}
                >
                  {t('botApi.SmartBodyPublish.createKeyBtn')}
                </span>

                <img
                  src={rightArrow}
                  className={styles.publishProcessTipRightDescItemLinkIcon}
                  alt=""
                />
              </div>
            </div>
            <div className={styles.publishProcessTipRightDescItem}>
              {t('botApi.SmartBodyPublish.bindKeyTip')}
            </div>
            <div className={styles.publishProcessTipRightDescItem}>
              {t('botApi.SmartBodyPublish.callServiceTip')}
              <div className={styles.publishProcessTipRightDescItemLinkBox}>
                <span
                  className={styles.publishProcessTipRightDescItemLink}
                  onClick={() => window.open(docUrl)}
                >
                  {t('botApi.SmartBodyPublish.viewDoc')}
                </span>
                <img
                  src={rightArrow}
                  className={styles.publishProcessTipRightDescItemLinkIcon}
                  alt=""
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* 绑定card */}
      {infoList.map((item: any) => (
        <BindKeyItem
          item={item}
          botId={botId}
          docUrl={docUrl}
          createBotFun={createBotFun}
          setInfoList={() => {
            // 当前已存在未填写不能再添加
            if (infoList.some((item: any) => item.edit)) {
              message.error(
                t('botApi.SmartBodyPublish.pleaseFillCurrentBindItem')
              );

              return;
            }
            item.edit = true;
            setInfoList([...infoList]);
          }}
          keyList={keyList}
        />
      ))}

      {infoList.length < 6 && (
        <div
          className={styles.bindKeyButton}
          onClick={() => {
            // 当前已存在未填写不能再添加
            if (infoList.some((item: any) => item.create)) {
              message.error(
                t('botApi.SmartBodyPublish.pleaseFillCurrentBindItem')
              );
              return;
            }
            setInfoList([
              ...infoList,
              {
                id: infoList.length + new Date().getTime(),
                create: true,
              },
            ]);
          }}
        >
          <PlusOutlined /> {t('botApi.SmartBodyPublish.bindKey')}
        </div>
      )}

      {/*创建  */}
      <CreateKeyModal
        isEdit={false}
        createKeyVisible={createKeyVisible}
        onCancel={() => setCreateKeyVisible(false)}
        onOk={() => {
          setCreateKeyVisible(false);
          searchKeysFun();
        }}
      />
    </div>
  );
};

export default SmartBodyPublish;
