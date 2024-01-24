import PageContainer from 'components/containers/PageContainer';
import { API_ENDPOINTS } from 'data/paths.data';
import { STRINGS } from 'data/strings.data';
import { IRowsWithCount } from 'interfaces/common.interfaces';
import { IFileItem } from 'interfaces/files.interfaces';
import { useEffect, useState } from 'react';
import { IUser } from 'sections/Users/interfaces';
import { APIRequest } from 'utils/api.utils';
import { getServerFileUrl } from 'utils/files.utils';
import { ICartProduct } from 'sections/Cart/interfaces/interfaces';
import { useCart } from 'hooks/cart.hook';
import RequestPageContent from './Content';

const RequestPage = () => {
  const cart = useCart();

  const [products, setProducts] = useState<IRowsWithCount<ICartProduct[]>>({
    count: 0,
    rows: [],
  });
  const [sellers, setSellers] = useState<IRowsWithCount<IUser[]>>({
    count: 0,
    rows: [],
  });
  const [uploadedFiles, setUploadedFiles] = useState<IFileItem[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const cartProductsBasic = JSON.stringify(cart.products);
      const productsRes = await APIRequest({
        method: 'post',
        url: API_ENDPOINTS.CART_PRODUCT_LIST,
        data: {
          cartProducts: cartProductsBasic,
        },
      });
      if (productsRes.isSucceed) {
        setProducts({
          count: cart.products.length,
          rows: productsRes.data.rows,
        });
      } else {
        return;
      }

      const sellersRes = await APIRequest({
        method: 'get',
        url: API_ENDPOINTS.SELLER_LIST_FOR_ORDER,
        requireAuth: true,
      });
      if (sellersRes.isSucceed) {
        setSellers(sellersRes.data);
      }

      const fileIds: string[] = JSON.parse(
        localStorage.getItem(STRINGS.CART.FILES) || '[]',
      );
      if (fileIds.length > 0) {
        const filesRes = await APIRequest({
          method: 'get',
          url: API_ENDPOINTS.FILE_LIST,
          params: {
            ids: fileIds,
          },
        });
        if (filesRes.isSucceed) {
          setUploadedFiles(
            (filesRes.data as IFileItem[]).map(fileItem => ({
              ...fileItem,
              url: getServerFileUrl(fileItem?.path),
            })),
          );
        }
      }

      setDataLoaded(true);
    };
    fetchData();
  }, []);

  return (
    <PageContainer contentLoaded={dataLoaded}>
      <RequestPageContent
        products={products}
        setProducts={setProducts}
        sellers={sellers}
        uploadedFiles={uploadedFiles}
      />
    </PageContainer>
  );
};

export default RequestPage;
