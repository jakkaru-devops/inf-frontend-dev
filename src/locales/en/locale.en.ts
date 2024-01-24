import { LOCALE_MAIN } from 'locales';

export const LOCALE_EN: typeof LOCALE_MAIN = {
  common: {
    back: 'Back',
    personalArea: 'Personal area',
    bookmarks: 'Bookmarks',
    offers: 'Offers',
    offer: 'Offer',
    accountSettings: 'Main data',
    rewardCalculator: 'Reward calculator',
    categoriesSelecting: 'Select categories',
    rating: 'Rating',
    delete: 'Delete',
    uploadFile: 'Upload file',
    uploadImage: 'Upload image',
    image: 'Image',
    close: 'Close',
    send: 'Send',
    phone: 'Phone',
    email: 'E-mail',
    password: 'Password',
    contacts: 'Contacts',
    information: 'Information',
    saveChanges: 'Save changes',
    сhange: 'Сhange',
    connect: 'Connect',
    discount: 'Discount',
    kg: 'kg',
    mm: 'mm',
    startEditing: 'Edit',
    confirmDeletion: 'Confirm deletion',
    cancel: 'Cancel',
    save: 'Save',
    saleAmount: 'Sale amount',
    discountPercent: 'Discount %',
    reward: 'Reward',
    rewards: 'Rewards',
    metrics: 'Metrics',
    topCustomers: 'Top customers',
    cart: 'Cart',
    amountShort: 'Amount',
    photoNotUploaded: 'Photo not uploaded',
    notSet: 'Not set',
    status: 'Status',
    accept: 'Accept',
    reject: 'Reject',
    verified: 'Verified',
    search: 'Search',
    view: 'view',
    sort: 'Sort',
    show: 'Show',
    byDate: 'By date',
    byName: 'By name',
    byPrice: 'By price',
    iAmLookingFor: "I'm looking for",
    sum: 'Sum',
    sale: 'Sale',
    purchase: 'Purchase',
    days: 'Дни',
    type: 'Type',
    all: 'All',
    standard: 'Standard',
    photo: 'Photo',
    description: 'Description',
    shipmentPoint: 'Shipment point',
    yes: 'Yes',
    no: 'No',
    language: 'Language',
    name: 'Name',
    noFavorites: 'You have not added products to favorites yet',
    enterNumber: 'Enter the track number',
    productAddCatalog: 'Product Added to Catalog',
    buyers: 'Buyers',
    buyersNotRegistered: 'Buyers are not yet registered',
    register: 'Register',
    favorites: 'Favorites',
    connectMail: 'Connect mail',
    absent: 'Missing',
    awaitingConfirmation: 'Awaiting confirmation',
    personalData: 'Personal data',
    lastname: 'Surname',
    patronymic: 'Patronymic',
    reset: 'Reset the choice',
    create: 'Create',
    operators: 'Operators',
    managers: 'Managers',
    moderators: 'Moderators',
    blocked: 'Blocked',
    notification: 'Notification',
    confirm: 'Confirm',
    productSale: 'Sale',
    request: 'Request',
    postponedPayments: 'Postponed payments',
  },
  navigation: {
    'registerseller/organization': 'Registration',
    'personal-area': 'Personal area',
    requests: 'Requests',
    orders: 'Orders',
    'orders-history': 'Order history',
    catalog: 'Spare parts',
    'catalog-external': 'Search by catalogs',
    cart: 'Cart',
    request: 'Request',
    register: 'Sign Up',
    login: 'Sign In',
    favorites: 'Favorites',
    'user-settings': 'User data',
    refunds: 'Refund/exchange',
    neworder: 'Request by photo/description',
    offers: 'Offers',
    employees: 'Employees',
    'add-employee': 'Add employee',
    customers: 'Customers',
    sellers: 'Sellers',
    'order-repeat': 'Repeat request',
    organizations: 'Organizations',
    complaints: 'Complaints',
    'product-offers': 'Digitization',
    'product-offers/add': 'Add product',
    'product-offersadd': 'Add product',
    'catalogproduct/add': 'Add product',
    'product-categories': 'Product categories',
    rewards: 'Rewards',
    metrics: 'Metrics',
    ban: 'Account blocked',
    'account-review': 'Account review',
    'register/seller/complete': 'Sign Up',
    'registerseller/complete': 'Sign Up',
    'register/seller/organization': 'Sign Up',
    'sale-products': 'Sale',
    'sale-productsadd': 'Add',
    'postponed-payments': 'Postponed payments',
  },
  address: {
    address: 'Address',
    addressNotSpecified: 'Address not specified',
    addressNotFound: 'Address not found',
    specifyAddress: 'Specify address',
    country: 'Country',
    region: 'region',
    district: 'district',
    city: 'city',
    street: 'street',
    building: 'building',
    apartment: 'apartment',
    house: 'House',
    mailingAddress: 'Mailing address',
  },
  orders: {
    myOrdersList: 'My orders',
    ordersList: 'Orders',
    ordersHistoryList: 'Order history',
    offerList: 'Offers',
    searchByPhoto: 'Search by photo',
    searchByDescription: 'Search by description',
    requestByPhoto: 'Request by photo',
    requestByDescription: 'Request by description',
    orderCreated: 'Order created',
    sendRequest: 'Send request',
    requestSent: 'Request sent',
    deliveryAddress: 'Delivery address',
    orderDeliveryAddress: "Order's delivery address",
    request: 'Order',
    order: 'Order',
    productPhoto: "Product's photo",
    productDesc: "Product's description",
    selectedProduct: 'Selected product',
    noSelectedProduct: 'You did not select a product',
    noSelectedFilter: 'No filter selected',
    noSelectedFilterProduct: 'No product selected',
    productName: 'Name',
    productArticle: 'Article',
    orderAmount: 'Order quantity',
    buyAmount: 'Buy quantity',
    sellerAmount: "Seller's quantity",
    productUnitPrice: 'Unit price',
    sum: 'Sum',
    deliveryTerm: 'Delivery term',
    quantityInStock: 'Quantity in stock',
    selection: 'Selection',
    sellerCity: "Seller's city",
    contactWithSeller: 'Contact with seller',
    chatWithSeller: 'Chat with seller',
    total: 'Total',
    productDeletedFromOrder: 'Product delete from the order',
    requestDate: "Request's date",
    seeOffers: 'See offers',
    sureYouWantToDeleteOrder: 'Are you sure you want to delete order',
    deleteOrder: 'Delete order',
    find: 'Find',
    countRequests: 'Requests',
    countPurchases: 'Purchases',
    status: {
      REQUESTED: 'Order requested',
      APPROVED: 'Payment pending',
      PAID: 'Order paid',
      PAYMENT_POSTPONED: 'Order is not paid',
      DECLINED: 'Order declined',
      COMPLETED: 'Order completed',
      OFFER_RECEIVED: 'Offer received',
      OFFER_UPDATED: 'Offer updated',
      ORDER_REQUEST: 'Request',
      ORDER_REQUEST_BY_PHOTO_OR_DESCRIPTION: 'Request by photo/description',
      OFFER_SENT: 'Offer sent',
      OFFER_EXPIRED: 'Offer expired',
      OFFER_UPDATE_REQUESTED: 'Offer update requested',
      SHIPPED: 'Order shipped',
      REWARD_PAID: 'Reward paid',
      REFUND_REQUEST: 'Awaiting response',
      REFUND: 'Refund',
      EXCHANGE: 'Exchange',
      REJECTED: 'Rejected',
    },
  },
  catalog: {
    catalog: 'Catalog',
    newProduct: 'New product',
    addProduct: 'Add new product',
    editProduct: 'Edit product',
    productCategories: 'Product categories',
    addCategory: 'Add category',
    noCategories: 'No categories yet',
    searchInCatalog: 'Search in catalog',
    typeProductName: 'Type product name',
    productName: 'Name',
    productArticle: 'Article',
    productDesc: 'Description',
    productWeight: 'Weight',
    productLength: 'Length',
    productWidth: 'Width',
    productHeight: 'Height',
    technicsType: 'Technics type',
    type: 'Type',
    brand: 'Brand',
    model: 'Model',
    category: 'Category',
    subcategory: 'Subcategory',
    addToCart: 'Add to cart',
    removeFromCart: 'Remove from cart',
    addToFavorites: 'Add to favorites',
    removeFromFavorites: 'Remove from favorites',
    addToOrder: 'Add to order',
    addToRequest: 'Add to request',
    removeFromOrder: 'Remove from order',
    noProductsInBookmarks: "You haven't added products to bookmarks yet",
    noProductsInCart: "You haven't added product to cart yet",
    noProductInCatalog: 'No match product in catalog',
    buyProductWithPaymentSystems:
      'You can buy this product using payment systems',
    readTheTermsOfRefund: 'Read the terms of refund',
    featuredProducts: 'Featured Products',
    layoutOptionTile: 'Tile',
    layoutOptionRow: 'List',
    productCategory: 'Product category',
    productQuantity: 'Product quantity',
    add: 'Add',
    name: 'Name',
    label: 'Label',
    spareParts: 'Auto spare parts',
    categorySelection: 'Category selection',
    productListOrderOptions: {
      price: 'By price',
      date: 'By date',
      name: 'By name',
    },
  },
  juristicSubjects: {
    passport: 'Passport',
    passportSeries: 'Series',
    passportNumber: 'Number',
    passportSeriesAndNumber: 'Series and number',
    passportGiver: 'Giver',
    passportGettingDate: 'Getting date',
    passportLocationUnitCode: 'Location unit code',
    registerAddress: 'Registration address',
    bankDetails: 'Bank details',
    bankName: 'Bank name',
    bankInn: 'Bank INN',
    BankKpp: 'Bank KPP',
    bankBik: 'Bank RCBIC',
    bankCorrAccount: 'Bank corr. acc',
    bankCheckingAccount: 'Bank checking acc',
    inn: 'INN',
    kpp: 'KPP',
    bik: 'RCBIC',
    corrAccount: 'Corr. acc',
    checkingAccount: 'Checking acc',
    juristicAddress: 'Juristic address',
    actualAddress: 'Actual address',
    name: 'Name',
    ogrnip: 'OGRNIP',
    ogrn: 'OGRN',
    yesNds: 'NDS',
    noNds: 'without NDS',
  },
  organizations: {
    organizationList: 'Organizations',
    discountPercentageRequired: 'Discount percentage required',
    addOrganization: 'Add organization',
    newOrganization: 'New organization',
    phoneOrganization: 'Phone number organization',
    organizationUpdated: 'Organization profile updated',
    workerList: 'Agents',
    workerDeleted: 'Agent deleted',
    findName: 'Find by name',
    amountSellers: 'Amount of sellers',
    amountBranchials: 'Amount of branchials',
    notFound: 'Organizations are not found',
    registrOrganization: 'Registration of the organization',
    sendTuRegisterRequest: 'Send a Request for registration again',
    dataCompanies: 'Data companies',
    isAlreadyRegistered: 'The organization is already registered',
    mainOffice: 'Main office',
    branches: 'Branches',
    appSellers: 'Applications of sellers',
    checkOrganization: 'Check organization',
    requiredFields: 'All fields are required!',
    lastRefusal: 'Last refusal',
    rejectionReason: 'Indicate the reason for the refusal',
    organization: 'Organization',
    confirmRefusal: 'Strengthening refusal',
    sendRegisterRequest: 'Send a registration request',
    alreadyRegistered: 'You have previously registered with this organization',
    sendRebid: 'Re-apply for registration',
    companyWorking: 'The company is working',
  },
  digitization: {
    digitization: 'Digitization',
    digitizeProduct: 'Digitize a product',
    digitize: 'Digitize',
    review: 'Review',
    accepted: 'Accepted',
    declined: 'Declined',
    productAlreadyDigitized: 'This product has already been digitized',
    sendToReconsideration: 'Send to reconsideration',
    productAddedToCatalog: 'Product added to catalog',
    productRejected: 'Product rejected',
  },
  user: {
    yourPhoneNumber: 'Your phone number',
    yourEmail: 'Your E-mail',
    register: 'Sign Up',
    login: 'Sign In',
    registerOrLogin: 'Sign Up/Sign In',
    logout: 'Log Out',
    name: 'Name',
    loginAdmin: 'Sign In Administrator',
    smsCode: 'SMS code',
    getCode: 'Get code',
    getCodeAgain: 'Get code again',
    confirmAccount: 'Confirm account',
    confirm: 'Confirm',
    customer: 'Customer',
    seller: 'Seller',
    operator: 'Operator',
    manager: 'Manager',
    moderator: 'Moderator',
    superadmin: 'Administrator',
    sellerStatus: "Seller's status",
    registerEntity: 'Register entity',
    registerIndividual: 'Register individual',
    accountIsBlocked: 'Account is blocked',
    individual: 'Individual',
    jurSubject: 'Entity',
    phoneIsHidden: 'Phone is hidden',
  },
  messenger: {
    title: 'Chat',
    noChats: 'No chats yet',
    noMessages: 'No messages yet',
    companionTyping: "Companion's typing",
    companionShort: 'Com-nion',
    messageText: 'Message text',
    errors: {
      messageListNotLoaded: 'Error. Messages are not loaded',
    },
  },
  complaint: {
    reasons: {
      spam: 'Spamming',
      behaviour: 'Offensive behaviour',
      fraud: 'Fraud',
      nonobservance: 'Non-compliance with the contract',
    },
  },
  attachment: {
    group: {
      attachment: 'Files',
      invoice: 'Invoice',
      waybill: 'Waybill',
      accountingDocument: 'Accounting document',
      acceptanceCertificate: 'Acceptance certificate',
      specification: 'Specification',
    },
  },
  refundExchange: {
    exchangeRefund: 'Exchange/refund',
    disputeResolutions: {
      REFUND: 'Refund',
      EXCHANGE: 'Exchange',
    },
    reasons: {
      poorQuality: 'Inadequate quality of goods',
      deliveryTimesViolated: 'Delivery times violated',
      inadequateSet: 'Not a complete set',
      notCorrespond: 'The product does not correspond to the declared',
      notFit: "Doesn't fit",
      orderingMistake: 'I made a mistake in ordering',
      other: 'Other',
    },
    statuses: {
      PENDING: 'pending',
      REFUND: 'refund',
      EXCHANGE: 'exchange',
      REJECTED: 'rejected',
      CLOSED: 'closed',
    },
    titles: {
      REFUND_PENDING: 'Refund. Pending',
      REFUND_AGREED: 'Refund agreed',
      REFUND_RESOLVED: 'Refund resolved',
      REFUND_CLOSED: 'Refund closed',
      REFUND_REJECTED: 'Refund rejected',

      EXCHANGE_PENDING: 'Exchange. Pending',
      EXCHANGE_AGREED: 'Exchange agreed',
      EXCHANGE_RESOLVED: 'Exchange resolved',
      EXCHANGE_CLOSED: 'Exchange closed',
      EXCHANGE_REJECTED: 'Exchange rejected',
    },
  },
  other: {
    noRating: 'No ratings yet',
    rewardFor: 'Reward for',
    documentCirculation: 'Document circulation',
    requestSent: 'Request sent',
    requestUpdated: 'Request updated',
    cartCleared: 'Cart cleared',
    customerRatedYou: 'A customer rated you',
    editing: 'Editing',
    finishEditing: 'Finish editing',
    backToCatalog: 'Back to catalog',
    selectDeliveryPoint: 'Select delivery point',
    rejectionReason: 'Rejection reason',
    magicReference: 'The magic link did not work ...',
    tryAgain: 'Try again',
    сheck: 'Check ...',
    fullName: 'Full name',
    fullNameIp: 'Full name IP',
    fullNameDir: 'Full name director',
    phone: 'Phone number',
    dateRegistration: 'Date of registration',
    blocked: 'Lock term',
    selectRegion: 'Select a region',
    editSubscription: 'Edit subscription',
    returns: 'Refund/Exchange',
    requests: 'Requests',
    сomplaints: 'Complaints',
    staff: 'Staff',
    companyDataComplete: "You need to fill in the company's data",
    addresFill: 'Not all addresses of phillials are correctly filled',
    backToOrganizations: 'Back to organizations',
    newAppl: 'New application to the organization',
    sendRegistrationRequest: 'Send a re-registration request',
    nameLegal: 'Name of a legal entity',
    sendFerifyCode: 'Your number sent SMS code',
    requestNewCode: 'The new code can be requested through',
    personalDataSeller: 'Personal data of the seller',
    personalDataCustomer: 'Personal data of the customer',
    selectCategory: 'Select a category',
    sellers: 'Sellers',
    withoutRating: 'Without rating',
    addEmployee: 'Add employee',
    mail: 'Email',
    searchFullName: 'Find by name',
    employeesNotFound: 'Employees are not found',
    yours: 'Your',
    pageBlocked: 'page is blocked',
    bySuperadmin: 'by the superadmin',
    siteManager: 'by the site manager',
    specifyShippingAddress: 'Specify the shipping address to send a request',
    findPictures: 'Search by image',
    orderRequestByPhotoOrDescription: 'Request by photo/description',
    personalDataProcessingPolicy: 'Personal Data Processing Policy',
    rulesForConcludingSupplyContract: 'Rules for Concluding Supply Contract',
    userAgreementCustomer: 'User Agreement for Customer',
    deliveryOffer: 'Infinitum delivery offer',
  },
  pages: {
    home: {
      title: 'Buy any auto parts<br>quickly and easily',
    },
    category: {
      title: 'Categories of goods',
    },
    neworder: {
      title: 'Request by photo',
    },
    catalogExternal: {
      title: 'Search by catalogs',
    },
    accountReview: {
      title: 'Account review',
      appRegistrationTrue: 'Your application is adopted',
      appRegistrationFalse: 'Your registration is rejected',
      dataCheckedAdmin: 'Data is checked by the administrator.',
      waitAlert: 'Please wait for alert.',
    },
    accountConfirmation: {
      title: 'Account confirmation',
      subtitle: 'Confirm your account!',
    },
    orderTracking: {
      title: 'Tracking orders by number',
    },
    error404: {
      title: 'Error 404',
      desc: 'Page not found',
    },
    error500: {
      title: 'Error 500',
      desc: 'Server error',
    },
  },
  plurals: {
    file: ['file', 'files'],
    month: ['month', 'months', 'months'],
    week: ['week', 'weeks', 'weeks'],
    day: ['day', 'days', 'days'],
    hour: ['hour', 'hours', 'hours'],
    minute: ['minute', 'minutes', 'minutes'],
    seller: ['seller', 'sellers', 'sellers'],
    region: ['region', 'regions', 'regions'],
    product: ['product', 'products', 'products'],
  },
  errors: {
    userRoleNotDefined: 'User role not defined',
  },
  validations: {
    oneImageMin: 'At least one image of the product required',
    oneRequestProductMin: 'At least 1 product should be in the request',
    required: 'Required',
    incorrectEmail: 'Incorrect E-mail address',
    phoneRequired: 'Phone number required',
    productCategoriesRequired: 'Product categories required',
    personalDataProcessingRequired:
      'Personal data processing agreement required',
    agencyContractRequired: 'Agency contract agreement required',
    requeredRole: 'Need to choose at least one role',
    employeePhoneAlreadyRegistered:
      'An employee with this phone number is already registered',
  },
  time: {
    months: [
      ['january', 'january'],
      ['february', 'february'],
      ['march', 'march'],
      ['april', 'april'],
      ['may', 'may'],
      ['june', 'june'],
      ['jule', 'jule'],
      ['august', 'august'],
      ['september', 'september'],
      ['october', 'october'],
      ['november', 'november'],
      ['december', 'december'],
    ],
  },
};
