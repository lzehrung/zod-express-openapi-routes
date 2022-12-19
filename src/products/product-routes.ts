import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { Request, Response, Router } from "express";
import {
  productsSchema,
  productSchema,
  getProductParams,
  getProductsParams,
} from "./api-schema";
import { ProductController } from "./product-controller";
import { Product } from "../db/models";
import {
  ApiRouteBody,
  ApiRouteParams,
  ApiRouteQuery,
  jsonContent,
  registerRoute,
} from "../open-api-helpers";

// these route definitions are used to:
// - configure express routes
// - generate OpenAPI docs
// - validate the request handler parameter and return types according to zod schema anchored to db model

// const getProductsRoute: ApiRoute<never, never, typeof getProductsParams, Product[]> = {
const getProductsRoute: ApiRouteQuery<typeof getProductsParams, Product[]> = {
  path: "/products",
  method: "get",
  description: "Get all products",
  handler: ProductController.getProducts,
  tags: ["products"],
  middleware: [
    (req: Request, res: Response, next) => {
      console.log("example middleware", req.path);
      next();
    },
  ],
  request: {
    query: getProductsParams,
  },
  responses: {
    200: {
      description: "Product List",
      content: jsonContent(productsSchema),
    },
  },
};

const getProductRoute: ApiRouteParams<typeof getProductParams, Product> = {
  path: "/products/{id}",
  method: "get",
  description: "Get a single product",
  request: {
    params: getProductParams,
  },
  handler: ProductController.getProduct,
  tags: ["products"],
  responses: {
    200: {
      description: "Product",
      content: jsonContent(productSchema),
    },
    404: {
      description: "Product Not Found",
    },
  },
};

const createProductsRoute: ApiRouteBody<typeof productSchema, void> = {
  path: "/products",
  method: "post",
  description: "Create product",
  handler: ProductController.createProduct,
  tags: ["products"],
  middleware: [
    (req: Request, res: Response, next) => {
      console.log("create product:", JSON.stringify(req.body, null, 2));
      next();
    },
  ],
  request: {
    body: {
      content: jsonContent(productSchema),
      required: true,
    },
  },
  responses: {
    204: {
      description: "Created",
    },
    500: {
      description: "Server Error",
    },
  },
};

export function registerProductRoutes(
  registry: OpenAPIRegistry,
  router: Router
) {
  registerRoute(getProductsRoute, registry, router);
  registerRoute(getProductRoute, registry, router);
  registerRoute(createProductsRoute, registry, router);
}
