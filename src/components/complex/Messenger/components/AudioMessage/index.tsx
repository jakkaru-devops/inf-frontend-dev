import { useAudio } from 'components/complex/Messenger/handlers/useAudio';
import { IChatMessage } from 'components/complex/Messenger/interfaces';
import { PauseOutlined, CaretRightOutlined } from '@ant-design/icons';
import { getServerFileUrl } from 'utils/files.utils';
import { secsToMMSS } from 'utils/common.utils';
import classNames from 'classnames';
import { FC } from 'react';

interface IProps {
  message: IChatMessage;
  isFromMe: boolean;
  className?: string;
}

const AudioMessage: FC<IProps> = ({ message, isFromMe, className }) => {
  const src = getServerFileUrl(
    message.files[0].path || message.files[0].file.path,
  );

  const duration = message.files[0].file.duration;

  const {
    isPlaying,
    audioPlayer,
    scrollPostion,
    togglePlayPause,
    handleEnd,
    handleTimeUpdate,
    handleRangeChange,
  } = useAudio();

  return (
    <div
      className={classNames([
        'messenger-window__chat__message__audio',
        className,
      ])}
    >
      <audio
        ref={audioPlayer}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnd}
        preload="auto"
      />
      <button onClick={togglePlayPause}>
        {isPlaying ? <PauseOutlined /> : <CaretRightOutlined />}
      </button>

      <div className="messenger-window__chat__message__audio-inner">
        <input
          type="range"
          value={scrollPostion}
          max={duration}
          step="0.000001"
          style={{
            background: `linear-gradient(to right, ${
              isFromMe ? '#fff' : '#E6332A'
            } 0%, ${isFromMe ? '#fff' : '#E6332A'} ${
              (scrollPostion / duration) * 100
            }%, ${isFromMe ? '#DE7C7C' : '#D6D6D6'} ${
              (scrollPostion / duration) * 100
            }%, ${isFromMe ? '#DE7C7C' : '#D6D6D6'} 100%)`,
          }}
          onChange={({ target }) => handleRangeChange(target.value)}
        />

        <div>
          <span>{secsToMMSS(audioPlayer.current?.currentTime || 0)}</span>
          <span>{secsToMMSS(duration)}</span>
        </div>
      </div>
    </div>
  );
};

export default AudioMessage;
