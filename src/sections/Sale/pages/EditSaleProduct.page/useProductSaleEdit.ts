import { IUploadedFile } from 'components/common/FileInput/interfaces';
import { IRowsWithCount } from 'interfaces/common.interfaces';
import { useState } from 'react';
import {
  IProduct,
  IProductApplicability,
  IProductBranch,
} from 'sections/Catalog/interfaces/products.interfaces';
import { ISaleProduct } from 'sections/Sale/interfaces/sale.interfaces';

interface IProps {
  product: ISaleProduct;
}

export const useProductSaleEdit = ({ product }: IProps) => {
  const [isDisabled, setIsDisabled] = useState(true);
  const [deletionModalVisible, setDeletionModalVisible] = useState(false);
  const [deletionSubmitting, setDeletionSubmitting] = useState(false);
  const [deletedAnalogIds, setDeletedAnalogIds] = useState<string[]>([]);
  const [addedAnalogIds, setAddedAnalogIds] = useState<string[]>([]);
  const [submitAwaiting, setSubmitAwaiting] = useState(false);
  const [changeAllowed, setChangeAllowed] = useState(true);
  const [branches, setBranches] = useState<IProductBranch[]>(
    product?.branches?.filter(el => !el.isMain) || [],
  );
  const [mainBranch, setMainBranch] = useState<IProductBranch>(
    product?.branches?.find(el => el.isMain),
  );
  const [files, setFiles] = useState<IUploadedFile[]>(
    product?.productFiles?.map(el => ({ id: el.fileId })) || [],
  );
  const [applicabilities, setApplicabilities] = useState<
    IRowsWithCount<IProductApplicability[]>
  >({
    count: 0,
    rows: [],
  });
  const [addedApplicabilities, setAddedApplicabilities] = useState<
    IProductApplicability[]
  >([]);
  const [updatedApplicabilities, setUpdatedApplicabilities] = useState<
    IProductApplicability[]
  >([]);
  const [deletedApplicabilityIds, setDeletedApplicabilityIds] = useState<
    string[]
  >([]);
  const [analogProducts, setAnalogProducts] = useState<
    IRowsWithCount<IProduct[]>
  >({
    count: 0,
    rows: [],
  });

  return {
    deletionModalVisible,
    setDeletionModalVisible,
    deletionSubmitting,
    setDeletionSubmitting,
    deletedAnalogIds,
    setDeletedAnalogIds,
    addedAnalogIds,
    setAddedAnalogIds,
    submitAwaiting,
    setSubmitAwaiting,
    changeAllowed,
    setChangeAllowed,
    branches,
    setBranches,
    mainBranch,
    setMainBranch,
    files,
    setFiles,
    applicabilities,
    setApplicabilities,
    addedApplicabilities,
    setAddedApplicabilities,
    updatedApplicabilities,
    setUpdatedApplicabilities,
    deletedApplicabilityIds,
    setDeletedApplicabilityIds,
    analogProducts,
    setAnalogProducts,
    isDisabled,
    setIsDisabled,
  };
};
