import { useDispatch } from 'react-redux';
import { Badge, Button } from 'antd';
import { useRouter } from 'next/dist/client/router';
import { APP_PATHS } from 'data/paths.data';
import { RoleSwitcher, SearchCatalogInput, Link } from 'components/common';
import { isUserRequestsBanned, isUserBanned } from 'sections/Users/utils';
import { useLocale } from 'hooks/locale.hook';
import { generateInnerUrl, generateUrl, openNotification } from 'utils/common.utils';
import { STRINGS } from 'data/strings.data';
import { setCartProducts } from 'store/reducers/cart.reducer';
import { logout } from 'store/reducers/auth.reducer';
import { useAuth } from 'hooks/auth.hook';
import { useMessenger } from 'hooks/messenger.hook';
import { useCart } from 'hooks/cart.hook';
import { ArrowRightIcon, CartHeaderIcon, CustomRequestMiniIcon, UserHeaderIcon } from 'components/icons';
import { Fragment } from 'react';
import { ANDROID_APP_URL, IOS_APP_URL } from 'data/external.data';
import { DEFAULT_NAV_PATHS } from 'data/nav.data';

const Header = () => {
  const auth = useAuth();
  const cart = useCart();
  const { unreadNotificationsCount } = useMessenger();
  const dispatch = useDispatch();
  const { locale } = useLocale();
  const router = useRouter();

  const handleLogout = () => {
    dispatch(setCartProducts([]));
    dispatch(logout());
    Object.keys(STRINGS.CUSTOM_ORDER).forEach((key) => {
      if (key !== 'DELIVERY_ADDRESS') localStorage.removeItem(STRINGS.CUSTOM_ORDER[key]);
    });
    router.push(APP_PATHS.HOME);
  };

  const isAuthenticated = auth?.isAuthenticated;
  const userRolesLength = auth.user?.roles?.length;
  const currentRoleLabel = auth?.currentRole?.label;

  const isBanned =
    auth.isAuthenticated &&
    (isUserRequestsBanned(auth.user, auth.currentRole.id) || isUserBanned(auth.user, auth.currentRole.id));

  return (
    <Fragment>
      <div className="app-panel">
        «BERSERKKKKKKKKKKK» — фэнтези-манга:
        <Link href={ANDROID_APP_URL}>
          Google Play <ArrowRightIcon />
        </Link>
        <Link href={IOS_APP_URL}>
          App Store <ArrowRightIcon />
        </Link>
      </div>
      <header className="main-header">
        <div className="container container-fluid">
          <Link href={APP_PATHS.HOME} className="main-header__logo">
            <img src="/img/logo-large.svg" alt="" className="main-header__logo-img" />
          </Link>

          <SearchCatalogInput />

          <div className="d-flex align-items-center">
            <Link
              href={generateUrl(
                {
                  history: DEFAULT_NAV_PATHS.CUSTOM_ORDER,
                },
                {
                  pathname: APP_PATHS.CUSTOM_ORDER,
                  removeCurrentParams: true,
                }
              )}
              className="main-header__custom-request"
              onClick={(e) => {
                if (isBanned) {
                  e.preventDefault();
                  openNotification('Вам запрещенно это действие');
                }
              }}
            >
              <Button>
                <CustomRequestMiniIcon />
                Поиск по фото/описанию
              </Button>
            </Link>

            {!auth.isAuthenticated && (
              <Link
                href={generateUrl(
                  {
                    [STRINGS.QUERY.SEND_ORDER_REQUEST]: router.query?.[STRINGS.QUERY.SEND_ORDER_REQUEST],
                    history: null,
                  },
                  { pathname: APP_PATHS.LOGIN_CUSTOMER }
                )}
                className="main-header__item link"
              >
                {locale.user.registerOrLogin}
              </Link>
            )}

            {(!isAuthenticated || currentRoleLabel === 'customer') && (
              <Badge
                count={cart.products.filter((p) => !p.priceOfferId).length}
                overflowCount={99}
                size="small"
                className="main-header__item"
              >
                <Link
                  href={`${APP_PATHS.REQUEST}?history=request`}
                  className="link"
                  style={isBanned ? { cursor: 'not-allowed' } : {}}
                  onClick={() => isBanned && openNotification('Вам запрещенно это действие')}
                >
                  {locale.common.request}
                </Link>
              </Badge>
            )}

            {auth.isAuthenticated && (
              <Badge
                count={unreadNotificationsCount.personalArea}
                overflowCount={99}
                size="small"
                className="main-header__item"
              >
                <Link
                  href={generateInnerUrl(APP_PATHS.PERSONAL_AREA, {
                    searchParams: {
                      history: ['personal-area'],
                    },
                    removeCurrentParams: true,
                  })}
                  className="link link-text"
                >
                  {locale.common.personalArea}
                </Link>
                <Link
                  href={generateInnerUrl(APP_PATHS.PERSONAL_AREA, {
                    searchParams: {
                      history: ['personal-area'],
                    },
                    removeCurrentParams: true,
                  })}
                  className="link link-image"
                  title={locale.common.personalArea}
                >
                  <UserHeaderIcon />
                </Link>
              </Badge>
            )}

            {userRolesLength === 1 && (
              <Link href={APP_PATHS.HOME} onClick={handleLogout} className="main-header__logout main-header__item link">
                {locale.user.logout}
              </Link>
            )}

            {userRolesLength > 1 && (
              <RoleSwitcher showBannedRoles handleLogout={handleLogout} className="main-header__item" />
            )}

            {(!isAuthenticated || currentRoleLabel === 'customer') && (
              <Badge
                count={cart.products.filter((p) => p.priceOfferId).length}
                overflowCount={99}
                size="small"
                className="link main-header__item"
              >
                <Link
                  href={`${APP_PATHS.CART}?history=cart`}
                  className="main-header__cart link"
                  style={isBanned ? { cursor: 'not-allowed' } : null}
                  onClick={(e) => {
                    if (isBanned) {
                      e.preventDefault();
                      openNotification('Вам запрещенно это действие');
                    }
                  }}
                >
                  <CartHeaderIcon />
                </Link>
              </Badge>
            )}
          </div>
        </div>
      </header>
    </Fragment>
  );
};

export default Header;
