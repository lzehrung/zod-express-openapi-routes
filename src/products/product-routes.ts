import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { Request, Response, Router } from "express";
import {
  productList,
  product,
  idParam,
  getListParam,
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
export const getProductsRoute: ApiRouteQuery<typeof getListParam, Product[]> = {
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
    query: getListParam,
  },
  responses: {
    200: {
      description: "Product List",
      content: jsonContent(productList),
    },
  },
};

export const getProductRoute: ApiRouteParams<typeof idParam, Product> = {
  path: "/products/{id}",
  method: "get",
  description: "Get a single product",
  request: {
    params: idParam,
  },
  handler: ProductController.getProduct,
  tags: ["products"],
  responses: {
    200: {
      description: "Product",
      content: jsonContent(product),
    },
    404: {
      description: "Product Not Found",
    },
  },
};

export const patchProductRoute: ApiRouteParams<typeof idParam, Product> = {
  path: "/products/{id}",
  method: "patch",
  description: "Update a single product",
  request: {
    params: idParam,
  },
  handler: ProductController.getProduct,
  tags: ["products"],
  responses: {
    204: {
      description: "Updated"
    },
    404: {
      description: "Product Not Found",
    },
  },
};

export const deleteProductRoute: ApiRouteParams<typeof idParam, Product> = {
  path: "/products/{id}",
  method: "delete",
  description: "Delete a single product",
  request: {
    params: idParam,
  },
  handler: ProductController.getProduct,
  tags: ["products"],
  responses: {
    200: {
      description: "Deleted"
    },
    404: {
      description: "Product Not Found",
    },
  },
};

export const createProductsRoute: ApiRouteBody<typeof product, void> = {
  path: "/products",
  method: "post",
  description: "Create product",
  handler: ProductController.createProduct,
  tags: ["products"],
  middleware: [
    (req: Request, res: Response, next) => {
      console.log("create product middleware:", JSON.stringify(req.body, null, 2));
      next();
    },
  ],
  request: {
    body: {
      content: jsonContent(product),
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
  registerRoute(patchProductRoute, registry, router);
  registerRoute(deleteProductRoute, registry, router);
  registerRoute(getProductRoute, registry, router);
  registerRoute(createProductsRoute, registry, router);
}
