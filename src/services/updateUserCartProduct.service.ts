import { API_ENDPOINTS_V2 } from 'data/api.data';
import { Dispatch } from 'redux';
import { ICartProduct } from 'sections/Cart/interfaces/interfaces';
import { IAuthState } from 'store/reducers/auth.reducer';
import { setCartProducts } from 'store/reducers/cart.reducer';
import { APIRequest } from 'utils/api.utils';

export const updateUserCartProduct = async ({
  cartProduct,
  cartProducts,
  index,
  auth,
  dispatch,
  preventServerUpdate,
}: {
  cartProduct: ICartProduct;
  cartProducts: ICartProduct[];
  index: number;
  auth: IAuthState;
  dispatch: Dispatch<any>;
  preventServerUpdate?: boolean;
}) => {
  cartProducts[index].quantity = cartProduct.quantity;
  cartProducts[index].isSelected = cartProduct?.isSelected;
  cartProducts[index].deliveryMethod = cartProduct?.deliveryMethod;

  if (auth.isAuthenticated && !preventServerUpdate) {
    const res = await APIRequest({
      method: 'put',
      url: API_ENDPOINTS_V2.cart.updateCartProduct(cartProduct.productId),
      data: {
        quantity: cartProduct.quantity,
        priceOfferId: cartProduct.priceOfferId,
        isSelected: cartProduct.isSelected,
        deliveryMethod: cartProduct.deliveryMethod,
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
