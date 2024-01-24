import _ from 'lodash';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getCart } from 'store/reducers/cart.reducer';

export const useCart = () => {
  const cartState = useSelector(getCart);
  const cart = useMemo(() => _.cloneDeep(cartState), [cartState]);
  return cart;
};
