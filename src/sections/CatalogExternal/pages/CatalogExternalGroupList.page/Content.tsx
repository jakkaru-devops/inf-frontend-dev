import {
  BreadCrumbs,
  Link,
  Page,
  PageContent,
  PageTop,
  Collapse,
} from 'components/common';
import { API_ENDPOINTS, APP_PATHS } from 'data/paths.data';
import { useLocale } from 'hooks/locale.hook';
import { useRouter } from 'next/router';
import { generateUrl } from 'utils/common.utils';
import { FC, Fragment } from 'react';
import { APIRequest } from 'utils/api.utils';
import {
  IAcatMark,
  IAcatModel,
  IAcatModification,
  IAcatProductGroup,
  IAcatType,
} from 'sections/CatalogExternal/interfaces';
import classNames from 'classnames';
import { getAcatModelFullName } from 'sections/CatalogExternal/utils';
import _ from 'lodash';
import { ISetState } from 'interfaces/common.interfaces';
import ExternalCatalogAcatGroupList from './GroupList';

interface IProps {
  data: {
    type: IAcatType;
    mark: IAcatMark;
    model: IAcatModel;
    modification: IAcatModification;
    groups: IAcatProductGroup[];
  };
}

const CatalogExternalGroupListPageContent: FC<IProps> = ({ data }) => {
  const { locale } = useLocale();

  return (
    <Page>
      <BreadCrumbs
        list={[
          {
            link: generateUrl(
              { expandedGroups: null },
              { pathname: APP_PATHS.CATALOG_EXTERNAL },
            ),
            text: locale.pages.catalogExternal.title,
          },
          {
            link: generateUrl(
              { autoType: data?.type?.id, expandedGroups: null },
              { pathname: APP_PATHS.CATALOG_EXTERNAL },
            ),
            text: data?.type?.name,
          },
          {
            link: generateUrl(
              { expandedGroups: null },
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
            link: generateUrl(
              {},
              {
                pathname: APP_PATHS.ACAT_GROUP_LIST(
                  data?.type?.id,
                  data?.mark?.id,
                  data?.model?.id,
                ),
              },
            ),
            text: data?.model?.name,
          },
          !!data?.modification && {
            link: generateUrl(
              {},
              {
                pathname: APP_PATHS.ACAT_MODIFICATION_GROUP_LIST(
                  data?.type?.id,
                  data?.mark?.id,
                  data?.model?.id,
                  data?.modification?.id,
                ),
              },
            ),
            text: data?.modification?.name,
          },
        ].filter(Boolean)}
        showPersonalAreaLink={false}
        useHistory={false}
      />
      <PageTop title={getAcatModelFullName(data?.mark, data?.model)} />
      <PageContent>
        <ExternalCatalogAcatGroupList {...data} />
      </PageContent>
    </Page>
  );
};

const AcatGroup: FC<{
  group: IAcatProductGroup;
  isChild?: boolean;
  data: IProps['data'];
  expandedGroupIds: string[];
  groups: IAcatProductGroup[];
  setGroups: ISetState<IAcatProductGroup[]>;
  setStateCounter: ISetState<number>;
}> = props => {
  const {
    group,
    isChild,
    data,
    expandedGroupIds,
    groups,
    setGroups,
    setStateCounter,
  } = props;
  const router = useRouter();

  const handleExpand = async (group: IAcatProductGroup, expanded: boolean) => {
    group.isExpanded = expanded;

    if (!group?.subGroups?.length) {
      const res = await APIRequest({
        method: 'get',
        url: API_ENDPOINTS.ACAT_GROUP_LIST,
        params: {
          autoType: router.query.autoType,
          autoBrand: router.query.autoBrand,
          autoModel: router.query.autoModel,
          modification: router.query?.restParams?.[0],
          group: group.id,
        },
      });
      const resData: { groups: IAcatProductGroup[] } = res.data;
      group.subGroups = resData.groups;
    }

    setGroups([...groups]);
    setStateCounter(prev => prev + 1);

    router.push(
      generateUrl({
        expandedGroups: _.uniq(
          expanded
            ? expandedGroupIds.concat(String(group.id))
            : expandedGroupIds.filter(el => el !== String(group.id)),
        ),
      }),
      null,
      {
        scroll: false,
      },
    );
  };

  return (
    <Collapse
      className={classNames('catalog-external__product-groups__item mb-15', {
        'w-100': isChild,
      })}
      isRoot={!isChild}
      isExpanded={group.isExpanded}
      onChange={expanded => handleExpand(group, expanded)}
      name={group.name}
      childrenLoading={
        (group.hasSubGroups || group.hasSubgroups) && !group?.subGroups?.length
      }
    >
      {(group?.hasSubgroups || group?.hasSubGroups) &&
        group.subGroups.map((subgroup, j) => (
          <Fragment key={j}>
            {!subgroup.hasSubgroups &&
            !subgroup.hasSubGroups &&
            !subgroup?.subGroups?.length ? (
              <Link
                href={generateUrl(
                  {
                    autoType: null,
                    autoBrand: null,
                    autoModel: null,
                    group: null,
                    subgroup: null,
                  },
                  {
                    pathname: !!data?.modification
                      ? APP_PATHS.ACAT_MODIFICATIONS_PARTS_LIST(
                          data?.type?.id,
                          data?.mark?.id,
                          data?.model?.id,
                          data?.modification?.id,
                          String(group?.id) + '--' + String(subgroup?.id),
                        )
                      : APP_PATHS.ACAT_PARTS_LIST(
                          data?.type?.id,
                          data?.mark?.id,
                          data?.model?.id,
                          String(group?.id) + '--' + String(subgroup?.id),
                        ),
                  },
                )}
                className="item mt-5"
              >
                {subgroup.name}
              </Link>
            ) : (
              <AcatGroup {...props} group={subgroup} isChild />
            )}
          </Fragment>
        ))}
    </Collapse>
  );
};

export default CatalogExternalGroupListPageContent;
