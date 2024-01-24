import _ from 'lodash';
import { ICatalogOrder } from './interfaces/catalog.interfaces';
import {
  IProduct,
  IProductBranch,
  IProductOffer,
} from './interfaces/products.interfaces';

export const PRODUCT_LIST_ORDER_OPTIONS: ICatalogOrder[] = [
  'price',
  'date',
  'name',
];
export const DEFAULT_CATALOG_PAGE_SIZE = 12;

export const CATALOG_MAIN_CATS = {
  spectehnika: {
    img: '/img/catalog/main-cat-1.png',
  },
  gruzovye: {
    img: '/img/catalog/main-cat-2.png',
  },
  avtobusy: {
    img: '/img/catalog/main-cat-4.png',
  },
  kommercheskiiTransport: {
    img: '/img/catalog/main-cat-3.png',
  },
  legkovye: {
    img: '/img/catalog/main-cat-5.png',
  },
};

export const PRODUCT_STATUSES = {
  DEFAULT: 100,
  REVIEW: 200,
  ACCEPTED: 300,
  DECLINED: 400,
  COPIED: 500,
  SALE: 600,
};

export const PUBLIC_PRODUCT_STATUSES = [
  PRODUCT_STATUSES.DEFAULT,
  PRODUCT_STATUSES.ACCEPTED,
  PRODUCT_STATUSES.COPIED,
];

export const PRODUCT_OFFER_STATUSES = {
  REVIEW: 100,
  ACCEPTED: 200,
  DECLINED: 300,
};

export const getInitialProduct = (): IProduct => ({
  name: '',
  article: '',
  productOffer: null,
  status: PRODUCT_STATUSES.DEFAULT,
  description: '',
  weight: null,
  length: null,
  width: null,
  height: null,
  previewFileId: null,
  productFiles: [],
});

export const analogsInitialCols = [
  {
    content: 'Производитель',
    width: '27.5%',
  },
  {
    content: 'Артикул',
    width: '17.5%',
  },
  {
    content: 'Наименование',
    width: '55%',
  },
];

export const applicabilityInitalCols = [
  {
    content: 'Марка',
    width: '33%',
  },
  {
    content: 'Модель',
    width: '33%',
  },
  {
    content: 'Артикул',
    width: '33%',
  },
];

export const defineProductOfferStatus = (
  productOffer: IProductOffer,
  locale: any,
) => {
  let status = '';
  let color = '';
  if (productOffer.status === PRODUCT_OFFER_STATUSES.REVIEW) {
    status = locale.digitization.review;
    color = '#000000';
  }
  if (productOffer.status === PRODUCT_OFFER_STATUSES.ACCEPTED) {
    status = locale.digitization.accepted;
    color = '#3BB01E';
  }
  if (productOffer.status === PRODUCT_OFFER_STATUSES.DECLINED) {
    status = locale.digitization.declined;
    color = '#E6332A';
  }

  return {
    status,
    color,
  };
};

export const getInitialProductBranch = ({ isMain }: { isMain: boolean }) => ({
  name: null,
  tag: null,
  description: null,
  autoTypeId: null,
  autoBrandId: null,
  autoModelsIds: [],
  groupId: null,
  subgroupId: null,
  isMain,
});

export const getInitialProductFormValue = (product: IProduct) => {
  if (!product) return {};
  let result = {
    article: product.article,
    name: product.name,
    description: product?.description,
    manufacturer: product?.manufacturer,
    length: product?.length,
    width: product?.width,
    height: product?.height,
    weight: product?.weight,
  };
  for (let i = 0; i < (product?.branches || [])?.length; i++) {
    const branch = product?.branches[i];
    if (!branch) continue;
    const suffix = i === 0 ? '' : `-${i - 1}`;
    result = {
      ...result,
      ...getBranchFormValues(branch, suffix),
    };
  }
  return result;
};

export const getBranchFormValues = (branch: IProductBranch, suffix: string) => {
  return {
    ['tag' + suffix]: branch?.tag,
    ['description' + suffix]: branch?.description,
    ['autoTypeId' + suffix]: branch?.autoTypeId || 'none',
    ['autoBrandId' + suffix]: branch?.autoBrandId || 'none',
    ['autoModelIds' + suffix]: branch?.autoModelIds,
    ['groupId' + suffix]: branch?.groupId || 'none',
    ['subgroupId' + suffix]: branch?.subgroupId || 'none',
  };
};
