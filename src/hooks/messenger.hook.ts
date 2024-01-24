import _ from 'lodash';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getMessenger } from 'store/reducers/messenger.reducer';

export const useMessenger = () => {
  const messengerState = useSelector(getMessenger);
  const messenger = useMemo(
    () => _.cloneDeep(messengerState),
    [messengerState],
  );
  return messenger;
};
