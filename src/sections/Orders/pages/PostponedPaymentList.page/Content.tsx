import {
  BreadCrumbs,
  EmptyListMark,
  Page,
  PageContent,
  PageTop,
  Pagination,
  Summary,
} from 'components/common';
import { useAuth } from 'hooks/auth.hook';
import { IRowsWithCount } from 'interfaces/common.interfaces';
import { FC, Fragment } from 'react';
import { IPostponedPayment } from 'sections/Orders/interfaces';
import PostponedPaymentListPageContentCustomer from './Content.customer';
import { APP_PATHS } from 'data/paths.data';
import PostponedPaymentListPageContentSeller from './Content.seller';

interface IProps {
  postponedPayments: IRowsWithCount<IPostponedPayment[]>;
}

const PostponedPaymentListPageContent: FC<IProps> = ({ postponedPayments }) => {
  const auth = useAuth();

  return (
    <Page>
      <BreadCrumbs
        list={[
          {
            link: APP_PATHS.POSTPONED_PAYMENT_LIST,
            text: 'Отсрочки',
          },
        ]}
      />
      <PageTop title="Отсрочки" />
      <PageContent>
        {!!postponedPayments?.rows?.length ? (
          <Fragment>
            {auth.currentRole.label === 'customer' && (
              <PostponedPaymentListPageContentCustomer
                postponedPayments={postponedPayments}
              />
            )}
            {auth.currentRole.label === 'seller' && (
              <PostponedPaymentListPageContentSeller
                postponedPayments={postponedPayments}
              />
            )}
          </Fragment>
        ) : (
          <EmptyListMark>Отсрочки не найдены</EmptyListMark>
        )}
      </PageContent>
      <Summary>
        {!!postponedPayments?.count && (
          <Pagination total={postponedPayments.count} pageSize={10} />
        )}
      </Summary>
    </Page>
  );
};

export default PostponedPaymentListPageContent;
