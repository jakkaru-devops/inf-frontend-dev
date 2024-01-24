import { UploadFile } from 'antd/lib/upload/interface';
import { IUser } from 'sections/Users/interfaces';

export interface IServerFile {
  id?: string;
  idInt?: number;
  userId: IUser['id'];
  user?: IUser;
  name: string;
  ext: string;
  size: number;
  path: string;
  url?: string;
  duration?: number;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
}

export interface IFileItem {
  id?: string;
  initialId?: string;
  name?: string;
  ext?: string;
  size?: number;
  path?: string;
  url?: string;
  localUrl?: string;
  file?: File;
  isSaved?: boolean;
  uploadPercent?: number;
  type?: 'file' | 'audioRecord';
}

export interface IUploadFileExtended extends UploadFile {
  path?: string;
  userId: string;
  isSaved?: boolean;
  isUploaded?: boolean;
  ext: string;
}

export interface IFileUploadProgressEvent {
  bubbles: boolean;
  cancelBubble: boolean;
  cancelable: boolean;
  composed: boolean;
  currentTarget: XMLHttpRequestUpload;
  defaultPrevented: boolean;
  eventPhase: number;
  isTrusted: boolean;
  lengthComputable: boolean;
  loaded: number;
  path: string[];
  returnValue: boolean;
  srcElement: XMLHttpRequestUpload;
  target: XMLHttpRequestUpload;
  timeStamp: number;
  total: number;
  type: 'progress';
}

export interface IServiceDoc {
  label?: string;
  name: string;
  url: string;
  html?: string;
}
