import { useContext } from 'react';
import { Form, Input, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { FormGroup } from 'components/common';
import { useFormValidation } from 'hooks/formValidation.hooks';
import { OrgFormFragmentContext } from './context';

interface IProp {
  disabled?: boolean;
}

const InnInput = ({ disabled = false }: IProp) => {
  const { loading, state, setState, handleOrgInnChange } = useContext(
    OrgFormFragmentContext,
  );
  const { validateInn } = useFormValidation();

  return (
    <FormGroup title="ИНН">
      <Form.Item name="org.inn" rules={[{ validator: validateInn }]}>
        <Input
          disabled={disabled}
          max={12}
          onChange={e => {
            setState({
              ...state,
              'org.inn': e.target.value,
            });
            handleOrgInnChange(e.target.value);
          }}
          suffix={
            loading ? (
              <Spin
                size="small"
                indicator={
                  <LoadingOutlined
                    style={{ fontSize: 15 }}
                    className="color-primary"
                  />
                }
              />
            ) : state['org.isRegistered'] ? (
              <span style={{ color: '#ccc' }}>организация уже есть в базе</span>
            ) : (
              <></> // focus falls from the input if suffix value changes from positive to null
            )
          }
        />
      </Form.Item>
    </FormGroup>
  );
};

export default InnInput;
