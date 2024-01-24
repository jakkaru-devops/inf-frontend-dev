import { Dispatch, FC, SetStateAction, memo, useState } from 'react';
import { Select } from 'antd';
import { Container } from 'components/common';

interface ParamsForSearchCarsProps {
  params: { steps: Array<any> };
  onChooseParam: (ssd: string) => void;
  setReloadData: Dispatch<SetStateAction<boolean>>;
  reloadData: boolean;
  isLoading: boolean;
  getCars: (ssd: string) => void;
}

const ParamsForSearchCars: FC<ParamsForSearchCarsProps> = memo(
  ({
    params,
    onChooseParam,
    setReloadData,
    reloadData,
    isLoading,
    getCars,
  }) => {
    const [currentSsd, setCurrentSsd] = useState<{
      prev: string;
      current: string;
    }>({ prev: '', current: '' });

    const handleChangeOption = (_: string, option: any) => {
      onChooseParam(option.value);
      setCurrentSsd(prevState => ({
        prev: prevState.current,
        current: option.value,
      }));
    };

    const handleRemoveOption = (ssd?: string) => {
      if (ssd) {
        setCurrentSsd(prevState => ({ prev: '', current: prevState.current }));
        return onChooseParam(ssd);
      }
      setCurrentSsd({ prev: '', current: '' });
      return setReloadData(!reloadData);
    };

    const handleOpenCarsTable = () => {
      getCars(currentSsd.current);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
      <>
        <h2>Поиск автомобиля по параметрам:</h2>
        <Container noPadding>
          {params?.steps.map((select, index) => (
            <Container noPadding key={index} style={{ marginBottom: 15 }}>
              <div style={{ marginBottom: 4 }}>{select.name}</div>
              {select.automatic == 1 ? (
                <Select
                  key={index}
                  style={{ width: 272 }}
                  disabled={true}
                  placeholder={select.value}
                  loading={isLoading}
                />
              ) : (
                <Select
                  key={index}
                  style={{ width: 272 }}
                  disabled={!select.options}
                  placeholder={'Не выбрано'}
                  onChange={handleChangeOption}
                  loading={isLoading}
                >
                  {select.options?.map(option => (
                    <Select.Option key={option.key} value={option.key}>
                      {option.value}
                    </Select.Option>
                  ))}
                </Select>
              )}
              {!select.options && (
                <button
                  className="tableInf__delete ml-5"
                  onClick={() => handleRemoveOption(select.ssd)}
                >
                  <img
                    src="/img/close.svg"
                    alt="close"
                    className="svg tableInf__delteIcon"
                  />
                </button>
              )}
            </Container>
          ))}
          {currentSsd.current && (
            <a onClick={handleOpenCarsTable}>Показать автомобили</a>
          )}
        </Container>
      </>
    );
  },
);

export default ParamsForSearchCars;
