import { IMaskedInputFormat } from './interfaces';

export const getFormatInputMask = (format: IMaskedInputFormat) => {
  switch (format) {
    case 'phoneNumber':
      return '+7(999) 999-99-99';
    case 'phoneConfirmationCode':
      return '9'.repeat(6);
    case 'passportNumber':
      return '99 99 999999';
    case 'passportNumberSeries':
      return '99 99';
    case 'passportNumberNumber':
      return '9'.repeat(6);
    case 'passportLocationUnitCode':
      return '999-999';
    case 'date':
      return '99.99.9999';
    case 'inn-10':
      return `9`.repeat(10);
    case 'inn-12':
      return `9`.repeat(12);
    case 'kpp':
      return `9`.repeat(9);
    case 'bik':
      return `9`.repeat(9);
    case 'rs':
      return `9`.repeat(20);
    case 'ks':
      return `9`.repeat(20);
    case 'bankCardNumber':
      return `9999 9999 9999 9999`;
    case `ogrnip`:
      return `9`.repeat(15);
    case `ogrn`:
      return `9`.repeat(13);
    case `snils`:
      return `999-999-999 99`;
    case 'postcode':
      return `9`.repeat(6);
    default:
      return null;
  }
};
