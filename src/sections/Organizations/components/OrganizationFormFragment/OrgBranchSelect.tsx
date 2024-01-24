import { AddressInputGroup, FormGroup, MaskedInput } from 'components/common';
import { Button, Form, Input, Select } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import { convertAddressToString } from 'components/common/YandexMap/utils';
import { Fragment, useContext } from 'react';
import { OrgFormFragmentContext } from './context';
import { useFormValidation } from 'hooks/formValidation.hooks';
import MaskedTextInput from 'react-text-mask';

interface IProp {
  isSeller?: boolean;
}

const OrgBranchSelect = ({ isSeller = false }: IProp) => {
  const {
    form,
    branches,
    branchPermissions,
    addBranchOffice,
    changeOrgBranch,
    setCurrentBranchOfficeIndex,
    deleteBranchOffice,
    locale,
  } = useContext(OrgFormFragmentContext);
  const { validateMaskedInput } = useFormValidation();

  const isNewBranch: boolean = !!branches.list[branches.index]?.id;
  const disabled: boolean = !isSeller ? isSeller : isNewBranch;

  return (
    <FormGroup title="Филиалы">
      {branches.list.length > 0 && (
        <div
          title={
            convertAddressToString(
              branches?.list?.[branches.index]?.actualAddress,
            ) || 'Адрес не определен'
          }
        >
          <Select
            value={branches.index}
            onChange={value => setCurrentBranchOfficeIndex(value)}
            className="mb-5 bg-gray"
            style={{
              maxWidth: 285,
            }}
          >
            {branchPermissions.selectNoBranchOffice && (
              <Select.Option value={-1}>
                <div
                  className="d-flex justify-content-between"
                  style={{
                    overflow: 'hidden',
                  }}
                >
                  <span>Без филиала</span>
                </div>
              </Select.Option>
            )}
            {branches.list.map((item, i) => (
              <Select.Option key={i} value={i}>
                <div
                  className="d-flex justify-content-between"
                  style={{
                    overflow: 'hidden',
                  }}
                >
                  <span>
                    {convertAddressToString(item.actualAddress) ||
                      'Адрес не определен'}
                  </span>
                  <span>{item.isMain && <CheckOutlined />}</span>
                </div>
              </Select.Option>
            ))}
          </Select>
        </div>
      )}

      {branches.list.length > 0 && branches.index !== -1 && (
        <Fragment>
          <AddressInputGroup
            editable={!isNewBranch ? !isNewBranch : !isSeller}
            title=""
            prefix="org.branchAddress."
            form={form}
            onChange={context => {
              const item = branches.list[branches.index];
              changeOrgBranch({
                ...item,
                actualAddress: {
                  ...context,
                },
              });
            }}
            className="mb-0"
          />
          <Form.Item
            name="org.branchKpp"
            rules={[{ validator: validateMaskedInput }]}
          >
            <MaskedTextInput
              disabled={disabled}
              mask={[/[1-9]/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/]}
              placeholder="КПП"
              onChange={e => {
                const item = branches.list[branches.index];
                changeOrgBranch({
                  ...item,
                  kpp: e.target.value,
                });
              }}
              className="masked-text-input"
            />
          </Form.Item>
          <FormGroup title={<span>Банковские реквизиты филиала</span>}>
            <Form.Item
              name="org.branchBankName"
              rules={[
                {
                  required: true,
                  whitespace: true,
                  message: locale.validations.required,
                },
              ]}
            >
              <Input
                disabled={disabled}
                placeholder="Наименование банка"
                onChange={e => {
                  const item = branches.list[branches.index];
                  changeOrgBranch({
                    ...item,
                    bankName: e.target.value,
                  });
                }}
              />
            </Form.Item>
            <Form.Item
              name="org.branchBankBik"
              rules={[{ validator: validateMaskedInput }]}
            >
              <MaskedInput
                disabled={disabled}
                placeholder="БИК банка"
                format="bik"
                onChange={e => {
                  const item = branches.list[branches.index];
                  changeOrgBranch({
                    ...item,
                    bankBik: e.target.value,
                  });
                }}
              />
            </Form.Item>
            <Form.Item
              name="org.branchBankKs"
              rules={[{ validator: validateMaskedInput }]}
            >
              <MaskedInput
                disabled={disabled}
                placeholder="К/с банка"
                format="ks"
                onChange={e => {
                  const item = branches.list[branches.index];
                  changeOrgBranch({
                    ...item,
                    bankKs: e.target.value,
                  });
                }}
              />
            </Form.Item>
            <Form.Item
              name="org.branchBankRs"
              rules={[{ validator: validateMaskedInput }]}
            >
              <MaskedInput
                disabled={disabled}
                placeholder="Р/с банка"
                format="rs"
                onChange={e => {
                  const item = branches.list[branches.index];
                  changeOrgBranch({
                    ...item,
                    bankRs: e.target.value,
                  });
                }}
              />
            </Form.Item>
          </FormGroup>
        </Fragment>
      )}

      {branchPermissions.addItem && (
        <Button onClick={addBranchOffice}>+ Добавить филиал</Button>
      )}
      {branchPermissions.deleteItem && (
        <Button
          onClick={() => deleteBranchOffice(branches.index)}
          className="mt-5"
        >
          - Удалить филиал
        </Button>
      )}
    </FormGroup>
  );
};

export default OrgBranchSelect;
