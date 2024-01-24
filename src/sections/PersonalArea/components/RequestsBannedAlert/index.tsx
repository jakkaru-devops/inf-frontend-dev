import { MessageOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { startChatWithUser } from 'components/complex/Messenger/utils/messenger.utils';
import { useAuth } from 'hooks/auth.hook';
import { useLocale } from 'hooks/locale.hook';
import { useDispatch } from 'react-redux';
import { millisecondsToMdhm } from 'utils/common.utils';

export const RequestsBannedAlert = () => {
  const auth = useAuth();
  const dispatch = useDispatch();
  const { locale } = useLocale();

  const userRole =
    auth.isAuthenticated &&
    auth.user.roles.find(({ id }) => id === auth.currentRole.id);

  return (
    <>
      <span className="block text_38 mt-50 mb-20">
        Запросы заблокированы менеджером сайта. <br />
        До разблокировки:{' '}
        {userRole?.requestsBannedUntil &&
          millisecondsToMdhm(
            new Date(userRole.requestsBannedUntil).getTime() -
              new Date().getTime(),
            locale,
            false,
          )}{' '}
        <br />
        {userRole?.bannedReason &&
          'Причина: ' +
            userRole.bannedReason
              .map(reason => locale.complaint.reasons[reason])
              .join(', ')}
      </span>
      <div className="d-table">
        <Button
          type="primary"
          size="large"
          onClick={() =>
            startChatWithUser({
              companionId: null,
              companionRole: null,
              chatId: 'support',
              dispatch,
            })
          }
        >
          {'Чат с менеджером'} <MessageOutlined />
        </Button>
      </div>
    </>
  );
};
