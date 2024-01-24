import _ from 'lodash';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getCatalogExternalState } from 'store/reducers/catalogExternal.reducer';

export const useCatalogExternal = () => {
  const catalogExternalState = useSelector(getCatalogExternalState);
  const catalogExternal = useMemo(
    () => _.cloneDeep(catalogExternalState),
    [catalogExternalState],
  );
  return catalogExternal;
};
