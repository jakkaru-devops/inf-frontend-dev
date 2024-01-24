import { IAuthState } from 'store/reducers/auth.reducer';
import { ICartProduct } from '../interfaces/interfaces';
import { Dispatch } from 'react';
import { APIRequest } from 'utils/api.utils';
import { setCartProducts } from 'store/reducers/cart.reducer';
import { API_ENDPOINTS_V2 } from 'data/api.data';

export const deleteCartProductService = async ({
  cartProduct,
  cartProducts,
  index,
  auth,
  dispatch,
}: {
  cartProduct: ICartProduct;
  cartProducts: ICartProduct[];
  index: number;
  auth: IAuthState;
  dispatch: Dispatch<any>;
}) => {
  cartProducts.splice(index, 1);

  if (auth.isAuthenticated) {
    const res = await APIRequest({
      method: 'delete',
      url: API_ENDPOINTS_V2.cart.deleteCartProduct(cartProduct.productId),
      data: {
        priceOfferId: cartProduct.priceOfferId,
      },
      requireAuth: true,
    });
    if (!res.isSucceed) return;
  }

  dispatch(
    setCartProducts(
      cartProducts.map(el => ({
        productId: el.productId,
        priceOfferId: el.priceOfferId,
        isSelected: el.isSelected,
        deliveryMethod: el.deliveryMethod,
        acatProductId: el.acatProductId,
        quantity: el.quantity,
        createdAt: el.createdAt,
      })),
    ),
  );
};
