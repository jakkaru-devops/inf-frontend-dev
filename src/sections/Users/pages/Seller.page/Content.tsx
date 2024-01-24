import {
  BreadCrumbs,
  Page,
  PageContent,
  PageTop,
  TabGroup,
  Summary,
  RateString,
  Link,
} from 'components/common';
import { APP_PATHS } from 'data/paths.data';
import { useRouter } from 'next/router';
import Error404Page from 'sections/Errors/pages/Error404.page';
import { defineSellerCardTabs } from './data';
import { IUser } from 'sections/Users/interfaces';
import { getUserName } from 'sections/Users/utils';
import SellerInfoTab from './SellerInfo.tab';
import SellerOrganizationListTab from './SellerOrganizationList.tab';
import { generateUrl } from 'utils/common.utils';
import SellerReviewListTab from './SellerReviewList.tab';
import SellerTransportCompaniesCustomerTab from './SellerTransportCompanies.customer.tab';
import SellerTransportCompaniesSellerTab from './SellerTransportCompanies.seller.tab';
import SellerComplaintsTab from './SellerComplaints.tab';
import { FC, useContext, useEffect, useState } from 'react';
import { Context } from './context';
import { Avatar, Button } from 'antd';
import { MessageOutlined } from '@ant-design/icons';
import ComplainModal from 'sections/Users/components/ComplainModal';
import { useModalsState } from 'hooks/modal.hook';
import { useLocale } from 'hooks/locale.hook';
import { startChatWithUser } from 'components/complex/Messenger/utils/messenger.utils';
import SellerAddOrganization from './SellerAddOrganization';
import SellerOrganization from './SellerOrganization';
import { AvatarUpload } from 'components/common/FileUpload/AvatarUpload';
import { fileUrl } from 'utils/api.utils';
import { useHandlers } from './handlers';
import { millisecondsToMdhm } from 'utils/common.utils';
import AvatarModal from 'sections/Users/components/AvatarModal';
import SpecialClientsTab from './SpecialClients.tab';
import { useAuth } from 'hooks/auth.hook';

interface IProps {
  user: IUser;
  setUser: (user: IUser) => void;
  refundsNumber: number;
}

const SellerPageContent: FC<IProps> = ({ user, refundsNumber, setUser }) => {
  const auth = useAuth();
  const { locale } = useLocale();
  const router = useRouter();
  const { Modal, openModal } = useModalsState();
  const PunishModal = Modal;
  const tab = (router?.query?.tab || '') as string;
  const { summaryContentLeft, setSummaryContentLeft } = useContext(Context);
  const [complainModalVisible, setComplainModalVisible] = useState(false);
  const { handleAvatarUpdate, avatarModalVisible, setAvatarModalVisible } =
    useHandlers({ user, setUser });
  const userSellerRole = user?.roles?.find(
    role => role?.role?.label === 'seller',
  );

  useEffect(() => {
    setSummaryContentLeft(null);
  }, [tab]);

  const defineTab = () => {
    switch (tab) {
      case '':
      case 'info':
        return <SellerInfoTab user={user} refundsNumber={refundsNumber} />;
      case 'organizations':
        if (router.query.organizationId) {
          if (router.query.organizationId === 'add') {
            return <SellerAddOrganization user={user} />;
          } else {
            return <SellerOrganization />;
          }
        } else {
          return <SellerOrganizationListTab user={user} />;
        }
      case 'reviews':
        return <SellerReviewListTab user={user} />;
      case 'transport-companies':
        if (
          ['customer', 'manager', 'operator'].includes(auth?.currentRole?.label)
        )
          return <SellerTransportCompaniesCustomerTab user={user} />;
        if (auth?.currentRole?.label === 'seller')
          return <SellerTransportCompaniesSellerTab user={user} />;
      case 'complaints':
        return <SellerComplaintsTab user={user} />;
      case 'specialClients':
        return <SpecialClientsTab user={user} />;
      default:
        return <Error404Page />;
    }
  };

  const showSummary =
    auth?.currentRole?.label === 'customer' || !!summaryContentLeft;

  return (
    <Page>
      <BreadCrumbs
        list={[
          {
            link: APP_PATHS.SELLER(router.query?.userId as string),
            text: getUserName(user),
          },
        ]}
      />
      <PageTop
        title={
          <>
            <div className="d-flex" style={{ alignItems: 'center' }}>
              {auth?.currentRole?.label === 'seller' ? (
                !user.avatar ? (
                  <AvatarUpload onUploaded={handleAvatarUpdate} />
                ) : (
                  <div onClick={() => setAvatarModalVisible(true)}>
                    <Avatar
                      alt="avatar"
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
              {auth?.currentRole?.label === 'seller' ? (
                <h2 className="text_38 mb-10">
                  {locale.common.accountSettings}
                </h2>
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
                  <div>
                    <h2 className="text_38 mb-10">{getUserName(user)}</h2>
                    <Link href={generateUrl({ tab: 'reviews' })}>
                      <RateString
                        color={'#FFB800'}
                        emptyColor={'#c4c4c4'}
                        rate={(user.ratingValue || 0).gaussRound(1)}
                        max={5}
                        size={20}
                      />
                    </Link>
                  </div>
                </>
              )}
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
                  {'Чат с продавцом'} <MessageOutlined />
                </Button>
                {!!userSellerRole?.bannedUntil ? (
                  <span className="ml-15">Аккаунт заблокирован</span>
                ) : (
                  <>
                    {!!userSellerRole?.requestsBannedUntil && (
                      <span className="ml-15">
                        Запросы разблокируются через:{' '}
                        {millisecondsToMdhm(
                          new Date(
                            userSellerRole.requestsBannedUntil,
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
          list={defineSellerCardTabs(auth)
            .filter(item => item.access.includes(auth?.currentRole?.label))
            .map(item => ({
              label: item.label,
              title: item.title,
              isActive: tab === item.label,
              access: item.access,
              href: generateUrl({ tab: item.label }),
            }))}
        >
          {defineTab()}
        </TabGroup>
      </PageContent>
      {showSummary && (
        <Summary containerClassName="d-flex justify-content-between">
          <div>{summaryContentLeft}</div>
          {auth.currentRole.label === 'customer' && (
            <div>
              <Button
                type="primary"
                size="large"
                onClick={() => setComplainModalVisible(true)}
              >
                Пожаловаться
              </Button>
            </div>
          )}
        </Summary>
      )}

      {auth?.currentRole?.label === 'seller' && (
        <AvatarModal
          open={avatarModalVisible}
          onCancel={() => setAvatarModalVisible(false)}
          handleAvatarUpdate={handleAvatarUpdate}
        />
      )}

      {auth?.currentRole?.label === 'customer' && (
        <ComplainModal
          open={complainModalVisible}
          onCancel={() => setComplainModalVisible(false)}
          defendantId={user.id}
          defendantRoleLabel={'seller'}
        />
      )}

      {['manager', 'operator'].includes(auth?.currentRole?.label) && (
        <PunishModal
          user={user}
          userRole={
            user.roles.find(({ label }) => label === 'seller') ||
            user.roles.find(({ role }) => role.label === 'seller')
          }
          roleLabel="seller"
        />
      )}
    </Page>
  );
};

export default SellerPageContent;
