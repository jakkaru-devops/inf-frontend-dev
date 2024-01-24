import { Form, Button, Alert } from 'antd';
import _ from 'lodash';
import { APP_PATHS } from 'data/paths.data';
import {
  BreadCrumbs,
  FormGroup,
  Page,
  PageContent,
  PageTop,
  PageTopPanel,
} from 'components/common';
import classNames from 'classnames';
import useHandlers from './handlers';
import SimplifiedRegSeller from 'sections/Organizations/components/OrganizationSellerFormFragment/simplifiedRegSeller';
import { IUser } from 'sections/Users/interfaces';
import { openNotification } from 'utils/common.utils';
import { FC, useEffect, useState } from 'react';
import socketService from 'services/socket';
import { STRINGS } from 'data/strings.data';
import CategoriesSelectionModal from 'sections/Catalog/components/CategoriesSelectionModal';

interface IProps {
  user: IUser;
}

const RegisterSellerCompletePageContent: FC<IProps> = ({ user }) => {
  const {
    locale,
    auth,
    form,
    fileList,
    categorySelectionVisible,
    setCategorySelectionVisible,
    selectedAutoBrands,
    setSelectedAutoBrands,
    selectedGroupIds,
    setSelectedGroupIds,
    resetCategories,
    uploadFile,
    deleteFile,
    handleFormSubmit,
    state,
    setState,
  } = useHandlers({
    user,
  });

  // Deprecated
  const [registerAdvanced, setRegisterAdvanced] = useState<boolean>(
    auth.sellerRegisterSimplified,
  );

  useEffect(() => {
    if (!socketService.socket) return;
    socketService.socket
      .off(STRINGS.SERVER_ORGANIZATION_COMMISSION_TYPE_CHANGED)
      .on(STRINGS.SERVER_ORGANIZATION_COMMISSION_TYPE_CHANGED, () =>
        setRegisterAdvanced(true),
      );
  }, [registerAdvanced]);

  return (
    <Page>
      <BreadCrumbs
        list={[
          {
            link: APP_PATHS.REGISTER_SELLER_COMPLETE,
            text: locale.user.register,
          },
        ]}
      />
      <PageTop title={locale.user.register} />
      <PageTopPanel />
      <PageContent containerProps={{ size: 'small', noPadding: true }}>
        <Form
          className={classNames([
            'register-form',
            `${registerAdvanced && 'simplifield-form '}`,
          ])}
          form={form}
          initialValues={{
            ...state,
          }}
          onFinish={handleFormSubmit}
        >
          <section
            className="register-form__section"
            style={{ width: 300, margin: '0 auto' }}
          >
            <h3 className="register-form__section__title">
              {locale.other.personalDataSeller}
            </h3>
            <h3 className="register-form__section__subtitle">
              {locale.organizations.requiredFields}
            </h3>

            {user.sellers.length > 0 && user.sellers[0].rejections[0] && (
              <>
                <hr className="mt-10 mb-10" />
                <FormGroup title={locale.organizations.lastRefusal}>
                  <Alert
                    message={user.sellers[0].rejections[0].message}
                    type={
                      user.sellers[0].rejections[0].isResponded
                        ? 'success'
                        : 'error'
                    }
                    showIcon
                  />
                </FormGroup>
                <hr className="mt-10 mb-10" />
              </>
            )}

            <SimplifiedRegSeller
              state={state}
              fileList={fileList.user}
              advanced={registerAdvanced}
            />
          </section>

          <div
            className="d-table m-auto btn-block__seller"
            style={{ width: 300 }}
          >
            <Button
              type="primary"
              className="w-100 mt-30"
              onClick={() => setCategorySelectionVisible(true)}
            >
              {locale.other.selectCategory}
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              className="w-100 mt-20"
              onClick={() => {
                form
                  .validateFields()
                  .then(() => {})
                  .catch(() => {
                    openNotification('Не все поля корректно заполнены');
                  });
              }}
            >
              {!user?.sellers?.length
                ? locale.organizations.sendRegisterRequest
                : locale.organizations.sendTuRegisterRequest}
            </Button>
          </div>
        </Form>

        <CategoriesSelectionModal
          open={categorySelectionVisible}
          onClose={() => setCategorySelectionVisible(false)}
          onSave={() => setCategorySelectionVisible(false)}
          resetCategories={resetCategories}
          selectedAutoBrands={selectedAutoBrands}
          setSelectedAutoBrands={setSelectedAutoBrands}
          selectedGroupIds={selectedGroupIds}
          setSelectedGroupIds={setSelectedGroupIds}
        />
      </PageContent>
    </Page>
  );
};

export default RegisterSellerCompletePageContent;
