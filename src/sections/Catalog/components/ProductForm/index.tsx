import { Alert, AutoComplete, Button, Form, Input, Slider } from 'antd';
import classNames from 'classnames';
import { FileUpload, FormGroup, InputNumber, Link } from 'components/common';
import { IMAGE_EXTENSIONS } from 'data/files.data';
import { DEFAULT_NAV_PATHS } from 'data/nav.data';
import { API_ENDPOINTS, APP_PATHS } from 'data/paths.data';
import { useLocale } from 'hooks/locale.hook';
import { FC, Fragment } from 'react';
import { useDispatch } from 'react-redux';
import { generateUrl } from 'utils/common.utils';
import { getServerFileUrl } from 'utils/files.utils';
import { getPlural } from 'utils/languages.utils';
import ProductAnalogs from '../ProductAnalogs';
import ProductApplicabilities from '../ProductApplicabilities';
import ProductFormBranch from './Branch';
import { useHandlers } from './handlers';
import { IProductFormProps } from './interfaces';
import { setOfferProductSelectionProduct } from 'store/reducers/offerProductSelection.reducer';
import { useOfferProductSelection } from 'hooks/offerProductSelection.hook';

const ProductForm: FC<IProductFormProps> = props => {
  const {
    autoTypes,
    autoBrands,
    groups,
    form,
    product: productInitial,
    applicabilities,
    setApplicabilities,
    addedApplicabilities,
    analogProducts,
    setAnalogProducts,
    addedAnalogIds,
    disabled,
    action,
  } = props;
  const { locale } = useLocale();
  const offerProductSelection = useOfferProductSelection();
  const dispatch = useDispatch();
  const {
    router,
    branchListRef,
    branchListWrapperRef,
    branchListWrapperWidth,
    product,
    setProduct,
    foundProducts,
    setFoundProducts,
    branches,
    setBranches,
    setStateCounter,
    mainBranch,
    setMainBranch,
    productExist,
    isInOrderRequest,
    branchListWidth,
    scrollMaxValue,
    applicabilitiesRef,
    analogsSearch,
    setAnalogsSearch,
    analogOptions,
    analogsRef,
    changeAllowed,
    setChangeAllowed,
    handleArticleChange,
    changeSliderValue,
    addBranch,
    deleteBranch,
    onFileUpload,
    onFileDelete,
    addApplicability,
    changeApplicability,
    deleteApplicability,
    changeApplicabilityAutoBrandInputMode,
    changeApplicabilityAutoModelInputMode,
    handleAnalogsSearch,
    handleAnalogSelect,
    deleteAnalog,
  } = useHandlers({
    ...props,
    product: productInitial,
  });

  return (
    <Fragment>
      <FormGroup>
        <Form.Item
          label="Артикул"
          name="article"
          colon={false}
          rules={[{ required: true, message: locale.validations.required }]}
        >
          <Input
            size="small"
            onChange={e => handleArticleChange(e.target.value)}
            disabled={disabled}
          />
        </Form.Item>
      </FormGroup>
      {productExist &&
        !changeAllowed &&
        (!offerProductSelection ? (
          <Alert message="Такой товар уже существует" className="mb-10" />
        ) : (
          <Button
            type="primary"
            className="mb-10"
            onClick={() => {
              dispatch(
                setOfferProductSelectionProduct(
                  {
                    orderRequestId: offerProductSelection.orderRequestId,
                    productId: product?.id,
                    product: !isInOrderRequest ? product : null,
                  },
                  offerProductSelection.activeProductIndex,
                  offerProductSelection,
                ),
              );
              router.push(
                generateUrl(
                  {
                    history: DEFAULT_NAV_PATHS.ORDER_REQUEST(
                      offerProductSelection?.orderRequest?.id,
                      offerProductSelection?.orderRequest?.idOrder,
                    ),
                  },
                  {
                    pathname: APP_PATHS.ORDER_REQUEST(
                      offerProductSelection?.orderRequest?.id,
                    ),
                  },
                ),
              );
            }}
          >
            {!isInOrderRequest ? (
              <>Такой товар уже есть &mdash; добавить</>
            ) : (
              <>Удалить из запроса</>
            )}
          </Button>
        ))}

      {!!foundProducts?.length && (
        <Fragment>
          <div className="d-flex align-items-center mb-30">
            <Alert
              message={`Найдено ${foundProducts?.length} ${getPlural({
                language: 'ru',
                num: foundProducts?.length,
                forms: locale.plurals.product,
              })} с введенным артикулом`}
            />
            <Link
              href={generateUrl(
                {
                  history: DEFAULT_NAV_PATHS.PRODUCT_LIST,
                  productIds: foundProducts.map(el => el.id),
                  search: product?.article,
                  page: 1,
                  pageSize: null,
                },
                {
                  pathname: APP_PATHS.PRODUCT_LIST,
                },
              )}
              target="_blank"
              className="ml-10"
            >
              <Button type="primary" size="large">
                Смотреть товары
              </Button>
            </Link>
          </div>
        </Fragment>
      )}

      <div
        className={classNames({
          'd-none': !changeAllowed,
        })}
      >
        <div className="d-flex">
          <ProductFormBranch
            branch={mainBranch}
            setBranch={data => setMainBranch({ ...data })}
            product={product}
            form={form}
            disabled={disabled}
            autoTypes={autoTypes}
            autoBrands={autoBrands}
            groups={groups}
            index={null}
            deleteBranch={null}
          />
          <div
            ref={branchListWrapperRef}
            className="product-form-branch-list-wrapper"
          >
            {
              <Slider
                min={0}
                max={scrollMaxValue}
                defaultValue={0}
                onChange={changeSliderValue}
                tooltipVisible={false}
                className={classNames('product-form-branch-list-slider', {
                  'product-form-branch-list-slider--hidden':
                    scrollMaxValue <= 0,
                })}
              />
            }
            <div ref={branchListRef} className="product-form-branch-list">
              {branches.map((branch, i) => (
                <ProductFormBranch
                  key={i}
                  branch={branch}
                  setBranch={data => {
                    branches[i] = { ...data };
                    setBranches([...branches]);
                    setStateCounter(prev => prev + 1);
                  }}
                  product={product}
                  form={form}
                  disabled={disabled}
                  autoTypes={autoTypes}
                  autoBrands={autoBrands}
                  groups={groups}
                  index={i}
                  deleteBranch={deleteBranch}
                />
              ))}
              {(action === 'create' || action === 'update') && (
                <div className="product-form-add-branch" onClick={addBranch}>
                  <div className="plus">+</div>
                  <div className="text">Добавить ветку</div>
                </div>
              )}
            </div>
          </div>
        </div>

        <FormGroup className="pb-0">
          <Form.Item label="Производитель" name="manufacturer" colon={false}>
            <Input disabled={disabled} size="small" />
          </Form.Item>
        </FormGroup>

        <FormGroup title="Габариты, мм" className="mb-10">
          <div className="d-flex">
            <div>
              <Form.Item name="length" colon={false}>
                <InputNumber
                  min={0}
                  precision={2}
                  size="small"
                  placeholder={locale.catalog.productLength}
                  disabled={disabled}
                  style={{ width: 80 }}
                  className="show-controls type-primary width-small text-center"
                />
              </Form.Item>
            </div>
            <div className="ml-10">
              <Form.Item name="width" colon={false}>
                <InputNumber
                  min={0}
                  precision={2}
                  size="small"
                  placeholder={locale.catalog.productWidth}
                  disabled={disabled}
                  style={{ width: 80 }}
                  className="show-controls type-primary width-small text-center"
                />
              </Form.Item>
            </div>
            <div className="ml-10">
              <Form.Item name="height" colon={false}>
                <InputNumber
                  min={0}
                  precision={2}
                  size="small"
                  placeholder={locale.catalog.productHeight}
                  disabled={disabled}
                  style={{ width: 80 }}
                  className="show-controls type-primary width-small text-center"
                />
              </Form.Item>
            </div>
          </div>

          <Form.Item
            name="weight"
            label={`${locale.catalog.productWeight}, ${locale.common.kg}`}
            colon={false}
            className="mb-10"
          >
            <InputNumber
              min={0}
              precision={2}
              step={0.01}
              size="small"
              placeholder={locale.catalog.productWeight}
              disabled={disabled}
              style={{ width: '100%', paddingLeft: 5 }}
              className="show-controls type-primary width-small"
            />
          </Form.Item>

          <FileUpload
            url={API_ENDPOINTS.FILE_UNKNOWN}
            onFileUploaded={({ id }) => onFileUpload([{ id }])}
            onDelete={changeAllowed ? file => onFileDelete(file.id) : null}
            accept={IMAGE_EXTENSIONS.map(ext => `.${ext}`).join(',')}
            disabled={disabled}
            // hideUploadButton={!changeAllowed}
            initFiles={product?.productFiles?.map(({ file }) => ({
              ...file,
              url: getServerFileUrl(file?.path),
            }))}
            className="mb-20"
          />
        </FormGroup>

        {!!setApplicabilities && (
          <div style={{ paddingLeft: 10 }}>
            <h3>Применяемость</h3>
            <div
              style={{
                maxWidth: 500,
                maxHeight: 500,
                overflowY: 'auto',
                marginLeft: -20,
                paddingLeft: 20,
                paddingRight: 10,
              }}
              ref={applicabilitiesRef}
            >
              <ProductApplicabilities
                productId={product.id}
                applicabilities={applicabilities}
                setApplicabilities={setApplicabilities}
                pagination="scroll"
                useWindowScroll={false}
                editProps={{
                  disabled,
                  autoBrands,
                  addedItems: addedApplicabilities.map(el => el.id),
                  changeApplicability,
                  changeApplicabilityAutoBrandInputMode,
                  changeApplicabilityAutoModelInputMode,
                  deleteApplicability,
                }}
              />
            </div>
            {!disabled && (
              <div
                className="color-primary text-underline cursor-pointer user-select-none mb-20 d-table"
                onClick={() => addApplicability()}
              >
                Добавить строку
              </div>
            )}
          </div>
        )}

        {!!setAnalogProducts && (
          <div style={{ paddingLeft: 10 }}>
            <h3>Аналоги</h3>
            <div
              style={{
                maxWidth: 500,
                maxHeight: 500,
                overflowY: 'auto',
                marginLeft: -20,
                marginBottom: 10,
                paddingLeft: 20,
                paddingRight: 10,
              }}
              ref={analogsRef}
            >
              <ProductAnalogs
                productId={product.id}
                analogProducts={analogProducts}
                setAnalogProducts={setAnalogProducts}
                pagination="scroll"
                useWindowScroll={false}
                editProps={{
                  disabled,
                  addedItems: addedAnalogIds,
                  deleteAnalog,
                }}
              />
            </div>
            <Form.Item name="analogsSearch" style={{ maxWidth: 470 }}>
              <AutoComplete
                onSearch={value => handleAnalogsSearch(value)}
                style={{ width: `100%` }}
                onSelect={value =>
                  handleAnalogSelect(analogOptions.find(el => el.id === value))
                }
                searchValue={analogsSearch}
                options={analogOptions.map(analog => ({
                  value: analog.id,
                  label: `${analog.article} - ${analog.name}`,
                }))}
                filterOption={false}
                placeholder="Введите артикул или название товара"
                disabled={disabled}
              >
                <Input />
              </AutoComplete>
            </Form.Item>
          </div>
        )}
      </div>
    </Fragment>
  );
};

export default ProductForm;
