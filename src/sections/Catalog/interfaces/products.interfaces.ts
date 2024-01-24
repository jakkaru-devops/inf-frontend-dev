import { INotification } from 'hooks/notifications.hooks/interfaces';
import { IDBEntity } from 'interfaces/common.interfaces';
import { IFileItem, IServerFile } from 'interfaces/files.interfaces';
import { IOrder } from 'sections/Orders/interfaces';
import { IUser } from 'sections/Users/interfaces';
import {
  IAutoBrand,
  IAutoModel,
  IAutoType,
  IProductGroup,
} from './categories.interfaces';
import { ILanguage } from 'locales/interfaces';
import { IOrganization } from 'sections/Organizations/interfaces';

export interface IProductCategoryType extends IDBEntity {
  categorySectionId?: string;
  parentId?: string;
  nestingLevel: number;
  name: string;
  name_ru: string;
  name_en: string;
  translates?: IPrdouctCategoryTypeTranslate[];
  categories?: IProductCategory[];
}

export interface IProductCategoryTypeExtended extends IProductCategoryType {
  selectedCategoryId?: IProductCategory['id'];
  searchValue?: string;
  isVisible?: boolean;
}

export interface IPrdouctCategoryTypeTranslate extends IDBEntity {
  productCategoryTypeId: IProductCategoryType['id'];
  languageId: ILanguage['id'];
  name: string;
}

export interface IProductCategory extends IDBEntity {
  children: IProductCategory[];
  parents: IProductCategory[];
  categoryTypeId: IProductCategoryType['id'];
  categorySectionId: IProductCategory['id'];
  name: string;
  label: string;
  imageFileId?: string;
  image?: IFileItem;
  translate?: IProductCategoryTranslate;
  translates?: IProductCategoryTranslate[];
  relations?: IProductCategoryRelation[];
  isSelected?: boolean;
  favorite: boolean;
  name_ru?: string;
  name_en?: string;
}

export interface IProductCategoryTranslate extends IDBEntity {
  productCategoryId: IProductCategory['id'];
  languageId: ILanguage['id'];
  name: string;
}

export interface IProductCategoryRelation extends IDBEntity {
  categorySectionId: IProductCategory['id'];
  parentCategoryTypeId: IProductCategoryType['id'];
  parentId: IProductCategory['id'];
  childCategoryTypeId: IProductCategoryType['id'];
  childId: IProductCategory['id'];
}

export interface IProductToCategoryRelation extends IDBEntity {
  categoryId: IProductCategory['id'];
  category?: IProductCategory;
  productId: IProduct['id'];
}

export interface IProduct extends IDBEntity {
  status: number;
  name?: string;
  translate?: {
    name: string;
  };
  preview?: string;
  description?: string;
  manufacturer?: string;
  article: string;
  weight: number;
  length: number;
  width: number;
  height: number;
  autoTypes?: IAutoType[];
  autoBrands?: IAutoBrand[];
  autoModels?: IAutoModel[];
  groups?: IProductGroup[];
  subgroups?: IProductGroup[];
  previewFileId?: string;
  acatProductId?: string;
  productFiles?: IProductFile[];
  productOffer?: IProductOffer;
  productOffers?: IProductOffer[];
  parents?: IProduct[];
  applicabilities?: IProductApplicability[];
  analogs?: IProduct[];
  recommendedProducts?: IProduct[];
  hasApplicabilities?: boolean;
  hasAnalogs?: boolean;
  branches?: IProductBranch[];
  minPrice?: number;
}

export interface IProductBranch extends IDBEntity {
  sourceBranchId?: string;
  name?: string;
  tag?: string;
  description?: string;
  manufacturer?: string;
  autoTypeId?: string;
  autoType?: IAutoType;
  autoBrandId?: string;
  autoBrand?: IAutoBrand;
  autoModelIds?: string[];
  autoModels?: IAutoModel[];
  groupId?: string;
  group?: IProductGroup;
  subgroupId?: string;
  subgroup?: IProductGroup;
  subgroups?: IProductGroup[];
  isMain: boolean;
}

