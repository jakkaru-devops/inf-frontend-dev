import { Input, Alert } from 'antd';
import InputMask, { ReactInputMask } from 'react-input-mask';
import { IMaskedInput } from './interfaces';
import { getFormatInputMask } from './utils';
import { FC } from 'react';

const MaskedInput: FC<IMaskedInput> = ({
  value,
  onChange,
  mask,
  maskChar,
  alwaysShowMask,
  format,
  name,
  disabled,
  readOnly,
  placeholder,
  ...rest
}) => {
  if (!mask && !format) {
    return (
      <Alert type="error" message="Mask of Format should be specified" banner />
    );
  }
  mask = mask || getFormatInputMask(format);
  const InputUntyped: any = () => (inputProps: ReactInputMask) =>
    (<Input disabled={disabled} {...inputProps} {...rest} />) as any;

  return (
    <InputMask
      mask={mask}
      maskChar={maskChar}
      alwaysShowMask={alwaysShowMask}
      value={value}
      onChange={onChange}
      name={name}
      disabled={disabled}
      readOnly={readOnly}
      placeholder={placeholder}
    >
      {InputUntyped()}
    </InputMask>
  );
};

export default MaskedInput;
