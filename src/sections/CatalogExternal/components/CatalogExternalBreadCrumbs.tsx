import { BreadCrumbs } from 'components/common';
import { APP_PATHS } from 'data/paths.data';
import { useLocale } from 'hooks/locale.hook';
import { useRouter } from 'next/router';
import { generateUrl } from 'utils/common.utils';
import { IBreadCrumbsItem } from '../interfaces';
import { FC } from 'react';

export const CatalogExternalBreadCrumbs: FC<{
  breadcrumbs: IBreadCrumbsItem[];
  laximo?: boolean;
}> = ({ breadcrumbs, laximo }) => {
  breadcrumbs = breadcrumbs?.slice(1);

  const { locale } = useLocale();
  const router = useRouter();

  const linkSerializer = (crumb: IBreadCrumbsItem, index) => {
    if (laximo) {
      return `${APP_PATHS.CATALOG_EXTERNAL}/laximo/${crumb.url}`;
    }
    return ((router?.query?.params as string[]) || [])
      .concat(crumb.url)
      .filter((item, j) => j <= index)
      .join('/');
  };

  return (
    <BreadCrumbs
      list={[
        {
          link: generateUrl({}, { pathname: APP_PATHS.CATALOG_EXTERNAL }),
          text: locale.pages.catalogExternal.title,
        },
        ...breadcrumbs.map((item, i) => ({
          link:
            i > 0
              ? linkSerializer(item, i)
              : generateUrl(
                  { autoType: item.url },
                  {
                    pathname: APP_PATHS.CATALOG_EXTERNAL,
                  },
                ),
          text: item.name,
        })),
      ]}
      showPersonalAreaLink={false}
      useHistory={false}
    />
  );
};
