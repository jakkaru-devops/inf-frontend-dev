import { BreadCrumbs, Page, PageContent, PageTop } from 'components/common';
import { APP_PATHS } from 'data/paths.data';
import { useLocale } from 'hooks/locale.hook';
import { useRouter } from 'next/router';
import { FC } from 'react';
import {
  IAutoBrandExternal,
  IAutoTypeExternal,
} from 'sections/Catalog/interfaces/categories.interfaces';
import { generateUrl } from 'utils/common.utils';
import ExternalCatalogCategories from './Categories';

const CatalogExternalPageContent: FC<{
  autoTypes: IAutoTypeExternal[];
}> = ({ autoTypes }) => {
  const { locale } = useLocale();
  const router = useRouter();
  const selectedAutoType = (router.query?.autoType ||
    autoTypes?.[0]?.value) as string;

  const handleAutoTypeClick = (autoType: IAutoTypeExternal) => {
    router.push(generateUrl({ autoType: autoType.value }));
  };

  const handleLaximoAutoBrandClick = (autoBrand: IAutoBrandExternal) => {
    router.push(
      generateUrl(
        {
          orderRequestId: router.query?.orderRequestId,
          history: router.query?.history,
          autoType: null,
          laximoType: autoBrand.urlType,
        },
        {
          pathname: `${router.route}/laximo/${autoBrand.code}`,
          removeCurrentParams: true,
        },
      ),
    );
  };

  const handleAcatAutoBrandClick = (autoBrand: IAutoBrandExternal) => {
    router.push(
      generateUrl(
        {
          orderRequestId: router.query?.orderRequestId,
          history: router.query?.history,
          autoType: null,
        },
        {
          pathname: `${router.route}/acat/${selectedAutoType}/${autoBrand.value}`,
          removeCurrentParams: true,
        },
      ),
    );
  };

  return (
    <Page>
      <BreadCrumbs
        list={[
          {
            link: APP_PATHS.CATALOG_EXTERNAL,
            text: locale.pages.catalogExternal.title,
          },
        ]}
        showPersonalAreaLink={false}
      />
      <PageTop title={locale.pages.catalogExternal.title} />
      <PageContent>
        <ExternalCatalogCategories
          autoTypes={autoTypes}
          selectedAutoType={selectedAutoType}
          onAutoTypeClick={handleAutoTypeClick}
          onLaximoAutoBrandClick={handleLaximoAutoBrandClick}
          onAcatAutoBrandClick={handleAcatAutoBrandClick}
        />
      </PageContent>
    </Page>
  );
};

export default CatalogExternalPageContent;
