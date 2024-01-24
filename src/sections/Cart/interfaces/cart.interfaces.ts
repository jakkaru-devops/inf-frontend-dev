import { IAddress } from 'interfaces/common.interfaces';
import { IProduct } from 'sections/Catalog/interfaces/products.interfaces';
import { IPostponedPayment } from 'sections/Orders/interfaces';
import { IOrganization } from 'sections/Organizations/interfaces';
import { IUser } from 'sections/Users/interfaces';

export interface ICartOffer {
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
  organization: {
    id: IOrganization['id'];
    name: string;
    inn: string;
    address: IAddress;
    hasNds: boolean;
  };
  warehouse: {
    id: string;
  };
  products: ICartOfferProduct[];
  deliveryMethod: string;
  postponedPayment?: IPostponedPayment;
}

export interface ICartOfferProduct {
  product: IProduct;
  unitPrice: number;
  availabledAmount: number;
  quantity: number;
  isSelected: boolean;
  priceOfferId: number;
  sale?: {
    id: number;
  };
}
