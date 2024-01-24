import { ChangeEvent, FC, Fragment } from 'react';
import { Form, Checkbox } from 'antd';
import {
  CloseOutlined,
  EyeOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import classNames from 'classnames';
import { fileUrl } from 'utils/api.utils';
import { IRegisterFileExtended } from 'sections/Auth/interfaces';
import { useFormValidation } from 'hooks/formValidation.hooks';
import { downloadFileByPath } from 'utils/files.utils';
import { useModalsState } from 'hooks/modal.hook';
import { useAuth } from 'hooks/auth.hook';

interface IProps {
  fileList: IRegisterFileExtended[];
  comparedFileList?: IRegisterFileExtended[];
  type: 'user' | 'org';
  orgEntityType?: string;
  disabled?: boolean;
  uploadFile: (
    e: ChangeEvent<HTMLInputElement>,
    type: IProps['type'],
    label: string,
  ) => void;
  deleteFile: (type: IProps['type'], label: string) => void;
  icon: 'upload' | 'download' | 'view';
  allowControl: boolean;
  uploadAllFiles?: boolean;
}

const RegisterFileList: FC<IProps> = ({
  fileList,
  comparedFileList,
  type,
  orgEntityType,
  disabled,
  uploadFile,
  deleteFile,
  icon,
  allowControl,
  uploadAllFiles,
}) => {
  const auth = useAuth();

  fileList = fileList
    .filter(Boolean)
    .filter(
      file =>
        !file.entityTypes ||
        (file.entityTypes.includes('REST') && orgEntityType !== 'ИП') ||
        (file.entityTypes.includes('ИП') && orgEntityType === 'ИП'),
    );
  allowControl = allowControl && !disabled;

  const { validateCheckbox, validateFile } = useFormValidation();

  const downloadFile = (file: IRegisterFileExtended) => {
    if (!file.file) return;
    // window.open(fileUrl(file.serverFile.path), '_blank')
    axios({
      method: 'get',
      url: fileUrl(file.file.path),
      responseType: 'blob',
    }).then(res => {
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', file.file.name);
      document.body.appendChild(link);
      link.click();
    });
  };
  //openFile
  const { Modal, openModal } = useModalsState(6);
  const handleOpenModal = (index: number) => {
    openModal('document', index);
  };

  return (
    <ul className="register-form__file-list">
      {fileList.map((file, i) => (
        <Fragment key={i}>
          {(file.type === 'upload' || uploadAllFiles) && (
            <li
              key={i}
              className={classNames('register-form__file-item', {
                'is-uploaded': !!file.file,
                'is-disabled': disabled,
                highlighted:
                  !!comparedFileList &&
                  file?.file?.id !==
                    comparedFileList.find(el => el.label === file.label)?.file
                      ?.id,
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
                  onClick={() => downloadFile(file)}
                >
                  {icon === 'upload' && (
                    <svg
                      width="21"
                      height="20"
                      viewBox="0 0 21 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M15.7248 8.47787L7.19111 16.9751C5.81814 18.3422 3.57144 18.3422 2.19847 16.9751L2.02973 16.8071C0.656755 15.44 0.656755 13.2029 2.02973 11.8358L10.827 3.07617"
                        stroke="currentColor"
                        strokeMiterlimit="10"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M2.02979 11.8356L11.4488 2.45687C13.3996 0.514377 16.594 0.514377 18.5448 2.45687C20.4957 4.39936 20.4957 7.58008 18.5448 9.52257L8.97558 19.0509"
                        stroke="currentColor"
                        strokeMiterlimit="10"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M4.49805 13.7712L12.7683 5.53632C13.5819 4.72618 14.911 4.72618 15.7223 5.53632C16.5359 6.34645 16.5359 7.66984 15.7223 8.47767L8.57306 15.5986"
                        stroke="currentColor"
                        strokeMiterlimit="10"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                  {icon === 'download' && (
                    <svg
                      width="17"
                      height="17"
                      viewBox="0 0 17 17"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M16.3718 9.6C16.1044 9.6 15.8949 9.82085 15.8949 10.0856V12.1801C15.8949 13.8574 14.7395 15.1785 13.3667 15.1785H4.33193C2.95915 15.1785 1.80375 13.8574 1.80375 12.1801V10.0856C1.80375 9.82085 1.59431 9.6 1.32687 9.6C1.05944 9.6 0.85 9.82085 0.85 10.0856V12.1801C0.85 14.3487 2.39346 16.1498 4.33193 16.1498H13.3667C15.3052 16.1498 16.8487 14.3487 16.8487 12.1801V10.0856C16.8487 9.82085 16.6392 9.6 16.3718 9.6Z"
                        fill="currentColor"
                        stroke="currentColor"
                        strokeWidth="0.3"
                      />
                      <path
                        d="M9.27796 8.78125H10.3988C10.6815 8.78125 10.9367 8.94238 11.0624 9.19788C11.1877 9.45282 11.1618 9.75439 10.9936 9.98352L9.27796 8.78125ZM9.27796 8.78125V1.29024C9.27796 1.0492 9.08572 0.85 8.84259 0.85C8.59946 0.85 8.40721 1.0492 8.40721 1.29024V8.78319H7.30155C7.01886 8.78319 6.76365 8.94432 6.63804 9.19982C6.5127 9.45477 6.53855 9.75637 6.70688 9.98551L6.70695 9.9856L8.25504 12.0958C8.25513 12.096 8.25522 12.0961 8.25532 12.0962C8.39596 12.2899 8.61422 12.3996 8.8502 12.3996C9.08721 12.3996 9.30486 12.2872 9.44483 12.0966L9.44491 12.0965L10.9934 9.98367L9.27796 8.78125Z"
                        fill="currentColor"
                        stroke="currentColor"
                        strokeWidth="0.3"
                      />
                    </svg>
                  )}
                  <span className="register-form__file-item__name">
                    {file.name}
                  </span>
                  {!file.file && !disabled && (
                    <input
                      type="file"
                      onChange={e =>
                        disabled ? () => {} : uploadFile(e, type, file.label)
                      }
                    />
                  )}
                </label>
              </Form.Item>
              {allowControl && (
                <div className="register-form__file-item__icon-group">
                  <div
                    className="register-form__file-item__delete ml-5"
                    onClick={e => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (!disabled) {
                        deleteFile(type, file.label);
                      }
                    }}
                  >
                    <CloseOutlined />
                  </div>
                </div>
              )}
            </li>
          )}
          {file.type === 'check' && !uploadAllFiles && (
            <li
              key={i}
              className={classNames('register-form__file-item', {
                'is-uploaded': true,
              })}
              style={{
                marginTop: 7,
              }}
            >
              <Form.Item
                name={file.label}
                rules={[{ validator: validateCheckbox }]}
                valuePropName="checked"
              >
                <Checkbox
                  defaultChecked={file?.checked}
                  disabled={file?.disabled}
                >
                  <div
                    className="register-form__file-item__wrapper"
                    style={{ marginBottom: 2 }}
                  >
                    <span className="register-form__file-item__name">
                      {file.name}
                    </span>
                  </div>
                </Checkbox>
              </Form.Item>

              {auth?.currentRole?.label === 'seller' && (
                <div className="register-form__file-item__icon-group">
                  <div
                    className="register-form__file-item__view"
                    onClick={e => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleOpenModal(i);
                    }}
                  >
                    <EyeOutlined />
                  </div>
                  <div
                    className="register-form__file-item__download"
                    onClick={e => {
                      e.preventDefault();
                      e.stopPropagation();
                      downloadFileByPath(file.path, file.name + '.pdf');
                    }}
                  >
                    <DownloadOutlined />
                  </div>
                </div>
              )}
            </li>
          )}
        </Fragment>
      ))}
      <Modal doc={fileList[4]} index={4} />
      <Modal doc={fileList[5]} index={5} />
    </ul>
  );
};

export default RegisterFileList;
