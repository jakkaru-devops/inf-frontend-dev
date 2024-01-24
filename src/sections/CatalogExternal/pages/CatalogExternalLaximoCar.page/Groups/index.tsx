import { FC, Fragment, useEffect, useState } from 'react';
import {
  ILaximoGroupsTree,
  ILaximoQuickUnitsWithDetails,
  ILaximoVehicle,
} from 'sections/CatalogExternal/interfaces';
import { useRouter } from 'next/router';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import UnitInfoWithDetails from '../UnitInfoWithDetails';
import { APIRequest } from 'utils/api.utils';
import { API_ENDPOINTS } from 'data/paths.data';
import LaximoGroupList from './GroupList';
import { openNotification } from 'utils/common.utils';

interface IProps {
  carInfo: ILaximoVehicle;
  groups: ILaximoGroupsTree;
  currentSsd: string;
  toggleList?: () => void;
  onUnitClick?: (unit: ILaximoQuickUnitsWithDetails) => void;
  preventRouting?: boolean;
}

const LaximoGroupsWrapper: FC<IProps> = ({
  carInfo,
  groups,
  currentSsd,
  toggleList,
  onUnitClick,
  preventRouting,
}) => {
  const router = useRouter();
  const [currentGroupId, setCurrentGroupId] = useState<string>(
    router?.query?.currentGroupId as string,
  );
  const [details, setDetails] = useState<any[]>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const handleGroupClick = async (groupId: string) => {
    console.log('groupId', groupId);
    setDetails(null);
    setDetailsLoading(true);
    setCurrentGroupId(groupId);

    const res = await APIRequest({
      method: 'get',
      url: API_ENDPOINTS.LAXIMO_UNIT_INFO_IN_GROUP(carInfo.urlType),
      params: {
        vehicleId: carInfo.vehicleid,
        groupId: groupId,
        catalogCode: carInfo.catalog,
        ssd: currentSsd,
      },
    });
    setDetailsLoading(false);

    if (!res.isSucceed) {
      openNotification(res?.message);
      return;
    }
    console.log('res.data', res.data);
    setDetails(res.data);

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    const groupId = router?.query?.currentGroupId as string;
    if (!groupId) return;
    handleGroupClick(groupId);
  }, [router?.query?.currentGroupId]);

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <LaximoGroupList
        groups={groups}
        currentGroupId={currentGroupId}
        onGroupClick={handleGroupClick}
        toggleList={toggleList}
        preventRouting={preventRouting}
      />
      <div>
        {details &&
          details.map((category, index) => (
            <Fragment key={`${category.categoryid}_${index}`}>
              <h2>{category.name}</h2>
              {category.units.map((unit, index) => (
                <UnitInfoWithDetails
                  key={`${index}_${unit.name}`}
                  unit={unit}
                  autoModelName={carInfo.name}
                  brandName={carInfo.brand}
                  laximoType={carInfo.urlType}
                  onUnitClick={onUnitClick}
                />
              ))}
            </Fragment>
          ))}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            opacity: '1',
            transition: 'opacity .5s',
          }}
        >
          <Spin
            spinning={detailsLoading}
            indicator={<LoadingOutlined style={{ fontSize: 50 }} />}
          />
        </div>
      </div>
    </div>
  );
};

export default LaximoGroupsWrapper;
