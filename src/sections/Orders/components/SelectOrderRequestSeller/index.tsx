import { Checkbox, Input, Popover } from 'antd';
import classNames from 'classnames';
import { KeyValueItem } from 'components/common';
import { useLocale } from 'hooks/locale.hook';
import { ISetState, IRowsWithCount } from 'interfaces/common.interfaces';
import { FC, useState } from 'react';
import { IUser } from 'sections/Users/interfaces';
import { getUserName } from 'sections/Users/utils';
import { getPlural } from 'utils/languages.utils';

interface IProps {
  sellers: IRowsWithCount<IUser[]>;
  selectedSellersIds: string[];
  setSelectedSellerIds: ISetState<string[]>;
  saveSelectedSellers?: boolean;
  setSaveSelectedSellers?: ISetState<boolean>;
  className?: string;
}

const SelectOrderRequestSeller: FC<IProps> = ({
  sellers,
  selectedSellersIds,
  setSelectedSellerIds,
  saveSelectedSellers,
  setSaveSelectedSellers,
  className,
}) => {
  const { locale } = useLocale();

  const [popoverVisible, setPopoverVisible] = useState(false);
  const [filterValue, setFilterValue] = useState('');

  const allSellersSelected = selectedSellersIds.length === sellers.rows.length;
  const filteredSellers = sellers.rows.filter(seller =>
    getUserName(seller, 'lf').toLowerCase().includes(filterValue.toLowerCase()),
  );

  const handleSellerToggle = (userId: string, value: boolean) =>
    setSelectedSellerIds(prevSellers =>
      value
        ? prevSellers.concat(userId)
        : prevSellers.filter(id => id !== userId),
    );

  const handleSelectAllSellers = (value: boolean) => {
    if (value) setSelectedSellerIds(sellers.rows.map(({ id }) => id));
    else setSelectedSellerIds([]);
  };

  const handleSaveSellersToggle = (value: boolean) => {
    if (!selectedSellersIds.length) return;
    setSaveSelectedSellers(value);
  };

  return (
    <KeyValueItem
      keyText="Выбрать продавца"
      value={
        <Popover
          open={popoverVisible}
          onOpenChange={visible => setPopoverVisible(visible)}
          trigger="click"
          placement="bottomRight"
          overlayClassName="select-order-request-seller-popover"
          content={
            <div className="select-order-request-seller-popover__content">
              <Input
                size="small"
                className="w-100"
                style={{ borderColor: '#e2e2e2' }}
                placeholder="Введите имя продавца"
                value={filterValue}
                onChange={e => setFilterValue(e.target.value)}
              />
              <hr style={{ marginBottom: 7, marginTop: 7 }} />
              {typeof saveSelectedSellers !== 'undefined' &&
                setSaveSelectedSellers && (
                  <>
                    <Checkbox
                      checked={
                        saveSelectedSellers && selectedSellersIds.length > 0
                      }
                      onChange={e => handleSaveSellersToggle(e.target.checked)}
                      className="border-color-primary"
                      disabled={!selectedSellersIds.length}
                    >
                      Всегда отправлять только выбранным продавцам
                    </Checkbox>
                    <hr style={{ marginBottom: 7, marginTop: 7 }} />
                  </>
                )}
              <Checkbox
                checked={allSellersSelected}
                onChange={e => handleSelectAllSellers(e.target.checked)}
                className="border-color-primary"
              >
                Выбрать всех
              </Checkbox>
              <hr style={{ marginBottom: 7, marginTop: 7 }} />
              {!!filteredSellers.length ? (
                filteredSellers.map((seller, i) => (
                  <Checkbox
                    key={seller.id}
                    checked={selectedSellersIds.includes(seller.id)}
                    onChange={e =>
                      handleSellerToggle(seller.id, e.target.checked)
                    }
                    className={classNames('border-color-primary', {
                      'mb-5': i < filteredSellers.length - 1,
                    })}
                    style={{ marginLeft: 0 }}
                  >
                    {getUserName(seller, 'lf')}
                  </Checkbox>
                ))
              ) : (
                <p>По запросу не найдены продавцы</p>
              )}
            </div>
          }
        >
          {!selectedSellersIds.length
            ? 'Отправить всем'
            : selectedSellersIds.length === 1
            ? getUserName(
                sellers.rows.find(user => user.id === selectedSellersIds[0]),
                'lf',
              )
            : `${selectedSellersIds.length} ${getPlural({
                language: 'ru',
                num: selectedSellersIds.length,
                forms: locale.plurals.seller,
              })}`}
        </Popover>
      }
      onValueClick={() => {}}
      className={classNames(className)}
    />
  );
};

export default SelectOrderRequestSeller;
