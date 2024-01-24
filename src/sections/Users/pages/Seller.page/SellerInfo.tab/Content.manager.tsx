import { Button, ConfigProvider, DatePicker, Form, Input, Modal } from 'antd';
import antdLocale from 'antd/lib/locale/ru_RU';
import { Container, KeyValueItem } from 'components/common';
import { ISetState } from 'interfaces/common.interfaces';
import { ChangeEvent, FC, Fragment, useEffect, useMemo, useState } from 'react';
import RegisterFileList from 'sections/Auth/components/RegisterFileList';
import { REGISTER_SELLER_FILE_LIST } from 'sections/Auth/data';
import { IRegisterFileExtended } from 'sections/Auth/interfaces';
import { uploadRegisterFile } from 'sections/Auth/utils';
import { getOrgSellerFormData } from 'sections/Organizations/utils';
import { ISellerUpdateApplication, IUser } from 'sections/Users/interfaces';
import { getSellerUpdateApplicationFormData } from 'sections/Users/utils';
import { deepenObject } from 'utils/object.utils';
import { APIRequest } from 'utils/api.utils';
import { API_ENDPOINTS } from 'data/paths.data';
import { openNotification } from 'utils/common.utils';
import { useRouter } from 'next/router';
import { useNotifications } from 'hooks/notifications.hooks';
import moment from 'moment';
import { IOrganizationBranch } from 'sections/Organizations/interfaces';
import SimplifiedRegSeller from 'sections/Organizations/components/OrganizationSellerFormFragment/simplifiedRegSeller';

interface IProps {
  user: IUser;
  refundsNumber: number;
  updateApplication: ISellerUpdateApplication;
  setUpdateApplication: ISetState<ISellerUpdateApplication>;
  orgBranches: IOrganizationBranch[];
}

