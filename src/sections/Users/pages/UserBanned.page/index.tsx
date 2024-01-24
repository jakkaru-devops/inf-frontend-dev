import { useEffect } from 'react';
import { APP_PATHS } from 'data/paths.data';
import { useDispatch } from 'react-redux';
import { BreadCrumbs, Page, PageContent } from 'components/common';
import { getUserName } from 'sections/Users/utils';
import { MessageOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { EMPLOYEE_ROLES } from 'sections/Users/data';
import { useLocale } from 'hooks/locale.hook';
import { startChatWithUser } from 'components/complex/Messenger/utils/messenger.utils';
import socketService from 'services/socket';
import { STRINGS } from 'data/strings.data';
import { INotification } from 'hooks/notifications.hooks/interfaces';
import { useNotifications } from 'hooks/notifications.hooks';
import { useRouter } from 'next/router';
import { useAuth } from 'hooks/auth.hook';

const UserBannedPage = () => {
  const auth = useAuth();
  const dispatch = useDispatch();
  const { locale } = useLocale();
  const router = useRouter();
  const { handleNewNotification } = useNotifications();

  const userRole =
    auth.isAuthenticated &&
    auth.user.roles.find(({ id }) => id === auth.currentRole.id);

  useEffect(() => {
    socketService.socket
      .off(STRINGS.SERVER_NEW_NOTIFICATION)
      .on(
        STRINGS.SERVER_NEW_NOTIFICATION,
        async (notification: INotification) => {
          handleNewNotification(notification);

          if (
            notification?.type === 'userRoleUnbanned' &&
            notification?.roleId === auth.currentRole.id
          ) {
            router.reload();
          }
        },
      );
  }, []);

  return (
    <Page>
      <BreadCrumbs
        list={[{ link: APP_PATHS.BAN, text: locale.user.accountIsBlocked }]}
        showPersonalAreaLink={false}
      />
      <PageContent className="h-100-flex align-items-center justify-content-center text-center">
        <h2 className="text_38 mb-50">{getUserName(auth.user, 'full')}</h2>
        <span className="block text_38 mb-20">
          {locale.other.yours} {locale.other.pageBlocked}{' '}
          {EMPLOYEE_ROLES.includes(auth?.currentRole?.label)
            ? locale.other.bySuperadmin
            : locale.other.siteManager}
          . <br />
          {userRole?.bannedReason &&
            'Причина: ' +
              userRole.bannedReason
                .map(reason => locale.complaint.reasons[reason])
                .join(', ')}
        </span>

        {EMPLOYEE_ROLES.includes(auth?.currentRole?.label) ? (
          <Button type="primary" size="large" className="mb-50">
            {'Чат с суперадмином'} <MessageOutlined />
          </Button>
        ) : (
          <Button
            onClick={() =>
              startChatWithUser({
                companionId: null,
                companionRole: null,
                chatId: 'support',
                dispatch,
              })
            }
            type="primary"
            size="large"
            className="mb-50"
          >
            {'Чат с менеджером'} <MessageOutlined />
          </Button>
        )}
      </PageContent>
    </Page>
  );
};

export default UserBannedPage;
