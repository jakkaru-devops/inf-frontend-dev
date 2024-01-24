import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { convertAddressToString } from 'components/common/YandexMap/utils';
import { STRINGS } from 'data/strings.data';
import { IAddress, IRowsWithCount } from 'interfaces/common.interfaces';
import {
  generateUrl,
  getInitialAddress,
  isClientSide,
  openNotification,
  stripString,
} from 'utils/common.utils';
import { API_ENDPOINTS, APP_PATHS } from 'data/paths.data';
import { APIRequest } from 'utils/api.utils';
import { useLocale } from 'hooks/locale.hook';
import {
  IAutoBrand,
  IAutoType,
  IProductGroup,
} from 'sections/Catalog/interfaces/categories.interfaces';
import { IOrderRequest } from 'sections/Orders/interfaces';
import { validateCustomOrder } from './utils';
import { DEFAULT_NAV_PATHS } from 'data/nav.data';
import { MAX_ORDER_REQUEST_COMMENT_LENGTH } from 'data/common.data';
import { ISellerAutoBrand } from 'sections/Users/interfaces';
import moment from 'moment';
import { useAuth } from 'hooks/auth.hook';

interface IProps {
  autoTypes: IRowsWithCount<IAutoType[]>;
}

const useHandlers = ({ autoTypes }: IProps) => {
  const auth = useAuth();
  const { locale } = useLocale();
  const router = useRouter();

  // states
  const [savedRegions, setSavedRegions] = useState(
    JSON.parse(localStorage.getItem(STRINGS.CUSTOM_ORDER.SETTLEMENTS) || '[]'),
  );
  const [deliveryAddress, setDeliveryAddress] = useState<IAddress>(
    localStorage.getItem(STRINGS.CUSTOM_ORDER.DELIVERY_ADDRESS)
      ? JSON.parse(localStorage.getItem(STRINGS.CUSTOM_ORDER.DELIVERY_ADDRESS))
      : getInitialAddress(),
  );
  const [settlementsModalVisible, setSettlementsModalVisible] = useState(false);
  const [selectedSellerIds, setSelectedSellerIds] = useState<string[]>(
    !!localStorage.getItem(STRINGS.CUSTOM_ORDER.SELLERS)
      ? JSON.parse(localStorage.getItem(STRINGS.CUSTOM_ORDER.SELLERS))
      : auth.user?.savedSellerIds || [],
  );
  const [saveSelectedSellers, setSaveSelectedSellers] = useState(
    !!localStorage.getItem(STRINGS.CUSTOM_ORDER.SAVE_SELLERS)
      ? localStorage.getItem(STRINGS.CUSTOM_ORDER.SAVE_SELLERS) === '1'
      : !!auth.user?.savedSellerIds,
  );
  const [filesUploading, setFilesUploading] = useState(false);
  const [submitAwaiting, setSubmitAwaiting] = useState(false);

  const [selectedAutoTypeId, setSelectedAutoTypeId] = useState<string>(
    localStorage.getItem(STRINGS.CUSTOM_ORDER.AUTO_TYPE) &&
      localStorage.getItem(STRINGS.CUSTOM_ORDER.AUTO_BRANDS)
      ? localStorage.getItem(STRINGS.CUSTOM_ORDER.AUTO_TYPE)
      : autoTypes?.rows?.[0]?.id,
  );
  const [selectedAutoBrands, setSelectedAutoBrands] = useState<
    ISellerAutoBrand[]
  >(
    localStorage.getItem(STRINGS.CUSTOM_ORDER.AUTO_BRANDS)
      ? JSON.parse(localStorage.getItem(STRINGS.CUSTOM_ORDER.AUTO_BRANDS)) || []
      : [],
  );
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>(
    localStorage.getItem(STRINGS.CUSTOM_ORDER.PRODUCT_GROUPS)
      ? JSON.parse(localStorage.getItem(STRINGS.CUSTOM_ORDER.PRODUCT_GROUPS)) ||
          []
      : [],
  );

  const [categorySelectionVisible, setCategorySelectionVisible] =
    useState(false);

  const [details, setDetails] = useState<{
    quantity: number;
    description: string;
  }>({
    quantity: Number(localStorage.getItem(STRINGS.CUSTOM_ORDER.QUANTITY) || 0),
    description: localStorage.getItem(STRINGS.CUSTOM_ORDER.DESCRIPTION) || null,
  });

  const [isDeliveryAddressModalVisible, setIsDeliveryAddressModalVisible] =
    useState(false);

  const [uploadedFileIds, setUploadedFileIds] = useState<string[] | []>(
    localStorage.getItem(STRINGS.CUSTOM_ORDER.FILES)
      ? JSON.parse(localStorage.getItem(STRINGS.CUSTOM_ORDER.FILES))
      : [],
  );

  const [paymentDate, setPaymentDate] = useState<moment.Moment>(null);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [postponedPaymentEnabled, setPostponedPaymentEnabled] = useState(false);

  const disabledPaymentDate = (current: moment.Moment) =>
    !!current &&
    (current < moment().endOf('day') || current > moment().add({ days: 30 }));

  const addressStr = convertAddressToString(deliveryAddress);
  const allowCreateOrder = validateCustomOrder({
    autoBrands: selectedAutoBrands,
    productGroupIds: selectedGroupIds,
    quantity: details.quantity,
    description: details.description,
    uploadedFileIds,
    deliveryAddress,
    paymentPostponedAt: !!paymentDate
      ? paymentDate.format('yyyy.MM.DD').toString()
      : null,
  }).result;

  useEffect(() => {
    if (!autoTypes) return;
    setSelectedAutoTypeId(autoTypes?.rows?.[0]?.id);
  }, [autoTypes]);

  useEffect(() => {
    localStorage.setItem(
      STRINGS.CUSTOM_ORDER.DELIVERY_ADDRESS,
      JSON.stringify(deliveryAddress),
    );
  }, [deliveryAddress]);

  useEffect(() => {
    localStorage.setItem(
      STRINGS.CUSTOM_ORDER.FILES,
      JSON.stringify(uploadedFileIds),
    );
  }, [uploadedFileIds]);

  useEffect(() => {
    localStorage.setItem(
      STRINGS.CUSTOM_ORDER.SELLERS,
      JSON.stringify(selectedSellerIds),
    );
  }, [selectedSellerIds]);

  useEffect(() => {
    localStorage.setItem(
      STRINGS.CUSTOM_ORDER.SAVE_SELLERS,
      saveSelectedSellers ? '1' : '0',
    );
  }, [saveSelectedSellers]);

  useEffect(() => {
    localStorage.setItem(
      STRINGS.CUSTOM_ORDER.SETTLEMENTS,
      JSON.stringify(savedRegions),
    );
  }, [savedRegions]);

  // handlers
  const handleAutoTypeClick = (autoType: IAutoType) => {
    setSelectedAutoTypeId(autoType.id);
    localStorage.setItem(STRINGS.CUSTOM_ORDER.AUTO_TYPE, autoType.id);
  };

  const handleAutoBrandClick = (autoBrand: IAutoBrand) => {
    const newValue = !selectedAutoBrands.find(
      item =>
        item.autoTypeId === selectedAutoTypeId &&
        item.autoBrandId === autoBrand.id,
    )
      ? selectedAutoBrands.concat({
          autoTypeId: selectedAutoTypeId,
          autoBrandId: autoBrand.id,
        })
      : selectedAutoBrands.filter(
          item =>
            !(
              item.autoTypeId === selectedAutoTypeId &&
              item.autoBrandId === autoBrand.id
            ),
        );
    setSelectedAutoBrands(newValue);
    localStorage.setItem(
      STRINGS.CUSTOM_ORDER.AUTO_BRANDS,
      JSON.stringify(newValue),
    );
    // setSelectedGroupIds([]);
    // localStorage.removeItem(STRINGS.CUSTOM_ORDER.PRODUCT_GROUPS);
  };

  const handleGroupClick = (productGroup: IProductGroup) => {
    const newValue = !selectedGroupIds.includes(productGroup.id)
      ? selectedGroupIds.concat(productGroup.id)
      : selectedGroupIds.filter(el => el !== productGroup.id);
    setSelectedGroupIds(newValue);
    localStorage.setItem(
      STRINGS.CUSTOM_ORDER.PRODUCT_GROUPS,
      JSON.stringify(newValue),
    );
    // setSelectedAutoBrands([]);
    // localStorage.removeItem(STRINGS.CUSTOM_ORDER.AUTO_BRANDS);
  };

  const resetCategories = () => {
    setSelectedAutoTypeId(autoTypes?.rows?.[0]?.id);
    setSelectedAutoBrands([]);
    localStorage.removeItem(STRINGS.CUSTOM_ORDER.AUTO_BRANDS);
    setSelectedGroupIds([]);
    localStorage.removeItem(STRINGS.CUSTOM_ORDER.PRODUCT_GROUPS);
  };

  const handleQuantityChange = (quantity: number) => {
    setDetails(details => ({ ...details, quantity }));
    localStorage.setItem(STRINGS.CUSTOM_ORDER.QUANTITY, quantity.toString());
  };

  const handleDescriptionChange = (description: string) => {
    setDetails(details => ({ ...details, description }));
    localStorage.setItem(STRINGS.CUSTOM_ORDER.DESCRIPTION, description);
  };

  const handleFilesUpload = fileIds => {
    console.log('fileIds', fileIds);
    setUploadedFileIds(uploadedFileIds => [
      ...uploadedFileIds.filter(id => !fileIds.includes(id)),
      ...fileIds,
    ]);
  };

  const handleFileDelete = fileId =>
    setUploadedFileIds(uploadedFileIds =>
      uploadedFileIds.filter(id => fileId !== id),
    );

  const handlePaymentDateChange = (date: moment.Moment) => {
    setPaymentDate(date);
    setPostponedPaymentEnabled(!!date);
  };

  const handlePostponedPaymentEnabledChange = (value: boolean) => {
    if (!paymentDate) {
      setDatePickerOpen(true);
      return;
    }
    setPostponedPaymentEnabled(value);
  };

  const createRequest = async () => {
    if (!allowCreateOrder) return;

    if (!addressStr) {
      openNotification('Укажите адрес доставки для отправки запроса');
      return;
    }
    if (filesUploading) {
      openNotification('Не все файлы загружены полностью');
      return;
    }
    if (
      stripString(details?.description)?.length >
      MAX_ORDER_REQUEST_COMMENT_LENGTH
    ) {
      openNotification(
        `Максимальная длина описания товара - ${MAX_ORDER_REQUEST_COMMENT_LENGTH} символов`,
      );
      return;
    }

    if (!auth.isAuthenticated) {
      openNotification(
        'Для отправки запроса необходимо зарегистрироваться или войти в аккаунт',
      );
      router.push(
        generateUrl(
          { [STRINGS.QUERY.SEND_CUSTOM_ORDER_REQUEST]: 1, history: null },
          { pathname: APP_PATHS.LOGIN_CUSTOMER },
        ),
      );
      return;
    }
    const settlements = savedRegions.filter(settlement => settlement.isSelect);

    setSubmitAwaiting(true);

    const res = await APIRequest({
      method: 'post',
      url: API_ENDPOINTS.ORDER_REQUEST,
      data: {
        products: [
          {
            describedProductData: {
              description: details?.description || null,
              fileIds: uploadedFileIds,
              autoTypeId: selectedAutoTypeId,
              autoBrands: selectedAutoBrands,
              productGroupIds: selectedGroupIds,
            },
            quantity: details.quantity,
          },
        ],
        deliveryAddress,
        selectedSellerIds,
        saveSelectedSellers,
        settlements,
        paymentPostponedAt: postponedPaymentEnabled
          ? paymentDate.format('yyyy.MM.DD')
          : null,
      },
      requireAuth: true,
    });

    setSubmitAwaiting(false);

    if (!res.isSucceed) {
      openNotification(res?.message);
      return;
    }

    const orderRequest: IOrderRequest = res.data;

    isClientSide() && window.localStorage.removeItem(STRINGS.SELECTED_REGIONS);
    setSavedRegions([]);
    // Remove custom order data from localStorage
    Object.keys(STRINGS.CUSTOM_ORDER).forEach(key => {
      if (STRINGS.CUSTOM_ORDER[key] !== 'customRequestDeliveryAddress') {
        localStorage.removeItem(STRINGS.CUSTOM_ORDER[key]);
      }
    });

    openNotification(`${locale.other.requestSent}`);

    router.push(
      generateUrl(
        {
          history: DEFAULT_NAV_PATHS.ORDER_REQUEST(
            orderRequest.id,
            orderRequest.idOrder,
          ),
        },
        {
          pathname: APP_PATHS.ORDER_REQUEST(orderRequest.id),
        },
      ),
    );
  };

  return {
    auth,
    locale,

    deliveryAddress,
    selectedAutoTypeId,
    selectedAutoBrands,
    setSelectedAutoBrands,
    selectedGroupIds,
    setSelectedGroupIds,
    details,

    categorySelectionVisible,
    setCategorySelectionVisible,
    isDeliveryAddressModalVisible,
    setIsDeliveryAddressModalVisible,
    settlementsModalVisible,
    setSettlementsModalVisible,
    selectedSellerIds,
    setSelectedSellerIds,
    saveSelectedSellers,
    setSaveSelectedSellers,
    submitAwaiting,
    filesUploading,
    setFilesUploading,
    savedRegions,
    setSavedRegions,
    paymentDate,
    disabledPaymentDate,
    postponedPaymentEnabled,
    datePickerOpen,
    setDatePickerOpen,
    handlePaymentDateChange,
    handlePostponedPaymentEnabledChange,

    handlers: {
      setDeliveryAddress,
      handleAutoTypeClick,
      handleAutoBrandClick,
      handleGroupClick,
      resetCategories,
      handleQuantityChange,
      handleDescriptionChange,
      handleFilesUpload,
      handleFileDelete,
    },

    router,
    allowCreateOrder,
    createRequest,
  };
};

export default useHandlers;
