import { useState, useEffect } from 'react';
import PageContainer from 'components/containers/PageContainer';
import CatalogPageContent from './Content';
import { IProductCategoriesBasic } from 'sections/Catalog/interfaces/categories.interfaces';
import catalogService from 'sections/Catalog/catalog.service';

const CatalogPage = () => {
  const [categories, setCategories] = useState<IProductCategoriesBasic>(null);

  useEffect(() => {
    const fetchData = async () => {
      const categoriesData = await catalogService.getMainCategories({
        groupsCatalog: 'side',
      });
      setCategories(categoriesData);
    };
    fetchData();
  }, []);

  return (
    <PageContainer contentLoaded={!!categories}>
      <CatalogPageContent categories={categories} />
    </PageContainer>
  );
};

export default CatalogPage;
