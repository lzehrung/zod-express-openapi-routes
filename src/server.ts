import express from 'express';
import { configureOpenApi } from './zod-to-openapi';
import { productController } from './products/products-routes';
// import { zodiosApiApp } from './zodios-helpers';
// import productsController from './products/products-controller';


// const app = zodiosApiApp(
//   {
//     title: "ACME Products API",
//     version: "1.0.0",
//     docsPath: `/api/reference`,
//     swaggerPath: `/api/swagger.json`,
//   },
//   [productsController]
// );
//
// app.use("*", (req, res) => {
//   res.redirect("/api/reference");
// });

const app = configureOpenApi({
    app: express(),
    routers: [productController],
    docInfo: {
        title: 'ACME Products API',
        version: '1.0.0',
        docsTitle: 'ACME Products API',
        path: '/api/reference',
        swaggerPath: '/api/swagger.json',
    },
});

export default app;
