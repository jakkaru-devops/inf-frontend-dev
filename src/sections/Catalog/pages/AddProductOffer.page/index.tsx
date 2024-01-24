import PageContainer from 'components/containers/PageContainer';
import { API_ENDPOINTS } from 'data/paths.data';
import { IRowsWithCount } from 'interfaces/common.interfaces';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import {
  IAutoBrand,
  IAutoType,
  IProductGroup,
} from 'sections/Catalog/interfaces/categories.interfaces';
import { APIRequest } from 'utils/api.utils';
import AddProductOfferPageContent from './Content';
import { IProduct } from 'sections/Catalog/interfaces/products.interfaces';

const AddProductOfferPage = () => {
  const router = useRouter();
  const [autoTypes, setAutoTypes] = useState<IRowsWithCount<IAutoType[]>>(null);
  const [autoBrands, setAutoBrands] =
    useState<IRowsWithCount<IAutoBrand[]>>(null);
  const [groups, setGroups] = useState<IRowsWithCount<IProductGroup[]>>(null);
  const [sourceProduct, setSourceProduct] = useState<IProduct>(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const { sourceProductId } = router.query;
      let sourceProductData: IProduct = null;
      if (sourceProductId) {
        const sourceProductRes = await APIRequest({
          method: 'get',
          url: API_ENDPOINTS.PRODUCT(sourceProductId as string),
          params: {
            include: ['files', 'applicabilities', 'analogs', 'branches'],
          },
          requireAuth: true,
        });

        if (sourceProductRes.isSucceed) {
          sourceProductData = sourceProductRes.data.product;
          setSourceProduct(sourceProductData);
        }
      }
      console.log('SOURCE PRODUCT', sourceProductData);

      const autoTypesRes = await APIRequest({
        method: 'get',
        url: API_ENDPOINTS.AUTO_TYPE_LIST,
      });
      setAutoTypes(autoTypesRes.data);

      const autoBrandsRes = await APIRequest({
        method: 'get',
        url: API_ENDPOINTS.AUTO_BRAND_LIST,
        params: {
          // include: ['autoTypes'],
          showHidden: true,
        },
      });
      setAutoBrands(autoBrandsRes?.data);

      const groupsRes = await APIRequest({
        method: 'get',
        url: API_ENDPOINTS.PRODUCT_GROUP_LIST,
        params: {
          parent: 'none',
          showHidden: true,
          // include: ['autoTypes', 'autoBrands'],
        },
      });
      setGroups(groupsRes?.data);

      setDataLoaded(true);
    };
    fetchData();
  }, []);

  return (
    <PageContainer contentLoaded={dataLoaded}>
      <AddProductOfferPageContent
        sourceProduct={sourceProduct}
        autoTypes={autoTypes}
        setAutoTypes={setAutoTypes}
        autoBrands={autoBrands}
        setAutoBrands={setAutoBrands}
        groups={groups}
        setGroups={setGroups}
      />
    </PageContainer>
  );
};

export default AddProductOfferPage;
