import { YANDEX_MAPS_API_KEY, YANDEX_MAPS_API_KEYS } from 'config/env';
import { LaximoUrlType } from '../sections/CatalogExternal/interfaces';
import { IEntityId } from 'interfaces/common.interfaces';

export const APP_PATHS = {
  // Common
  HOME: '/',
  CART: '/cart',
  REQUEST: '/request',
  FAVORITES: '/favorites',
  ACCOUNT_REVIEW: '/account-review',
  CONTACTS: '/contacts',
  REFUND_LIST: '/refunds',
  COMPLAINT_LIST: '/complaints',
  REWARD_LIST: '/rewards',
  METRICS: '/metrics',
  // Auth
  LOGIN_CUSTOMER: '/login/customer',
  LOGIN_SELLER: '/login/seller',
  REGISTER_SELLER_COMPLETE: '/register/seller/complete',
  REGISTER_SELLER_ORGANIZATION: '/register/seller/organization',
  // LOGIN: '/login',
  LOGOUT: '/logout',
  BAN: '/ban',
  // Catalog
  CATALOG: '/catalog',
  PRODUCT_LIST: '/catalog/products',
  CATALOG_EXTERNAL: '/catalog-external',
  CATALOG_EXTERNAL_AUTO_BRAND: (autoType: string, autoBrand: string) =>
    `/catalog-external/${autoType}/${autoBrand}`,
  CATALOG_EXTERNAL_AUTO_MODEL: (
    autoType: string,
    autoBrand: string,
    autoModel: string,
  ) => `/catalog-external/${autoType}/${autoBrand}/${autoModel}`,
  CATALOG_EXTERNAL_PRODUCT_GROUP: (
    autoType: string,
    autoBrand: string,
    autoModel: string,
    productGroup: string,
  ) =>
    `/catalog-external/${autoType}/${autoBrand}/${autoModel}/${productGroup}`,

  ACAT_MODEL_LIST: (autoType: string, autoBrand: string) =>
    `/catalog-external/acat/${autoType}/${autoBrand}`,
  ACAT_GROUP_LIST: (autoType: string, autoBrand: string, autoModel: string) =>
    `/catalog-external/acat/${autoType}/${autoBrand}/${autoModel}`,
  ACAT_MODIFICATION_GROUP_LIST: (
    autoType: string,
    autoBrand: string,
    autoModel: string,
    modification: string,
  ) =>
    `/catalog-external/acat/${autoType}/${autoBrand}/${autoModel}/${modification}`,
  ACAT_PARTS_LIST: (
    autoType: string,
    autoBrand: string,
    autoModel: string,
    productGroup: string,
  ) =>
    `/catalog-external/acat/${autoType}/${autoBrand}/${autoModel}/${productGroup}`,
  ACAT_MODIFICATIONS_PARTS_LIST: (
    autoType: string,
    autoBrand: string,
    autoModel: string,
    modification: string,
    productGroup: string,
  ) =>
    `/catalog-external/acat/${autoType}/${autoBrand}/${autoModel}/${modification}/${productGroup}`,
  ACAT_PRODUCT: (
    autoType: string,
    autoBrand: string,
    autoModel: string,
    productGroup: string,
    productId: string,
  ) =>
    `/catalog-external/acat/${autoType}/${autoBrand}/${autoModel}/${productGroup}/${productId}`,
  ACAT_MODIFICATIONS_PRODUCT: (
    autoType: string,
    autoBrand: string,
    autoModel: string,
    modification: string,
    productGroup: string,
    productId: string,
  ) =>
    `/catalog-external/acat/${autoType}/${autoBrand}/${autoModel}/${modification}/${productGroup}/${productId}`,

  LAXIMO_UNIT: (
    vehicleCode: string,
    unitId: string,
    laximoType: LaximoUrlType,
    ssd: string,
  ) =>
    `/catalog-external/laximo/${vehicleCode}/0/${unitId}?laximoType=${laximoType}&ssd=${ssd}`,

  ALL_PRODUCT_CATEGORIES: `/catalog/product-categories`,
  AUTO_TYPE_LIST: `catalog/product-categories/auto-types`,
  AUTO_BRAND_LIST: `catalog/product-categories/auto-brands`,
  AUTO_BRAND: (autoBrandId: string) =>
    `catalog/product-categories/auto-brands/${autoBrandId}`,
  PRODUCT_GROUP_LIST: `catalog/product-categories/groups`,
  PRODUCT_GROUP: (productGroupId: string) =>
    `catalog/product-categories/groups/${productGroupId}`,
  PRODUCT_SUBGROUP_LIST: `catalog/product-categories/subgroups`,
  PRODUCT_CATEGORY_TYPE: (categoryTypeId: string) =>
    `/catalog/category-types/item/${categoryTypeId}`,
  ADD_PRODUCT_CATEGORY: (categoryTypeId: string) =>
    `/catalog/category-types/item/${categoryTypeId}/categories/add`,
  PRODUCT_CATEGORY: (categoryTypeId: string, categoryId: string) =>
    `/catalog/category-types/item/${categoryTypeId}/categories/item/${categoryId}`,
  PRODUCT: (productId: string) => `/catalog/product/${productId}`,
  ADD_PRODUCT: '/catalog/product/add',
  EDIT_PRODUCT: (productId: string) => `/catalog/product/${productId}/edit`,
  PRODUCT_OFFER_LIST: '/product-offers',
  PRODUCT_OFFER: (productOfferId: string) =>
    `/product-offers/item/${productOfferId}`,
  ADD_PRODUCT_OFFER: '/product-offers/add',
  // Sale products
  SALE_PRODUCT_LIST: '/sale-products',
  SALE_PRODUCT: (productId: IEntityId) => `/sale-products/${productId}`,
  EDIT_SALE_PRODUCT: (productId: IEntityId) =>
    `/sale-products/${productId}/edit`,
  ADD_SALE_PRODUCT: '/sale-products/add',
  // Personal area
  PERSONAL_AREA: '/personal-area',
  USER_SETTINGS: '/personal-area/settings',
  USER_SETTINGS_ORGANIZATIONS: '/personal-area/settings?tab=organizations',
  USER_SETTINGS_ADD_ORGANIZATION:
    '/personal-area/settings?tab=organizations&organizationId=add',
  USER_SETTINGS_ORGANIZATION: (orgId: string) =>
    `/personal-area/settings?tab=organizations&organizationId=${orgId}`,
  SELLER_PRODUCT_CATEGORIES: `/personal-area/seller-product-categories`,
  // Orders
  ORDER_REQUEST_LIST: '/requests',
  ORDER_REQUEST: (orderRequestId: string) => `/requests/${orderRequestId}`,
  ORDER_REQUEST_OFFER_LIST: (orderRequestId: string) =>
    `/requests/${orderRequestId}/offers`,
  ORDER_LIST: '/orders',
  ORDER: (orderId: string) => `/orders/${orderId}`,
  ORDER_OFFER: (orderId: string, offerId: string) =>
    `/orders/${orderId}/?tab=${offerId}`,
  CUSTOM_ORDER: `/neworder`,
  CUSTOM_ORDER_PHOTO: `/neworder?type=photo`,
  CUSTOM_ORDER_DESC: `/neworder?type=desc`,
  ORDER_HISTORY_LIST: `/orders/history`,
  ORDER_REPEAT: (orderId: string) => `/orders/${orderId}/repeat`,
  ORDER_TRACKING: '/order-tracking',
  OFFERS_LIST: '/offers',
  // Organizations
  ORGANIZATION_LIST: '/organizations',
  ORGANIZATION: (orgId: string) => `/organizations/item/${orgId}`,
  EDIT_ORGANIZATION: (orgId: string) => `/organizations/item/${orgId}/edit`,
  ADD_ORGANIZATION: `/organizations/add`,
  ORGANIZATION_SELLER_APPLICATION: (orgId: string, userId: string) =>
    `/organizations/item/${orgId}/sellers/item/${userId}/application`,
  ORGANIZATION_UPDATE_APPLICATION: (orgId: string, applicationId: string) =>
    `/organizations/item/${orgId}/update-application/${applicationId}`,
  POSTPONED_PAYMENT_LIST: '/postponed-payments',
  // Users
  CUSTOMER_LIST: '/customers',
  CUSTOMER: (userId: string) => `/customers/item/${userId}`,
  CUSTOMER_ORGANIZATION: (userId: string, organizationId: string) =>
    `${APP_PATHS.CUSTOMER(userId)}/organizations/item/${organizationId}`,
  CUSTOMER_COMPLAINTS: (userId: string) =>
    `/customers/item/${userId}?tab=complaints`,
  SELLER_LIST: '/sellers',
  SELLER: (userId: string) => `/sellers/item/${userId}`,
  SELLER_COMPLAINTS: (userId: string) =>
    `/sellers/item/${userId}?tab=complaints`,
  SELLER_REVIEWS: (userId: string) => `/sellers/item/${userId}?tab=reviews`,
  EMPLOYEE: (userId: string) => `/employees/item/${userId}`,
  ADD_EMPLOYEE: `/employees/add`,
  EMPLOYEE_LIST: `/employees`,
};

