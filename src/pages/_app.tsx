import 'styles/main.scss';
import 'prototype';
import { AppProps } from 'next/app';
import { Provider } from 'react-redux';
import AppContainer from 'components/containers/AppContainer';
import Head from 'next/head';
import { wrapper } from 'store';
import { NextComponentType } from 'next';
import { Fragment } from 'react';

const App: NextComponentType = ({ Component, ...rest }: AppProps) => {
  const {
    store,
    props: { pageProps },
  } = wrapper.useWrappedStore(rest);
  const Content = Component as any;

  return (
    <Fragment>
      <Head>
        <title>INF</title>
        <meta name="viewport" content="initial-scale=1, maximum-scale=1" />
      </Head>
      <Provider store={store}>
        <AppContainer>
          <Content {...pageProps} />
        </AppContainer>
      </Provider>
    </Fragment>
  );
};

export default App;
