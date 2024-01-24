export interface IMetrics {
  customerOrganizations: IDate;
  customers: IDate;
  orders: IDate;
  ordersIndividuals: IDate;
  rejectedOrdersPercent: IDate;
  rejectedRequestsPercent: IDate;
  requests: IDate;
  requestsIndividuals: IDate;
  sellers: IDate;
  suppliers: IDate;
}
interface IDate {
  total: number;
  week: number;
}

export interface ITopCustomer {
  name: string;
  ordersNumber: number;
  requestsNumber: number;
  totalOrdersSum: number;
  weeks: IWeeks[];
}
export interface IWeeks {
  weekEnd: string;
  weekStart: string;
  totalOrdersSum: number;
  ordersNumber: number;
  requestsNumber: number;
}