export const API_ENDPOINTS = {
  MANAGER_LOGIN: `/auth/manager-login`,
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  COMPLETE_SELLER_REGISTER: '/auth/complete-seller-register',
  AUTH_GET_CODE: '/auth/get-code',
  // Catalog
  AUTO_TYPE_LIST: '/catalog/auto-types',
  AUTO_BRAND_LIST: '/catalog/auto-brands',
  AUTO_BRAND: (id: string) => `/catalog/auto-brands/${id}`,
  AUTO_MODEL_LIST: '/catalog/auto-models',
  AUTO_MODEL: (id: string) => `/catalog/auto-models/${id}`,
  PRODUCT_GROUP_LIST: '/catalog/product-groups',
  PRODUCT_GROUP: (id: string) => `/catalog/product-groups/${id}`,
  PRODUCT_LIST: '/catalog/products',
  PRODUCT_LIST_BY_IDS: '/catalog/products-by-ids',
  PRODUCT: (id: string) => `/catalog/products/${id}`,
  PRODUCT_BRANCHES: (id: string) => `/catalog/products/${id}/branches`,
  PRODUCT_ANALOGS: (productId: string) =>
    `/catalog/products/${productId}/analogs`,
  PRODUCT_APPLICABILITIES: (productId: string) =>
    `/catalog/products/${productId}/applicabilities`,
  PRODUCT_RECOMMENDED_PRODUCTS: (productId: string) =>
    `/catalog/products/${productId}/recommended-products`,
  CART_PRODUCT_LIST: '/catalog/cart-products',
  // Catalog external
  ACAT_ROOT: '/catalog/external',
  ACAT_IMAGE: '/catalog/external/image',
  ACAT_AUTO_TYPE_LIST: '/catalog/external/auto-types',
  // ACAT_AUTO_BRAND: '/catalog/external/auto-brand',
  // ACAT_AUTO_MODEL: '/catalog/external/auto-model',
  // ACAT_PRODUCT_GROUP: '/catalog/external/product-group',

  ACAT_MODEL_LIST: '/catalog/external/acat/models',
  ACAT_MODIFICATION_LIST: '/catalog/external/acat/modifications',
  ACAT_GROUP_LIST: '/catalog/external/acat/groups',
  ACAT_PARTS_LIST: '/catalog/external/acat/parts',

  LAXIMO_CATALOG_INFO: (urlType: LaximoUrlType) =>
    `/catalog/external/laximo/${urlType}/catalog-info`,
  LAXIMO_WIZARDS: (urlType: LaximoUrlType) =>
    `/catalog/external/laximo/${urlType}/wizards`,
  LAXIMO_WIZARDS_NEXT: (urlType: LaximoUrlType) =>
    `/catalog/external/laximo/${urlType}/wizards-next`,
  LAXIMO_CARS_BY_SSD: (urlType: LaximoUrlType) =>
    `/catalog/external/laximo/${urlType}/cars-by-wizard`,
  LAXIMO_CAR_INFO: (urlType: LaximoUrlType) =>
    `/catalog/external/laximo/${urlType}/car-info-groups`,
  LAXIMO_UNIT_INFO_IN_GROUP: (urlType: LaximoUrlType) =>
    `/catalog/external/laximo/${urlType}/unit-info-in-group`,
  LAXIMO_GET_CAR_BY_VIN_OR_FRAME: (urlType: LaximoUrlType) =>
    `/catalog/external/laximo/${urlType}/car-by-vin-or-frame`,
  LAXIMO_DETAIL_IN_UNIT: (urlType: LaximoUrlType) =>
    `/catalog/external/laximo/${urlType}/details`,
  LAXIMO_CAR_INFO_SHORT: (urlType: LaximoUrlType) =>
    `/catalog/external/laximo/${urlType}/car-info`,
  LAXIMO_CARS_BY_OEM: (urlType: LaximoUrlType) =>
    `/catalog/external/laximo/${urlType}/cars-by-oem`,
  LAXIMO_UNIT_BY_OEM: (urlType: LaximoUrlType) =>
    `/catalog/external/laximo/${urlType}/unit-by-oem`,
  LAXIMO_CARS_BY_CHASSIS: (urlType: LaximoUrlType) =>
    `/catalog/external/laximo/${urlType}/cars-by-chassis`,
  LAXIMO_UNITS: (urlType: LaximoUrlType) =>
    `/catalog/external/laximo/${urlType}/car-info-units`,

  COPY_EXTERNAL_PRODUCT: '/catalog/external/copy-product',
  ADD_ACAT_PRODUCT_TO_CART: '/catalog/external/cart-product',
  ADD_ACAT_PRODUCT_TO_FAVORITES: '/catalog/external/favorite-product',

  // Product offers
  PRODUCT_OFFER_LIST: '/catalog/product-offers',
  PRODUCT_OFFER: (id: string) => `/catalog/product-offers/${id}`,
  PRODUCT_OFFER_ACCEPT: (id: string) => `/catalog/product-offers/${id}/accept`,
  PRODUCT_OFFER_REJECT: (id: string) => `/catalog/product-offers/${id}/reject`,

  PRODUCT_CATEGORY_TYPE: '/product/category-type',
  PRODUCT_CATEGORY_TYPE_LIST: '/product/category-type/list',
  PRODUCT_FAVORITE_CATEGORY_LIST: '/product/category/favorites/list',
  PRODUCT_CATEGORY: '/product/category',
  PRODUCT_CATEGORY_LIST: '/product/category/list',
  PRODUCT_CATEGORY_RELATION: '/product/category/relation',
  PRODUCT_CATEGORY_FAVORITE: '/product/category/favorites',
  PRODUCT_ANALOG_LIST: '/product/analog',
  PRODUCT_APPLICABILLITIES_LIST: '/product/applicability',
  // Orders
  ORDER_REQUEST: '/order/request',
  OFFERS: '/order/request/offers',
  OFFERS_STATE: '/order/request/offers/state',
  OFFERS_RELEVANCE: '/order/request/offers/relevance',
  ORDER_REQUEST_AS_SELLER: '/order/request/as-seller',
  ORDER_REQUEST_LIST: '/order/request/list',
  ORDER_REQUEST_LIST_DOC_EXCEL: '/order/request-list-doc-excel',
  ORDER_LIST_DOC_EXCEL: '/order/order-list-doc-excel',
  REFUND_EXCHANGE_LIST_DOC_EXCEL: '/order/refund-exchange-list-doc-excel',
  ORDER_REQUEST_DOC: (orderRequestId: string) =>
    `/order/order-request-doc/${orderRequestId}`,
  ORDER_REQUEST_OFFERS_DOC: (orderRequestId: string) =>
    `/order/order-request-doc/${orderRequestId}/offers`,
  ORDER_DOC: (orderId: string) => `/order/order-doc/${orderId}`,
  DOC_EXCEL: '/order/doc-excel',
  ORDER_HISTORY_LIST: '/order/history',
  APPROVE_ORDER_REQUEST: '/order/request/approve',
  PAY_ORDER_REQUEST: '/order/request/payment',
  ACCEPT_ORDER_REQUEST_PAYMENT_POSTPONE:
    '/order/request/accept-payment-postpone',
  MARK_ORDER_REQUEST_PARTIAL_PAYMENT: '/order/request/partial-payment',
  PAY_ORDER_REQUEST_OFFERS: '/order/request/offers-payment',
  REQUEST_PAYMENT_REFUND: '/order/request/payment-refund-request',
  PAY_PAYMENT_REFUND_REQUEST: '/order/request/pay-refund-request',
  CANCEL_ORDER_REQUEST_PAYMENT: '/order/request/cancel-payment',
  PARTLY_PAID_ORDER: '/order/request/partly-paid',
  SELECTED_LIST: '/order/request/selected-list',
  ORDER: '/order',
  ORDER_IRREGULAR: `/order/irregular`,
  ORDER_LIST: '/order/list',
  ORDER_FILE: '/order/file',
  ORDER_OFFER: '/order/offer',
  ORDER_OFFER_LIST: '/order/offer/list',
  ORDER_OFFER_FILE: '/order/offer/file',
  ORDER_ACCEPT_OFFERS: '/order/offer/accept',
  ORDER_TRACKING: '/product/order/tracking',
  ORDER_STATUS: '/order/status',
  ORDER_VIEW: '/order/view',
  ORDER_PRODUCT: '/order/product',
  ORDER_NOTIFICATIONS_VIEW: '/order/notification/list/view',
  ORDER_REWARD: '/order/reward',
  ORDER_REWARD_LIST: '/order/reward/list',
  ORDER_REWARD_LIST_MONTH: '/order/reward/list/month',
  ORDER_WITH_REFUND_EXCHANGE_LIST: '/order/refund-exchange/list',
  ORDER_WITH_REFUND_EXCHANGE_ALL: '/order/refund-exchange/all',
  REQUEST_TO_OFFER_UPDATE: '/order/requestToUpdate',
  REFUND_EXCHANGE: '/order/refund-exchange',
  ATTACHMENT_UPLOAD: '/order/attachments',
  ACCEPTANCE_ACT: '/order/acceptance-act',
  APPLICATION_TO_CHANGE_SHIPPING_CONDITION: '/order/change-shipping-condition',
  APPROVED_TO_CHANGE_SHIPPING_CONDITION: '/order/approved-shipping-condition',
  GET_REASON_REJECT_SHIPPING_CONDITION: '/order/reason-to-reject-condition',
  // Users
  USER: '/user',
  USER_INFO: '/user/info',
  USER_LIST: '/user/list',
  SELLER_LIST_FOR_ORDER: '/user/sellers-for-order',
  PUNISH_USER: '/user/punish',
  COMPLAIN_USER: '/user/complaint',
  ALL_COMPLAINTS: '/user/complaint/all',
  COMPLAINT_LIST: '/user/complaint/list',
  USER_SELLER_REGISTER_APPLICATION: '/user/seller-register-application',
  USER_SELLER_REGISTER_APPLICATION_LIST:
    '/user/seller-register-application/list',
  AUTH_USER_PROFILE: '/user/profile',
  PROFILE_CUSTOMER_CONTRACTS: '/user/profile/customer-contracts',
  PROFILE_CUSTOMER_CONTRACT: (id: string) =>
    `/user/profile/customer-contracts/${id}`,
  PROFILE_CANCEL_DELETION: '/user/profile/cancel-deletion',
  AUTH_USER_CATEGORIES: `/user/profile/product-category/list`,
  TOGGLE_EMAIL_NOTIFICATION: '/user/profile/trigger-notification',
  UPDATE_EMAIL_NOTIFICATION: '/user/profile/email-notification',
  AUTH_USER_CATEGORIES_N: `/user/profile/categories-n`,
  SPECIAL_CLIENT_LIST: '/user/special-clients',
  POST_CUSTOMER_CONTRACT: '/user/special-clients',
  UPDATE_DELETE_CUSTOMER_CONTRACT: (id: string) =>
    `/user/special-clients/customer-contracts/${id}`,
  USER_JURISTIC_SUBJECT: `/user/juristic-subject`,
  USER_JURISTIC_SUBJECT_SPECIAL_STATUS: `/user/juristic-subject/special-status`,
  USER_JURISTIC_SUBJECT_POSTPONED_PAYMENT_ALLOWED: `/user/juristic-subject/postponed-payment-allowed`,
  USER_JURISTIC_SUBJECT_LIST: `/user/juristic-subject/list`,
  USER_JURISTIC_SUBJECT_BY_INN: '/user/juristic-subject/by-inn',
  USER_REVIEW: '/user/review',
  USER_NOTIFICATION_LIST: '/user/notification/list',
  USER_CUSTOMER: '/user/customer',
  USER_SELLER: '/user/seller',
  HANDLE_SELLER_REGISTER: '/user/seller-register',
  USER_WORKER: '/user/worker',
  SEND_EMAIL: '/user/send-email',
  CHANGE_USERNAME: '/user/profile/username',
  CHANGE_PHONE: '/user/profile/phone',
  TOGGLE_PHONE_VISIBLE: '/user/profile/phone-visible',
  UPDATE_DEFAULT_ADDRESSES: '/user/profile/default-addresses',
  VERIFY_EMAIL_CODE: '/user/email-verification',
  ALL_TRANSPORT_COMPANY_LIST: '/shipping/transport-company/all',
  SELLERS_TRANSPORT_COMPANY_LIST: '/user/transport-company/list',
  SELLERS_TRANSPORT_COMPANIES: '/user/transport-company',
  SELLER_OFFER_TRANSPORT: '/shipping/seller-company/list',
  DELETE_PERSONAL_TRANSPORT_COMPANY: '/shipping/seller-company/drop',
  SELLER_UPDATE_APPLICATION: (userId: string) =>
    `/user/seller-update-application/${userId}`,
  CONFIRM_SELLER_UPDATE_APPLICATION: (userId: string) =>
    `/user/seller-update-application/${userId}/confirm`,
  REJECT_SELLER_UPDATE_APPLICATION: (userId: string) =>
    `/user/seller-update-application/${userId}/reject`,
  SELLER_PRODUCT_CATEGORIES: '/user/seller-product-categories',
  SELLER_OFFER_DOC: '/user/seller-offer-doc',
  // Chat
  CHAT: '/chat',
  CHAT_LIST: '/chat/list',
  CHAT_MESSAGE: '/chat/message',
  CHAT_UNREAD: '/chat/unread',
  CHAT_UNREAD_SUPPORT: '/chat/unread/support',
  SUPPORT_CHAT_LIST: '/chat/list/support',
  SUPPORT_CHAT_MESSAGE: '/chat/support-message',
  CHAT_ACTIVE_APPEALS_COUNT: '/chat/active-appeals-count',
  // Notifications
  NOTIFICATION: '/notification',
  NOTIFICATION_LIST: '/notification/list',
  NOTIFICATION_UNREAD: '/notification/unread',
  READ_ALL_NOTIFICATIONS: '/notification/read-all',
  // Organizations
  ORGANIZATION: '/organization',
  ORGANIZATION_LIST: '/organization/list',
  ORGANIZATION_BY_INN: '/organization/by-inn',
  CONFIRM_ORGANIZATION: '/organization/confirm',
  REJECT_ORGANIZATION: '/organization/reject',
  SELLER_ORGANIZATIONS_BRANCHES: '/organization/seller-organizations-branches',
  ORGANIZATION_SELLER: '/organization/seller',
  ORGANIZATION_APPLICATION: '/organization/application',
  ORGANIZATION_SELLER_APPLICATION: '/organization/seller/application',
  CONFIRM_ORGANIZATION_SELLER: '/organization/seller/confirm',
  REJECT_ORGANIZATION_SELLER: '/organization/seller/reject',
  BAN_ORGANIZATION: '/organization/ban',
  SELLERS_ORGANIZATIONS: '/organization/get-seller-organizations',
  ORGANIZATION_SELLER_DETACH: '/organization/seller/detach',
  ORGANIZATION_UPDATE_APPLICATION:
    '/organization/organization-update-application',
  CONFIRM_ORGANIZATION_UPDATE_APPLICATION: (applicationId: string) =>
    `/organization/organization-update-application/${applicationId}/confirm`,
  REJECT_ORGANIZATION_UPDATE_APPLICATION: (applicationId: string) =>
    `/organization/organization-update-application/${applicationId}/reject`,
  // Other
  FILE_UNKNOWN: '/file/unknown',
  FILE_LIST: '/file/list',
  LANGUAGE: '/language',
  LANGUAGE_LIST: '/language/list',
  ADDRESS_SUGGESTIONS: '/address/suggestions',
  REGIONS: '/regions',
  REGION_CHILD: parentguid => `/regions/${parentguid}`,
  SELECTED_REGIONS: '/regions/selected/list',
  // Shipping
  TRANSPORT_COMPANY: '/shipping/transport-company',
  TRANSPORT_COMPANY_LIST: '/shipping/transport-company/list',
  CALCULATE_PRICES: '/shipping/prices',
  DOCUMENTS: '/documents',
};

export const EXTERNAL_PATHS = {
  YANDEX_MAPS_API: (lang: string) => {
    const apiKey = !!YANDEX_MAPS_API_KEYS
      ? YANDEX_MAPS_API_KEYS.getRandomItem()
      : YANDEX_MAPS_API_KEY;
    return `https://api-maps.yandex.ru/2.1/?apikey=${apiKey}&lang=${lang}`;
  },
};
