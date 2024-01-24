import { BreadCrumbs, Container, Page, PageTop } from 'components/common';
import { APP_PATHS } from 'data/paths.data';
import { useLocale } from 'hooks/locale.hook';
import TableMetricsCompany from '../../components/TableMetrics/TableMetricsCompany';
import TableTopCompany from '../../components/TableTopCompany/TableTopCompany';
import { IMetrics, ITopCustomer } from '../../interfaces';

interface IProps {
  metrics: IMetrics;
  topCustomers: ITopCustomer[];
}

const MetricsPageContent = ({ metrics, topCustomers }: IProps) => {
  const { locale } = useLocale();

  return (
    <Page>
      <BreadCrumbs
        list={[
          {
            link: APP_PATHS.METRICS,
            text: locale.common.metrics,
          },
        ]}
      />
      <PageTop title={locale.common.metrics} />
      <Container className="metrics">
        <TableMetricsCompany {...metrics} />
        <TableTopCompany topCustomers={topCustomers} />
      </Container>
    </Page>
  );
};

export default MetricsPageContent;
