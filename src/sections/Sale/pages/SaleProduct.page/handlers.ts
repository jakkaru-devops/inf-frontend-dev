import { API_SERVER_URL } from 'config/env';
import { API_ENDPOINTS_V2 } from 'data/api.data';
import { DEFAULT_NAV_PATHS } from 'data/nav.data';
import { APP_PATHS } from 'data/paths.data';
import { useAuth } from 'hooks/auth.hook';
import { useLocale } from 'hooks/locale.hook';
import { IAddress } from 'interfaces/common.interfaces';
import { useRouter } from 'next/router';
import { useRef } from 'react';
import { useCallback, useState } from 'react';
import { ISaleProduct } from 'sections/Sale/interfaces/sale.interfaces';
import { APIRequest } from 'utils/api.utils';
import { generateUrl, openNotification } from 'utils/common.utils';

interface IProps {
  product: ISaleProduct;
}

export const useHandlers = ({ product }: IProps) => {
  const imageGalleryRef = useRef(null);
  const router = useRouter();
  const { locale } = useLocale();
  const auth = useAuth();
  const [count, setCount] = useState(1);
  const [deletionModalVisible, setDeletionModalVisible] = useState(false);
  const [deletionSubmitting, setDeletionSubmitting] = useState(false);
  const [preview, setPreview] = useState({
    previewVisible: false,
    previewImage: '',
    activePhotoIndex: 0,
    currentPhotoIndex: 0,
  });
  const [orgBranch, setOrgBranch] = useState<{
    address: IAddress;
    orgName: string;
  }>(null);
  const { sale } = product;
  const disabledUp = count >= sale.amount;
  const disabledDown = count <= 1;

  const categories = product?.categories;
  const sellerName = `
    ${sale?.user?.lastname} ${sale?.user?.firstname} ${sale?.user?.middlename}`;

  const imageUrl = !!product.productFiles[0]?.file.path
    ? `${API_SERVER_URL}/files/${
        product.productFiles[preview.activePhotoIndex]?.file.path
      }`
    : null;

  const currentImageUrl = `${API_SERVER_URL}/files/${
    product?.productFiles[preview.currentPhotoIndex]?.file?.path
  }`;

  // Удаление товара в распродаже
  const handleDelete = async () => {
    setDeletionSubmitting(true);
    try {
      const res = await APIRequest({
        method: 'delete',
        url: API_ENDPOINTS_V2.sale.deleteProduct(product.sale.id),
        requireAuth: true,
      });
      setDeletionSubmitting(false);
      if (!res.isSucceed) {
        openNotification(res?.message);
        return;
      }
      openNotification(res?.message || 'Товар удален');
      router.push(
        generateUrl(
          { history: DEFAULT_NAV_PATHS.SALE_PRODUCT_LIST },
          { pathname: APP_PATHS.SALE_PRODUCT_LIST },
        ),
      );
      console.log('saleProduct delete successfully');
    } catch (e) {
      console.log('saleProduct delete error');
      setDeletionSubmitting(false);
    }
  };

  // Превью картинок
  const images =
    product?.productFiles.map(item => {
      return {
        original: `${item.file.url}`,
        thumbnail: `${item.file.url}`,
        id: item.fileId,
      };
    }) || [];

  const changeActivePhotoByIndex = (i: number) => {
    setPreview({
      ...preview,
      activePhotoIndex: i,
      currentPhotoIndex: i,
    });
  };

  const handlePreviewCancel = () => {
    setPreview({
      ...preview,
      previewVisible: false,
    });
  };

  const changeSlide = (e, direction: 'left-arrow' | 'right-arrow') => {
    e.stopPropagation();
    let newPhotoIndex =
      preview.currentPhotoIndex + (direction === 'left-arrow' ? -1 : 1);
    if (newPhotoIndex < 0) {
      newPhotoIndex = images.length - 1;
    }
    if (newPhotoIndex >= images.length) {
      newPhotoIndex = 0;
    }
    setPreview({
      ...preview,
      currentPhotoIndex: newPhotoIndex,
    });
  };

  const changeSlideByKeyboard = useCallback(
    (e: KeyboardEvent) => {
      if (!preview.previewVisible) return;
      if (e.keyCode === 37) {
        changeSlide(e, 'left-arrow');
      } else if (e.keyCode === 39) {
        changeSlide(e, 'right-arrow');
      }
    },
    [preview],
  );

  return {
    sellerName,
    sale,
    categories,
    deletionSubmitting,
    setDeletionSubmitting,
    preview,
    setPreview,
    changeActivePhotoByIndex,
    handlePreviewCancel,
    orgBranch,
    setOrgBranch,
    auth,
    locale,
    count,
    setCount,
    deletionModalVisible,
    setDeletionModalVisible,
    router,
    handleDelete,
    imageGalleryRef,
    disabledUp,
    disabledDown,
    images,
    currentImageUrl,
    imageUrl,
    changeSlide,
    changeSlideByKeyboard,
  };
};
