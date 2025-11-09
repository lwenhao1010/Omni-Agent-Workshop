import { ReactElement, useState, useCallback } from 'react';
import { ReactSVG } from 'react-svg';
import Lottie from 'lottie-react';
import LoadingAnimate from '@/constants/lottie-react/voice.json';
import VoiceIcon from '@/assets/imgs/chat/voice.svg';
import PlayCircleIcon from '@/assets/imgs/chat/circle-play.svg';
import clsx from 'clsx';

// 组件Props类型定义
interface AudioAnimateProps {
  isPlaying: boolean;
}

const AudioAnimate = ({ isPlaying }: AudioAnimateProps): ReactElement => {
  const [playing, setPlaying] = useState<boolean>(false);

  // 切换播放状态
  const handleTogglePlay = useCallback((): void => {
    setPlaying(!playing);
  }, [playing]);

  return (
    <div className="flex items-center self-end">
      {isPlaying && (
        <div className="flex-shrink-0">
          <Lottie
            animationData={LoadingAnimate}
            loop={true}
            className="w-9 h-7 mr-1"
            rendererSettings={{
              preserveAspectRatio: 'xMidYMid slice',
            }}
          />
        </div>
      )}
      <div
        className="cursor-pointer flex items-center w-fit h-fit"
        onClick={handleTogglePlay}
      >
        {isPlaying ? (
          <ReactSVG
            className={clsx(
              'w-fit h-fit flex items-center pointer-events-none',
              '[&>div]:w-fit [&>div]:h-fit [&>div]:flex [&>div]:items-center',
              '[&>div>span]:w-4 [&>div>span]:h-4',
              '[&>div>svg]:w-5 [&>div>svg]:h-5'
            )}
            src="https://openres.xfyun.cn/xfyundoc/2024-10-23/713754ca-5528-4cc9-a8e8-959facc8c648/1729652844928/afdfsdaaf.svg"
          />
        ) : (
          <ReactSVG
            className={clsx(
              'w-fit h-fit flex items-center pointer-events-none text-gray-500',
              '[&>div]:w-fit [&>div]:h-fit [&>div]:flex [&>div]:items-center',
              '[&>div>span]:w-4 [&>div>span]:h-4',
              '[&>div>svg]:w-4 [&>div>svg]:h-4'
            )}
            src={PlayCircleIcon}
          />
        )}
      </div>
    </div>
  );
};

export default AudioAnimate;
