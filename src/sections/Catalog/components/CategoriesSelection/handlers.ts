import { useState, useEffect } from 'react';
import {
  IAutoBrand,
  IAutoType,
  IProductGroup,
} from 'sections/Catalog/interfaces/categories.interfaces';
import catalogService from 'sections/Catalog/catalog.service';
import { ICategoriesSelectionProps } from './interfaces';

export const useHandlers = ({
  initialData,
  defaultValues,
  selectedAutoBrands,
  setSelectedAutoBrands,
  selectedGroupIds,
  setSelectedGroupIds,
  onAutoTypeClick,
  onAutoBrandClick,
  onGroupClick,
  onDataLoaded,
}: ICategoriesSelectionProps) => {
  const [data, setData] = useState<ICategoriesSelectionProps['initialData']>(
    initialData || { autoTypes: [], autoBrands: [], groups: [] },
  );
  const [dataLoaded, setDataLoaded] = useState(!!initialData);
  const [selectedAutoTypeId, setSelectedAutoTypeId] = useState<IAutoType['id']>(
    defaultValues?.autoTypeId || data.autoTypes?.[0]?.id || null,
  );
  selectedAutoBrands = selectedAutoBrands || [];
  selectedGroupIds = selectedGroupIds || [];

  // Fetch categories if initialData is not provided
  useEffect(() => {
    if (!!initialData) return;
    const fetchData = async () => {
      const { autoTypes, autoBrands, groups } =
        await catalogService.getMainCategories({ groupsCatalog: 'side' });
      setData({ autoTypes, autoBrands, groups });

      if (
        !selectedAutoTypeId ||
        !autoTypes.find(el => el.id === selectedAutoTypeId)
      ) {
        setSelectedAutoTypeId(autoTypes?.[0]?.id); // set first autoType out of fetched ones as selected
      }

      setDataLoaded(true); // show categories instead of preloader
      if (!!onDataLoaded) onDataLoaded();
    };
    fetchData();
  }, []);

  const { autoTypes, groups } = data;
  const autoBrands = data.autoBrands.filter(el =>
    el?.autoTypeIds?.includes(selectedAutoTypeId),
  );

  const handleAutoTypeClick = (autoType: IAutoType) => {
    setSelectedAutoTypeId(autoType.id);
    if (!!onAutoTypeClick) onAutoTypeClick(autoType);
  };

  const handleAutoBrandClick = (autoBrand: IAutoBrand) => {
    if (!!setSelectedAutoBrands)
      setSelectedAutoBrands(prev =>
        !!prev.find(
          item =>
            item.autoTypeId === selectedAutoTypeId &&
            item.autoBrandId === autoBrand.id,
        )
          ? prev.filter(
              item =>
                !(
                  item.autoTypeId === selectedAutoTypeId &&
                  item.autoBrandId === autoBrand.id
                ),
            )
          : prev.concat({
              autoTypeId: selectedAutoTypeId,
              autoBrandId: autoBrand.id,
            }),
      );
    if (!!onAutoBrandClick) onAutoBrandClick(autoBrand);
  };

  const handleGroupClick = (group: IProductGroup) => {
    if (!!setSelectedGroupIds)
      setSelectedGroupIds(prev =>
        prev.includes(group.id)
          ? prev.filter(id => id !== group.id)
          : prev.concat(group.id),
      );
    if (!!onGroupClick) onGroupClick(group);
  };

  return {
    dataLoaded,
    selectedAutoTypeId,
    setSelectedAutoTypeId,
    selectedAutoBrands,
    setSelectedAutoBrands,
    selectedGroupIds,
    setSelectedGroupIds,
    autoTypes,
    groups,
    autoBrands,
    handleAutoTypeClick,
    handleAutoBrandClick,
    handleGroupClick,
  };
};
