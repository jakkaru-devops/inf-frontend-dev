import { FormInstance } from 'antd';
import { Dispatch, SetStateAction } from 'react';

export interface IAddressInputGroupProps {
  title: string;
  form: FormInstance<any>;
  prefix: string;
  editable?: boolean;
  onChange?: (context: IAddressContext) => void;
  className?: string;
  comparedData?: any;
}

export interface IAddressInputProps {
  form: FormInstance<any>;
  context: IAddressContext;
  setContext: Dispatch<SetStateAction<IAddressContext>>;
  target: IAddressTarget;
  prefix: string;
  options?: {
    [key: string]: IAddressSuggestion[];
  };
  setOptions?: Dispatch<SetStateAction<IAddressInputProps['options']>>;
  placeholder?: string;
  required?: boolean;
  hintText?: string;
  disabled?: boolean;
  fiasIdRequired?: boolean;
  searchDisabled?: boolean;
  bound?: { from: IAddressTarget; to: IAddressTarget };
  className?: string;
  inputClassName?: string;
  comparedValue?: string;
}

export type IAddressTarget =
  | 'country'
  | 'region'
  | 'area'
  | 'city'
  | 'settlement'
  | 'street'
  | 'building'
  | 'apartment'
  | 'postcode';

export interface IAddressContext {
  country: string;
  countryIsoCode: string;
  region: string;
  regionWithType?: string;
  regionFiasId: string;
  area: string;
  areaWithType?: string;
  areaFiasId: string;
  city: string;
  cityWithType?: string;
  cityFiasId: string;
  settlement: string;
  settlementFiasId: string;
  street: string;
  building: string;
  apartment: string;
  postcode: string;
}

export interface IAddressSuggestion {
  value: string;
  fiasId: string;
  context: IAddressContext;
}
