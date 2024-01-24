import { Alert, Button, Form } from 'antd';
import { Container, KeyValueItem } from 'components/common';
import { API_ENDPOINTS } from 'data/paths.data';
import { ChangeEvent, FC, Fragment, useEffect, useState } from 'react';
import RegisterFileList from 'sections/Auth/components/RegisterFileList';
import { REGISTER_SELLER_FILE_LIST } from 'sections/Auth/data';
import { IRegisterFileExtended } from 'sections/Auth/interfaces';
import { uploadRegisterFile } from 'sections/Auth/utils';
import { getOrgSellerFormData } from 'sections/Organizations/utils';
import { ISellerUpdateApplication, IUser } from 'sections/Users/interfaces';
import { APIRequest } from 'utils/api.utils';
import { openNotification } from 'utils/common.utils';
import { deepenObject } from 'utils/object.utils';
import parseDate from 'date-fns/parse';
import { ru as dateLocaleRu } from 'date-fns/locale';
import classNames from 'classnames';
import { ISetState } from 'interfaces/common.interfaces';
import { IOrganizationBranch } from 'sections/Organizations/interfaces';
import SimplifiedRegSeller from 'sections/Organizations/components/OrganizationSellerFormFragment/simplifiedRegSeller';

interface IProps {
  user: IUser;
  refundsNumber: number;
  updateApplication: ISellerUpdateApplication;
  setUpdateApplication: ISetState<ISellerUpdateApplication>;
  orgBranches: IOrganizationBranch[];
}

