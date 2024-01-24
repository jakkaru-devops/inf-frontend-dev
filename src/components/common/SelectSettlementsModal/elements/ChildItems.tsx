import { FC } from 'react';
import { useUID } from 'react-uid';
import { ChildItem } from './ChildItem';
import { IChildItems } from '../interfaces';

/**
 * @description Uses for view column of settlements or regions.s
 * @param {*} {
 *   regions,
 *   savedRegions,
 *   setSavedRegions,
 *   isRegions,
 * }
 * @returns {FC<IChildItems>} Column of settlements with checkboxes.
 */
const ChildItems: FC<IChildItems> = ({
  regions,
  savedRegions,
  setSavedRegions,
  isRegions,
  selectedSettlements,
  regionId,
  mode,
}) => {
  const { cities, settlements } = regions.reduce(
    (result, region) => {
      const isCity = region.shortname === 'г' || region.shortname === 'г.';
      const { cities, settlements } = result;
      if (isCity) {
        cities.push(region);
        return result;
      }
      settlements.push(region);
      return result;
    },
    { cities: [], settlements: [] },
  );

  console.log('cities', cities, settlements);

  return (
    <div className="regions-items">
      {cities.map(region => (
        <ChildItem
          key={useUID()}
          region={region}
          savedRegions={savedRegions}
          setSavedRegions={setSavedRegions}
          isRegion={!!!region.parentguid}
          selectedSettlements={selectedSettlements}
          regionId={!!!region.parentguid ? region.fias_id : regionId}
          mode={mode}
        />
      ))}
      {!!cities.length && !isRegions && <div className="regions-items__br" />}
      {settlements.map(region => (
        <ChildItem
          key={useUID()}
          region={region}
          savedRegions={savedRegions}
          setSavedRegions={setSavedRegions}
          isRegion={!!!region.parentguid}
          selectedSettlements={selectedSettlements}
          regionId={!!!region.parentguid ? region.fias_id : regionId}
          mode={mode}
        />
      ))}
      {!!settlements.length && !isRegions && (
        <div className="regions-items__br" />
      )}
    </div>
  );
};

export { ChildItems };
