import { IProductBranch } from 'sections/Catalog/interfaces/products.interfaces';
import { ISaleProduct } from '../interfaces/sale.interfaces';

export const onSaleFormFieldsChange = (form, setIsDisabled) => {
  const fieldsValue = form.getFieldsValue([
    'name',
    'article',
    'autoTypeId',
    'organizationId',
    'price',
    'amount',
  ]);

  const hasErrors = form.getFieldsError().some(({ errors }) => errors.length);
  const isRequiredFieldsFilled =
    Object.values(fieldsValue).filter(Boolean).length ===
    Object.keys(fieldsValue).length;
  const disabled = !isRequiredFieldsFilled || hasErrors;
  setIsDisabled(disabled);
};

const getBranchFormValues = (branch: IProductBranch, suffix: string) => {
  return {
    ['description' + suffix]: branch?.description,
    ['autoTypeId' + suffix]: branch?.autoTypeId || 'relatedProducts',
    ['autoBrandId' + suffix]: branch?.autoBrandId,
    ['autoModelIds' + suffix]: branch?.autoModelIds,
    ['groupId' + suffix]: branch?.groupId,
    ['subgroupId' + suffix]: branch?.subgroupId,
  };
};

export const getInitialSaleProductFormValues = (
  product: ISaleProduct,
  requireSale?: boolean,
) => {
  if (!product || (requireSale && !product?.sale)) return {};

  let result = {
    article: product.article,
    name: product.name,
    description: product?.description,
    manufacturer: product?.manufacturer,
    price: product.sale?.price,
    previousPrice: product.sale?.previousPrice,
    amount: product.sale?.amount,
    organizationId: product.sale?.organizationId,
  };
  for (let i = 0; i < (product?.branches || [])?.length; i++) {
    const branch = product?.branches[i];
    const suffix = i === 0 ? '' : `-${i - 1}`;

    if (!branch) continue;

    result = {
      ...result,
      ...getBranchFormValues(branch, suffix),
    };
  }
  return result;
};
