import { Input, InputRef, Popover } from 'antd';
import { Link } from 'components/common';
import { APP_PATHS } from 'data/paths.data';
import { FC, Fragment, KeyboardEvent, RefObject } from 'react';
import { PUBLIC_PRODUCT_STATUSES } from 'sections/Catalog/data';
import { IOfferSelectedProduct } from 'store/reducers/offerProductSelection.reducer';
import { generateInnerUrl } from 'utils/common.utils';

interface IProps {
  product: IOfferSelectedProduct;
  label: string;
  altLabel: string;
  reserveLabel: string;
  productUrl?: string;
  isEditingMode: boolean;
  inputRef: RefObject<InputRef>;
  updateAllowed: boolean;
  onUpdate: (value: string) => void;
  onNewProductUpdate: (value: string) => void;
  onFocusMove: (e: KeyboardEvent<HTMLInputElement>) => void;
  startEditingProduct?: () => void;
}

const OfferComplexInput: FC<IProps> = ({
  product,
  label,
  altLabel,
  reserveLabel,
  productUrl,
  isEditingMode,
  inputRef,
  updateAllowed,
  onUpdate,
  onNewProductUpdate,
  onFocusMove,
  startEditingProduct,
}) => {
  return !!product?.requestProductId ? (
    <Fragment>
      {!isEditingMode ? (
        <Fragment>
          <div>
            {!!productUrl ? (
              !!product?.product ? (
                <Link href={productUrl} className="color-black">
                  {product?.[altLabel] || product?.product?.[label]}
                </Link>
              ) : (
                product?.[altLabel] || product?.[reserveLabel]
              )
            ) : (
              product?.[altLabel] ||
              product?.product?.[label] ||
              product?.[reserveLabel] ||
              '-'
            )}
          </div>
          {!!product?.[altLabel] && (
            <Popover
              placement="right"
              content={
                <Fragment>
                  <div className="star-mark-overlay-title">Изменено</div>
                  <div className="star-mark-overlay-name">
                    {product?.product?.[label] || product?.[reserveLabel]}
                  </div>
                </Fragment>
              }
              overlayClassName="star-mark-overlay"
            >
              <img
                src="/img/icons/star-mark.svg"
                alt=""
                className="star-mark"
              />
            </Popover>
          )}
        </Fragment>
      ) : (
        <Input
          value={product?.[altLabel]}
          onChange={e => onUpdate(e.target.value)}
          ref={inputRef}
          onKeyDown={e => onFocusMove(e)}
          size="small"
          className="type-primary text-center"
        />
      )}
    </Fragment>
  ) : (
    <Fragment>
      {!product?.newProduct ? (
        !!startEditingProduct ? (
          <div
            className="d-flex justify-content-between align-items-center select-product w-100"
            style={updateAllowed ? { cursor: 'pointer' } : null}
            onClick={e => {
              e.preventDefault();
              if (!updateAllowed) return;
              startEditingProduct();
            }}
          >
            {!!product?.product &&
            PUBLIC_PRODUCT_STATUSES.includes(product?.product.status) ? (
              <Link
                href={generateInnerUrl(APP_PATHS.PRODUCT(product.productId), {
                  text: product?.product?.name,
                })}
                className="color-default"
              >
                {product?.product?.name}
              </Link>
            ) : (
              <Fragment>
                <div
                  className="col word-wrap"
                  style={{ padding: '0 5px', margin: 0 }}
                >
                  {product?.product?.name || <></>}
                </div>
                {updateAllowed && (
                  <div
                    className="col d-flex align-items-center justify-content-end plus"
                    style={{ paddingRight: 0, marginLeft: 5 }}
                  >
                    +
                  </div>
                )}
              </Fragment>
            )}
          </div>
        ) : (
          product?.product?.[label] || '-'
        )
      ) : (
        <div className="d-flex justify-content-between align-items-center select-product w-100">
          <Input
            size="small"
            value={product?.newProduct?.[label]}
            onChange={e => onNewProductUpdate(e.target.value)}
          />
          {!!startEditingProduct && (
            <div
              className="col d-flex align-items-center justify-content-end plus cursor-pointer"
              style={{ paddingRight: 0, marginLeft: 5 }}
              onClick={e => {
                e.preventDefault();
                startEditingProduct();
              }}
            >
              +
            </div>
          )}
        </div>
      )}
    </Fragment>
  );
};

export default OfferComplexInput;
