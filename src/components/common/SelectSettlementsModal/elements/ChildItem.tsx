import { FC, useState } from 'react';
import { Checkbox } from 'antd';
import { APIRequest } from 'utils/api.utils';
import { API_ENDPOINTS } from 'data/paths.data';
import { ChildItems } from './ChildItems';
import { IChildItem, TRegion } from '../interfaces';
import classnames from 'classnames';

/**
 * @description Settlement title with ant checkbox. Bold title, if isRegion true. Opening a childs below, if checked is true.
 * @param {*} {
 *   region,
 *   savedRegions,
 *   setSavedRegions,
 *   isRegion,
 *   selectedSettlements,
 *   regionId,
 * }
 * @returns {FC<IChildItem>} Settlement with checkbox.
 */
const ChildItem: FC<IChildItem> = ({
  region,
  savedRegions,
  setSavedRegions,
  isRegion,
  selectedSettlements,
  regionId,
  mode,
}) => {
  const id = region?.fias_id || region?.aoid;
  const regionRootId = isRegion ? region.fias_id : regionId;
  const selectedChilds = savedRegions.filter(
    ({ parentguid }) => id === parentguid,
  );
  const savedRegion = savedRegions.find(
    ({ fias_id, aoid }) => id === fias_id || id === aoid,
  );
  const [childs, setChilds] = useState(selectedChilds);
  const [isShowChilds, setIsShowChilds] = useState(false);
  const isSavedSelected = selectedSettlements?.some(el => el.fiasId === id);
  const isSavedRegionPartSelected = selectedSettlements?.some(
    el => el.regionId === id,
  );
  const isSelect =
    typeof savedRegion?.isSelect === 'undefined'
      ? isSavedSelected
      : savedRegion.isSelect;
  const isRegionPartSelected =
    typeof savedRegion?.isRegionPartSelected === 'undefined'
      ? isSavedRegionPartSelected
      : savedRegion.isRegionPartSelected;

  const count = region.organizationBranchCount
    ? ` (${region.organizationBranchCount})`
    : '';

  const title = `${region.shortname || ''} ${
    region.name_with_type || region.formalname
  }${count}`;

  const toggleSelectRegion = () => {
    const isRegionExist = region.fias_id
      ? savedRegions.some(({ fias_id }) => region.fias_id === fias_id)
      : true;
    const withRegion = isRegionExist ? savedRegions : [...savedRegions, region];

    // Set to all of regions&settlements isSelect toggle.
    const newSelectedRegions = withRegion.map(selectRegion => {
      const selectRegionId = selectRegion?.fias_id || selectRegion?.aoid;

      const isChild = childs.some(child => {
        const childId = child?.fias_id || child?.aoid;
        const selectedChildsId = savedRegions
          .filter(({ parentguid }) => childId === parentguid)
          .map(({ fias_id, aoid }) => fias_id || aoid);
        return (
          selectRegionId === childId ||
          selectedChildsId.includes(selectRegionId)
        );
      });

      if (selectRegionId === id || isChild) {
        return {
          ...selectRegion,
          isSelect: !isSelect,
          regionId: regionRootId,
        };
      }
      return selectRegion;
    });

    // Check if at least one of regions child is select.
    const isPartRootSelected = newSelectedRegions.some(
      el => el.regionId === regionRootId && el.isSelect,
    );

    // Set isRegionPartSelected for root target region
    const newSelectedRegionsWithRegion = newSelectedRegions.map(
      selectRegion => {
        const selectRegionId = selectRegion?.fias_id || selectRegion?.aoid;
        if (selectRegionId === regionId) {
          return {
            ...selectRegion,
            isRegionPartSelected: selectRegion.isSelect
              ? false
              : isPartRootSelected,
          };
        }
        return selectRegion;
      },
    );

    setSavedRegions(newSelectedRegionsWithRegion);
  };

  const toggleChilds = async () => {
    if (!childs.length) {
      const fiasId = region?.fias_id || region?.aoguid;
      const result = await APIRequest<TRegion[]>({
        method: 'get',
        url: API_ENDPOINTS.REGION_CHILD(fiasId),
        params: {
          mode,
        },
        requireAuth: true,
      });
      let data = result.data;
      console.log(data);
      data = result.data.map(regionChild => ({
        ...regionChild,
        regionId: regionRootId,
      }));
      if (isSelect) {
        data = result.data.map(regionChild => ({
          ...regionChild,
          isSelect,
          regionId: regionRootId,
        }));
      }

      const newSavedRegions = [...savedRegions, ...data];
      setSavedRegions(newSavedRegions);
      setChilds(data);
    }
    setIsShowChilds(!isShowChilds);
  };

  const disabled = !region?.['organizationBranchCount'];

  return (
    <div className={classnames('regions-items__item', { isRegion, disabled })}>
      <div
        className={classnames('regions-items__item__title-wrap', { isRegion })}
      >
        <Checkbox
          className="regions-items__item__title-wrap__checkbox checkbox-disabled-dark"
          checked={isSelect}
          onChange={toggleSelectRegion}
          indeterminate={isRegionPartSelected}
          disabled={disabled}
        />
        <span
          className="regions-items__item__title-wrap__title"
          onClick={isRegion && !disabled ? () => toggleChilds() : null}
          style={disabled ? { cursor: 'not-allowed' } : {}}
        >
          {title}
        </span>
      </div>

      {childs.length && isShowChilds ? (
        <div className="regions-items__item__childs">
          <ChildItems
            regions={childs}
            savedRegions={savedRegions}
            setSavedRegions={setSavedRegions}
            selectedSettlements={selectedSettlements}
            regionId={regionRootId}
            mode={mode}
          />
        </div>
      ) : null}
      {!childs.length && isShowChilds && (
        <span className="regions-items__item__childs--none">
          Еще нет зарегистрированных организаций
        </span>
      )}
    </div>
  );
};

export { ChildItem };
