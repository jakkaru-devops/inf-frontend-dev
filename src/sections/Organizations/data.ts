import { SERVICE_DOCS } from 'data/files.data';
import { IRegisterFile } from 'sections/Auth/interfaces';

export const REGISTER_ORG_FILE_LIST: IRegisterFile[] = [
  {
    label: 'org.passportDoc',
    name: 'Паспорт (главная, прописка)',
    entityTypes: ['ИП'],
    type: 'upload',
  },
  {
    label: 'org.statuteDoc',
    name: 'Устав',
    entityTypes: ['REST'],
    type: 'upload',
  },
  {
    label: 'org.innDoc',
    name: 'ИНН',
    type: 'upload',
  },
  {
    label: 'org.ogrnipDoc',
    name: 'ОГРНИП',
    entityTypes: ['ИП'],
    type: 'upload',
  },
  {
    label: 'org.ogrnDoc',
    name: 'ОГРН',
    entityTypes: ['REST'],
    type: 'upload',
  },
  {
    label: 'org.cardDoc',
    name: 'Карточка предприятия',
    type: 'upload',
  },
  {
    label: 'org.offerForSuppliers',
    name: SERVICE_DOCS.PROVIDER_OFFER.name,
    type: 'check',
    path: SERVICE_DOCS.PROVIDER_OFFER.url,
  },
  {
    label: 'org.supplyAgreementRules',
    name: SERVICE_DOCS.SHIPPING_RULES.name,
    type: 'check',
    path: SERVICE_DOCS.SHIPPING_RULES.url,
  },
];

// RUS keys
export const ORGANIZATION_TYPES = {
  АО: '12200',
  ПАО: '12247',
  НАО: '12267',
  ООО: '12300',
  ИП: '50102',
};
