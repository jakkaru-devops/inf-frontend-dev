import { IAddress } from 'interfaces/common.interfaces';
import {
  IAutoBrand,
  IAutoModel,
  IAutoType,
  IProductGroup,
} from 'sections/Catalog/interfaces/categories.interfaces';
import {
  IProduct,
  IProductPriceOffer,
} from 'sections/Catalog/interfaces/products.interfaces';
import { IOrganization } from 'sections/Organizations/interfaces';
import { IUser } from 'sections/Users/interfaces';

export interface ISaleProduct extends Omit<IProduct, 'sale'> {
  sale?: {
    id?: number;
    organizationId: IOrganization['id'];
    organization?: IOrganization;
    supplierAddress?: IAddress;
    userId: IUser['id'];
    user?: IUser;
    price: number;
    previousPrice: number;
    amount: number;
    priceOfferId?: IProductPriceOffer['id'];
  };
  categories?: ICategoriesSaleProduct;
}

export interface ICategoriesSaleProduct {
  autoType?: IAutoType;
  autoBrand?: IAutoBrand;
  autoModels?: IAutoModel[];
  group?: IProductGroup;
  subgroup?: IProductGroup;
}
