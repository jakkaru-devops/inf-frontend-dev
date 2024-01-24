import { APIRequest } from 'utils/api.utils';
import { IFavoriteProduct } from 'sections/Catalog/interfaces/products.interfaces';
import FavoriteProductsPageContent from './content';
import { useEffect, useState } from 'react';
import { IRowsWithCount } from 'interfaces/common.interfaces';
import { API_ENDPOINTS_V2 } from 'data/api.data';
import PageContainer from 'components/containers/PageContainer';

const FavoriteProductsPage = () => {
  const [favoriteProducts, setFavoriteProducts] =
    useState<IRowsWithCount<IFavoriteProduct[]>>(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await APIRequest({
        method: 'get',
        url: API_ENDPOINTS_V2.favoriteProducts.getList,
        requireAuth: true,
      });
      const { isSucceed, data } = res;
      if (isSucceed) {
        setFavoriteProducts(data);
      }
    };
    fetchData();
  }, []);

  return (
    <PageContainer contentLoaded={!!favoriteProducts}>
      <FavoriteProductsPageContent
        favoriteProducts={favoriteProducts}
        setFavoriteProducts={setFavoriteProducts}
      />
    </PageContainer>
  );
};

export default FavoriteProductsPage;
