import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import { IFileListInputProps } from './interfaces';
import { useLocale } from 'hooks/locale.hook';
import { FC } from 'react';

const FileUploadInput: FC<IFileListInputProps> = ({
  hideUploadButton,
  size,
  disabled,
  inputContent,
  accept,
  inputRef,
  getInputProps,
  textInputFile,
}) => {
  const { locale } = useLocale();

  return (
    <div
      className={classNames('file-input__input-wrapper', {
        hidden: hideUploadButton,
      })}
    >
      <Button
        className={classNames('file-input__input-button', {
          // active,
          hidden: hideUploadButton,
        })}
        disabled={disabled}
      >
        <label style={{ cursor: 'pointer' }}>
          {inputContent || (
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
                <span style={{ marginLeft: 0 }}>
                  {textInputFile || locale.common.uploadFile}
                </span>
              )}
            </div>
          )}
          <input
            {...getInputProps()}
            ref={inputRef}
            style={{ display: 'none' }}
            type="file"
            accept={accept}
            multiple
            onChange={e => {
              if (!!getInputProps()?.onChange) getInputProps()?.onChange(e);
              e.target.value = '';
            }}
          />
        </label>
      </Button>
    </div>
  );
};

export default FileUploadInput;
