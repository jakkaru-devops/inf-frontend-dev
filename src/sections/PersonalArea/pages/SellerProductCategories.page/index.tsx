import PageContainer from 'components/containers/PageContainer';
import { useEffect, useState } from 'react';
import {
  IProductCategoriesBasic,
  IProductGroup,
} from 'sections/Catalog/interfaces/categories.interfaces';
import { ISellerAutoBrand } from 'sections/Users/interfaces';
import SellerProductCategoriesPageContent from './Content';
import catalogService from 'sections/Catalog/catalog.service';
import usersService from 'sections/Users/users.service';

const SellerProductCategoriesPage = () => {
  const [data, setData] = useState<{
    categories: IProductCategoriesBasic;
    sellerAutoBrands: ISellerAutoBrand[];
    sellerGroupIds: IProductGroup['id'][];
  }>(null);

  useEffect(() => {
    const fetchData = async () => {
      const categories = await catalogService.getMainCategories({
        groupsCatalog: 'side',
      });
      const { sellerAutoBrands, sellerGroupIds } =
        await usersService.getSellerProductCategories();

      setData({
        categories,
        sellerAutoBrands,
        sellerGroupIds,
      });
    };
    fetchData();
  }, []);

  return (
    <PageContainer contentLoaded={!!data}>
      <SellerProductCategoriesPageContent {...data} />
    </PageContainer>
  );
};

export default SellerProductCategoriesPage;
