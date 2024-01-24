import classNames from 'classnames';
import { IFormFileUploadProps } from './interfaces';
import { Form } from 'antd';
import { useFormValidation } from 'hooks/formValidation.hooks';
import { downloadFileByPath } from 'utils/files.utils';
import { FC } from 'react';

const FormFileUpload: FC<IFormFileUploadProps> = ({
  files,
  disabled,
  readonly,
}) => {
  const { validateFile } = useFormValidation();

  return (
    <div className="file-list-named">
      {files.map((file, i) => (
        <div
          key={i}
          className={classNames('file-list-named__item', {
            'is-uploaded': !!file.id,
            'is-disabled': disabled,
          })}
        >
          <Form.Item
            name={file.label}
            rules={[
              {
                validator: () => validateFile(file),
                validateTrigger: file.label,
              },
            ]}
          >
            <label
              className="register-form__file-item__wrapper"
              onClick={() =>
                !!file.id && downloadFileByPath(file.path, file.name)
              }
            >
              {file.icon === 'upload' && (
                <img src="/img/icons/paperclip-right.svg" alt="" />
              )}
              {file.icon === 'download' && (
                <img src="/img/icons/download.svg" alt="" />
              )}
              <span className="register-form__file-item__name">
                {file.name}
              </span>
              {!file.id && !disabled && !readonly && (
                <input type="file" onChange={e => {}} />
              )}
            </label>
          </Form.Item>
        </div>
      ))}
    </div>
  );
};

export default FormFileUpload;
