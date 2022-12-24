import { AnyZodObject, z } from "zod";
import {
  OpenAPIGenerator,
  OpenAPIRegistry,
  RouteConfig,
  extendZodWithOpenApi,
} from "@asteasolutions/zod-to-openapi";
extendZodWithOpenApi(z);
export { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { apiBuilder, ZodiosEndpointDefinition } from "@zodios/core";
import { zodiosApp } from "@zodios/express";
import {  product } from "./products/api-schema";
import { jsonContent, Method } from "./open-api-helpers";
import {
  OpenAPIObjectConfig,
  OpenApiVersion,
} from "@asteasolutions/zod-to-openapi/dist/openapi-generator";
import { Router } from "express";
import { ProductController2 } from "./products/product-controller-2";

export const productApi = apiBuilder({
  method: "get",
  path: "/products/:productId", // auto detect :id and ask for it in apiClient get params
  alias: "getProduct", // optionnal alias to call this endpoint with it
  description: "Get a product",
  response: product,
  parameters: [
    {
      type: "Path",
      name: "productId",
      schema: z.number(),
    },
  ],
  errors: [
    {
      status: 404,
      schema: z.object({}),
    },
    {
      status: "default", // default status code will be used if error is not 404
      schema: z.object({
        code: z.string(),
        message: z.string(),
      }),
    },
  ],
}).build();

function openapiJson(endpoint: ZodiosEndpointDefinition): RouteConfig {
  const openapiPath = endpoint.path.replace(/:([^/]+)/g, "{$1}");
  const successStatus = Number(endpoint.status) || 200;
  const method = endpoint.method.toLowerCase() as Method;
  const errorResponses = Object.fromEntries(
    endpoint.errors?.reduce(
      (map, item) =>
        map.set(item.status === "default" ? 500 : Number(item.status), item),
      new Map<number, any>()
    ) ?? []
  );
  let params = z.object({});
  endpoint.parameters?.forEach((param) => {
    params = params.extend({
      [param.name]: param.schema,
    });
  });
  return {
    method: method,
    path: openapiPath,
    description: endpoint.description ?? `${method} - ${openapiPath}`,
    request: {
      params,
    },
    responses: {
      [successStatus]: {
        description:
          endpoint.responseDescription ?? `SUCCESS: ${method} - ${openapiPath}`,
        content: jsonContent(endpoint.response),
      },
      ...errorResponses,
    },
  };
}

export function zodOpenApiRoutes(options: {
  docsPath?: string;
  swaggerJsonPath?: string;
  routes: RouteConfig[];
  version: OpenApiVersion;
  apiConfig: OpenAPIObjectConfig;
}): Router {
  const registry = new OpenAPIRegistry();
  options.routes.forEach((r) => {
    console.log(r);
    registry.registerPath(r);
  });

  const router = Router();

  // docs page
  router.use(options.docsPath ?? "/api-docs", (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="${options.apiConfig.info.title} v${options.apiConfig.info.version}" />
        <title>${options.apiConfig.info.title} v${options.apiConfig.info.version} Reference</title>
        <link
          rel="stylesheet"
          href="https://unpkg.com/swagger-ui-dist@4.5.0/swagger-ui.css"
        />
      </head>
      <body>
        <div id="swagger-ui"></div>
        <script
          src="https://unpkg.com/swagger-ui-dist@4.5.0/swagger-ui-bundle.js"
          crossorigin
        ></script>
        <script>
          window.onload = () => {
            window.ui = SwaggerUIBundle({
              url: "swagger.json",
              dom_id: "#swagger-ui",
              presets: [SwaggerUIBundle.presets.apis]
            });
          };
        </script>
      </body>
    </html>
    `);
  });

  // schema json file
  router.use(options.swaggerJsonPath ?? "/swagger.json", (req, res) => {
    const docGen = new OpenAPIGenerator(registry.definitions, options.version);
    const docs = docGen.generateDocument(options.apiConfig);
    res.json(docs);
  });

  return router;
}

const app = zodiosApp(productApi);
app.use(
  zodOpenApiRoutes({
    apiConfig: {
      info: {
        title: "ACME Products API",
        version: "1.0.0",
      },
    },
    routes: [...productApi.map(openapiJson)],
    version: "3.0.0",
  })
);

app.get("/products/:productId", (req, res) => {
  ProductController2.getProduct(req, res as any);
});

export default app;
