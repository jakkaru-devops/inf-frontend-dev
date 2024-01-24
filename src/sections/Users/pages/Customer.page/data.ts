import { ITabGroupItem } from 'components/common/TabGroup/interfaces';
import { IUser } from 'sections/Users/interfaces';

export const defineCustomerCardTabs = (user: IUser): ITabGroupItem[] => {
  const list: ITabGroupItem[] = [
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
      label: 'complaints',
      title: 'Жалобы',
      access: ['manager', 'operator'],
    },
    user?.isSpecialClient && {
      label: 'contracts',
      title: 'Договор с Inf',
      access: ['customer'],
    },
  ];
  return list.filter(Boolean);
};
