import {
  ChangeEvent,
  createRef,
  FC,
  LegacyRef,
  RefObject,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Form, Input, Button, Checkbox, Modal } from 'antd';
import InputMask, { ReactInputMask } from 'react-input-mask';
import jsCookie from 'js-cookie';
import { useRouter } from 'next/dist/client/router';
import { useDispatch } from 'react-redux';
import ReCAPTCHA from 'react-google-recaptcha';
import { APIRequest } from 'utils/api.utils';
import { API_ENDPOINTS, APP_PATHS } from 'data/paths.data';
import { Container, FormGroup } from 'components/common';
import { IUserRoleLabelsDefault } from 'sections/Users/interfaces';
import { fetchAuthUser } from 'sections/Auth/utils';
import { useLocale } from 'hooks/locale.hook';
import {
  generateInnerUrl,
  generateUrl,
  openNotification,
  secondsToHms,
  simplifyPhoneNumber,
} from 'utils/common.utils';
import { STRINGS } from 'data/strings.data';
import {
  getCartDataFromLocalStorage,
  isCartOrderRequestCreatingAllowed,
} from 'sections/Cart/utils';
import {
  getCustomOrderDataFromLocalStorage,
  isCustomOrderRequestCreatingAllowed,
} from 'sections/Orders/pages/CustomOrder.page/utils';
import classNames from 'classnames';
import addDate from 'date-fns/add';
import { SERVICE_DOCS } from 'data/files.data';
import { GOOGLE_RECAPTCHA_SITE_KEY } from 'config/env';
import { useAuth } from 'hooks/auth.hook';
import { setCartProducts } from 'store/reducers/cart.reducer';
import { ICartProductBasic } from 'sections/Cart/interfaces/interfaces';
import { setAuth } from 'store/reducers/auth.reducer';
import { useCart } from 'hooks/cart.hook';
import { DEFAULT_NAV_PATHS } from 'data/nav.data';
import { API_ENDPOINTS_V2 } from 'data/api.data';

interface IProps {
  userRole?: IUserRoleLabelsDefault;
  initialState?: {
    phone: string;
    confirmCode: string;
    isConfirmCodeGotten: boolean;
  };
  mode: 'register' | 'login';
  submitButtonText?: string;
  showPhoneInput?: boolean;
}

