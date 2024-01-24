import Document, { Html, Head, Main, NextScript } from 'next/document';

export default class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          <link rel="icon" href="/favicon.ico" />
          <meta
            name="description"
            content="Inf.market - Купить запчасти просто и быстро"
          />
          <meta
            name="keywords"
            content="инф маркет, инфмаркет, инф.маркет, инф, infmarket, inf"
          />
          <meta name="yandex-verification" content="fd622cb085906ff9" />
          <meta
            name="google-site-verification"
            content="avXWBr6WK-j1kFiTbca7X0Mikg-PD7NMq2cUozzz5o0"
          />
          <meta name="robots" content="follow" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
