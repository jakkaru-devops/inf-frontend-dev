import { Button } from 'antd';
import { Container, Modal } from 'components/common';
import { IModalPropsBasic } from 'components/common/Modal/interfaces';
import { useLocale } from 'hooks/locale.hook';
import { ISetState } from 'interfaces/common.interfaces';
import { FC, Fragment, useState } from 'react';
import CategoriesSelection from 'sections/Catalog/components/CategoriesSelection';
import { IProductGroup } from 'sections/Catalog/interfaces/categories.interfaces';
import { ISellerAutoBrand, IUser } from 'sections/Users/interfaces';
import { getUserName } from 'sections/Users/utils';
import { ICategoriesSelectionProps } from '../CategoriesSelection/interfaces';

interface IProps extends IModalPropsBasic {
  user?: IUser;
  selectedAutoBrands?: ISellerAutoBrand[];
  setSelectedAutoBrands?: ISetState<ISellerAutoBrand[]>;
  selectedGroupIds?: IProductGroup['id'][];
  setSelectedGroupIds: ISetState<IProductGroup['id'][]>;
  onAutoTypeClick?: ICategoriesSelectionProps['onAutoTypeClick'];
  onAutoBrandClick?: ICategoriesSelectionProps['onAutoBrandClick'];
  onGroupClick?: ICategoriesSelectionProps['onGroupClick'];
  resetCategories: () => void;
  onSave: () => void;
  saveAwaiting?: boolean;
}

const CategoriesSelectionModal: FC<IProps> = ({
  user,
  open,
  onClose,
  resetCategories,
  onSave,
  saveAwaiting,
  ...rest
}) => {
  const { locale } = useLocale();
  const [dataLoaded, setDataLoaded] = useState(false);

  return (
    <Modal
      open={open}
      onClose={onClose}
      centered
      width="auto"
      footer={null}
      closable={false}
      destroyOnClose={false}
    >
      <Container className="select-category">
        {dataLoaded && (
          <div className="select-category__container">
            <h2>
              {locale.catalog.categorySelection}
              {!!user && (
                <Fragment>
                  {' '}
                  <span>для {getUserName(user, 'full')}</span>
                </Fragment>
              )}
            </h2>
            <div className="select-category__buttons">
              <Button
                type="primary"
                onClick={onSave}
                loading={saveAwaiting}
                className="select-category__btn"
              >
                {locale.common.save}
              </Button>
              <Button type="text" onClick={() => resetCategories()}>
                {locale.common.reset}
              </Button>
            </div>
          </div>
        )}
        <CategoriesSelection
          onDataLoaded={() => setDataLoaded(true)}
          {...rest}
        />
      </Container>
    </Modal>
  );
};

export default CategoriesSelectionModal;
