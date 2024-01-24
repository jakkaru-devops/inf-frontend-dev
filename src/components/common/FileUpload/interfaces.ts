import { IFileItem } from 'interfaces/files.interfaces';
import { CSSProperties, ReactNode, RefObject } from 'react';

export interface IFileListNewProps {
  url: string;
  size?: 'default' | 'small';
  hideUploadButton?: boolean;
  className?: string;
  style?: CSSProperties;
  accept?: string;
  /**
   * Max number of files allowed to upload
   */
  maxFilesNumber?: number;
  /** In bytes */
  maxFileSize?: number;
  multiple?: boolean;
  disabled?: boolean;
  /**
   * Content to show instead of Upload button
   */
  inputContent?: ReactNode;
  initFiles?: IFileItem[];
  inputRef?: RefObject<HTMLInputElement>;
  fileIds?: string[];
  textInputFile?: string;
  onStartUpload?: (acceptedFiles: File[]) => void;
  /**
   * Calls when each file individually completely uploaded
   */
  onFileUploaded?: (
    uploadedFile: IFileItem,
    activeUploadings: string[],
  ) => void;
  /**
   * Calls when all files uploaded
   */
  onFinishUpload?: (uploadedFiles: IFileItem[]) => void;
  onDelete?: (deletedFile: IFileItem, activeUploadings: string[]) => void;
}

export interface IFileListInputProps {
  size?: 'default' | 'small';
  hideUploadButton?: boolean;
  accept?: string;
  maxFiles?: number;
  multiple?: boolean;
  disabled?: boolean;
  inputContent?: ReactNode;
  inputRef?: RefObject<HTMLInputElement>;
  getInputProps: () => any;
  textInputFile?: string;
}
