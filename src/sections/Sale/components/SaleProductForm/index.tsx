import { FC, useState } from 'react';
import { getInitialProduct } from 'sections/Catalog/data';
import { useHandlers } from './handlers';
import SaleProductFormBranch from './Branch';
import { ISaleProductFormProps } from './interfaces';
import { ISaleProduct } from 'sections/Sale/interfaces/sale.interfaces';

const SaleProductForm: FC<ISaleProductFormProps> = props => {
  const {
    autoTypes,
    setAutoTypes,
    autoBrands,
    setAutoBrands,
    groups,
    setGroups,
    form,
    product: productInitial,
    disabled,
    organizations,
    files,
    setFiles,
    mainBranch,
    setMainBranch,
    branches,
    setBranches,
    changeAllowed,
    onChangeAllowedUpdate,
    action,
    disableProductFields,
  } = props;
  const [product] = useState(
    productInitial ||
      ({
        ...getInitialProduct(),
        sale: {
          organizationId: null,
          price: null,
          previousPrice: null,
          amount: null,
        },
      } as ISaleProduct),
  );
  const { onFileUpload, onFileDelete } = useHandlers({ ...props });

  return (
    <div className="d-flex">
      <SaleProductFormBranch
        disableProductFields={disableProductFields}
        branch={mainBranch}
        setBranch={data => setMainBranch({ ...data })}
        product={product}
        form={form}
        disabled={disabled}
        autoTypes={autoTypes}
        setAutoTypes={setAutoTypes}
        autoBrands={autoBrands}
        setAutoBrands={setAutoBrands}
        groups={groups}
        setGroups={setGroups}
        mainBranch={mainBranch}
        setMainBranch={setMainBranch}
        branches={branches}
        setBranches={setBranches}
        changeAllowed={changeAllowed}
        onChangeAllowedUpdate={onChangeAllowedUpdate}
        action={action}
        index={null}
        deleteBranch={null}
        onFileDelete={onFileDelete}
        onFileUpload={onFileUpload}
        organizations={organizations}
        files={files}
        setFiles={setFiles}
      />
    </div>
  );
};

export default SaleProductForm;
