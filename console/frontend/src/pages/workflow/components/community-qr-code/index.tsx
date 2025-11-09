import React, { useEffect, useState } from 'react';
import { Popover } from 'antd';
import { getCommonConfig } from '@/services/common';

import communityQRCodeContainer from '@/assets/imgs/workflow/community-qRCode-container.png';

function index(): React.ReactElement {
  const [wechatqRCode, setWechatQRCode] = useState('');
  const [feishuQRCode, setFeishuQRCode] = useState('');

  useEffect(() => {
    Promise.all([
      getCommonConfig({
        category: 'SPARK_PRO_QR_CODE',
        code: 'qr',
      }),
      getCommonConfig({ category: 'SPARK_PRO_QR_CODE', code: 'qr_feishu' }),
    ]).then(([wechatQRCode, feishuQRCode]) => {
      setWechatQRCode(wechatQRCode?.value);
      setFeishuQRCode(feishuQRCode?.value);
    });
  }, []);

  return (
    <Popover
      placement="leftBottom"
      content={
        <div className="flex flex-col justify-center items-center gap-2">
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center gap-2">
              <img src={wechatqRCode} className="w-[110px] h-[110px]" alt="" />
              <span>微信群</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <img src={feishuQRCode} className="w-[110px] h-[110px]" alt="" />
              <span>飞书群</span>
            </div>
          </div>
        </div>
      }
      arrow={false}
    >
      <img
        src={communityQRCodeContainer}
        className="w-[46px] fixed bottom-[236px] right-[3px] cursor-pointer"
        style={{
          zIndex: 99,
        }}
        alt=""
      />
    </Popover>
  );
}

export default index;
