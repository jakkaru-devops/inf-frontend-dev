import { useEffect, useState } from 'react';
import CustomOrderPageContent from './Content';
import { IUser } from 'sections/Users/interfaces';
import {
  IAutoBrand,
  IAutoType,
  IProductGroup,
} from 'sections/Catalog/interfaces/categories.interfaces';
import { APIRequest } from 'utils/api.utils';
import { API_ENDPOINTS } from 'data/paths.data';
import { IRowsWithCount } from 'interfaces/common.interfaces';
import { STRINGS } from 'data/strings.data';
import { IFileItem } from 'interfaces/files.interfaces';
import { getServerFileUrl } from 'utils/files.utils';
import PageContainer from 'components/containers/PageContainer';

const CustomOrderPage = () => {
  const [sellers, setSellers] = useState<IRowsWithCount<IUser[]>>({
    count: 0,
    rows: [],
  });
  const [data, setData] = useState<{
    autoTypes: IRowsWithCount<IAutoType[]>;
    autoBrands: IRowsWithCount<IAutoBrand[]>;
    productGroups: IRowsWithCount<IProductGroup[]>;
  }>(null);
  const [uploadedFiles, setUploadedFiles] = useState<IFileItem[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const autoTypesRes = await APIRequest({
        method: 'get',
        url: API_ENDPOINTS.AUTO_TYPE_LIST,
      });
      const autoTypes = autoTypesRes.isSucceed ? autoTypesRes.data : null;

      const autoBrandsRes = await APIRequest({
        method: 'get',
        url: API_ENDPOINTS.AUTO_BRAND_LIST,
      });
      const autoBrands = autoBrandsRes.isSucceed ? autoBrandsRes.data : null;

      const productGroupsRes = await APIRequest({
        method: 'get',
        url: API_ENDPOINTS.PRODUCT_GROUP_LIST,
        params: {
          nestingLevel: 0,
          catalog: ['AUTO_PRODUCTS', 'AUTO_TOOLS'],
        },
      });
      const productGroups = productGroupsRes.isSucceed
        ? productGroupsRes.data
        : null;

      const fileIds: string[] = JSON.parse(
        localStorage.getItem(STRINGS.CUSTOM_ORDER.FILES) || '[]',
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

      setData({
        autoTypes,
        autoBrands,
        productGroups,
      });

      const sellersRes = await APIRequest({
        method: 'get',
        url: API_ENDPOINTS.SELLER_LIST_FOR_ORDER,
        requireAuth: true,
      });
      if (sellersRes.isSucceed) {
        setSellers(sellersRes.data);
      }

      setDataLoaded(true);
    };
    fetchData();
  }, []);

  return (
    <PageContainer contentLoaded={dataLoaded}>
      <CustomOrderPageContent
        {...data}
        sellers={sellers}
        uploadedFiles={uploadedFiles}
      />
    </PageContainer>
  );
};

export default CustomOrderPage;
