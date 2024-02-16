import express from 'express';
import { configureOpenApi } from './zod-openapi-express-routes/zod-to-openapi';
import { productController } from './products/products.controller';

const expressApp = express()
  .use(express.json({ limit: '1mb' }))
  .use(express.urlencoded({ extended: false, limit: '1mb' }));

const server = configureOpenApi({
  app: expressApp,
  controllers: [productController],
  docInfo: {
    title: 'ACME Products API',
    version: '0.1.3-dev',
    docsTitle: 'ACME Products API',
    path: '/api/reference',
    swaggerPath: '/api/swagger.json',
  },
});

export default server;
