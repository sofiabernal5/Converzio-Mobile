import 'dotenv/config';

export default {
  expo: {
    name: 'Converzio',
    slug: 'converzio',
    scheme: "converzio",
    version: '1.0.0',
    extra: {
      HEYGEN_API_KEY: process.env.HEYGEN_API_KEY,
      HEYGEN_API_URL: process.env.HEYGEN_API_URL,
    },
  },
};
