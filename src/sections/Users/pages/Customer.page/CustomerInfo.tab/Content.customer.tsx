import { Checkbox, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { KeyValueItem } from 'components/common';
import { useLocale } from 'hooks/locale.hook';
import { FC, Fragment, useEffect, useState } from 'react';
import EmailUpdateModal from 'sections/Users/components/EmailUpdateModal';
import PhoneUpdateModal from 'sections/Users/components/PhoneUpdateModal';
import {
  ICustomerCounters,
  IUser,
  IUserDeliveryAddress,
} from 'sections/Users/interfaces';
import { getUserName } from 'sections/Users/utils';
import { formatPhoneNumber, openNotification } from 'utils/common.utils';
import { useHandlers } from './handlers';
import UsernameUpdateModal from 'sections/Users/components/UsernameUpdateModal';
import EmailNotificationUpdateModal from 'sections/Users/components/EmailNotificationUpdateModal';
import DefaultAddressModal from 'sections/Users/components/DefaultAddressModal';
import { useAuth } from 'hooks/auth.hook';
import { useDispatch } from 'react-redux';
import { APIRequest } from 'utils/api.utils';
import { API_ENDPOINTS } from 'data/paths.data';
import { IAddress } from 'interfaces/common.interfaces';
import { setAuthUser } from 'store/reducers/auth.reducer';
import { convertAddressToString } from 'components/common/YandexMap/utils';

interface IProps {
  user: IUser;
  setUser: (user: IUser) => void;
  counters: ICustomerCounters;
}

const CustomerInfoTabContentCustomer: FC<IProps> = ({
  user,
  setUser,
  counters,
}) => {
  const { locale } = useLocale();
  const {
    usernameUpdateModalVisible,
    setUsernameUpdateModalVisible,
    handleUsernameUpdate,
    phoneUpdateModalVisible,
    setPhoneUpdateModalVisible,
    handlePhoneUpdate,
    emailUpdateModalVisible,
    setEmailUpdateModalVisible,
    emailNotificationUpdateModalVisible,
    setEmailNotificationUpdateModalVisible,
    handleEmailUpdate,
    phoneVisibleSubmitting,
    toggleUserPhoneIsHidden,
    toggleEmailNotification,
    handleEmailNotificationUpdate,
    defaultAddressModal,
    setDefaultAddressModal,
  } = useHandlers({ user, setUser });

  const userFullName = getUserName(user, 'full', true);

  const auth = useAuth();
  const dispatch = useDispatch();
  const [deliveryAddresses, setDeliveryAddresses] = useState<
    IUserDeliveryAddress['address']
  >({
    country: 'Россия',
    region: null,
    area: null,
    city: null,
    settlement: null,
    street: null,
    building: null,
    apartment: null,
    postcode: null,
  });

  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (initialized) {
      handlerDefaultAddressUpdate();
    } else {
      setInitialized(true);
    }
  }, [deliveryAddresses, initialized]);

  const handlerDefaultAddressUpdate = async () => {
    const res = await APIRequest({
      method: 'patch',
      url: API_ENDPOINTS.UPDATE_DEFAULT_ADDRESSES,
      data: {
        deliveryAddresses: deliveryAddresses,
        defaultAddressId: user?.deliveryAddresses[0]?.addressId || '',
      },
      requireAuth: true,
    });

    if (!res.isSucceed) {
      openNotification(res.message);
      return;
    }

    const responseData = res?.data;
    const addressResult: IAddress = responseData.address;
    const userResult: IUser = responseData.user;

    const deliveryAddress: any = [
      {
        userId: userResult?.id,
        user: userResult,
        addressId: addressResult?.id,
        address: addressResult,
      },
    ];

    setUser({
      ...user,
      deliveryAddresses: deliveryAddress,
    });
    dispatch(setAuthUser({ ...auth.user, deliveryAddresses: deliveryAddress }));

    openNotification(!!res.isSucceed ? 'Адрес обновлен' : 'Адрес не обновлен');
  };

  return (
    <Fragment>
      <div className="d-flex justify-content-between">
        <div className="left-side">
          <KeyValueItem
            keyText="ФИО"
            value={
              <div className="d-flex">
                {userFullName}
                {!userFullName ? (
                  <span
                    className="color-primary text-underline text-lowercase cursor-pointer user-select-none"
                    onClick={() => setUsernameUpdateModalVisible(true)}
                  >
                    Добавить
                  </span>
                ) : (
                  <span
                    className="color-primary text-underline text-lowercase cursor-pointer user-select-none ml-10"
                    onClick={() => setUsernameUpdateModalVisible(true)}
                  >
                    {locale.common.startEditing}
                  </span>
                )}
              </div>
            }
            className="mb-10"
          />
          <KeyValueItem
            keyText={locale.other.phone}
            value={
              <div className="d-flex">
                {formatPhoneNumber(user.phone)}{' '}
                <span
                  className="color-primary text-underline text-lowercase cursor-pointer user-select-none ml-10"
                  onClick={() => setPhoneUpdateModalVisible(true)}
                >
                  {locale.common.startEditing}
                </span>
                <span
                  className="color-light-gray text-underline text-lowercase cursor-pointer user-select-none ml-10"
                  style={{
                    position: 'relative',
                  }}
                  onClick={() => {
                    if (phoneVisibleSubmitting) return;
                    toggleUserPhoneIsHidden();
                  }}
                >
                  {!user?.phoneIsHidden ? 'Скрывать номер' : 'Показывать номер'}
                  {phoneVisibleSubmitting && (
                    <Spin
                      style={{
                        position: 'absolute',
                        left: '100%',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        marginLeft: 5,
                      }}
                      indicator={
                        <LoadingOutlined
                          style={{ fontSize: 15, color: '#bbb' }}
                        />
                      }
                    />
                  )}
                </span>
              </div>
            }
            className="mb-10"
          />

          <KeyValueItem
            keyText="E-mail"
            value={
              <div className="d-flex">
                {user?.email || ''}
                {!user.email ? (
                  <span
                    className="color-primary text-underline text-lowercase cursor-pointer user-select-none"
                    onClick={() => setEmailUpdateModalVisible(true)}
                  >
                    Добавить
                  </span>
                ) : (
                  <span
                    className="color-primary text-underline text-lowercase cursor-pointer user-select-none ml-10"
                    onClick={() => setEmailUpdateModalVisible(true)}
                  >
                    {locale.common.startEditing}
                  </span>
                )}
              </div>
            }
            className="mb-10"
          />
          <KeyValueItem
            keyText="Адрес доставки по умолчанию"
            value={
              <div className="d-flex">
                {convertAddressToString(user?.deliveryAddresses[0]?.address) ||
                  ''}
                {!convertAddressToString(
                  user?.deliveryAddresses[0]?.address,
                ) ? (
                  <span
                    className="color-primary text-underline text-lowercase cursor-pointer user-select-none"
                    onClick={() => setDefaultAddressModal(true)}
                  >
                    Добавить
                  </span>
                ) : (
                  <span
                    className="color-primary text-underline text-lowercase cursor-pointer user-select-none ml-10"
                    onClick={() => setDefaultAddressModal(true)}
                  >
                    {locale.common.startEditing}
                  </span>
                )}
              </div>
            }
            className="mb-10"
          />
          <KeyValueItem
            keyText={locale.orders.countRequests}
            value={counters.orderRequestsCount}
            className="mb-10"
          />
          <KeyValueItem
            keyText={locale.orders.countPurchases}
            value={counters.ordersCount}
            className="mb-10"
          />
          <KeyValueItem
            keyText="Возвратов"
            value={counters.refundsCount}
            className="mb-10"
          />
          <KeyValueItem
            keyText="Полученных жалоб"
            value={counters.receivedComplaintsCount}
            className="mb-10"
          />
          <KeyValueItem
            keyText="Отправленных жалоб"
            value={counters.sentComplaintsCount}
          />

          <UsernameUpdateModal
            username={{
              lastname: user?.lastname,
              firstname: user?.firstname,
              middlename: user?.middlename,
            }}
            open={usernameUpdateModalVisible}
            onCancel={() => setUsernameUpdateModalVisible(false)}
            onSuccess={handleUsernameUpdate}
          />
          <PhoneUpdateModal
            phone={user.phone}
            open={phoneUpdateModalVisible}
            onCancel={() => setPhoneUpdateModalVisible(false)}
            onSuccess={handlePhoneUpdate}
          />
          <EmailUpdateModal
            email={user.email}
            open={emailUpdateModalVisible}
            onCancel={() => setEmailUpdateModalVisible(false)}
            onSuccess={handleEmailUpdate}
          />
          <EmailNotificationUpdateModal
            email={user.emailNotification}
            open={emailNotificationUpdateModalVisible}
            onCancel={() => setEmailNotificationUpdateModalVisible(false)}
            onSuccess={handleEmailNotificationUpdate}
          />
          <DefaultAddressModal
            address={deliveryAddresses}
            setAddress={setDeliveryAddresses}
            open={defaultAddressModal}
            onCancel={() => setDefaultAddressModal(false)}
            allowControl={true}
            title={locale.orders.deliveryAddress}
          />
        </div>
        <div className="right-side " style={{ width: '270px', height: '60px' }}>
          <Checkbox
            className="ml-0 mr-20 mb-20"
            key={user.id}
            value={user.isAgreeEmailNotification}
            checked={user.isAgreeEmailNotification}
            onChange={toggleEmailNotification}
          >
            Получать уведомления на почту
          </Checkbox>
          <div className="d-flex">
            <KeyValueItem
              keyText="E-mail для уведомлений"
              value={
                <div className="d-flex">
                  {user?.emailNotification || ''}
                  {!user.emailNotification ? (
                    <span
                      className="color-primary text-underline text-lowercase cursor-pointer user-select-none"
                      onClick={() =>
                        setEmailNotificationUpdateModalVisible(true)
                      }
                    >
                      Добавить
                    </span>
                  ) : (
                    <span
                      className="color-primary text-underline text-lowercase cursor-pointer user-select-none ml-10"
                      onClick={() =>
                        setEmailNotificationUpdateModalVisible(true)
                      }
                    >
                      {locale.common.startEditing}
                    </span>
                  )}
                </div>
              }
              className="mb-10"
            />
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default CustomerInfoTabContentCustomer;
