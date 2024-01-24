import { CSSProperties, ReactNode, RefObject } from 'react';
import {
  IInputProps,
  IDropzoneProps,
  IPreviewProps,
  ILayoutProps,
} from 'react-dropzone-uploader';
import { IProductFile } from 'sections/Catalog/interfaces/products.interfaces';
import { IUser } from 'sections/Users/interfaces';

export interface IUploadedFile {
  id: string;
}

export interface IFileInputProps {
  url: string;
  size?: 'default' | 'small';
  hideUploadButton?: boolean;
  className?: string;
  style?: CSSProperties;
  accept?: string;
  uploadedFiles?: IUploadedFile[];
  maxFiles?: number;
  multiple?: boolean;
  inputRef?: RefObject<HTMLInputElement>;
  inputContent?: IDropzoneProps['inputContent'];
  disabled?: boolean;
  initFiles?: Array<IProductFile>;
  onUpload: (uploadedFiles: IUploadedFile[]) => void;
  onRemove: (id: string) => void;
}

export interface IFileInputInputProps extends IInputProps {
  inputContent?: ReactNode;
  inputRef: IFileInputProps['inputRef'];
  size?: IFileInputProps['size'];
  hideUploadButton?: IFileInputProps['hideUploadButton'];
}

export interface IPreview extends IPreviewProps {
  onRemove: IFileInputProps['onRemove'];
  url: IFileInputProps['url'];
  uploadedFiles?: IFileInputProps['uploadedFiles'];
}

export interface IDownloadLink {
  file: File;
}

export interface IFileInputLayoutProps extends ILayoutProps {
  size?: IFileInputProps['size'];
  className?: IFileInputProps['className'];
  hideUploadButton?: IFileInputProps['hideUploadButton'];
  style?: CSSProperties;
}

export interface IServerFile {
  id?: string;
  idInt?: number;
  userId: IUser['id'];
  user?: IUser;
  name: string;
  ext: string;
  size: number;
  path: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
}
