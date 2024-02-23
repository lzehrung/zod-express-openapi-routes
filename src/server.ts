import express, { Request, Response, NextFunction } from 'express';
import { configureOpenApi } from './zod-openapi-express-routes/configure';
import { productController } from './products/products.controller';

const expressApp = express()
  .use(express.json({ limit: '1mb' }))
  .use(express.urlencoded({ extended: false, limit: '1mb' }));

const server = configureOpenApi({
  app: expressApp,
  controllers: [productController],
  docsRoute: '/api/reference',
  swaggerRoute: '/api/swagger.json',
  schema: {
    info: {
      title: 'ACME Products API Reference',
      version: '0.1.3-dev',
    },
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'session.id',
        },
      },
    },
  },
})
  .use((req, res) => res.redirect('/api/reference'))
  .use((err: unknown, req: Request, res: Response, next: NextFunction) => {
    res.status(500).json({ message: 'Internal server error', error: err });
  });

export default server;
