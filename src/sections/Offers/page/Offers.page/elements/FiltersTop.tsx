import { Container, PageTopPanel, KeyValueItem } from 'components/common';
import { useLocale } from 'hooks/locale.hook';
import { IRegion } from 'components/common/SelectSettlementsModal/interfaces';
import { ISetState } from 'interfaces/common.interfaces';
import { getPlural } from 'utils/languages.utils';
import { FC } from 'react';

interface IProps {
  requestDate: string;
  regions: IRegion[];
  selectedRegionIds: string[];
  setSelectRegionVisible: ISetState<boolean>;
  setFiltersModalOpen: ISetState<boolean>;
  className?: string;
}

const FiltersTop: FC<IProps> = ({
  requestDate,
  regions,
  selectedRegionIds,
  setSelectRegionVisible,
  setFiltersModalOpen,
  className,
}) => {
  const { locale } = useLocale();

  let regionText = 'все';
  if (selectedRegionIds.length === 1)
    regionText = regions.find(
      region => region.fias_id === selectedRegionIds[0],
    ).name_with_type;
  if (selectedRegionIds.length > 1)
    regionText = `${selectedRegionIds.length} ${getPlural({
      language: 'ru',
      num: selectedRegionIds.length,
      forms: locale.plurals.region,
    })}`;

  return (
    <PageTopPanel paddingSize="small" className={className}>
      <Container
        size="middle"
        className="catalog__wrapper d-flex justify-content-between align-items-center"
      >
        <KeyValueItem
          keyText="Дата запроса"
          value={requestDate}
          style={{ marginBottom: 0 }}
        />
        <div className="catalog__selectes catalog__selectes_ml">
          <KeyValueItem
            keyText="Регион"
            value={regionText}
            className="mr-20"
            valueColor="primary"
            onValueClick={() => setSelectRegionVisible(true)}
          />
          <KeyValueItem
            keyText="Фильтры"
            value="Фильтры"
            className="mr-0"
            valueColor="primary"
            onValueClick={() => setFiltersModalOpen(true)}
          />
        </div>
      </Container>
    </PageTopPanel>
  );
};

export { FiltersTop };
