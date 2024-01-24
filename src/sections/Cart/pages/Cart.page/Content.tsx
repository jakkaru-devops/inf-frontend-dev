import { APP_PATHS } from 'data/paths.data';
import { BreadCrumbs, Page, PageTop } from 'components/common';
import CartSellersTab from './SellersTab';
import { useLocale } from 'hooks/locale.hook';
import { IJuristicSubject } from 'sections/JuristicSubject/interfaces';
import { FC } from 'react';

interface IProps {
  customerOrganizations: IJuristicSubject[];
}

const CartPageContent: FC<IProps> = ({ customerOrganizations }) => {
  const { locale } = useLocale();

  return (
    <Page>
      <BreadCrumbs
        list={[{ link: APP_PATHS.CART, text: locale.common.cart }]}
      />
      <PageTop title={locale.common.cart} />
      <CartSellersTab customerOrganizations={customerOrganizations} />
    </Page>
  );
};

export default CartPageContent;
