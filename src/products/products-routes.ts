import { z } from "zod";
import { apiBuilder } from "@zodios/core";
import { product, productList } from "./api-schemas";
import { errorResponse, notFoundResponse } from "../zodios-helpers";

export const productsApi = apiBuilder({
  method: "get",
  path: "/products/:productId", // path params are auto-detected and types are generated on the request object
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
    path: "/products",
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
    path: "/products",
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
    path: "/products/:productId", // auto detect :id and ask for it in apiClient get params
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
    path: "/products/:productId", // auto detect :id and ask for it in apiClient get params
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
