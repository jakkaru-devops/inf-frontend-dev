import { Avatar, Button } from 'antd';
import { MessageOutlined } from '@ant-design/icons';
import {
  BreadCrumbs,
  Page,
  PageContent,
  PageTop,
  Summary,
  TabGroup,
} from 'components/common';
import { startChatWithUser } from 'components/complex/Messenger/utils/messenger.utils';
import { APP_PATHS } from 'data/paths.data';
import { useLocale } from 'hooks/locale.hook';
import { useModalsState } from 'hooks/modal.hook';
import { useRouter } from 'next/router';
import { FC, useContext, useEffect, useState } from 'react';
import Error404Page from 'sections/Errors/pages/Error404.page';
import ComplainModal from 'sections/Users/components/ComplainModal';
import { ICustomerCounters, IUser } from 'sections/Users/interfaces';
import { getUserName } from 'sections/Users/utils';
import { generateUrl } from 'utils/common.utils';
import CustomerInfoTab from './CustomerInfo.tab';
import CustomerOrganizationListTab from './CustomerOrganizationList.tab';
import { defineCustomerCardTabs } from './data';
import { Context } from './context';
import CustomerComplaintsTab from './CustomerComplaints.tab';
import CustomerAddOrganization from './CustomerAddOrganization';
import CustomerOrganization from './CustomerOrganization';
import { useHandlers } from './CustomerInfo.tab/handlers';
import { AvatarUpload } from 'components/common/FileUpload/AvatarUpload';
import { fileUrl } from 'utils/api.utils';
import { millisecondsToMdhm } from 'utils/common.utils';
import AvatarModal from 'sections/Users/components/AvatarModal';
import CustomerContractsTab from './CustomerContracts.tab';
import { useAuth } from 'hooks/auth.hook';

interface IProps {
  user: IUser;
  setUser: (user: IUser) => void;
  counters: ICustomerCounters;
}

