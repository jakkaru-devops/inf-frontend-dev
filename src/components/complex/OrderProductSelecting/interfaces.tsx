import { NextRouter } from 'next/router';

export interface IOrderProductSelectingRouter extends NextRouter {
  query: {
    orderRequestId?: string;
  };
}
