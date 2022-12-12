// import { z } from "zod";
// import {
//   extendZodWithOpenApi,
//   OpenAPIGenerator,
//   OpenAPIRegistry,
// } from "@asteasolutions/zod-to-openapi";
// extendZodWithOpenApi(z);
//
// import express from "express";
// import { productSchema, routeParams } from "./product-api-schema";
// import { ProductController } from "./product-controller";
// import { Product } from "./db-models";
// import { ApiRouteParams, registerRoute } from "./open-api-helper";
//
// const productRoutes = express.Router();
//
// const routeConfig: ApiRouteParams<typeof routeParams, Product> = {
//   path: "/products/{id}",
//   method: "get",
//   description: "Get a single product",
//   request: {
//     params: routeParams,
//   },
//   handler: ProductController.getProduct,
//   responses: {
//     200: {
//       description: "Get a single product",
//       content: {
//         "application/json": {
//           schema: productSchema,
//         },
//       },
//     },
//   },
// };
//
// registerRoute(routeConfig, registry, productRoutes);
//
//
//
// export { productRoutes, docs };
