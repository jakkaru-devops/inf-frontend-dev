import { ITabGroupItem } from 'components/common/TabGroup/interfaces';
import { IAuthState } from 'store/reducers/auth.reducer';

export const defineSellerCardTabs = (auth: IAuthState): ITabGroupItem[] => [
  {
    label: '',
    title: 'Личные данные',
    access: ['customer', 'manager', 'operator', 'seller'],
  },
  {
    label: 'organizations',
    title: 'Организации',
    access: ['customer', 'manager', 'operator', 'seller'],
  },
  {
    label: 'reviews',
    title: 'Отзывы',
    access: ['customer', 'manager', 'operator', 'seller'],
  },
  {
    label: 'transport-companies',
    title: 'Транспортные компании',
    access: ['customer', 'manager', 'operator', 'seller'],
  },
  {
    label: 'complaints',
    title: 'Жалобы',
    access: ['manager', 'operator'],
  },
  {
    label: 'specialClients',
    title: 'Особые клиенты',
    access: auth?.user?.isServiceSeller ? ['seller'] : [],
  },
];
