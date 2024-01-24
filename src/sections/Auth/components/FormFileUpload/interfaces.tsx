export interface IFormFileUploadProps {
  files: IFormFile[];
  disabled?: boolean;
  readonly?: boolean;
}

export interface IFormFile {
  id?: string;
  label: string;
  name: string;
  path?: string;
  icon: 'upload' | 'download';
  disabled?: boolean;
  readonly?: boolean;
}
