import { IServerFile } from 'interfaces/files.interfaces';
import { useState, createRef, RefObject, useContext } from 'react';
import { API_ENDPOINTS } from 'data/paths.data';
import { IChat, IChatMessage } from '../interfaces';
import { APIRequest } from 'utils/api.utils';
import { Context } from '../context';
import { useTextArea } from 'hooks/textArea.hook';
import { Popover } from 'antd';
import { ALL_EMOJIS, EMOJIS_OBJ } from 'data/emojis.data';
import { useMessenger } from 'hooks/messenger.hook';

export const useHandlers = ({
  chatId,
  handleNewMessage,
}: {
  chatId: IChat['id'];
  handleNewMessage: (
    data: { chat: IChat; message: IChatMessage },
    fromMe?: boolean,
  ) => void;
}) => {
  const { orderRequestId } = useMessenger();
  const {
    setMessages,
    chatContentRef,
    replyToMessage,
    setReplyToMessage,
    handlers,
  } = useContext(Context);

  const [uploadedFiles, setUploadedFiles] = useState<{ id: string }[]>([]);
  const [stateCounter, setStateCounter] = useState(0);

  const fileInputRef: RefObject<HTMLInputElement> = createRef();

  const TextArea = useTextArea({
    onSubmit: () => sendMessage(),
    suffix: (
      <div className="d-flex">
        <Popover
          placement="topRight"
          overlayClassName="new-message-emojis-wrapper"
          trigger="click"
          content={
            <div
              style={{
                width: 300,
                height: 500,
                overflow: 'scroll',
              }}
              className="new-message-emojis"
            >
              <div className="new-message-emojis-group">
                <div
                  className="new-message-emojis-list pt-10 pb-10"
                  style={{
                    fontSize: 20,
                  }}
                >
                  {ALL_EMOJIS.filter(emoji => !emoji.hidden).map(emoji => (
                    <div
                      key={emoji.name}
                      onClick={e => {
                        TextArea.pasteEmoji(emoji);
                      }}
                      className="new-message-emojis-item"
                    >
                      <img
                        src={`/img/emojis/${emoji.name}.png`}
                        alt={emoji?.html_code || emoji.emoji}
                      />
                    </div>
                  ))}
                </div>
              </div>
              {/* {EMOJI_GROUPS.map(emojiGroup => (
                <div
                  key={emojiGroup.label}
                  className="new-message-emojis-group"
                >
                  <div className="new-message-emojis-group-name">
                    <strong>{emojiGroup.name}</strong>
                  </div>
                  <div
                    className="new-message-emojis-list"
                    style={{
                      fontSize: 20,
                    }}
                  >
                    {emojiGroup.list
                      .filter(emoji => !emoji.hidden)
                      .map(emoji => (
                        <div
                          key={emoji.name}
                          onClick={e => {
                            TextArea.pasteEmoji(emoji);
                          }}
                          className="new-message-emojis-item"
                        >
                          <img
                            src={`/img/emojis/${emoji.name}.png`}
                            alt={emoji?.html_code || emoji.emoji}
                          />
                        </div>
                      ))}
                  </div>
                </div>
              ))} */}
            </div>
          }
        >
          <button className="messenger-window__chat__new-message__emoji new-message-icon no-bg no-border">
            <img src="/img/icons/emoji.png" alt="paperclip" />
          </button>
        </Popover>
        <button
          className="messenger-window__chat__new-message__add-attachment new-message-icon no-bg no-border"
          onClick={e => {
            e.stopPropagation();
            if (fileInputRef.current) {
              fileInputRef.current.click();
            }
          }}
        >
          <img src="/img/icons/paperclip.svg" alt="paperclip" />
        </button>
      </div>
    ),
  });

  const allowSendMessage = !TextArea.isEmpty || uploadedFiles.length > 0;

  const sendMessage = async (audioFile?: IServerFile) => {
    let text = TextArea.getValueHtml();

    console.log('-------');
    console.log('START TEXT', text, text.includes('😶‍🌫️'));

    if (!!text?.length) {
      const exceptions = [
        { key: '&#128566;‍🌫️', value: EMOJIS_OBJ?.['😶‍🌫️']?.html_code },
        { key: '&#128565;‍💫', value: EMOJIS_OBJ?.['😵‍💫']?.html_code },
      ].filter(({ value }) => !!value);
      console.log('EMOJI', EMOJIS_OBJ['😶‍🌫️']);
      console.log(
        'INDEX',
        ALL_EMOJIS.findIndex(el => el.emoji === '😶‍🌫️'),
      );
      for (let i = 0; i < ALL_EMOJIS.length; i++) {
        const emoji = ALL_EMOJIS[i];
        const emojiChar = emoji?.emoji;
        if (emojiChar === '🖐') console.log('MATCH');
        if (text.includes(emojiChar)) {
          console.log(emoji);
          if (!!emoji?.html_code)
            text = text.replaceAll(emojiChar, emoji.html_code);
          else text = text.replaceAll(emojiChar, '');
        }
      }
      for (const exception of exceptions) {
        if (text.includes(exception.key)) {
          text = text.replaceAll(exception.key, exception.value);
        }
      }
    }

    console.log('END TEXT', text);
    // return;

    const hasText = !TextArea.isEmpty || text || text.trim().length > 0;
    const hasFiles = uploadedFiles.length > 0;
    const hasAudio = !!audioFile;

    if (!hasText && !hasFiles && !hasAudio) {
      return;
    }

    const res = await APIRequest<{ chat: IChat; message: IChatMessage }>({
      method: 'post',
      url:
        chatId === 'support'
          ? API_ENDPOINTS.SUPPORT_CHAT_MESSAGE
          : API_ENDPOINTS.CHAT_MESSAGE,
      params: { chatId },
      data: {
        text: !TextArea.isEmpty ? text : null,
        files: audioFile ? [...uploadedFiles, audioFile] : uploadedFiles,
        orderRequestId,
        repliedMessageId: replyToMessage?.id,
      },
      requireAuth: true,
    });

    if (!res.isSucceed) return;
    const data = res.data;

    handlers.fetchChat(data.chat.id);
    setMessages(prev => ({
      count: prev.count + 1,
      rows: prev.rows.concat(data.message),
    }));
    // handleNewMessage(data, true);

    TextArea.clear();
    setUploadedFiles([]);
    setReplyToMessage(null);
    if (!!chatContentRef.current) chatContentRef.current.scrollToBottom();
  };

  return {
    fileInputRef,
    allowSendMessage,
    uploadedFiles,
    setStateCounter,
    TextArea,
    handlers: {
      setUploadedFiles,
      sendMessage,
    },
  };
};
