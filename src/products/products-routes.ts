import { z } from "zod";
import { product, productList } from "./api-schemas";
import { apiBuilder, errorResponse, notFoundResponse } from "../zodios-helpers";

export const singleProductRoute = "/api/products/:productId";
export const allProductsRoute = "/api/products";
export const singleProductImageRoute =
  "/api/products/:productId/images/:imageId";
export const allProductImagesRoute = "/api/products/:productId/images";

export const productsApi = apiBuilder({
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
  errors: [errorResponse],
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
    path: singleProductRoute, // path params are auto-detected and types are generated on the request object
    description: "Get Product",
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
  .addEndpoint({
    method: "post",
    path: allProductImagesRoute,
    description: "Upload Product Image",
    status: 201,
    response: z.object({
      id: z.number(),
      imageUrl: z.string(),
    }),
    requestFormat: "form-data",
    parameters: [
      {
        type: "Path",
        name: "productId",
        schema: z.number(),
      },
      {
        type: "Body",
        name: "image",
        schema: z.unknown(),
      },
    ],
    errors: [errorResponse],
  })
  .addEndpoint({
    method: "get",
    path: allProductImagesRoute,
    description: "Get Product Images",
    status: 200,
    response: z.array(z.string()),
    parameters: [
      {
        type: "Path",
        name: "productId",
        schema: z.number(),
      },
    ],
    errors: [errorResponse],
  })
  .addEndpoint({
    method: "get",
    path: singleProductImageRoute,
    description: "Get Product Image",
    status: 200,
    response: z.instanceof(Buffer),
    parameters: [
      {
        type: "Path",
        name: "productId",
        schema: z.number(),
      },
      {
        type: "Path",
        name: "imageId",
        schema: z.number(),
      },
    ],
    errors: [errorResponse, notFoundResponse],
  })
  .build();
