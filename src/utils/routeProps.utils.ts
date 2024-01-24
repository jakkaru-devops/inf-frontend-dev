import { GetServerSidePropsContext } from 'next';
import Cookies from 'cookies';
import { IAppStore, wrapper } from 'store';
import { IUserRoleLabelsDefault } from 'sections/Users/interfaces';
import { IAuthState } from 'store/reducers/auth.reducer';

type ICtx = GetServerSidePropsContext & {
  store: IAppStore;
};

type ServerSideProps = {
  authIsRequired: 1 | 0 | -1;
  requiredUserRole?: IUserRoleLabelsDefault | IUserRoleLabelsDefault[];
  callback?: (params: { ctx: any; cookies: Cookies; auth: IAuthState }) => any;
};

export const getCustomServerSideProps = ({
  authIsRequired,
  callback,
}: ServerSideProps) => {
  return wrapper.getServerSideProps(store => async (context: ICtx) => {
    const ctx = context;
    let props: any = {};
    const cookies = new Cookies(ctx.req, ctx.res);

    if (callback) {
      const cbResult = await callback({
        ctx,
        cookies,
        auth: ctx.store.getState().auth,
      });
      return {
        props: {
          ...props,
          ...cbResult.props,
        },
      };
    } else {
      return {
        props,
      };
    }
  });
};
