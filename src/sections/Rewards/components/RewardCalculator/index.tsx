import { MIN_ORG_COMISSION_PERCENT } from 'config/env';
import { useState } from 'react';
import { calculateOrderCash } from 'sections/Orders/utils';
import { InputNumber } from 'components/common';

export const RewardCalculator = () => {
  const [state, setState] = useState({
    sum: null as number,
    percent: MIN_ORG_COMISSION_PERCENT,
    reward: null as number,
  });

  const handleChange = (name: string, value: number) => {
    if (name === 'sum') {
      const reward = value
        ? calculateOrderCash(value, state.percent, true)
        : null;
      setState({
        ...state,
        sum: value,
        reward,
      });
    }
    if (name === 'percent') {
      if (value < 0 || value > 100) return;
      const reward = calculateOrderCash(state.sum, value, true);
      setState({
        ...state,
        percent: value,
        reward: reward,
      });
    }
    /* if (name === 'reward') {
      const percent = state.percent;
      const sum = (value || 0) / 0.2871 / percent;
      setState({
        ...state,
        sum: sum.roundFraction(2),
        reward: value,
      });
    } */
  };

  return (
    <div>
      <span>Калькулятор вознаграждения: </span>
      <InputNumber
        name="sum"
        value={state.sum}
        onChange={value => handleChange('sum', value)}
        precision={2}
        placeholder="Сумма заказа"
        size="small"
        style={{ width: '108px' }}
        className="pl-5"
      />{' '}
      <InputNumber
        name="percent"
        value={state.percent}
        onChange={value => handleChange('percent', value)}
        precision={2}
        min={6}
        max={100}
        placeholder="% комиссии"
        size="small"
        style={{ width: '95px' }}
      />
      {' = '}
      <div className="d-inline-flex" style={{ position: 'relative' }}>
        <InputNumber
          name="reward"
          value={state.reward}
          precision={2}
          placeholder="вознаграждение"
          size="small"
          style={{ width: '162px' }}
          readOnly
        />
        <span
          style={{
            fontSize: '8px',
            position: 'absolute',
            bottom: '-19px',
          }}
        >
          *итоговая сумма за вычетом всех налогов
        </span>
      </div>
      {' *'}
    </div>
  );
};
