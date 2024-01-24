import { FC } from 'react';
import { Button } from 'antd';
import classnames from 'classnames';
import { IRightControls } from '../interfaces';

/**
 * @description Save selected and reset settlements block with save/reset buttons.
 * @param {*} { onSubmit, handleReset, disabled }
 * @returns {FC}
 */
const RightControls: FC<IRightControls> = ({
  onSubmit,
  handleReset,
  disabled,
}) => {
  return (
    <div className="regions-modal__right-controls">
      <Button
        type="ghost"
        onClick={onSubmit}
        disabled={disabled}
        className={classnames('regions-modal__right-controls__submit-btn', {
          disabled,
        })}
      >
        Сохранить
      </Button>
      <div className="regions-modal__right-controls__reset-btn">
        <span onClick={handleReset}>сбросить выбор</span>
      </div>
    </div>
  );
};

export { RightControls };
