import { useDispatch } from 'react-redux';
import {
  IFavoriteProduct,
  IProduct,
  IProductPriceOffer,
} from 'sections/Catalog/interfaces/products.interfaces';
import { useProductHandlers } from 'hooks/productHandlers.hook';
import { useAuth } from 'hooks/auth.hook';
import { IRowsWithCount, ISetState } from 'interfaces/common.interfaces';

interface IProps {
  favoriteProducts: IRowsWithCount<IFavoriteProduct[]>;
  setFavoriteProducts: ISetState<IRowsWithCount<IFavoriteProduct[]>>;
}

const useHandlers = ({ favoriteProducts, setFavoriteProducts }: IProps) => {
  const auth = useAuth();
  const dispatch = useDispatch();
  const {
    isInCart,
    isInFavorites,
    indexInFavorites,
    toggleProductIsInCart,
    toggleProductIsInFavorites,
  } = useProductHandlers();

  const handleCartButtonClick = ({
    product,
    priceOfferId,
  }: {
    product: IProduct;
    priceOfferId: IProductPriceOffer['id'];
  }) => {
    toggleProductIsInCart(
      {
        product,
        quantity: 1,
        acatProductId:
          auth.user?.favoriteProducts?.[
            indexInFavorites(product, { priceOfferId })
          ]?.acatProductId || product?.acatProductId,
      },
      { priceOfferId },
    );
  };

  const deleteFavoriteProduct = ({
    product,
    priceOfferId,
  }: {
    product: IProduct;
    priceOfferId: IProductPriceOffer['id'];
  }) => {
    toggleProductIsInFavorites(product, { priceOfferId });
    setFavoriteProducts(prev => ({
      count: prev.count - 1,
      rows: prev.rows.filter(
        el =>
          !(el.productId === product.id && el.priceOfferId === priceOfferId),
      ),
    }));
  };

  return {
    dispatch,
    isInCart,
    isInFavorites,
    handleCartButtonClick,
    deleteFavoriteProduct,
  };
};

export default useHandlers;
