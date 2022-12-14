import { z } from "zod";
import { product, productList } from "./api-schemas";
import { apiBuilder, errorResponse, notFoundResponse } from "../zodios-helpers";

export const singleProductRoute = "/api/products/:productId";
export const allProductsRoute = "/api/products";

export const productsApi = apiBuilder({
  method: "get",
  path: singleProductRoute, // path params are auto-detected and types are generated on the request object
  description: "Get a Product",
  response: product,
  parameters: [
    {
      type: "Path",
      name: "productId",
      schema: z.number(),
    },
  ],
  errors: [errorResponse, notFoundResponse],
})
  .addEndpoint({
    method: "post",
    path: allProductsRoute,
    description: "Create product",
    response: product,
    status: 201,
    parameters: [
      {
        name: "New Product",
        type: "Body",
        schema: product,
      },
    ],
    errors: [errorResponse],
  })
  .addEndpoint({
    method: "get",
    path: allProductsRoute,
    description: "Get Products",
    response: productList,
    parameters: [
      {
        type: "Query",
        name: "name",
        schema: z.string().optional(),
      },
      {
        type: "Query",
        name: "categories",
        schema: z.array(z.string()).optional(),
      },
    ],
    errors: [errorResponse, notFoundResponse],
  })
  .addEndpoint({
    method: "patch",
    path: singleProductRoute,
    description: "Update Product",
    status: 204,
    response: z.object({}),
    parameters: [
      {
        type: "Path",
        name: "productId",
        schema: z.number(),
      },
      {
        type: "Body",
        name: "product",
        schema: product.partial(),
      },
    ],
    errors: [errorResponse, notFoundResponse],
  })
  .addEndpoint({
    method: "delete",
    path: singleProductRoute,
    description: "Delete Product",
    status: 204,
    response: z.object({}),
    parameters: [
      {
        type: "Path",
        name: "productId",
        schema: z.number(),
      },
    ],
    errors: [errorResponse, notFoundResponse],
  })
  .build();