export interface IDescribedProduct extends IDBEntity {
  preview: string;
  description: string;
  autoBrandId?: string;
  autoBrand?: IAutoBrand;
  autoBrandIds?: string[];
  autoBrandsData?: Array<{
    autoTypeId: string;
    autoType?: IAutoType;
    autoBrandId: string;
    autoBrand?: IAutoBrand;
  }>;
  productGroupId?: string;
  productGroup: IProductGroup;
  productGroupIds?: string[];
  productGroups?: IProductGroup[];
  productFiles?: IProductFile[];
  attachments: IAttachment[];
}

export interface IProductApplicability extends IDBEntity {
  productId: string;
  product?: IProduct;
  autoTypeId?: string;
  autoType?: IAutoType;
  autoBrandId?: string;
  autoBrand?: IAutoBrand;
  autoBrandName?: string;
  autoModelId?: string;
  autoModel?: IAutoModel;
  autoModelName?: string;
  article: string;
  autoBrandInputMode?: 'id' | 'name';
  autoModelInputMode?: 'id' | 'name';
}

export interface IProductFile extends IDBEntity {
  productId: IProduct['id'];
  product?: IProduct;
  fileId: string;
  file?: IServerFile;
}

export interface IFavoriteProduct extends IDBEntity {
  userId: string;
  productId: string;
  product?: IProduct;
  acatProductId?: string;
  priceOfferId?: IProductPriceOffer['id'];
  organization?: {
    id: IOrganization['id'];
    name: string;
  };
}

export interface IProductOffer {
  id?: string;
  idInt?: number;
  sellerId: IUser['id'];
  seller?: IUser;
  productId?: IProduct['id'];
  product?: IProduct;
  status: number;
  comment?: string;
  addedRating?: number;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
  sourceProduct?: IProduct;
  notifications?: INotification[];
  unreadNotifications?: INotification[];
}

export interface IProductBasic {
  id?: string;
  idInt?: number;
  status: number;
  article: string;
  weight: number;
  length: number;
  width: number;
  height: number;
  previewFileId?: string;
  productFiles: IProductFile[];
  productOffer?: IProductOffer;
  productOffers?: IProductOffer[];
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
}

export interface IProductCommon extends IProductBasic {
  name: string;
  desc?: string;
}

export interface IProductExtended extends IProductBasic {
  translates: IProductTranslate[];
}

export interface IProductTranslate {
  id?: string;
  idInt?: number;
  productId?: IProduct['id'];
  product?: IProduct;
  languageId: string;
  languageLabel: string;
  name: string;
  desc?: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
}

export interface IProductCategoryToUserRelation extends IDBEntity {
  userId: IUser['id'];
  categoryId: IProductCategory['id'];
  category?: IProductCategory;
}

export interface IAttachment {
  id?: IDBEntity['id'];
  userId?: IUser['id'];
  orderId?: IOrder['id'];
  group?:
    | 'attachment'
    | 'invoice'
    | 'accountingDocument'
    | 'acceptanceCertificate'
    | 'waybill'
    | 'check'
    | 'specification';
  name: string;
  ext: string;
  url?: string;
  localUrl?: string;
}

export interface IProductPriceOffer {
  id: number;
  organization: {
    id: IOrganization['id'];
    name: string;
  };
  address: {
    settlement: string;
  };
  seller: {
    id: IUser['id'];
    fullName: string;
    firstName: string;
    lastName: string;
    middleName: string;
    ratingValue: number;
    reviewsNumber: number;
    salesNumber: number;
  };
  warehouse: {
    id: string;
  };
  productName: string;
  manufacturer: string;
  productAmount: number;
  price: number;
  previousPrice?: number;
  quantity?: number;
}

export interface IProductPriceOfferGroup {
  organization: {
    id: IOrganization['id'];
    name: string;
    inn: string;
  };
  productName: string;
  productAmount: number;
  minPrice: number;
  children: IProductPriceOffer[];
  isExpanded?: boolean;
}

export interface ISupplier {
  id: string;
  name: string;
  inn: string;
}