const SellerInfoTabContentManager: FC<IProps> = ({
  user,
  refundsNumber,
  updateApplication,
  setUpdateApplication,
  orgBranches,
}) => {
  const { fetchUnreadNotificationsCount } = useNotifications();
  const DatePickerUntyped = DatePicker as any;

  const [fileList, setFileList] = useState<{
    [key: string]: IRegisterFileExtended[];
  }>({
    user: REGISTER_SELLER_FILE_LIST.map(file => {
      const userFile = (
        !!updateApplication ? updateApplication.files : user.sellerRegisterFiles
      )?.find(el => el.label === file.label);
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
  const [state, setState] = useState({
    ...getSellerUpdateApplicationFormData(updateApplication),
    'user.personalDataProcessing': true,
    'user.agencyContract': true,
  });
  const [rejection, setRejection] = useState({
    modalVisible: false,
    text: '',
  });
  const [sellerOfferDoc, setSellerOfferDoc] = useState<{
    name: string;
    date: moment.Moment;
  }>({
    name: user?.sellerOfferDocName || '',
    date: !!user?.sellerOfferDocDate ? moment(user?.sellerOfferDocDate) : null,
  });
  const [sellerOfferDocUpdateAwaiting, setSellerOfferDocUpdateAwaiting] =
    useState(false);

  const router = useRouter();
  const [form] = Form.useForm();

  const comparedData = useMemo(
    () => ({
      ...getOrgSellerFormData(user),
    }),
    [],
  );

  useEffect(() => {
    const notifications = user?.unreadNotifications.filter(
      el => el.type === 'sellerUpdateApplicationCreated',
    );
    if (!notifications.length) return;

    const notificationIds = notifications.map(({ id }) => id);
    APIRequest({
      method: 'post',
      url: API_ENDPOINTS.NOTIFICATION_UNREAD,
      data: {
        notificationIds: notifications.map(({ id }) => id),
      },
      requireAuth: true,
    }).then(async res => {
      if (!res.isSucceed) return;
      await fetchUnreadNotificationsCount(notificationIds);
    });
  }, [user?.id]);

  const disabledDate = (current: moment.Moment) => {
    return current > moment(new Date());
  };

  const changeSellerOfferDocName = (value: string) => {
    setSellerOfferDoc(prev => ({
      ...prev,
      name: value,
    }));
  };

  const changeSellerOfferDocDate = (value: moment.Moment) => {
    setSellerOfferDoc(prev => ({
      ...prev,
      date: value,
    }));
  };

  const updateSellerOfferDoc = async () => {
    if (
      (!!sellerOfferDoc?.name?.trim()?.length && !sellerOfferDoc.date) ||
      (!sellerOfferDoc?.name?.trim()?.length && !!sellerOfferDoc.date)
    ) {
      openNotification(
        'Название и дата документы должны быть заполнены или пусты',
      );
      return;
    }

    setSellerOfferDocUpdateAwaiting(true);
    const res = await APIRequest({
      method: 'patch',
      url: API_ENDPOINTS.SELLER_OFFER_DOC,
      data: {
        userId: user.id,
        sellerOfferDoc: {
          name: sellerOfferDoc.name.trim(),
          date: sellerOfferDoc.date,
        },
      },
      requireAuth: true,
    });
    setSellerOfferDocUpdateAwaiting(false);
    if (!res.isSucceed) {
      openNotification(res?.message);
      return;
    }
    openNotification(res?.data?.message);
  };

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
    let data = null;
    data = deepenObject(values);

    // Seller user id
    data.user.id = user.id;

    // Add seller's files to request body
    /* data.user.sellerRegisterFiles = fileList.user.filter(
      regFile => !!regFile.file,
    ); */

    // Passport getting date
    /* if (!!data.user?.requisites) {
      data.user.requisites.passportGettingDate = parseDate(
        data.user.requisites.passportGettingDate,
        'P',
        new Date(),
        { locale: dateLocaleRu },
      );
    } */

    const res = await APIRequest({
      method: 'post',
      url: API_ENDPOINTS.CONFIRM_SELLER_UPDATE_APPLICATION(user.id),
      data,
      requireAuth: true,
    });
    if (!res.isSucceed) {
      openNotification(res?.message);
      return;
    }

    openNotification('Данные продавца обновлены');
    setUpdateApplication(null);
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

    const reloadTimeout = setTimeout(() => {
      router.reload();
    }, 500);
    return () => clearTimeout(reloadTimeout);
  };

  const handleReject = async () => {
    if (!rejection?.text?.trim()?.length) {
      openNotification('Необходимо указать причину отказа');
      return;
    }

    const res = await APIRequest({
      method: 'post',
      url: API_ENDPOINTS.REJECT_SELLER_UPDATE_APPLICATION(user.id),
      data: {
        rejectionMessage: rejection.text,
      },
      requireAuth: true,
    });
    if (!res.isSucceed) {
      openNotification(res?.message);
      return;
    }

    openNotification('Заявка на обновление данных продавца отклонена');
    setUpdateApplication(null);
    setRejection({
      modalVisible: false,
      text: '',
    });
  };

  if (!updateApplication) {
    return (
      <Form
        initialValues={{
          ...state,
        }}
      >
        <div className="d-table">
          <div className="row row--content">
            <div className="col col--content" style={{ maxWidth: 300 }}>
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
            <div className="col col--content ml-30" style={{ maxWidth: 250 }}>
              {!!user?.requisites && (
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
            <div className="col col--content">
              <div className="d-flex">
                <div className="d-flex one-line-text">
                  <div className="mr-5">Договор №</div>
                  <Input
                    size="small"
                    value={sellerOfferDoc.name}
                    onChange={e => changeSellerOfferDocName(e.target.value)}
                  />
                </div>
                <div className="d-flex ml-20">
                  <div className="mr-5">от</div>
                  <ConfigProvider locale={antdLocale}>
                    <DatePickerUntyped
                      value={sellerOfferDoc.date}
                      format="DD.MM.YYYY"
                      size="small"
                      onChange={(value: moment.Moment) =>
                        changeSellerOfferDocDate(value)
                      }
                      disabledDate={disabledDate}
                      style={{
                        width: 140,
                      }}
                    />
                  </ConfigProvider>
                </div>
              </div>
              <div className="d-flex justify-content-end mt-20">
                <Button
                  type="primary"
                  onClick={updateSellerOfferDoc}
                  loading={sellerOfferDocUpdateAwaiting}
                >
                  Сохранить
                </Button>
              </div>

              {!!orgBranches?.length && (
                <Fragment>
                  <div className="mb-10">
                    {orgBranches?.length <= 1 ? 'Филиал' : 'Филиалы'}
                  </div>
                  {orgBranches.map((branch, branchIndex) => (
                    <div key={branch.id} className="mb-15">
                      {branchIndex > 0 && <hr className="mb-10" />}
                      <div>Россия</div>
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
                </Fragment>
              )}
            </div>
          </div>
        </div>
      </Form>
    );
  } else {
    return (
      <Container size="small" noPadding style={{ margin: 0 }}>
        <Form
          className="register-form"
          form={form}
          initialValues={{
            ...state,
          }}
          onFinish={handleFormSubmit}
          style={{ maxWidth: 300 }}
        >
          <h2 className="mb-10">Заявка на обновление данных</h2>
          <SimplifiedRegSeller
            state={state}
            fileList={fileList.user}
            advanced
            phoneDisabled={false}
            comparedData={comparedData}
          />
          <div className="d-flex mt-20">
            <Button
              className="gray mr-10"
              style={{ width: 150 }}
              onClick={() =>
                setRejection(prev => ({
                  ...prev,
                  modalVisible: true,
                }))
              }
            >
              Отклонить
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              className="gray"
              style={{ width: 150 }}
              onClick={() => {
                form
                  .validateFields()
                  .then(() => {})
                  .catch(() => {
                    openNotification('Не все поля корректно заполнены');
                  });
              }}
            >
              Подтвердить
            </Button>
          </div>
        </Form>

        <Modal
          open={rejection.modalVisible}
          onCancel={() =>
            setRejection(prev => ({
              ...prev,
              modalVisible: false,
            }))
          }
          centered
          title="Укажите причину отказа"
          footer={null}
          className="footer-hidden"
          width={500}
        >
          <Input.TextArea
            value={rejection.text}
            onChange={e =>
              setRejection(prev => ({
                ...prev,
                text: e.target.value,
              }))
            }
            className="w-100"
            style={{
              minHeight: 100,
            }}
          />
          <div className="d-flex justify-content-end mt-15">
            <Button
              type="primary"
              className="gray"
              style={{ width: 150 }}
              onClick={() => handleReject()}
              disabled={!rejection?.text?.trim()?.length}
            >
              Отклонить
            </Button>
          </div>
        </Modal>
      </Container>
    );
  }
};

export default SellerInfoTabContentManager;
