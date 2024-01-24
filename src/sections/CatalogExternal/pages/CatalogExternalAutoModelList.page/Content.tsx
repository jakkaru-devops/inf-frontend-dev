import {
  BreadCrumbs,
  Link,
  Page,
  PageContent,
  PageTop,
} from 'components/common';
import { useLocale } from 'hooks/locale.hook';
import {
  IAcatMark,
  IAcatModel,
  IAcatType,
} from 'sections/CatalogExternal/interfaces';
import { generateUrl } from 'utils/common.utils';
import { APP_PATHS } from 'data/paths.data';
import { FC } from 'react';
import ExternalCatalogAcatAutoModels from './AutoModels';

interface IProps {
  data: {
    type: IAcatType;
    mark: IAcatMark;
    models: IAcatModel[];
  };
}

const CatalogExternalAutoModelListPageContent: FC<IProps> = ({ data }) => {
  const { locale } = useLocale();

  return (
    <Page>
      <BreadCrumbs
        list={[
          {
            link: generateUrl({}, { pathname: APP_PATHS.CATALOG_EXTERNAL }),
            text: locale.pages.catalogExternal.title,
          },
          {
            link: generateUrl(
              { autoType: data?.type?.id },
              { pathname: APP_PATHS.CATALOG_EXTERNAL },
            ),
            text: data?.type?.name,
          },
          {
            link: window.location.href,
            text: data?.mark?.name,
          },
        ]}
        showPersonalAreaLink={false}
        useHistory={false}
      />
      <PageTop title={data?.mark?.name} />
      <PageContent>
        <ExternalCatalogAcatAutoModels {...data} />
      </PageContent>
    </Page>
  );
};

export default CatalogExternalAutoModelListPageContent;
