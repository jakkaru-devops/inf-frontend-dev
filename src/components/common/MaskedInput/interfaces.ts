import { ChangeEvent } from 'react';
import { InputProps } from 'antd/lib/input';

export interface IMaskedInput extends InputProps {
  value?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  mask?: string;
  maskChar?: string;
  alwaysShowMask?: boolean;
  format?: IMaskedInputFormat;
}

export const MASKED_INPUT_FORMAT_OPTIONS = [
  'phoneNumber',
  'phoneConfirmationCode',
  'passportNumber',
  'passportNumberSeries',
  'passportNumberNumber',
  'passportLocationUnitCode',
  'date',
  'inn-10',
  'inn-12',
  'kpp',
  'bik',
  'rs',
  'ks',
  'bankCardNumber',
  'ogrnip',
  'ogrn',
  'snils',
  'postcode',
] as const;
export type IMaskedInputFormat = typeof MASKED_INPUT_FORMAT_OPTIONS[number];
