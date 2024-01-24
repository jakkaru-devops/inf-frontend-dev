import { CSSProperties, FC, Fragment, useContext } from 'react';
import { ILaximoGroupsTree } from '../../../interfaces';
import { LaximoGroupListContext } from './GroupList';
import { Collapse } from 'components/common';
import { useRouter } from 'next/router';
import { generateUrl } from 'utils/common.utils';

interface RecursiveCollapseProps {
  groups: ILaximoGroupsTree[] | null;
  handleExpand: (unit: ILaximoGroupsTree, expanded: boolean) => void;
}

const LaximoGroupsRecursiveCollapse: FC<RecursiveCollapseProps> = ({
  groups,
  handleExpand,
}) => {
  const router = useRouter();
  const hasChildren = !!groups?.length;
  const { onGroupClick, currentGroupId } = useContext(LaximoGroupListContext);
  const linkStyles = (unit: ILaximoGroupsTree): CSSProperties =>
    unit.quickgroupid === currentGroupId ? { color: '#E6332A' } : {};

  return (
    <Fragment>
      {hasChildren &&
        groups.map(group => (
          <Fragment key={group.name}>
            {!!group?.childGroups ? (
              <Collapse
                key={group.name}
                isExpanded={group?.isExpanded}
                onChange={expanded => {
                  if (expanded && group.link) {
                    onGroupClick(group.quickgroupid);
                  }
                  handleExpand(group, expanded);
                }}
                className="catalog-external__product-groups__item w-100"
                name={group.name}
              >
                <LaximoGroupsRecursiveCollapse
                  groups={group.childGroups}
                  handleExpand={handleExpand}
                />
              </Collapse>
            ) : (
              <a
                onClick={() => onGroupClick(group.quickgroupid)}
                style={linkStyles(group)}
                className="item mt-5"
              >
                {group.name}
              </a>
            )}
          </Fragment>
        ))}
    </Fragment>
  );
};

export default LaximoGroupsRecursiveCollapse;
