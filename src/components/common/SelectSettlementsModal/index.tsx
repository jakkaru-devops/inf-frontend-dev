import { Modal } from 'antd';
import { useState, useEffect, FC } from 'react';
import { API_ENDPOINTS } from 'data/paths.data';
import { APIRequest } from 'utils/api.utils';
import { ChildItems } from './elements/ChildItems';
import { ISelectSettlementsModal } from './interfaces';
import { Page, PageContent, PageTop } from 'components/common';
import { RightControls } from './elements/RightControls';
import { useHandlers } from './handlers';

const SelectSettlementsModal: FC<ISelectSettlementsModal> = ({
  open,
  onCancel,
  orderRequestId,
  regionsInit,
  onSubmit,
  mode,
}) => {
  const { setSavedRegions, regions, selectedSettlements, savedRegions } =
    useHandlers({
      orderRequestId,
      regionsInit,
      mode,
    });
  const [isSelectedAll, setIsSelectedAll] = useState(false);
  const [isSubmitDisable, setIsSubmitDisable] = useState(false);
  const step = regions?.length / 4;

  const onToggleAll = (isSelect: boolean) => {
    const unIncludedRegions = regions.filter(
      region =>
        !savedRegions.some(
          savedRegion => savedRegion.fias_id === region.fias_id,
        ),
    );
    const newSavedRegions = [...savedRegions, ...unIncludedRegions];

    setSavedRegions(
      newSavedRegions.map(newSavedRegion => ({
        ...newSavedRegion,
        isSelect,
        isRegionPartSelected: false,
      })),
    ),
      setIsSelectedAll(isSelect);
  };

  const handleSubmit = async () => {
    setIsSubmitDisable(true);
    const selectedSettlementIds =
      selectedSettlements?.map(el => el.fiasId) || [];
    const settlements = savedRegions
      .map(settlement => ({
        ...settlement,
        isSelect:
          typeof settlement.isSelect === 'boolean'
            ? settlement.isSelect
            : selectedSettlementIds.includes(
                settlement.fias_id || settlement.aoguid,
              ),
      }))
      .filter(settlement => settlement.isSelect);
    if (onSubmit) {
      onSubmit(settlements);
    }
    if (!orderRequestId) {
      setIsSubmitDisable(false);
      onCancel();
      return;
    }
    await APIRequest<any>({
      method: 'post',
      url: API_ENDPOINTS.SELECTED_REGIONS,
      requireAuth: true,
      data: { settlements, orderRequestId },
    });
    setIsSubmitDisable(false);
    onCancel();
  };

  useEffect(() => {});

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      destroyOnClose
      centered
      footer={null}
      width="1217px"
    >
      <Page className="regions-modal">
        <PageTop
          title={'Выбор региона поставщика'}
          colRight={
            <RightControls
              onSubmit={handleSubmit}
              handleReset={() => onToggleAll(false)}
              disabled={isSubmitDisable}
            />
          }
        />
        <PageContent containerProps={{ style: { height: '100%' } }}>
          {/* <div className="regions-modal__controls">
            <Checkbox
              className="regions-modal__controls__select-all"
              checked={isSelectedAll}
              onChange={() => onToggleAll(true)}
            >
              Все регионы
            </Checkbox>
          </div> */}
          <div className="regions-modal__content">
            {regions?.length &&
              Array.from(Array(4).keys()).map((_, i) => (
                <ChildItems
                  key={i}
                  regions={regions.slice(step * i, step * (i + 1))}
                  savedRegions={savedRegions}
                  setSavedRegions={savedRegions =>
                    setSavedRegions(savedRegions)
                  }
                  selectedSettlements={selectedSettlements}
                  isRegions={true}
                  regionId={''}
                  mode={mode}
                />
              ))}
          </div>
        </PageContent>
      </Page>
    </Modal>
  );
};

export default SelectSettlementsModal;
