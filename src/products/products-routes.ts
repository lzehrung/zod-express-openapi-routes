import { z } from "zod";
import { apiBuilder, makeEndpoint, ZodiosEndpointError } from "@zodios/core";
import { numericString } from "../helpers";
import { product, productList } from "./api-schema";
import {ZodiosRequestHandler, zodiosRouter} from "@zodios/express";

const errorResponseSchema = z.object({
  code: z.string().optional(),
  message: z.string().optional(),
});

const baseApiError: ZodiosEndpointError = {
  status: "default", // default status code will be used if error is not 404
  schema: errorResponseSchema,
};

const notFoundError: ZodiosEndpointError = {
  status: 404,
  schema: errorResponseSchema,
};

export const getProductEndpoint = makeEndpoint({
  method: "get",
  path: "/products/:productId", // auto detect :id and ask for it in apiClient get params
  description: "Get a Product",
  response: product,
  parameters: [
    {
      type: "Path",
      name: "productId",
      schema: z.number(),
    },
  ],
  errors: [notFoundError, baseApiError],
});

export const createProductEndpoint = makeEndpoint({
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
  errors: [baseApiError],
});

const getProductListEndpoint = makeEndpoint({
  method: "get",
  path: "/products", // auto detect :id and ask for it in apiClient get params
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
  errors: [notFoundError, baseApiError],
});

const updateProductEndpoint = makeEndpoint({
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
  errors: [notFoundError, baseApiError],
});

const deleteProductEndpoint = makeEndpoint({
  method: "delete",
  path: "/products/:productId", // auto detect :id and ask for it in apiClient get params
  description: "Delete Product",
  status: 204,
  response: z.object({}),
  parameters: [
    {
      type: "Path",
      name: "productId",
      schema: numericString(),
    },
  ],
  errors: [notFoundError, baseApiError],
});

export const productApi = apiBuilder(getProductEndpoint)
  .addEndpoint(createProductEndpoint)
  .addEndpoint(getProductListEndpoint)
  .addEndpoint(updateProductEndpoint)
  .addEndpoint(deleteProductEndpoint)
  .build();

export const productsRouter = zodiosRouter(productApi, { transform: true });
