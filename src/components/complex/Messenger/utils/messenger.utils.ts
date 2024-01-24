import { IChat, IChatMessage } from '../interfaces';
import { IUser, IUserRoleLabelsDefault } from 'sections/Users/interfaces';
import { getUserName } from 'sections/Users/utils';
import { APIRequest } from 'utils/api.utils';
import { API_ENDPOINTS } from 'data/paths.data';
import { AUDIO_EXTENSIONS, IMAGE_EXTENSIONS } from 'data/files.data';
import { getServerFileUrl } from 'utils/files.utils';
import { Dispatch } from 'react';
import { openSideChat } from 'store/reducers/messenger.reducer';
import { ALL_EMOJIS, EMOJIS_CODES } from 'data/emojis.data';
import { renderHtml } from 'utils/common.utils';

export const getChatName = (chat: IChat, authUserId: IUser['id']) =>
  chat.name ||
  getUserName(getChatCompanion(chat, authUserId).user, 'firstname');

export const getChatCompanion = (chatItem: IChat, authUserId: IUser['id']) =>
  chatItem.members.filter(member => member.user.id !== authUserId)[0];

export const startChatWithUser = async ({
  companionId,
  companionRole,
  chatId,
  orderRequestId,
  dispatch,
}: {
  companionId: string;
  companionRole: IUserRoleLabelsDefault;
  chatId?: string;
  orderRequestId?: string;
  dispatch?: Dispatch<any>;
}) => {
  const params: any = { openChat: true, orderRequestId };
  if (chatId) {
    params.chatId = chatId;
  } else {
    params.companionId = companionId;
    params.companionRole = companionRole;
  }
  const getChatRes = await APIRequest<any>({
    method: 'get',
    url: API_ENDPOINTS.CHAT,
    params,
    requireAuth: true,
  });

  if (getChatRes.isSucceed) return;

  if (chatId === 'support' && !!dispatch) {
    dispatch(openSideChat('support'));
    return;
  }

  const createChatRes = await APIRequest<any>({
    method: 'post',
    url: API_ENDPOINTS.CHAT,
    params: { companionId, companionRole, orderRequestId, openChat: true },
    requireAuth: true,
  });

  if (!createChatRes.isSucceed) return;
};

export const getMessagePreview = (message: IChatMessage) => {
  if (!message) return null;

  if (message.files.length < 1 || message.text) return message;

  const fileTypeLocales = {
    file: ['Файл', 'Файлы'],
    photo: ['Фотография', 'Фотографии'],
    audio: ['Голосовое сообщение'],
  };

  const count = message.files.length;

  const fileType =
    (message.files.every(({ ext, file }) =>
      IMAGE_EXTENSIONS.includes(ext || file?.ext),
    ) &&
      'photo') ||
    (count === 1 &&
      message.files.every(({ ext, file }) =>
        AUDIO_EXTENSIONS.includes(ext || file?.ext),
      ) &&
      'audio') ||
    'file';

  message.text = `${fileTypeLocales[fileType][count > 1 ? 1 : 0]} ${
    count > 1 ? '(' + count + ')' : ''
  }`;

  if (
    message.files.some(({ ext, file }) =>
      IMAGE_EXTENSIONS.includes(ext || file?.ext),
    )
  ) {
    const fileToPreview = message.files.filter(
      ({ ext, file, path }) =>
        IMAGE_EXTENSIONS.includes(ext || file?.ext) && (path || file.path),
    )[0];
    message.preview = getServerFileUrl(
      fileToPreview.path || fileToPreview.file.path,
    );
  }

  return message;
};

export const replaceHashToEmoji = (
  text: string,
  largeSingleEmoji?: boolean,
) => {
  if (typeof text !== 'string' || !text?.length) return text;

  let result = text;
  for (let i = 0; i < EMOJIS_CODES.length; i++) {
    const emojiCode = EMOJIS_CODES[i];
    const emoji = ALL_EMOJIS[i];

    if (result.includes(emojiCode) && !result.includes(emoji.emoji)) {
      let messageTextEmoji = result.replaceAll(
        emojiCode,
        `<img src="/img/emojis/${emoji.name}.png" alt="${emoji.emoji}" class="message-emoji message-emoji--small">`,
      );

      if (largeSingleEmoji) {
        const htmrs = [].concat(renderHtml(messageTextEmoji));
        if (htmrs?.length === 1 && htmrs[0]?.type === 'img') {
          messageTextEmoji = result.replaceAll(
            emojiCode,
            `<img src="/img/emojis-large/${emoji.name}.png" alt="${emoji.emoji}" class="message-emoji message-emoji--large">`,
          );
        }
      }

      result = messageTextEmoji;
    }
  }

  return result;
};

// export const setChatUserTypingReducerAction = ({
//   chatId,
//   userId,
//   activeChat,
//   isTyping,
// }: {
//   chatId: IChat['id'];
//   userId: IUser['id'];
//   activeChat: IChat;
//   isTyping: boolean;
// }) => {
//   // const TYPING_DELAY = 3000
//   // let typingTimeout: any = null

//   if (activeChat && activeChat.id === chatId) {
//     const chatMemberIndex = activeChat.members.findIndex(
//       member => member.userId === userId,
//     );
//     if (chatMemberIndex !== -1) {
//       activeChat.members[chatMemberIndex].isTyping = isTyping;
//       // if (typingTimeout) {
//       // 	clearTimeout(typingTimeout)
//       // }
//       // typingTimeout = setTimeout(() => {
//       // 	activeChat.members[chatMemberIndex].isTyping = false
//       // }, TYPING_DELAY)
//     }
//   }

//   return {
//     activeChat,
//   };
// };
