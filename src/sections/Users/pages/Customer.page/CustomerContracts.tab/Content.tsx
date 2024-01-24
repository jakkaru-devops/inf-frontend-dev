import {
  ICustomerContract,
  IJuristicSubject,
} from 'sections/JuristicSubject/interfaces';
import { ISetState } from 'interfaces/common.interfaces';
import { APIRequest } from 'utils/api.utils';
import { API_ENDPOINTS } from 'data/paths.data';
import { IServerFile } from 'interfaces/files.interfaces';
import { ChangeEvent, FC, useState } from 'react';
import { openNotification } from 'utils/common.utils';
import { IAPIResponse } from 'interfaces/api.types';
import CustomerContract from 'sections/Users/components/CustomerContract';
import { IUser } from 'sections/Users/interfaces';
import { useAuth } from 'hooks/auth.hook';

interface IProps {
  juristicSubjects: IJuristicSubject[];
  setJuristicSubjects: ISetState<IJuristicSubject[]>;
}

const CustomerContractsTabContent: FC<IProps> = ({
  juristicSubjects,
  setJuristicSubjects,
}) => {
  const auth = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [stateCounter, setStateCounter] = useState(0);

  const uploadContractFile = async (
    file: File,
    contract: ICustomerContract,
  ) => {
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
      await uploadContractFile(file, contract);
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
        url: API_ENDPOINTS.PROFILE_CUSTOMER_CONTRACTS,
        data: {
          contract: {
            ...contract,
            file: null,
            juristicSubjectId: juristicSubject.id,
          },
        },
        requireAuth: true,
      });
    } else {
      res = await APIRequest({
        method: 'put',
        url: API_ENDPOINTS.PROFILE_CUSTOMER_CONTRACT(contract?.id),
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
        <div key={juristicSubject.id} className="mb-10">
          <h3>{juristicSubject.name}</h3>

          {juristicSubject.customerContracts.map((contract, contractIndex) => (
            <CustomerContract
              key={contractIndex}
              juristicSubject={juristicSubject}
              customer={auth.user}
              contract={contract}
              updateAllowed
              handleFileChange={handleFileChange}
              handleContractChange={handleContractChange}
              deleteContractFile={deleteContractFile}
              saveContract={saveContract}
            />
          ))}

          {juristicSubjectIndex < juristicSubjects.length - 1 && (
            <hr className="mt-5" />
          )}
        </div>
      ))}
    </div>
  );
};

export default CustomerContractsTabContent;
