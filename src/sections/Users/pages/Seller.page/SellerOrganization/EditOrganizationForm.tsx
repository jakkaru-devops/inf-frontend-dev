import { Alert, Button, Form } from 'antd';
import { Container } from 'components/common';
import { API_ENDPOINTS } from 'data/paths.data';
import { ISetState } from 'interfaces/common.interfaces';
import { ChangeEvent, FC, useState } from 'react';
import { IRegisterFileExtended } from 'sections/Auth/interfaces';
import { uploadRegisterFile } from 'sections/Auth/utils';
import OrganizationFormFragment from 'sections/Organizations/components/OrganizationFormFragment';
import {
  ORGANIZATION_TYPES,
  REGISTER_ORG_FILE_LIST,
} from 'sections/Organizations/data';
import {
  IOrganization,
  IOrganizationUpdateApplication,
} from 'sections/Organizations/interfaces';
import { getOrgFormData } from 'sections/Organizations/utils';
import { APIRequest } from 'utils/api.utils';
import { openNotification } from 'utils/common.utils';
import { deepenObject } from 'utils/object.utils';

interface IProps {
  organization: IOrganization;
  setEditModeEnabled: ISetState<boolean>;
  rejectedApplication: IOrganizationUpdateApplication;
  setUpdateApplication: ISetState<IOrganizationUpdateApplication>;
}

const SellerOrganizationContentEdit: FC<IProps> = ({
  organization,
  setEditModeEnabled,
  rejectedApplication,
  setUpdateApplication,
}) => {
  const [form] = Form.useForm();

  const [state, setState] = useState({
    ...getOrgFormData(organization, true),
    'org.formEnabled': true,
    'org.offerForSuppliers': true,
    'org.supplyAgreementRules': true,
  });

  const [branches, setBranches] = useState({
    list: organization.branches.map(el => {
      return {
        id: el.id,
        organizationId: el.organizationId,
        actualAddressId: el.actualAddressId,
        actualAddress: el.actualAddress,
        isMain: el.isMain,
        kpp: el.kpp,
        bankName: el.bankName,
        bankInn: el.bankInn,
        bankBik: el.bankBik,
        bankKs: el.bankKs,
        bankRs: el.bankRs,
      };
    }),
    index: 0,
  });

  const [fileList, setFileList] = useState({
    org: REGISTER_ORG_FILE_LIST.map(localFile => {
      const file = organization.files.find(el => el.label === localFile.label);
      return {
        label: localFile.label,
        name: localFile.name,
        localFile: file ? (file.file as any) : null,
        file: file ? file.file : null,
        entityTypes: localFile.entityTypes,
        type: localFile.type,
        path: localFile.path,
        checked: localFile.type === 'check',
        disabled: localFile.type === 'check',
      } as IRegisterFileExtended;
    }),
  });

  const uploadFile = async (
    e: ChangeEvent<HTMLInputElement>,
    type: 'user' | 'org',
    label: string,
  ) => {
    uploadRegisterFile({
      e,
      type,
      label,
      fileList,
      setFileList,
    });
  };

  const deleteFile = async (type: 'user' | 'org', label: string) => {
    setFileList(prev => ({
      org: prev.org.map(orgFile => ({
        ...orgFile,
        localFile: orgFile.label === label ? null : orgFile.localFile,
        file: orgFile.label === label ? null : orgFile.file,
      })),
    }));
  };

  const handleFormSubmit = async (values: any) => {
    const data = deepenObject(values);

    data.org.entityCode = ORGANIZATION_TYPES?.[data?.org?.entityType];
    data.org.files = fileList.org.filter(orgFile => !!orgFile.file);

    // Передаем id филиала
    data.org.branchId = branches?.list[branches?.index]?.id || null;

    const res = await APIRequest({
      method: 'post',
      url: API_ENDPOINTS.ORGANIZATION_UPDATE_APPLICATION,
      data: {
        organization: data.org,
      },
      params: {
        organizationId: organization.id,
      },
      requireAuth: true,
    });
    if (!res.isSucceed) {
      openNotification(res?.message);
      return;
    }
    const resData: {
      organizationUpdateApplication: IOrganizationUpdateApplication;
    } = res.data;

    openNotification(
      'Данные будут обновлены после подтверждения администратором',
    );
    setEditModeEnabled(false);
    setUpdateApplication(resData.organizationUpdateApplication);
    setFileList({
      org: REGISTER_ORG_FILE_LIST.map(localFile => {
        const file = organization.files.find(
          el => el.label === localFile.label,
        );
        return {
          label: localFile.label,
          name: localFile.name,
          localFile: file ? (file.file as any) : null,
          file: file ? file.file : null,
          entityTypes: localFile.entityTypes,
          type: localFile.type,
          path: localFile.path,
        } as IRegisterFileExtended;
      }),
    });
  };

  return (
    <Container size="small" noPadding style={{ margin: 0 }}>
      {!!rejectedApplication && (
        <div>
          <h3>Причина отказа последней заявки</h3>
          <Alert
            message={rejectedApplication?.rejectionMessage}
            className="mb-20"
          />
        </div>
      )}
      <Form
        className="register-form"
        form={form}
        initialValues={{
          ...state,
        }}
        onFinish={handleFormSubmit}
      >
        <OrganizationFormFragment
          form={form}
          branches={branches}
          setBranches={setBranches}
          fileList={fileList.org}
          state={state}
          setState={setState}
          uploadFile={uploadFile}
          deleteFile={deleteFile}
          searchByInnEnabled={false}
        />
        <div className="d-flex mt-20">
          <Button
            className="gray mr-10"
            style={{ width: '50%' }}
            onClick={() => setEditModeEnabled(false)}
          >
            Отмена
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            className="gray"
            style={{ width: '50%' }}
            onClick={() => {
              form
                .validateFields()
                .then(() => {})
                .catch(() => {
                  openNotification('Не все поля корректно заполнены');
                });
            }}
          >
            Сохранить
          </Button>
        </div>
      </Form>
    </Container>
  );
};

export default SellerOrganizationContentEdit;