const SellerInfoTabContentSeller: FC<IProps> = ({
  user,
  refundsNumber,
  updateApplication,
  setUpdateApplication,
  orgBranches,
}) => {
  const [fileList, setFileList] = useState<{
    [key: string]: IRegisterFileExtended[];
  }>({
    user: REGISTER_SELLER_FILE_LIST.map(file => {
      const userFile = user?.sellerRegisterFiles?.find(
        el => el.label === file.label,
      );
      return {
        label: file.label,
        name: file.name,
        localFile: userFile?.file as any,
        file: userFile?.file,
        type: file.type,
        path: file.path,
        checked: file?.type === 'check',
        disabled: file?.type === 'check',
      };
    }),
  });
  const [editModeEnabled, setEditModeEnabled] = useState(false);

  const [form] = Form.useForm();
  const [state, setState] = useState({
    ...getOrgSellerFormData(user),
    'user.personalDataProcessing': true,
    'user.agencyContract': true,
  });
  const [rejectedApplication, setRejectedApplication] =
    useState<ISellerUpdateApplication>(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await APIRequest({
        method: 'get',
        url: API_ENDPOINTS.SELLER_UPDATE_APPLICATION(user.id),
        params: {
          status: 'any',
        },
        requireAuth: true,
      });
      const applicationData: ISellerUpdateApplication =
        res?.data?.sellerUpdateApplication;
      if (!!applicationData?.rejectedAt) {
        setRejectedApplication(applicationData || null);
      }
    };
    fetchData();
  }, []);

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
      user: prev.user.map(regFile => ({
        ...regFile,
        localFile: regFile.label === label ? null : regFile.localFile,
        file: regFile.label === label ? null : regFile.file,
      })),
    }));
  };

  const handleFormSubmit = async (values: any) => {
    const data = deepenObject(values);

    // Seller user id
    data.user.id = user.id;

    // Add seller's files to request body
    data.user.sellerRegisterFiles = fileList.user.filter(
      regFile => !!regFile.file,
    );

    // Passport getting date
    if (!!data?.user?.requisites) {
      data.user.requisites.passportGettingDate = parseDate(
        data.user.requisites.passportGettingDate,
        'P',
        new Date(),
        {
          locale: dateLocaleRu,
        },
      );
    }

    const res = await APIRequest({
      method: 'post',
      url: API_ENDPOINTS.SELLER_UPDATE_APPLICATION(user.id),
      data,
      requireAuth: true,
    });
    if (!res.isSucceed) {
      openNotification(res?.message);
      return;
    }
    const resData: { sellerUpdateApplication: ISellerUpdateApplication } =
      res.data;

    openNotification(
      'Данные будут обновлены после подтверждения администратором',
    );
    setEditModeEnabled(false);
    setUpdateApplication(resData.sellerUpdateApplication);
    setFileList({
      user: user.sellerRegisterFiles.map(
        file =>
          ({
            label: file.label,
            name: REGISTER_SELLER_FILE_LIST.find(el => el.label === file.label)
              .name,
            localFile: file.file as any,
            file: file.file,
            type: 'upload',
          } as IRegisterFileExtended),
      ),
    });
  };

  if (!editModeEnabled) {
    return (
      <Form
        initialValues={{
          ...state,
        }}
      >
        <div className="d-table">
          <div className="row row--content">
            <div className="col col--content">
              <KeyValueItem
                keyText="ФИО"
                value={
                  <>
                    <div>{user.lastname}</div>
                    <div>{user.firstname}</div>
                    <div>{user.middlename}</div>
                  </>
                }
                inline={false}
                noColon={true}
                keyClassName="text-normal"
              />
              <br />
              <br />

              {!!user?.requisites && (
                <Fragment>
                  <KeyValueItem
                    keyText="Паспорт"
                    value={
                      <>
                        <KeyValueItem
                          keyText="Серия"
                          value={user?.requisites?.passportSeries}
                          keyClassName="text-normal"
                        />
                        <KeyValueItem
                          keyText="Номер"
                          value={user?.requisites?.passportNumber}
                          keyClassName="text-normal"
                        />
                        <KeyValueItem
                          keyText="Кем выдан"
                          value={user?.requisites?.passportGiver}
                          keyClassName="text-normal"
                        />
                        <KeyValueItem
                          keyText="Дата выдачи"
                          value={user?.requisites?.passportGettingDate}
                          keyClassName="text-normal"
                        />
                        <KeyValueItem
                          keyText="Код под-ия"
                          value={user?.requisites?.passportLocationUnitCode}
                          keyClassName="text-normal"
                        />
                      </>
                    }
                    inline={false}
                    noColon={true}
                    keyClassName="text-normal"
                    className="mb-20"
                  />
                  <br />

                  <KeyValueItem
                    keyText="ИНН"
                    value={user?.requisites?.inn}
                    keyClassName="text-normal"
                  />
                  <KeyValueItem
                    keyText="СНИЛС"
                    value={user?.requisites?.snils}
                    keyClassName="text-normal"
                  />
                  <br />

                  <KeyValueItem
                    keyText="Адрес прописки"
                    value={
                      <>
                        <div>Россия</div>
                        <div>
                          {[user?.address?.settlement]
                            .filter(Boolean)
                            .join(', ')
                            .trimEnd()}
                        </div>
                        <div>
                          {[
                            user?.address?.street,
                            user?.address?.building,
                            user?.address?.apartment,
                          ]
                            .filter(Boolean)
                            .join(', ')}
                        </div>
                      </>
                    }
                    inline={false}
                    noColon={true}
                    keyClassName="text-normal"
                  />
                </Fragment>
              )}
            </div>
            <div className="col col--content ml-30" style={{ maxWidth: 300 }}>
              {!!user?.requisites && (
                <Fragment>
                  <KeyValueItem
                    keyText="Банковские реквизиты"
                    value={
                      <>
                        <KeyValueItem
                          keyText="Наименование банка"
                          value={user?.requisites?.bankName}
                          keyClassName="text-normal"
                        />
                        <KeyValueItem
                          keyText="БИК банка"
                          value={user?.requisites?.bankBik}
                          keyClassName="text-normal"
                        />
                        <KeyValueItem
                          keyText="К/с банка"
                          value={user?.requisites?.bankKs}
                          keyClassName="text-normal"
                        />
                        <KeyValueItem
                          keyText="Р/с банка"
                          value={user?.requisites?.bankRs}
                          keyClassName="text-normal"
                        />
                      </>
                    }
                    inline={false}
                    noColon={true}
                    keyClassName="text-normal"
                    className="mb-15"
                  />
                </Fragment>
              )}

              <KeyValueItem
                keyText="Телефон"
                value={user?.phone}
                keyClassName="text-normal"
                className="mb-15"
              />
              <KeyValueItem
                keyText="E-mail"
                value={user?.email}
                keyClassName="text-normal"
                className="mb-15"
              />
              <KeyValueItem
                keyText="Почта для уведомлений"
                value={user?.emailNotification}
                keyClassName="text-normal"
                className="mb-15"
              />

              {!!user?.requisites && (
                <RegisterFileList
                  fileList={fileList.user}
                  type="user"
                  uploadFile={() => {}}
                  deleteFile={() => {}}
                  icon={'download'}
                  allowControl={false}
                  disabled={false}
                />
              )}

              <KeyValueItem
                keyText="Количество сделок"
                value={user?.salesNumber || 0}
                keyClassName="text-normal"
                className="mt-15 mb-15"
              />
              <KeyValueItem
                keyText="Количество возвратов"
                value={refundsNumber || 0}
                keyClassName="text-normal"
              />
            </div>
            {!!orgBranches?.length && (
              <div>
                <div className="mb-10">
                  {orgBranches?.length <= 1 ? 'Филиал' : 'Филиалы'}
                </div>
                {orgBranches.map((branch, branchIndex) => (
                  <div key={branch.id} className="mb-15">
                    {branchIndex > 0 && <hr className="mb-10" />}
                    <div>{branch.actualAddress.country}</div>
                    <div>
                      {[branch?.actualAddress?.settlement]
                        .filter(Boolean)
                        .join(', ')
                        .trimEnd()}
                    </div>
                    <div>
                      {[
                        branch?.actualAddress?.street,
                        branch?.actualAddress?.building,
                        branch?.actualAddress?.apartment,
                      ]
                        .filter(Boolean)
                        .join(', ')}
                    </div>
                    {!!branch?.bankName && (
                      <div className="mt-10 mb-5">
                        <div>Наименование банка: {branch.bankName}</div>
                        <div>БИК: {branch.bankBik}</div>
                        <div>К/с: {branch.bankKs}</div>
                        <div>Р/с: {branch.bankRs}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          <Button
            className={classNames('color-white gray mt-15', {
              disabled: !!updateApplication,
            })}
            style={{ width: '100%' }}
            onClick={() => {
              if (!!updateApplication) {
                openNotification(
                  'У вас уже есть активная заявка на обновление данных',
                );
              } else {
                setEditModeEnabled(true);
              }
            }}
          >
            Редактировать
          </Button>
        </div>
      </Form>
    );
  } else {
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
          style={{ maxWidth: 300 }}
        >
          <SimplifiedRegSeller
            state={state}
            fileList={fileList.user}
            advanced
            phoneDisabled={false}
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
  }
};

export default SellerInfoTabContentSeller;
