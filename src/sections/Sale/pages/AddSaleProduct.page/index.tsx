import PageContainer from 'components/containers/PageContainer';
import { API_ENDPOINTS } from 'data/paths.data';
import { useEffect, useState } from 'react';
import { APIRequest } from 'utils/api.utils';
import { IOrganization } from 'sections/Organizations/interfaces';
import { IRowsWithCount } from 'interfaces/common.interfaces';
import {
  IAutoBrand,
  IAutoType,
  IProductGroup,
} from 'sections/Catalog/interfaces/categories.interfaces';
import { useAuth } from 'hooks/auth.hook';
import AddSaleProductPageContent from './Content';
import { useRouter } from 'next/router';
import {
  IProduct,
  IProductBranch,
} from 'sections/Catalog/interfaces/products.interfaces';

const AddSaleProductPage = () => {
  const [sourceProduct, setSourceProduct] = useState<IProduct>(null);
  const [autoTypes, setAutoTypes] = useState<IRowsWithCount<IAutoType[]>>(null);
  const [autoBrands, setAutoBrands] = useState<IRowsWithCount<IAutoBrand[]>>({
    count: 0,
    rows: [],
  });
  const [groups, setGroups] = useState<IRowsWithCount<IProductGroup[]>>({
    count: 0,
    rows: [],
  });
  const [dataLoaded, setDataLoaded] = useState(false);
  const auth = useAuth();
  const [data, setData] = useState<{
    organizations: IOrganization[];
  }>(null);
  const router = useRouter();

  useEffect(() => {
    try {
      const fetchData = async () => {
        let branch: IProductBranch;

        if (!!router.query?.sourceProductId) {
          const productRes = await APIRequest({
            method: 'get',
            url: API_ENDPOINTS.PRODUCT(router.query.sourceProductId as string),
            params: {
              include: ['files', 'branches'],
              mode: 'edit',
            },
            requireAuth: true,
          });
          const productData: IProduct = productRes?.data?.product;
          branch = productData?.branches?.[0];
          if (!!branch && !branch?.autoTypeId)
            branch.autoTypeId = 'relatedProducts';
          setSourceProduct(productData);
        }

        const autoTypesRes = await APIRequest({
          method: 'get',
          url: API_ENDPOINTS.AUTO_TYPE_LIST,
          params: {
            mode: 'saleEdit',
          },
        });
        setAutoTypes(autoTypesRes.data);

        if (!!branch) {
          if (branch?.autoTypeId) {
            const autoBrandsRes = await APIRequest({
              method: 'get',
              url: API_ENDPOINTS.AUTO_BRAND_LIST,
              params: {
                showHidden: true,
                mode: 'saleEdit',
                autoType: branch?.autoTypeId,
              },
            });
            const autoBrandsData: IRowsWithCount<IAutoBrand[]> =
              autoBrandsRes?.data;
            setAutoBrands(autoBrandsData);

            if (
              !autoBrandsData?.rows?.some(el => el.id === branch?.autoBrandId)
            ) {
              branch.autoBrandId = 'none';
            }
          }

          const groupsRes = await APIRequest({
            method: 'get',
            url: API_ENDPOINTS.PRODUCT_GROUP_LIST,
            params: {
              parent: 'none',
              showHidden: true,
              mode: 'saleEdit',
            },
          });
          const groupsData: IRowsWithCount<IProductGroup[]> = groupsRes?.data;
          setGroups(groupsData);

          if (!groupsData.rows.some(el => el.id === branch?.groupId)) {
            branch.groupId = 'none';
            branch.subgroupId = 'none';
          }
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
    } catch (e) {
      console.log(
        'category, types, group and subgroup request failed in productSaleAdd',
      );
    }
  }, []);

  return (
    <PageContainer contentLoaded={dataLoaded}>
      <AddSaleProductPageContent
        sourceProduct={sourceProduct}
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

export default AddSaleProductPage;
