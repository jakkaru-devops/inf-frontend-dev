import { IEntityId } from 'interfaces/common.interfaces';

const PREFIX = '/v2';

export const API_ENDPOINTS_V2 = {
  sellers: {
    getList: PREFIX + '/users/sellers',
    getOne: (id: IEntityId) => PREFIX + `/users/sellers/${id}`,
    productCategories: (id: IEntityId) =>
      PREFIX + `/users/sellers/${id}/product-categories`,
  },
  profile: {
    updateAvatar: PREFIX + `/profile/avatar`,
    suggestSeller: PREFIX + '/profile/seller/suggest',
    sellerProductCategories: PREFIX + '/profile/seller-product-categories',
    personalArea: PREFIX + '/profile/personal-area',
  },
  productCategories: {
    autoTypes: PREFIX + '/catalog/auto-types',
    autoBrands: PREFIX + '/catalog/auto-brands',
    createAutoBrand: PREFIX + '/catalog/auto-brands',
    autoBrand: (id: IEntityId) => `/catalog/auto-brands/${id}`,
    autoModels: PREFIX + '/catalog/auto-models',
    createAutoModel: PREFIX + '/catalog/auto-models',
    autoModel: (id: IEntityId) => `/catalog/auto-models/${id}`,
    groups: PREFIX + '/catalog/groups',
    createGroup: PREFIX + '/catalog/groups',
    group: (id: IEntityId) => PREFIX + `/catalog/groups/${id}`,
  },
  products: {
    productPrices: (id: IEntityId) => PREFIX + `/catalog/products/${id}/prices`,
    suppliersByProduct: (id: IEntityId) =>
      PREFIX + `/catalog/suppliers-by-product/${id}`,
  },
  sale: {
    productList: PREFIX + '/catalog/sale-products',
    createProduct: PREFIX + '/catalog/sale-products',
    getProduct: (id: IEntityId) => PREFIX + `/catalog/sale-products/${id}`,
    updateProduct: (id: IEntityId) => PREFIX + `/catalog/sale-products/${id}`,
    deleteProduct: (id: IEntityId) => PREFIX + `/catalog/sale-products/${id}`,
  },
  orders: {
    getOffer: (orderId: IEntityId, offerId: IEntityId) =>
      PREFIX + `/orders/${orderId}/offers/${offerId}`,
    updateOfferReceivingDate: (orderId: IEntityId, offerId: IEntityId) =>
      PREFIX + `/orders/${orderId}/offers/${offerId}/receiving-date`,
    confirmOfferPayment: (orderId: IEntityId, offerId: IEntityId) =>
      PREFIX + `/orders/${orderId}/offers/${offerId}/confirm-payment`,
    cancelOrderPayment: (orderId: IEntityId) =>
      PREFIX + `/orders/${orderId}/cancel-payment`,
    cancelOfferPayment: (orderId: IEntityId, offerId: IEntityId) =>
      PREFIX + `/orders/${orderId}/offers/${offerId}/cancel-payment`,
    acceptanceActDocument: (orderId: IEntityId, offerId: IEntityId) =>
      PREFIX + `/orders/${orderId}/offers/${offerId}/acceptance-act-document`,

    offersAnalyticsDocument: (orderId: IEntityId) =>
      PREFIX + `/orders/${orderId}/offers/analytics-document`,
    createPricedOrder: PREFIX + '/orders/priced',
    deletionStatus: (orderId: IEntityId) =>
      PREFIX + `/orders/${orderId}/deletion-status`,
    approveOfferPostponedPayment: (orderId: IEntityId, offerId: IEntityId) =>
      PREFIX + `/orders/${orderId}/offers/${offerId}/approve-postponed-payment`,
  },
  cart: {
    createCartProduct: PREFIX + '/cart/products',
    updateCartProduct: (productId: IEntityId) =>
      PREFIX + `/cart/products/${productId}`,
    deleteCartProduct: (productId: IEntityId) =>
      PREFIX + `/cart/products/${productId}`,
    productsBySellers: PREFIX + '/cart/products-by-sellers',
    payCartProductsByCard: PREFIX + '/cart/pay-card',
    payCartProductsByInvoice: PREFIX + '/cart/pay-invoice',
    updateCartOffer: (warehouseId: IEntityId) =>
      PREFIX + `/cart/offers/${warehouseId}`,
  },
  favoriteProducts: {
    getList: PREFIX + '/profile/favorite-products',
    create: PREFIX + '/profile/favorite-products',
    delete: (productId: IEntityId) =>
      PREFIX + `/profile/favorite-products/${productId}`,
  },
  statistics: {
    metrics: PREFIX + '/statistics/metrics',
    topCustomer: PREFIX + '/statistics/top-customers',
  },
  postponedPayments: {
    getList: PREFIX + '/orders/postponed-payments',
    create: PREFIX + '/orders/postponed-payments',
    update: (id: IEntityId) => PREFIX + `/orders/postponed-payments/${id}`,
    updateDaysRequested: (id: IEntityId) =>
      PREFIX + `/orders/postponed-payments/${id}/days-requested`,
  },
};
