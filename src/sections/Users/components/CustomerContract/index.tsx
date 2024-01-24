import { Input, ConfigProvider, DatePicker, Button, Checkbox } from 'antd';
import { PaperClipOutlined } from '@ant-design/icons';
import antdLocale from 'antd/lib/locale/ru_RU';
import classNames from 'classnames';
import moment from 'moment';
import { FC, Fragment, useState } from 'react';
import {
  ICustomerContract,
  IJuristicSubject,
} from 'sections/JuristicSubject/interfaces';
import { IUser } from 'sections/Users/interfaces';
import {
  downloadFileByPath,
  getServerFileUrl,
  handleAttachmentClick,
  openFileByPath,
} from 'utils/files.utils';
import SpecificationItem from './SpecificationItem';
import { useModalsState } from 'hooks/modal.hook';
import { IMAGE_EXTENSIONS } from 'data/files.data';

interface IProps {
  juristicSubject: IJuristicSubject;
  customer: IUser;
  contract: ICustomerContract;
  updateAllowed: boolean;
  handleFileChange: (e: any, contract: ICustomerContract) => void;
  deleteContractFile: (contract: ICustomerContract) => void;
  handleContractChange: (
    propName: string,
    value: any,
    contract: ICustomerContract,
  ) => void;
  saveContract: (props: {
    juristicSubject: IJuristicSubject;
    customer: IUser;
    contract: ICustomerContract;
  }) => Promise<void>;
}

