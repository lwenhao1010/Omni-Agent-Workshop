import { create } from 'zustand';

const useVoicePlayStore = create<{
  activeVcn: {
    //当前激活的语音
    cn: string;
    cnImg: string;
    en: string;
    enImg: string;
    speed: number;
  };
  setActiveVcn: (activeVcn: {
    cn: string;
    cnImg: string;
    en: string;
    enImg: string;
    speed: number;
  }) => void;
}>(set => ({
  activeVcn: {
    cn: 'x4_lingxiaoqi',
    cnImg:
      'https://1024-cdn.xfyun.cn/2022_1024%2Fcms%2F16824985943709826%2Flxq.png',
    en: 'x4_EnUs_Luna',
    enImg:
      'https://1024-cdn.xfyun.cn/2022_1024%2Fcms%2F16824985943695009%2Fluna.png',
    speed: 50,
  },
  setActiveVcn: activeVcn => set({ activeVcn }),
}));

export default useVoicePlayStore;
