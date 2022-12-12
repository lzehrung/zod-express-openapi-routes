import { z } from "zod";
import {
  extendZodWithOpenApi,
  OpenAPIRegistry,
} from "@asteasolutions/zod-to-openapi";
extendZodWithOpenApi(z);
import express, { Router } from "express";
import { productSchema, routeParams } from "./product-api-schema";
import { ProductController } from "./product-controller";
import { Product } from "./db-models";
import { ApiRouteParams, registerRoute } from "./open-api-helper";

const getProductRoute: ApiRouteParams<typeof routeParams, Product> = {
  path: "/products/{id}",
  method: "get",
  description: "Get a single product",
  request: {
    params: routeParams,
  },
  handler: ProductController.getProduct,
  responses: {
    200: {
      description: "Get a single product",
      content: {
        "application/json": {
          schema: productSchema,
        },
      },
    },
  },
};

export function registerProductRoutes(
  registry: OpenAPIRegistry,
  router: Router
) {
  registerRoute(getProductRoute, registry, router);
}
