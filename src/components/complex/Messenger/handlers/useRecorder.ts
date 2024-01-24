import { API_ENDPOINTS } from 'data/paths.data';
import { IServerFile } from 'interfaces/files.interfaces';
import { useEffect, useState } from 'react';
import { APIRequest } from 'utils/api.utils';
import { openNotification } from 'utils/common.utils';

const requestRecorder = async () => {
  if (!navigator.mediaDevices) return;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    return new MediaRecorder(stream);
  } catch (err) {
    console.error(err);
  }
};

const useRecorder = (sendMessage: (audioFile: IServerFile) => void) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordionTime, setRecordingTime] = useState<number | null>(null);
  const [recorder, setRecorder] = useState<MediaRecorder>(null);

  useEffect(() => {
    if (!recorder || !isRecording) return;
    recorder.start();
  }, [recorder, isRecording]);

  useEffect(() => {
    if (!isRecording) {
      setRecordingTime(null);
      return;
    }

    const interval = setInterval(() => {
      setRecordingTime(+recordionTime + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [recordionTime, isRecording]);

  // Get audio
  const handleData = async e => {
    const file = new File([e.data], 'audio.wav');

    if (file.size === 0) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('duration', String(recordionTime));

    // Storage file
    const res = await APIRequest<{ result: IServerFile }>({
      method: 'post',
      url: API_ENDPOINTS.FILE_UNKNOWN,
      data: formData,
    });

    if (!res.isSucceed) return;

    const uploadedFile = res.data.result;

    sendMessage(uploadedFile);
  };

  const startRecording = async () => {
    try {
      requestRecorder()
        .then(newRecorder => {
          if (!newRecorder) {
            openNotification('Необходимо разрешить доступ к микрофону');
            return;
          }
          setIsRecording(true);
          setRecorder(newRecorder);
        })
        .catch(() =>
          openNotification('Необходимо разрешить доступ к микрофону'),
        );
    } catch (err) {
      console.error(err);
    }
  };

  const cancelRecording = () => {
    recorder.stream.getAudioTracks().forEach(track => track.stop());
    recorder.stream.getVideoTracks().forEach(track => track.stop());
    recorder.stop();
    setRecorder(null);
    setIsRecording(false);
  };

  const sendRecording = () => {
    recorder.addEventListener('dataavailable', handleData);

    recorder.stream.getAudioTracks().forEach(track => track.stop());
    recorder.stream.getVideoTracks().forEach(track => track.stop());
    recorder.stop();
    setIsRecording(false);
    setRecorder(null);

    return () => {
      recorder.removeEventListener('dataavailable', handleData);
    };
  };

  return {
    isRecording: !!isRecording,
    recordionTime,
    startRecording,
    cancelRecording,
    sendRecording,
  };
};

export default useRecorder;
