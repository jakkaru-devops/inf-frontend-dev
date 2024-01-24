import { ChangeEvent, FC, useEffect, useState } from 'react';
import { Input, Button, Checkbox, Select } from 'antd';
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
  IProductCategoryTypeExtended,
} from 'sections/Catalog/interfaces/products.interfaces';
import CategorySection from './CategorySection';
import { useLocale } from 'hooks/locale.hook';
import { getLocalesState } from 'store/reducers/locales.reducer';

interface IProps {
  categoryType: IProductCategoryTypeExtended;
  categoryTypeList: IProductCategoryTypeExtended[];
  category: IProductCategory;
}

const ProductCategoryPage: FC<IProps> = ({
  categoryType,
  categoryTypeList,
  category: categoryInit,
}) => {
  const { languageList, defaultLanguage } = useSelector(getLocalesState);
  const { locale } = useLocale();

  const [category, setCategory] = useState(categoryInit);
  const [categoryLanguageId, setCategoryLanguageId] = useState(
    defaultLanguage.label,
  );
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const parentCategoryType = categoryTypeList.find(
    el => el.nestingLevel === categoryType.nestingLevel - 1,
  );
  const childCategoryType = categoryTypeList.find(
    el => el.nestingLevel === categoryType.nestingLevel + 1,
  );

  useEffect(() => {
    if (categoryLanguageId === 'en') {
      const newCategory = { ...category };
      newCategory.name = newCategory.name_ru.translitRusToLatin();
      setCategory(newCategory);
    }
    console.log('rerender', { a: category[`name_${defaultLanguage.label}`] });
  }, [categoryLanguageId]);

  const makeCategoryFavorite = async ({ id }: { id: string }) => {
    const res = await APIRequest({
      method: 'post',
      url: API_ENDPOINTS.PRODUCT_CATEGORY_FAVORITE,
      data: { id },
    });
    setCategory({
      ...category,
      favorite: true,
    });
  };

  const removeCategoryFromFavorite = async ({ id }: { id: string }) => {
    const res = await APIRequest({
      method: 'delete',
      url: API_ENDPOINTS.PRODUCT_CATEGORY_FAVORITE,
      data: { id },
    });
    setCategory({
      ...category,
      favorite: false,
    });
  };

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newCategory = { ...category };
    newCategory.name = e.target.value;
    newCategory.name_ru = e.target.value;
    newCategory.name_en = e.target.value.translitRusToLatin().toCamelCase();
    newCategory.label = newCategory.name_en;
    setCategory(newCategory);
    setHasUnsavedChanges(true);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCategory({
      ...category,
      [e.target.name]: e.target.value,
    });
    setHasUnsavedChanges(true);
  };

  const saveChanges = async () => {
    const res = await APIRequest({
      method: 'put',
      url: API_ENDPOINTS.PRODUCT_CATEGORY,
      params: {
        id: category.id,
      },
      data: {
        label: category.label,
        translates: [
          {
            name: category.name_ru,
            label: 'ru',
          },
          {
            name: category.name_en,
            label: 'en',
          },
        ],
      },
    });
    if (!res.isSucceed) return;
    const newTranslates = res.data.translates;
    setCategory({
      ...category,
      translates: newTranslates,
    });
    setHasUnsavedChanges(false);
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
            link: APP_PATHS.PRODUCT_CATEGORY(categoryType.id, category.id),
            text: category.name,
          },
        ]}
      />
      <PageTop
        title={`${categoryInit[`name_${defaultLanguage.label}`]}: ${
          category.name
        }`}
      />
      <PageContent>
        <form
          onSubmit={e => {
            e.preventDefault();
            saveChanges();
          }}
        >
          <FormGroup title={`Название`} className="mb-20">
            <Input
              value={category.name}
              onChange={handleNameChange}
              addonBefore={
                <>
                  <Select
                    value={categoryLanguageId}
                    onChange={value => setCategoryLanguageId(value)}
                    options={languageList.map(lang => ({
                      value: lang.label,
                      // value: lang.id,
                    }))}
                  />
                </>
              }
            />
          </FormGroup>

          <FormGroup title={`Ярлык`} className="mb-20">
            <Input
              name="label"
              value={category.label}
              onChange={handleInputChange}
            />
          </FormGroup>

          <div className="d-flex justify-content-end">
            <Button
              type="primary"
              htmlType="submit"
              className="ml-10"
              disabled={!hasUnsavedChanges}
            >
              Сохранить
            </Button>
          </div>
        </form>
        {categoryType && (
          <>
            <ul className="product-category-page__category-list">
              <li>
                <Checkbox
                  checked={
                    category.favorite !== undefined && category.favorite == true
                  }
                  onChange={e => {
                    if (e.target.checked) {
                      makeCategoryFavorite({ id: category.id });
                    } else {
                      removeCategoryFromFavorite({ id: category.id });
                    }
                  }}
                >
                  Избранная категория
                </Checkbox>
              </li>
            </ul>
          </>
        )}
        {categoryTypeList.indexOf(parentCategoryType) !== 2 &&
          parentCategoryType && (
            <CategorySection
              categoryType={parentCategoryType}
              category={category}
              sectionName={'Родительские категории:'}
            />
          )}
        {categoryTypeList.indexOf(childCategoryType) !== 3 &&
          childCategoryType && (
            <CategorySection
              categoryType={childCategoryType}
              category={category}
              sectionName={'Дочерние категории:'}
            />
          )}
      </PageContent>
    </Page>
  );
};

export default ProductCategoryPage;
