import PageContainer from 'components/containers/PageContainer';
import { API_ENDPOINTS } from 'data/paths.data';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { APIRequest } from 'utils/api.utils';
import { IOrganization } from 'sections/Organizations/interfaces';
import { ISaleProduct } from 'sections/Sale/interfaces/sale.interfaces';
import { IRowsWithCount } from 'interfaces/common.interfaces';
import {
  IAutoBrand,
  IAutoType,
  IProductGroup,
} from 'sections/Catalog/interfaces/categories.interfaces';
import { useAuth } from 'hooks/auth.hook';
import { API_ENDPOINTS_V2 } from 'data/api.data';
import EditSaleProductPageContent from './Content';

const EditSaleProductPage = () => {
  const router = useRouter();
  const [product, setProduct] = useState<ISaleProduct>(null);
  const [autoTypes, setAutoTypes] = useState<IRowsWithCount<IAutoType[]>>(null);
  const [autoBrands, setAutoBrands] =
    useState<IRowsWithCount<IAutoBrand[]>>(null);
  const [groups, setGroups] = useState<IRowsWithCount<IProductGroup[]>>(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const auth = useAuth();
  const [data, setData] = useState<{
    organizations: IOrganization[];
  }>(null);

  useEffect(() => {
    const fetchData = async () => {
      const productRes = await APIRequest({
        method: 'get',
        url: API_ENDPOINTS_V2.sale.getProduct(router.query.saleId as string),
        params: {
          include: ['files', 'branches'],
          mode: 'edit',
        },
        requireAuth: true,
      });
      const productData: ISaleProduct = productRes?.data;
      const branch = productData?.branches?.[0];
      if (!branch?.autoTypeId) branch.autoTypeId = 'relatedProducts';
      setProduct(productData);

      const autoTypesRes = await APIRequest({
        method: 'get',
        url: API_ENDPOINTS.AUTO_TYPE_LIST,
        params: {
          mode: 'saleEdit',
        },
      });
      setAutoTypes(autoTypesRes.data);

      if (!!branch?.autoTypeId && branch?.autoTypeId !== 'relatedProducts') {
        const autoBrandsRes = await APIRequest({
          method: 'get',
          url: API_ENDPOINTS.AUTO_BRAND_LIST,
          params: {
            showHidden: true,
            mode: 'saleEdit',
            autoType: branch?.autoTypeId,
          },
        });
        setAutoBrands(autoBrandsRes?.data);
      } else {
        setAutoBrands({ count: 0, rows: [] });
      }

      if (branch?.autoTypeId === 'relatedProducts') {
        const groupsRes = await APIRequest({
          method: 'get',
          url: API_ENDPOINTS.PRODUCT_GROUP_LIST,
          params: {
            parent: 'none',
            showHidden: true,
            mode: 'saleEdit',
          },
        });
        setGroups(groupsRes?.data);
      } else {
        const groupsRes = await APIRequest({
          method: 'get',
          url: API_ENDPOINTS.PRODUCT_GROUP_LIST,
          params: {
            parent: 'none',
            showHidden: true,
            autoType: branch.autoTypeId,
            autoBrand: branch.autoBrandId,
          },
        });
        setGroups(groupsRes?.data);
      }

      setDataLoaded(true);
      let organizations: IOrganization[] = [];
      if (auth?.currentRole?.label === 'seller') {
        const organizationsRes = await APIRequest({
          method: 'get',
          url: API_ENDPOINTS.SELLERS_ORGANIZATIONS,
          requireAuth: true,
        });

        organizations = organizationsRes.isSucceed
          ? organizationsRes.data
          : null;
      }
      setData({
        organizations,
      });
    };
    fetchData();
  }, []);

  return (
    <PageContainer contentLoaded={dataLoaded}>
      <EditSaleProductPageContent
        product={product}
        autoTypes={autoTypes}
        setAutoTypes={setAutoTypes}
        autoBrands={autoBrands}
        setAutoBrands={setAutoBrands}
        groups={groups}
        setGroups={setGroups}
        {...data}
      />
    </PageContainer>
  );
};

export default EditSaleProductPage;
