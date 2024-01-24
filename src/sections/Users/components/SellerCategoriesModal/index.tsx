import { IModalPropsBasic } from 'components/common/Modal/interfaces';
import { API_ENDPOINTS } from 'data/paths.data';
import { FC, useState } from 'react';
import CategoriesSelectionModal from 'sections/Catalog/components/CategoriesSelectionModal';
import { ISellerAutoBrand, IUser } from 'sections/Users/interfaces';
import { APIRequest } from 'utils/api.utils';
import { openNotification } from 'utils/common.utils';

interface IProps extends IModalPropsBasic {
  user: IUser;
}

const SellerCategoriesModal: FC<IProps> = ({ user, ...rest }) => {
  if (!user) return <></>;

  const [selectedAutoBrands, setSelectedAutoBrands] = useState<
    ISellerAutoBrand[]
  >(JSON.parse(user?.sellerAutoBrandsJson) || []);
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>(
    JSON.parse(user?.sellerProductGroupsJson) || [],
  );
  const [submitAwaiting, setSubmitAwaiting] = useState(false);

  const resetCategories = () => {
    setSelectedAutoBrands([]);
    setSelectedGroupIds([]);
  };

  const handleSubmit = async () => {
    if (!selectedAutoBrands.length && !selectedGroupIds.length) {
      openNotification('Необходимо выбрать категории товаров');
      return;
    }

    if (submitAwaiting) return;
    setSubmitAwaiting(true);

    const res = await APIRequest({
      method: 'put',
      url: API_ENDPOINTS.SELLER_PRODUCT_CATEGORIES,
      data: {
        userId: user.id,
        autoBrands: selectedAutoBrands,
        productGroupIds: selectedGroupIds,
      },
      requireAuth: true,
    });
    setSubmitAwaiting(false);

    if (!res.isSucceed) {
      openNotification(res?.message);
      return;
    }
    openNotification('Категории продавца обновлены');
  };

  return (
    <CategoriesSelectionModal
      user={user}
      selectedAutoBrands={selectedAutoBrands}
      setSelectedAutoBrands={setSelectedAutoBrands}
      selectedGroupIds={selectedGroupIds}
      setSelectedGroupIds={setSelectedGroupIds}
      resetCategories={resetCategories}
      onSave={handleSubmit}
      saveAwaiting={submitAwaiting}
      {...rest}
    />
  );
};

export default SellerCategoriesModal;
