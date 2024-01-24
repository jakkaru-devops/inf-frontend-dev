import { useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import { API_ENDPOINTS } from 'data/paths.data';
import { APIRequest } from 'utils/api.utils';

interface IProps {
  orderRequestId: string;
  regionsInit: any[];
  mode?: 'sale';
}

const useHandlers = ({ orderRequestId, regionsInit, mode }: IProps) => {
  const dispatch = useDispatch();
  const [regions, setRegions] = useState(null);
  const [selectedSettlements, setSelectedSettlements] = useState(null);
  const [savedRegions, setSavedRegions] = useState(regionsInit || []);

  useEffect(() => {
    getRegions().then(data => {
      if (!data) return;
      setRegions(data);
      // a thing for trigger react component
      const unIncludedRegions = data.filter(
        region =>
          !savedRegions.some(
            savedRegion => savedRegion.fias_id === region.fias_id,
          ),
      );
      const newSavedRegions = [...savedRegions, ...unIncludedRegions];
      setSavedRegions(
        newSavedRegions.map(el => ({
          ...el,
          isSelect: el.isRegionPartSelected ? false : el.isSelect,
          isRegionPartSelected: el.isSelect ? false : el.isRegionPartSelected,
        })),
      );
    });
    if (orderRequestId) {
      getSelectedSettlements().then(data => setSelectedSettlements(data));
    }
  }, []);

  const getRegions = async () => {
    const regionsResponse = await APIRequest<any>({
      method: 'get',
      url: API_ENDPOINTS.REGIONS,
      params: {
        mode,
      },
      requireAuth: true,
    });
    return regionsResponse.data || null;
  };

  const getSelectedSettlements = async () => {
    const selectedSettlementsResponse = await APIRequest<any>({
      method: 'get',
      url: API_ENDPOINTS.SELECTED_REGIONS,
      requireAuth: true,
      params: { orderRequestId },
    });

    return selectedSettlementsResponse.data || null;
  };

  return {
    dispatch,
    regions,
    selectedSettlements,
    savedRegions,
    setSavedRegions,
  };
};

export { useHandlers };
