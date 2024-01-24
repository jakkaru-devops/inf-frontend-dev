import _ from 'lodash';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getAuth } from 'store/reducers/auth.reducer';

export const useAuth = () => {
  const authState = useSelector(getAuth);
  const auth = useMemo(() => _.cloneDeep(authState), [authState]);
  return auth;
};
