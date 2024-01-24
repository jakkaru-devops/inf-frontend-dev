import classNames from 'classnames';
import { FormGroup } from 'components/common';
import { FC, Fragment, useEffect, useState } from 'react';
import AddressInput from './Input';
import {
  IAddressContext,
  IAddressInputGroupProps,
  IAddressSuggestion,
} from './interfaces';
import { Form, Input } from 'antd';

const AddressInputGroup: FC<IAddressInputGroupProps> = ({
  title,
  form,
  prefix,
  editable = true,
  className,
  onChange,
  comparedData,
}) => {
  const [context, setContext] = useState<IAddressContext>({
    country: form.getFieldValue(`${prefix}country`) || null,
    countryIsoCode: null,
    region: form.getFieldValue(`${prefix}region`) || null,
    regionFiasId: form.getFieldValue(`${prefix}regionFiasId`) || null,
    area: form.getFieldValue(`${prefix}area`) || null,
    areaFiasId: form.getFieldValue(`${prefix}areaFiasId`) || null,
    city: form.getFieldValue(`${prefix}city`) || null,
    cityFiasId: form.getFieldValue(`${prefix}cityFiasId`) || null,
    settlement: form.getFieldValue(`${prefix}settlement`) || null,
    settlementFiasId: form.getFieldValue(`${prefix}settlementFiasId`) || null,
    street: form.getFieldValue(`${prefix}street`) || null,
    building: form.getFieldValue(`${prefix}building`) || null,
    apartment: form.getFieldValue(`${prefix}apartment`) || null,
    postcode: form.getFieldValue(`${prefix}postcode`) || null,
  });
  const [options, setOptions] = useState<{
    [key: string]: IAddressSuggestion[];
  }>({
    settlement: [],
    street: [],
  });

  console.log(comparedData);

  useEffect(() => {
    console.log(context);
    onChange && onChange(context);
  }, [context]);

  return (
    <FormGroup
      title={title}
      className={classNames(['address-input-group', className])}
    >
      {editable ? (
        <Fragment>
          <AddressInput
            form={form}
            context={context}
            setContext={setContext}
            target="country"
            prefix={prefix}
            placeholder="Страна"
            disabled={true}
            required={true}
            inputClassName={classNames({
              highlighted:
                !!comparedData && context?.country !== comparedData?.country,
            })}
          />
          <AddressInput
            form={form}
            context={context}
            setContext={setContext}
            target="region"
            prefix={prefix}
            placeholder="Регион"
            required={true}
            fiasIdRequired={true}
            className="hidden"
          />
          <AddressInput
            form={form}
            context={context}
            setContext={setContext}
            target="area"
            prefix={prefix}
            placeholder="Район"
            fiasIdRequired={true}
            className="hidden"
          />
          <AddressInput
            form={form}
            context={context}
            setContext={setContext}
            target="city"
            prefix={prefix}
            placeholder="Город"
            fiasIdRequired={true}
            className="hidden"
          />
          <AddressInput
            form={form}
            context={context}
            setContext={setContext}
            target="settlement"
            options={options}
            setOptions={setOptions}
            prefix={prefix}
            placeholder="Населенный пункт"
            required={true}
            fiasIdRequired={true}
            bound={{ from: 'city', to: 'settlement' }}
            disabled={!editable}
            inputClassName={classNames({
              highlighted:
                !!comparedData &&
                context?.settlement !== comparedData?.settlement,
            })}
          />
          <AddressInput
            form={form}
            context={context}
            setContext={setContext}
            target="street"
            options={options}
            setOptions={setOptions}
            prefix={prefix}
            placeholder="Улица/мкр/кв-л"
            disabled={
              !editable || !form.getFieldValue(`${prefix}settlementFiasId`)
            }
            bound={{ from: 'settlement', to: 'street' }}
            inputClassName={classNames({
              highlighted:
                !!comparedData && context?.street !== comparedData?.street,
            })}
          />
          <AddressInput
            form={form}
            context={context}
            setContext={setContext}
            target="building"
            prefix={prefix}
            placeholder="Дом/строение"
            disabled={
              !editable || !form.getFieldValue(`${prefix}settlementFiasId`)
            }
            searchDisabled={true}
            inputClassName={classNames({
              highlighted:
                !!comparedData && context?.building !== comparedData?.building,
            })}
          />
          <AddressInput
            form={form}
            context={context}
            setContext={setContext}
            target="apartment"
            prefix={prefix}
            placeholder="Квартира/офис"
            disabled={
              !editable || !form.getFieldValue(`${prefix}settlementFiasId`)
            }
            searchDisabled={true}
            inputClassName={classNames({
              highlighted:
                !!comparedData &&
                context?.apartment !== comparedData?.apartment,
            })}
          />
        </Fragment>
      ) : (
        <Fragment>
          <Form.Item name={`${prefix}country`}>
            <Input placeholder="Страна" readOnly />
          </Form.Item>
          <Form.Item name={`${prefix}settlement`}>
            <Input placeholder="Населенный пункт" readOnly />
          </Form.Item>
          <Form.Item name={`${prefix}street`}>
            <Input placeholder="Улица/мкр/кв-л" readOnly />
          </Form.Item>
          <Form.Item name={`${prefix}building`}>
            <Input placeholder="Дом/строение" readOnly />
          </Form.Item>
          <Form.Item name={`${prefix}apartment`}>
            <Input placeholder="Квартира/офис" readOnly />
          </Form.Item>
        </Fragment>
      )}
    </FormGroup>
  );
};

export default AddressInputGroup;
