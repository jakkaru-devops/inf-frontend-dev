import { FormGroup } from 'components/common';
import { AutoComplete, Tooltip, Form, Input } from 'antd';
import { QuestionCircleFilled } from '@ant-design/icons';
import { FC, useState } from 'react';
import { APIRequest } from 'utils/api.utils';
import { useLocale } from 'hooks/locale.hook';
import classNames from 'classnames';
import { IAddressInputProps, IAddressSuggestion } from './interfaces';
import { API_ENDPOINTS } from 'data/paths.data';
import MaskedTextInput from 'react-text-mask';

const AddressInput: FC<IAddressInputProps> = ({
  form,
  context,
  setContext,
  target,
  options = {},
  setOptions,
  prefix,
  required,
  placeholder,
  hintText,
  disabled,
  fiasIdRequired,
  searchDisabled,
  bound,
  className,
  inputClassName,
}) => {
  const { locale } = useLocale();

  const [searchTimeout, setSearchTimeout] = useState(null as NodeJS.Timeout);

  const handleSearch = async (value: string) => {
    const newContext = {
      ...context,
      [target]: value,
    };
    if (fiasIdRequired) {
      if (target === 'settlement') {
        newContext[`${target}FiasId`] = null;
        form.setFields([{ name: `${prefix}${target}FiasId`, value: null }]);
        form.validateFields([`${prefix}${target}FiasId`]);

        newContext[`street`] = null;
        form.setFields([{ name: `${prefix}street`, value: null }]);
      }
    }
    setContext(newContext);

    if (searchDisabled || !options[target]) return;

    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    if (value.trim().length <= 0) return;

    setSearchTimeout(
      setTimeout(async () => {
        const res = await APIRequest<{ suggestions: IAddressSuggestion[] }>({
          method: 'post',
          url: API_ENDPOINTS.ADDRESS_SUGGESTIONS,
          data: {
            query: value,
            target,
            context,
            bound,
            count: 10,
          },
        });
        if (res.isSucceed) {
          setOptions({
            ...options,
            [target]: res.data.suggestions,
          });
        }
      }, 300),
    );
  };

  const handleSelect = (_: string, option: IAddressSuggestion) => {
    option = options[target].find(({ value }) => value === option.value);

    const newContext = {
      ...context,
      ...option.context,
      [`${target}FiasId`]: option.fiasId,
      [target]: option.value,
    };

    if (fiasIdRequired) {
      if (target === 'settlement') {
        form.setFields([
          {
            name: `${prefix}regionFiasId`,
            value: option.context.regionFiasId,
          },
          {
            name: `${prefix}region`,
            value: option.context.regionWithType,
          },
          { name: `${prefix}areaFiasId`, value: option.context.areaFiasId },
          { name: `${prefix}area`, value: option.context.areaWithType },
          { name: `${prefix}cityFiasId`, value: option.context.cityFiasId },
          { name: `${prefix}city`, value: option.context.cityWithType },
        ]);

        newContext[`street`] = null;
        form.setFields([{ name: `${prefix}street`, value: null }]);
        setOptions({
          ...options,
          street: [],
        });
      }
      form.setFields([
        { name: `${prefix}${target}FiasId`, value: option.fiasId },
      ]);
      form.validateFields([`${prefix}${target}FiasId`]);
    }
    if (target === 'street') {
      form.setFields([
        { name: `${prefix}${target}FiasId`, value: option.fiasId },
        { name: `${prefix}${target}`, value: option.value },
      ]);
    }

    setContext({ ...newContext });
  };

  const markGroup =
    required || hintText ? (
      <div className="mark-group">
        {required && (
          <div className="required-mark">
            <Tooltip title={locale.validations.required} placement="top">
              *
            </Tooltip>
          </div>
        )}
        {hintText && (
          <div className="question-mark">
            <Tooltip title={hintText} placement="top">
              <QuestionCircleFilled />
            </Tooltip>
          </div>
        )}
      </div>
    ) : (
      <></>
    );

  return (
    <FormGroup className={className}>
      {markGroup}
      <Form.Item
        name={`${prefix}${target}`}
        rules={
          required
            ? [
                {
                  required: true,
                  whitespace: true,
                  message: locale.validations.required,
                },
              ]
            : []
        }
      >
        {target === 'postcode' ? (
          <MaskedTextInput
            mask={[/[1-9]/, /\d/, /\d/, /\d/, /\d/, /\d/]}
            placeholder={placeholder}
            onChange={e => handleSearch(e.target.value)}
            disabled={disabled}
            className={classNames(['masked-text-input', inputClassName])}
          />
        ) : (
          <AutoComplete
            onSearch={handleSearch}
            onSelect={(value, option) => handleSelect(value, option as any)}
            options={(options[target] || []).map((option, i) => ({
              key: i,
              value: option.value,
              fias_id: option.fiasId,
            }))}
            disabled={disabled}
          >
            <Input.TextArea
              placeholder={placeholder}
              autoSize={{ maxRows: 3 }}
              className={inputClassName}
            />
          </AutoComplete>
        )}
      </Form.Item>
      {fiasIdRequired && (
        <Form.Item
          name={`${prefix}${target}FiasId`}
          rules={
            required
              ? [
                  {
                    required: true,
                    whitespace: true,
                    message: 'Необходимо выбрать пункт из подсказок',
                    validateTrigger: `${prefix}${target}`,
                  },
                ]
              : []
          }
          className={classNames('show-error-only', {
            hidden: !!context[`${target}FiasId`],
          })}
        >
          <Input />
        </Form.Item>
      )}
    </FormGroup>
  );
};

export default AddressInput;
