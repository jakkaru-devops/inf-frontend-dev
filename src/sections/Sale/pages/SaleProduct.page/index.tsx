import PageContainer from 'components/containers/PageContainer';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { APIRequest } from 'utils/api.utils';
import { API_ENDPOINTS_V2 } from 'data/api.data';
import { ISaleProduct } from 'sections/Sale/interfaces/sale.interfaces';
import SaleProductPageContent from './Content';

const SaleProductPage = () => {
  const router = useRouter();
  const [product, setProduct] = useState<ISaleProduct>(null);

  const fetchProduct = async () => {
    const productsRes = await APIRequest({
      method: 'get',
      url: API_ENDPOINTS_V2.sale.getProduct(router.query.saleId as string),
      params: {
        mode: 'read',
      },
    });
    if (!productsRes.isSucceed) return;
    setProduct(productsRes.data);
  };

  useEffect(() => {
    fetchProduct();
  }, [router.query.productId]);

  return (
    <PageContainer contentLoaded={!!product}>
      <SaleProductPageContent product={product} />
    </PageContainer>
  );
};

export default SaleProductPage;
