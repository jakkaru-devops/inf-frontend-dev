import { InputNumber as AntdInputNumber } from 'antd';
import classNames from 'classnames';
import { FC, KeyboardEvent } from 'react';
import { inputNumberFormatter } from './utils';
import { IInputNumberProps } from './interfaces';

const InputNumber: FC<IInputNumberProps> = ({
  className,
  showControls,
  colorPrimary,
  widthSmall,
  textCenter,
  onKeyDown,
  decimalSeparator,
  inputRef,
  ...props
}) => {
  let decimal = typeof props?.precision === 'undefined' || props?.precision > 0;
  if (!decimal)
    decimal = !!decimalSeparator || (props?.step && props?.step < 1);
  if (decimal) decimalSeparator = decimalSeparator || ',';

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const invalid =
      (e as any).code.startsWith('Key') ||
      ((e as any).code.startsWith('Digit') && e.shiftKey) ||
      ['Semicolon', 'Quote'].includes((e as any).code);
    const metaKeyPressed = e.metaKey || e.ctrlKey;
    if (invalid && !metaKeyPressed) e.preventDefault();
    if (!!onKeyDown) onKeyDown(e);
  };

  return (
    <AntdInputNumber
      formatter={(value: number, info) =>
        inputNumberFormatter(value, info, {
          decimal,
          decimalSeparator,
        })
      }
      decimalSeparator={decimalSeparator}
      {...props}
      ref={inputRef}
      onKeyDown={handleKeyDown}
      className={classNames(className, {
        'show-controls': showControls,
        'type-primary': colorPrimary,
        'width-small': widthSmall,
        'text-center': textCenter,
      })}
    />
  );
};

export default InputNumber;
