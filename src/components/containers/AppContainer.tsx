import { API_ENDPOINTS } from 'data/paths.data';
import { FC, Fragment, ReactNode, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { APIRequest } from 'utils/api.utils';
import jsCookie from 'js-cookie';
import { STRINGS } from 'data/strings.data';
import { fetchAuthUser } from 'sections/Auth/utils';
import addDate from 'date-fns/add';
import socketService from 'services/socket';
import { useRouter } from 'next/router';
import MainLayout from 'components/layouts/Main.layout';
import { GOOGLE_MEASUREMENT_ID } from 'config/env';
import { IRowsWithCount } from 'interfaces/common.interfaces';
import { useAuth } from 'hooks/auth.hook';
import { setCartProducts } from 'store/reducers/cart.reducer';
import { setAuth, setAuthIsLoaded } from 'store/reducers/auth.reducer';
import { ILanguage, ILanguageLabel } from 'locales/interfaces';
import {
  setCurrentLanguage,
  setDefaultLanguage,
  setLanguageList,
} from 'store/reducers/locales.reducer';

interface IProps {
  children: ReactNode;
}

const AppContainer: FC<IProps> = ({ children }) => {
  const authState = useAuth();
  const dispatch = useDispatch();
  const router = useRouter();
  const showMainLayout = !['/download-app', '/advertise'].includes(
    router.pathname,
  );

  useEffect(() => {
    fetchInitialProps();
    initYandexMetrics();
    googleAnalytics();
    addGoogleAnalyticsFunc();
  }, []);

  useEffect(() => {
    if (!showMainLayout) return;
    if (authState.isAuthenticated) {
      socketService.connect(authState.user.id);
    } else {
      socketService.socket.disconnect();
    }
  }, [authState.isAuthenticated]);

  const initYandexMetrics = () => {
    const script = document.createElement('script');

    script.type = 'text/javascript';
    script.id = 'yandex-metrics';
    const scriptText =
      document.createTextNode(`(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
    m[i].l=1*new Date();
    for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
    k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
    (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

    ym(93869993, "init", {
          defer: true,
          clickmap:true,
          trackLinks:true,
          accurateTrackBounce:true
    });`);
    script.appendChild(scriptText);
    document.body.appendChild(script);

    const noscript = document.createElement('noscript');
    const noscriptText = document.createTextNode(`<div>
    <img
      src="https://mc.yandex.ru/watch/93869993"
      style={{ position: 'absolute', left: '-9999px' }}
      alt=""
    />
    </div>`);
    noscript.appendChild(noscriptText);
    document.body.appendChild(noscript);
  };

  // Google analytics
  const googleAnalytics = () => {
    if (!GOOGLE_MEASUREMENT_ID) return;

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GOOGLE_MEASUREMENT_ID}`;
    // script.id = 'google-analytics';

    document.body.appendChild(script);
  };

  const addGoogleAnalyticsFunc = () => {
    if (!GOOGLE_MEASUREMENT_ID) return;

    const script = document.createElement('script');

    const scriptText = document.createTextNode(`
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${GOOGLE_MEASUREMENT_ID}');
  `);
    script.appendChild(scriptText);
    document.body.appendChild(script);
  };

  const fetchInitialProps = async () => {
    if (!showMainLayout) {
      dispatch(setAuthIsLoaded(true));
      return;
    }

    // Auth
    const auth = await fetchAuthUser(authState);
    if (auth.isAuthenticated) {
      const token = jsCookie.get(STRINGS.AUTH_TOKEN);
      jsCookie.set(STRINGS.AUTH_TOKEN, token, {
        expires: addDate(new Date(), { weeks: 1 }),
      });

      const currentRoleId = jsCookie.get(STRINGS.CURRENT_ROLE);
      jsCookie.set(
        STRINGS.CURRENT_ROLE,
        currentRoleId || auth?.currentRole?.id,
        {
          expires: addDate(new Date(), { weeks: 1 }),
        },
      );

      const cartProducts = auth.user?.cartProducts;
      if (cartProducts) {
        dispatch(
          setCartProducts(
            cartProducts.map(cartProduct => ({
              productId: cartProduct.productId,
              acatProductId: cartProduct.acatProductId,
              quantity: cartProduct.quantity,
              priceOfferId: cartProduct.priceOfferId,
              isSelected: cartProduct.isSelected,
              deliveryMethod: cartProduct.deliveryMethod,
              createdAt: cartProduct.createdAt,
            })),
          ),
        );
      }
    } else {
      if (
        (localStorage.getItem(STRINGS.CART.PRODUCTS_UPDATED_AT) &&
          addDate(
            new Date(localStorage.getItem(STRINGS.CART.PRODUCTS_UPDATED_AT)),
            { days: 1 },
          ).getTime() < new Date().getTime()) ||
        jsCookie.get(STRINGS.AUTH_TOKEN)
      ) {
        dispatch(setCartProducts([]));
      } else {
        const cartProducts = JSON.parse(
          localStorage.getItem(STRINGS.CART.PRODUCTS) || '[]',
        );
        if (cartProducts) {
          dispatch(setCartProducts(cartProducts));
        }
      }

      jsCookie.remove(STRINGS.AUTH_TOKEN);
      jsCookie.remove(STRINGS.CURRENT_ROLE);
    }
    dispatch(setAuth(auth));

    // Language
    const language = jsCookie.get('language') as ILanguageLabel;
    dispatch(setCurrentLanguage(language));

    // Language list
    const languageListRes = await APIRequest<IRowsWithCount<ILanguage[]>>({
      method: 'get',
      url: API_ENDPOINTS.LANGUAGE_LIST,
      requireAuth: true,
    });
    if (languageListRes.isSucceed) {
      const languageList = languageListRes.data.rows;
      dispatch(setLanguageList(languageList));
      const defaultLanguage = languageList.find(lang => lang.isDefault);
      dispatch(setDefaultLanguage(defaultLanguage));
    }
  };

  return (
    <Fragment>
      {showMainLayout ? <MainLayout>{children}</MainLayout> : children}
    </Fragment>
  );
};

export default AppContainer;
