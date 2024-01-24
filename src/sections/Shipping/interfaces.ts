import { IDBEntity } from 'interfaces/common.interfaces';

export interface ITransportCompany extends IDBEntity {
  id: string;
  idInt: number;
  name: string;
  label: string;
  site: string;
  logoUrl: string;
  price?: string;
  calculateUrl: string;
  deliveryTerm?: string;
}

export type IShippingBody = {
  from_address: string;
  to_address: string;
  weight: number;
  length: number;
  width: number;
  height: number;
};
