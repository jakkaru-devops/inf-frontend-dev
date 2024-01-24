import { IRegisterFile } from './interfaces';
import { SERVICE_DOCS } from 'data/files.data';

export const REGISTER_SELLER_FILE_LIST: IRegisterFile[] = [
  {
    label: 'user.passportMainPageDoc',
    name: 'Паспорт Главная',
    type: 'upload',
  },
  {
    label: 'user.passportReginstrationPageDoc',
    name: 'Паспорт Прописка',
    type: 'upload',
  },
  {
    label: 'user.innDoc',
    name: 'ИНН',
    type: 'upload',
  },
  {
    label: 'user.snilsDoc',
    name: 'СНИЛС',
    type: 'upload',
  },
  {
    label: 'user.personalDataProcessing',
    name: SERVICE_DOCS.PRIVACY_AGREEMENT.name,
    type: 'check',
    path: `${SERVICE_DOCS.PRIVACY_AGREEMENT.url}`,
  },
  {
    label: 'user.agencyContract',
    name: SERVICE_DOCS.SELLER_OFFER.name,
    type: 'check',
    path: `${SERVICE_DOCS.SELLER_OFFER.url}`,
  },
];

export const REGISTER_SELLER_TECHNICS_TYPE_ORDER = [
  { label: 'legkovye', image: '/img/catalog/main-cat-5.png' },
  { label: 'gruzovye', image: '/img/catalog/main-cat-2.png' },
  { label: 'kommercheskiiTransport', image: '/img/catalog/main-cat-3.png' },
  { label: 'spectehnika', image: '/img/catalog/main-cat-1.png' },
  { label: 'avtobusy', image: '/img/catalog/main-cat-4.png' },
];
