import { ToastContainer } from 'react-toastify';
import Head from 'next/head';
import Footer from 'components/complex/Footer';
import Header from 'components/complex/Header';
import Messenger from 'components/complex/Messenger';
import { isUserBanned } from 'sections/Users/utils';
import classNames from 'classnames';
import OrderProductSelecting from 'components/complex/OrderProductSelecting';
import { FC, ReactNode } from 'react';
import { useAuth } from 'hooks/auth.hook';
import { useMessenger } from 'hooks/messenger.hook';

const BASE_TITLE = `INF`;

const MainLayout: FC<{ children: ReactNode }> = ({ children }) => {
  const auth = useAuth();
  const messenger = useMessenger();
  let title = BASE_TITLE;

  const newUnreadNotificationsCount =
    (messenger?.newUnreadNotifications?.length || 0) +
    (messenger?.newUnreadMessages?.length || 0);
  if (!!newUnreadNotificationsCount) {
    title = `(${newUnreadNotificationsCount}) ${BASE_TITLE}`;
  }

  /* useEffect(() => {
    const mobileOS = getMobileOS();
    if (!mobileOS) return;

    const appUrlScheme = 'infmarket://';
    let storeAppUrl: string = null;
    if (mobileOS === 'Android')
      storeAppUrl = 'market://details?id=com.inf.market';
    else if (mobileOS === 'iOS')
      storeAppUrl =
        'https://apps.apple.com/tr/app/inf-%D0%B0%D0%B2%D1%82%D0%BE%D0%B7%D0%B0%D0%BF%D1%87%D0%B0%D1%81%D1%82%D0%B8/id6448314059';

    try {
      document.location = appUrlScheme;

      if (!storeAppUrl) return;

      let hasFocus = true;

      window.onfocus = () => {
        hasFocus = true;
      };
      window.onblur = () => {
        hasFocus = false;
      };
      if (!hasFocus) return;

      const timeout = setTimeout(() => {
        document.location = storeAppUrl;
      }, 3000);
      return () => clearTimeout(timeout);
    } catch (err) {}
  }, []); */

  return (
    <div
      id="app"
      className={classNames({
        loading: !auth.isLoaded,
      })}
    >
      {auth.isLoaded && <Header />}

      <main className="main">{children}</main>

      {/* {auth.isAuthenticated &&
        !isUserBanned(auth.user, auth.currentRole.id) && <Messenger />} */}
      {auth.isAuthenticated && <Messenger />}

      {auth.isAuthenticated &&
        !isUserBanned(auth.user, auth.currentRole.id) && (
          <OrderProductSelecting />
        )}

      {auth.isLoaded && <Footer />}

      <ToastContainer
        containerId="toast-main-container"
        className="toast-main-container"
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <audio
        src={'/audio/notification.wav'}
        preload="auto"
        id="audio-main"
        className="hidden"
        style={{
          display: 'none',
        }}
      />
    </div>
  );
};

export default MainLayout;
