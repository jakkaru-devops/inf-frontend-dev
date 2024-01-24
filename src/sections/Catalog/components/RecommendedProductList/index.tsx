import { Preloader } from 'components/common';
import { API_ENDPOINTS, APP_PATHS } from 'data/paths.data';
import { ISetState } from 'interfaces/common.interfaces';
import { useRouter } from 'next/router';
import { FC, useEffect } from 'react';
import { IProduct } from 'sections/Catalog/interfaces/products.interfaces';
import { APIRequest } from 'utils/api.utils';
import { generateUrl } from 'utils/common.utils';
import ProductItem from '../ProductItem';

interface IProps {
  product: IProduct;
  recommendedProducts: IProduct[];
  setRecommendedProducts: ISetState<IProps['recommendedProducts']>;
}

const RecommendedProductList: FC<IProps> = ({
  recommendedProducts,
  setRecommendedProducts,
  product,
}) => {
  const router = useRouter();
  const history = [].concat(router?.query?.history) as string[];
  const lastHistoryItem = history?.[history?.length - 1];
  if (!!lastHistoryItem && JSON.parse(lastHistoryItem)?.[1] === product?.name) {
    history.pop();
  }

  useEffect(() => {
    const fetchData = async () => {
      setRecommendedProducts(null);
      const res = await APIRequest({
        method: 'get',
        url: API_ENDPOINTS.PRODUCT_RECOMMENDED_PRODUCTS(product?.id),
        params: {
          limit: 5,
        },
      });
      setRecommendedProducts(res?.data || []);
    };
    fetchData();
  }, [product?.id]);

  return (
    <ul
      style={{
        display: 'flex',
        justifyContent: 'center',
        flexWrap: 'nowrap',
      }}
    >
      {!!recommendedProducts ? (
        recommendedProducts.map(recommendedProduct => (
          <ProductItem
            key={recommendedProduct.id}
            href={generateUrl(
              {
                history: history.concat(
                  JSON.stringify([
                    APP_PATHS.PRODUCT(recommendedProduct.id),
                    recommendedProduct?.name,
                  ]),
                ),
              },
              {
                pathname: APP_PATHS.PRODUCT(recommendedProduct.id),
              },
            )}
            product={recommendedProduct}
            format="min"
          />
        ))
      ) : (
        <div className="mt-50 mb-10">
          <Preloader />
        </div>
      )}
    </ul>
  );
};

export default RecommendedProductList;
