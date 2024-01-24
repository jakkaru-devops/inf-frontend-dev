import { KeyValueItem } from 'components/common';
import { useLocale } from 'hooks/locale.hook';
import { FC } from 'react';

interface IProps {
  addressStr: string;
  addressStrDefault?: string;
  prefixText?: string;
  onAddressClick: () => void;
  className?: string;
}

const AddressIndication: FC<IProps> = ({
  addressStr,
  addressStrDefault,
  prefixText,
  onAddressClick,
  className,
}) => {
  const { locale } = useLocale();

  addressStrDefault = addressStrDefault || locale.address.addressNotSpecified;
  prefixText = prefixText || locale.address.address;

  return (
    <KeyValueItem
      keyText={prefixText}
      value={addressStr || addressStrDefault}
      onValueClick={onAddressClick}
      className={className}
      valueClassName={!addressStr ? 'text-underline' : ''}
    />
  );
};

export default AddressIndication;
