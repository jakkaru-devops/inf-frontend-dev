import { IUploadedFile } from 'components/common/FileInput/interfaces';
import { IRowsWithCount } from 'interfaces/common.interfaces';
import { useState } from 'react';
import { getInitialProductBranch } from 'sections/Catalog/data';
import {
  IProduct,
  IProductApplicability,
  IProductBranch,
} from 'sections/Catalog/interfaces/products.interfaces';

interface IProps {
  sourceProduct?: IProduct;
}

export const useProductSaleAdd = ({ sourceProduct }: IProps) => {
  const [submitAwaiting, setSubmitAwaiting] = useState(false);
  const [branches, setBranches] = useState<IProductBranch[]>([]);
  const [mainBranch, setMainBranch] = useState<IProductBranch>(
    sourceProduct?.branches?.find(el => el.isMain) ||
      getInitialProductBranch({ isMain: true }),
  );
  const [files, setFiles] = useState<IUploadedFile[]>([]);
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
  const [addedAnalogIds, setAddedAnalogIds] = useState<string[]>([]);
  const [deletedAnalogIds, setDeletedAnalogIds] = useState<string[]>([]);
  const [changeAllowed, setChangeAllowed] = useState(true);

  const [isDisabled, setIsDisabled] = useState(true);

  return {
    submitAwaiting,
    setSubmitAwaiting,
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
    addedAnalogIds,
    setAddedAnalogIds,
    deletedAnalogIds,
    setDeletedAnalogIds,
    changeAllowed,
    setChangeAllowed,
    isDisabled,
    setIsDisabled,
  };
};
