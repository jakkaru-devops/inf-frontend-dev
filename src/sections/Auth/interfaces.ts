import { IServerFile } from 'interfaces/files.interfaces';

export interface IRegisterFile {
  label: string;
  name: string;
  entityTypes?: string[];
  type: 'upload' | 'check';
  path?: string;
}

export interface IRegisterFileExtended extends IRegisterFile {
  localFile: File;
  file: IServerFile;
  checked?: boolean;
  disabled?: boolean;
}