const AuthByPhoneNumberForm: FC<IProps> = ({
  userRole,
  initialState,
  mode,
  submitButtonText,
  showPhoneInput = true,
}) => {
  const authState = useAuth();
  const cart = useCart();
  const dispatch = useDispatch();
  const router = useRouter();
  const { locale } = useLocale();
  const recaptchaRef: RefObject<any> = useRef();
  const securedByCaptcha = !!GOOGLE_RECAPTCHA_SITE_KEY;
  const [recaptchaToken, setRecaptchaToken] = useState<string>(null);
  const orderRequestCreating =
    !!router.query?.[STRINGS.QUERY.SEND_ORDER_REQUEST];
  const customOrderRequestCreating =
    !!router.query?.[STRINGS.QUERY.SEND_CUSTOM_ORDER_REQUEST];

  const [timer, setTimer] = useState<number | null>(null);
  const [state, setState] = useState(
    initialState
      ? initialState
      : {
          phone: '',
          confirmCode: '',
          isConfirmCodeGotten: false,
        },
  );
  const [attemptsCount, setAttemptsCount] = useState(0);
  const [rulesModalVisible, setRulesModalVisible] = useState(false);
  const [rulesAgreed, setRulesAgreed] = useState(true);
  const [sendSmsAgreed, setSendSmsAgreed] = useState(false);
  const [codeAwaiting, setCodeAwaiting] = useState(false);
  const [loginAwaiting, setLoginAwaiting] = useState(false);
  const phoneInputRef: LegacyRef<any> = createRef();
  const confirmCodeInputRef: LegacyRef<any> = createRef();
  const inputsUntyped: any[] = [
    () => (inputProps: ReactInputMask) =>
      (
        <Input
          {...inputProps}
          disabled={state.isConfirmCodeGotten}
          ref={phoneInputRef}
        />
      ),
    () => (inputProps: ReactInputMask) =>
      (
        <Input
          {...inputProps}
          disabled={!state.isConfirmCodeGotten}
          ref={confirmCodeInputRef}
        />
      ),
  ];

  const handleSubmit = async (action?: 'getCode') => {
    if (!isCartOrderRequestCreatingAllowed(() => router.push(APP_PATHS.CART)))
      return;
    if (
      !isCustomOrderRequestCreatingAllowed(() =>
        router.push(APP_PATHS.CUSTOM_ORDER),
      )
    )
      return;

    let orderRequest = null;
    if (orderRequestCreating) orderRequest = getCartDataFromLocalStorage();
    if (customOrderRequestCreating)
      orderRequest = getCustomOrderDataFromLocalStorage();

    if (
      !state.isConfirmCodeGotten ||
      (state.confirmCode.replace(/_/g, '').length < 4 && !timer) ||
      action === 'getCode'
    ) {
      await getCode();
    } else {
      await login({
        orderRequest,
      });
    }
  };

  // If confirm code is not gotten yet
  // Set focus on phone number input
  // Else
  // Set focus on confirm code input after confirm code is gotten
  useEffect(() => {
    if (!state.isConfirmCodeGotten) {
      if (phoneInputRef.current) {
        phoneInputRef.current.input.focus();
      }
    } else {
      if (confirmCodeInputRef.current) {
        confirmCodeInputRef.current.input.focus();
      }
    }
  }, [state.isConfirmCodeGotten]);

  useEffect(() => {
    const interval = setInterval(() => {
      timer > 0 && setTimer(timer - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const handlePhoneChange = (value: string) => {
    setState(prev => ({
      ...prev,
      phone: value,
    }));
    // Reset timer if user is waiting for timer and changes phone value
    if (!!timer) {
      setTimer(0);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.name === 'phone') {
      handlePhoneChange(e.target.value);
    } else {
      setState({
        ...state,
        [e.target.name]: e.target.value,
      });
    }
  };

  const getCode = async () => {
    if (codeAwaiting) return;
    setCodeAwaiting(true);

    const data = {
      role: userRole,
      phone: state.phone,
      testAccessKey: router.query?.testAccessKey,
      platform: 'web',
    };

    // Verify reCaptcha and include to request data
    if (securedByCaptcha) {
      if (!recaptchaRef?.current) {
        setCodeAwaiting(false);
        return;
      }
      if (!!recaptchaToken) recaptchaRef.current.reset();
      const token = await recaptchaRef.current.executeAsync();
      if (!token) {
        setCodeAwaiting(false);
        return;
      }
      data['googleReCaptchaSiteKey'] = GOOGLE_RECAPTCHA_SITE_KEY;
      data['googleReCaptchaToken'] = token;
      setRecaptchaToken(token);
    }

    const res = await APIRequest({
      method: 'post',
      url: API_ENDPOINTS.LOGIN,
      data,
    });
    setCodeAwaiting(false);

    if (!res.isSucceed) {
      openNotification(res.message);
      return;
    }
    const resData: { success: boolean; secondsBeforeNextAttempt: number } =
      res.data;

    if (typeof resData?.success !== 'undefined') {
      setTimer(resData.secondsBeforeNextAttempt);
      setAttemptsCount(prev => prev + 1);
      if (!resData?.success) {
        openNotification('Авторизация еще недоступна');
      }
      return setState({
        ...state,
        isConfirmCodeGotten: resData?.success,
      });
    }
  };

  const login = async (data?: { orderRequest: any }) => {
    if (loginAwaiting) return;
    setLoginAwaiting(true);
    const res = await APIRequest({
      method: 'post',
      url: API_ENDPOINTS.LOGIN,
      data: {
        ...data,
        role: userRole,
        confirmCode: state.confirmCode,
        phone: state.phone,
        testAccessKey: router.query?.testAccessKey,
        platform: 'web',
      },
    });
    setLoginAwaiting(false);

    if (!res.isSucceed) {
      openNotification(res.message);
      return;
    }

    const token = res.data.payload.token;
    jsCookie.set(STRINGS.AUTH_TOKEN, token, {
      expires: addDate(new Date(), { weeks: 1 }),
    });
    const roleId = res.data?.role;

    const auth = await fetchAuthUser(authState, roleId);

    if (customOrderRequestCreating) {
      Object.keys(STRINGS.CUSTOM_ORDER).forEach(key => {
        localStorage.removeItem(STRINGS.CUSTOM_ORDER[key]);
      });
    }
    if (!orderRequestCreating && !customOrderRequestCreating) {
      const cartProducts: ICartProductBasic[] = auth.user.cartProducts.map(
        cartProduct => ({
          productId: cartProduct.productId,
          quantity: cartProduct.quantity,
          priceOfferId: cartProduct.priceOfferId,
          isSelected: cartProduct.isSelected,
          deliveryMethod: cartProduct.deliveryMethod,
          createdAt: cartProduct.createdAt,
        }),
      );
      let i = 0;
      for (const cartProduct of auth.user.cartProducts) {
        const localCartProduct = cart.products.find(
          ({ productId }) => productId === cartProduct.productId,
        );
        if (
          localCartProduct &&
          localCartProduct.quantity !== cartProduct.quantity
        ) {
          await APIRequest({
            method: 'put',
            url: API_ENDPOINTS_V2.cart.updateCartProduct(
              localCartProduct.productId,
            ),
            data: {
              quantity: localCartProduct.quantity,
              priceOfferId: localCartProduct.priceOfferId,
            },
            requireAuth: true,
          });
          cartProducts[i].quantity = localCartProduct.quantity;
        }
        i++;
      }
      for (const cartProduct of cart.products) {
        if (
          !!auth.user.cartProducts.find(
            ({ productId }) => productId === cartProduct.productId,
          )
        ) {
          continue;
        }
        await APIRequest({
          method: 'post',
          url: API_ENDPOINTS_V2.cart.createCartProduct,
          data: {
            productId: cartProduct.productId,
            quantity: cartProduct.quantity,
            priceOfferId: cartProduct.priceOfferId,
            isSelected: cartProduct.isSelected,
            deliveryMethod: cartProduct.deliveryMethod,
          },
          requireAuth: true,
        });
        cartProducts.push(cartProduct);
      }
      dispatch(setCartProducts(cartProducts));
    }

    dispatch(setAuth(auth));
    jsCookie.set(STRINGS.CURRENT_ROLE, auth.currentRole.id, {
      expires: addDate(new Date(), { weeks: 1 }),
    });

    if (orderRequestCreating) {
      router.push(
        generateUrl(
          { history: DEFAULT_NAV_PATHS.CART },
          { pathname: APP_PATHS.CART },
        ),
      );
    } else {
      router.push(
        generateInnerUrl(APP_PATHS.PERSONAL_AREA, {
          searchParams: {
            history: ['personal-area'],
            [STRINGS.QUERY.SEND_ORDER_REQUEST]: null,
          },
        }),
      );
    }
  };

  return (
    <Container size="extraSmall">
      <Form initialValues={state} layout="vertical" onFinish={handleSubmit}>
        {showPhoneInput && (
          <FormGroup>
            <Form.Item
              name="phone"
              label={locale.common.phone}
              className="mb-10"
            >
              <InputMask
                mask="+7(999) 999-99-99"
                placeholder="+7(___) ___-__-__"
                name="phone"
                value={state.phone}
                onChange={handleInputChange}
                disabled={state.isConfirmCodeGotten}
                onPaste={e => {
                  e.preventDefault();
                  const valueRaw = e.clipboardData.getData('text');
                  const value = simplifyPhoneNumber(valueRaw);
                  if (!!value) handlePhoneChange(value);
                  else handlePhoneChange(valueRaw);
                }}
              >
                {inputsUntyped[0]()}
              </InputMask>
              <span
                className="ant-statistic-title block mt-10 mb-0"
                style={{ lineHeight: 1.2, fontSize: 13.8 }}
              >
                На указанный номер поступит смс с кодом
              </span>
            </Form.Item>
          </FormGroup>
        )}

        {timer > 0 ? (
          <span
            className="ant-statistic-title block mb-10"
            style={{ lineHeight: 1.2, fontSize: 13.8 }}
          >
            {locale.other.requestNewCode} {secondsToHms(timer)}
          </span>
        ) : (
          <Button
            type="primary"
            htmlType="submit"
            block
            className={classNames('mb-15', {
              'disabled-gray':
                !rulesAgreed || !state.phone || state?.phone?.endsWith('_'),
            })}
            disabled={
              !rulesAgreed || !state.phone || state?.phone?.endsWith('_')
            }
            loading={codeAwaiting}
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              handleSubmit('getCode');
            }}
          >
            {!state.isConfirmCodeGotten
              ? locale.user.getCode
              : locale.user.getCodeAgain}
          </Button>
        )}

        {securedByCaptcha && (
          <ReCAPTCHA
            ref={recaptchaRef}
            size="invisible"
            sitekey={GOOGLE_RECAPTCHA_SITE_KEY}
            hl="ru"
          />
        )}

        <Form.Item name="confirmCode" className="mt-20 mb-15">
          <InputMask
            mask="9999"
            name="confirmCode"
            value={state.confirmCode}
            onChange={handleInputChange}
            disabled={!state.isConfirmCodeGotten}
          >
            {inputsUntyped[1]()}
          </InputMask>
          <span
            className="ant-statistic-title block mt-10 mb-0"
            style={{ lineHeight: 1.2, fontSize: 13.8 }}
          >
            Введите смс код
          </span>
        </Form.Item>

        {state.isConfirmCodeGotten &&
          state.confirmCode.replace(/_/g, '').length === 4 && (
            <Button
              type="primary"
              htmlType="submit"
              block
              className="mb-20"
              loading={loginAwaiting}
            >
              {submitButtonText || locale.user.login}
            </Button>
          )}

        {mode === 'register' && (
          <>
            <div className="mb-15">
              <Checkbox
                checked={rulesAgreed}
                onChange={e => {
                  if (state.isConfirmCodeGotten) return;
                  setRulesAgreed(e.target.checked);
                }}
              >
                Согласен с условиями{' '}
                <span
                  className="color-primary text-underline"
                  onClick={e => {
                    e.preventDefault();
                    e.stopPropagation();
                    setRulesModalVisible(true);
                  }}
                >
                  политики обработки персональных данных
                </span>
              </Checkbox>
            </div>

            <div>
              <Checkbox
                checked={sendSmsAgreed}
                onChange={e => {
                  setSendSmsAgreed(e.target.checked);
                }}
              >
                Получать смс-рассылку
              </Checkbox>
            </div>
          </>
        )}

        {/* Required by Google if reCAPTCHA badge is hidden */}
        {securedByCaptcha && (
          <div
            className="ant-statistic-title block mt-10 mb-0"
            style={{ lineHeight: 1.2, fontSize: 13.8 }}
          >
            This site is protected by reCAPTCHA and the Google{' '}
            <a href="https://policies.google.com/privacy" target="_blank">
              Privacy Policy
            </a>{' '}
            and{' '}
            <a href="https://policies.google.com/terms" target="_blank">
              Terms of Service
            </a>{' '}
            apply.
          </div>
        )}
      </Form>

      <Modal
        open={rulesModalVisible}
        onCancel={() => setRulesModalVisible(false)}
        centered
        width={'1000px'}
        footer={null}
        title={SERVICE_DOCS.PRIVACY_AGREEMENT.name}
        children={
          <object>
            <embed
              src={SERVICE_DOCS.PRIVACY_AGREEMENT.url}
              width="100%"
              style={{ height: '90vh' }}
              type="application/pdf"
            />
          </object>
        }
      />
    </Container>
  );
};

export default AuthByPhoneNumberForm;
