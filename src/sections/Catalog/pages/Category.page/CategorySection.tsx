import { useState, useEffect, FC } from 'react';
import { Input, Checkbox } from 'antd';
import _orderBy from 'lodash/orderBy';
import { APIRequest } from 'utils/api.utils';
import { API_ENDPOINTS } from 'data/paths.data';
import { Scrollbars } from 'react-custom-scrollbars';
import {
  IProductCategoryRelation,
  IProductCategory,
  IProductCategoryType,
} from 'sections/Catalog/interfaces/products.interfaces';
import InfiniteScroll from 'react-infinite-scroller';

interface ICategorySection {
  categoryType: IProductCategoryType;
  category: IProductCategory;
  sectionName: string;
}

const CategorySection: FC<ICategorySection> = ({
  categoryType,
  category: categoryInit,
  sectionName,
}) => {
  const [category, setCategory] = useState(categoryInit);
  const [categories, setCategories] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [hasMore, setHasMore] = useState(false);

  const LIMIT: number = 10;
  const OFFSET: number = categories.length;

  const initialLoad = async () => {
    const res = await APIRequest({
      method: 'get',
      url: API_ENDPOINTS.PRODUCT_CATEGORY_LIST,
      params: {
        categoryTypeId: categoryType.id,
        limit: LIMIT,
        offset: 0,
      },
    });

    setCategories(res?.data?.rows);
    if (LIMIT + OFFSET <= res?.data?.count) {
      setHasMore(true);
    } else {
      setHasMore(false);
    }
  };

  const loadMore = async (searchValue: string = '') => {
    let res;
    if (searchValue) {
      res = await APIRequest({
        method: 'get',
        url: API_ENDPOINTS.PRODUCT_CATEGORY_LIST,
        params: {
          categoryTypeId: categoryType.id,
          limit: LIMIT,
          offset: 0,
          search: searchValue,
        },
      });
      setCategories(res?.data?.rows);
    } else {
      res = await APIRequest({
        method: 'get',
        url: API_ENDPOINTS.PRODUCT_CATEGORY_LIST,
        params: {
          categoryTypeId: categoryType.id,
          limit: LIMIT,
          offset: 0,
        },
      });

      setCategories(prevState => {
        return [...prevState, ...res?.data?.rows];
      });
    }

    if (LIMIT + OFFSET <= res?.data?.count) {
      setHasMore(true);
    } else {
      setHasMore(false);
    }
  };

  useEffect(() => {
    if (searchValue) {
      loadMore(searchValue);
    } else {
      initialLoad();
    }
  }, [searchValue]);

  if (!categories.length) {
    return (
      <>
        <h3 className="mt-30">
          {sectionName} {categoryType.name}
        </h3>
        <div className="catalog__accSearch">
          <Input
            placeholder={'vvedi'}
            name={'searchInput'}
            type="text"
            value={searchValue}
            onChange={e => {
              setSearchValue(e?.target?.value);
            }}
          />
        </div>
      </>
    );
  }

  const relations: IProductCategoryRelation[] = !categoryType
    ? null
    : category.relations.filter(
        el => el.categorySectionId === categoryType.categorySectionId,
      );

  const createCategoryRelation = async ({
    parentId,
    childId,
  }: {
    parentId: string;
    childId: string;
  }) => {
    const res = await APIRequest({
      method: 'post',
      url: API_ENDPOINTS.PRODUCT_CATEGORY_RELATION,
      data: {
        categorySectionId: categoryType.categorySectionId,
        parentId,
        childId,
      },
    });
    const relation: IProductCategoryRelation =
      res?.data?.result?.productCategoryRelation;
    if (relation) {
      setCategory({
        ...category,
        relations: category.relations.concat(relation),
      });
    }
  };

  const deleteCategoryRelation = async (relationId: string) => {
    const res = await APIRequest({
      method: 'delete',
      url: API_ENDPOINTS.PRODUCT_CATEGORY_RELATION,
      params: {
        id: relationId,
      },
    });
    if (!res.isSucceed) return;
    const newRelations = category.relations;
    const index = newRelations.findIndex(el => el.id === relationId);
    newRelations.splice(index, 1);
    setCategory({
      ...category,
      relations: newRelations,
    });
  };

  return (
    <>
      <h3 className="mt-30">
        {sectionName} {categoryType.name}
      </h3>
      <div className="catalog__accSearch">
        <Input
          placeholder={'vvedi'}
          name={'searchInput'}
          type="text"
          value={searchValue}
          onChange={e => {
            setSearchValue(e?.target?.value);
          }}
        />
      </div>
      <Scrollbars
        autoHeightMin={0}
        autoHeightMax={200}
        autoHeight={true}
        universal={true}
        renderTrackHorizontal={props => (
          <div
            {...props}
            style={{ display: 'none' }}
            className="track-horizontal"
          />
        )}
      >
        <InfiniteScroll
          loadMore={() => {
            // if (!searchValue) {
            loadMore(searchValue);
            // }
          }}
          useWindow={false}
          threshold={40}
          pageStart={0}
          hasMore={hasMore}
        >
          <ul className="product-category-page__category-list">
            {categories.length
              ? categories.map(cat => (
                  <li key={cat.id}>
                    <Checkbox
                      checked={
                        relations.findIndex(el => el.parentId === cat.id) !== -1
                      }
                      onChange={e => {
                        if (e.target.checked) {
                          createCategoryRelation({
                            parentId: cat.id,
                            childId: category.id,
                          });
                        } else {
                          deleteCategoryRelation(
                            relations.find(el => el.parentId === cat.id).id,
                          );
                        }
                      }}
                    >
                      {cat.name}
                    </Checkbox>
                  </li>
                ))
              : null}
          </ul>
        </InfiniteScroll>
      </Scrollbars>
    </>
  );
};

export default CategorySection;
