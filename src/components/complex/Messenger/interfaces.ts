import { IOrderRequest } from 'sections/Orders/interfaces';
import { IServerFile } from 'interfaces/files.interfaces';
import { IUser } from 'sections/Users/interfaces';

export interface IChat {
  lastMessage: IChatMessage;
  id?: string;
  authorId: IUser['id'];
  author?: IUser;
  name: string;
  type: number;
  members: IChatMember[];
  companion: IChatMember;
  messages?: { rows: IChatMessage[]; count: number };
  messageViews?: IChatMessageView[];
  unreadMessagesCount?: number;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
}

export interface IChatMember {
  id?: string;
  userId: IUser['id'];
  user?: IUser;
  chatId: string;
  chat?: IChat;
  isTyping?: boolean;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
}

export interface IChatMessage {
  id?: string;
  authorId: IUser['id'];
  author?: IUser;
  authorRoleId: string;
  chatId: string;
  chat: IChat;
  text: string;
  preview?: string;
  params?: any;
  additionalInfo?: any;
  isUnread: boolean;
  orderRequestId?: string;
  orderRequest?: IOrderRequest;
  repliedMessageId?: string;
  repliedMessage?: IChatMessage;
  files?: IChatMessageFile[];
  views?: IChatMessageView[];
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
}

export interface IChatMessageFile {
  id?: string;
  idInt?: number;
  name?: string;
  path?: string;
  ext?: string;
  chatMessageId: string;
  chatMessage?: IChatMessage;
  fileId?: IServerFile['id'];
  file?: IServerFile;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
}

export interface IChatMessageView {
  id?: string;
  idInt?: number;
  userId: IUser['id'];
  user?: IUser;
  chatId: IChat['id'];
  chat?: IChat;
  isViewed: boolean;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
}

export interface IEmoji {
  emoji: string;
  name: string;
  slug: string;
  hidden?: boolean;
  html_code?: string;
}
export interface IEmojiGroup {
  label: string;
  name: string;
  list: IEmoji[];
}
