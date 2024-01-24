import { useAuth } from './auth.hook';
import { useDispatch } from 'react-redux';
import { useNotifications } from './notifications.hooks';
import { APIRequest } from '../utils/api.utils';
import { API_ENDPOINTS, APP_PATHS } from '../data/paths.data';
import jsCookie from 'js-cookie';
import { STRINGS } from '../data/strings.data';
import addDate from 'date-fns/add';
import { useRouter } from 'next/router';
import { generateInnerUrl } from '../utils/common.utils';
import { setAuth } from '../store/reducers/auth.reducer';
import { setCartProducts } from '../store/reducers/cart.reducer';

export const useManagerAuth = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const authState = useAuth();
  const { fetchUnreadNotificationsCount } = useNotifications();

  const loginAsUser = async ({
    id,
    roleLabel,
  }: {
    id: string;
    roleLabel: string;
  }) => {
    const response = await APIRequest({
      method: 'get',
      url: API_ENDPOINTS.MANAGER_LOGIN,
      params: { id, roleLabel },
    });

    const token = response?.data?.payload;

    if (!token) return;

    jsCookie.set(STRINGS.AUTH_TOKEN, token, {
      expires: addDate(new Date(), { weeks: 1 }),
    });

    const roleId = response?.data?.role;

    const res = await APIRequest({
      method: 'get',
      url: API_ENDPOINTS.AUTH_USER_PROFILE,
      headers: !!roleId ? { 'user-role': roleId } : {},
      requireAuth: true,
    });

    const cartProducts = res.data.user?.cartProducts;

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

    const auth = {
      ...authState,
      user: res.data.user,
      currentRole: res.data.currentRole,
      isAuthenticated: res.isSucceed,
      isLoaded: true,
      hideSellerRewards: !!res.data?.hideSellerRewards,
      sellerRegisterSimplified: !!res.data?.sellerRegisterSimplified,
    };

    dispatch(setAuth(auth));

    jsCookie.set(STRINGS.CURRENT_ROLE, auth.currentRole.id, {
      expires: addDate(new Date(), { weeks: 1 }),
    });

    fetchUnreadNotificationsCount();

    router.push(
      generateInnerUrl(APP_PATHS.PERSONAL_AREA, {
        searchParams: {
          history: ['personal-area'],
          [STRINGS.QUERY.SEND_ORDER_REQUEST]: null,
        },
      }),
    );
  };

  return { loginAsUser };
};
