import { FC, Fragment, RefObject, useState } from 'react';
import Scrollbars from 'react-custom-scrollbars';
import Avatar from 'antd/lib/avatar/avatar';
import formatDate from 'date-fns/format';
import { Preloader } from 'components/common';
import InfiniteScroll from 'react-infinite-scroller';
import { IRowsWithCount } from 'interfaces/common.interfaces';
import NotificationMessage from '../NotificationMessage';
import { useRouter } from 'next/router';
import { useLocale } from 'hooks/locale.hook';
import { INotification } from 'hooks/notifications.hooks/interfaces';
import { getNotificationPreview } from 'hooks/notifications.hooks/utils';
import { useNotifications } from 'hooks/notifications.hooks';
import { useDispatch } from 'react-redux';
import { Button } from 'antd';
import { APIRequest } from 'utils/api.utils';
import { API_ENDPOINTS } from 'data/paths.data';
import { openNotification } from 'utils/common.utils';
import { useAuth } from 'hooks/auth.hook';
import {
  goToMessengerRoot,
  setNewUnreadNotifications,
} from 'store/reducers/messenger.reducer';
import { useMessenger } from 'hooks/messenger.hook';

interface IProps {
  notifications: IRowsWithCount<INotification[]>;
  chatContentRef: RefObject<Scrollbars>;
}

const SystemChat: FC<IProps> = ({ notifications, chatContentRef }) => {
  const auth = useAuth();
  const { unreadNotificationsCount } = useMessenger();
  const dispatch = useDispatch();
  const { locale } = useLocale();
  const router = useRouter();
  const { fetchNotifications, fetchUnreadNotificationsCount } =
    useNotifications();
  const [submitting, setSubmitting] = useState(false);

  const readAllNotifications = async () => {
    if (submitting) return;
    setSubmitting(true);
    const res = await APIRequest<any>({
      method: 'post',
      url: API_ENDPOINTS.READ_ALL_NOTIFICATIONS,
      requireAuth: true,
    });
    setSubmitting(false);
    if (!res.isSucceed) {
      openNotification(res?.message);
      return;
    }
    await fetchUnreadNotificationsCount();
    dispatch(setNewUnreadNotifications([]));
  };

  return (
    <div className="messenger-window__chat">
      <div className="messenger-window__chat__top">
        <button
          className="messenger-window__chat__back no-bg no-border"
          onClick={() => dispatch(goToMessengerRoot())}
        >
          <img src="/img/icons/arrow-left.svg" alt="arrow-left" />
        </button>
        <Avatar
          className="messenger-window__chat__avatar"
          src="/img/default-avatar.png"
          shape="circle"
          size="small"
        />
        <div className="messenger-window__username messenger-window__chat__username">
          Inf
        </div>
      </div>
      <div className="messenger-window__chat__content">
        {notifications ? (
          <Scrollbars
            autoHeightMin={0}
            autoHeightMax={499}
            style={{ position: 'relative', zIndex: 20, maxHeight: 499 }}
            universal={true}
            renderTrackHorizontal={props => (
              <div
                {...props}
                style={{ display: 'none' }}
                className="track-horizontal"
              />
            )}
            className="messenger-window__track-vertical"
            ref={chatContentRef}
          >
            {notifications.count === 0 && (
              <div className="messenger-window__alert mt-20">
                Еще нет уведомлений
              </div>
            )}
            <InfiniteScroll
              loadMore={(page: number) => fetchNotifications(page)}
              isReverse={true}
              useWindow={false}
              threshold={10}
              pageStart={0}
              loader={
                <div key={0} className="mt-10">
                  <Preloader size="small" />
                </div>
              }
              hasMore={notifications.count > notifications.rows.length}
            >
              {notifications.rows.map((notification, i) => (
                <Fragment key={i}>
                  {(i === 0 ||
                    new Date(notification.createdAt).getDate() !==
                      new Date(
                        notifications.rows[i - 1].createdAt,
                      ).getDate()) && (
                    <div className="messenger-window__chat__date">
                      {formatDate(
                        new Date(notification.createdAt),
                        'dd.MM.yyyy',
                      )}
                    </div>
                  )}
                  <NotificationMessage
                    notification={getNotificationPreview(notification, {
                      router,
                      auth,
                      locale,
                    })}
                  />
                </Fragment>
              ))}
            </InfiniteScroll>
          </Scrollbars>
        ) : (
          <div className="messenger-window__alert mt-20">
            {locale.messenger.errors.messageListNotLoaded}
          </div>
        )}
      </div>
      {!!unreadNotificationsCount.total && (
        <div className="messenger-window__chat__new-message">
          <Button
            type="primary"
            className="w-100"
            loading={submitting}
            onClick={readAllNotifications}
          >
            Прочитать все уведомления
          </Button>
        </div>
      )}
    </div>
  );
};

export default SystemChat;
