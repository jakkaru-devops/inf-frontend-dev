// require('dotenv').config();
/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: false,
  sassOptions: {
    includePaths: ['./src'],
  },
  env: {
    API_SERVER_URL: process.env.API_SERVER_URL,
    YANDEX_MAPS_API_KEY: process.env.YANDEX_MAPS_API_KEY,
    PAYMENTS_ENABLED: process.env.PAYMENTS_ENABLED,
    GOOGLE_RECAPTCHA_SITE_KEY: process.env.GOOGLE_RECAPTCHA_SITE_KEY,
  },
};

module.exports = nextConfig;
