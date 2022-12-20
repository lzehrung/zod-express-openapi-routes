import { Router, RequestHandler } from "express";
import { z, ZodType, AnyZodObject } from "zod";
import {
  OpenAPIGenerator,
  OpenAPIRegistry,
  RouteConfig,
  extendZodWithOpenApi,
} from "@asteasolutions/zod-to-openapi";
extendZodWithOpenApi(z);
import { NextFunction, Response } from "express";
import {
  processRequest,
  TypedRequest,
  TypedRequestParams,
  TypedRequestQuery,
} from "zod-express-middleware";
import {
  ZodContentObject,
  ZodMediaTypeObject,
  ZodRequestBody,
} from "@asteasolutions/zod-to-openapi/dist/openapi-registry";
import { toZod } from "tozod";
import path from "path";
import {
  OpenAPIObjectConfig,
  OpenApiVersion,
} from "@asteasolutions/zod-to-openapi/dist/openapi-generator";

export * from "@asteasolutions/zod-to-openapi";

export type Method = "get" | "post" | "put" | "delete" | "patch";

/** Ensure string value is numeric. */
export const numericString = () => z.coerce.number();

/** Ensure url/path segment/param is numeric */
export const numericPathParam = (name?: string) =>
  numericString().openapi({
    param: {
      name,
      in: "path",
      required: true,
    },
  });

export function OpenApiRoutes(...routes: AnyTypedRoute[]): AnyTypedRoute[] {
  return routes;
}

/** Define JSON request/response body OpenAPI schema from Zod schema. */
export function jsonContent<T extends ZodType<unknown>>(
  schema: T
): TypedZodContent<T> {
  return {
    "application/json": {
      schema,
    },
  };
}

export type AllReqVal<
  TParams extends AnyZodObject = AnyZodObject,
  TBody extends AnyZodObject = AnyZodObject,
  TQuery extends AnyZodObject = AnyZodObject
> =
  | TypedRequest<TParams, TQuery, TBody>
  | TypedRequestParams<TParams>
  | TypedRequestQuery<TQuery>;

export type TypedHandler<TReqVal extends AllReqVal, TResp> = (
  req: TReqVal,
  res: Response<TResp>,
  next?: NextFunction
) => void;

export interface TypedMediaObject<TBody extends ZodType<unknown>>
  extends ZodMediaTypeObject {
  schema: TBody;
}

export interface TypedZodContent<TBody extends ZodType<unknown>>
  extends ZodContentObject {
  [mediaType: string]: TypedMediaObject<TBody>;
}

export interface TypedZodRequestBody<TBody extends ZodType<unknown>>
  extends ZodRequestBody {
  content: TypedZodContent<TBody>;
}

/** Define an OpenAPI route with added generics for inputs and outputs.  */
export interface TypedRouteConfig<
  TParams extends AnyZodObject | never = AnyZodObject,
  TBody extends AnyZodObject | never = AnyZodObject,
  TQuery extends AnyZodObject | never = AnyZodObject,
  TResponse extends any = undefined
> extends RouteConfig {
  description: string;
  request?: {
    params?: TParams;
    body?: TypedZodRequestBody<TBody>;
    query?: TQuery;
    headers?: ZodType<unknown>[];
  };
  responses: {
    [statusCode: string]: {
      description: string;
      content?: TypedZodContent<toZod<TResponse>>;
    };
  };
}

/** Define an OpenAPI route and the express route (middleware and handler) using generics to ensure types align. */
export interface TypedRoute<
  TParams extends AnyZodObject | never = AnyZodObject,
  TBody extends AnyZodObject | never = AnyZodObject,
  TQuery extends AnyZodObject | never = AnyZodObject,
  TResponse extends any = AnyZodObject
> extends TypedRouteConfig<TParams, TBody, TQuery, TResponse> {
  middleware?: RequestHandler[];
  handler: TypedHandler<TypedRequest<TParams, TQuery, TBody>, TResponse>;
}

