import { Fragment, useContext } from 'react';
import { Form, Input } from 'antd';
import { AddressInputGroup, FormGroup } from 'components/common';
import { OrgFormFragmentContext } from './context';
import OrgBranchSelect from './OrgBranchSelect';
import InnInput from './InnInput';

const RegisteredOrg = () => {
  const { locale, form, state } = useContext(OrgFormFragmentContext);

  return (
    <Fragment>
      <InnInput />
      <div className="row row--content">
        <div className="col col--content">
          {state['org.entityType'] !== 'ИП' && (
            <FormGroup title="Наименование юр. лица">
              <Form.Item
                name="org.name"
                rules={[
                  {
                    required: true,
                    whitespace: true,
                    message: locale.validations.required,
                  },
                ]}
              >
                <Input disabled={true} />
              </Form.Item>
            </FormGroup>
          )}
          <FormGroup title="Наименование магазина/производства">
            <Form.Item
              name="org.shopName"
              rules={[
                {
                  required: true,
                  whitespace: true,
                  message: locale.validations.required,
                },
              ]}
            >
              <Input disabled={true} />
            </Form.Item>
          </FormGroup>
          {!!state['org.priceBenefitPercent'] && (
            <FormGroup title="Процент комиссии">
              <Form.Item name="org.priceBenefitPercent">
                <Input min={0} max={100} className="w-100" disabled={true} />
              </Form.Item>
            </FormGroup>
          )}
          {!!state['org.priceBenefitPercentAcquiring'] &&
            state['org.priceBenefitPercentInvoice'] && (
              <>
                <FormGroup title="Процент комиссии: Эквайринг">
                  <Form.Item name="org.priceBenefitPercentAcquiring">
                    <Input
                      min={2.5}
                      max={100}
                      className="w-100"
                      disabled={true}
                    />
                  </Form.Item>
                </FormGroup>
                <FormGroup title="Процент комиссии: По счёту">
                  <Form.Item name="org.priceBenefitPercentInvoice">
                    <Input
                      min={0.1}
                      max={100}
                      className="w-100"
                      disabled={true}
                    />
                  </Form.Item>
                </FormGroup>
              </>
            )}
        </div>
        <div className="col col--content">
          <AddressInputGroup
            title="Фактический адрес"
            prefix="org.actualAddress."
            form={form}
            editable={false}
          />

          <OrgBranchSelect />
        </div>
      </div>
    </Fragment>
  );
};

export default RegisteredOrg;
