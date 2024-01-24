import { useState, useRef } from 'react';

export const useAudio = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [scrollPostion, setScrollPostion] = useState(0);

  const audioPlayer = useRef<HTMLAudioElement>();

  const togglePlayPause = () => {
    !isPlaying ? audioPlayer.current.play() : audioPlayer.current.pause();
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () =>
    setScrollPostion(audioPlayer.current.currentTime);

  const handleRangeChange = (scrollPostion: string) =>
    (audioPlayer.current.currentTime = +scrollPostion);

  const handleEnd = () => {
    setIsPlaying(false);
    audioPlayer.current.currentTime = 0;
    setScrollPostion(0);
  };

  return {
    isPlaying,
    audioPlayer,
    scrollPostion,
    togglePlayPause,
    handleTimeUpdate,
    handleRangeChange,
    handleEnd,
  };
};
