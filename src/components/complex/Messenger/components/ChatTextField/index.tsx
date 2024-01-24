import { Button } from 'antd';
import { FileUpload } from 'components/common';
import { API_ENDPOINTS } from 'data/paths.data';
import { useHandlers } from '../../handlers/chatTextField.handler';
import { IChat } from '../../interfaces';
import useRecorder from '../../handlers/useRecorder';
import { renderHtml, secsToMMSS } from 'utils/common.utils';
import { FC, Fragment, useContext, useState } from 'react';
import { Context } from '../../context';
import { getUserName } from 'sections/Users/utils';
import { AUDIO_EXTENSIONS } from 'data/files.data';
import { getServerFileUrl } from 'utils/files.utils';
import AudioMessage from './../AudioMessage';

interface IProps {
  chatId: IChat['id'];
}

const ChatTextField: FC<IProps> = ({ chatId }) => {
  const {
    replyToMessage,
    setReplyToMessage,
    handlers: mainHandlers,
  } = useContext(Context);
  const {
    fileInputRef,
    allowSendMessage,
    uploadedFiles,
    setStateCounter,
    TextArea,
    handlers,
  } = useHandlers({ chatId, handleNewMessage: mainHandlers.handleNewMessage });

  const {
    isRecording,
    recordionTime,
    startRecording,
    cancelRecording,
    sendRecording,
  } = useRecorder(handlers.sendMessage);

  const isReplyToMessageAudio =
    replyToMessage?.files?.length === 1 &&
    replyToMessage?.files?.every(({ ext, file }) =>
      AUDIO_EXTENSIONS.includes(ext || file?.ext),
    );
  const [emojisVisible, setEmojisVisible] = useState(false);

  return (
    <Fragment>
      {!!replyToMessage && (
        <div className="messenger-window__chat__reply-to-message">
          <Button
            size="small"
            shape="circle"
            className="no-bg no-border messenger-window__chat__reply-to-message-close"
            onClick={() => setReplyToMessage(null)}
          >
            <img src="/img/icons/chat-reply-close.svg" alt="" />
          </Button>
          <div className="messenger-window__chat__message__replied-message-author">
            {getUserName(replyToMessage?.author, 'fl')}
          </div>
          <div className="messenger-window__chat__message__replied-message-content">
            {!isReplyToMessageAudio ? (
              <Fragment>
                {!!replyToMessage?.text && renderHtml(replyToMessage?.text)}
                {!!replyToMessage?.files?.length && (
                  <div className="messenger-window__chat__message__file-list">
                    <FileUpload
                      url=""
                      initFiles={replyToMessage?.files?.map(({ file }) => ({
                        ...file,
                        url: getServerFileUrl(file.path),
                      }))}
                      disabled={true}
                      size="small"
                      hideUploadButton
                    />
                  </div>
                )}
              </Fragment>
            ) : (
              <AudioMessage
                message={replyToMessage}
                isFromMe={false}
                className="replied-message-audio"
              />
            )}
          </div>
        </div>
      )}
      <div className="messenger-window__chat__new-message">
        <FileUpload
          url={API_ENDPOINTS.FILE_UNKNOWN}
          onFinishUpload={files => {
            const fileIds = files.map(({ id }) => ({ id }));
            handlers.setUploadedFiles(prevFiles => prevFiles.concat(fileIds));
          }}
          onDelete={(deletedFile, activeUploadings) => {
            handlers.setUploadedFiles(files =>
              files.filter(({ id }) => deletedFile.id !== id),
            );
          }}
          inputRef={fileInputRef}
          hideUploadButton
          size="small"
          className="mb-5"
          fileIds={uploadedFiles.map(({ id }) => id)}
        />
        <div className="messenger-window__chat__new-message__text-field-wrapper">
          <div className="messenger-window__chat__new-message__text-field">
            {isRecording ? (
              <div className="messenger-window__chat__new-message__text-field">
                <div className="circle recording-indicator"></div>
                <span style={{ marginRight: 'auto' }}>
                  {recordionTime ? secsToMMSS(recordionTime) : '00:00'}
                </span>
                <span style={{ marginRight: '6px' }} onClick={cancelRecording}>
                  отменить
                </span>
              </div>
            ) : (
              TextArea.Editor
            )}
          </div>
          <Button
            type="primary"
            className="messenger-window__chat__new-message__send"
            onClick={() => {
              if (!TextArea.isEmpty || uploadedFiles.length > 0) {
                handlers.sendMessage();
              } else {
                if (!isRecording) {
                  startRecording();
                  return;
                }

                sendRecording();
              }
            }}
          >
            {allowSendMessage || isRecording ? (
              <img
                src="/img/icons/send-message.svg"
                alt="send-message"
                className="image-margin-left"
              />
            ) : (
              <img src="/img/icons/microphone.svg" alt="microphone" />
            )}
          </Button>
        </div>
      </div>
    </Fragment>
  );
};

export default ChatTextField;
