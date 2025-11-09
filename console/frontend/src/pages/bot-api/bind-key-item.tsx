import React, { useState, useEffect } from 'react';
import { Select, InputNumber } from 'antd';
import formSelect from '@/assets/imgs/main/icon_nav_dropdown.svg';
import tipIcon from '@/assets/imgs/api-key/tipIcon.png';
import keyTransparentIcon from '@/assets/imgs/api-key/keyTransparentIcon.png';
import fileIcon from '@/assets/imgs/api-key/fileIcon.png';
import { getTokenLeft, getModelDetail } from '@/services/api-key';
import { useTranslation } from 'react-i18next';

import styles from './bind-key-item.module.scss';

const BindKeyItem: React.FC<{
  item: any;
  botId: string;
  docUrl: any;
  createBotFun: (
    botId: number,
    count: number,
    keyId: number,
    isCreate?: boolean,
    item?: any
  ) => void;
  setInfoList: () => void;
  keyList: any[];
}> = ({ item, botId, docUrl, createBotFun, setInfoList, keyList }) => {
  const { t } = useTranslation();

  const [createData, setCreateData] = useState({
    keyId: null,
    count: 0,
  });
  const [tokenLeft, setTokenLeft] = useState<number>(0); // token余额
  const [modelDetail, setModelDetail] = useState<any>({});
  const [modelList, setModelList] = useState<any>([]);

  const getKeyDetail = async () => {
    const res = await getModelDetail(item.keyId);
    setModelList(res);
    setModelDetail(res[0]);
  };
  const getTokenLeftFun = async () => {
    try {
      const res: any = await getTokenLeft();
      setTokenLeft(res);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getTokenLeftFun();
    !item.create && getKeyDetail();
  }, []);

  const infoContainerItem: { id: number; title: string; key: string }[] = [
    {
      id: 1,
      title: t('botApi.bindKeyListItem.serviceUrl'),
      key: 'serviceUrl',
    },
    {
      id: 2,
      title: 'Key',
      key: 'apiKey',
    },
    {
      id: 3,
      title: 'Flowid',
      key: 'flowId',
    },
  ];

  return (
    <div className={styles.boundCard}>
      <div className={styles.boundCardTitle}>
        {item.create
          ? t('botApi.bindKeyListItem.addServiceInterface')
          : item.edit
            ? t('botApi.bindKeyListItem.editServiceInterface')
            : t('botApi.bindKeyListItem.serviceInterfaceInfo')}
      </div>
      <div className={styles.boundCardContent}>
        <div className={styles.boundInfoContentLeft}>
          <div className={styles.boundCreateBoxContainerTop}>
            {(item.create || item.edit) && (
              <div className={styles.boundCreateBox}>
                <div className={styles.boundCreateBoxLeft}>
                  <div className={styles.boundCreateBoxLeftTitle}>
                    {t('botApi.bindKeyListItem.keySelection')}
                  </div>
                  <Select
                    suffixIcon={<img src={formSelect} className="w-4 h-4 " />}
                    value={createData.keyId}
                    onChange={value =>
                      setCreateData({ ...createData, keyId: value })
                    }
                    placeholder={t('botApi.bindKeyListItem.pleaseSelectKey')}
                    className={styles.boundCreateBoxRightSelect}
                    disabled={item.edit}
                  >
                    {keyList.map((keyItem: any, index) => (
                      <Select.Option key={keyItem.id} value={keyItem.id}>
                        {keyItem.name}
                      </Select.Option>
                    ))}
                  </Select>
                </div>

                <div className={styles.boundCreateBoxRight}>
                  <div className={styles.boundCreateBoxRightTitle}>
                    {t('botApi.bindKeyListItem.quota')}{' '}
                    <span>
                      {t('botApi.bindKeyListItem.tokensRemain')}
                      {tokenLeft || 0}
                    </span>
                  </div>
                  <InputNumber
                    placeholder={t('botApi.bindKeyListItem.pleaseFillQuota')}
                    controls={false}
                    className={styles.boundCreateBoxRightInput}
                    value={createData.count}
                    min={0}
                    onChange={value =>
                      setCreateData({ ...createData, count: value ?? 0 })
                    }
                  />
                </div>
              </div>
            )}
            {!item.create && !item.edit && (
              <div className={styles.BoundKeyInfo}>
                <div className={styles.BoundKeyInfoLeft}>
                  <div className={styles.BoundKeyInfoKeyBox}>
                    <div className={styles.BoundKeyInfoLeftTitle}>
                      {t('botApi.bindKeyListItem.keyName')}
                    </div>
                    <div className={styles.BoundKeyInfoLeftDesc}>
                      {item.keyName}
                    </div>
                  </div>
                  <img src={keyTransparentIcon} alt="" />
                </div>
                <div className={styles.BoundKeyInfoRight}>
                  <div className={styles.BoundKeyInfoRightTitle}>
                    {t('botApi.bindKeyListItem.quota')}
                  </div>
                  <div className={styles.BoundKeyInfoRightDesc}>
                    {item.count || 0}
                  </div>
                </div>
              </div>
            )}

            <div className={styles.boundButtonBox}>
              {item.create ? (
                <div
                  className={`${styles.boundButton} ${createData.keyId && createData.count ? '' : styles.boundButtonDisabled}`}
                  onClick={() => {
                    if (!createData.keyId || !createData.count) {
                      console.log('请选择密钥和填写额度');
                      return;
                    }

                    createBotFun(
                      Number(botId),
                      createData.count,
                      createData.keyId
                    );
                  }}
                >
                  {t('botApi.bindKeyListItem.bindBtn')}
                </div>
              ) : item.edit ? (
                <div
                  className={styles.boundButton}
                  onClick={() => {
                    createBotFun(
                      Number(botId),
                      createData.count,
                      Number(createData.keyId),
                      true,
                      item
                    );
                  }}
                >
                  {t('botApi.bindKeyListItem.updateBindBtn')}
                </div>
              ) : (
                <div
                  className={styles.boundButton}
                  onClick={() => {
                    setCreateData({
                      keyId: item.keyId,
                      count: item.count || 0,
                    });
                    setInfoList();
                  }}
                >
                  {t('botApi.bindKeyListItem.viewApiDoc')}
                </div>
              )}
              <div
                className={styles.boundButtonGoApi}
                onClick={() => window.open(docUrl)}
              >
                {t('botApi.bindKeyListItem.viewApiDoc')}
              </div>
            </div>
          </div>
          {/* 提示信息 */}
          <div className={styles.tipContainer}>
            <img src={tipIcon} alt="" />
            {t('botApi.bindKeyListItem.bindKeyTip')}
          </div>
          {/* 线 */}
          <div className={styles.line}></div>

          <div className={styles.boundKeyInfoItemBox}>
            {infoContainerItem.map(_item => (
              <div className={styles.boundKeyInfoItem}>
                <div className={styles.boundKeyInfoItemTitle}>
                  {_item.title}
                </div>
                {item.create ? (
                  <div className={styles.boundKeyInfoItemDescNoBound}>
                    {t('botApi.bindKeyListItem.pleaseBindKeyTip')}
                  </div>
                ) : (
                  <div className={styles.boundKeyInfoItemDesc}>
                    {item[_item.key]}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        {!item.create && (
          <div className={styles.boundInfoContentRight}>
            <div className={styles.boundInfoContentRightTop}>
              <div className={styles.boundInfoContentRightTopTitle}>
                {t('botApi.bindKeyListItem.modelName')}
              </div>
              <Select
                suffixIcon={<img src={formSelect} className="w-4 h-4 " />}
                value={modelDetail?.modelName}
                onChange={value => {
                  modelList.forEach(item => {
                    if (item.modelName === value) {
                      setModelDetail(item);
                    }
                  });
                }}
                style={{ width: 287 }}
              >
                {modelList.map((item, index) => (
                  <Select.Option
                    key={index + item.modelName}
                    value={item.modelName}
                  >
                    {item.modelName}
                  </Select.Option>
                ))}
              </Select>
            </div>
            <div className={styles.boundInfoContentRightDesc}>
              <div className={styles.tokenContainer}>
                <div className={styles.tokenInfo}>
                  <div className={styles.tokenInfoTitle}>
                    {t('botApi.bindKeyListItem.todayUsedTokensNum')}
                  </div>
                  <div className={styles.tokenInfoNum}>
                    {modelDetail?.useCount || '_ _'}
                  </div>
                </div>
                <div className={styles.tokenLine}></div>
                <div className={styles.tokenInfo}>
                  <div className={styles.tokenInfoTitle}>
                    {t('botApi.bindKeyListItem.remainTokensNum')}
                  </div>
                  <div className={styles.tokenInfoNum}>
                    {modelDetail?.leftCount || '_ _'}
                  </div>
                </div>
              </div>
              <div className={styles.line}></div>
              <div className={styles.qpsContainer}>
                <div className={styles.qpsInfoTitle}>QPS</div>
                <div className={styles.qpsInfoNum}>
                  {modelDetail?.qpsCount || '_ _'}
                </div>
              </div>
            </div>
          </div>
        )}
        {item.create && (
          <div className={styles.boundInfoContentRight}>
            <div className={styles.onBoundInfoContentRightDesc}>
              <img src={fileIcon} alt="" />
              <span>{t('botApi.bindKeyListItem.bindKeyTokensTip')}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BindKeyItem;
