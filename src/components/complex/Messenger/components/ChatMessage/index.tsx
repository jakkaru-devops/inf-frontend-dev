import classNames from 'classnames';
import formatDate from 'date-fns/format';
import { getServerFileUrl } from 'utils/files.utils';
import { IChat, IChatMessage } from '../../interfaces';
import { AUDIO_EXTENSIONS } from 'data/files.data';
import AudioMessage from '../AudioMessage';
import {
  FC,
  Fragment,
  RefObject,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Context } from '../../context';
import { Avatar } from 'antd';
import { FileUpload, Link } from 'components/common';
import { generateUrl, renderHtml } from 'utils/common.utils';
import { APP_PATHS } from 'data/paths.data';
import { DEFAULT_NAV_PATHS } from 'data/nav.data';
import { IOrderRequest } from 'sections/Orders/interfaces';
import { getUserName } from 'sections/Users/utils';
import { useAuth } from 'hooks/auth.hook';
import { useMessenger } from 'hooks/messenger.hook';
import { replaceHashToEmoji } from '../../utils/messenger.utils';

interface IProps {
  message: IChatMessage;
  showMessageAuthor?: boolean;
  offsetLarge?: boolean;
  showOrderRequest: boolean;
  onItemClick: () => void;
}

const ChatMessage: FC<IProps> = ({
  message,
  showMessageAuthor,
  offsetLarge,
  showOrderRequest,
  onItemClick,
}) => {
  const auth = useAuth();
  const { activeChat } = useMessenger();
  const { setDeleteMessageId, setReplyToMessage, handlers } =
    useContext(Context);
  const [actionsVisible, setActionsVisible] = useState(false);
  const [stateCounter, setStateCounter] = useState(0);
  const actionsPopupRef: RefObject<HTMLDivElement> = useRef();
  const actionsButtonRef: RefObject<HTMLDivElement> = useRef();
  let messageText = replaceHashToEmoji(message?.text || '', true);

  const isFromMe =
    message.authorId === auth.user.id ||
    (['manager', 'operator'].includes(auth?.currentRole?.label) &&
      message.authorRoleId === auth.currentRole.id);
  const isAudioMessage =
    message.files.length === 1 &&
    message.files.every(({ ext, file }) =>
      AUDIO_EXTENSIONS.includes(ext || file?.ext),
    );
  /* const isRepliedMessageFromMe =
    message?.repliedMessage?.authorId === auth.user.id ||
    (['manager', 'operator'].includes(auth?.currentRole?.label) &&
      message?.repliedMessage?.authorRoleId === auth.currentRole.id); */
  const isRepliedMessageAudio =
    message?.repliedMessage?.files?.length === 1 &&
    message?.repliedMessage?.files?.every(({ ext, file }) =>
      AUDIO_EXTENSIONS.includes(ext || file?.ext),
    );

  const handleClickOutsideActions = (e: any) => {
    // Exit if actions closed
    if (!actionsVisible) return;
    // Exit if click target is actions visibility trigger
    if (actionsButtonRef.current && actionsButtonRef.current.contains(e.target))
      return;
    // If click is outside of actions popup
    if (
      actionsPopupRef.current &&
      !actionsPopupRef?.current?.contains(e?.target)
    ) {
      setActionsVisible(false);
      setStateCounter(prev => prev + 1);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutsideActions);
    return () => {
      document.removeEventListener('mousedown', handleClickOutsideActions);
    };
  }, [actionsPopupRef, actionsVisible]);

  const toggleActionsVisible = () => {
    setActionsVisible(prev => !prev);
    setStateCounter(prev => prev + 1);
  };

  const isOneEmoji = messageText?.includes('message-emoji--large');

  return (
    <div
      className={classNames(
        [
          'messenger-window__chat__message-wrapper',
          `chat-message-${message.id}`,
        ],
        {
          'offset-large': offsetLarge,
        },
      )}
    >
      {showMessageAuthor &&
        ((['manager', 'operator'].includes(auth?.currentRole?.label) &&
          message.authorId !== (activeChat as IChat)?.authorId) ||
          (!['manager', 'operator'].includes(auth?.currentRole?.label) &&
            message.authorId !== auth.user.id)) && (
          <div
            className={classNames('messenger-window__chat__message__author', {
              'is-from-me': isFromMe,
            })}
          >
            <Avatar
              className="messenger-window__chat__message__avatar"
              src={'/img/default-avatar.png'}
              shape="circle"
              size="small"
            />
            <span className="messenger-window__chat__message__author-name">
              {message.authorId === auth.user.id
                ? 'Я'
                : `Менеджер ${
                    message?.author?.firstname || '(Пользователь удален)'
                  }`}
            </span>
          </div>
        )}

      <li
        className={classNames('messenger-window__chat__message', {
          'is-from-me': isFromMe,
          'is-unread': message.isUnread,
          'offset-large': offsetLarge,
          'is-audio': isAudioMessage,
          'one-emoji': isOneEmoji,
        })}
        onClick={onItemClick}
      >
        {!!message?.orderRequest && showOrderRequest && (
          <div className="messenger-window__chat__message__order-request">
            <Link
              href={generateUrl(
                {
                  history: DEFAULT_NAV_PATHS.ORDER_REQUEST(
                    message?.orderRequest?.id,
                    message?.orderRequest?.idOrder,
                  ),
                },
                {
                  pathname: APP_PATHS.ORDER_REQUEST(message?.orderRequest?.id),
                },
              )}
            >
              {(
                ['REQUESTED', 'APPROVED'] as IOrderRequest['status'][]
              ).includes(message?.orderRequest?.status)
                ? 'Запрос'
                : 'Заказ'}{' '}
              {message?.orderRequest?.idOrder}
            </Link>
          </div>
        )}
        <div className="messenger-window__chat__message__body">
          {isFromMe && (
            <img
              src={`/img/icons/${
                message.isUnread ? 'unread' : 'read'
              }-message.svg`}
              alt="isUnread"
              className="messenger-window__chat__message__status"
            />
          )}
          <span
            className={classNames(
              'messenger-window__chat__message__control-button',
              {
                active: actionsVisible,
              },
            )}
            onClick={toggleActionsVisible}
            ref={actionsButtonRef}
          >
            <img
              src={
                isFromMe && !isOneEmoji
                  ? '/img/icons/chat-action-arrow-white.svg'
                  : '/img/icons/chat-action-arrow-gray.svg'
              }
            />
            <div
              className={classNames(
                'messenger-window__chat__message__actions',
                {
                  active: actionsVisible,
                },
              )}
              ref={actionsPopupRef}
            >
              <button onClick={() => setReplyToMessage(message)}>
                Ответить
              </button>
              {isFromMe && (
                <button onClick={() => setDeleteMessageId(message?.id)}>
                  Удалить
                </button>
              )}
            </div>
          </span>
          {!!message?.repliedMessage && (
            <div
              className="messenger-window__chat__message__replied-message"
              onClick={e => {
                e.stopPropagation();
                handlers.findAndScrollToRepliedMessage(
                  message?.repliedMessage?.id,
                );
              }}
              style={{
                cursor: 'pointer',
              }}
            >
              <div className="messenger-window__chat__message__replied-message-author">
                {getUserName(message?.repliedMessage?.author, 'fl')}
              </div>
              <div className="messenger-window__chat__message__replied-message-content">
                {!isRepliedMessageAudio ? (
                  <Fragment>
                    {!!message?.repliedMessage?.text &&
                      renderHtml(message?.repliedMessage?.text)}
                    {!!message?.repliedMessage?.files?.length && (
                      <div className="messenger-window__chat__message__file-list">
                        <FileUpload
                          url=""
                          initFiles={message?.repliedMessage?.files?.map(
                            ({ file }) => ({
                              ...file,
                              url: getServerFileUrl(file.path),
                            }),
                          )}
                          disabled={true}
                          size="small"
                          hideUploadButton
                        />
                      </div>
                    )}
                  </Fragment>
                ) : (
                  <AudioMessage
                    message={message?.repliedMessage}
                    isFromMe={false}
                    className="replied-message-audio"
                  />
                )}
              </div>
            </div>
          )}
          {!isAudioMessage ? (
            <Fragment>
              {!!message?.files?.length && (
                <div className="messenger-window__chat__message__file-list">
                  <FileUpload
                    url=""
                    initFiles={message.files.map(({ file }) => ({
                      ...file,
                      url: getServerFileUrl(file.path),
                    }))}
                    disabled={true}
                    size="small"
                    hideUploadButton
                  />
                </div>
              )}
              {messageText && (
                <div className="messenger-window__chat__message__text">
                  {renderHtml(messageText)}{' '}
                </div>
              )}
              <div className="messenger-window__chat__message__bottom">
                <div className="messenger-window__chat__message__time">
                  {formatDate(new Date(message.createdAt), 'HH:mm')}
                </div>
              </div>
            </Fragment>
          ) : (
            <AudioMessage
              message={message}
              isFromMe={isFromMe}
              className="main-message-audio"
            />
          )}
        </div>
      </li>
    </div>
  );
};

export default ChatMessage;
