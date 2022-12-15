import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { Request, Response, Router } from "express";
import { productsSchema, productSchema, getProductParams } from "./api-schema";
import { ProductController } from "./product-controller";
import { Product } from "../db/models";
import {
  ApiRouteBody,
  ApiRouteNoInput,
  ApiRouteParams,
  jsonContent,
  registerRoute,
} from "../open-api-helpers";

// these route definitions are used to:
// - configure express routes
// - generate OpenAPI docs
// - validate the request handler parameter and return types according to zod schema anchored to db model

const getProductsRoute: ApiRouteNoInput<Product[]> = {
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
  responses: {
    200: {
      description: "Product list",
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
      console.log("example middleware", req.path);
      next();
    },
  ],
  request: {
    body: {
      content: jsonContent(productSchema),
    },
  },
  responses: {
    204: {
      description: "Product created",
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
