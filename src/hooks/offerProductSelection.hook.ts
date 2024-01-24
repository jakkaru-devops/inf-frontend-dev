import _ from 'lodash';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getOfferProductSelection } from 'store/reducers/offerProductSelection.reducer';

export const useOfferProductSelection = () => {
  const offerProductSelectionState = useSelector(getOfferProductSelection);
  const offerProductSelection = useMemo(
    () => _.cloneDeep(offerProductSelectionState),
    [offerProductSelectionState],
  );
  return offerProductSelection;
};
