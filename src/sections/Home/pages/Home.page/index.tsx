import { openNotification } from 'utils/common.utils';
import { useEffect, useState } from 'react';
import catalogService from 'sections/Catalog/catalog.service';
import { IProductCategoriesBasic } from 'sections/Catalog/interfaces/categories.interfaces';
import PageContainer from 'components/containers/PageContainer';
import HomePageContent from './Content';

const HomePage = () => {
  const [categories, setCategories] = useState<IProductCategoriesBasic>(null);

  const fetchCategories = async () => {
    try {
      const data = await catalogService.getMainCategories({
        groupsCatalog: 'side',
      });
      setCategories(data);
    } catch (err) {
      openNotification('Не удалось загрузить категории товаров');
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <PageContainer contentLoaded={!!categories}>
      <HomePageContent categories={categories} />
    </PageContainer>
  );
};

export default HomePage;
