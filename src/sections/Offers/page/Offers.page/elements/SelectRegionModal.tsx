import { Button, Checkbox, Modal } from 'antd';
import { IRegion } from 'components/common/SelectSettlementsModal/interfaces';
import { ISetState } from 'interfaces/common.interfaces';
import { FC, useEffect, useState } from 'react';

interface IProps {
  open: boolean;
  onCancel: () => void;
  regions: IRegion[];
  selectedRegionIds: string[];
  setSelectedRegionIds: ISetState<string[]>;
}

const SelectRegionModal: FC<IProps> = ({
  open,
  onCancel,
  regions,
  selectedRegionIds,
  setSelectedRegionIds,
}) => {
  const [regionIds, setRegionIds] = useState(selectedRegionIds);

  useEffect(() => {
    setRegionIds(selectedRegionIds);
  }, [selectedRegionIds]);

  const handleRegionChecked = (id: string, value: boolean) => {
    setRegionIds(prevRegionIds =>
      prevRegionIds.includes(id)
        ? prevRegionIds.filter(el => el !== id)
        : prevRegionIds.concat(id),
    );
  };

  const handleSubmit = () => {
    setSelectedRegionIds(regionIds);
    onCancel();
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      title="Выберите регион"
      footer={null}
      centered
    >
      <div style={{ display: 'flex', flexDirection: 'column', maxHeight: 500 }}>
        {regions.map(region => (
          <Checkbox
            key={region.fias_id}
            checked={regionIds.includes(region.fias_id)}
            onChange={e =>
              handleRegionChecked(region.fias_id, e.target.checked)
            }
            className="ml-0 mr-20 mb-20"
          >
            {region.name_with_type}
          </Checkbox>
        ))}
      </div>
      <div className="d-flex justify-content-end">
        <Button type="default" onClick={onCancel}>
          Отмена
        </Button>
        <Button type="primary" onClick={handleSubmit} className="ml-5">
          Подтвердить
        </Button>
      </div>
    </Modal>
  );
};

export default SelectRegionModal;
