import { ChangeEvent, FC, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Input, Button, Select } from 'antd';
import _orderBy from 'lodash/orderBy';
import { useSelector } from 'react-redux';
import {
  BreadCrumbs,
  FormGroup,
  Page,
  PageContent,
  PageTop,
} from 'components/common';
import { APIRequest } from 'utils/api.utils';
import { API_ENDPOINTS, APP_PATHS } from 'data/paths.data';
import {
  IProductCategory,
  IProductCategoryTranslate,
  IProductCategoryType,
} from 'sections/Catalog/interfaces/products.interfaces';
import { useLocale } from 'hooks/locale.hook';
import { getLocalesState } from 'store/reducers/locales.reducer';

interface IProps {
  categoryType: IProductCategoryType;
}

const AddProductCategoryPage: FC<IProps> = ({ categoryType }) => {
  const { languageList, defaultLanguage } = useSelector(getLocalesState);
  const { locale } = useLocale();
  const router = useRouter();

  const [category, setCategory] = useState({
    label: '',
    translates: [] as IProductCategoryTranslate[],
  });
  const [categoryLanguageId, setCategoryLanguageId] = useState(
    defaultLanguage.id,
  );

  const translateIndex = category.translates.findIndex(
    el => el.languageId === categoryLanguageId,
  );
  const name =
    translateIndex === -1 ? '' : category.translates[translateIndex].name;

  useEffect(() => {
    const newTranslates: IProductCategoryTranslate[] = languageList.map(
      lang => ({
        name: '',
        productCategoryId: null,
        languageId: lang.id,
      }),
    );
    setCategory({
      ...category,
      translates: newTranslates,
    });
  }, []);

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newTranslates = category.translates;
    newTranslates[translateIndex].name = e.target.value;
    const newCategory = {
      ...category,
      translates: newTranslates,
    };
    // If selected language equals to default language
    if (categoryLanguageId === defaultLanguage.id) {
      newCategory.label = e.target.value.translitRusToLatin().toCamelCase();
    }
    setCategory(newCategory);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCategory({
      ...category,
      [e.target.name]: e.target.value,
    });
  };

  const saveCategory = async () => {
    const res = await APIRequest({
      method: 'post',
      url: API_ENDPOINTS.PRODUCT_CATEGORY,
      data: {
        categoryTypeId: categoryType.id,
        categorySectionId: categoryType.categorySectionId,
        label: category.label,
        translates: category.translates,
      },
    });
    console.log(res);
    if (!res.isSucceed) return;
    const createdCategory: IProductCategory = res.data.productCategory;
    router.push(
      APP_PATHS.PRODUCT_CATEGORY(categoryType.id, createdCategory.id),
    );
  };

  return (
    <Page className="product-category-page">
      <BreadCrumbs
        list={[
          {
            link: APP_PATHS.ALL_PRODUCT_CATEGORIES,
            text: locale.catalog.productCategories,
          },
          {
            link: APP_PATHS.PRODUCT_CATEGORY_TYPE(categoryType.id),
            text: categoryType.name,
          },
          {
            link: APP_PATHS.ADD_PRODUCT_CATEGORY(categoryType.id),
            text: 'Новая категория',
          },
        ]}
      />
      <PageTop title={`${locale.catalog.add}: ${categoryType.name}`} />
      <PageContent>
        <form
          onSubmit={e => {
            e.preventDefault();
            saveCategory();
          }}
        >
          <FormGroup title={locale.catalog.name} className="mb-20">
            <Input
              value={name}
              onChange={handleNameChange}
              addonBefore={
                <>
                  <Select
                    value={categoryLanguageId}
                    onChange={value => setCategoryLanguageId(value)}
                    options={languageList.map(lang => ({
                      label: lang.label,
                      value: lang.id,
                    }))}
                  />
                </>
              }
            />
          </FormGroup>

          <FormGroup title={locale.catalog.label} className="mb-20">
            <Input
              name="label"
              value={category.label}
              onChange={handleInputChange}
            />
          </FormGroup>

          <div className="d-flex justify-content-end">
            <Button type="primary" htmlType="submit" className="ml-10">
              {locale.common.save}
            </Button>
          </div>
        </form>
      </PageContent>
    </Page>
  );
};

export default AddProductCategoryPage;