export type ApiRouteParams<
  TParams extends AnyZodObject,
  TResponse
> = TypedRoute<TParams, never, never, TResponse>;

export type ApiRouteBody<TBody extends AnyZodObject, TResponse> = TypedRoute<
  never,
  TBody,
  never,
  TResponse
>;

export type ApiRouteQuery<TQuery extends AnyZodObject, TResponse> = TypedRoute<
  never,
  never,
  TQuery,
  TResponse
>;

export type ApiRouteResponseOnly<TResponse> = TypedRoute<
  never,
  never,
  never,
  TResponse
>;

type AnyTypedRoute<
  TParams extends AnyZodObject | never = any,
  TBody extends AnyZodObject | never = any,
  TQuery extends AnyZodObject | never = any,
  TResponse extends any = any
> =
  | TypedRoute<TParams, TBody, TQuery, TResponse>
  | ApiRouteParams<TParams, TResponse>
  | ApiRouteBody<TBody, TResponse>
  | ApiRouteQuery<TQuery, TResponse>
  | ApiRouteResponseOnly<TResponse>;

function registerRoute(
  routeConfig: AnyTypedRoute,
  registry: OpenAPIRegistry,
  router: Router
): void {
  let expressPath = routeConfig.path;
  const paramsShape = routeConfig.request?.params?.shape;
  if (paramsShape) {
    for (const prop of Object.getOwnPropertyNames(paramsShape)) {
      expressPath = expressPath.replace(`{${prop}}`, `:${prop}`);
    }
  }

  const expressRoute = router.route(expressPath);

  const bodyContent =
    Object.getOwnPropertyNames(routeConfig.request?.body?.content ?? {})[0] ??
    "application/json";
  const bodySchema = routeConfig.request?.body?.content[bodyContent]?.schema;

  const validationMiddleware = processRequest({
    params: routeConfig.request?.params,
    body: bodySchema,
    query: routeConfig.request?.query,
  });

  const routeMiddleware = (routeConfig.middleware ?? []).concat([
    validationMiddleware,
  ]);

  switch (routeConfig.method) {
    case "get":
      expressRoute.get(...routeMiddleware, routeConfig.handler);
      break;
    case "patch":
      expressRoute.patch(...routeMiddleware, routeConfig.handler);
      break;
    case "post":
      expressRoute.post(...routeMiddleware, routeConfig.handler);
      break;
    case "put":
      expressRoute.put(...routeMiddleware, routeConfig.handler);
      break;
    case "delete":
      expressRoute.delete(...routeMiddleware, routeConfig.handler);
      break;
    default:
      throw new Error(
        `Unsupported HTTP method ${routeConfig.method} for '${routeConfig.method}: ${routeConfig.path}' (description: '${routeConfig.description}')`
      );
  }
  // delete properties from extended typed route config that are not part of the OpenAPI spec
  const routeClone: Partial<TypedRoute> = {
    ...routeConfig,
    handler: undefined,
    middleware: undefined,
  };
  registry.registerPath(routeClone as RouteConfig);
  console.log(`registered ${routeClone.method}: ${expressPath}`);
}

export function openApiRoutes(
  config: {
    docsPath?: string;
    swaggerJsonPath?: string;
    routes: AnyTypedRoute[];
    version: OpenApiVersion;
  } & OpenAPIObjectConfig
): Router {
  const registry = new OpenAPIRegistry();

  const router = Router();
  router.use(config.docsPath ?? "/api-docs", (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="${config.info.title} v${config.info.version}" />
        <title>${config.info.title} v${config.info.version} Reference</title>
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

  for (const routeConfig of config.routes) {
    registerRoute(routeConfig, registry, router);
  }

  router.use(config.swaggerJsonPath ?? "/swagger.json", (req, res) => {
    const docGen = new OpenAPIGenerator(registry.definitions, config.version);
    const docs = docGen.generateDocument(config);
    res.json(docs);
  });
  return router;
}
