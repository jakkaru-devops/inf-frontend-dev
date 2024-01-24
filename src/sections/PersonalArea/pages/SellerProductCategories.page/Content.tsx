import { Button } from 'antd';
import {
  BreadCrumbs,
  Page,
  PageContent,
  PageTop,
  Summary,
} from 'components/common';
import { API_ENDPOINTS, APP_PATHS } from 'data/paths.data';
import { FC, useState } from 'react';
import {
  IProductCategoriesBasic,
  IProductGroup,
} from 'sections/Catalog/interfaces/categories.interfaces';
import { ISellerAutoBrand } from 'sections/Users/interfaces';
import { APIRequest } from 'utils/api.utils';
import { openNotification } from 'utils/common.utils';
import _ from 'lodash';
import CategoriesSelection from 'sections/Catalog/components/CategoriesSelection';

interface IProps {
  categories: IProductCategoriesBasic;
  sellerAutoBrands: ISellerAutoBrand[];
  sellerGroupIds: IProductGroup['id'][];
}

const SellerProductCategoriesPageContent: FC<IProps> = ({
  categories,
  sellerAutoBrands,
  sellerGroupIds,
}) => {
  const [selectedAutoBrands, setSelectedAutoBrands] = useState<
    ISellerAutoBrand[]
  >(sellerAutoBrands || []);
  const [selectedGroupIds, setSelectedGroupIds] = useState<
    IProductGroup['id'][]
  >(sellerGroupIds || []);
  const [submitting, setSubmitting] = useState(false);
  const submitAllowed =
    !!selectedAutoBrands.length || !!selectedGroupIds.length;

  const resetCategories = () => {
    setSelectedAutoBrands([]);
    setSelectedGroupIds([]);
  };

  const handleSubmit = async () => {
    if (submitting) return;

    setSubmitting(true);
    const res = await APIRequest({
      method: 'put',
      url: API_ENDPOINTS.SELLER_PRODUCT_CATEGORIES,
      data: {
        autoBrands: selectedAutoBrands,
        productGroupIds: selectedGroupIds,
      },
      requireAuth: true,
    });
    setSubmitting(false);

    if (!res.isSucceed) {
      openNotification(res?.message);
      return;
    }
    openNotification('Категории сохранены');
  };

  return (
    <Page>
      <BreadCrumbs
        list={[
          {
            link: APP_PATHS.SELLER_PRODUCT_CATEGORIES,
            text: 'Выбор категорий',
          },
        ]}
        showPersonalAreaLink={true}
      />
      <PageTop title="Выбор категорий" />
      <PageContent>
        <CategoriesSelection
          initialData={categories}
          selectedAutoBrands={selectedAutoBrands}
          setSelectedAutoBrands={setSelectedAutoBrands}
          selectedGroupIds={selectedGroupIds}
          setSelectedGroupIds={setSelectedGroupIds}
        />
      </PageContent>
      <Summary containerClassName="d-flex justify-content-end">
        <Button
          onClick={() => resetCategories()}
          type="text"
          className="text-underline"
        >
          Сбросить выбор
        </Button>
        <Button
          onClick={() => handleSubmit()}
          disabled={!submitAllowed}
          loading={submitting}
          type="primary"
          className="ml-10"
        >
          Сохранить
        </Button>
      </Summary>
    </Page>
  );
};

export default SellerProductCategoriesPageContent;