const CustomerContract: FC<IProps> = ({
  juristicSubject,
  customer,
  contract,
  updateAllowed,
  handleFileChange,
  deleteContractFile,
  handleContractChange,
  saveContract,
}) => {
  const [submitting, setSubmitting] = useState(false);
  const { Modal, openModal } = useModalsState();
  const DatePickerUntyped = DatePicker as any;
  const file = {
    ...contract?.file,
    url: getServerFileUrl(contract?.file?.path),
  };

  const disabledDate = (current: moment.Moment) => {
    return current && current > moment().endOf('day');
  };

  return (
    <div
      key={contract.id}
      className="customer-contract pb-10"
      style={{
        display: 'table',
      }}
    >
      <div className="d-flex">
        <div style={{ maxWidth: 300 }}>
          <div style={{ fontWeight: 500 }} className="mb-10">
            Договор
          </div>
          <div className="d-flex align-items-center mb-15">
            {!!contract?.file ? (
              <Fragment>
                <a
                  href={file.url}
                  className="text-underline"
                  target="_blank"
                  onClick={e => {
                    e.preventDefault();
                    handleAttachmentClick(file, () => openModal('image'));
                  }}
                >
                  {contract.name}
                </a>
                {updateAllowed && (
                  <Button
                    size="small"
                    shape="circle"
                    className="no-bg no-border ml-10"
                    onClick={() => deleteContractFile(contract)}
                    style={{ marginBottom: -2 }}
                  >
                    <img src="/img/close.svg" style={{ width: 10 }} alt="" />
                  </Button>
                )}
              </Fragment>
            ) : (
              updateAllowed && (
                <label style={{ display: 'table', marginTop: 10 }}>
                  <input
                    style={{ display: 'none' }}
                    type="file"
                    multiple={false}
                    onChange={e => handleFileChange(e, contract)}
                  />
                  <PaperClipOutlined
                    className="color-primary"
                    style={{ fontSize: 20, cursor: 'pointer' }}
                  />
                </label>
              )
            )}
          </div>
          <div className="d-flex align-items-center mb-15">
            <label className="d-flex align-items-center">
              <span className="mr-5">№</span>
              <Input
                value={contract.number}
                onChange={e =>
                  handleContractChange('number', e.target.value, contract)
                }
                size="small"
                readOnly={!updateAllowed}
              />
            </label>
            <label className="d-flex align-items-center ml-10">
              <span className="mr-5">от</span>
              <ConfigProvider locale={antdLocale}>
                <DatePickerUntyped
                  value={!!contract?.date ? moment(contract.date) : null}
                  format="DD.MM.YYYY"
                  size="small"
                  onChange={value =>
                    handleContractChange('date', value, contract)
                  }
                  disabledDate={disabledDate}
                  className={classNames({
                    readonly: !updateAllowed,
                  })}
                  disabled={!updateAllowed}
                  clearIcon={updateAllowed}
                />
              </ConfigProvider>
            </label>
          </div>
          <div style={{ fontWeight: 500 }}>Руководитель</div>
          <label className="d-block mb-5">
            <span>Должность</span>
            <Input
              value={contract.directorPost}
              onChange={e =>
                handleContractChange('directorPost', e.target.value, contract)
              }
              size="small"
              readOnly={!updateAllowed}
            />
          </label>
          <label className="d-block mb-5">
            <span>Фамилия</span>
            <Input
              value={contract.directorLastName}
              onChange={e =>
                handleContractChange(
                  'directorLastName',
                  e.target.value,
                  contract,
                )
              }
              size="small"
              readOnly={!updateAllowed}
            />
          </label>
          <label className="d-block mb-5">
            <span>Имя</span>
            <Input
              value={contract.directorFirstName}
              onChange={e =>
                handleContractChange(
                  'directorFirstName',
                  e.target.value,
                  contract,
                )
              }
              size="small"
              readOnly={!updateAllowed}
            />
          </label>
          <label className="d-block mb-5">
            <span>Отчество</span>
            <Input
              value={contract.directorMiddleName}
              onChange={e =>
                handleContractChange(
                  'directorMiddleName',
                  e.target.value,
                  contract,
                )
              }
              size="small"
              readOnly={!updateAllowed}
            />
          </label>
          <label className="d-block mb-15">
            <span>Основание</span>
            <Input
              value={contract.basisName}
              onChange={e =>
                handleContractChange('basisName', e.target.value, contract)
              }
              size="small"
              readOnly={!updateAllowed}
            />
          </label>

          <div style={{ fontWeight: 500 }}>Подписант</div>
          <Checkbox
            checked={contract.signerIsDirector}
            onChange={e => {
              if (!updateAllowed) return;
              handleContractChange(
                'signerIsDirector',
                e.target.checked,
                contract,
              );
            }}
            className="mb-10"
          >
            руководитель
          </Checkbox>
          <label
            className={classNames('d-block mb-5', {
              'color-gray': contract.signerIsDirector,
            })}
          >
            <span>Фамилия</span>
            <Input
              value={contract.signerLastName}
              onChange={e =>
                handleContractChange('signerLastName', e.target.value, contract)
              }
              size="small"
              readOnly={!updateAllowed}
              disabled={contract.signerIsDirector}
            />
          </label>
          <label
            className={classNames('d-block mb-5', {
              'color-gray': contract.signerIsDirector,
            })}
          >
            <span>Имя</span>
            <Input
              value={contract.signerFirstName}
              onChange={e =>
                handleContractChange(
                  'signerFirstName',
                  e.target.value,
                  contract,
                )
              }
              size="small"
              readOnly={!updateAllowed}
              disabled={contract.signerIsDirector}
            />
          </label>
          <label
            className={classNames('d-block mb-5', {
              'color-gray': contract.signerIsDirector,
            })}
          >
            <span>Отчество</span>
            <Input
              value={contract.signerMiddleName}
              onChange={e =>
                handleContractChange(
                  'signerMiddleName',
                  e.target.value,
                  contract,
                )
              }
              size="small"
              readOnly={!updateAllowed}
              disabled={contract.signerIsDirector}
            />
          </label>
          <label
            className={classNames('d-block', {
              'color-gray': contract.signerIsDirector,
            })}
          >
            <span>Должность</span>
            <Input
              value={contract.signerPost}
              onChange={e =>
                handleContractChange('signerPost', e.target.value, contract)
              }
              size="small"
              readOnly={!updateAllowed}
              disabled={contract.signerIsDirector}
            />
          </label>
          {updateAllowed && (
            <div className="mt-15">
              <Button
                type="primary"
                className="w-100"
                onClick={() =>
                  saveContract({ juristicSubject, customer, contract })
                }
                loading={submitting}
                disabled={!!contract?.id && !contract?.valueChanged}
              >
                Сохранить
              </Button>
            </div>
          )}
        </div>

        {!!contract?.specifications?.length && (
          <div style={{ marginLeft: 100 }}>
            <div>Спецификации</div>
            {contract.specifications.map(
              (specification, specificationIndex) => (
                <SpecificationItem
                  key={specification.id}
                  specification={specification}
                  index={specificationIndex}
                />
              ),
            )}
          </div>
        )}
      </div>

      {!!file.url && <Modal attachment={file} />}
    </div>
  );
};

export default CustomerContract;
