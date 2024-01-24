import { APP_PATHS } from 'data/paths.data';
import { BreadCrumbs, Page, PageTop } from 'components/common';
import { IUser } from 'sections/Users/interfaces';
import { IFileItem } from 'interfaces/files.interfaces';
import { IRowsWithCount, ISetState } from 'interfaces/common.interfaces';
import { FC } from 'react';
import { ICartProduct } from 'sections/Cart/interfaces/interfaces';
import CartRequestTab from './RequestTab';
import { useLocale } from 'hooks/locale.hook';

interface IProps {
  products?: IRowsWithCount<ICartProduct[]>;
  setProducts?: ISetState<IRowsWithCount<ICartProduct[]>>;
  sellers?: IRowsWithCount<IUser[]>;
  uploadedFiles?: IFileItem[];
}

const RequestPageContent: FC<IProps> = props => {
  const { locale } = useLocale();

  return (
    <Page>
      <BreadCrumbs
        list={[{ link: APP_PATHS.REQUEST, text: locale.common.request }]}
      />
      <PageTop title={locale.common.request} />
      <CartRequestTab {...props} />
    </Page>
  );
};

export default RequestPageContent;
