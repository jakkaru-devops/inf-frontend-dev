import Dropzone from 'react-dropzone-uploader';
import { IFileInputProps } from './interfaces';
import { Input } from './elements/Input';
import { Layout } from './elements/Layout';
import { Preview } from './elements/Preview';
import { API_SERVER_URL } from 'config/env';
import { FileItem } from '..';
import { useLocale } from 'hooks/locale.hook';
import { FC } from 'react';

/**
 * @description File input component, with upload to the url options.
 * @param {*} {
 *   url,
 *   accept
 * }
 * @returns {FC<IFileInput>} FC<IFileInput>
 */
const FileInput: FC<IFileInputProps> = ({
  url,
  size = 'default',
  hideUploadButton,
  className,
  style,
  uploadedFiles,
  accept = '*',
  maxFiles,
  multiple = true,
  disabled,
  onRemove,
  onUpload,
  inputRef,
  inputContent,
  initFiles,
}) => {
  initFiles = initFiles || [];

  const { locale } = useLocale();

  // useEffect(() => {
  //   onUpload(initFiles)
  // }, [])

  const dropzoneParams = {
    getUploadParams: () => ({
      url: API_SERVER_URL + url,
    }),
    LayoutComponent: props => (
      <Layout
        {...props}
        size={size}
        className={className}
        hideUploadButton={hideUploadButton}
        style={style}
      />
    ),
    InputComponent: props =>
      ((maxFiles && props?.files?.length < maxFiles) || !maxFiles) && (
        <Input
          {...props}
          locale={locale}
          inputContent={inputContent}
          inputRef={inputRef}
          size={size}
          hideUploadButton={hideUploadButton}
          disabled={disabled}
        />
      ),
    PreviewComponent: props => (
      <Preview
        {...props}
        url={url}
        uploadedFiles={uploadedFiles}
        onRemove={onRemove}
      />
    ),
    inputContent: inputContent,
    onChangeStatus: (...props) => {
      const [, status, fileList] = props;
      if (status === 'done') {
        const uploadParams = fileList.map(file => ({
          id: JSON.parse(file.xhr.response).data?.result.id,
        }));
        onUpload(uploadParams);
      }
    },
    accept: accept,
    multiple,
  };

  if (maxFiles) dropzoneParams['maxFiles'] = maxFiles;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          flexDirection: 'row',
        }}
      >
        {initFiles.length > 0 &&
          initFiles.map(productFile => (
            <FileItem
              key={productFile.id}
              onDelete={
                !!onRemove
                  ? () => {
                      onRemove(productFile.fileId);
                    }
                  : null
              }
              onClick={() => {}}
              file={{
                ...productFile.file,
                path: `${API_SERVER_URL}/files/${productFile.file.path}`,
              }}
              className="mr-10"
            />
          ))}
        <Dropzone {...dropzoneParams} disabled={disabled} />
      </div>
    </div>
  );
};

export default FileInput;
