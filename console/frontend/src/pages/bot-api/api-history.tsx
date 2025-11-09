import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import arrowLeft from '@/assets/imgs/api-key/btn_zhishi_back.svg';
import { getApiInfo } from '@/services/spark-common';

import styles from './api-history.module.scss';

const ApiHistory: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [botId, setBotId]: any = useState('');
  const [apiInfo, setApiInfo] = useState<any>(null);
  const getAPiInfoFn = async (id: any) => {
    const res = await getApiInfo(id);
    setApiInfo(res);
  };

  useEffect(() => {
    if (searchParams.get('id')) {
      setBotId(searchParams.get('id'));
      getAPiInfoFn(searchParams.get('id'));
    }
  }, [searchParams]);
  return (
    <div className={styles.keyHistoryContainer}>
      <div className={styles.backButton}>
        <div
          className={styles.backButtonContainer}
          onClick={() => navigate(-1)}
        >
          <img src={arrowLeft} className={styles.backButtonIcon} alt="" />
          <span className={styles.backButtonText}>返回</span>
        </div>
      </div>

      {/* tip */}
      <div className={styles.tip}>
        <div className={styles.tipTitle}>温馨提示：</div>
        <div className={styles.tipDesc}>仅支持查看，不支持修改</div>
      </div>

      <div className={styles.statistic}>
        <div className={styles.certified_card}>
          <div className={styles.certified_card_title}>
            <span>服务接口认证信息</span>
            <div
              onClick={() => {
                window.open(
                  'https://www.xfyun.cn/doc/spark/Agent04-API%E6%8E%A5%E5%85%A5.html'
                );
              }}
            >
              查看API文档
            </div>
          </div>
          <div className={styles.appid_box}>
            <div className={styles.appid_select}>
              {true && (
                <>
                  <span className={styles.appid_select_title}>
                    已绑定的APPID:
                  </span>
                  <span className={styles.appid_select_appid}>
                    {apiInfo?.appid || 1}
                  </span>

                  <span className={styles.appid_select_divide} />
                  <span className={styles.appid_select_title}>应用名:</span>
                  <span className={styles.appid_select_appid}>
                    {apiInfo?.appName || '未命名'}
                  </span>
                </>
              )}
            </div>
            <div style={{ marginTop: '4px' }}>
              <a
                className={styles.appid_download}
                href="https://openres.xfyun.cn/xfyundoc/2025-03-25/1fa7e299-25ab-4128-92c9-a56928caea49/1742887223777/workflow_openapi_demo_python.py.zip"
              >
                python demo下载
              </a>
              <a
                className={styles.appid_download}
                href="https://openres.xfyun.cn/xfyundoc/2025-03-25/ae1c647f-9d9e-4bdf-b50a-7f5e683aa6ad/1742887220264/workflow_openapi_demo_java.java.zip"
              >
                java demo下载
              </a>
            </div>
          </div>
          <div className={styles.certified_card_tips}>
            <span style={{ color: '#DE9B7C' }}>*</span>
            绑定应用后即可查看具体的接口鉴权参数，应用绑定后无法修改，请谨慎选择
          </div>
          <img
            src="https://aixfyun-cn-bj.xfyun.cn/bbs/16415.126278163174/%E8%99%9A%E7%BA%BF.svg"
            alt=""
            className={styles.cer_divide}
          />
          <div className={`${styles.cer_info}`}>
            <span className={styles.info_label}>接口地址：</span>
            <span className={styles.info_res}>
              {apiInfo?.serverUrl || '请绑定应用后进行查看'}
            </span>
          </div>
          <div className={`${styles.cer_info}`}>
            <span className={styles.info_label}>API Secret:</span>
            <span className={styles.info_res}>
              {apiInfo?.apiSecret || '请绑定应用后进行查看'}
            </span>
          </div>
          <div className={`${styles.cer_info}`}>
            <span className={styles.info_label}>API Key：</span>
            <span className={styles.info_res}>
              {apiInfo?.apiKey || '请绑定应用后进行查看'}
            </span>
          </div>
          <div className={`${styles.cer_info}`}>
            <span className={styles.info_label}>API Flowid</span>
            <span className={styles.info_res}>
              {apiInfo?.flowId || '请绑定应用后进行查看'}
            </span>
          </div>
        </div>
        <div className={styles.right}>
          <div className={styles.statistic_card}>
            <div className={styles.statistic_data}>
              <img
                src="https://aixfyun-cn-bj.xfyun.cn/bbs/21995.93819230774/1.png"
                alt=""
                className={styles.data_img}
              />
              <div className={styles.data_used_num}>
                {'_ _'}
                {/* {apiInfo ? apiUsage?.usedCount : '_ _'} */}
              </div>
              <div className={styles.data_title}>今日已用token数</div>
            </div>
            <div className={styles.statistic_divide} />
            <div className={styles.statistic_data}>
              <img
                src="https://aixfyun-cn-bj.xfyun.cn/bbs/48258.37497568033/2.png"
                alt=""
                className={styles.data_img}
              />
              <div className={styles.data_used_num}>
                {'_ _'}
                {/* {apiInfo ? apiUsage?.left : '_ _'} */}
              </div>
              <div className={styles.data_title}>剩余token数</div>
            </div>
            <div className={styles.statistic_divide} />
            <div className={styles.statistic_data}>
              <img
                src="https://aixfyun-cn-bj.xfyun.cn/bbs/48258.37497568033/2.png"
                alt=""
                className={styles.data_img}
              />
              <div className={styles.data_used_num}>
                {'_ _'}
                {/* {apiInfo ? apiUsage?.conc : '_ _'} */}
              </div>
              <div className={styles.data_title}>QPS</div>
            </div>
          </div>
          <div className={styles.statistic_tips}>
            <div className={styles.statistic_tips_title}>温馨提示</div>
            <ul className={styles.statistic_tips_lists}>
              <li>
                如果不希望你的应用 API 被滥用，请保护好你的
                APIKey，最佳方式是避免在前端代码中明文引用
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiHistory;