const CustomerPageContent: FC<IProps> = ({ user, setUser, counters }) => {
  const auth = useAuth();
  const router = useRouter();
  const { locale } = useLocale();
  const { Modal, openModal } = useModalsState();
  const PunishModal = Modal;
  const { handleAvatarUpdate, avatarModalVisible, setAvatarModalVisible } =
    useHandlers({ user, setUser });
  const { summaryContentLeft, setSummaryContentLeft } = useContext(Context);
  const [complainModalVisible, setComplainModalVisible] = useState(false);

  const tab = (router?.query?.tab || '') as string;
  const userCustomerRole = user?.roles?.find(
    role => role?.role?.label === 'customer',
  );

  useEffect(() => {
    setSummaryContentLeft(null);
  }, [tab]);

  const defineTab = () => {
    switch (tab) {
      case '':
      case 'info':
        return (
          <CustomerInfoTab user={user} setUser={setUser} counters={counters} />
        );
      case 'organizations':
        if (router.query.organizationId) {
          if (router.query.organizationId === 'add') {
            return <CustomerAddOrganization />;
          } else {
            return <CustomerOrganization />;
          }
        } else {
          return <CustomerOrganizationListTab user={user} />;
        }
      case 'complaints':
        return <CustomerComplaintsTab user={user} />;
      case 'contracts':
        return <CustomerContractsTab user={user} />;
      default:
        return <Error404Page />;
    }
  };

  const showSummary =
    auth?.currentRole?.label === 'seller' || !!summaryContentLeft;

  return (
    <Page>
      <BreadCrumbs
        list={[
          {
            link: APP_PATHS.CUSTOMER(router.query?.userId as string),
            text: getUserName(user),
          },
        ]}
      />
      <PageTop
        title={
          <>
            <div className="d-flex" style={{ alignItems: 'center' }}>
              {auth?.currentRole?.label === 'customer' ? (
                !user.avatar ? (
                  <AvatarUpload onUploaded={handleAvatarUpdate} />
                ) : (
                  <div onClick={() => setAvatarModalVisible(true)}>
                    <Avatar
                      alt="avatar"
                      className="ant-avatar-upload"
                      style={{
                        height: 98,
                        width: 98,
                        marginRight: 15,
                      }}
                      src={fileUrl(user.avatar)}
                    />
                  </div>
                )
              ) : (
                <></>
              )}
              <h2 className="text_38 mb-10">
                {auth?.currentRole?.label === 'customer' ? (
                  locale.common.accountSettings
                ) : (
                  <>
                    {!!user?.avatar && (
                      <Avatar
                        alt="avatar"
                        style={{
                          height: 98,
                          width: 98,
                          marginRight: 15,
                          cursor: 'default',
                        }}
                        src={fileUrl(user.avatar)}
                      />
                    )}
                    {getUserName(user)}
                  </>
                )}
              </h2>
            </div>
            {['manager', 'operator'].includes(auth?.currentRole?.label) && (
              <div className="d-flex align-items-center mt-20 mb-15">
                <Button
                  type="primary"
                  size="large"
                  className="mr-15"
                  onClick={() => openModal('punish')}
                >
                  {'Принять меры'}{' '}
                  <img src="/img/icons/punish-user-white.svg" alt="" />
                </Button>
                <Button
                  type="primary"
                  size="large"
                  onClick={() =>
                    startChatWithUser({
                      companionId: user.id,
                      companionRole: 'customer',
                    })
                  }
                >
                  {'Чат с покупателем'} <MessageOutlined />
                </Button>
                {!!userCustomerRole?.bannedUntil ? (
                  <span className="ml-15">Аккаунт заблокирован</span>
                ) : (
                  <>
                    {!!userCustomerRole?.requestsBannedUntil && (
                      <span className="ml-15">
                        Запросы разблокируются через:{' '}
                        {millisecondsToMdhm(
                          new Date(
                            userCustomerRole.requestsBannedUntil,
                          ).getTime() - new Date().getTime(),
                          locale,
                          false,
                        )}
                      </span>
                    )}
                  </>
                )}
              </div>
            )}
          </>
        }
      />
      <PageContent style={{ paddingTop: 0 }}>
        <TabGroup
          list={defineCustomerCardTabs(user)
            .filter(item => item.access.includes(auth?.currentRole?.label))
            .map(item => ({
              label: item.label,
              title: item.title,
              isActive: tab === item.label,
              access: item.access,
              href: generateUrl({ tab: item.label, page: null }),
            }))}
          style={{ marginBottom: 0 }}
        >
          {defineTab()}
        </TabGroup>
      </PageContent>
      {showSummary && (
        <Summary containerClassName="d-flex justify-content-between">
          <div>{summaryContentLeft}</div>
          <div>
            {auth?.currentRole?.label === 'seller' && (
              <Button
                type="primary"
                size="large"
                onClick={() => setComplainModalVisible(true)}
              >
                Пожаловаться
              </Button>
            )}
          </div>
        </Summary>
      )}

      {auth?.currentRole?.label === 'customer' && (
        <AvatarModal
          open={avatarModalVisible}
          onCancel={() => setAvatarModalVisible(false)}
          handleAvatarUpdate={handleAvatarUpdate}
        />
      )}

      {auth?.currentRole?.label === 'seller' && (
        <ComplainModal
          open={complainModalVisible}
          onCancel={() => setComplainModalVisible(false)}
          defendantId={user.id}
          defendantRoleLabel={'customer'}
        />
      )}

      {['manager', 'operator'].includes(auth?.currentRole?.label) && (
        <PunishModal
          user={user}
          userRole={
            user.roles.find(({ label }) => label === 'customer') ||
            user.roles.find(({ role }) => role.label === 'customer')
          }
          roleLabel="customer"
        />
      )}
    </Page>
  );
};

export default CustomerPageContent;
