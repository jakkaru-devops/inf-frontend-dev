import {
  BreadCrumbs,
  Container,
  Page,
  PageContent,
  PageTop,
  PageTopPanel,
  Table,
} from 'components/common';
import { APP_PATHS } from 'data/paths.data';
import { IRowsWithCount } from 'interfaces/common.interfaces';
import { FC } from 'react';
import { IAutoType } from 'sections/Catalog/interfaces/categories.interfaces';

interface IProps {
  autoTypes: IRowsWithCount<IAutoType[]>;
}

const AutoTypeListPageContent: FC<IProps> = ({ autoTypes }) => {
  return (
    <Page>
      <BreadCrumbs
        list={[
          { link: APP_PATHS.ALL_PRODUCT_CATEGORIES, text: 'Категории товаров' },
          { link: APP_PATHS.AUTO_TYPE_LIST, text: 'Виды' },
        ]}
      />
      <PageTop title="Виды" />
      <PageTopPanel>
        <Container></Container>
      </PageTopPanel>
      <PageContent>
        <Table
          cols={[
            {
              content: null,
              width: '100%',
            },
          ]}
          rows={autoTypes.rows.map(item => ({
            cols: [
              {
                content: (
                  <div className="d-flex align-items-center">
                    <span>{item.name}</span>
                  </div>
                ),
              },
            ],
          }))}
          hideHead
        />
      </PageContent>
    </Page>
  );
};

export default AutoTypeListPageContent;
