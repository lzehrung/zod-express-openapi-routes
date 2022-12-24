import { z } from "zod";
import { apiBuilder, ZodiosEndpointDefinition } from "@zodios/core";
import { zodiosApp, zodiosRouter } from "@zodios/express";
import { ZodiosEndpointError } from "@zodios/core/lib/zodios.types";
import { openApiBuilder } from "@zodios/openapi";
import { serve, setup } from "swagger-ui-express";
import {
  getListParam,
  idParam,
  product,
  productList,
} from "./products/api-schema";
import { ProductController2 } from "./products/product-controller-2";

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

export const productApi = apiBuilder({
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
    errors: [baseApiError],
  })
  .addEndpoint({
    method: "get",
    path: "/products", // auto detect :id and ask for it in apiClient get params
    description: "Get Products",
    response: productList,
    parameters: [
      {
        type: "Query",
        name: "name",
        schema: z.string(),
      },
      {
        type: "Query",
        name: "categories",
        schema: z.string(),
      },
    ],
    errors: [notFoundError, baseApiError],
  })
  .addEndpoint({
    method: "patch",
    path: "/products/:productId", // auto detect :id and ask for it in apiClient get params
    description: "Update Product",
    status: 204,
    response: z.object({}),
    parameters: [
      {
        type: "Body",
        name: "product",
        schema: product.partial(),
      },
    ],
    errors: [notFoundError, baseApiError],
  })
  .build();

const productsRouter = zodiosRouter(productApi);

const openApiDocs = openApiBuilder({
  title: "ACME Products API",
  version: "1.0.0",
})
  .addServer({ url: "" })
  .addPublicApi(productApi)
    .build();

const app = zodiosApp(productApi);

app.use("/", productsRouter);

app.use(`/swagger.json`, (_, res) => res.json(openApiDocs));
app.use("/api-docs", serve);
app.use("/api-docs", setup(undefined, { swaggerUrl: "/swagger.json" }));

app.get("/products/:productId", (req, res) =>
  ProductController2.getProduct(req as any, res as any)
);

app.post("/products", (req, res) =>
  ProductController2.createProduct(req as any, res as any)
);

export default app;
