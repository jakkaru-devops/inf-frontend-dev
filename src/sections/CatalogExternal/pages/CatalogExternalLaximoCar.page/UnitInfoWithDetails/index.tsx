import { FC, useState } from 'react';
import { Container, Link, Table } from 'components/common';
import {
  ILaximoCartProductDTO,
  ILaximoQuickUnitsWithDetails,
  LaximoUrlType,
} from '../../../interfaces';
import { Modal } from 'antd';
import { useRouter } from 'next/router';
import { rowNameLaximoTable } from '../../CatalogExternalLaximoUnit.page/Content';
import { useDispatch } from 'react-redux';
import { updateUserCartProduct } from 'services/updateUserCartProduct.service';
import { generateUrl } from 'utils/common.utils';
import { useAuth } from 'hooks/auth.hook';
import { useCart } from 'hooks/cart.hook';

interface UnitInfoWithDetailsProps {
  unit: ILaximoQuickUnitsWithDetails;
  brandName: string;
  autoModelName: string;
  laximoType: LaximoUrlType;
  onUnitClick?: (unit: ILaximoQuickUnitsWithDetails) => void;
}

const UnitInfoWithDetails: FC<UnitInfoWithDetailsProps> = ({
  unit,
  autoModelName,
  brandName,
  laximoType,
  onUnitClick,
}) => {
  const auth = useAuth();
  const cart = useCart();
  const dispatch = useDispatch();
  const router = useRouter();
  const [preview, setPreview] = useState<boolean>();

  const catalogUrl =
    router.query.laximoType === 'cars' ? 'CARS_FOREIGN' : 'TRUCKS_FOREIGN';
  const getCatalogDto = (oem: string, name: string): ILaximoCartProductDTO => ({
    id: oem,
    name: name,
    article: oem,
    autoType: catalogUrl,
    autoBrand: brandName,
    autoModel: autoModelName,
    group: unit.name,
  });

  const getProductIndexInCart = (product: ILaximoCartProductDTO) => {
    return cart.products.findIndex(el => el.acatProductId === product.article);
  };

  const [products, setProducts] = useState(
    unit?.details?.map(item => {
      const index = getProductIndexInCart(getCatalogDto(item.oem, item.name));
      let quantity = 1;
      if (index !== -1) quantity = cart?.products?.[index]?.quantity || 1;
      return {
        ...item,
        quantity,
      };
    }),
  );
  const [stateCounter, setStateCounter] = useState(0);
  const routeWithoutSsd = router.asPath.split('?')[0];

  const handleProductQuantityChange = async (
    value: number,
    productId: string | number,
  ) => {
    const newProducts = products;
    const product = newProducts.find(el => el.oem === productId);
    if (!product) return;
    product.quantity = value;
    setProducts(newProducts);

    const indexInCart = getProductIndexInCart(
      getCatalogDto(product.oem, product.name),
    );
    if (indexInCart !== -1) {
      await updateUserCartProduct({
        cartProduct: {
          ...cart.products[indexInCart],
          quantity: value,
        },
        cartProducts: cart.products,
        index: indexInCart,
        auth,
        dispatch,
      });
    }

    setStateCounter(prev => prev + 1);
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-evenly',
        marginBottom: 50,
      }}
    >
      <Container size="extraSmall">
        <Container
          size="extraSmall"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            border: '1px solid #E5E5E5',
            boxSizing: 'border-box',
            borderRadius: 3,
            marginRight: 15,
            cursor: 'pointer',
          }}
        >
          <div
            style={{
              position: 'relative',
              right: 118,
              top: 5,
            }}
            onClick={() => setPreview(true)}
          >
            <img src="/img/icons/catalog-ext-lupa.svg" />
          </div>
          <img
            src={unit.imageurl.replace('%size%', '250')}
            alt={unit.name}
            onClick={() => setPreview(true)}
            width="200"
            height="211"
            loading={'lazy'}
          />
          <Link
            href={generateUrl(
              {
                ssd: unit.ssd,
                laximoType,
              },
              {
                pathname: [routeWithoutSsd, `${unit.unitid}`].join('/'),
              },
            )}
            onClick={e => {
              if (!!onUnitClick) {
                e.preventDefault();
                onUnitClick(unit);
              }
            }}
          >
            {`${unit.code}: ${unit.name}`}
          </Link>
        </Container>
      </Container>
      <Table
        style={{ width: 800 }}
        cols={[
          { content: '№', width: '10%' },
          { content: 'Номер', width: '20%' },
          {
            content: 'Наименование',
            width: '70%',
            style: { textAlign: 'left', paddingLeft: 15 },
          },
        ]}
        rows={products.map((detail, index) => ({
          cols: [
            {
              content: ++index,
              style: { fontSize: '0.7vw' },
            },
            { content: detail.oem, style: { fontSize: '0.7vw' } },
            {
              content: rowNameLaximoTable(
                detail,
                getCatalogDto,
                false,
                handleProductQuantityChange,
              ),
              style: {
                justifyContent: 'space-between',
                paddingLeft: 15,
                paddingRight: 10,
                fontSize: '0.7vw',
              },
            },
          ],
        }))}
      />
      <Modal
        open={preview}
        title={unit.name}
        footer={null}
        onCancel={() => setPreview(false)}
        centered
        width={700}
        wrapClassName="product-image-modal"
      >
        <img
          alt={unit.name}
          style={{ maxWidth: 900, width: '100%' }}
          src={unit.largeimageurl.replace('%size%', 'source')}
        />
      </Modal>
    </div>
  );
};

export default UnitInfoWithDetails;
