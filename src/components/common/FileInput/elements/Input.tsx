import { Button } from 'antd';
import { FC, ChangeEvent } from 'react';
import { getDroppedOrSelectedFiles } from 'html5-file-selector';
import { PlusOutlined } from '@ant-design/icons';
import classnames from 'classnames';
import { IFileInputInputProps } from '../interfaces';
import { useLocale } from 'hooks/locale.hook';

const Input: FC<IFileInputInputProps> = ({
  accept,
  onFiles,
  extra,
  inputContent,
  inputRef,
  size,
  hideUploadButton,
  disabled,
}) => {
  const { locale } = useLocale();

  const active = extra?.active;

  const getFilesFromEvent = (e: ChangeEvent<HTMLInputElement>) => {
    return new Promise(resolve => {
      getDroppedOrSelectedFiles(e).then(chosenFiles => {
        resolve(chosenFiles.map(f => f.fileObject));
      });
    });
  };

  const renderInputButton = () =>
    inputContent || (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <PlusOutlined />
        {size !== 'small' && (
          <span style={{ marginLeft: 0 }}>{locale.common.uploadFile}</span>
        )}
      </div>
    );

  return (
    <Button
      className={classnames('file-input__dropzone', {
        active,
        hidden: hideUploadButton,
      })}
      disabled={disabled}
    >
      <label style={{ cursor: 'pointer' }}>
        {renderInputButton()}
        <input
          ref={inputRef}
          style={{ display: 'none' }}
          type="file"
          accept={accept}
          multiple
          onChange={e => {
            getFilesFromEvent(e).then((chosenFiles: File[]) => {
              onFiles(chosenFiles);
            });
          }}
        />
      </label>
    </Button>
  );
};

export { Input };
