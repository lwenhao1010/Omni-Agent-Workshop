import React, { useState, useEffect, useRef } from 'react';
import Experience from '@/utils/tts';
import useVoicePlayStore from '@/store/voice-play-store';

// 类型定义
export interface IPictureBookObj {
  vcn: string;
  bgm: string;
}

interface TtsModuleProps {
  text: string;
  language: string; //通过api/detect接口获取语言
  isPlaying: boolean;
  setIsPlaying: (isPlaying: boolean) => void;
}

type LanguageKey = 'cn' | 'en' | 'ja' | 'ko' | 'ru';

const TtsModule: React.FC<TtsModuleProps> = ({
  text,
  language = 'cn',
  isPlaying,
  setIsPlaying,
}) => {
  // State hooks
  const [experienceObj, setExperienceObj] = useState<Experience | null>(null);

  // Zustand stores
  const { activeVcn } = useVoicePlayStore();

  // Refs
  const audioRef = useRef<HTMLAudioElement>(null);

  // Get voice configuration
  const vcnUsed = activeVcn;

  // Helper function to get voice key by language
  const getVoiceKeyByLan = (lan: string): string => {
    switch (lan as LanguageKey) {
      case 'cn':
        return vcnUsed?.cn || 'x4_lingxiaoqi';
      case 'en':
        return vcnUsed?.en || 'x4_EnUs_Luna';
      case 'ja':
        return 'x4_JaJp_ZhongCun_assist';
      case 'ko':
        return 'x2_KoKr_Miya';
      case 'ru':
        return 'x2_RuRu_Keshu';
      default:
        return vcnUsed?.cn || 'x4_lingxiaoqi';
    }
  };

  // Initialize TTS object
  useEffect(() => {
    const ttsText = text.replace(/[*#&$]/g, '');
    const newExperienceObj = new Experience({
      language,
      voiceName: getVoiceKeyByLan(language),
      engineType: 'ptts',
      tte: 'UTF8',
      speed: vcnUsed?.speed,
      voice: 5,
      pitch: 50,
      text: ttsText,
      close: () => setIsPlaying(false),
    });
    setExperienceObj(newExperienceObj);
  }, []);

  useEffect(() => {
    if (isPlaying) {
      const ttsText = text.replace(/[*#&$]/g, '');
      let vcn = getVoiceKeyByLan(language);
      const tempExperienceObj = {
        language,
        voiceName: vcn,
        engineType: 'ptts',
        tte: 'UTF8',
        speed: vcnUsed?.speed,
        voice: 5,
        pitch: 50,
        text: ttsText,
        playBtn: '.audio-ctrl-btn-tts',
      };
      experienceObj?.setConfig(tempExperienceObj);
      experienceObj?.audioPlay();
      audioRef.current?.play();
    } else {
      experienceObj?.resetAudio();
    }
  }, [isPlaying, text]);

  return <div />;
};

export default TtsModule;
