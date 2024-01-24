import {
  BreadCrumbs,
  Link,
  Page,
  PageContent,
  PageTop,
  Pagination,
  Table,
} from 'components/common';
import { APP_PATHS } from 'data/paths.data';
import { useLocale } from 'hooks/locale.hook';
import { useRouter } from 'next/router';
import { generateUrl } from 'utils/common.utils';
import { FC, useMemo } from 'react';
import {
  IAcatMark,
  IAcatModel,
  IAcatModification,
  IAcatType,
} from 'sections/CatalogExternal/interfaces';
import { getAcatModelFullName } from 'sections/CatalogExternal/utils';

interface IProps {
  data: {
    type: IAcatType;
    mark: IAcatMark;
    model: IAcatModel;
    modifications: IAcatModification[];
    page: number;
    pages: number[];
  };
}

const CatalogExternalAutoModelModificationsPageContent: FC<IProps> = ({
  data,
}) => {
  const router = useRouter();
  const { locale } = useLocale();

  const modifications = data?.modifications;

  const addEngineCol = useMemo(
    () =>
      modifications.filter(
        mod => !!mod?.parameters?.find(el => el.key === 'engine'),
      ).length > 0,
    [],
  );
  const addTransmissionCol = useMemo(
    () =>
      modifications.filter(
        mod => !!mod?.parameters?.find(el => el.key === 'transmission'),
      ).length > 0,
    [],
  );

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
            link: generateUrl(
              {},
              {
                pathname: APP_PATHS.ACAT_MODEL_LIST(
                  data?.type?.id,
                  data?.mark?.id,
                ),
              },
            ),
            text: data?.mark?.name,
          },
          {
            link: window.location.href,
            text: data?.model?.name,
          },
        ]}
        showPersonalAreaLink={false}
        useHistory={false}
      />
      <PageTop
        title={`Модификации ${getAcatModelFullName(data?.mark, data?.model)}`}
      />
      <PageContent>
        <Table
          cols={[
            { content: 'Название', width: '23%' },
            { content: 'Год', width: '10%' },
            addEngineCol && { content: 'Двигатель', width: '18%' },
            addTransmissionCol && { content: 'Трансмиссия', width: '12%' },
            { content: 'Регион', width: '15%' },
            { content: 'Описание', style: { flex: '1' } },
          ].filter(Boolean)}
          rows={modifications.map(mod => ({
            cols: [
              {
                content: mod?.name,
                href: generateUrl(
                  {},
                  {
                    pathname: APP_PATHS.ACAT_MODIFICATION_GROUP_LIST(
                      data?.type?.id,
                      data?.mark?.id,
                      data?.model?.id,
                      mod?.id,
                    ),
                  },
                ),
                style: {
                  paddingLeft: 15,
                  textAlign: 'left',
                  justifyContent: 'flex-start',
                },
              },
              {
                content:
                  mod?.parameters?.find(el => el.key === 'year')?.value || '-',
              },
              addEngineCol && {
                content:
                  mod?.parameters?.find(el => el.key === 'engine')?.value ||
                  '-',
              },
              addTransmissionCol && {
                content:
                  mod?.parameters?.find(el => el.key === 'transmission')
                    ?.value || '-',
              },
              {
                content:
                  mod?.parameters?.find(el => el.key === 'sales_region')
                    ?.value || '-',
              },
              {
                content: mod?.description || '-',
                style: {
                  paddingLeft: 15,
                  textAlign: 'left',
                },
              },
            ],
          }))}
        />
        {!!data?.pages?.length && (
          <Pagination
            total={data?.pages?.length * 25}
            pageSize={25}
            wrapClassName="mt-10"
            wrapStyle={{ justifyContent: 'left' }}
          />
        )}
      </PageContent>
    </Page>
  );
};

export default CatalogExternalAutoModelModificationsPageContent;
