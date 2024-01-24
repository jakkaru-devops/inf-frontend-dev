import { Link, Collapse } from 'components/common';
import { API_ENDPOINTS, APP_PATHS } from 'data/paths.data';
import { useRouter } from 'next/router';
import { generateUrl } from 'utils/common.utils';
import { FC, Fragment, useEffect, useState } from 'react';
import { APIRequest } from 'utils/api.utils';
import {
  IAcatMark,
  IAcatModel,
  IAcatModification,
  IAcatProductGroup,
  IAcatType,
} from 'sections/CatalogExternal/interfaces';
import classNames from 'classnames';
import _ from 'lodash';
import { ISetState } from 'interfaces/common.interfaces';

interface IProps {
  type: IAcatType;
  mark: IAcatMark;
  model: IAcatModel;
  modification: IAcatModification;
  groups: IAcatProductGroup[];
  preventRouting?: boolean;
}

const ExternalCatalogAcatGroupList: FC<IProps> = data => {
  const router = useRouter();
  const expandedGroupIds = [].concat(
    router?.query?.expandedGroups || [],
  ) as string[];

  const [groups, setGroups] = useState<IAcatProductGroup[]>([]);
  const [stateCounter, setStateCounter] = useState(0);

  useEffect(() => {
    const initGroups = async () => {
      const newGroups: IAcatProductGroup[] = data?.groups.map(group => ({
        ...group,
        isExpanded: expandedGroupIds.includes(String(group.id)),
        subGroups: (group?.subGroups || []).map(subgroup => ({
          ...subgroup,
          isExpanded: expandedGroupIds.includes(String(subgroup.id)),
          subGroups: (subgroup?.subGroups || []).map(child => ({
            ...child,
            isExpanded: expandedGroupIds.includes(String(child.id)),
          })),
        })),
      }));
      const expandedGroups: IAcatProductGroup[] = [];

      for (const group of newGroups) {
        if (!group.isExpanded) continue;
        expandedGroups.push(group);
        if (
          (group.hasSubGroups || group.hasSubgroups) &&
          !group?.subGroups?.length
        ) {
          group.subGroups = await fetchSubgroups(group);
        }
        for (const subgroup of group?.subGroups || []) {
          if (!subgroup.isExpanded) continue;
          expandedGroups.push(subgroup);
          if (
            (subgroup.hasSubGroups || subgroup.hasSubgroups) &&
            !subgroup?.subGroups?.length
          ) {
            subgroup.subGroups = await fetchSubgroups(subgroup);
          }
          for (const child of subgroup?.subGroups || []) {
            if (!child.isExpanded) continue;
            expandedGroups.push(child);
            if (
              (child.hasSubGroups || child.hasSubgroups) &&
              !child?.subGroups?.length
            ) {
              child.subGroups = await fetchSubgroups(child);
            }
          }
        }
      }

      console.log('EXPANDED', expandedGroups);

      async function fetchSubgroups(group: IAcatProductGroup) {
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
        return resData.groups.map(group => ({
          ...group,
          isExpanded: expandedGroupIds.includes(String(group.id)),
        }));
      }

      setGroups([...newGroups]);
      setStateCounter(prev => prev + 1);
    };
    initGroups();
  }, []);

  return (
    <div className="catalog-external__product-groups">
      {!!groups &&
        groups.map((group, i) => (
          <AcatGroup
            key={group.id}
            group={group}
            data={data}
            expandedGroupIds={expandedGroupIds}
            groups={groups}
            setGroups={setGroups}
            setStateCounter={setStateCounter}
          />
        ))}
    </div>
  );
};

const AcatGroup: FC<{
  group: IAcatProductGroup;
  isChild?: boolean;
  data: IProps;
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

    if (!data?.preventRouting) {
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
    }
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

export default ExternalCatalogAcatGroupList;
