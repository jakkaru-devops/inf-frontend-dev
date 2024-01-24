import { IOrder, IOrderRequest } from 'sections/Orders/interfaces';
import { IOrganization } from 'sections/Organizations/interfaces';
import { convertNavItem } from 'utils/common.utils';
import { APP_PATHS } from './paths.data';

export const DEFAULT_NAV_PATHS = {
  // Common
  HOME: [],
  CART: ['cart'],
  REQUEST: ['request'],
  FAVORITES: ['personal-area', 'favorites'],
  ACCOUNT_REVIEW: ['account-review'],
  REFUND_LIST: ['personal-area', 'refunds'],
  COMPLAINT_LIST: ['personal-area', 'complaints'],
  REWARD_LIST: ['personal-area', 'rewards'],
  BAN: ['ban'],
  // Auth
  REGISTER_SELLER_COMPLETE: ['register/seller/complete'],
  REGISTER_SELLER_ORGANIZATION: ['register/seller/organization'],
  LOGIN_CUSTOMER: ['login/customer'],
  // Personal area
  PERSONAL_AREA: ['personal-area'],
  USER_SETTINGS: [
    'personal-area',
    convertNavItem(APP_PATHS.USER_SETTINGS, 'Основные данные'),
  ],
  USER_SETTINGS_ORGANIZATION: (orgId: string, text: string) => [
    'personal-area',
    convertNavItem(APP_PATHS.USER_SETTINGS, 'Основные данные'),
    convertNavItem(APP_PATHS.USER_SETTINGS_ORGANIZATION(orgId), text),
  ],
  // Catalog
  CATALOG_EXTERNAL: ['catalog-external'],
  CATALOG: ['catalog'],
  PRODUCT_LIST: ['catalog', 'catalog/products'],
  PRODUCT_OFFER_LIST: ['personal-area', 'product-offers'],
  PRODUCT_OFFER: (id: string, text: string) => [
    'personal-area',
    'product-offers',
    convertNavItem(APP_PATHS.PRODUCT_OFFER(id), text),
  ],
  EDIT_PRODUCT: (id: string, text: string) => [
    convertNavItem(APP_PATHS.PRODUCT_LIST, 'Каталог'),
    convertNavItem(APP_PATHS.PRODUCT(id), text),
    convertNavItem(APP_PATHS.EDIT_PRODUCT(id), 'Редактирование'),
  ],
  // Sale
  SALE_PRODUCT_LIST: ['personal-area', 'sale-products'],
  ADD_SALE_PRODUCT: ['personal-area', 'sale-products', 'sale-products/add'],
  // Orders
  ORDER_REQUEST_LIST: ['personal-area', 'requests'],
  ORDER_REQUEST: (id: IOrderRequest['id'], text: string) => [
    'personal-area',
    'requests',
    convertNavItem(APP_PATHS.ORDER_REQUEST(id), text),
  ],
  ORDER_REQUEST_OFFER_LIST: (id: IOrderRequest['id'], text: string) => [
    'personal-area',
    'requests',
    convertNavItem(APP_PATHS.ORDER_REQUEST(id), text),
    'offers',
  ],
  ORDER_LIST: ['personal-area', 'orders'],
  ORDER: (id: IOrderRequest['id'], text: string) => [
    'personal-area',
    'orders',
    convertNavItem(APP_PATHS.ORDER(id), text),
  ],
  ORDER_IN_HISTORY: (id: IOrderRequest['id'], text: string) => [
    'personal-area',
    convertNavItem(APP_PATHS.ORDER_HISTORY_LIST, 'История заказов'),
    convertNavItem(APP_PATHS.ORDER(id), text),
  ],
  ORDER_IN_REFUNDS: (id: IOrderRequest['id'], text: string) => [
    'personal-area',
    convertNavItem(APP_PATHS.REFUND_LIST, 'Возврат/обмен'),
    convertNavItem(APP_PATHS.ORDER(id), text),
  ],
  ORDER_OFFER: (
    id: IOrderRequest['id'],
    offerId: IOrder['id'],
    text: string,
  ) => [
    'personal-area',
    'orders',
    convertNavItem(APP_PATHS.ORDER_OFFER(id, offerId), text),
  ],
  ORDER_HISTORY_LIST: [
    'personal-area',
    convertNavItem(APP_PATHS.ORDER_HISTORY_LIST, 'История заказов'),
  ],
  CUSTOM_ORDER: ['personal-area', APP_PATHS.CUSTOM_ORDER],
  // Organizations
  ORGANIZATION_LIST: ['personal-area', 'organizations'],
  ORGANIZATION: (orgId: IOrganization['id'], text: string) => [
    'personal-area',
    'organizations',
    convertNavItem(APP_PATHS.ORGANIZATION(orgId), text),
  ],
  EDIT_ORGANIZATION: (orgId: string, text: string) => [
    'personal-area',
    'organizations',
    convertNavItem(APP_PATHS.EDIT_ORGANIZATION(orgId), text),
  ],
  ORGANIZATION_UPDATE_APPLICATION: (
    orgId: string,
    applicationId: string,
    texts: { org: string },
  ) => [
    'personal-area',
    'organizations',
    convertNavItem(APP_PATHS.ORGANIZATION(orgId), texts.org),
    convertNavItem(
      APP_PATHS.ORGANIZATION_UPDATE_APPLICATION(orgId, applicationId),
      'Запрос на обновление данных',
    ),
  ],
  ORGANIZATION_SELLER_APPLICATION: (
    orgId: string,
    userId: string,
    texts: { org: string; user: string },
  ) => [
    'personal-area',
    'organizations',
    convertNavItem(APP_PATHS.ORGANIZATION(orgId), texts.org),
    convertNavItem(
      APP_PATHS.ORGANIZATION_SELLER_APPLICATION(orgId, userId),
      texts.user,
    ),
  ],
  // Users
  CUSTOMER_LIST: ['personal-area', 'customers'],
  CUSTOMER: (userId: string, text: string) => [
    'personal-area',
    'customers',
    convertNavItem(APP_PATHS.CUSTOMER(userId), text),
  ],
  CUSTOMER_ORGANIZATION: (
    userId: string,
    organizationId: string,
    text: string,
  ) => [
    'personal-area',
    'customers',
    convertNavItem(APP_PATHS.CUSTOMER(userId), text),
    convertNavItem(
      APP_PATHS.CUSTOMER_ORGANIZATION(userId, organizationId),
      text,
    ),
  ],
  CUSTOMER_COMPLAINTS: (userId: string, text: string) => [
    'personal-area',
    'customers',
    convertNavItem(APP_PATHS.CUSTOMER_COMPLAINTS(userId), text),
  ],
  SELLER_LIST: ['personal-area', 'sellers'],
  SELLER: (userId: string, text: string) => [
    'personal-area',
    'sellers',
    convertNavItem(APP_PATHS.SELLER(userId), text),
  ],
  SELLER_COMPLAINTS: (userId: string, text: string) => [
    'personal-area',
    'sellers',
    convertNavItem(APP_PATHS.SELLER_COMPLAINTS(userId), text),
  ],
  EMPLOYEE_LIST: ['personal-area', 'employees'],
  EMPLOYEE: (userId: string, text: string) => [
    'personal-area',
    'employees',
    convertNavItem(APP_PATHS.EMPLOYEE(userId), text),
  ],
};
