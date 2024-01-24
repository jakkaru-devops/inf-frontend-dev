import { IServiceDoc } from 'interfaces/files.interfaces';
import { PRIVACY_AGREEMENT_DOC_HTML } from './documents/privacyAgreement';

export const IMAGE_EXTENSIONS = [
  'jpg',
  'jpeg',
  'png',
  'tiff',
  'bmp',
  'gif',
  'webp',
  'svg',
];

export type IServiceDocLabel =
  | 'PRIVACY_AGREEMENT'
  | 'SHIPPING_RULES'
  | 'CUSTOMER_AGREEMENT'
  | 'PROVIDER_OFFER'
  | 'SELLER_OFFER'
  | 'REFUND_EXCHANGE_RULES'
  | 'INVOICE_TEMPLATE'
  | 'DELIVERY_OFFER';

export const SERVICE_DOCS: { [key in IServiceDocLabel]: IServiceDoc } = {
  PRIVACY_AGREEMENT: {
    name: 'Политика обработки персональных данных',
    url: `/documents/Политика обработки персональных данных.pdf`,
    html: PRIVACY_AGREEMENT_DOC_HTML,
  },
  SHIPPING_RULES: {
    name: 'Правила заключения договора поставки',
    url: `/documents/Правила заключения договора поставки.pdf`,
  },
  CUSTOMER_AGREEMENT: {
    name: 'Пользовательское соглашение для покупателей',
    url: `/documents/Пользовательское соглашение для Покупателей.pdf`,
  },
  PROVIDER_OFFER: {
    name: 'Оферта для поставщиков',
    url: `/documents/Оферта для Поставщиков.pdf`,
  },
  SELLER_OFFER: {
    name: 'Оферта для продавцов',
    url: `/documents/Оферта для Продавцов_Инфинитум.pdf`,
  },
  DELIVERY_OFFER: {
    name: 'Оферта договора поставки Инфинитум',
    url: '/documents/Оферта договора поставки Инфинитум.pdf',
  },
  REFUND_EXCHANGE_RULES: {
    name: 'Правила и условия Возврата/Обмена',
    url: `/documents/Правила и условия Возврата_Обмена.pdf`,
  },
  INVOICE_TEMPLATE: {
    name: 'Счет-договор',
    url: `/documents/Счет-договор.pdf`,
  },
};

export const AUDIO_EXTENSIONS = ['wav', 'ogg', 'mp3'];
