import { API_ENDPOINTS, APP_PATHS } from 'data/paths.data';
import { useAuth } from 'hooks/auth.hook';
import { useNotifications } from 'hooks/notifications.hooks';
import { IRowsWithCount } from 'interfaces/common.interfaces';
import { useRouter } from 'next/router';
import { ChangeEvent, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  IAutoBrand,
  IAutoType,
  IProductGroup,
} from 'sections/Catalog/interfaces/categories.interfaces';
import { IUser } from 'sections/Users/interfaces';
import { APIRequest } from 'utils/api.utils';
import { generateInnerUrl, generateUrl } from 'utils/common.utils';
import jsCookie from 'js-cookie';
import addDate from 'date-fns/add';
import { STRINGS } from 'data/strings.data';
import { setAuth } from 'store/reducers/auth.reducer';

interface IProps {
  autoTypes: IRowsWithCount<IAutoType[]>;
  autoBrands: IRowsWithCount<IAutoBrand[]>;
  productGroups: IRowsWithCount<IProductGroup[]>;
}

export const useHandlers = ({
  autoTypes,
  autoBrands: autoBrandsInit,
  productGroups,
}: IProps) => {
  const auth = useAuth();
  const dispatch = useDispatch();
  const router = useRouter();
  const { fetchUnreadNotificationsCount } = useNotifications();
  const [usersName, setUsersName] = useState(router.query?.search);
  const [searchTimeout, setSearchTimeout] = useState(null as NodeJS.Timeout);
  const [selectedAutoType, setSelectedAutoType] = useState(
    router.query?.autoType as string,
  );
  const [autoBrands, setAutoBrands] = useState<IRowsWithCount<IAutoBrand[]>>(
    autoBrandsInit || {
      rows: [],
      count: 0,
    },
  );
  const [selectedUser, setSelectedUser] = useState<IUser>(null);
  const [groupSearch, setGroupSearch] = useState<string>(null);
  const [autoBrandSearch, setAutoBrandSearch] = useState<string>(null);
  const filteredGroups = !!groupSearch
    ? productGroups.rows.filter(el =>
        el.name.toLowerCase().includes(groupSearch.trim().toLowerCase()),
      )
    : productGroups.rows;
  const filteredAutoBrands = !!autoBrandSearch
    ? autoBrands.rows.filter(el =>
        el.name.toLowerCase().includes(autoBrandSearch.trim().toLowerCase()),
      )
    : autoBrands.rows;

  useEffect(() => {
    setAutoBrands(autoBrandsInit);
  }, [autoBrandsInit]);

  const handleNameFilterChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Set value to state
    setUsersName(value);
    // Clear timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    // Request
    setSearchTimeout(
      setTimeout(async () => {
        router.push(
          generateUrl({
            search: value,
            page: 1,
          }),
        );
      }, 500),
    );
  };

  const handleMainCategoryChange = (catId: string | null) => {
    if (!catId) {
      setSelectedAutoType(null);
      router.push(generateUrl({ group: null }));
    }
    const isAutoType = autoTypes.rows.some(autoType => autoType.id === catId);
    if (isAutoType) {
      setSelectedAutoType(catId);
      fetchAutoBrands({ autoTypeId: catId });
    } else {
      setSelectedAutoType(null);
      router.push(
        generateUrl({ autoType: null, autoBrand: null, group: catId }),
      );
    }
  };

  const fetchAutoBrands = async ({
    autoTypeId,
    search,
  }: {
    autoTypeId: string;
    search?: string;
  }) => {
    const autoBrandsRes = await APIRequest({
      method: 'get',
      url: API_ENDPOINTS.AUTO_BRAND_LIST,
      params: {
        autoType: autoTypeId,
        search,
      },
    });
    if (autoBrandsRes.isSucceed) setAutoBrands(autoBrandsRes.data);
  };

  const handleAutoBrandChange = (autoBrandId: string) => {
    router.push(
      generateUrl({
        autoType: selectedAutoType,
        autoBrand: autoBrandId,
        group: null,
      }),
    );
  };

  const handleGroupFilterSearch = (value: string) => {
    setGroupSearch(value);
  };

  const handleAutoBrandFilterSearch = (value: string) => {
    setAutoBrandSearch(value);
  };

  return {
    router,
    usersName,
    handleNameFilterChange,
    handleMainCategoryChange,
    selectedAutoType,
    groupSearch,
    handleGroupFilterSearch,
    filteredGroups,
    handleAutoBrandChange,
    autoBrandSearch,
    handleAutoBrandFilterSearch,
    filteredAutoBrands,
    setSelectedUser,
    selectedUser,
  };
};
