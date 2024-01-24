import { IProduct } from 'sections/Catalog/interfaces/products.interfaces';

export interface ICartProductBasic {
  productId: string;
  priceOfferId?: number;
  isSelected?: boolean;
  deliveryMethod?: string;
  quantity: number;
  acatProductId?: string;
  createdAt: string;
}

export interface ICartProduct extends ICartProductBasic {
  id?: string;
  product?: IProduct;
  updatedAt?: string;
  deletedAt?: string;
}
