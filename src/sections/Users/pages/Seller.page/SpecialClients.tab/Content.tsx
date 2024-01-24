import { ChangeEvent, FC, useState } from 'react';
import {
  ICustomerContract,
  IJuristicSubject,
} from 'sections/JuristicSubject/interfaces';
import CustomerContract from 'sections/Users/components/CustomerContract';
import { getUserName } from 'sections/Users/utils';
import AnimateHeight from 'react-animate-height';
import { ISetState } from 'interfaces/common.interfaces';
import classNames from 'classnames';
import { APIRequest } from 'utils/api.utils';
import { API_ENDPOINTS } from 'data/paths.data';
import { openNotification } from 'utils/common.utils';
import { IServerFile } from 'interfaces/files.interfaces';
import { IUser } from 'sections/Users/interfaces';
import { IAPIResponse } from 'interfaces/api.types';
import { Button } from 'antd';
import { useAuth } from 'hooks/auth.hook';

interface IProps {
  juristicSubjects: IJuristicSubject[];
  setJuristicSubjects: ISetState<IJuristicSubject[]>;
}

const SpecialClientsTabContent: FC<IProps> = ({
  juristicSubjects,
  setJuristicSubjects,
}) => {
  const auth = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [stateCounter, setStateCounter] = useState(0);

  const toggleGroupExpanded = (
    group: any,
    type: 'juristicSubject' | 'customer',
  ) => {
    const isExpanded = !group?.isExpanded;
    group.isExpanded = isExpanded;
    setJuristicSubjects(juristicSubjects);
    setStateCounter(prev => prev + 1);
  };

  const addContract = (juristicSubject: IJuristicSubject, customer: IUser) => {
    customer.customerContracts = [
      {
        juristicSubjectId: juristicSubject.id,
        creatorUserId: auth.user.id,
        customerId: auth.user.id,
        fileId: null,
        file: null,
        name: null,
        number: null,
        date: null,
        directorFirstName: null,
        directorLastName: null,
        directorMiddleName: null,
        directorPost: null,
        basisName: null,
        signerIsDirector: false,
        signerFirstName: null,
        signerLastName: null,
        signerMiddleName: null,
        signerPost: null,
      },
    ];
    setJuristicSubjects(juristicSubjects);
    setStateCounter(prev => prev + 1);
  };

  const uploadContract = async ({
    file,
    contract,
  }: {
    file: File;
    contract: ICustomerContract;
  }) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('filename', file.name);

    const res = await APIRequest({
      method: 'post',
      url: API_ENDPOINTS.FILE_UNKNOWN,
      data: formData,
      requireAuth: true,
    });
    if (!res.isSucceed) {
      openNotification('Не удалось загрузить файл');
      return;
    }

    const uploadedFile: IServerFile = res.data.result;

    contract.fileId = uploadedFile.id;
    contract.file = uploadedFile;
    contract.name = uploadedFile.name;
    contract.valueChanged = true;

    setJuristicSubjects(juristicSubjects);
    setStateCounter(prev => prev + 1);
  };

  const handleFileChange = async (
    e: ChangeEvent<HTMLInputElement>,
    contract: ICustomerContract,
  ) => {
    const files = e.target.files;
    for (let i = 0; i < files.length; i++) {
      const file = files.item(i);
      await uploadContract({ file, contract });
    }
    e.target.value = ''; // clear input value when uploading is done
  };

  const deleteContractFile = (contract: ICustomerContract) => {
    contract.fileId = null;
    contract.file = null;
    contract.name = null;
    contract.valueChanged = true;
    setJuristicSubjects(juristicSubjects);
    setStateCounter(prev => prev + 1);
  };

  const handleContractChange = (
    propName: 'name' | 'number' | 'date',
    value: any,
    contract: ICustomerContract,
  ) => {
    contract[propName] = value;
    contract.valueChanged = true;
    setJuristicSubjects(juristicSubjects);
    setStateCounter(prev => prev + 1);
  };

  const saveContract = async ({
    juristicSubject,
    customer,
    contract,
  }: {
    juristicSubject: IJuristicSubject;
    customer: IUser;
    contract: ICustomerContract;
  }) => {
    setSubmitting(true);

    let res: IAPIResponse<ICustomerContract>;
    if (!contract?.id) {
      res = await APIRequest({
        method: 'post',
        url: API_ENDPOINTS.POST_CUSTOMER_CONTRACT,
        data: {
          contract: {
            ...contract,
            file: null,
            juristicSubjectId: juristicSubject.id,
            customerId: customer.id,
          },
        },
        requireAuth: true,
      });
    } else {
      res = await APIRequest({
        method: 'put',
        url: API_ENDPOINTS.UPDATE_DELETE_CUSTOMER_CONTRACT(contract?.id),
        data: {
          contract: {
            ...contract,
            file: null,
          },
        },
        requireAuth: true,
      });
    }
    setSubmitting(false);
    if (!res.isSucceed) {
      openNotification(res?.message || 'Договор не сохранен');
      return;
    }
    const savedContract = res.data;

    contract.id = savedContract.id;
    contract.valueChanged = false;

    setJuristicSubjects(juristicSubjects);
    setStateCounter(prev => prev + 1);
    openNotification('Договор сохранен');
  };

  return (
    <div>
      {juristicSubjects.map((juristicSubject, juristicSubjectIndex) => (
        <div key={juristicSubject.id} className="special-clients-group">
          <div className="mb-0 special-clients-group__title">
            <div
              className="special-clients-group__title-inner"
              onClick={() =>
                toggleGroupExpanded(juristicSubject, 'juristicSubject')
              }
            >
              <h4 className="mb-0">{juristicSubject.name}</h4>
              <img
                src="/img/icons/arrow-down-red.svg"
                alt=""
                className={classNames('arrow', {
                  active: juristicSubject?.isExpanded,
                })}
              />
            </div>
          </div>
          <AnimateHeight
            height={juristicSubject?.isExpanded ? 'auto' : 0}
            duration={150}
          >
            <div
              className="ml-5 pl-10 pt-10"
              style={{ borderLeft: '1px solid #e5e5e5' }}
            >
              {juristicSubject.customers.map((customer, customerIndex) => (
                <div key={customer.id} className="special-clients-group">
                  <div className="mb-0 special-clients-group__title">
                    <div
                      className="special-clients-group__title-inner"
                      onClick={() => toggleGroupExpanded(customer, 'customer')}
                    >
                      <h4
                        className={classNames('mb-0', {
                          'color-primary':
                            !!customer?.customerContracts?.length,
                        })}
                      >
                        {getUserName(customer)}
                      </h4>
                      <img
                        src="/img/icons/arrow-down-red.svg"
                        alt=""
                        className={classNames('arrow', {
                          active: customer?.isExpanded,
                        })}
                      />
                    </div>
                  </div>
                  <AnimateHeight
                    height={customer?.isExpanded ? 'auto' : 0}
                    duration={150}
                  >
                    <div
                      className="ml-5 pl-10 pt-10"
                      style={{ borderLeft: '1px solid #e5e5e5' }}
                    >
                      {customer.customerContracts.map(
                        (contract, contractIndex) => (
                          <CustomerContract
                            key={contractIndex}
                            juristicSubject={juristicSubject}
                            customer={customer}
                            contract={contract}
                            updateAllowed
                            handleFileChange={handleFileChange}
                            handleContractChange={handleContractChange}
                            deleteContractFile={deleteContractFile}
                            saveContract={saveContract}
                          />
                        ),
                      )}
                      {!customer.customerContracts?.length && (
                        <Button
                          onClick={() => addContract(juristicSubject, customer)}
                          type="primary"
                        >
                          Добавить договор
                        </Button>
                      )}
                    </div>
                  </AnimateHeight>
                </div>
              ))}
            </div>
          </AnimateHeight>
        </div>
      ))}
    </div>
  );
};

export default SpecialClientsTabContent;
