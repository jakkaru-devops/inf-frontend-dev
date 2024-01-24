import { IAddress } from 'interfaces/common.interfaces';

export interface YandexMapProps {
  defaultAddress?: IAddress;
  coords: [number, number];
  zoom: number;
  hasSearch?: boolean;
  onAddressChange?: (address: IAddress) => void;
  onModalCancel: () => void;
}

export type CoordsType = [number, number];
