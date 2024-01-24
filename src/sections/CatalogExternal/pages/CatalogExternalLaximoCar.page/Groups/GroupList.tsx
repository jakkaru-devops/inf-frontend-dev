import { ILaximoGroupsTree } from '../../../interfaces';
import { CSSProperties, FC, useState, createContext, useMemo } from 'react';
import { Button } from 'antd';
import LaximoGroupsRecursiveCollapse from './RecursiveCollapse';
import { Collapse } from 'components/common';
import { useRouter } from 'next/router';
import { generateUrl } from 'utils/common.utils';
import _ from 'lodash';

interface IProps {
  groups: ILaximoGroupsTree;
  currentGroupId: string;
  onGroupClick: (groupId: string) => void;
  toggleList?: () => void;
  style?: CSSProperties;
  preventRouting?: boolean;
}

export const LaximoGroupListContext = createContext<{
  onGroupClick: (groupId: string) => void;
  currentGroupId?: string;
}>(null);

const LaximoGroupList: FC<IProps> = ({
  groups: groupsInit,
  onGroupClick,
  currentGroupId,
  toggleList,
  style,
  preventRouting,
}) => {
  const router = useRouter();
  const expandedGroupIds = [].concat(
    router?.query?.expandedGroups || [],
  ) as string[];
  const [groups, setGroups] = useState<ILaximoGroupsTree[]>(
    groupsInit.childGroups[0].childGroups.map(group => ({
      ...group,
      isExpanded: expandedGroupIds.includes(String(group.quickgroupid)),
      childGroups: (group?.childGroups || []).map(subgroup => ({
        ...subgroup,
        isExpanded: expandedGroupIds.includes(String(subgroup.quickgroupid)),
        childGroups: (subgroup?.childGroups || []).map(child => ({
          ...child,
          isExpanded: expandedGroupIds.includes(String(child.quickgroupid)),
        })),
      })),
    })),
  );
  const [stateCounter, setStateCounter] = useState(0);

  const handleExpand = (group: ILaximoGroupsTree, expanded: boolean) => {
    group.isExpanded = expanded;

    setGroups([...groups]);
    setStateCounter(prev => prev + 1);

    if (!preventRouting) {
      router.push(
        generateUrl({
          expandedGroups: _.uniq(
            expanded
              ? expandedGroupIds.concat(String(group.quickgroupid))
              : expandedGroupIds.filter(
                  el => el !== String(group.quickgroupid),
                ),
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
    <LaximoGroupListContext.Provider
      value={{
        onGroupClick,
        currentGroupId,
      }}
    >
      <div style={style || { minWidth: 300 }}>
        {!!toggleList && (
          <Button
            style={{ marginBottom: 15 }}
            type={'primary'}
            onClick={toggleList}
          >
            Перейти в список узлов
          </Button>
        )}
        {groups.map(group => (
          <Collapse
            key={group.quickgroupid}
            className="catalog-external__product-groups__item catalog-external__product-groups__item--root mb-15"
            isRoot
            isExpanded={group?.isExpanded}
            onChange={expanded => handleExpand(group, expanded)}
            name={group.name}
          >
            <LaximoGroupsRecursiveCollapse
              groups={group.childGroups}
              handleExpand={handleExpand}
            />
          </Collapse>
        ))}
      </div>
    </LaximoGroupListContext.Provider>
  );
};

export default LaximoGroupList;
